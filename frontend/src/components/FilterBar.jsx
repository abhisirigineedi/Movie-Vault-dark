import { Search, ChevronDown, Monitor, Film, Gamepad2, Youtube, Layout, Grid2X2, Grid3X3, StretchHorizontal, Grid, LayoutGrid } from "lucide-react";

export default function FilterBar({ 
  activeType, 
  setActiveType, 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy,
  gridCols,
  setGridCols 
}) {
  const types = [
    { id: "All", icon: null },
    { id: "Movie", icon: Film },
    { id: "Web Series", icon: Monitor },
    { id: "Game", icon: Gamepad2 },
    { id: "YouTube", icon: Youtube },
    { id: "Film Series", icon: Layout },
  ];

  const gridOptions = [
    { id: 1, icon: StretchHorizontal, label: "Full" },
    { id: 2, icon: Grid2X2, label: "Double" },
    { id: 3, icon: Grid3X3, label: "Triple" },
    { id: 4, icon: Grid, label: "Quad" },
    { id: 5, icon: LayoutGrid, label: "Penta" },
  ];

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl w-fit">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
              ${activeType === type.id 
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 scale-105' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
            `}
          >
            {type.icon && <type.icon size={16} />}
            <span>
              {type.id === "All" || type.id === "Web Series" || type.id === "YouTube" || type.id === "Film Series" 
                ? type.id 
                : type.id + 's'}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
        {/* Search */}
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-slate-500 font-medium"
          />
        </div>

        {/* Sort & Grid */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Grid Selector */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shrink-0">
             {gridOptions.map((opt) => (
               <button
                 key={opt.id}
                 onClick={() => setGridCols(opt.id)}
                 className={`
                   p-2.5 rounded-xl transition-all
                   ${gridCols === opt.id ? 'bg-slate-800 text-cyan-400 shadow-inner' : 'text-slate-500 hover:text-slate-300'}
                 `}
                 title={`Show ${opt.id} side by side`}
               >
                 <opt.icon size={20} />
               </button>
             ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-44 group">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="rating">Top Rated</option>
              <option value="year">Year</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}
