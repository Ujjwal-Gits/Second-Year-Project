import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardAPI } from './api';

const CustomersSection = ({ user, onAddBookingForCustomer }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const { data } = await dashboardAPI.getCustomers();
            setCustomers(data);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const getMonthOptions = () => {
        const options = [];
        const now = new Date();
        for (let i = 0; i < 3; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            options.push({
                label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
                month: d.getMonth(),
                year: d.getFullYear()
            });
        }
        return options;
    };

    const filteredCustomers = customers.filter(customer => {
        // Search filter
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (!matchesSearch) return false;

        // Custom filter logic for month/date range based on their latest booking
        const latestBookingDate = customer.bookings.length > 0 ? new Date(customer.bookings[0].date) : null;
        
        if (!latestBookingDate) return true;

        // Date Range Filter
        if (dateRange.start && dateRange.end) {
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            if (latestBookingDate < start || latestBookingDate > end) return false;
        }

        // Month Filter
        if (filterMonth !== 'all') {
            const [m, y] = filterMonth.split('-');
            if (latestBookingDate.getMonth() !== parseInt(m) || latestBookingDate.getFullYear() !== parseInt(y)) return false;
        }

        return true;
    });

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-[24px] font-black text-[#0D1F18] tracking-tight flex items-center gap-3">
                        Guest Portfolio
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                            {user?.companyName || 'Corporate'}
                        </span>
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-1 font-bold uppercase tracking-[0.2em]">Customer Relationship Management</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative group">
                        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-[16px] group-focus-within:text-primary transition-colors">search</span>
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search identities..."
                            className="h-10 w-56 bg-white rounded-lg pl-11 pr-4 text-[11px] font-bold border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        />
                    </div>

                    {/* Month Filter - Custom Wrapper */}
                    <div className="relative group">
                        <select 
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="h-10 bg-white rounded-lg pl-5 pr-10 text-[10px] font-black uppercase tracking-widest border border-gray-100 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer text-[#0D1F18]"
                        >
                            <option value="all">All Months</option>
                            {getMonthOptions().map(opt => (
                                <option key={`${opt.month}-${opt.year}`} value={`${opt.month}-${opt.year}`}>{opt.label}</option>
                            ))}
                        </select>
                        <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none group-focus-within:text-primary transition-colors">expand_more</span>
                    </div>
                </div>
            </div>

            {/* Date Range Controls - Minimalist implementation */}
            <div className="flex items-center gap-3 px-1">
                <div className="flex items-center gap-2 bg-[#F7F6F3]/40 rounded-lg px-4 py-1.5 border border-gray-100/50 focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary transition-all">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Range</span>
                    <div className="h-3 w-[1px] bg-gray-200 mx-1" />
                    <input 
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="bg-transparent text-[10px] font-bold text-[#0D1F18] outline-none cursor-pointer w-24"
                    />
                    <span className="material-icons text-[12px] text-gray-300">east</span>
                    <input 
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="bg-transparent text-[10px] font-bold text-[#0D1F18] outline-none cursor-pointer w-24"
                    />
                </div>
                
                {(dateRange.start || dateRange.end || filterMonth !== 'all') && (
                    <button 
                        onClick={() => { setDateRange({ start: '', end: '' }); setFilterMonth('all'); }}
                        className="h-8 px-4 flex items-center gap-2 text-[9px] font-black text-red-400 uppercase tracking-widest hover:bg-red-50 rounded-lg transition-all"
                    >
                        <span className="material-icons text-[14px]">backspace</span>
                        Reset Filters
                    </button>
                )}
            </div>

            {/* Customer Cards List */}
            {loading ? (
                <div className="flex items-center justify-center py-40">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Table-like Header - Hidden on Mobile */}
                    <div className="hidden lg:grid grid-cols-12 px-10 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">
                        <div className="col-span-4">Profile & Identity</div>
                        <div className="col-span-3">Contact Matrix</div>
                        <div className="col-span-3">Operational History</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    <AnimatePresence>
                        {filteredCustomers.length > 0 ? filteredCustomers.map((customer, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.03 }}
                                className="group relative bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 lg:p-0"
                            >
                                <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-center lg:px-9 lg:py-4 gap-5 lg:gap-0">
                                    {/* Profile Cluster */}
                                    <div className="lg:col-span-4 flex items-center gap-4">
                                        <div className="w-12 h-12 lg:w-10 lg:h-10 rounded-full bg-[#F7F6F3] border border-gray-100 flex items-center justify-center text-[#0D1F18] text-[15px] lg:text-[13px] font-black group-hover:bg-[#0D1F18] group-hover:text-white transition-all shadow-sm">
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] lg:text-[13px] font-bold text-[#0D1F18] tracking-tight truncate pr-4 leading-none">{customer.name}</h4>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 opacity-60">Verified Client Node</p>
                                        </div>
                                    </div>

                                    {/* Contact Matrix */}
                                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-3 lg:gap-0.5">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2">
                                            <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.1em]">Email Vector</span>
                                            <div className="flex items-center gap-2">
                                                <span className="material-icons text-[14px] lg:text-[12px] text-gray-300">mail</span>
                                                <span className="text-[11px] lg:text-[10px] font-bold text-gray-500 truncate pr-4">{customer.email || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2">
                                            <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.1em]">Cellular Vector</span>
                                            <div className="flex items-center gap-2">
                                                <span className="material-icons text-[14px] lg:text-[12px] text-gray-300">phone</span>
                                                <span className="text-[11px] lg:text-[10px] font-bold text-gray-500">{customer.phone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Operational History */}
                                    <div className="lg:col-span-3 pt-4 lg:pt-0 border-t lg:border-none border-gray-50">
                                        <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.1em] block mb-2">Latest Operational Data</span>
                                        <div className="flex items-center gap-3">
                                            <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 shadow-sm">
                                                <span className="text-[9px] lg:text-[8px] font-black uppercase tracking-widest">
                                                    {(customer.bookings[0]?.type || 'N/A').replace('_', ' ')}
                                                </span>
                                            </div>
                                            <span className="text-[11px] lg:text-[10px] font-bold text-[#0D1F18]">
                                                {customer.bookings[0] ? new Date(customer.bookings[0].date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}
                                            </span>
                                        </div>
                                        <span className="text-[9px] lg:text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-2 block opacity-60">
                                            Global Engagements: {customer.bookings.length} Operations
                                        </span>
                                    </div>

                                    {/* Action Console */}
                                    <div className="lg:col-span-2 flex justify-between lg:justify-end items-center pt-4 lg:pt-0 border-t lg:border-none border-gray-50">
                                        <span className="lg:hidden text-[9px] font-black text-gray-300 uppercase tracking-widest">Operational Task</span>
                                        <button 
                                            onClick={() => onAddBookingForCustomer(customer)}
                                            className="w-10 h-10 lg:w-8 lg:h-8 rounded-xl lg:rounded-full bg-[#0D1F18] lg:bg-gray-50 flex items-center justify-center text-white lg:text-gray-300 lg:hover:bg-[#0D1F18] lg:hover:text-white transition-all group/btn relative shadow-lg shadow-[#0D1F18]/10 lg:shadow-none"
                                        >
                                            <span className="material-icons text-[18px] lg:text-[16px]">add_task</span>
                                            <div className="hidden lg:block absolute bottom-full mb-2 right-0 opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap bg-[#0D1F18] text-white text-[7px] px-2 py-1 rounded-lg uppercase font-black tracking-widest pointer-events-none z-50">
                                                Enroll Booking
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="bg-white rounded-[40px] py-32 text-center border border-dashed border-gray-100">
                                <span className="material-icons text-[48px] text-gray-100 mb-4">person_off</span>
                                <h4 className="text-[14px] font-black text-gray-300 uppercase tracking-widest">Client Isolation Mode</h4>
                                <p className="text-[11px] text-gray-400 mt-2 font-medium">No customers matched your current filter matrix.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default CustomersSection;
