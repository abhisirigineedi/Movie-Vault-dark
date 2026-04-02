import { useState, useEffect } from "react";
import { Search, User, ArrowRight, Compass } from "lucide-react";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";
import SidebarToggle from "../components/SidebarToggle";

export default function Explore() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim().length > 0) {
                searchUsers();
            } else {
                setUsers([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const searchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('username, id')
            .ilike('username', `%${searchTerm}%`)
            .limit(10);
        
        if (!error && data) {
            setUsers(data);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 relative">
            <div className="absolute top-8 left-4">
                <SidebarToggle />
            </div>
            
            <header className="text-center mb-16">
                <div className="inline-flex p-4 bg-indigo-500/10 text-indigo-400 rounded-3xl mb-6">
                    <Compass size={40} />
                </div>
                <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Explore Vaults</h1>
                <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">
                    Search for a username to discover their unique content collection and tracking journey.
                </p>
            </header>

            {/* Search Input */}
            <div className="relative group max-w-2xl mx-auto mb-16">
                <div className="absolute inset-0 bg-cyan-500/20 blur-2xl group-focus-within:bg-cyan-500/30 transition-all"></div>
                <div className="relative flex items-center">
                    <Search className="absolute left-6 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Search by username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/80 border-2 border-slate-800 text-white rounded-[2rem] pl-16 pr-6 py-6 focus:outline-none focus:border-cyan-500/50 transition-all font-black text-xl placeholder-slate-600 shadow-2xl backdrop-blur-xl"
                    />
                </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                    </div>
                ) : users.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {users.map((u) => (
                            <Link
                                key={u.id}
                                to={`/user/${u.username}`}
                                className="group flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:bg-slate-800 transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                            {u.username}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Public Vault</p>
                                    </div>
                                </div>
                                <ArrowRight className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
                            </Link>
                        ))}
                    </div>
                ) : searchTerm.trim().length > 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-500 font-bold">No users found with that name.</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
