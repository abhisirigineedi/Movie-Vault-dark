import { Film, Monitor, Gamepad2, Youtube, Layout } from "lucide-react";

export default function StatCards({ counts = {}, onStatClick }) {
  const stats = [
    { name: "Movies", key: "Movie", icon: Film, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { name: "Web Series", key: "Web Series", icon: Monitor, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { name: "Games", key: "Game", icon: Gamepad2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { name: "YouTube", key: "YouTube", icon: Youtube, color: "text-red-400", bg: "bg-red-500/10" },
    { name: "Film Series", key: "Film Series", icon: Layout, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
      {stats.map((stat) => (
        <div 
          key={stat.name}
          onClick={() => onStatClick && onStatClick(stat.key)}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-5 hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300 group cursor-pointer active:scale-95"
        >
          <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
            <stat.icon size={24} />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white mb-0.5">{counts[stat.key] || 0}</p>
            <p className="text-sm font-medium text-slate-500">{stat.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
