import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProvider } from '../utils/ethereum';

const ConnectWallet = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { token, user, updateUser } = useAuth();
  const [connectedAddress, setConnectedAddress] = useState(user?.wallet_address || null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const provider = getProvider();
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Save to backend permanently
      await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ walletAddress: address })
      });
      
      // Update local UI and global Context
      setConnectedAddress(address);
      if (updateUser) {
          updateUser({ wallet_address: address });
      }
    } catch (err) {
      console.error("Failed to link wallet:", err);
      setError(err.message || "An error occurred while connecting your wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background blobs for depth and beautiful aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-slate-200 dark:border-slate-700 p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30"
          >
            <Wallet className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Connect Wallet</h1>
          <p className="text-slate-600 dark:text-slate-400 text-center text-sm">
            Securely connect your web3 wallet to access FreelanceX and manage your earnings.
          </p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm text-center">
                {error}
            </div>
        )}

        {connectedAddress ? (
          <div className="space-y-4 mb-8">
            <div className="w-full flex flex-col items-center justify-center p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-emerald-400 font-bold mb-1">Wallet Linked Successfully</h3>
              <p className="text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                {connectedAddress}
              </p>
            </div>
            
            <button 
              onClick={() => {
                setConnectedAddress(null);
                if (updateUser) updateUser({ wallet_address: null });
              }} 
              className="w-full py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {/* MetaMask Option */}
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-6 h-6" />
                </div>
                <span className="text-slate-900 dark:text-white font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">MetaMask</span>
              </div>
              {isConnecting ? (
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
              )}
            </button>

            {/* WalletConnect Option */}
            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all group opacity-60 cursor-not-allowed shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                   <Wallet className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-slate-900 dark:text-white font-medium">WalletConnect</span>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">Coming Soon</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Secured by industry standard encryption</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ConnectWallet;
