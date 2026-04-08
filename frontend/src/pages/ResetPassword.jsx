import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Lock, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically handle the actual password reset logic
        // Following successful reset, user is routed to login
        navigate('/login');
    };

    return (
        <AuthLayout title="Reset Password" subtitle="">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="New Password"
                        className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3ce6] focus:border-transparent transition-all shadow-sm"
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
                        className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3ce6] focus:border-transparent transition-all shadow-sm"
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
                    <button type="submit" className="w-full bg-[#4c3ce6] hover:bg-[#3b2ecc] text-white font-medium py-3.5 rounded-lg shadow-lg shadow-indigo-500/30 transition-all text-lg">
                        Reset Password
                    </button>
                </div>
            </form>

            <p className="mt-8 text-center text-slate-500 text-sm">
                <Link to="/login" className="text-[#4c3ce6] hover:text-indigo-800 font-medium ml-1">Back to Log in</Link>
            </p>
        </AuthLayout>
    );
};

export default ResetPassword;
