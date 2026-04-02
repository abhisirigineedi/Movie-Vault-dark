import { Menu, PanelLeft } from "lucide-react";
import { useUI } from "../context/UIContext";

export default function SidebarToggle() {
    const { isSidebarOpen, toggleSidebar } = useUI();

    return (
        <button
            onClick={toggleSidebar}
            className="p-2.5 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 transition-all active:scale-95 group shadow-xl backdrop-blur-sm"
            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
            {isSidebarOpen ? (
                <PanelLeft size={22} className="group-hover:scale-110 transition-transform duration-300" />
            ) : (
                <Menu size={22} className="group-hover:scale-110 transition-transform duration-300" />
            )}
        </button>
    );
}
