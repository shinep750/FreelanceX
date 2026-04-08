import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const SignUp = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Proceed to role selection, passing the user data
        navigate('/role-selection', { 
            state: { name, email, password } 
        });
    };

    return (
        <AuthLayout title="Sign Up" subtitle="">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        required
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="email"
                        required
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-400 hover:text-slate-600 focus:outline-none mr-2"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-slate-400 hover:text-slate-600 focus:outline-none mr-2"
                        >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button type="submit" className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-medium py-3.5 rounded-lg shadow-lg shadow-indigo-500/30 transition-all text-lg">
                        Continue to Role Selection
                    </button>
                </div>
            </form>

            <p className="mt-8 text-center text-slate-500 text-sm">
                Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold ml-1">Log in</Link>
            </p>

            <div className="mt-8 flex justify-center gap-4">
                {/* Social Login Buttons - Placeholder SVGs mimicking design */}
                <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                    <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                    <img src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" className="w-5 h-5" />
                </button>
            </div>
        </AuthLayout>
    );
};

export default SignUp;
