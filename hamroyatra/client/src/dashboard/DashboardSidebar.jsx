import React from 'react';
import { motion } from 'framer-motion';
import HamroLogo from '../assets/HamroLogo.png';
import { useNavigate } from 'react-router-dom';

const navItems = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'calander', icon: 'calendar_month', label: 'Calendar' },
    { id: 'bookings', icon: 'receipt_long', label: 'Bookings' },
    { id: 'listing', icon: 'add_business', label: 'Listings' },
    { id: 'messages', icon: 'forum', label: 'Messages' },
    { id: 'team', icon: 'groups', label: 'Team' },
    { id: 'customers', icon: 'person_search', label: 'Customers' },
    { id: 'reviews', icon: 'rate_review', label: 'Reviews' },
    { id: 'history', icon: 'history', label: 'History' },
];

const DashboardSidebar = ({ activeTab, onTabChange, user, onClose, hasUnreadMessages }) => {
    const companyDisplayName = user?.companyName || user?.fullName || 'Hamroyatra';
    const navigate = useNavigate();

    return (
        <aside className="w-64 lg:w-60 bg-[#0D1F18] flex flex-col h-full shrink-0 z-20 relative overflow-hidden">
            {/* Subtle aurora */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-64 bg-[radial-gradient(ellipse_at_top_left,rgba(197,160,89,0.06)_0%,transparent_70%)]" />
            </div>
            
            {/* Logo + Close button for mobile */}
            <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/5 shrink-0 relative z-10">
                <div className="flex items-center">
                    <img src={HamroLogo} alt="Hamroyatra" className="w-7 h-7 object-contain brightness-0 invert opacity-90 mr-3" />
                    <div>
                        <p className="text-white text-[11px] font-black tracking-[0.25em] uppercase leading-none">{companyDisplayName}</p>
                        <p className="text-[#C5A059] text-[8px] tracking-[0.3em] uppercase opacity-60 mt-0.5">Agent Portal</p>
                    </div>
                </div>
                {/* Close button - Only visible on desktop if sidebar was overlay, but here we use it for mobile */}
                <button 
                    onClick={onClose}
                    className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white"
                >
                    <span className="material-icons text-xl">close</span>
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1 relative z-10">
                {navItems.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group relative ${
                                isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activePill"
                                    className="absolute inset-0 bg-primary rounded-lg"
                                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                />
                            )}
                            <div className="relative">
                                <span className={`material-icons text-[18px] relative z-10 ${isActive ? 'text-white' : ''}`}>
                                    {item.icon}
                                </span>
                                {item.id === 'messages' && hasUnreadMessages && (
                                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0D1F18] z-20 flex items-center justify-center">
                                        <span className="w-full h-full bg-emerald-500 rounded-full animate-ping opacity-75 absolute" />
                                    </span>
                                )}
                            </div>
                            <span className="text-[12px] font-semibold tracking-wide relative z-10">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="px-6 pb-4 relative z-10 border-t border-white/5 mx-2">
                <div className="pt-4 pb-2">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 group hover:bg-white/5 border border-transparent hover:border-white/5"
                    >
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary transition-colors">
                            <span className="material-icons text-white/40 group-hover:text-white text-[14px]">public</span>
                        </div>
                        <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">View Website</span>
                        <span className="material-icons text-white/10 text-[12px] ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </div>
                
                <div className="pt-2">
                    <p className="text-white text-[9px] uppercase tracking-[0.2em] font-black shadow-sm">
                        {companyDisplayName} Dashboard
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
