import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, AlertTriangle, ArrowRightLeft, Loader2, CheckCircle, AlertOctagon, Activity, FileText } from 'lucide-react';

const AdminDashboard = () => {
    const { token, user } = useAuth();
    const { addToast } = useToast();
    const [jobs, setJobs] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState({});
    const [activeTab, setActiveTab] = useState('disputes');

    const handleNoteChange = (jobId, value) => {
        setAdminNotes(prev => ({...prev, [jobId]: value}));
    };
    
    const fetchDisputedJobs = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/disputed`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch disputed jobs');
            const data = await response.json();
            setJobs(data);
        } catch (err) {
            console.error(err);
        }
    }, [token]);

    const fetchTransactions = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch transactions');
            const data = await response.json();
            setTransactions(data);
        } catch (err) {
            console.error(err);
        }
    }, [token]);

    useEffect(() => {
        if (user && user.role === 'admin') {
            Promise.all([fetchDisputedJobs(), fetchTransactions()]).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user, fetchDisputedJobs, fetchTransactions]);

    const handleResolve = async (jobId, releaseToFreelancer) => {
        const notes = adminNotes[jobId];
        if (!notes || notes.trim() === '') {
            addToast('Please provide an Admin Note justifying this action.', 'error');
            return;
        }

        if (!window.confirm(`Are you sure you want to resolve this in favor of the ${releaseToFreelancer ? 'Freelancer' : 'Client'}? This cannot be undone.`)) return;
        
        setActionLoading(true);
        try {
            // Relayer Architecture: The backend handles the blockchain Escrow signing!
            const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs/${jobId}/resolve`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ releaseToFreelancer, adminNotes: notes })
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to resolve dispute on backend');
            }
            
            await fetchDisputedJobs();
            await fetchTransactions(); // Refresh the ledger
            addToast(`Dispute effectively resolved via Backend in favor of the ${releaseToFreelancer ? 'Freelancer' : 'Client'}.`, 'success');
            
        } catch (err) {
            console.error(err);
            addToast(err.message || 'Error occurred while resolving dispute.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (!user || user.role !== 'admin') {
        return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
            <Shield className="w-16 h-16 text-rose-500 mb-4 opacity-50" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-slate-600 dark:text-slate-400">You must be an administrator to view this page.</p>
        </div>
        );
    }

    if (loading) {
         return (
             <div className="flex justify-center items-center h-full min-h-[500px]">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
             </div>
         );
    }

    return (
        <div className="p-6 sm:p-10 max-w-6xl mx-auto min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight flex items-center gap-3">
                    <Shield className="w-10 h-10 text-indigo-600 dark:text-indigo-500" /> Admin Command Center
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-3 text-base">Monitor platform integrity and resolve active escrow contracts.</p>
            </div>

            {/* Top Navigation Tabs */}
            <div className="flex gap-4 mb-10 border-b border-slate-200 dark:border-slate-700 pb-px">
                <button 
                    onClick={() => setActiveTab('disputes')}
                    className={`pb-4 px-2 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === 'disputes' ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> ACTIVE DISPUTES
                        {jobs.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{jobs.length}</span>}
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('ledger')}
                    className={`pb-4 px-2 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === 'ledger' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400' : 'text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" /> TRANSACTION LEDGER
                    </div>
                </button>
            </div>

            {activeTab === 'disputes' && (
                <>
                    {jobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-3xl text-center">
                            <CheckCircle className="w-16 h-16 text-emerald-500/50 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Active Disputes</h3>
                            <p className="text-slate-600 dark:text-slate-400">All contracts are running smoothly. No admin intervention required.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-4xl">
                            {jobs.map((job) => {
                                 const acceptedApp = job.applications && job.applications.length > 0 ? job.applications[0] : null;
                                 const freelancer = acceptedApp ? acceptedApp.freelancer : null;
                                 const dispute = job.dispute;

                                 return (
                                     <div key={job.id} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:border-indigo-200 dark:hover:border-slate-600 transition-colors">
                                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-start gap-4">
                                             <div>
                                                 <div className="flex items-center gap-3 mb-2">
                                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">{job.title}</h3>
                                                 </div>
                                                 <p className="text-slate-500 dark:text-slate-400 text-sm">Gig #{job.id} • Budget: <span className="text-emerald-500 dark:text-emerald-400 font-bold">${job.budget}</span></p>
                                             </div>
                                        </div>
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Client</h4>
                                                <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                                    <p className="text-slate-900 dark:text-white font-bold">{job.client?.name}</p>
                                                    <p className="text-slate-600 dark:text-slate-400 text-sm">{job.client?.email}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Freelancer</h4>
                                                <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                                    {freelancer ? (
                                                        <>
                                                         <p className="text-slate-900 dark:text-white font-bold">{freelancer.name}</p>
                                                         <p className="text-slate-600 dark:text-slate-400 text-sm">{freelancer.email}</p>
                                                         <p className="text-slate-500 text-xs mt-1 truncate" title={freelancer.wallet_address}>Wallet: {freelancer.wallet_address}</p>
                                                        </>
                                                    ) : (
                                                        <p className="text-rose-500 dark:text-rose-400 text-sm italic">Freelancer data missing</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {dispute && (
                                            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                                                <h4 className="flex items-center gap-2 text-rose-500 dark:text-rose-400 font-bold mb-2">
                                                    <AlertOctagon className="w-5 h-5"/> Dispute Evidence
                                                </h4>
                                                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                                    <p className="text-slate-700 dark:text-slate-300 italic text-sm">"{dispute.reason}"</p>
                                                    <p className="text-right text-xs text-slate-500 mt-2">- Submitted by {dispute.initiator?.name}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="p-6 bg-white dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Admin Ruling / Rationale</label>
                                            <textarea 
                                               value={adminNotes[job.id] || ''}
                                               onChange={(e) => handleNoteChange(job.id, e.target.value)}
                                               placeholder="Explain your final decision before resolving..."
                                               className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                               rows={2}
                                            />
                                        </div>

                                        <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                                             <button 
                                                onClick={() => handleResolve(job.id, false)}
                                                disabled={actionLoading}
                                                className="flex-1 bg-amber-100 dark:bg-amber-600/20 hover:bg-amber-200 dark:hover:bg-amber-600/40 text-amber-600 dark:text-amber-500 border border-amber-300 dark:border-amber-500/30 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                             >
                                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />} Refund Client
                                             </button>
                                             <button 
                                                onClick={() => handleResolve(job.id, true)}
                                                disabled={actionLoading}
                                                className="flex-1 bg-emerald-100 dark:bg-emerald-600/20 hover:bg-emerald-200 dark:hover:bg-emerald-600/40 text-emerald-600 dark:text-emerald-500 border border-emerald-300 dark:border-emerald-500/30 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                             >
                                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />} Release to Freelancer
                                             </button>
                                        </div>
                                    </div>
                                 );
                            })}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'ledger' && (
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Complete Transaction History</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Immutable ledger of all Web3 financial events across the FreelanceX platform.</p>
                        </div>
                    </div>
                    {transactions.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            No financial transactions have occurred on the platform yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                                <thead className="bg-slate-100/80 dark:bg-[#1e293b]/80 text-xs uppercase text-slate-500 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Time</th>
                                        <th className="px-6 py-4 font-bold">Event Type</th>
                                        <th className="px-6 py-4 font-bold">Job / Project</th>
                                        <th className="px-6 py-4 font-bold">Actor</th>
                                        <th className="px-6 py-4 font-bold text-right">Amount (ETH)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50 bg-white dark:bg-slate-800/30">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                                                {new Date(tx.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {tx.type === 'funded' && <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">LOCKED IN ESCROW</span>}
                                                {tx.type === 'released' && <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">FUNDS RELEASED</span>}
                                                {tx.type === 'refunded' && <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">FUNDS REFUNDED</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-slate-200">{tx.job?.title || `Job #${tx.job_id}`}</div>
                                                {tx.transaction_hash ? (
                                                    <div className="text-xs text-slate-500 mt-1 truncate max-w-[150px]" title={tx.transaction_hash}>
                                                        Tx: {tx.transaction_hash}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-500 mt-1">Relayed via Frontend Web3</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-slate-800 dark:text-slate-300">{tx.actor?.name || 'Unknown'}</div>
                                                <div className="text-xs text-slate-500 capitalize">{tx.actor?.role}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-extrabold text-slate-900 dark:text-white">
                                                {parseFloat(tx.amount).toFixed(4)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
