import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const TravellerMessages = ({ user }) => {
    const [threads, setThreads] = useState([]);
    const [selectedCompanyName, setSelectedCompanyName] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const chatEndRef = useRef(null);
    const pollInterval = useRef(null);

    const fetchMessages = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const res = await axios.get(`${BASE_URL}/dashboard/traveller/messages`, { withCredentials: true });
            setThreads(res.data);
        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    const markAsRead = async (companyName) => {
        try {
            await axios.put(`${BASE_URL}/dashboard/traveller/messages/read/${encodeURIComponent(companyName)}`, {}, { withCredentials: true });
            // Update local state to clear dot immediately
            setThreads(prev => prev.map(t => t.companyName === companyName ? { ...t, unreadCount: 0 } : t));
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };

    const handleSelectThread = (companyName) => {
        setSelectedCompanyName(companyName);
        setShowMobileChat(true);
        markAsRead(companyName);
    };

    // Live update polling
    useEffect(() => {
        fetchMessages();
        pollInterval.current = setInterval(() => fetchMessages(true), 5000);
        return () => clearInterval(pollInterval.current);
    }, [selectedCompanyName]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedCompanyName) return;

        const tempText = replyText;
        setReplyText('');

        try {
            await axios.post(`${BASE_URL}/dashboard/traveller/messages`, {
                companyName: selectedCompanyName,
                message: tempText
            }, { withCredentials: true });

            fetchMessages(true);
        } catch (err) {
            console.error("Error sending message:", err);
            setReplyText(tempText);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [threads, selectedCompanyName]);

    const selectedThread = threads.find(t => t.companyName === selectedCompanyName);

    if (loading && threads.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-gray-100 border-t-[#0D1F18] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between mb-6 px-2">
                <div>
                    <h2 className="text-[22px] font-black text-[#0D1F18] tracking-tight">Agent Communications</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Direct support channel</p>
                </div>
                {loading && threads.length > 0 && <div className="w-4 h-4 border-2 border-[#0D1F18] border-t-transparent rounded-full animate-spin" />}
            </div>

            <div className="flex-1 flex bg-white rounded-[40px] border border-gray-100/60 overflow-hidden shadow-sm">
                {/* Thread List */}
                <div className={`${showMobileChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-[360px] border-r border-gray-50 flex flex-col bg-[#FAFAF9]/30`}>
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">Verified Partners</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
                        {threads.map((t, idx) => (
                            <motion.div
                                key={idx}
                                onClick={() => handleSelectThread(t.companyName)}
                                className={`p-4 rounded-[22px] cursor-pointer transition-all duration-300 relative ${selectedCompanyName === t.companyName ? 'bg-white shadow-sm border border-gray-100' : 'hover:bg-white/40 border border-transparent'}`}
                            >
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-xl bg-[#0D1F18]/5 flex items-center justify-center text-[#0D1F18] font-black">
                                            {t.companyName.charAt(0).toUpperCase()}
                                        </div>
                                        {t.unreadCount > 0 && (
                                            <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white min-w-[18px] h-[18px] rounded-full border-2 border-[#FAFAF9] flex items-center justify-center text-[8px] font-black animate-bounce shadow-sm">
                                                {t.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className="text-[12px] font-black text-[#0D1F18] truncate">{t.companyName}</h4>
                                            <span className="text-[8px] text-gray-400 font-bold whitespace-nowrap ml-2">
                                                {new Date(t.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-tight truncate mb-1">Travel Partner</p>
                                        <p className="text-[11px] text-gray-400 line-clamp-1 leading-tight">{t.lastMsg}</p>
                                    </div>
                                </div>
                                {selectedCompanyName === t.companyName && (
                                    <motion.div layoutId="activeThreadIndicatorTrav" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#C5A059] rounded-r-full" />
                                )}
                            </motion.div>
                        ))}
                        {threads.length === 0 && (
                            <div className="p-10 text-center opacity-40">
                                <span className="material-icons text-[32px] text-gray-200 block mb-2">forum</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No conversations</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`${showMobileChat ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-white`}>
                    {selectedThread ? (
                        <div className="h-full flex flex-col">
                            <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white z-10">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setShowMobileChat(false)}
                                        className="lg:hidden w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 active:scale-95 transition-all"
                                    >
                                        <span className="material-icons">arrow_back</span>
                                    </button>
                                    <div className="w-9 h-9 rounded-lg bg-[#F7F6F3] flex items-center justify-center text-[12px] font-black">
                                        {selectedThread.companyName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black text-[#0D1F18] flex items-center gap-2">
                                            {selectedThread.companyName}
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        </h4>
                                        <p className="text-[9px] text-[#C5A059] font-bold uppercase tracking-widest">Active Partner Support</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-[#FAFAF9]/20">
                                <div className="max-w-2xl mx-auto space-y-6 flex flex-col">
                                    <div className="self-center">
                                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] bg-white border border-gray-50 px-4 py-1.5 rounded-full shadow-sm">
                                            Real-time end-to-end encryption active
                                        </span>
                                    </div>

                                    {[...selectedThread.messages].reverse().map((m, idx) => {
                                        const isSelf = m.senderRole === 'traveller';
                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={m.id || idx} 
                                                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} gap-1.5`}
                                            >
                                                <div className={`max-w-[80%] rounded-[20px] p-4 border shadow-sm ${isSelf ? 'bg-[#0D1F18] text-white border-transparent rounded-tr-sm' : 'bg-white border-gray-100 text-[#0D1F18] rounded-tl-sm'}`}>
                                                    <p className="text-[12px] font-medium leading-[1.6] whitespace-pre-wrap">{m.message}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-1">
                                                    <span className="text-[8px] text-gray-300 font-bold uppercase">
                                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isSelf && <span className="material-icons text-[10px] text-emerald-500">done_all</span>}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={chatEndRef} />
                                </div>
                            </div>

                            <div className="p-5 border-t border-gray-50/50 bg-[#FAFAF9]/30">
                                <form onSubmit={handleSendMessage} className="max-w-xl mx-auto relative group">
                                    <input 
                                        type="text"
                                        placeholder={`Message ${selectedThread.companyName}...`}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full h-[52px] bg-white rounded-2xl px-6 text-[12px] font-medium shadow-sm outline-none border border-gray-100 focus:border-[#C5A059]/30 transition-all pr-14"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <button 
                                            type="submit"
                                            disabled={!replyText.trim()}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                                replyText.trim() ? 'bg-[#0D1F18] text-white shadow-lg' : 'bg-gray-50 text-gray-200'
                                            }`}
                                        >
                                            <span className="material-icons text-[18px]">send</span>
                                        </button>
                                    </div>
                                </form>
                                <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest text-center mt-4 opacity-40">
                                    Verified Travel Partner Channel
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#FAFAF9]/40">
                            <div className="w-24 h-24 rounded-full bg-white border border-gray-100 shadow-md flex items-center justify-center mb-8 relative">
                                <span className="material-icons text-gray-100 text-5xl">support_agent</span>
                            </div>
                            <h3 className="text-[18px] font-black text-[#0D1F18] tracking-tight mb-2">Concierge Desk</h3>
                            <p className="text-[11px] text-gray-400 max-w-[240px] leading-relaxed font-medium">
                                Connect with our expert travel agents to finalize your expedition details.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TravellerMessages;
