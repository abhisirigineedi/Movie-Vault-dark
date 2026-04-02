import { Film } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
              <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                <Film className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Movie Vault
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profile" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Profile
                </Link>
                <div className="h-4 w-px bg-slate-700"></div>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5 rounded-lg transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-700/50">
                  Login
                </Link>
                <Link to="/register" className="text-sm font-medium bg-indigo-500 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
