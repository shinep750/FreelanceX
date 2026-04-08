import React from 'react';
import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Left Side (White) - Form Area */}
            <div className="w-full md:w-1/2 flex flex-col relative z-10 p-8 md:p-16 lg:p-24 justify-center">
                {/* Logo */}
                <Link to="/" className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                        <Briefcase className="text-white w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold text-slate-800 tracking-tight ml-2">
                        Freelance<span className="text-slate-500">X</span>
                    </span>
                </Link>

                {/* Form Content */}
                <div className="w-full max-w-md mx-auto mt-16 md:mt-0">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">{title}</h1>
                    {subtitle && <p className="text-slate-500 mb-8">{subtitle}</p>}

                    {children}
                </div>
            </div>

            {/* Right Side (Purple) - Graphic Area */}
            <div className="hidden md:flex w-1/2 relative min-h-screen z-0 bg-[#3b2de4]">
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    {/* The wave curve overlaying the purple background to blend it with the white left side */}
                    <svg className="absolute left-0 top-0 h-full w-[20%] -ml-[1px] text-white" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0,0 L100,0 C40,20 100,50 60,100 L0,100 Z" />
                    </svg>

                    {/* Background Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2e1065] via-[#4338ca] to-[#312e81] opacity-90"></div>

                    {/* Soft Glowing Orbs */}
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-50 mix-blend-screen pointer-events-none"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-fuchsia-600 rounded-full blur-[120px] opacity-30 mix-blend-screen pointer-events-none"></div>
                </div>

                {/* Text Content */}
                <div className="absolute inset-0 flex flex-col justify-center px-16 lg:px-24 z-10">
                    <h2 className="text-5xl lg:text-5xl font-bold text-white leading-tight tracking-wide mb-8">
                        Secure.<br />
                        Transparent.<br />
                        Powerful.
                    </h2>
                    <p className="text-indigo-200 text-xl font-light">
                        — FreelanceX
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
