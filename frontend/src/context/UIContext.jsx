import { createContext, useContext, useState, useEffect } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
    // Default to open on desktop, closed on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Close sidebar on mobile when window is resized
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <UIContext.Provider value={{ isSidebarOpen, setIsSidebarOpen, toggleSidebar }}>
            {children}
        </UIContext.Provider>
    );
}

export const useUI = () => useContext(UIContext);
