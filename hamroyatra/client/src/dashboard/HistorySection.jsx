import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dashboardAPI } from './api';

const HistorySection = ({ user, initialSubTab = 'logs' }) => {
    const navigate = useNavigate();
    const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
    const [history, setHistory] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initialSubTab) {
            setActiveSubTab(initialSubTab);
        }
    }, [initialSubTab]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const [historyRes, notificationsRes] = await Promise.all([
                dashboardAPI.getActivityHistory(),
                dashboardAPI.getNotifications()
            ]);
            setHistory(historyRes.data);
            setNotifications(notificationsRes.data);
        } catch (err) {
            console.error("Failed to fetch history/notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await dashboardAPI.markNotificationsRead();
            fetchHistory(); // Refresh to show read status
        } catch (err) {
            console.error("Failed to mark notifications read:", err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h2 className="text-[24px] font-black text-[#0D1F18] tracking-tight flex items-center gap-3">
                        Operational Audit Trail
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg uppercase tracking-widest font-bold">
                            {user?.companyName || 'Corporate'}
                        </span>
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-1 font-bold uppercase tracking-[0.2em]">Institutional Transparency Protocol</p>
                    
                    {/* Sub-Tabs */}
                    <div className="flex gap-8 mt-8 border-b border-gray-100">
                        <button 
                            onClick={() => {
                                setActiveSubTab('logs');
                                navigate('/dashboard/history');
                            }}
                            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${
                                activeSubTab === 'logs' ? 'text-[#0D1F18]' : 'text-gray-300 hover:text-gray-400'
                            }`}
                        >
                            Activity Logs
                            {activeSubTab === 'logs' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                        <button 
                            onClick={() => {
                                setActiveSubTab('notifications');
                                navigate('/dashboard/history/notifications');
                            }}
                            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${
                                activeSubTab === 'notifications' ? 'text-[#0D1F18]' : 'text-gray-300 hover:text-gray-400'
                            }`}
                        >
                            Notification History
                            {activeSubTab === 'notifications' && <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    {activeSubTab === 'notifications' && notifications.some(n => !n.isRead) && (
                        <button 
                            onClick={handleMarkAllRead}
                            className="h-12 px-6 rounded-xl bg-amber-50 text-amber-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all shadow-sm"
                        >
                            <span className="material-icons text-[18px]">done_all</span>
                            Mark All Read
                        </button>
                    )}
                    <button 
                        onClick={fetchHistory}
                        className="h-12 px-6 rounded-xl bg-white border border-gray-100 flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-[#0D1F18] transition-all shadow-sm group"
                    >
                        <span className="material-icons text-[18px] group-hover:rotate-180 transition-transform duration-500">refresh</span>
                        Sync Records
                    </button>
                </div>
            </div>

            {/* Content Integration */}
            {loading ? (
                <div className="flex items-center justify-center py-40">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-emerald-500 rounded-lg animate-spin" />
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_5px_20px_rgba(0,0,0,0.02)]"
                >
                        {activeSubTab === 'logs' ? (
                            <div className="flex flex-col">
                                {/* Table Header - Hidden on Mobile */}
                                <div className="hidden lg:grid grid-cols-12 bg-gray-50/50 border-b border-gray-100">
                                    <div className="col-span-3 px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent Identity</div>
                                    <div className="col-span-2 px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action Type</div>
                                    <div className="col-span-4 px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operational Details</div>
                                    <div className="col-span-3 px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Timestamp</div>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {history.length > 0 ? history.map((log, i) => (
                                        <div key={log.id} className="flex flex-col lg:grid lg:grid-cols-12 hover:bg-gray-50/30 transition-colors group p-5 lg:p-0">
                                            {/* Agent Identity */}
                                            <div className="lg:col-span-3 lg:px-10 lg:py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 lg:w-10 lg:h-10 rounded-xl bg-[#F7F6F3] text-gray-400 flex items-center justify-center group-hover:bg-[#0D1F18] group-hover:text-white transition-all shadow-sm">
                                                        <span className="material-icons text-[20px] lg:text-[18px]">fingerprint</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[15px] lg:text-[14px] font-black text-[#0D1F18] block leading-tight">{log.agentName}</span>
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-60">ID: {log.agentId.slice(0, 8).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Type */}
                                            <div className="lg:col-span-2 lg:px-10 lg:py-6 mt-4 lg:mt-0">
                                                <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-widest block mb-2">Operation Type</span>
                                                <span className={`text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest shadow-sm inline-block ${
                                                    log.action.includes('DELETE') ? 'bg-red-50 text-red-500 border border-red-100' : 
                                                    log.action.includes('CREATE') || log.action.includes('ADD') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                                    'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                    {log.action.replace('_', ' ')}
                                                </span>
                                            </div>

                                            {/* Operational Details */}
                                            <div className="lg:col-span-4 lg:px-10 lg:py-6 mt-4 lg:mt-0">
                                                <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-widest block mb-1.5">Action Parameters</span>
                                                <span className="text-[13px] text-gray-500 font-medium leading-relaxed block">{log.details}</span>
                                            </div>

                                            {/* Timestamp */}
                                            <div className="lg:col-span-3 lg:px-10 lg:py-6 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-none border-gray-50 text-left lg:text-right flex lg:flex-col justify-between items-center lg:items-end">
                                                <span className="lg:hidden text-[9px] font-black text-gray-300 uppercase tracking-widest">Temporal Key</span>
                                                <div className="flex flex-col lg:items-end">
                                                    <span className="text-[12px] text-[#0D1F18] font-black">{new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter mt-1">
                                                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6 text-gray-200 shadow-inner">
                                                    <span className="material-icons text-[40px]">history_toggle_off</span>
                                                </div>
                                                <h4 className="text-[14px] font-black text-gray-300 uppercase tracking-widest">No log entries detected</h4>
                                                <p className="text-[11px] text-gray-400 mt-2 font-medium">History will populate as team members perform dashboard actions.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {/* Table Header - Hidden on Mobile */}
                                <div className="hidden lg:grid grid-cols-12 bg-gray-50/50 border-b border-gray-100">
                                    <div className="col-span-2 px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Context</div>
                                    <div className="col-span-3 px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Notification Label</div>
                                    <div className="col-span-4 px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Content Summary</div>
                                    <div className="col-span-3 px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Archived Date</div>
                                </div>
                                <div className="divide-y divide-gray-50">
                                     {notifications.length > 0 ? notifications.map((notif) => (
                                          <div 
                                             key={notif.id} 
                                             onClick={() => {
                                                 if (notif.type === 'booking') {
                                                     navigate('/dashboard/bookings');
                                                 } else if (notif.type === 'review') {
                                                     navigate('/dashboard/reviews');
                                                 }
                                             }}
                                             className="flex flex-col lg:grid lg:grid-cols-12 items-start lg:items-center hover:bg-gray-100/30 transition-all group cursor-pointer border-l-4 lg:border-l-2 border-transparent hover:border-[#C5A059] p-5 lg:p-0"
                                          >
                                              {/* Context Icon */}
                                              <div className="lg:col-span-2 lg:px-10 lg:py-6">
                                                  <div className={`w-12 h-12 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${
                                                      notif.type === 'booking' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                  }`}>
                                                      <span className="material-icons text-[20px] lg:text-[18px]">
                                                          {notif.type === 'booking' ? 'shopping_cart' : 'rate_review'}
                                                      </span>
                                                  </div>
                                              </div>

                                              {/* Label */}
                                              <div className="lg:col-span-3 lg:px-10 lg:py-6 mt-4 lg:mt-0">
                                                  <div className="flex items-center gap-3">
                                                      <span className="text-[15px] lg:text-[13px] font-black text-[#0D1F18] group-hover:text-[#C5A059] transition-colors leading-tight">{notif.title}</span>
                                                      {!notif.isRead && (
                                                          <span className="text-[8px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-[0.05em] shadow-sm animate-pulse">New</span>
                                                      )}
                                                  </div>
                                              </div>

                                              {/* Summary */}
                                              <div className="lg:col-span-4 lg:px-10 lg:py-6 mt-2 lg:mt-0">
                                                  <p className="text-[13px] lg:text-[12px] text-gray-500 font-medium lg:truncate lg:max-w-md group-hover:text-gray-700 transition-colors leading-relaxed">{notif.message}</p>
                                              </div>

                                              {/* Archived Date */}
                                              <div className="lg:col-span-3 lg:px-10 lg:py-6 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-none border-gray-50 w-full lg:w-auto text-left lg:text-right flex lg:flex-col justify-between items-center lg:items-end">
                                                  <span className="lg:hidden text-[9px] font-black text-gray-300 uppercase tracking-widest">Archive Index</span>
                                                  <div className="flex flex-col lg:items-end">
                                                      <span className="text-[12px] lg:text-[11px] text-[#0D1F18] font-black">
                                                          {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                      </span>
                                                      <span className="text-[10px] lg:text-[9px] text-gray-300 font-bold uppercase tracking-tight mt-1">
                                                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                      </span>
                                                  </div>
                                              </div>
                                          </div>
                                     )) : (
                                        <div className="px-10 py-32 text-center text-gray-300">
                                            <div className="flex flex-col items-center">
                                                <span className="material-icons text-5xl mb-4 opacity-20">notifications_off</span>
                                                <p className="text-[12px] font-black uppercase tracking-widest">Notification Registry Clear</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                </motion.div>
            )}
        </div>
    );
};

export default HistorySection;
