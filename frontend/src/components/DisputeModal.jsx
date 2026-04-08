import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertOctagon, Loader2 } from 'lucide-react';

const DisputeModal = ({ isOpen, onClose, onSubmit, jobId, actionLoading }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) return;
        onSubmit(jobId, reason);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    ></motion.div>
                    
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-2xl shadow-rose-500/10 dark:shadow-rose-900/20 overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-rose-500 dark:text-rose-400">
                                <AlertOctagon className="w-6 h-6" /> Raise Dispute
                            </h2>
                            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                                Raising a dispute will permanently freeze the Escrow contract for this gig. An administrator will review your reasoning before deciding whether to refund the client or release funds to the freelancer.
                            </p>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Reason / Evidence Document
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Please provide a detailed explanation of why you are disputing this contract."
                                        rows={5}
                                        disabled={actionLoading}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none transition-all disabled:opacity-50"
                                        required
                                    ></textarea>
                                </div>
                                
                                <div className="flex justify-end gap-3 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={onClose}
                                        disabled={actionLoading}
                                        className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={actionLoading || !reason.trim()}
                                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {actionLoading ? <><Loader2 className="w-4 h-4 animate-spin"/> Freezing Funds...</> : 'Freeze Escrow'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DisputeModal;
