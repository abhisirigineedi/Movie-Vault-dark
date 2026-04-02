import { Star, Edit2, Trash2 } from "lucide-react";

export default function MovieCard({ movie, onEdit, onDelete }) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const fillPercent = Math.min(Math.max(rating - i, 0), 1) * 100;
      return (
        <div key={i} className="relative w-5 h-5 text-slate-400">
          <Star className="w-5 h-5" />
          <div 
            className="absolute top-0 left-0 h-full overflow-hidden text-yellow-500"
            style={{ width: `${fillPercent}%` }}
          >
            <Star className="w-5 h-5 fill-current" />
          </div>
        </div>
      );
    });
  };

  return (
    <div className="group relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(movie)}
          className="p-2 bg-slate-700/80 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
          title="Edit Movie"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(movie.id)}
          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
          title="Delete Movie"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1 pr-16">{movie.name}</h3>
        <p className="text-sm font-medium text-slate-400">
          {movie.year} • <span className="text-indigo-400">{movie.genre}</span>
        </p>
      </div>

      <div className="flex items-center gap-1 mt-6">
        {renderStars(movie.rating)}
        <span className="ml-2 text-sm font-bold text-slate-300">{movie.rating.toFixed(1)}</span>
      </div>
    </div>
  );
}
