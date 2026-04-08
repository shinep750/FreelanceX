import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, CreditCard, AlignLeft, Send, Loader2, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

const PostJob = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        deadline: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to post job');
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/client-gigs');
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0b0f19] relative overflow-hidden font-sans pb-24 pt-8 transition-colors duration-200">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-[20%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl relative z-10"
            >
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600 dark:from-indigo-400 dark:to-emerald-400 tracking-tight mb-3">
                        Post a New Gig
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Detailed postings attract the highest quality Web3 talent.</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl dark:shadow-2xl">
                    
                    {error && (
                        <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400">
                            <CheckCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">Gig Published Successfully! Redirecting to Dashboard...</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Gig Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Build a staking smart contract"
                                className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <AlignLeft className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Description & Requirements
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="6"
                                placeholder="List the core features, tech stack needed, and expected timeline..."
                                className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none leading-relaxed"
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Escrow Budget (USD)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-emerald-600 dark:text-emerald-500 font-bold">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    required
                                    min="10"
                                    step="1"
                                    placeholder="5000"
                                    className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl pl-8 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Deadline <span className="text-slate-500 text-xs italic ml-1">(Optional)</span>
                            </label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium text-lg [color-scheme:light] dark:[color-scheme:dark]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-14 mt-4 rounded-xl font-bold tracking-wide transition-all duration-300 flex justify-center items-center gap-2 ${
                                loading || success 
                                    ? 'bg-indigo-600/50 text-white cursor-wait opacity-80'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-[0.98]'
                            }`}
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Publishing to network...</>
                            ) : success ? (
                                <><CheckCircle className="w-5 h-5" /> Live!</>
                            ) : (
                                <>Publish Gig to Marketplace <Send className="w-4 h-4 ml-1" /></>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default PostJob;
