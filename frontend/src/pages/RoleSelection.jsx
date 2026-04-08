import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Laptop, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RoleSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { register } = useAuth();

    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleContinue = async () => {
        if (selectedRole) {
            const userData = location.state;

            if (!userData || !userData.name || !userData.email || !userData.password) {
                setError('Missing user data. Please go back to the Sign Up page.');
                return;
            }

            try {
                setLoading(true);
                setError('');
                await register(userData.name, userData.email, userData.password, selectedRole);

                if (selectedRole === 'freelancer') {
                    navigate('/freelancer-profile');
                } else {
                    navigate('/client-profile');
                }
            } catch (err) {
                setError(err.message || 'Failed to register');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafe] flex flex-col items-center justify-center relative overflow-hidden font-sans">
            {/* Background elements (Soft Purple Gradient Curve) */}
            <div className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] z-0 rounded-tl-full opacity-60 mix-blend-multiply pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at bottom right, #a099ff 0%, #e0e7ff 50%, transparent 70%)',
                    filter: 'blur(60px)'
                }}
            ></div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-indigo-50/80 to-transparent z-0 pointer-events-none"></div>

            {/* Logo area */}
            <div className="absolute top-10 w-full flex justify-center z-10">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                        <Briefcase className="text-white w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold text-slate-700 tracking-tight ml-2">
                        Freelance<span className="text-indigo-500">X</span>
                    </span>
                </Link>
            </div>

            {/* Main Content Area */}
            <div className="z-10 w-full max-w-5xl px-6 flex flex-col items-center mt-12 md:mt-20">
                <h1 className="text-4xl text-slate-500 font-medium mb-12 tracking-wide text-center">
                    Select your role
                </h1>

                {/* Role Cards Container */}
                <div className="flex flex-col md:flex-row gap-8 lg:gap-14 w-full justify-center px-4 md:px-0">

                    {/* Freelancer Card */}
                    <button
                        onClick={() => setSelectedRole('freelancer')}
                        className={`group relative w-full md:w-[22rem] bg-white rounded-[2.5rem] p-8 md:p-12 pb-14 flex flex-col items-center text-center transition-all duration-300 ${selectedRole === 'freelancer'
                            ? 'shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] ring-2 ring-indigo-400/50 scale-[1.02] translate-y-[-4px]'
                            : 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_-10px_rgba(99,102,241,0.1)] hover:translate-y-[-2px]'
                            }`}
                        style={{ minHeight: '380px' }}
                    >
                        {/* Illustration Subtitution Area */}
                        <div className="w-full flex justify-center mb-8 relative">
                            {/* Decorative background elements replacing vector art */}
                            <div className="absolute -top-4 -left-2 w-16 h-12 bg-indigo-50 rounded-xl opacity-60 -rotate-6"></div>
                            <div className="absolute -bottom-2 -right-4 w-12 h-14 bg-indigo-100/50 rounded-lg opacity-80 rotate-12"></div>
                            <div className="w-28 h-28 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center relative z-10">
                                <Laptop className="w-12 h-12 text-indigo-500" strokeWidth={1.5} />
                            </div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-indigo-900/5 rounded-full blur-[2px]"></div>
                        </div>

                        <h3 className="text-[1.35rem] font-semibold text-slate-600 mb-3 tracking-wide">
                            I am a Freelancer
                        </h3>
                        <p className="text-slate-400 font-light text-[0.95rem]">
                            Find freelance work
                        </p>

                        {/* Selection Indicator Circle */}
                        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${selectedRole === 'freelancer'
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'border-slate-200 bg-white group-hover:border-indigo-200'
                            }`}>
                            {selectedRole === 'freelancer' && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>
                    </button>

                    {/* Client Card */}
                    <button
                        onClick={() => setSelectedRole('client')}
                        className={`group relative w-full md:w-[22rem] bg-white rounded-[2.5rem] p-8 md:p-12 pb-14 flex flex-col items-center text-center transition-all duration-300 ${selectedRole === 'client'
                            ? 'shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] ring-2 ring-indigo-400/50 scale-[1.02] translate-y-[-4px]'
                            : 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_-10px_rgba(99,102,241,0.1)] hover:translate-y-[-2px]'
                            }`}
                        style={{ minHeight: '380px' }}
                    >
                        {/* Illustration Subtitution Area */}
                        <div className="w-full flex justify-center mb-8 relative">
                            {/* Decorative background elements replacing vector art */}
                            <div className="absolute top-2 -right-2 w-14 h-16 bg-blue-50/80 rounded-xl opacity-70 rotate-6"></div>
                            <div className="absolute -bottom-4 -left-4 w-20 h-10 bg-indigo-50/60 rounded-lg opacity-80 -rotate-3"></div>

                            <div className="w-28 h-28 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full flex items-center justify-center relative z-10 border-[3px] border-white shadow-sm">
                                <svg className="w-12 h-12 text-indigo-500/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-indigo-900/5 rounded-full blur-[2px]"></div>
                        </div>

                        <h3 className="text-[1.35rem] font-semibold text-slate-600 mb-3 tracking-wide">
                            I am a Client
                        </h3>
                        <p className="text-slate-400 font-light text-[0.95rem]">
                            Hire top freelancers
                        </p>

                        {/* Selection Indicator Circle */}
                        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${selectedRole === 'client'
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'border-slate-200 bg-white group-hover:border-indigo-200'
                            }`}>
                            {selectedRole === 'client' && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>
                    </button>
                </div>

                {/* Continue Action Container */}
                <div className="mt-16 md:mt-24 flex flex-col items-center">
                    {error && <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg w-full max-w-sm text-center">{error}</div>}
                    <button
                        onClick={handleContinue}
                        disabled={!selectedRole || loading}
                        className={`min-w-[14rem] md:min-w-[16rem] py-3.5 flex justify-center items-center rounded-lg font-medium text-lg transition-all duration-300 ${(!selectedRole || loading) ? 'bg-[#e2e8f0] text-slate-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-y-[-2px]'}`}
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
