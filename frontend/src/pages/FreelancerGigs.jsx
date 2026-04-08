import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Briefcase, CreditCard, Clock, CheckCircle, Search, Calendar, FolderClock, MessageSquare, User, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobChatModal from '../components/JobChatModal';
import DisputeModal from '../components/DisputeModal';
import PublicProfileModal from '../components/PublicProfileModal';
import DeliveryModal from '../components/DeliveryModal';
import { useToast } from '../context/ToastContext';
import { getProvider, getEscrowContract, switchToLocalNetwork } from '../utils/ethereum';
import { parseEthersError } from '../utils/errorHandler';

const FreelancerGigs = () => {
    const { token } = useAuth();
    const { addToast } = useToast();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [chatState, setChatState] = useState({
        isOpen: false,
        jobId: null,
        receiverId: null,
        jobTitle: ''
    });

    const [profileModalState, setProfileModalState] = useState({ 
        isOpen: false, 
        userId: null 
    });

    const [deliveryState, setDeliveryState] = useState({
        isOpen: false,
        jobId: null
    });

    const [disputeState, setDisputeState] = useState({
        isOpen: false,
        jobId: null
    });

    const [actionLoading, setActionLoading] = useState(false);

    const handleOpenChat = (jobId, clientId, jobTitle) => {
        setChatState({
            isOpen: true,
            jobId,
            receiverId: clientId,
            jobTitle
        });
    };

    const fetchGigs = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/freelancer`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch your applications');
            const data = await response.json();
            setApplications(data);
        } catch (err) {
            setError(parseEthersError(err));
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchGigs();
    }, [fetchGigs]);

    const handleRaiseDispute = async (jobId, reason) => {
        setActionLoading(true);
        try {
            await switchToLocalNetwork();
            const provider = getProvider();
            const contract = await getEscrowContract(provider);
            
            const tx = await contract.raiseDispute(jobId);
            await tx.wait(); 
            
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
            
            await fetchGigs();
            setDisputeState({ isOpen: false, jobId: null });
            addToast('Dispute raised successfully. Funds are frozen.', 'warning');
            
        } catch (err) {
            console.error(err);
            addToast(parseEthersError(err) || 'Error occurred while raising dispute.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeliverWork = async (jobId, note) => {
        setActionLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}/deliver`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ note })
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to deliver work');
            }
            
            await fetchGigs();
            setDeliveryState({ isOpen: false, jobId: null });
            addToast('Work successfully delivered and client notified!', 'success');
            
        } catch (err) {
            console.error(err);
            addToast(parseEthersError(err) || 'Error occurred while delivering work.', 'error');
        } finally {
            setActionLoading(false);
        }
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

    // Filter statuses visually
    const pendingPitches = applications.filter(app => app.status === 'pending');
    const activeGigs = applications.filter(app => app.status === 'accepted' && (app.job?.status === 'in_progress' || app.job?.status === 'disputed'));
    const completedGigs = applications.filter(app => app.job?.status === 'completed');

    return (
        <div className="p-6 sm:p-10 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        My Gigs & Pitches
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">Track your active projects and monitor the status of past applications.</p>
                </div>
                <Link 
                    to="/jobs" 
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                    <Search className="w-4 h-4" /> Explore New Jobs
                </Link>
            </div>

            {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-3xl text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <FolderClock className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Applications Yet</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">You haven't pitched to any clients yet. Explore the marketplace to find your next gig!</p>
                    <Link to="/jobs" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl transition-all font-bold">
                        Browse Jobs
                    </Link>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Active Gigs Section */}
                    {activeGigs.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active in Progress
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeGigs.map(app => (
                                    <GigCard 
                                        key={app.id} 
                                        app={app} 
                                        type="active" 
                                        onOpenChat={handleOpenChat} 
                                        onRaiseDispute={(jobId) => setDisputeState({ isOpen: true, jobId })} 
                                        actionLoading={actionLoading}
                                        onOpenProfile={(userId) => setProfileModalState({ isOpen: true, userId })}
                                        onDeliverWork={(jobId) => setDeliveryState({ isOpen: true, jobId })}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Pending Pitches Section */}
                    {pendingPitches.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                Pending Pitches
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingPitches.map(app => (
                                    <GigCard key={app.id} app={app} type="pending" onOpenChat={handleOpenChat} onOpenProfile={(userId) => setProfileModalState({ isOpen: true, userId })} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Completed Section */}
                    {completedGigs.length > 0 && (
                        <section className="opacity-70 hover:opacity-100 transition-opacity">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                Completed Work
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {completedGigs.map(app => (
                                    <GigCard key={app.id} app={app} type="completed" onOpenChat={handleOpenChat} onOpenProfile={(userId) => setProfileModalState({ isOpen: true, userId })} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
            
            <JobChatModal 
                isOpen={chatState.isOpen}
                jobId={chatState.jobId}
                receiverId={chatState.receiverId}
                jobTitle={chatState.jobTitle}
                onClose={() => setChatState({ ...chatState, isOpen: false })}
            />

            <DisputeModal 
                isOpen={disputeState.isOpen}
                onClose={() => setDisputeState({ isOpen: false, jobId: null })}
                jobId={disputeState.jobId}
                onSubmit={handleRaiseDispute}
                actionLoading={actionLoading}
            />

            <PublicProfileModal 
                isOpen={profileModalState.isOpen}
                userId={profileModalState.userId}
                onClose={() => setProfileModalState({ isOpen: false, userId: null })}
            />

            <DeliveryModal
                isOpen={deliveryState.isOpen}
                jobId={deliveryState.jobId}
                onClose={() => setDeliveryState({ isOpen: false, jobId: null })}
                onSubmit={handleDeliverWork}
                actionLoading={actionLoading}
            />
        </div>
    );
};

/* --- Reusable Card Component --- */
const GigCard = ({ app, type, onOpenChat, onRaiseDispute, actionLoading, onOpenProfile, onDeliverWork }) => {
    const job = app.job;
    if (!job) return null;

    const styles = {
        active: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/30",
        pending: "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
        completed: "bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800"
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`border rounded-2xl p-6 flex flex-col ${styles[type]} shadow-lg transition-all`}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight line-clamp-2 pr-4">{job.title}</h3>
                
                {type === 'active' && (
                    <span className={`px-2.5 py-1 ${
                        job.status === 'disputed' ? 'bg-rose-500/20 text-rose-400 border-rose-500/20' : 
                        app.delivered_at ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                    } rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 border`}>
                        {job.status === 'disputed' ? 'Disputed' : app.delivered_at ? 'In Review' : 'Working'}
                    </span>
                )}
                {type === 'pending' && <span className="px-2.5 py-1 bg-amber-500/20 text-amber-500 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 border border-amber-500/20">Waitlisted</span>}
                {type === 'completed' && <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 border border-indigo-500/20">Finished</span>}
            </div>

            <div className="flex items-center gap-1.5 mb-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                    <User className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                </span>
                <span>Client:{' '}
                    <button 
                        onClick={() => onOpenProfile(job.client?.id)} 
                        className="text-slate-900 dark:text-slate-200 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
                    >
                        {job.client?.name || 'Unknown'}
                    </button>
                </span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">{job.description}</p>

            <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700/50">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        Budget
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">${parseFloat(job.budget).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                        Deadline
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Flexible'}
                    </span>
                </div>
            </div>
            
            {type === 'active' && (
                <div className="mt-6 space-y-3">
                    {job.status === 'disputed' ? (
                        <div className="text-rose-400 text-xs text-center border border-rose-500/30 bg-rose-500/10 p-3 rounded-xl font-bold flex flex-col items-center gap-1">
                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Dispute Active</span>
                            <span className="font-normal opacity-80 text-[10px]">Escrow funds frozen. Admin reviewing.</span>
                        </div>
                    ) : (
                        <>
                            {app.delivered_at ? (
                                <button disabled className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-not-allowed">
                                    <CheckCircle className="w-4 h-4" /> Work Submitted
                                </button>
                            ) : (
                                <button 
                                    onClick={() => onDeliverWork(job.id)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" /> Deliver Work
                                </button>
                            )}
                            
                            <button 
                                onClick={() => onOpenChat(job.id, job.client_id, job.title)}
                                className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" /> Message Client
                            </button>
                            <button 
                                onClick={() => onRaiseDispute(job.id)}
                                disabled={actionLoading}
                                className={`w-full ${actionLoading ? 'bg-rose-600/10 text-rose-400/50 cursor-not-allowed' : 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30'} py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2`}
                            >
                                 Dispute Job
                            </button>
                            <p className="text-[10px] text-center text-slate-500 mt-2">Client will mark this as completed once approved.</p>
                        </>
                    )}
                </div>
            )}
            
        </motion.div>
    );
};

export default FreelancerGigs;
