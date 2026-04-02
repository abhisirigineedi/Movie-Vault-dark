import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Film, User, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // Email or Username
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[32px] p-10 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400"></div>
          
          <div className="flex flex-col items-center mb-10">
            <div className="p-4 bg-indigo-500 rounded-2xl shadow-xl shadow-indigo-500/20 mb-6 group hover:scale-110 transition-transform duration-500">
              <Film className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Sign in to your Movie Vault</p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest px-1">Email or Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-600 font-bold"
                  placeholder="name@example.com or username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest px-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-600 font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-widest hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 group"
            >
              {loading ? "Authenticating..." : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
              Don't have an account?{" "}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors ml-2">
                Create Vault
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
