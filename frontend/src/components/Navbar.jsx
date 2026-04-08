import React from 'react';
import { Briefcase, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();
    
    return (
        <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 lg:px-24 py-12 w-full max-w-screen-2xl mx-auto">
            <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#3b2ecc] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    <Briefcase className="text-white w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-slate-700 tracking-tight ml-2">
                    Freelance<span className="text-[#3b2ecc]">X</span>
                </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
                {user && (
                    <Link to="/dashboard" className="px-5 py-2.5 rounded-lg bg-[#3b2ecc] text-white font-medium hover:bg-[#2b21a3] transition-colors shadow-lg shadow-indigo-500/30">
                        Go to Dashboard
                    </Link>
                )}
            </div>
            
            {/* Mobile Menu Icon (Placeholder for now) */}
            <div className="md:hidden">
                <button className="text-slate-700 hover:text-indigo-600">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
