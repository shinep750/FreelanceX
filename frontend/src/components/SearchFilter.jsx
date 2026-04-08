import React from 'react';
import { LayoutGrid, ChevronDown, Search } from 'lucide-react';

const SearchFilter = () => {
    return (
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/40 p-2 flex flex-col md:flex-row items-center gap-4 w-full max-w-3xl mx-auto z-10 relative">

            {/* Category Dropdown */}
            <div className="flex-1 flex items-center px-4 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors w-full md:w-auto">
                <LayoutGrid className="text-blue-500 w-5 h-5 mr-3" />
                <span className="text-slate-700 font-medium flex-1">Select a Category</span>
                <ChevronDown className="text-slate-400 w-4 h-4 ml-2" />
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-200"></div>

            {/* Budget Dropdown */}
            <div className="flex-1 flex items-center px-4 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors w-full md:w-auto">
                <span className="text-slate-700 font-medium flex-1">Enter Budget</span>
                <ChevronDown className="text-slate-400 w-4 h-4 ml-2" />
            </div>

            {/* Search Button */}
            <button className="bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 font-semibold px-6 py-3 rounded-lg flex items-center transition-all w-full md:w-auto justify-center">
                <Search className="text-blue-600 w-5 h-5 mr-2" />
                Search
            </button>

        </div>
    );
};

export default SearchFilter;
