import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, User, Activity, FileText, ArrowRight, DollarSign, CheckCircle } from 'lucide-react';

const Dashboard = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState({ totalAmount: 0, completedGigs: 0 });

    useEffect(() => {
        if (!user || !token || user.role === 'admin') return;

        const checkStats = async () => {
            try {
                const endpoint = user.role === 'client' ? '/jobs/client' : '/jobs/freelancer';
                const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    let total = 0;
                    let completed = 0;

                    if (user.role === 'client') {
                        data.forEach(job => {
                            if (job.status === 'completed') {
                                total += parseFloat(job.budget) || 0;
                                completed += 1;
                            }
                        });
                    } else if (user.role === 'freelancer') {
                        data.forEach(app => {
                            if (app.status === 'accepted' && app.job?.status === 'completed') {
                                total += parseFloat(app.job.budget) || 0;
                                completed += 1;
                            }
                        });
                    }

                    setStats({ totalAmount: total, completedGigs: completed });
                }
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            }
        };

        checkStats();
    }, [user, token]);

    return (
        <div className="min-h-screen text-slate-800 dark:text-slate-200 py-12 px-6 sm:px-10 font-sans relative overflow-hidden transition-colors duration-200">
            {/* Subtle background glow */}
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-5 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
                        >
                            Welcome back, {user?.name.split(' ')[0]}!
                        </motion.h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">Here's a quick overview of your {user?.role} account.</p>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* Stat Card 1: Total Amount */}
                    <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:border-emerald-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                                    {user?.role === 'freelancer' ? 'Total Earnings' : user?.role === 'admin' ? 'Total Platform Volume' : 'Total Escrow Spent'}
                                </h3>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">${stats.totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-xs text-emerald-400 font-medium">Successfully processed</p>
                    </div>

                    {/* Stat Card 2: Completed Gigs */}
                    <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:border-indigo-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Completed {user?.role === 'freelancer' ? 'Gigs' : 'Projects'}</h3>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.completedGigs}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-indigo-400" />
                            </div>
                        </div>
                        <p className="text-xs text-indigo-400 font-medium">100% Satisfaction</p>
                    </div>

                    {/* Stat Card 3: Wallet */}
                    <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:border-purple-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Connected Wallet</h3>
                                <p className="text-xl font-bold text-slate-900 dark:text-white truncate w-32 mt-1">
                                    {user?.wallet_address ? `${user.wallet_address.substring(0,6)}...${user.wallet_address.substring(38)}` : 'None mapped'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-purple-400" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{user?.wallet_address ? 'Active on Localhost' : 'Action Required'}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* View Jobs Action */}
                    <Link to={user?.role === 'client' ? "/client-gigs" : "/jobs"} className="group block bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 rounded-2xl p-6 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <Briefcase className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                                    {user?.role === 'client' ? 'Manage Your Postings' : 'Explore Web3 Gigs'}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                    {user?.role === 'client' ? 'Review applicants and fund escrow modules for new talent.' : 'Browse newly posted smart contract and frontend developer roles.'}
                                </p>
                                <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                    {user?.role === 'client' ? 'View Postings' : 'Browse Jobs'} <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Edit Profile Action */}
                    <Link to={user?.role === 'client' ? '/client-profile' : '/freelancer-profile'} className="group block bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 rounded-2xl p-6 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                <User className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2">Update Profile</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Keep your details updated to maximize trust.</p>
                                <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                                    Edit Settings <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
