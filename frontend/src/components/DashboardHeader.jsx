import { Plus } from "lucide-react";
import SidebarToggle from "./SidebarToggle";

export default function DashboardHeader({ onAddClick }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div className="flex items-center gap-4">
        <SidebarToggle />
        <div className="space-y-0.5">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest opacity-70">Library Overview</p>
        </div>
      </div>

      <button
        onClick={onAddClick}
        className="
          flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 text-slate-950 font-bold rounded-xl 
          hover:bg-cyan-400 hover:scale-105 transition-all duration-300 shadow-xl shadow-cyan-500/20
          animate-in zoom-in-50 duration-500
        "
      >
        <Plus size={20} className="stroke-[3]" />
        <span>Add Content</span>
      </button>
    </div>
  );
}
