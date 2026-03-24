import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardAPI } from './api';

const MessagesSection = ({ user }) => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedThread, setSelectedThread] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [filter, setFilter] = useState('all');
    const [replyText, setReplyText] = useState('');
    const [showMobileChat, setShowMobileChat] = useState(false);
    const chatEndRef = useRef(null);
    const pollInterval = useRef(null);

    const fetchThreads = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const { data } = await dashboardAPI.getMessages();
            setThreads(data);
        } catch (err) {
            console.error("Failed to fetch threads:", err);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    const fetchConversation = async (email, isBackground = false) => {
        if (!email) return;
        try {
            const { data } = await dashboardAPI.getConversation(email);
            setConversation(data);
        } catch (err) {
            console.error("Failed to fetch conversation:", err);
        }
    };

    // Live update polling
    useEffect(() => {
        fetchThreads();
        pollInterval.current = setInterval(() => {
            fetchThreads(true);
            if (selectedThread) {
                fetchConversation(selectedThread.customerEmail, true);
            }
        }, 5000); // Poll every 5 seconds for live feel

        return () => clearInterval(pollInterval.current);
    }, [selectedThread?.customerEmail]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const handleSelectThread = async (thread) => {
        setSelectedThread(thread);
        setShowMobileChat(true);
        await fetchConversation(thread.customerEmail);
        
        if (thread.status === 'unread') {
            try {
                await dashboardAPI.markMessageRead(thread.id);
                // Locally update status to avoid flicker before next poll
                setThreads(prev => prev.map(t => t.customerEmail === thread.customerEmail ? { ...t, status: 'read' } : t));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedThread) return;
        
        const tempText = replyText;
        setReplyText('');

        try {
            // Find the ID of the latest customer message to reply to
            const lastCustomerMsg = [...conversation].reverse().find(m => m.senderRole === 'traveller');
            const msgId = lastCustomerMsg?.id || selectedThread.id;
            
            await dashboardAPI.replyMessage(msgId, tempText);
            fetchConversation(selectedThread.customerEmail);
            fetchThreads(true);
        } catch (err) {
            console.error("Failed to reply:", err);
            setReplyText(tempText); // Restore text on failure
        }
    };

    const filteredThreads = threads.filter(t => {
        if (filter === 'unread') return t.status === 'unread';
        return true;
    });

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            {/* Minimal Header */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div>
                    <h2 className="text-[22px] font-black text-[#0D1F18] tracking-tight">Communication Portal</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time Inbound Correspondence</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'unread'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                filter === f ? 'bg-[#0D1F18] text-white shadow-lg' : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Layout Container */}
            <div className="flex-1 flex bg-white rounded-[40px] border border-gray-100/60 overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.04)]">
                
                {/* ─── THREAD LIST (LEFT) ─── */}
                <div className={`${showMobileChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-[360px] border-r border-gray-50 flex-col bg-[#FAFAF9]/30`}>
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">Inbox</span>
                        <div className="flex items-center gap-2">
                            {loading && <div className="w-3 h-3 border-2 border-[#0D1F18] border-t-transparent rounded-full animate-spin" />}
                            <button onClick={() => fetchThreads()} className="text-gray-300 hover:text-gray-500 transition-colors">
                                <span className="material-icons text-[16px]">refresh</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
                        {loading && threads.length === 0 ? (
                            [1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-50/50 rounded-2xl animate-pulse m-2" />)
                        ) : filteredThreads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">No transmissions</span>
                            </div>
                        ) : (
                            filteredThreads.map(thread => (
                                <motion.div
                                    key={thread.id}
                                    layout
                                    onClick={() => handleSelectThread(thread)}
                                    className={`relative p-4 rounded-[22px] cursor-pointer transition-all duration-300 group ${
                                        selectedThread?.customerEmail === thread.customerEmail 
                                            ? 'bg-white shadow-sm border border-gray-100' 
                                            : 'hover:bg-white/40 border border-transparent'
                                    }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 rounded-xl bg-[#F0EFEC] flex items-center justify-center text-[13px] font-black text-[#0D1F18]">
                                                {(thread.customerName || 'C').charAt(0).toUpperCase()}
                                            </div>
                                            {thread.unreadCount > 0 && (
                                                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white min-w-[18px] h-[18px] rounded-full border-2 border-[#FAFAF9] flex items-center justify-center text-[8px] font-black animate-bounce shadow-sm">
                                                    {thread.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h4 className={`text-[12px] font-black text-[#0D1F18] truncate`}>{thread.customerName}</h4>
                                                <span className="text-[8px] text-gray-400 font-bold whitespace-nowrap ml-2">
                                                    {new Date(thread.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-[#0D1F18]/40 font-bold tracking-tight truncate uppercase mb-1">{thread.subject || 'Inquiry'}</p>
                                            <p className={`text-[11px] line-clamp-1 leading-tight ${thread.status === 'unread' ? 'text-gray-900 font-bold' : 'text-gray-400 font-medium'}`}>
                                                {thread.message}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedThread?.customerEmail === thread.customerEmail && (
                                        <motion.div layoutId="activeThreadIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#C5A059] rounded-r-full" />
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* ─── CHAT INTERFACE (RIGHT) ─── */}
                <div className={`${showMobileChat ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-white`}>
                    {selectedThread ? (
                        <div className="h-full flex flex-col">
                            {/* Chat Header */}
                            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setShowMobileChat(false)}
                                        className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50"
                                    >
                                        <span className="material-icons text-xl">arrow_back</span>
                                    </button>
                                    <div className="w-9 h-9 rounded-lg bg-[#F7F6F3] flex items-center justify-center text-[12px] font-black">
                                        {(selectedThread.customerName || 'C').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black text-[#0D1F18] flex items-center gap-2">
                                            {selectedThread.customerName}
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        </h4>
                                        <p className="text-[9px] text-[#C5A059] font-bold uppercase tracking-widest">Active Thread</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Scroll Area */}
                            <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-[#FAFAF9]/10">
                                <div className="max-w-3xl mx-auto space-y-6 flex flex-col">
                                    <div className="self-center">
                                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] bg-gray-50 px-4 py-1.5 rounded-full">
                                            SECURE ENCRYPTED CHANNEL ESTABLISHED
                                        </span>
                                    </div>

                                    {conversation.map((msg, i) => {
                                        const isAgent = msg.senderRole === 'agent';
                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={msg.id} 
                                                className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'} gap-1.5`}
                                            >
                                                <div className={`max-w-[80%] rounded-[20px] p-4 shadow-sm border ${
                                                    isAgent 
                                                        ? 'bg-[#0D1F18] text-white rounded-tr-sm border-[#0D1F18]' 
                                                        : 'bg-white text-[#0D1F18] rounded-tl-sm border-gray-100'
                                                }`}>
                                                    <p className="text-[12px] font-medium leading-[1.6] whitespace-pre-wrap">
                                                        {msg.message}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 px-1">
                                                    <span className="text-[8px] text-gray-300 font-bold uppercase">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isAgent && (
                                                        <span className="material-icons text-[10px] text-[#C5A059]">done_all</span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    
                                    <div ref={chatEndRef} />
                                </div>
                            </div>

                            {/* Message Input */}
                            <div className="p-5 border-t border-gray-50/50 bg-[#FAFAF9]/30">
                                <form onSubmit={handleSendReply} className="max-w-2xl mx-auto relative group">
                                    <input 
                                        type="text"
                                        placeholder={`Secure message to ${selectedThread.customerName.split(' ')[0]}...`}
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
                                <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest text-center mt-4 opacity-50">
                                    Identity Verified: {selectedThread.customerEmail}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#FAFAF9]/40">
                            <div className="w-24 h-24 rounded-full bg-white border border-gray-100/50 shadow-md flex items-center justify-center mb-8 relative">
                                <span className="material-icons text-gray-100 text-5xl">chat_bubble_outline</span>
                            </div>
                            <h3 className="text-[18px] font-black text-[#0D1F18] tracking-tight mb-2">Omnichannel Inbox</h3>
                            <p className="text-[11px] text-gray-400 max-w-[240px] leading-relaxed font-medium">
                                Select a verified thread to begin real-time customer engagement.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesSection;
