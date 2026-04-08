import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, Clock, FileText, Link as LinkIcon, Wallet, Activity, Building, Target, DollarSign, Globe, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PublicProfileModal = ({ isOpen, onClose, userId }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !userId) return;

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to load profile');
                }
                
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isOpen, userId, token]);

    if (!isOpen) return null;

    // Helper to extract initial
    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'U';

    const isClient = data?.user?.role === 'client';

    // Theme values depending on role
    const theme = isClient ? {
        primaryBg: 'bg-emerald-500/20',
        primaryText: 'text-emerald-400',
        primaryBorder: 'border-emerald-500/30',
        gradient: 'from-emerald-500 to-teal-600',
        icon: 'text-emerald-500',
        hoverBg: 'hover:bg-emerald-500/20',
        accentBg: 'bg-emerald-500/10'
    } : {
        primaryBg: 'bg-indigo-500/20',
        primaryText: 'text-indigo-400',
        primaryBorder: 'border-indigo-500/30',
        gradient: 'from-indigo-500 to-purple-600',
        icon: 'text-indigo-500',
        hoverBg: 'hover:bg-indigo-500/20',
        accentBg: 'bg-indigo-500/10'
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-md"
            >
                <motion.div
                    initial={{ y: 50, scale: 0.95, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 20, scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80 sticky top-0 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-3">
                            <div className={`${data ? theme.primaryBg : 'bg-indigo-100 dark:bg-indigo-500/20'} p-2 rounded-lg ${data ? theme.primaryText : 'text-indigo-600 dark:text-indigo-400'}`}>
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {data ? (isClient ? 'Client Profile' : 'Freelancer Profile') : 'User Profile'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Activity className="w-8 h-8 text-indigo-600 dark:text-indigo-500 animate-spin" />
                                <p className="text-slate-600 dark:text-slate-400 font-medium">Loading profile data...</p>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="text-center p-8 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400">
                                {error}
                            </div>
                        )}

                        {!loading && !error && data && data.user && (
                            <div className="space-y-8">
                                {/* Profile Header Card */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                                    {data.profile?.profile_image ? (
                                        <img 
                                            src={`${import.meta.env.VITE_BASE_URL}${data.profile.profile_image}`} 
                                            alt={data.user.name} 
                                            className={`w-24 h-24 rounded-full border-4 ${theme.primaryBorder} object-cover`}
                                        />
                                    ) : (
                                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-4xl font-extrabold text-white shadow-lg border border-white/20 dark:border-white/10`}>
                                            {getInitial(data.user.name)}
                                        </div>
                                    )}
                                    <div className="text-center sm:text-left flex-1">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{data.user.name}</h3>
                                        {isClient ? (
                                            <p className={`${theme.primaryText} font-medium mb-3 flex items-center justify-center sm:justify-start gap-1`}>
                                                <Building className="w-4 h-4"/> {data.profile?.company_name || 'Independent Client'}
                                            </p>
                                        ) : (
                                            <p className={`${theme.primaryText} font-medium mb-3`}>
                                                {data.profile?.domain || 'Freelancer'}
                                            </p>
                                        )}
                                        
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                                            {/* Freelancer specific badges */}
                                            {!isClient && data.profile?.hourly_rate && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-sm font-semibold rounded-lg border border-emerald-500/20">
                                                    <Clock className="w-4 h-4" /> ${data.profile.hourly_rate}/hr
                                                </span>
                                            )}
                                            {/* Client specific badges */}
                                            {isClient && data.profile?.industry && (
                                                <span className={`flex items-center gap-1.5 px-3 py-1 ${theme.accentBg} ${theme.primaryText} text-sm font-semibold rounded-lg border ${theme.primaryBorder}`}>
                                                    <Target className="w-4 h-4" /> {data.profile.industry}
                                                </span>
                                            )}
                                            {/* Generic Badges */}
                                            {data.user.wallet_address && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 text-sm font-semibold rounded-lg border border-amber-500/20" title={data.user.wallet_address}>
                                                    <Wallet className="w-4 h-4" /> Web3 Connected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Shared Bio / About Section */}
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3">
                                        <FileText className="w-4 h-4" /> {isClient ? 'About Company' : 'About'}
                                    </h4>
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {(isClient ? data.profile?.company_description : data.profile?.bio) || 
                                           <span className="text-slate-500 italic">No description provided.</span>}
                                    </div>
                                </div>

                                {/* Freelancer specific Sections */}
                                {!isClient && (
                                    <>
                                        {/* Skills Section */}
                                        <div>
                                            <h4 className="flex items-center gap-2 text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3">
                                                <Briefcase className="w-4 h-4" /> Skills & Expertise
                                            </h4>
                                            {data.profile?.skills ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {(Array.isArray(data.profile.skills) ? data.profile.skills : typeof data.profile.skills === 'string' ? data.profile.skills.split(',') : []).map((skill, index) => (
                                                        <span key={index} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-lg text-sm border border-slate-200 dark:border-slate-600/50 shadow-sm">
                                                            {typeof skill === 'string' ? skill.trim() : String(skill)}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-slate-500 italic">No skills listed.</p>
                                            )}
                                        </div>

                                        {/* Experience Section */}
                                        {data.profile?.experience && data.profile.experience.length > 0 && (
                                            <div>
                                                <h4 className="flex items-center gap-2 text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3">
                                                    <Briefcase className="w-4 h-4" /> Work Experience
                                                </h4>
                                                <div className="space-y-4">
                                                    {data.profile.experience.map((exp, index) => (
                                                        <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h5 className="font-bold text-slate-900 dark:text-slate-200">{exp.role}</h5>
                                                                    <p className="text-sm text-indigo-600 dark:text-indigo-400">{exp.company}</p>
                                                                </div>
                                                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">{exp.period}</span>
                                                            </div>
                                                            {exp.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed text-wrap break-words">{exp.description}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Portfolio Section */}
                                        {data.profile?.portfolio && data.profile.portfolio.length > 0 && (
                                            <div>
                                                <h4 className="flex items-center gap-2 text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3">
                                                    <FolderOpen className="w-4 h-4" /> Projects & Portfolio
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {data.profile.portfolio.map((item, index) => (
                                                        <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl flex flex-col h-full">
                                                            <div className="flex-1">
                                                                <h5 className="font-bold text-slate-900 dark:text-slate-200 mb-1">{item.title}</h5>
                                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">{item.type}</p>
                                                            </div>
                                                            {item.link && (
                                                                <a 
                                                                    href={item.link.startsWith('http') ? item.link : `https://${item.link}`} 
                                                                    target="_blank" 
                                                                    rel="noreferrer"
                                                                    className={`inline-flex items-center justify-center gap-2 w-full py-2.5 ${theme.accentBg} hover:bg-slate-100 dark:hover:bg-slate-700 ${theme.primaryText} text-sm font-bold rounded-lg border ${theme.primaryBorder} transition-colors`}
                                                                >
                                                                    View Project <LinkIcon className="w-3.5 h-3.5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Client specific Sections */}
                                {isClient && (
                                    <>
                                        {/* Budget & Hiring Defaults */}
                                        {(data.profile?.budget_range || data.profile?.hiring_preference) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {data.profile?.budget_range && (
                                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Typical Budget</span>
                                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                                                            <DollarSign className="w-4 h-4" /> {data.profile.budget_range}
                                                        </div>
                                                    </div>
                                                )}
                                                {data.profile?.hiring_preference && (
                                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Hiring Preference</span>
                                                        <div className="text-slate-700 dark:text-slate-300 font-medium capitalize">
                                                            {data.profile.hiring_preference.replace('_', ' ')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Website Section */}
                                        {data.profile?.website && (
                                            <div>
                                                <h4 className="flex items-center gap-2 text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3">
                                                    <Globe className="w-4 h-4" /> Corporate Website
                                                </h4>
                                                <a 
                                                    href={data.profile.website.startsWith('http') ? data.profile.website : `https://${data.profile.website}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className={`inline-flex items-center gap-2 px-4 py-3 ${theme.accentBg} ${theme.hoverBg} ${theme.primaryText} font-medium rounded-xl border ${theme.primaryBorder} transition-colors`}
                                                >
                                                    {data.profile.website} <LinkIcon className="w-4 h-4" />
                                                </a>
                                            </div>
                                        )}
                                    </>
                                )}

                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PublicProfileModal;
