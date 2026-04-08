import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Code2, FolderOpen, Briefcase,
    Upload, Plus, Trash2, Wallet, Camera,
    ChevronDown, Link as LinkIcon, Check, X, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProvider } from '../utils/ethereum';

const DOMAINS = [
    "Blockchain Developer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "Smart Contract Auditor",
    "DevOps Engineer",
    "Product Manager"
];

// Navigation Items
const NAV_ITEMS = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'skills', label: 'Skills & Pricing', icon: Code2 },
    { id: 'portfolio', label: 'Portfolio & CV', icon: FolderOpen },
    { id: 'experience', label: 'Work Experience', icon: Briefcase }
];

const FreelancerProfile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token, user, updateUser } = useAuth();
    const { addToast } = useToast();
    const [activeSection, setActiveSection] = useState('personal');

    // Refs for scrolling to sections
    const personalRef = useRef(null);
    const skillsRef = useRef(null);
    const portfolioRef = useRef(null);
    const experienceRef = useRef(null);

    const domainRef = useRef(null);
    const [isDomainOpen, setIsDomainOpen] = useState(false);
    const [isConnectingWallet, setIsConnectingWallet] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        domain: DOMAINS[0],
        location: '',
        languages: '',
        bio: '',
        experienceLevel: 'Beginner',
        hourlyRate: '',
        walletAddress: user?.wallet_address || '',
        skills: ['Solidity', 'Web3'],
        experience: [],
        portfolio: [],
        cvFile: null
    });

    const [skillInput, setSkillInput] = useState('');

    const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    // Restore form data and handle returned wallet address from Connect Wallet page
    useEffect(() => {
        if (location.state) {
            if (location.state.formData) {
                setFormData(prev => ({
                    ...location.state.formData,
                    walletAddress: location.state.walletAddress || location.state.formData.walletAddress || prev.walletAddress
                }));
            } else if (location.state.walletAddress) {
                updateField('walletAddress', location.state.walletAddress);
            }
            // Clear location state to prevent reapplying stale data on hot reloads
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Fast-sync user context data into form if it arrives after render
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                walletAddress: prev.walletAddress || user.wallet_address || '',
                fullName: prev.fullName || user.name || ''
            }));
        }
    }, [user]);

    // Tab layout does not require intersection observers

    // Outside click for domain dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (domainRef.current && !domainRef.current.contains(e.target)) setIsDomainOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const scrollToSection = (id) => {
        setActiveSection(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Dynamic Handlers ---
    const addSkill = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            e.preventDefault();
            const trimmed = skillInput.trim();
            if (trimmed && !formData.skills.includes(trimmed)) updateField('skills', [...formData.skills, trimmed]);
            setSkillInput('');
        }
    };
    const removeSkill = (sk) => updateField('skills', formData.skills.filter(s => s !== sk));

    const addPortfolio = () => updateField('portfolio', [...formData.portfolio, { id: Date.now(), title: '', link: '', type: '' }]);
    const removePortfolio = (id) => updateField('portfolio', formData.portfolio.filter(p => p.id !== id));
    const updatePortfolio = (id, f, v) => updateField('portfolio', formData.portfolio.map(p => p.id === id ? { ...p, [f]: v } : p));

    const addExperience = () => updateField('experience', [...formData.experience, { id: Date.now(), company: '', role: '', period: '', description: '' }]);
    const removeExperience = (id) => updateField('experience', formData.experience.filter(e => e.id !== id));
    const updateExperience = (id, f, v) => updateField('experience', formData.experience.map(e => e.id === id ? { ...e, [f]: v } : e));

    const handleCVUpload = (e) => { if (e.target.files[0]) updateField('cvFile', e.target.files[0]); };

    const connectWallet = async () => {
        setIsConnectingWallet(true);
        try {
            const provider = getProvider();
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            updateField('walletAddress', address);
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            addToast("Failed to connect: " + (error.message || "Make sure you have MetaMask installed."), 'error');
        } finally {
            setIsConnectingWallet(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to update profile');
            }

            // Sync updated core fields to global Auth context without requiring a hard refresh
            if (updateUser) {
                updateUser({ 
                    name: formData.fullName, 
                    wallet_address: formData.walletAddress 
                });
            }

            console.log("Profile successfully submitted");
            addToast("Profile completed successfully!", 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving profile:', error);
            addToast('Failed to save profile: ' + error.message, 'error');
        }
    };

    const handleValidationAndSubmit = (e) => {
        const missing = [];
        if (!formData.fullName || typeof formData.fullName !== 'string' || !formData.fullName.trim()) {
            missing.push("Full Name (Personal Details tab)");
        }
        if (!formData.hourlyRate) missing.push("Hourly Rate (Skills & Pricing tab)");
        if (!formData.walletAddress) missing.push("Web3 Wallet Connection");

        if (missing.length > 0) {
            addToast(`Missing required fields: ${missing.join(', ')}`, 'warning');
            return;
        }
        
        handleSubmit(e);
    };

    // Only require essential fields to complete profile
    const isProfileComplete = 
        formData.fullName.trim() !== '' && 
        formData.walletAddress !== '' && 
        formData.hourlyRate !== '';

    return (
        <div className="min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden relative bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-200">
            {/* Ambient Background Glows */}
            <div className="fixed top-[-10%] right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

            {/* Main Centered Layout */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-40 flex flex-col items-center">

                {/* Profile Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4">Complete Your Profile</h1>
                    <p className="text-slate-600 dark:text-slate-400">Join the top 1% of Web3 talent. Let clients know what you can do.</p>
                </div>

                {/* Sleek Horizontal Progress Wizard Tracker */}
                <div className="w-full mb-12 relative flex justify-between">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full z-0"></div>
                    {NAV_ITEMS.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        const isPast = NAV_ITEMS.findIndex(i => i.id === activeSection) > index;
                        
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => scrollToSection(item.id)}
                                className="relative z-10 flex flex-col items-center gap-3 group"
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                    isActive 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110' 
                                    : isPast 
                                        ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-500/30' 
                                        : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                                }`}>
                                    {isPast ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${isActive ? 'text-indigo-600 dark:text-indigo-400' : isPast ? 'text-indigo-500 dark:text-indigo-300' : 'text-slate-500'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="w-full min-h-[500px] relative">
                    <AnimatePresence mode="wait">
                        {activeSection === 'personal' && (
                            <motion.section
                                key="personal"
                                id="personal" 
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-slate-900/50 rounded-2xl p-6 lg:p-8 relative overflow-hidden"
                            >
                        {/* Decorative corner glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full"></div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <User className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Personal Details</h2>
                            </div>

                            <div className="flex flex-col md:flex-row gap-10">
                                {/* Modern Avatar Uploader */}
                                <div className="flex flex-col items-center gap-4 shrink-0">
                                    <div className="relative group w-36 h-36 rounded-full p-2 bg-gradient-to-tr from-indigo-200 to-blue-100 shadow-inner">
                                        <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative transition-transform duration-300 group-hover:scale-[0.98]">
                                            <Camera className="w-8 h-8 text-indigo-400 dark:text-indigo-300 transition-colors group-hover:text-indigo-500 text-center m-auto mt-[52px]" />
                                            <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 cursor-pointer">
                                                <span className="text-white text-xs font-bold tracking-wider">UPLOAD</span>
                                            </div>
                                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                        </div>
                                    </div>
                                </div>

                            <div className="flex-1 space-y-6 w-full">
                                {/* Floating Label Input Pattern */}
                                <div className="relative group">
                                    <input type="text" id="fullName" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)}
                                        className="w-full px-5 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all peer placeholder-transparent shadow-sm"
                                        placeholder="Full Name" required
                                    />
                                    <label htmlFor="fullName" className="absolute left-5 -top-2.5 bg-white dark:bg-[#1e293b] px-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 dark:peer-placeholder-shown:text-slate-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white dark:peer-focus:bg-[#1e293b] cursor-text">
                                        Full Name
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative" ref={domainRef}>
                                        <button type="button" onClick={() => setIsDomainOpen(!isDomainOpen)} className="w-full px-5 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white flex items-center justify-between text-left focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm">
                                            <span className="font-medium">{formData.domain}</span>
                                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDomainOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <label className="absolute left-5 -top-2.5 bg-white dark:bg-[#1e293b] px-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">Primary Role</label>

                                        <AnimatePresence>
                                            {isDomainOpen && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-[calc(100%+8px)] left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-900/10 border border-slate-200 dark:border-slate-800 py-2 z-30">
                                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                        {DOMAINS.map((d) => (
                                                            <button key={d} type="button" onClick={() => { updateField('domain', d); setIsDomainOpen(false); }} className="w-full text-left px-5 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-between font-medium transition-colors">
                                                                {d} {formData.domain === d && <Check className="w-5 h-5 text-indigo-600 border-indigo-600" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="relative group">
                                        <input type="text" id="location" value={formData.location} onChange={(e) => updateField('location', e.target.value)}
                                            className="w-full px-5 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all peer placeholder-transparent shadow-sm"
                                            placeholder="Location"
                                        />
                                        <label htmlFor="location" className="absolute left-5 -top-2.5 bg-white dark:bg-[#1e293b] px-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 dark:peer-placeholder-shown:text-slate-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white dark:peer-focus:bg-[#1e293b] cursor-text">
                                            Location (e.g. Remote)
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="relative group">
                                        <input type="text" id="languages" value={formData.languages} onChange={(e) => updateField('languages', e.target.value)}
                                            className="w-full px-5 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all peer placeholder-transparent shadow-sm"
                                            placeholder="Languages"
                                        />
                                        <label htmlFor="languages" className="absolute left-5 -top-2.5 bg-white dark:bg-[#1e293b] px-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 dark:peer-placeholder-shown:text-slate-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white dark:peer-focus:bg-[#1e293b] cursor-text">
                                            Languages (e.g. English, Spanish)
                                        </label>
                                    </div>
                                </div>

                                <div className="relative group mt-8">
                                    <textarea id="bio" rows={4} value={formData.bio} onChange={(e) => updateField('bio', e.target.value)}
                                        className="w-full px-5 py-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all peer placeholder-transparent shadow-sm resize-none leading-relaxed"
                                        placeholder="Bio"
                                    ></textarea>
                                    <label htmlFor="bio" className="absolute left-5 -top-2.5 bg-white dark:bg-[#1e293b] px-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-slate-500 dark:peer-placeholder-shown:text-slate-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white dark:peer-focus:bg-[#1e293b] cursor-text">
                                        Professional Overview
                                    </label>
                                </div>
                            </div>
                        </div>
                                <div className="mt-10 flex justify-end">
                                    <button type="button" onClick={() => scrollToSection('skills')} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-2">
                                        Next: Skills & Pricing <span className="text-xl leading-none">→</span>
                                    </button>
                                </div>
                            </motion.section>
                        )}

                        {activeSection === 'skills' && (
                            <motion.section 
                                key="skills"
                                id="skills" 
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-slate-900/50 rounded-2xl p-6 lg:p-8 relative overflow-hidden"
                            >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Code2 className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Skills & Pricing</h2>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Core Competencies</label>
                                <div className="flex flex-wrap gap-2.5 mb-4">
                                    <AnimatePresence>
                                        {formData.skills.map(skill => (
                                            <motion.span
                                                key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                                className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold shadow-sm overflow-hidden group border border-slate-200 dark:border-transparent"
                                            >
                                                {skill}
                                                <button type="button" onClick={() => removeSkill(skill)} className="ml-3 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors bg-black/5 dark:bg-white/10 rounded-full p-0.5">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </motion.span>
                                        ))}
                                    </AnimatePresence>
                                </div>
                                <div className="flex gap-3 relative">
                                    <input type="text" placeholder="Type a skill and press Enter..." value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={addSkill}
                                        className="flex-1 px-5 py-3.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium placeholder-slate-400"
                                    />
                                    <button type="button" onClick={addSkill} className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors">
                                        Add Skill
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Experience Level</label>
                                <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl shadow-inner border border-slate-200 dark:border-transparent">
                                    {['Beginner', 'Intermediate', 'Expert'].map((level) => {
                                        const isActive = formData.experienceLevel === level;
                                        return (
                                            <label key={level} className={`flex-1 text-center py-3 rounded-xl cursor-pointer transition-all duration-300 relative ${isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                                {isActive && <motion.div layoutId="levelBg" className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50" />}
                                                <span className="relative z-10">{level}</span>
                                                <input type="radio" name="experience" value={level} checked={isActive} onChange={() => updateField('experienceLevel', level)} className="sr-only" />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Hourly Rate</label>
                                <div className="relative flex items-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all overflow-hidden h-[52px]">
                                    <div className="px-5 h-full flex items-center bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                        $ USD
                                    </div>
                                    <input type="number" placeholder="120" value={formData.hourlyRate} onChange={(e) => updateField('hourlyRate', e.target.value)}
                                        className="w-full h-full px-4 bg-transparent border-none focus:outline-none text-slate-900 dark:text-white font-bold text-lg placeholder-slate-400 dark:placeholder-slate-300"
                                    />
                                    <span className="pr-5 text-slate-500 dark:text-slate-400 font-medium">/ hr</span>
                                </div>
                            </div>
                        </div>
                                <div className="mt-10 flex justify-between items-center">
                                    <button type="button" onClick={() => scrollToSection('personal')} className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95">
                                        <span className="text-xl leading-none">←</span> Back
                                    </button>
                                    <button type="button" onClick={() => scrollToSection('portfolio')} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-2">
                                        Next: Portfolio & CV <span className="text-xl leading-none">→</span>
                                    </button>
                                </div>
                            </motion.section>
                        )}

                        {activeSection === 'portfolio' && (
                            <motion.section 
                                key="portfolio"
                                id="portfolio" 
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-slate-900/50 rounded-2xl p-6 lg:p-8 relative overflow-hidden"
                            >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                                    <FolderOpen className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio & CV</h2>
                            </div>
                            <button type="button" onClick={addPortfolio} className="flex items-center gap-2 group px-4 py-2 bg-white dark:bg-slate-900 hover:bg-indigo-100 dark:hover:bg-indigo-600 text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-white rounded-xl font-semibold transition-colors shadow-sm border border-slate-200 dark:border-transparent">
                                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> Add Project
                            </button>
                        </div>

                        {/* Stunning CV Drop Zone */}
                        <div className="mb-10">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Upload Resume (PDF)</label>
                            <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-3xl cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-indigo-400 transition-all overflow-hidden group">
                                <div className="absolute inset-0 bg-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                                    <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-slate-100 dark:border-none">
                                        <Upload className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-600">
                                        {formData.cvFile ? <span className="text-indigo-600">{formData.cvFile.name}</span> : "Drag & Drop or click to browse"}
                                    </p>
                                </div>
                                <input type="file" className="hidden" accept=".pdf" onChange={handleCVUpload} />
                            </label>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence>
                                {formData.portfolio.length === 0 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 border-dashed rounded-3xl">
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">No projects added. Showcase your best work!</p>
                                    </motion.div>
                                )}
                                {formData.portfolio.map((item, index) => (
                                    <motion.div
                                        key={item.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 relative group hover:border-indigo-300 dark:hover:border-indigo-200 transition-colors shadow-sm"
                                    >
                                        <button type="button" onClick={() => removePortfolio(item.id)} className="absolute top-6 right-6 text-slate-400 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-500 transition-colors bg-slate-100 dark:bg-slate-800/50 hover:bg-rose-100 dark:hover:bg-rose-500/10 p-2 rounded-xl">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-300">Project Details</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="relative">
                                                <input type="text" placeholder="Project Title" value={item.title} onChange={(e) => updatePortfolio(item.id, 'title', e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400" />
                                            </div>
                                            <div className="relative">
                                                <input type="text" placeholder="Category Type (e.g. Audit, UI)" value={item.type} onChange={(e) => updatePortfolio(item.id, 'type', e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400" />
                                            </div>
                                            <div className="md:col-span-2 relative flex items-center">
                                                <div className="absolute left-4 text-slate-400"><LinkIcon className="w-5 h-5" /></div>
                                                <input type="url" placeholder="URL Link (https://)" value={item.link} onChange={(e) => updatePortfolio(item.id, 'link', e.target.value)} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                                <div className="mt-10 flex justify-between items-center">
                                    <button type="button" onClick={() => scrollToSection('skills')} className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95">
                                        <span className="text-xl leading-none">←</span> Back
                                    </button>
                                    <button type="button" onClick={() => scrollToSection('experience')} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-2">
                                        Next: Work Experience <span className="text-xl leading-none">→</span>
                                    </button>
                                </div>
                            </motion.section>
                        )}

                        {activeSection === 'experience' && (
                            <motion.section 
                                key="experience"
                                id="experience" 
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-slate-900/50 rounded-2xl p-6 lg:p-8 relative overflow-hidden"
                            >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Work Experience</h2>
                            </div>
                            <button type="button" onClick={addExperience} className="flex items-center gap-2 group px-4 py-2 bg-white dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-amber-600 text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-white rounded-xl font-semibold transition-colors shadow-sm border border-slate-200 dark:border-transparent">
                                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> Add Role
                            </button>
                        </div>

                        <div className="space-y-6">
                            <AnimatePresence>
                                {formData.experience.length === 0 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 border-dashed rounded-3xl">
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Add past roles to increase client trust.</p>
                                    </motion.div>
                                )}
                                {formData.experience.map((exp) => (
                                    <motion.div
                                        key={exp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 relative flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="hidden md:flex flex-col items-center shrink-0 w-16 overflow-hidden relative pt-2">
                                            <div className="w-4 h-4 rounded-full bg-amber-400 border-4 border-amber-100 z-10"></div>
                                            <div className="absolute top-6 bottom-[-100px] w-0.5 bg-slate-200 dark:bg-slate-700 text-amber-500 dark:text-amber-100"></div>
                                        </div>

                                        <div className="flex-1 space-y-5">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Role Information</h4>
                                                <button type="button" onClick={() => removeExperience(exp.id)} className="text-slate-400 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-500 transition-colors bg-slate-100 dark:bg-slate-800/50 hover:bg-rose-100 dark:hover:bg-rose-500/10 p-2 rounded-xl">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <input type="text" placeholder="Company / Protocol Name" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all font-medium placeholder-slate-400" />
                                                <input type="text" placeholder="Job Title" value={exp.role} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all font-medium placeholder-slate-400" />
                                                <div className="md:col-span-2">
                                                    <input type="text" placeholder="Time Period (e.g. 2021 - Present)" value={exp.period} onChange={(e) => updateExperience(exp.id, 'period', e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all font-medium placeholder-slate-400" />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <textarea rows={3} placeholder="What were your key responsibilities and achievements?" value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all resize-none font-medium placeholder-slate-400"></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                                <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <button type="button" onClick={() => scrollToSection('portfolio')} className="w-full md:w-auto px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95">
                                        <span className="text-xl leading-none">←</span> Back
                                    </button>

                                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                        <button type="button" onClick={connectWallet} disabled={isConnectingWallet} className={`px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${formData.walletAddress ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-white shadow-sm border border-slate-200 dark:border-transparent'}`}>
                                            {isConnectingWallet ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className={`w-5 h-5 ${formData.walletAddress ? 'text-emerald-500' : 'text-slate-400'}`} />}
                                            {formData.walletAddress ? `Connected: ${formData.walletAddress.substring(0, 6)}...${formData.walletAddress.substring(38)}` : (isConnectingWallet ? "Connecting..." : "Connect Web3 Wallet")}
                                        </button>
                                        
                                        <button type="button" onClick={handleValidationAndSubmit} className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2">
                                            Complete Profile
                                        </button>
                                    </div>
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>
                </div>
            </div >
        </div >
    );
};

export default FreelancerProfile;
