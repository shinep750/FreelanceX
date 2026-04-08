import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
    const { user } = useAuth();
    
    return (
        <div className="relative min-h-screen bg-[#f4f6fc] overflow-hidden flex flex-col md:flex-row font-sans">
            <Navbar />

            {/* Left Side (White/Light area) - Text Area */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-20 lg:px-32 pt-24 pb-16 z-10 relative h-screen">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-[2.5rem] sm:text-[3rem] lg:text-[3.5rem] xl:text-[4rem] font-semibold text-slate-700 leading-[1.15] mb-6"
                >
                    Unlock your<br />
                    freelancing potential.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-lg md:text-xl text-slate-400 mb-8 max-w-[22rem] font-light leading-relaxed"
                >
                    Secure. Transparent. Built for modern<br className="hidden md:block" /> professionals.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    {user ? (
                        <Link to="/dashboard" className="inline-block bg-[#4c3ce6] hover:bg-[#3b2ecc] text-white font-medium py-3 px-8 rounded-lg shadow-lg shadow-indigo-500/20 transition-all text-lg tracking-wide mb-4">
                            Enter Dashboard
                        </Link>
                    ) : (
                        <Link to="/signup" className="inline-block bg-[#4c3ce6] hover:bg-[#3b2ecc] text-white font-medium py-3 px-8 rounded-lg shadow-lg shadow-indigo-500/20 transition-all text-lg tracking-wide mb-4">
                            Get Started
                        </Link>
                    )}
                </motion.div>

                {!user && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-slate-500 text-sm font-light mt-2"
                    >
                        Already have an account? <Link to="/login" className="text-[#4c3ce6] hover:text-indigo-800 ml-1">Log in</Link>
                    </motion.div>
                )}
            </div>

            {/* Right Side (Purple Wave) */}
            <div className="hidden md:block absolute top-0 right-0 w-[60%] h-full z-0 overflow-hidden pointer-events-none">
                {/* SVG Curve perfectly matching the image */}
                <svg className="absolute inset-0 w-full h-full text-[#3b2de4]" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
                    <defs>
                        <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2e1065" />
                            <stop offset="30%" stopColor="#4338ca" />
                            <stop offset="70%" stopColor="#5b21b6" />
                            <stop offset="100%" stopColor="#312e81" />
                        </linearGradient>
                        <pattern id="noise" viewBox="0 0 200 200" width="20%" height="20%">
                            <filter id="n">
                                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                            </filter>
                            <rect width="100%" height="100%" filter="url(#n)" opacity="0.08" />
                        </pattern>
                    </defs>

                    {/* Replicated curve path from image */}
                    {/* Top center -> Bulge left -> Drop straight down -> Small inward curve -> Bottom left */}
                    <path d="M100 0 L40 0 C 15 0 5 25 10 50 C 15 75 35 85 15 100 L100 100 Z" fill="url(#hero-gradient)" />

                    {/* Noise texture overlay */}
                    <path d="M100 0 L40 0 C 15 0 5 25 10 50 C 15 75 35 85 15 100 L100 100 Z" fill="url(#noise)" style={{ mixBlendMode: 'overlay' }} />
                </svg>

                {/* Additional glow areas */}
                <div className="absolute top-0 right-0 w-full h-full">
                    <div className="absolute top-[20%] right-[10%] w-[30rem] h-[30rem] bg-indigo-500/40 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-[20%] left-[20%] w-[25rem] h-[25rem] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="absolute top-[5%] left-[30%] w-[20rem] h-[20rem] bg-[#3b2de4]/80 rounded-full blur-[80px] pointer-events-none"></div>
                </div>
            </div>

            {/* Right Side Text Content */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 pt-24 pb-16 z-10 relative h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                >
                    <h2 className="text-[3rem] sm:text-[3.5rem] lg:text-[4rem] font-semibold text-white leading-[1.2] mb-12 tracking-wide text-shadow-sm">
                        Begin.<br />
                        Belong.<br />
                        Become.
                    </h2>

                    <p className="text-indigo-100/80 text-lg md:text-xl font-light leading-relaxed max-w-[20rem]">
                        FreelanceX empowers secure,<br className="hidden lg:block" />
                        transparent freelancing powered<br className="hidden lg:block" />
                        by smart contracts.
                    </p>
                </motion.div>
            </div>

            {/* Mobile background (fallback since SVG is hidden on mobile) */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-br from-[#2e1065] via-[#4338ca] to-[#312e81] z-0 pointer-events-none rounded-t-[3rem]"></div>
        </div>
    );
};

export default Hero;
