import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  List, 
  Compass, 
  Menu, 
  ChevronDown, 
  LogOut, 
  User,
  Film,
  Mail
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";

export default function Sidebar() {
  const { isSidebarOpen, setIsSidebarOpen } = useUI();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/dashboard", icon: Home },
    { name: "My List", path: "/my-list", icon: List },
    { name: "Explore", path: "/explore", icon: Compass },
  ];

  if (!user) return null;

  return (
    <>
      {/* Mobile Toggle */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg border border-slate-700 shadow-xl"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-40 transition-all duration-500 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full px-4 py-6">
          {/* Logo Section */}
          <Link 
            to="/dashboard"
            className="flex items-center gap-3 mb-10 px-2 lg:mt-0 mt-8 group/logo cursor-pointer"
          >
            <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 group-hover/logo:scale-110 transition-transform">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover/logo:from-indigo-400 group-hover/logo:to-white transition-all">
               Movie Vault
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Profile Section */}
          <div className="relative pt-6 border-t border-slate-800">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl transition-all
                ${isProfileOpen ? 'bg-slate-800 shadow-inner' : 'hover:bg-slate-800/50'}
              `}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-black text-white truncate group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                  {user.username}
                </p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 p-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                <div className="px-3 py-3 border-b border-slate-800 mb-1">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Profile</p>
                   <div className="flex items-center gap-2 text-slate-300">
                      <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={10} />
                        )}
                      </div>
                      <p className="text-xs font-bold truncate">{user.username}</p>
                   </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest group"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={14} className="text-indigo-400" />
                    )}
                  </div>
                  <span>Profile</span>
                </Link>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-black uppercase tracking-widest group"
                >
                  <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar Close Overlay for Mobile */}
      {isSidebarOpen && (
         <div 
           className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
           onClick={() => setIsSidebarOpen(false)}
         />
      )}

    </>
  );
}
