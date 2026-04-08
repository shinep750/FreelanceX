import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Home, Briefcase, User, Wallet, 
    Settings, LogOut, Menu, X, Bell, Shield, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    // Navigation links array to keep sidebar mapped easily
    const baseLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
    ];

    const freelancerLinks = [
        { name: 'Explore Jobs', path: '/jobs', icon: Briefcase },
        { name: 'My Gigs', path: '/freelancer-gigs', icon: Briefcase },
        { name: 'My Profile', path: '/freelancer-profile', icon: User },
    ];

    const clientLinks = [
        // Placeholder routes for Phase 4
        { name: 'Post a Gig', path: '/post-job', icon: Briefcase },
        { name: 'My Gigs', path: '/client-gigs', icon: Briefcase },
        { name: 'My Profile', path: '/client-profile', icon: User },
    ];

    const adminLinks = [
        { name: 'Disputes Center', path: '/admin', icon: Shield },
    ];

    const walletLink = { name: 'Connect Wallet', path: '/connect-wallet', icon: Wallet };

    let currentRoleLinks = [];
    if (user?.role === 'client') currentRoleLinks = clientLinks;
    else if (user?.role === 'freelancer') currentRoleLinks = freelancerLinks;
    else if (user?.role === 'admin') currentRoleLinks = adminLinks;

    const navLinks = [
        ...baseLinks,
        ...currentRoleLinks,
        walletLink
    ];

    return (
        <div className="flex h-screen bg-[#f4f6fc] text-slate-800 dark:bg-[#0b0f19] dark:text-slate-200 overflow-hidden font-sans transition-colors duration-200">
            
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar Navigation */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-8 border-b border-slate-200 dark:border-slate-800/50">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-600/30">
                        <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Freelance<span className="text-indigo-500">X</span>
                    </span>
                    
                    {/* Close button for mobile inside sidebar */}
                    <button 
                        className="ml-auto lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Primary Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    <p className="px-4 text-xs font-bold tracking-wider text-slate-500 uppercase mb-4">Main Menu</p>
                    
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        
                        return (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                                    isActive 
                                        ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 shadow-sm shadow-indigo-500/10' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                {link.name}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom Profile / Settings Area */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800/50">
                    <div className="mb-2 space-y-1">
                        <button className="flex items-center w-full gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
                            <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Settings
                        </button>
                        <button 
                            onClick={logout}
                            className="flex items-center w-full gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
                        </button>
                    </div>

                    <div className="mt-4 flex items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <img 
                            src={`https://api.dicebear.com/7.x/micah/svg?seed=${user?.name || 'Guest'}&backgroundColor=4f46e5`} 
                            alt={`${user?.name}'s Profile Picture`} 
                            className="w-10 h-10 rounded-full border border-slate-700 shadow-inner bg-indigo-600 transition-transform hover:scale-105"
                        />
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{user?.role || 'Guest'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Hub */}
            <main className="flex-1 flex flex-col h-screen lg:ml-72 transition-all duration-300 ease-in-out overflow-hidden relative">
                
                {/* Topbar Header */}
                <header className="h-20 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sm:px-10 z-30 shrink-0">
                    <div className="flex items-center">
                        <button 
                            className="mr-4 lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize hidden sm:block">
                            {location.pathname.split('/').pop().replace('-', ' ') || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors border border-transparent dark:hover:border-slate-600"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Status indicators */}
                        <div className="hidden sm:flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Testnet Live</span>
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors border border-transparent dark:hover:border-slate-600">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-[#0b0f19] rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Outlet for dynamic page content */}
                <div className="flex-1 overflow-y-auto w-full custom-scrollbar relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
