-- ==========================================
-- 1. CLEAN UP (Drop existing objects)
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_content_updated_at ON public.content;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.moddatetime();
DROP TABLE IF EXISTS public.content CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Cleanup existing Storage policies for a fresh start
DROP POLICY IF EXISTS "Give public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual deletes" ON storage.objects;
DROP POLICY IF EXISTS "Give public read access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar deletes" ON storage.objects;

-- ==========================================
-- 2. UTILITY FUNCTIONS
-- ==========================================

CREATE OR REPLACE FUNCTION public.moddatetime()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 3. CREATE TABLES
-- ==========================================

-- Profiles Table (includes avatar_url)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Table
CREATE TABLE public.content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Movie', 'Web Series', 'Game', 'YouTube', 'Film Series')),
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  year INTEGER NOT NULL,
  rating DECIMAL(2,1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  status TEXT NOT NULL CHECK (status IN ('Wishlist', 'Watching', 'Completed')),
  description TEXT,
  seasons INTEGER,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. ENABLE SECURITY (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Content Policies
CREATE POLICY "Content is publicly viewable" ON public.content FOR SELECT USING (true);
CREATE POLICY "Users can insert their own content" ON public.content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own content" ON public.content FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content" ON public.content FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 5. STORAGE BUCKET & POLICIES
-- ==========================================

-- --- Content Images Bucket Policies ---
CREATE POLICY "Give public read access" ON storage.objects FOR SELECT 
USING (bucket_id = 'content-images');

CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'content-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow individual updates" ON storage.objects FOR UPDATE 
USING (bucket_id = 'content-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow individual deletes" ON storage.objects FOR DELETE 
USING (bucket_id = 'content-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- --- Avatars Bucket Policies ---
CREATE POLICY "Give public read access to avatars" ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Allow avatar uploads" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow avatar updates" ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow avatar deletes" ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ==========================================
-- 6. AUTOMATION & TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, avatar_url)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    new.email,
    NULL
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER handle_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.moddatetime();

-- ==========================================
-- 7. INITIAL SYNC (For existing users)
-- ==========================================
INSERT INTO public.profiles (id, username, email, avatar_url)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)), 
  email,
  NULL
FROM auth.users
ON CONFLICT (id) DO NOTHING;
