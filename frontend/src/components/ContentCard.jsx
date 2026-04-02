import { Star, Edit2, Trash2, Calendar, Layout, User } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "./Skeleton";

export default function ContentCard({ content, onEdit, onDelete, gridCols, readOnly = false }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const fillPercent = Math.min(Math.max(rating - i, 0), 1) * 100;
      return (
        <div key={i} className="relative w-4 h-4 text-slate-700">
          <Star className="w-4 h-4" />
          <div 
            className="absolute top-0 left-0 h-full overflow-hidden text-yellow-500"
            style={{ width: `${fillPercent}%` }}
          >
            <Star className="w-4 h-4 fill-current" />
          </div>
        </div>
      );
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Watching": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Wishlist": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getPosterSize = () => {
    switch (gridCols) {
      case 1: return "sm:w-64 h-72 sm:h-auto";
      case 2: return "sm:w-48 h-64 sm:h-auto";
      case 3: return "sm:w-32 h-44 sm:h-auto";
      case 4: return "sm:w-28 h-40 sm:h-auto";
      case 5: return "sm:w-24 h-32 sm:h-auto";
      default: return "sm:w-48 h-64 sm:h-auto";
    }
  };

  const getTitleSize = () => {
    switch (gridCols) {
      case 1: return "text-3xl";
      case 2: return "text-xl";
      case 3: return "text-sm";
      case 4: return "text-xs";
      case 5: return "text-[10px]";
      default: return "text-xl";
    }
  };

  return (
    <div className={`
      group relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden hover:bg-slate-800/50 hover:border-slate-700 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500
      flex flex-col sm:flex-row h-full
    `}>
      {/* Poster Image */}
      <div className={`relative w-full ${getPosterSize()} shrink-0 group/poster overflow-hidden bg-slate-950/20`}>
        {!isImageLoaded && <Skeleton className="absolute inset-0 z-10 rounded-none w-full h-full" />}
        <img
          src={content.image_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400"}
          alt={content.title}
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-contain transition-all duration-500 group-hover/poster:scale-105 ${!isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400";
            setIsImageLoaded(true);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60"></div>
      </div>
 
      {/* Content Details */}
      <div className={`flex-1 ${gridCols === 3 ? 'p-4' : 'p-6'} flex flex-col min-w-0`}>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className={`${getTitleSize()} font-black text-white truncate pr-2 group-hover:text-cyan-400 transition-colors`}>
              {content.title}
            </h3>
            <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${gridCols === 3 ? 'text-xs' : 'text-sm'} font-semibold text-slate-500 mt-1`}>
              {content.type !== "Game" && (
                <>
                  <span className="text-cyan-400/80">{content.genre}</span>
                  <span className="text-slate-700">•</span>
                </>
              )}
              <span>{content.year}</span>
              {content.type === "Web Series" && content.seasons && (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="text-indigo-400/80">{content.seasons} Seasons</span>
                </>
              )}
              {content.type === "Film Series" && content.seasons && (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="text-amber-400/80">{content.seasons} {content.seasons === 1 ? 'Movie' : 'Movies'}</span>
                </>
              )}
            </div>
          </div>
 
          <div className={`
            px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0
            ${getStatusColor(content.status)}
          `}>
            {content.status}
          </div>
        </div>
 
        {/* Rating */}
        <div className={`flex items-center gap-2 ${gridCols === 3 ? 'mb-2' : 'mb-4'}`}>
          <div className="flex items-center gap-0.5 scale-90 origin-left">
            {renderStars(content.rating)}
          </div>
          <span className="text-xs font-black text-slate-300 ml-1">{content.rating.toFixed(1)}</span>
        </div>
 
        {/* Description */}
        <p className={`
          text-slate-400 leading-relaxed mb-6 line-clamp-2
          ${gridCols === 1 ? 'text-base line-clamp-3' : 'text-xs'}
        `}>
          {content.description || "No description provided."}
        </p>

        {/* Action Buttons (Visible only if not readOnly) */}
        {!readOnly && (
          <div className="mt-auto flex items-center justify-between sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => onEdit(content)}
                  className="p-2.5 bg-slate-800 text-slate-400 hover:bg-cyan-500 hover:text-slate-950 rounded-xl transition-all shadow-lg"
                  title="Edit Content"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => onDelete(content.id)}
                  className="p-2.5 bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-lg"
                  title="Delete Content"
                >
                  <Trash2 size={18} />
                </button>
             </div>

             <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
               Modified {new Date(content.created_at).toLocaleDateString()}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
