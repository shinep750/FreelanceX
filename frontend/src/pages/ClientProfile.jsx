import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Loader2, Building2, Briefcase, MapPin, Globe, CreditCard, ChevronDown, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClientProfile = () => {
    const { token, user, updateUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        companyName: '',
        companyDescription: '',
        industry: '',
        location: '',
        budgetRange: '',
        hiringPreference: 'Freelancer',
        website: ''
    });

    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.profile) {
                        setIsUpdating(true); // Existing profile
                        setFormData({
                            fullName: data.user.name || '',
                            email: data.user.email || '',
                            companyName: data.profile.company_name || '',
                            companyDescription: data.profile.company_description || '',
                            industry: data.profile.industry || '',
                            location: data.profile.location || '',
                            budgetRange: data.profile.budget_range || '',
                            hiringPreference: data.profile.hiring_preference || 'Freelancer',
                            website: data.profile.website || ''
                        });
                        if (data.profile.profile_image) {
                            setImagePreview(`${import.meta.env.VITE_BASE_URL}${data.profile.profile_image}`);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load existing profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const submitData = new FormData();
            
            // Append all text fields
            Object.keys(formData).forEach(key => {
                if (key !== 'email') submitData.append(key, formData[key]);
            });

            // Append file if exists
            if (profileImage) {
                submitData.append('profileImage', profileImage);
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type to application/json, browser sets multipart boundary automatically
                },
                body: submitData
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Failed to update profile');

            setSuccess(isUpdating ? 'Profile updated successfully!' : 'Profile created successfully!');
            setIsUpdating(true);
            
            // Refresh global auth context to unlock dashboard and sync the sidebar name instantly
            if (updateUser) {
                updateUser({ 
                    hasProfile: true,
                    name: formData.fullName 
                });
            }

            // Only redirect if they are physically setting it up for the first time
            if (!user.hasProfile) {
                setTimeout(() => navigate('/dashboard'), 1500);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[500px]">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-full flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0b0f19] relative overflow-hidden font-sans pb-24 top-0 transition-colors duration-200">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl mb-4 shadow-[0_0_30px_rgba(99,102,241,0.2)] text-indigo-500 dark:text-indigo-400">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                        Client Setup
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Complete your company profile to start posting Web3 gigs.</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl dark:shadow-2xl relative overflow-hidden">
                    
                    {error && (
                        <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="font-medium text-sm">{error}</p>
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400">
                            <CheckCircle className="w-5 h-5 shrink-0" />
                            <p className="font-medium text-sm">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        
                        {/* 1. Profile Photo Upload */}
                        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8 border-b border-slate-200 dark:border-slate-800 pb-10">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center shadow-xl">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="w-12 h-12 text-slate-400 dark:text-slate-600" />
                                    )}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-slate-900 shadow-lg hover:bg-indigo-500 transition-colors group-hover:scale-110 active:scale-95"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageChange} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
                            </div>
                            <div className="text-center sm:text-left flex-1 mt-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Company Avatar</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Upload a logo or profile image. JPG, PNG or WebP accepted (max. 5MB).</p>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                                >
                                    Choose another file...
                                </button>
                            </div>
                        </div>

                        {/* 2. Basic Info Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-400 ml-1">Full Name</label>
                                    <input
                                        type="text" name="fullName"
                                        value={formData.fullName} onChange={handleChange} required
                                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-400 ml-1">Email <span className="text-slate-500 dark:text-slate-600">(Readonly)</span></label>
                                    <input
                                        type="email" value={formData.email} readOnly disabled
                                        className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 rounded-xl px-4 py-3.5 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Company Info Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Company Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-400 ml-1">Company Name</label>
                                    <input
                                        type="text" name="companyName"
                                        value={formData.companyName} onChange={handleChange} required
                                        placeholder="e.g. MetaBlock Inc."
                                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-400 ml-1">Industry</label>
                                    <div className="relative">
                                        <select
                                            name="industry" value={formData.industry} onChange={handleChange} required
                                            className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                        >
                                            <option value="" disabled>Select Industry</option>
                                            <option value="DeFi">DeFi</option>
                                            <option value="NFTs">NFTs</option>
                                            <option value="GameFi">GameFi</option>
                                            <option value="DAOs">DAOs</option>
                                            <option value="Infrastructure">Infrastructure</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-400 ml-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Headquarters / Timezone</label>
                                    <input
                                        type="text" name="location"
                                        value={formData.location} onChange={handleChange}
                                        placeholder="e.g. Remote (EST)"
                                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-400 ml-1 flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Website <span className="opacity-50">(Optional)</span></label>
                                    <input
                                        type="url" name="website"
                                        value={formData.website} onChange={handleChange}
                                        placeholder="https://"
                                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-400 ml-1">Company Description</label>
                                <textarea
                                    name="companyDescription" value={formData.companyDescription} onChange={handleChange} required rows="4"
                                    placeholder="Describe what your company builds..."
                                    className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
                                ></textarea>
                            </div>
                        </div>

                        {/* 4. Hiring Preferences Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Hiring Info
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-400 ml-1">Typical Budget Range</label>
                                    <div className="relative">
                                        <select
                                            name="budgetRange" value={formData.budgetRange} onChange={handleChange}
                                            className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                        >
                                            <option value="" disabled>Select Budget Range</option>
                                            <option value="$1k - $5k">$1k - $5k</option>
                                            <option value="$5k - $10k">$5k - $10k</option>
                                            <option value="$10k - $50k">$10k - $50k</option>
                                            <option value="$50k+">$50k+</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-400 ml-1">Hiring Preference</label>
                                    <div className="relative">
                                        <select
                                            name="hiringPreference" value={formData.hiringPreference} onChange={handleChange}
                                            className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                        >
                                            <option value="Freelancer">Individual Freelancers</option>
                                            <option value="Agency">Web3 Agencies</option>
                                            <option value="Both">Both</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full h-14 rounded-xl font-bold tracking-wide transition-all duration-300 flex justify-center items-center gap-2 ${
                                    saving || success 
                                        ? 'bg-indigo-600/50 text-white cursor-wait'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] active:scale-[0.98]'
                                }`}
                            >
                                {saving ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving Configuration...</>
                                ) : (
                                    <><Save className="w-5 h-5" /> {isUpdating ? 'Update Profile' : 'Save Profile & Continue'}</>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ClientProfile;
