import { useState, useEffect } from "react";
import { X, Upload, Calendar, Star, Film, Monitor, Gamepad2, Youtube, Layout, ChevronDown } from "lucide-react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";

export default function ContentForm({ content, initialType = "Movie", onClose, onSaved }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: "",
        type: content ? content.type : initialType,
        genre: "",
        year: new Date().getFullYear(),
        rating: 5.0,
        status: "Wishlist",
        description: "",
        seasons: "",
        image_url: ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(content?.image_url || "");
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (content) {
            setFormData({
                title: content.title,
                type: content.type,
                genre: content.genre,
                year: content.year,
                rating: content.rating,
                status: content.status,
                description: content.description || "",
                seasons: content.seasons || "",
                image_url: content.image_url || ""
            });
            setPreviewUrl(content.image_url || "");
        } else {
            setFormData(prev => ({
                ...prev,
                type: initialType
            }));
            setPreviewUrl("");
        }
    }, [content, initialType]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.image_url;
        setUploading(true);
        try {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            // Create bucket if not exists (Best to do manually in dashboard)
            const { data, error } = await supabase.storage
                .from('content-images')
                .upload(filePath, imageFile);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('content-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (err) {
            console.error("DEBUG: Upload error details:", err);
            setError(`Upload failed: ${err.message || 'Unknown error'}. Make sure the 'content-images' bucket is Public in Supabase.`);
            return null; // Return null to indicate failure
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const finalImageUrl = await uploadImage();
            
            // If upload was attempted but failed, stop submission
            if (imageFile && !finalImageUrl) {
                setSubmitting(false);
                return;
            }

            const payload = {
                ...formData,
                image_url: finalImageUrl || formData.image_url,
                user_id: user.id,
                seasons: (formData.type === "Web Series" || formData.type === "Film Series") ? (formData.seasons ? parseInt(formData.seasons) : null) : null
            };

            if (content) {
                const { error } = await supabase
                    .from('content')
                    .update(payload)
                    .eq('id', content.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('content')
                    .insert([payload]);
                if (error) throw error;
            }
            onSaved();
        } catch (err) {
            console.error(err);
            setError(err.message || "An error occurred connecting to Supabase");
        } finally {
            setSubmitting(false);
        }
    };

    const categories = [
        { id: "Movie", icon: Film },
        { id: "Web Series", icon: Monitor },
        { id: "Game", icon: Gamepad2 },
        { id: "YouTube", icon: Youtube },
        { id: "Film Series", icon: Layout },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>
                
                <div className="p-8 overflow-y-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-white">
                                {content ? "Edit Content" : "Add Content"}
                            </h2>
                            <p className="text-slate-500 text-sm font-bold tracking-wide uppercase mt-1">Fill in the details below</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Type Selection */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: cat.id })}
                                    className={`
                                        flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300
                                        ${formData.type === cat.id 
                                            ? 'bg-cyan-500 border-cyan-500 text-slate-950 scale-105 shadow-xl shadow-cyan-500/20' 
                                            : 'bg-slate-800 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'}
                                    `}
                                >
                                    <cat.icon size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">
                                        {cat.id === "Movie" ? "Movies" : cat.id === "Game" ? "Games" : cat.id}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Side: Basic Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => {
                                            const val = e.target.value;
                                            const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
                                            setFormData({ ...formData, title: capitalized });
                                        }}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-bold placeholder-slate-600"
                                        placeholder="e.g. Inception"
                                    />
                                </div>

                                {formData.type !== "Game" && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Genre</label>
                                            <div className="relative group">
                                                <select
                                                    required
                                                    value={formData.genre}
                                                    onChange={e => setFormData({ ...formData, genre: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl pl-5 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-bold appearance-none cursor-pointer group-hover:border-slate-600"
                                                >
                                                    <option value="" disabled>Select Genre</option>
                                                    {["Action", "Comedy", "Drama", "Thriller", "Sci-Fi", "Horror", "Romance", "Anime", "Documentary"].map(g => (
                                                        <option key={g} value={g}>{g}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500 pointer-events-none group-hover:text-cyan-400 transition-colors" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Year</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.year}
                                                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.type === "Game" && (
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Release Year</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-bold"
                                        />
                                    </div>
                                )}

                                {formData.type === "Web Series" && (
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Number of Seasons</label>
                                        <input
                                            type="number"
                                            value={formData.seasons}
                                            onChange={e => setFormData({ ...formData, seasons: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-bold"
                                            placeholder="Enter seasons (empty if unknown)"
                                        />
                                    </div>
                                )}

                                {formData.type === "Film Series" && (
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Number of Movies</label>
                                        <input
                                            type="number"
                                            value={formData.seasons}
                                            onChange={e => setFormData({ ...formData, seasons: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-bold"
                                            placeholder="Enter movies (empty if unknown)"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Media & Status */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Status</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { name: "Wishlist", color: "text-amber-400", border: "border-amber-500/50", bg: "bg-amber-500/10" },
                                            { name: "Watching", color: "text-cyan-400", border: "border-cyan-500/50", bg: "bg-cyan-500/10" },
                                            { name: "Completed", color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-500/10" }
                                        ].map((s) => (
                                            <button
                                                key={s.name}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, status: s.name })}
                                                className={`
                                                    py-3 rounded-2xl text-[10px] font-black uppercase tracking-tighter border transition-all
                                                    ${formData.status === s.name 
                                                        ? `${s.bg} ${s.border} ${s.color} shadow-lg shadow-${s.color.split('-')[1]}-500/10` 
                                                        : 'bg-slate-800 border-slate-800 text-slate-500 hover:border-slate-700'}
                                                `}
                                            >
                                                {s.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-1">Poster Image</label>
                                    <div className="relative group cursor-pointer">
                                        <input 
                                            type="file" 
                                            id="image-upload"
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <label 
                                            htmlFor="image-upload"
                                            className={`
                                                flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-[2.5rem] transition-all duration-500 overflow-hidden group
                                                ${previewUrl ? 'border-transparent' : 'border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/10'}
                                            `}
                                        >
                                            {previewUrl ? (
                                                <div className="relative w-full h-full group/preview">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-[200px] object-cover transition-transform duration-700 group-hover/preview:scale-105" />
                                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <div className="bg-white/10 p-4 rounded-3xl border border-white/20 text-white font-black uppercase tracking-widest text-xs">
                                                            Change Image
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className={`p-6 bg-slate-800/50 rounded-3xl text-slate-500 mb-6 group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-500 ${uploading ? 'animate-pulse' : ''}`}>
                                                        <Upload size={40} />
                                                    </div>
                                                    <span className="text-white font-black uppercase tracking-widest mb-2">Upload Image</span>
                                                    <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">JPG, PNG up to 2MB</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Rating (0-5)</label>
                            <div className="flex items-center gap-6 p-4 bg-slate-800 rounded-2xl border border-slate-700">
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={formData.rating}
                                    onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                    className="flex-1 accent-cyan-400 h-2 rounded-lg bg-slate-950 appearance-none cursor-pointer"
                                />
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-xl border border-slate-700">
                                    <Star className="text-yellow-500 fill-current" size={16} />
                                    <span className="text-lg font-black text-white w-8 text-center">
                                        {formData.rating.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium placeholder-slate-600 min-h-[100px] resize-none"
                                placeholder="What did you think of it?"
                            />
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-4 rounded-2xl font-black text-slate-400 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || uploading}
                                className="flex-[2] bg-cyan-500 text-slate-950 px-6 py-4 rounded-2xl font-black hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                            >
                                {submitting || uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950"></div>
                                        <span>{uploading ? "Uploading..." : "Saving..."}</span>
                                    </>
                                ) : (
                                    "Save Content"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
