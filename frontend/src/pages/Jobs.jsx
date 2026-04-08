import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Briefcase, DollarSign, Clock, CheckCircle, AlertCircle, Loader2, Calendar, User } from 'lucide-react';
import PublicProfileModal from '../components/PublicProfileModal';

const Jobs = () => {
    const { token } = useAuth();
    const { addToast } = useToast();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [profileModalState, setProfileModalState] = useState({ isOpen: false, userId: null });

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch jobs. Please try again later.');
                }

                const data = await response.json();
                setJobs(data);
            } catch (err) {
                addToast(err.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchJobs();
    }, [token]);

    const handleApply = async (jobId) => {
        setApplying(jobId);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ jobId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Application failed.');
            }

            // Immediately mark as applied in local state without reloading
            setJobs((prevJobs) =>
                prevJobs.map((job) =>
                    job.id === jobId ? { ...job, hasApplied: true } : job
                )
            );
            
            addToast('Application submitted successfully!', 'success');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setApplying(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Loading available jobs...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-slate-800 dark:text-slate-200 py-12 px-6 sm:px-10 font-sans transition-colors duration-200">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-end mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Available Jobs</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">Browse and apply to freelance opportunities that match your skills.</p>
                    </div>
                </div>

                {jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl">
                        <Briefcase className="w-16 h-16 text-slate-400 dark:text-slate-600 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-300">No jobs available</h3>
                        <p className="text-slate-600 dark:text-slate-500 mt-2 text-sm">Waiting for clients to post new opportunities.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 shadow-sm dark:shadow-lg dark:shadow-black/10 hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
                            >
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-bold uppercase tracking-wider">
                                            {job.status || 'OPEN'}
                                        </span>
                                    </div>
                                    
                                    <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100 line-clamp-1" title={job.title}>
                                        {job.title}
                                    </h2>
                                    
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 line-clamp-3 leading-relaxed">
                                        {job.description}
                                    </p>
                                </div>

                                <div className="pt-5 border-t border-slate-200 dark:border-slate-700/50 mt-auto">
                                    <div className="flex justify-between items-center mb-4 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            <span>
                                                Posted by: {' '}
                                                <button 
                                                    onClick={() => setProfileModalState({isOpen: true, userId: job.client?.id})} 
                                                    className="text-slate-800 dark:text-slate-200 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
                                                >
                                                    {job.client?.name || 'Unknown Client'}
                                                </button>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <span>Deadline: <strong className="text-slate-800 dark:text-slate-200">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</strong></span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mb-5">
                                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-300">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
                                                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="font-bold">{job.budget} USD</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Listed recently</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleApply(job.id)}
                                        disabled={job.hasApplied || applying === job.id}
                                        className={`w-full py-3 rounded-lg font-bold text-sm transition-all duration-200 flex justify-center items-center gap-2
                                            ${job.hasApplied 
                                                ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 cursor-not-allowed' 
                                                : applying === job.id 
                                                    ? 'bg-indigo-600/50 text-white cursor-wait opacity-70'
                                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-indigo-500/25 active:scale-[0.98]'
                                            }
                                        `}
                                    >
                                        {applying === job.id ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Applying...</>
                                        ) : job.hasApplied ? (
                                            <><CheckCircle className="w-4 h-4" /> Already Applied</>
                                        ) : (
                                            'Apply to Job'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <PublicProfileModal 
                isOpen={profileModalState.isOpen}
                userId={profileModalState.userId}
                onClose={() => setProfileModalState({ isOpen: false, userId: null })}
            />
        </div>
    );
};

export default Jobs;
