import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardAPI } from './api';

const DashboardHeader = ({ user, onLogout, onTabChange, onToggleSidebar }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifs, setLoadingNotifs] = useState(false);
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);
    
    const fetchNotifications = async () => {
        try {
            setLoadingNotifs(true);
            const { data } = await dashboardAPI.getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoadingNotifs(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s for live alerts
        return () => clearInterval(interval);
    }, []);

    const markAllRead = async () => {
        try {
            await dashboardAPI.markNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Failed to mark read:", err);
        }
    };

    const hasUnread = notifications.some(n => {
        const isMsg = n.type === 'message' || n.type === 'inquiry' || 
                      n.title.toLowerCase().includes('message') || 
                      n.title.toLowerCase().includes('inquiry');
        return !n.isRead && !isMsg;
    });

    const initials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'AG';

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0 z-30 relative w-full">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button 
                    onClick={onToggleSidebar}
                    className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 border border-gray-100"
                >
                    <span className="material-icons">menu</span>
                </button>

                <div className="hidden sm:block">
                    <h1 className="text-[13px] md:text-[15px] font-black text-[#0D1F18] tracking-tight truncate max-w-[150px] md:max-w-none">
                        Good {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Agent'}
                    </h1>
                    <p className="text-[9px] md:text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 opacity-60">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-5">
                {/* Activity Center Hub */}
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            if (!showNotifications && hasUnread) markAllRead();
                        }}
                        className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all border ${
                            showNotifications 
                                ? 'bg-[#0D1F18] text-white border-[#0D1F18]' 
                                : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                        }`}
                    >
                        <span className="material-icons text-[20px]">notifications_none</span>
                        {hasUnread && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-gray-50 overflow-hidden z-20"
                            >
                                <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-[#F7F6F3]/50">
                                    <h4 className="text-[11px] font-black text-[#0D1F18] uppercase tracking-widest">Activity Center</h4>
                                    <button 
                                        onClick={markAllRead}
                                        className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest hover:underline"
                                    >
                                        Mark All Read
                                    </button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {loadingNotifs ? (
                                        <div className="py-12 flex justify-center">
                                            <div className="w-6 h-6 border-2 border-gray-100 border-t-[#0D1F18] rounded-full animate-spin" />
                                        </div>
                                    ) : notifications.filter(notif => {
                                        const isMsg = notif.type === 'message' || notif.type === 'inquiry' || 
                                                      notif.title.toLowerCase().includes('message') || 
                                                      notif.title.toLowerCase().includes('inquiry');
                                        return !isMsg;
                                    }).length > 0 ? (
                                                notifications.filter(notif => {
                                                    const isMsg = notif.type === 'message' || notif.type === 'inquiry' || 
                                                                  notif.title.toLowerCase().includes('message') || 
                                                                  notif.title.toLowerCase().includes('inquiry');
                                                    return !isMsg;
                                                }).map((notif, i) => (
                                                    <div 
                                                        key={notif.id}
                                                        onClick={() => {
                                                            setShowNotifications(false);
                                                            if (notif.type === 'booking') {
                                                                onTabChange('bookings');
                                                            } else if (notif.type === 'review') {
                                                                onTabChange('reviews');
                                                            } else {
                                                                onTabChange('history', 'notifications');
                                                            }
                                                        }}
                                                        className={`p-5 flex gap-4 hover:bg-gray-100/50 transition-all cursor-pointer border-b border-gray-50/50 relative group ${!notif.isRead ? 'bg-[#FDFDFB]' : ''}`}
                                                    >
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                                                            notif.type === 'booking' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                        }`}>
                                                            <span className="material-icons text-[18px]">
                                                                {notif.type === 'booking' ? 'shopping_cart' : 'rate_review'}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-0.5">
                                                                <p className="text-[12px] font-black text-[#0D1F18] truncate pr-4 group-hover:text-[#C5A059] transition-colors">{notif.title}</p>
                                                                <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter whitespace-nowrap">
                                                                    {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] font-medium text-gray-500 leading-relaxed pr-2">
                                                                {notif.message}
                                                            </p>
                                                        </div>
                                                        {!notif.isRead && (
                                                            <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full mt-2 shrink-0 animate-pulse" />
                                                        )}
                                                    </div>
                                                ))
                                    ) : (
                                        <div className="py-12 text-center">
                                            <span className="material-icons text-gray-100 text-[40px] mb-2">notifications_off</span>
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Recent Activity</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-gray-50/50 text-center">
                                    <button 
                                        onClick={() => {
                                            setShowNotifications(false);
                                            onTabChange('history', 'notifications');
                                        }}
                                        className="text-[10px] font-black text-[#0D1F18] uppercase tracking-widest hover:text-[#C5A059] transition-colors"
                                    >
                                        See Historical Logs
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile with Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-3 pl-5 border-l border-gray-100 group transition-all"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-[#0D1F18] flex items-center justify-center text-white text-[11px] font-extrabold tracking-wider shadow-lg shadow-[#0D1F18]/10 group-hover:scale-105 transition-transform">
                            {initials}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-[13px] font-black text-[#0D1F18] leading-none group-hover:text-[#C5A059] transition-colors">{user?.fullName || 'Agent'}</p>
                            <p className="text-[9px] text-[#C5A059] mt-1.5 uppercase font-bold tracking-widest opacity-80">{user?.role || 'Agent Portal'}</p>
                        </div>
                        <span className="material-icons text-gray-300 text-[18px] transition-transform group-hover:text-gray-400" style={{ transform: showDropdown ? 'rotate(180deg)' : 'none' }}>
                            expand_more
                        </span>
                    </button>

                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.15)] border border-gray-50 py-3 overflow-hidden z-20"
                            >
                                <div className="px-5 py-4 border-b border-gray-50/60 mb-2">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest truncate">{user?.email}</p>
                                </div>
                                <button 
                                    onClick={() => setShowDropdown(false)}
                                    className="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0D1F18] transition-all group/opt"
                                >
                                    <span className="material-icons text-[18px] text-gray-400 group-hover/opt:text-[#0D1F18] transition-colors">person_outline</span>
                                    Profile Settings
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowDropdown(false);
                                        window.open(`/agent/${user?.id}`, '_blank');
                                    }}
                                    className="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0D1F18] transition-all group/opt"
                                >
                                    <span className="material-icons text-[18px] text-gray-400 group-hover/opt:text-[#C5A059] transition-colors">visibility</span>
                                    View Public Profile
                                </button>
                                <div className="h-px bg-gray-50 mx-5 my-1" />
                                <button 
                                    onClick={() => { setShowDropdown(false); onLogout(); }}
                                    className="w-full flex items-center gap-3 px-5 py-5 text-[11px] font-black text-red-500 hover:bg-red-50 transition-all uppercase tracking-[0.2em]"
                                >
                                    <span className="material-icons text-[20px]">power_settings_new</span>
                                    TERMINATE SESSION
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
};

export default DashboardHeader;
