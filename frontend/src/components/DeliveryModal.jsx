import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Link as LinkIcon, AlertCircle, CheckCircle } from 'lucide-react';

const DeliveryModal = ({ isOpen, onClose, jobId, onSubmit, actionLoading }) => {
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!note.trim()) return;
        onSubmit(jobId, note);
        setNote('');
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
                    className="bg-white dark:bg-slate-800 border border-emerald-500/20 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden shadow-emerald-900/10 dark:shadow-emerald-900/20"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-500 dark:text-emerald-400">
                                <Send className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Deliver Work</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Delivery Link & Notes
                            </label>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mb-3 leading-relaxed">
                                Please provide a secure link to your completed deliverables (e.g. GitHub repository, Google Drive folder, Figma design) or specific instructions on how the client can access your work.
                            </p>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Paste your delivery link or note here..."
                                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[120px] resize-y placeholder-slate-400 dark:placeholder-slate-600 shadow-sm"
                                required
                            />
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3 mb-6">
                            <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed font-medium">
                                Submitting this form will automatically notify the client via the Job Chat system that your work is ready for their final review!
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={actionLoading || !note.trim()}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 text-sm"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" /> Submit Final Delivery
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DeliveryModal;
