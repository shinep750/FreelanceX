import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const JobChatModal = ({ isOpen, onClose, jobId, receiverId, jobTitle }) => {
    const { token, user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom Function
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch Messages Function
    const fetchMessages = async () => {
        if (!isOpen || !jobId) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${jobId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial Fetch & Auto-Polling
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetchMessages();
            // Intelligent HTTP Polling every 3 seconds
            const intervalId = setInterval(fetchMessages, 3000);
            return () => clearInterval(intervalId);
        }
    }, [isOpen, jobId, token]);

    // Scroll to bottom whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Send Message Handler
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jobId,
                    receiverId,
                    content: newMessage.trim()
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Immediately append to UI for perceived speed
                setMessages(prev => [...prev, data.chat]);
                setNewMessage('');
                scrollToBottom();
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/60 rounded-3xl shadow-2xl w-full max-w-2xl h-[85vh] sm:h-[600px] flex flex-col overflow-hidden relative"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-slate-900 dark:text-white font-bold max-w-[200px] sm:max-w-md truncate">{jobTitle}</h3>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Live Chat
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50 dark:bg-slate-900/30">
                                {loading ? (
                                    <div className="h-full flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-500 animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-3">
                                        <MessageSquare className="w-12 h-12 opacity-50" />
                                        <p>No messages yet.<br/>Say hello to get the conversation started!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isMine = msg.sender_id === user.id;
                                        // Show name if it's not me, otherwise show nothing or 'You'
                                        return (
                                            <div key={msg.id || index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                                {!isMine && (
                                                    <span className="text-xs text-slate-500 mb-1 ml-1">{msg.sender?.name}</span>
                                                )}
                                                <div 
                                                    className={`max-w-[80%] px-5 py-3 rounded-2xl ${
                                                        isMine 
                                                            ? 'bg-indigo-600 text-white rounded-tr-sm shadow-[0_4px_15px_rgba(79,70,229,0.3)]' 
                                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-md'
                                                    }`}
                                                >
                                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                                </div>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-600 mt-1 mx-1 font-medium">
                                                    {new Date(msg.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message here..."
                                        className="flex-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className={`px-5 rounded-xl flex items-center justify-center transition-all ${
                                            !newMessage.trim() || sending
                                                ? 'bg-indigo-600/30 text-indigo-400/50 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95'
                                        }`}
                                    >
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </form>
                            </div>

                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default JobChatModal;
