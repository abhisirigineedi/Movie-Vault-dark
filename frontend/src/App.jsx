import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UIProvider, useUI } from "./context/UIContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyList from "./pages/MyList";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import PublicProfile from "./pages/PublicProfile";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { isSidebarOpen } = useUI();

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      <Sidebar />
      <main className={`
        flex-1 transition-all duration-500 p-4 lg:p-8
        ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}
      `}>
        {children}
      </main>
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-slate-950 selection:bg-indigo-500/30">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 z-0 bg-slate-950 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#6366f1_100%)] opacity-30 pointer-events-none"></div>
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/my-list" element={<ProtectedRoute><MyList /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
      <Route path="/user/:username" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}
