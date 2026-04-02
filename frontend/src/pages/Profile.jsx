import { useAuth } from "../context/AuthContext";
import { User, Calendar, Mail, Camera, Loader2, Trash2, AlertTriangle, X } from "lucide-react";
import SidebarToggle from "../components/SidebarToggle";
import { useState, useRef } from "react";
import { supabase } from "../supabase";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  if (!user) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      // 1. Upload file to Supabase Storage (avatars bucket)
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: err } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (err) throw err;

      // 2. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Save the URL to the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Refresh auth context so user.avatar_url updates everywhere
      await refreshUser();

    } catch (err) {
      console.error("Avatar upload failed:", err);
      // Use the actual error message if available to help debugging
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      e.target.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    setUploading(true);
    setShowDeleteConfirm(false);
    
    try {
      // 1. Extract path from URL (Supabase storage URL structure)
      // Example: .../storage/v1/object/public/avatars/USER_ID/avatar.png
      if (user.avatar_url) {
        const urlParts = user.avatar_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${user.id}/${fileName}`;

        // 2. Remove from Storage
        const { error: storageError } = await supabase.storage
          .from('avatars')
          .remove([filePath]);

        if (storageError) throw storageError;
      }

      // 3. Update Database
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // 4. Refresh User
      await refreshUser();
    } catch (err) {
      console.error("Avatar deletion failed:", err);
      setUploadError("Deletion failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-[90vh] px-4 py-8 flex flex-col items-center justify-start">

      {/* Page Header with Sidebar Toggle */}
      <div className="w-full flex items-center gap-4 mb-8">
        <SidebarToggle />
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Profile</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Your Identity</p>
        </div>
      </div>

      {/* Card */}
      <div className="mt-8 w-full max-w-[420px] bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col items-center group transition-all duration-500 hover:scale-105 hover:border-white/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">

        {/* Top Color Bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-600 via-cyan-400 to-indigo-600 rounded-t-[3rem]"></div>
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-cyan-400/15 to-transparent"></div>

        {/* Avatar Section */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-cyan-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>

          {/* Clickable avatar with hover upload overlay */}
          <div
            className="relative cursor-pointer"
            onMouseEnter={() => setAvatarHovered(true)}
            onMouseLeave={() => setAvatarHovered(false)}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <div className="relative p-[1px] bg-gradient-to-tr from-indigo-500/50 to-cyan-400/50 rounded-full">
              <div className="w-28 h-28 bg-slate-950 rounded-full flex items-center justify-center shadow-2xl overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
            </div>

            {/* Hover / uploading overlay */}
            <div className={`absolute inset-0 rounded-full flex flex-col items-center justify-center gap-1 bg-black/60 backdrop-blur-sm transition-all duration-300 ${(avatarHovered || uploading) ? 'opacity-100' : 'opacity-0'}`}>
              {uploading ? (
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div 
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="flex flex-col items-center hover:scale-110 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-white" />
                    <span className="text-white text-[8px] font-black uppercase tracking-widest">Update</span>
                  </div>
                  
                  {user.avatar_url && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                      className="flex flex-col items-center hover:scale-110 transition-transform active:scale-95 cursor-pointer text-rose-400"
                    >
                      <Trash2 className="w-6 h-6" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Remove</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-slate-900 rounded-full shadow-lg shadow-emerald-500/20"></div>
        </div>

        {/* Upload error */}
        {uploadError && (
          <p className="text-rose-400 text-xs font-bold mb-4 text-center">{uploadError}</p>
        )}

        <div className="w-full text-center">
          <h1 className="text-4xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-2 tracking-tight">
            {user.username}
          </h1>
          <p className="text-indigo-400/80 text-[11px] font-black uppercase tracking-[0.4em] mb-10">Verified Member</p>

          <div className="space-y-6 text-left">
            <div className="relative group/item px-2">
              <div className="absolute -left-0 top-0 bottom-0 w-[2px] bg-indigo-500/0 group-hover/item:bg-indigo-500 transition-all rounded-full"></div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 px-1">Identity</label>
              <div className="text-base font-bold text-slate-300 flex items-center gap-2 group-hover/item:text-white transition-colors">
                <span className="text-indigo-500 font-extrabold text-lg">@</span>{user.username}
              </div>
            </div>

            <div className="relative group/item px-2">
              <div className="absolute -left-0 top-0 bottom-0 w-[2px] bg-cyan-500/0 group-hover/item:bg-cyan-500 transition-all rounded-full"></div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 px-1 flex items-center gap-2">
                <Mail size={12} className="text-cyan-500" /> Correspondence
              </label>
              <div className="text-[15px] font-mono text-cyan-400/80 truncate group-hover/item:text-cyan-300 transition-colors" title={user.email}>
                {user.email}
              </div>
            </div>

            <div className="pt-4 px-2">
              <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex items-center justify-between group-hover:bg-indigo-500/10 transition-colors">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Joined Vault</span>
                  <span className="text-sm font-bold text-slate-300">
                    {new Date(user.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <Calendar size={20} className="text-indigo-400/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
          
          {/* Modal Card */}
          <div className="relative w-full max-w-[360px] bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 to-rose-400"></div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              
              <h3 className="text-xl font-black text-white mb-2">Remove Photo?</h3>
              <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                This will delete your current avatar from storage. You can upload a new one at any time.
              </p>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-4 px-6 rounded-2xl bg-slate-800 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-750 hover:text-white transition-all active:scale-95"
                >
                  Keep it
                </button>
                <button
                  onClick={handleDeleteAvatar}
                  disabled={uploading}
                  className="py-4 px-6 rounded-2xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {uploading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
