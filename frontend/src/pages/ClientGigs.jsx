import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import JobChatModal from '../components/JobChatModal';
import DisputeModal from '../components/DisputeModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, CreditCard, ChevronDown, ChevronUp, User, Clock, CheckCircle, XCircle, Search, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProvider, getEscrowContract, switchToLocalNetwork } from '../utils/ethereum';
import { parseEther } from 'ethers';
import { parseEthersError } from '../utils/errorHandler';
import PublicProfileModal from '../components/PublicProfileModal';

const ClientGigs = () => {
    const { token } = useAuth();
    const { addToast } = useToast();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedJob, setExpandedJob] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [profileModalState, setProfileModalState] = useState({ isOpen: false, userId: null });

    // Chat Modal State
    const [chatState, setChatState] = useState({
        isOpen: false,
        jobId: null,
        receiverId: null,
        jobTitle: ''
    });

    const [disputeState, setDisputeState] = useState({
        isOpen: false,
        jobId: null
    });

    const handleOpenChat = (jobId, freelancerId, jobTitle) => {
        setChatState({
            isOpen: true,
            jobId,
            receiverId: freelancerId,
            jobTitle
        });
    };

    const handleCloseChat = () => {
        setChatState(prev => ({ ...prev, isOpen: false }));
    };

    const fetchJobs = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/client`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch your jobs');
            const data = await response.json();
            setJobs(data);
        } catch (err) {
            setError(parseEthersError(err));
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleAcceptPitch = async (job, app) => {
        if (!app.freelancer?.wallet_address) {
            addToast("This freelancer has not connected their wallet. They cannot receive funds.", 'warning');
            return;
        }

        if (!window.confirm(`Are you sure you want to accept this pitch? You will be prompted to deposit the budget ($${job.budget}) into Escrow.`)) return;
        
        setActionLoading(true);
        try {
            // 1. Web3 Transaction
            await switchToLocalNetwork();
            const provider = getProvider();
            const contract = await getEscrowContract(provider);
            // Convert USD budget to an approximate ETH amount (assuming 1 ETH = $3000 for test purposes)
            const ethAmount = (job.budget / 3000).toFixed(6).toString();
            const value = parseEther(ethAmount);
            
            const tx = await contract.fundMilestone(job.id, app.freelancer.wallet_address, { value });
            await tx.wait(); // Wait for confirmation on the blockchain

            // 2. Backend Update
            const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${job.id}/accept/${app.id}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                }
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to accept pitch on backend');
            }
            
            
            await fetchJobs();
            addToast('Pitch accepted and Escrow funded successfully!', 'success');
            
        } catch (err) {
            console.error(err);
            addToast(parseEthersError(err) || 'Error occurred during Escrow funding.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteJob = async (jobId) => {
        if (!window.confirm("Are you sure you want to mark this gig as COMPLETED? The Escrow funds will be released to the freelancer.")) return;
        
        setActionLoading(true);
        try {
            // 1. Web3 Transaction
            const provider = getProvider();
            const contract = await getEscrowContract(provider);
            
            const tx = await contract.releasePayment(jobId);
            await tx.wait(); // Wait for confirmation
            
            // 2. Backend Update
            const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}/complete`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                }
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to complete job on backend');
            }
            
            
            await fetchJobs();
            addToast('Job marked as completed and Escrow funds released.', 'success');
            
        } catch (err) {
            console.error(err);
            addToast(parseEthersError(err) || 'Error occurred during Escrow payment release.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRaiseDispute = async (jobId, reason) => {
        setActionLoading(true);
        try {
            // 1. Web3 Transaction
            await switchToLocalNetwork();
            const provider = getProvider();
            const contract = await getEscrowContract(provider);
            
            const tx = await contract.raiseDispute(jobId);
            await tx.wait(); // Wait for confirmation
            
            // 2. Backend Update
            const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}/dispute`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ reason })
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to raise dispute on backend');
            }
            
            await fetchJobs();
            setDisputeState({ isOpen: false, jobId: null });
            addToast('Dispute raised successfully. Funds are frozen.', 'warning');
            
        } catch (err) {
            console.error(err);
            addToast(parseEthersError(err) || 'Error occurred while raising dispute.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const toggleExpand = (jobId) => {
        if (expandedJob === jobId) setExpandedJob(null);
        else setExpandedJob(jobId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-rose-500 bg-rose-500/10 rounded-xl m-6 border border-rose-500/20">{error}</div>;
    }

    return (
        <div className="p-6 sm:p-10 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
                        My Posted Gigs
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">Review your active postings and manage freelancer applications.</p>
                </div>
                <Link 
                    to="/post-job" 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2"
                >
                    <Briefcase className="w-4 h-4" /> Post New Gig
                </Link>
            </div>

            {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-3xl text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <Search className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Gigs Found</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">You haven't posted any jobs to the marketplace yet. Create your first gig to start receiving applications from top Web3 talent!</p>
                    <Link to="/post-job" className="bg-indigo-600 hover:bg-indigo-500 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-6 py-2.5 rounded-xl transition-all border border-indigo-500 dark:border-slate-600 shadow-md">
                        Create a Gig
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {jobs.map((job) => {
                        const deliveredApp = job.applications?.find(app => app.status === 'accepted' && app.delivered_at);
                        const displayStatus = deliveredApp && job.status === 'in_progress' ? 'in_review' : job.status;
                        
                        return (
                        <motion.div 
                            key={job.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm dark:shadow-lg transition-all hover:border-indigo-300 dark:hover:border-slate-600"
                        >
                            {/* Job Header Summary */}
                            <div 
                                className="p-6 sm:p-8 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                onClick={() => toggleExpand(job.id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">{job.title}</h3>
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                                            displayStatus === 'open' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 
                                            displayStatus === 'in_review' ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30' :
                                            displayStatus === 'in_progress' ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' : 
                                            displayStatus === 'disputed' ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30' :
                                            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                                        }`}>
                                            {displayStatus.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-1">{job.description}</p>
                                </div>
                                <div className="flex items-center gap-6 sm:gap-8">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Budget</p>
                                        <p className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                                            <CreditCard className="w-4 h-4 opacity-80" /> ${parseFloat(job.budget).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Applicants</p>
                                        <p className="text-indigo-400 font-bold flex items-center justify-end gap-1">
                                            <User className="w-4 h-4 opacity-80" /> {job.applications?.length || 0}
                                        </p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Deadline</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-bold flex items-center justify-end gap-1">
                                            <Calendar className="w-4 h-4 opacity-80" /> {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center shrink-0">
                                        {expandedJob === job.id ? <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                                    </div>
                                </div>
                            </div>

                            {/* Job Applications Area (Expanded) */}
                            <AnimatePresence>
                                {expandedJob === job.id && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                                    >
                                        <div className="p-6 sm:p-8">
                                            <h4 className="text-slate-800 dark:text-slate-300 font-bold mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/50 pb-2">
                                                <User className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Waitlisting Freelancers
                                            </h4>
                                            
                                            {job.applications && job.applications.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {job.applications.map((app) => (
                                                        <div key={app.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 relative overflow-hidden group shadow-sm dark:shadow-none">
                                                            {app.status === 'accepted' && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full pointer-events-none"></div>}
                                                            {app.delivered_at && (
                                                                <div className="absolute -top-1 -left-1 right-0 rounded-t-2xl py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest text-center border-b border-emerald-500/20 shadow-sm dark:shadow-md flex items-center justify-center gap-1 z-20">
                                                                    <CheckCircle className="w-3 h-3" /> Delivery Ready for Review
                                                                </div>
                                                            )}
                                                            <div className={`flex items-start justify-between mb-4 relative z-10 ${app.delivered_at ? 'mt-6' : ''}`}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-inner">
                                                                        {app.freelancer?.name?.charAt(0) || 'F'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate max-w-[120px]">{app.freelancer?.name}</p>
                                                                        <p className="text-xs text-slate-500 truncate max-w-[120px]">{app.freelancer?.email}</p>
                                                                    </div>
                                                                </div>
                                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                                                    app.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                                                                    app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                                    'bg-rose-500/10 text-rose-500'
                                                                }`}>
                                                                    {app.status === 'pending' && <Clock className="w-3 h-3" />}
                                                                    {app.status === 'accepted' && <CheckCircle className="w-3 h-3" />}
                                                                    {app.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                                    {app.status}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-2 relative z-10">
                                                                <button 
                                                                    onClick={() => {
                                                                        if (app.freelancer?.id) {
                                                                            setProfileModalState({ isOpen: true, userId: app.freelancer.id });
                                                                        } else {
                                                                            addToast('Freelancer ID is missing. Cannot view profile.', 'error');
                                                                        }
                                                                    }}
                                                                    className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs py-2 rounded-lg font-medium transition-colors"
                                                                >
                                                                    View Profile
                                                                </button>
                                                                {app.status === 'pending' && job.status === 'open' && (
                                                                    <button 
                                                                        onClick={() => handleAcceptPitch(job, app)}
                                                                        disabled={actionLoading}
                                                                        className={`flex-1 flex justify-center items-center gap-1 ${actionLoading ? 'bg-indigo-600/10 text-indigo-400/50 cursor-not-allowed' : 'bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30'} text-xs py-2 rounded-lg font-medium transition-colors`}
                                                                    >
                                                                        {actionLoading ? <><Loader2 className="w-3 h-3 animate-spin"/> Processing...</> : 'Accept Pitch'}
                                                                    </button>
                                                                )}
                                                                {app.status === 'accepted' && (job.status === 'in_progress' || job.status === 'disputed') && (
                                                                    <>
                                                                    {job.status === 'disputed' ? (
                                                                        <div className="flex-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1">
                                                                            Dispute Under Review
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                        <button 
                                                                            onClick={() => handleCompleteJob(job.id)}
                                                                            disabled={actionLoading}
                                                                            className={`flex-1 flex justify-center items-center gap-1 ${actionLoading ? 'bg-emerald-600/10 text-emerald-400/50 cursor-not-allowed' : 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30'} text-xs py-2 rounded-lg font-medium transition-colors`}
                                                                        >
                                                                            {actionLoading ? <><Loader2 className="w-3 h-3 animate-spin"/> Processing...</> : 'Mark Completed'}
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleOpenChat(job.id, app.freelancer.id, job.title)}
                                                                            className={`flex-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs py-2 rounded-lg font-medium transition-colors`}
                                                                        >
                                                                            Message Freelancer
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => setDisputeState({ isOpen: true, jobId: job.id })}
                                                                            disabled={actionLoading}
                                                                            className={`flex-1 flex justify-center items-center gap-1 ${actionLoading ? 'bg-rose-600/10 text-rose-400/50 cursor-not-allowed' : 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30'} text-xs py-2 rounded-lg font-medium transition-colors`}
                                                                        >
                                                                            {actionLoading ? <><Loader2 className="w-3 h-3 animate-spin"/> Processing...</> : 'Dispute'}
                                                                        </button>
                                                                        </>
                                                                    )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-slate-500 italic flex items-center justify-center py-8">
                                                    No applications received yet. Check back soon.
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Chat Modal */}
            <JobChatModal 
                isOpen={chatState.isOpen}
                onClose={handleCloseChat}
                jobId={chatState.jobId}
                receiverId={chatState.receiverId}
                jobTitle={chatState.jobTitle}
            />

            {/* Dispute Modal */}
            <DisputeModal 
                isOpen={disputeState.isOpen}
                onClose={() => setDisputeState({ isOpen: false, jobId: null })}
                jobId={disputeState.jobId}
                onSubmit={handleRaiseDispute}
                actionLoading={actionLoading}
            />

            {/* Profile Modal */}
            <PublicProfileModal 
                isOpen={profileModalState.isOpen} 
                onClose={() => setProfileModalState({ isOpen: false, userId: null })} 
                userId={profileModalState.userId} 
            />
        </div>
    );
};

export default ClientGigs;
