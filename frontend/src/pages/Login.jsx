import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login, user, token } = useAuth();
    const navigate = useNavigate();

    // Prevent authed users from seeing login again
    useEffect(() => {
        if (user || token) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to log in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Login" subtitle="Welcome back! Sign in to continue">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{error}</div>}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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

                <div className="flex justify-end mt-1">
                    <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Forgot password?</Link>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-[52px] flex items-center justify-center bg-[#4f46e5] hover:bg-[#4338ca] text-white font-medium py-3.5 rounded-lg shadow-lg shadow-indigo-500/30 transition-all text-lg mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : 'Log In'}
                </button>
            </form>

            <div className="mt-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-500">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center gap-4">
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
            </div>

            <p className="mt-8 text-center text-slate-500 text-sm">
                Don't have an account? <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold ml-1">Sign Up →</Link>
            </p>
        </AuthLayout>
    );
};

export default Login;
