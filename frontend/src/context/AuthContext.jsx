import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper for timing out slow requests
  const withTimeout = (promise, timeoutMs = 15000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timed out. Check your Supabase keys/network.")), timeoutMs)
      )
    ]);
  };

  const fetchProfile = async (sessionUser) => {
    const { data, error } = await withTimeout(supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', sessionUser.id)
      .single());
    
    let username = data?.username;
    let avatar_url = data?.avatar_url || null;

    // SELF-HEALING: If no database profile exists, but we have a username in metadata
    if (!data && sessionUser.user_metadata?.username) {
      username = sessionUser.user_metadata.username;
      
      // Non-blocking attempt to create the missing profile row automatically
      supabase.from('profiles').insert({
        id: sessionUser.id,
        username: username,
        email: sessionUser.email
      }).then(({ error: insertError }) => {
        if (insertError) {
          // It's possible another tab already created it, so we just log and move on
          console.warn("Self-healing profile insert skipped/failed:", insertError.message);
        }
      });
    }

    return {
      id: sessionUser.id,
      email: sessionUser.email,
      username: username || sessionUser.user_metadata?.username || sessionUser.email.split('@')[0],
      avatar_url: avatar_url,
      createdAt: sessionUser.created_at,
    };
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const profile = await fetchProfile(session.user);
      setUser(profile);
    }
  };

  useEffect(() => {
    let timeoutId;
    let isMounted = true;

    const initializeAuth = async () => {
      // 1. Safety Timeout (Force turn off spinner after 4 seconds)
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn("Auth initialization timed out. Safely forcing loading to false.");
          setLoading(false);
        }
      }, 4000);

      try {
        // 2. Explicitly get the current session immediately
        const { data: { session }, error } = await withTimeout(supabase.auth.getSession());
        
        if (error) throw error;

        if (session && isMounted) {
          // Optimistically show metadata before DB fetch
          if (session.user.user_metadata?.username) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              username: session.user.user_metadata.username,
              avatar_url: null,
              createdAt: session.user.created_at,
            });
          }
          
          // Fetch full database profile
          const profile = await fetchProfile(session.user);
          if (isMounted) setUser(profile);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        // 3. Clear timeout and stop loading
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 4. Set up listener for subsequent changes (Logins/Logouts)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // We only care about events if we aren't already initialized or if auth changed
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        try {
          if (session && isMounted) {
            const profile = await fetchProfile(session.user);
            if (isMounted) setUser(profile);
          } else if (isMounted) {
            setUser(null);
          }
        } catch (err) {
          console.error("Auth state change error:", err);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (identifier, password) => {
    console.log("🔑 [LOG] Login attempt started for:", identifier);
    let email = identifier.trim();

    try {
      // 1. Resolve Username to Email if needed
      const isEmail = email.includes('@');
      if (!isEmail) {
        console.log("🔍 [LOG] Resolving username to email...");
        const { data, error } = await withTimeout(supabase
          .from('profiles')
          .select('email')
          .eq('username', email)
          .maybeSingle());
        
        if (error) {
          console.error("❌ [LOG] Error resolving username:", error);
          throw error;
        }
        if (!data) {
          throw new Error("Account not found for this username");
        }
        email = data.email;
        console.log("✅ [LOG] Username resolved to:", email);
      }

      // 2. Authenticate
      console.log("⚡ [LOG] Sending signInWithPassword request...");
      const { data: { user: authUser }, error: signInError } = await withTimeout(supabase.auth.signInWithPassword({ 
        email, 
        password 
      }));
      
      if (signInError) {
        console.error("❌ [LOG] signInWithPassword error:", signInError);
        throw signInError;
      }
      console.log("✅ [LOG] Authentication successful!");

      // 3. Immediately fetch profile
      if (authUser) {
        console.log("👤 [LOG] Fetching profile for user:", authUser.id);
        const profile = await fetchProfile(authUser);
        setUser(profile);
        console.log("🎉 [LOG] Login process completed!");
      }
    } catch (err) {
      console.error("⛔ [LOG] Fatal login error caught:", err);
      throw err;
    }
  };

  const register = async (email, username, password) => {
    // 1. Sign up user
    // The handle_new_user() trigger in Supabase will automatically create the profile
    const { data: { user: authUser }, error: signupError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { username } // Passed to raw_user_meta_data for the trigger
      }
    });
    
    if (signupError) throw signupError;
    
    // Profiles are now handled by the 'on_auth_user_created' database trigger!
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
