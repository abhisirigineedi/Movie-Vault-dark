import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import DashboardHeader from "../components/DashboardHeader";
import StatCards from "../components/StatCards";
import FilterBar from "../components/FilterBar";
import ContentCard from "../components/ContentCard";
import ContentForm from "../components/ContentForm";
import { SkeletonCard, SkeletonStatCard } from "../components/Skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  
  // Filter & Sort State
  const [activeType, setActiveType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [gridCols, setGridCols] = useState(2); // Default to 2 cards as requested

  // Reset filters when the user clicks a nav link leading here (or the logo)
  useEffect(() => {
    setActiveType("All");
    setSearchTerm("");
  }, [location.key]);

  const fetchContent = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('content')
        .select('*')
        .eq('user_id', user.id);

      if (sortBy === "latest") {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === "oldest") {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === "rating") {
        query = query.order('rating', { ascending: false });
      } else if (sortBy === "year") {
        query = query.order('year', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setContentList(data || []);
    } catch (err) {
      console.error("Failed to fetch content", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [user, sortBy]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      try {
        const { error } = await supabase
          .from('content')
          .delete()
          .eq('id', id);
        if (error) throw error;
        setContentList(contentList.filter(c => c.id !== id));
      } catch (err) {
        console.error("Failed to delete content", err);
      }
    }
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setIsFormOpen(true);
  };

  const handleSaved = () => {
    setIsFormOpen(false);
    setEditingContent(null);
    fetchContent();
  };

  // Filtering Logic
  const filteredContent = contentList.filter(c => {
    const matchesType = activeType === "All" || c.type === activeType;
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.genre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate Counts for StatCards
  const counts = contentList.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  const gridClass = () => {
    switch(gridCols) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case 5: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
      default: return "grid-cols-1 md:grid-cols-2";
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeader onAddClick={() => { setEditingContent(null); setIsFormOpen(true); }} />
      
      <StatCards counts={counts} onStatClick={setActiveType} />

      <FilterBar 
        activeType={activeType}
        setActiveType={setActiveType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        gridCols={gridCols}
        setGridCols={setGridCols}
      />

      {loading ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <SkeletonStatCard key={i} />)}
          </div>
          <div className={`grid ${gridClass()} gap-6 xl:gap-8`}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-32 bg-slate-900 border border-slate-800 rounded-3xl border-dashed">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-slate-800 rounded-full text-slate-700">
              <PlusCircle size={48} className="stroke-[1]" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mb-2">The vault is empty</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium">
             Start tracking your entertainment by adding your first movie, series, or game.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="mt-8 text-cyan-400 hover:text-cyan-300 font-black uppercase tracking-widest text-sm transition-colors"
          >
            + Add First Item
          </button>
        </div>
      ) : (
        <div className={`grid ${gridClass()} gap-6 xl:gap-8`}>
          {filteredContent.map(content => (
             <ContentCard 
              key={content.id} 
              content={content} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              gridCols={gridCols}
             />
          ))}
        </div>
      )}

      {isFormOpen && (
        <ContentForm 
          content={editingContent} 
          initialType={activeType !== "All" ? activeType : "Movie"}
          onClose={() => setIsFormOpen(false)} 
          onSaved={handleSaved} 
        />
      )}
    </div>
  );
}

// Simple fallback icon for empty state
function PlusCircle({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
