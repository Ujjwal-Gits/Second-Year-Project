import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const TravellerHistory = ({ user, initialSubTab = 'logs' }) => {
    const navigate = useNavigate();
    const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
    const [history, setHistory] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [histRes, notifRes] = await Promise.all([
                axios.get(`${BASE_URL}/dashboard/traveller/history`, { withCredentials: true }),
                axios.get(`${BASE_URL}/dashboard/traveller/notifications`, { withCredentials: true })
            ]);
            setHistory(histRes.data);
            setNotifications(notifRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching history/notifs:", err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-gray-100 border-t-[#0D1F18] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h2 className="text-[24px] font-black text-[#0D1F18] tracking-tight flex items-center gap-3">
                        Personal Expedition History
                        <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                            User Archives
                        </span>
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-1 font-bold uppercase tracking-[0.2em]">Temporal record of your platform interactions</p>
                    
                    {/* Sub-Tabs */}
                    <div className="flex gap-8 mt-8 border-b border-gray-100">
                        <button 
                            onClick={() => setActiveSubTab('logs')}
                            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeSubTab === 'logs' ? 'text-[#0D1F18]' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                            Adventure Logs
                            {activeSubTab === 'logs' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                        <button 
                            onClick={() => setActiveSubTab('notifications')}
                            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeSubTab === 'notifications' ? 'text-[#0D1F18]' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                            Notification Archive
                            {activeSubTab === 'notifications' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={fetchData}
                        className="h-12 px-6 rounded-2xl bg-white border border-gray-100 flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-[#0D1F18] transition-all shadow-sm group"
                    >
                        <span className="material-icons text-[18px] group-hover:rotate-180 transition-transform duration-500">refresh</span>
                        Refresh Ledger
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm"
            >
                <div className="overflow-x-auto">
                    {activeSubTab === 'logs' ? (
                        <>
                            {/* Desktop Table View */}
                            <table className="hidden lg:table w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operation</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ledger Details</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {history.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-10 py-6">
                                                <span className={`text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-sm ${log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {log.action.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="text-[13px] text-gray-500 font-medium">{log.details}</span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[12px] text-[#0D1F18] font-black">{new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter mt-1">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Mobile Card View */}
                            <div className="lg:hidden divide-y divide-gray-50">
                                {history.map(log => (
                                    <div key={log.id} className="p-6 space-y-4 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {log.action.replace('_', ' ')}
                                            </span>
                                            <div className="text-right">
                                                <div className="text-[11px] text-[#0D1F18] font-black">{new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                                                <div className="text-[9px] text-gray-300 font-bold uppercase">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                        <p className="text-[12px] text-gray-500 font-medium leading-relaxed">{log.details}</p>
                                    </div>
                                ))}
                                {history.length === 0 && (
                                    <div className="py-20 text-center text-gray-300 text-[10px] font-black uppercase tracking-widest">No logs recorded</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Desktop Notification Table */}
                            <table className="hidden lg:table w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ref</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Announcement</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {notifications.map(n => (
                                        <tr 
                                            key={n.id} 
                                            onClick={() => {
                                                if (n.type === 'booking' || n.type === 'status') {
                                                    navigate('/dashboard/bookings');
                                                } else if (n.type === 'review') {
                                                    navigate('/dashboard/reviews');
                                                }
                                            }}
                                            className="hover:bg-gray-100/50 transition-all group cursor-pointer border-l-2 border-transparent hover:border-[#C5A059]"
                                        >
                                            <td className="px-10 py-6">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${n.type === 'status' || n.type === 'booking' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    <span className="material-icons text-[18px]">{n.type === 'status' || n.type === 'booking' ? 'verified' : 'info'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[13px] font-black text-[#0D1F18] group-hover:text-[#C5A059] transition-colors">{n.title}</span>
                                                    {!n.isRead && <span className="text-[8px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black uppercase shadow-sm animate-pulse">New</span>}
                                                </div>
                                                <p className="text-[12px] text-gray-500 font-medium truncate max-w-md group-hover:text-gray-700 transition-colors">{n.message}</p>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[12px] text-[#0D1F18] font-black">{new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    <span className="text-[10px] text-gray-300 font-bold uppercase mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Mobile Notification View */}
                            <div className="lg:hidden divide-y divide-gray-50">
                                {notifications.map(n => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => {
                                            if (n.type === 'booking' || n.type === 'status') {
                                                navigate('/dashboard/bookings');
                                            } else if (n.type === 'review') {
                                                navigate('/dashboard/reviews');
                                            }
                                        }}
                                        className="p-6 active:bg-gray-50 transition-colors flex gap-4"
                                    >
                                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${n.type === 'status' || n.type === 'booking' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            <span className="material-icons text-[18px]">{n.type === 'status' || n.type === 'booking' ? 'verified' : 'info'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-[12px] font-black text-[#0D1F18] truncate">{n.title}</span>
                                                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                                                </div>
                                                <span className="text-[9px] text-gray-300 font-bold uppercase whitespace-nowrap ml-2">{new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium line-clamp-2">{n.message}</p>
                                        </div>
                                    </div>
                                ))}
                                {notifications.length === 0 && (
                                    <div className="py-20 text-center text-gray-300 text-[10px] font-black uppercase tracking-widest">No notifications</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default TravellerHistory;
