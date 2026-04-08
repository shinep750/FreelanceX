import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Mail } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically handle sending the reset email
        // For now, we simulate success and move to the reset password page
        navigate('/reset-password');
    };

    return (
        <AuthLayout title="Forgot Password" subtitle="">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="email"
                        required
                        placeholder="Email"
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3ce6] focus:border-transparent transition-all shadow-sm"
                    />
                </div>

                <button type="submit" className="w-full bg-[#4c3ce6] hover:bg-[#3b2ecc] text-white font-medium py-3.5 rounded-lg shadow-lg shadow-indigo-500/30 transition-all text-lg mb-8">
                    Reset Password
                </button>
            </form>

            <p className="mt-8 text-center text-slate-500 text-sm">
                Remembered your password? <Link to="/login" className="text-[#4c3ce6] hover:text-indigo-800 font-medium ml-1">Log in</Link>
            </p>
        </AuthLayout>
    );
};

export default ForgotPassword;
