import React from 'react';
import { User, Building2, CircleDollarSign } from 'lucide-react';

const Stats = () => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 mt-20 z-10 relative">

            {/* Stat 1 */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">120k+</h3>
                    <p className="text-slate-500 text-sm font-medium">Freelancers</p>
                </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center">
                    <Building2 className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">25k+</h3>
                    <p className="text-slate-500 text-sm font-medium">Clients</p>
                </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center">
                    <CircleDollarSign className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">$15M+</h3>
                    <p className="text-slate-500 text-sm font-medium">Paid Out</p>
                </div>
            </div>

        </div>
    );
};

export default Stats;
