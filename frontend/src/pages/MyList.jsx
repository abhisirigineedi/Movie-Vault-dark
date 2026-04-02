import { useState, useEffect } from "react";
import { Star, Eye, CheckCircle2, Film, Layout, Search, Grid, LayoutGrid } from "lucide-react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import ContentCard from "../components/ContentCard";
import ContentForm from "../components/ContentForm";
import { SkeletonCard, SkeletonStatCard } from "../components/Skeleton";
import SidebarToggle from "../components/SidebarToggle";

export default function MyList() {
    const { user } = useAuth();
    const [contentList, setContentList] = useState([]);
    const [activeStatus, setActiveStatus] = useState("All");
    const [loading, setLoading] = useState(true);
    const [editingContent, setEditingContent] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [gridCols, setGridCols] = useState(2);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchContent = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('user_id', user.id);
        
        if (!error && data) {
            setContentList(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user) fetchContent();
    }, [user]);

    const stats = [
        { name: "Wishlist", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        { name: "Watching", icon: Eye, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
        { name: "Completed", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    ];

    const getCount = (status) => {
        return contentList.filter(item => item.status === status).length;
    };

    const filteredContent = contentList.filter(item => {
      const matchesStatus = activeStatus === "All" || item.status === activeStatus;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    const gridClass = () => {
      switch (gridCols) {
        case 1: return "grid-cols-1";
        case 2: return "grid-cols-1 md:grid-cols-2";
        case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";
        case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
        case 5: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
        default: return "grid-cols-1 md:grid-cols-2";
      }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to remove this from your list?")) {
            const { error } = await supabase.from('content').delete().eq('id', id);
            if (!error) fetchContent();
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10 flex items-center gap-5">
                <SidebarToggle />
                <div>
                    <h1 className="text-4xl font-black text-white mb-0.5">My List</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs opacity-70">Personal Collection</p>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat) => (
                    <div 
                        key={stat.name}
                        onClick={() => setActiveStatus(stat.name)}
                        className={`
                            bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex items-center gap-6 
                            hover:bg-slate-800 transition-all group cursor-pointer active:scale-95 duration-300
                            ${activeStatus === stat.name ? 'border-indigo-500/50 bg-slate-800 shadow-xl shadow-indigo-500/5' : ''}
                        `}
                    >
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-4xl font-black text-white mb-1">{getCount(stat.name)}</p>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.name}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                {/* Status Tabs & Search */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* All Button - Standalone */}
                  <button
                    onClick={() => setActiveStatus("All")}
                    className={`
                      px-6 py-3 rounded-2xl text-sm font-black transition-all duration-300 uppercase tracking-widest border
                      ${activeStatus === "All"
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105'
                        : 'bg-slate-900/50 border-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800/50'}
                    `}
                  >
                    All
                  </button>

                  <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-900/50 border border-slate-800/50 rounded-2xl w-fit shadow-xl">
                      {stats.map((stat) => (
                          <button
                              key={stat.name}
                              onClick={() => setActiveStatus(stat.name)}
                              className={`
                                  flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 uppercase tracking-widest
                                  ${activeStatus === stat.name 
                                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 scale-105' 
                                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                              `}
                          >
                              <stat.icon size={18} />
                              <span>{stat.name}</span>
                          </button>
                      ))}
                  </div>

                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search in list..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-900/50 border border-slate-800/50 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all w-64 shadow-xl"
                    />
                  </div>
                </div>

                {/* Grid View Toggles */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-900/50 border border-slate-800/50 rounded-xl shadow-xl">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setGridCols(num)}
                      className={`
                        p-2.5 rounded-lg transition-all duration-300
                        ${gridCols === num 
                          ? 'bg-slate-800 text-cyan-400 shadow-lg shadow-cyan-500/10' 
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}
                      `}
                      title={`Show ${num} card${num > 1 ? 's' : ''} side by side`}
                    >
                      {num === 1 ? <Layout size={18} className="rotate-90" /> : 
                       num === 2 ? <Layout size={18} /> : 
                       num === 3 ? <Layout size={18} className="rotate-90" /> :
                       num === 4 ? <Grid size={18} /> :
                       <LayoutGrid size={18} />}
                    </button>
                  ))}
                </div>
            </div>

            {/* Content Display */}
            {loading ? (
                <div className="space-y-10">
                    <div className={`grid ${gridClass()} gap-6`}>
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            ) : filteredContent.length > 0 ? (
                <div className={`grid ${gridClass()} gap-6`}>
                    {filteredContent.map((item) => (
                        <ContentCard 
                            key={item.id} 
                            content={item} 
                            gridCols={gridCols} 
                            onEdit={(c) => { setEditingContent(c); setIsFormOpen(true); }}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem]">
                    <div className="p-6 bg-slate-800/50 rounded-3xl text-slate-600 mb-6">
                        <Film size={48} />
                    </div>
                    <h3 className="text-xl font-black text-slate-300 mb-2 uppercase tracking-wide">
                        No {activeStatus.toLowerCase()} content yet
                    </h3>
                    <p className="text-slate-500 font-bold max-w-xs">
                        Start tracking your favorite shows and movies to build your vault!
                    </p>
                </div>
            )}

            {isFormOpen && (
                <ContentForm 
                    content={editingContent}
                    onClose={() => { setIsFormOpen(false); setEditingContent(null); }}
                    onSaved={() => { setIsFormOpen(false); setEditingContent(null); fetchContent(); }}
                />
            )}
        </div>
    );
}
