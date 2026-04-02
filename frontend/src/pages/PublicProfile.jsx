import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Eye, CheckCircle2, Film, ArrowLeft, User, Search, Layout, Grid, LayoutGrid } from "lucide-react";
import { supabase } from "../supabase";
import ContentCard from "../components/ContentCard";
import { SkeletonCard, SkeletonStatCard } from "../components/Skeleton";

export default function PublicProfile() {
    const { username } = useParams();
    const [targetUser, setTargetUser] = useState(null);
    const [contentList, setContentList] = useState([]);
    const [activeStatus, setActiveStatus] = useState("All");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [gridCols, setGridCols] = useState(2);

    const fetchProfileAndContent = async () => {
        setLoading(true);
        // 1. Fetch profile by username
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('username', username)
            .single();
        
        if (profileError || !profileData) {
            setTargetUser(null);
            setLoading(false);
            return;
        }

        setTargetUser(profileData);

        // 2. Fetch their content
        const { data: contentData, error: contentError } = await supabase
            .from('content')
            .select('*')
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false });
        
        if (!contentError && contentData) {
            setContentList(contentData);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProfileAndContent();
    }, [username]);

    const stats = [
        { name: "Wishlist", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
        { name: "Watching", icon: Eye, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        { name: "Completed", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
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

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <SkeletonStatCard key={i} />)}
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (!targetUser) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center">
                <h2 className="text-3xl font-black text-white mb-4">User Not Found</h2>
                <p className="text-slate-500 mb-8 font-medium">The vault you're looking for doesn't exist or is no longer public.</p>
                <Link to="/explore" className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-400 transition-all uppercase tracking-widest text-xs">
                    <ArrowLeft size={16} /> Back to Explore
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-2xl overflow-hidden">
                    {targetUser.avatar_url ? (
                        <img src={targetUser.avatar_url} alt={targetUser.username} className="w-full h-full object-cover" />
                    ) : (
                        <User size={40} />
                    )}
                </div>
                    <div>
                        <Link to="/explore" className="text-xs font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest flex items-center gap-1 mb-2">
                           <ArrowLeft size={12} /> Back to Explore
                        </Link>
                        <h1 className="text-4xl font-black text-white tracking-tight uppercase">{targetUser.username}'s Vault</h1>
                        <p className="text-slate-500 font-bold">Public tracking list and reviews</p>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat) => (
                    <div 
                        key={stat.name}
                        className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex items-center gap-6"
                    >
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
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
                        ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20 scale-105'
                        : 'bg-slate-900/50 border-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800/50'}
                    `}
                  >
                    All
                  </button>

                  <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-2xl w-fit shadow-xl">
                      {stats.map((stat) => (
                          <button
                              key={stat.name}
                              onClick={() => setActiveStatus(stat.name)}
                              className={`
                                  flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 uppercase tracking-widest
                                  ${activeStatus === stat.name 
                                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105' 
                                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                              `}
                          >
                              <stat.icon size={18} />
                              <span>{stat.name}</span>
                          </button>
                      ))}
                  </div>

                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="text"
                      placeholder={`Search in ${targetUser.username}'s list...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all w-64 shadow-xl"
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
                          ? 'bg-slate-800 text-indigo-400 shadow-lg shadow-indigo-500/10' 
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

            {/* Content List */}
            {filteredContent.length > 0 ? (
                <div className={`grid ${gridClass()} gap-6`}>
                    {filteredContent.map((item) => (
                        <ContentCard 
                            key={item.id} 
                            content={item} 
                            gridCols={gridCols} 
                            readOnly={true} 
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem]">
                    <div className="p-6 bg-slate-800/50 rounded-3xl text-slate-600 mb-6 font-medium">
                        <Film size={48} />
                    </div>
                    <h3 className="text-xl font-black text-slate-300 mb-2 uppercase tracking-wide">Nothing in {activeStatus.toLowerCase()}</h3>
                    <p className="text-slate-500 font-bold max-w-xs">{targetUser.username} hasn't added anything here yet.</p>
                </div>
            )}
        </div>
    );
}
