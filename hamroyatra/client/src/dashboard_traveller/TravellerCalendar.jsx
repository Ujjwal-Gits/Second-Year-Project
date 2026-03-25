import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const TravellerCalendar = ({ user }) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState(today.getDate());
    const [myPlans, setMyPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/dashboard/traveller/bookings`, { withCredentials: true });
            const formattedPlans = res.data.map(b => ({
                id: b.id,
                title: b.guestName,
                startDate: b.startDate, // YYYY-MM-DD
                endDate: b.endDate,
                type: b.bookingType === 'room' ? 'hotel' : b.bookingType,
                color: b.bookingType === 'room' ? '#C5A059' : b.bookingType === 'package' ? '#1D7447' : '#0D1F18'
            }));
            setMyPlans(formattedPlans);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching plans:", err);
            setLoading(false);
        }
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
        setSelectedDay(null);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
        setSelectedDay(null);
    };

    const goToToday = () => {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
        setSelectedDay(today.getDate());
    };

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    const cells = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, current: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });

    const getDayPlans = (day, isCurrent) => {
        if (!isCurrent) return [];
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return myPlans.filter(p => p.startDate === dateStr);
    };

    const selectedDateStr = selectedDay ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : null;
    const selectedDayPlans = selectedDay ? myPlans.filter(p => p.startDate === selectedDateStr) : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-gray-100 border-t-[#0D1F18] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header Section */}
            <div className="mb-4 md:mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-[#1a202c]">Adventure Schedule</h1>
                <p className="text-[11px] md:text-sm text-gray-500 mt-1 font-medium">Temporal matrix of your upcoming plans and reservations.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Calendar Side */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                    {/* Month Selector */}
                    <div className="p-4 md:p-6 flex items-center justify-between border-b border-gray-50">
                        <h2 className="text-lg md:text-xl font-bold text-[#1a202c]">{MONTHS[viewMonth]} {viewYear}</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={prevMonth} className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                                <span className="material-icons text-xl">chevron_left</span>
                            </button>
                            <button onClick={goToToday} className="px-5 py-1.5 border border-gray-200 rounded-lg text-sm font-bold text-[#1a202c] hover:bg-gray-50 transition-colors">Today</button>
                            <button onClick={nextMonth} className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                                <span className="material-icons text-xl">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-gray-100">
                        {DAYS.map(d => (
                            <div key={d} className="py-3 text-center text-[10px] font-bold text-gray-400 tracking-[0.1em]">{d}</div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 transition-opacity">
                        {cells.map((cell, i) => {
                            const plans = getDayPlans(cell.day, cell.current);
                            const isSelected = selectedDay === cell.day && cell.current;
                            const isTodayCell = cell.current && cell.day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

                            return (
                                <button
                                    key={i}
                                    onClick={() => cell.current && setSelectedDay(cell.day)}
                                    className={`relative min-h-[50px] md:min-h-[110px] border-r border-b border-gray-100 p-1 md:p-3 text-left transition-all flex flex-col group
                                        ${!cell.current ? 'bg-gray-50/40' : 'bg-white'}
                                        ${isSelected ? 'ring-2 ring-inset ring-primary z-10 bg-white' : ''}
                                        ${!cell.current ? 'cursor-default' : 'hover:bg-gray-50 cursor-pointer'}
                                    `}
                                >
                                    <span className={`text-xs md:text-base font-bold ${!cell.current ? 'text-gray-200' : 'text-[#2d3748]'} ${isTodayCell ? 'text-primary' : ''}`}>
                                        {cell.day}
                                    </span>
                                    
                                    {cell.current && plans.length > 0 && (
                                        <div className="mt-auto space-y-1">
                                            {plans.map((p, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="h-1.5 w-full rounded-full" 
                                                    style={{ backgroundColor: p.color }}
                                                    title={p.title}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Daily Manifesto Side */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-[320px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:sticky lg:top-6"
                    style={{ height: window.innerWidth > 1024 ? 'calc(100vh - 120px)' : 'auto', maxHeight: '780px' }}
                >
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                        <div>
                            <h3 className="text-sm font-bold text-[#1a202c]">Temporal Detail</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                {selectedDay ? `${MONTHS[viewMonth]} ${selectedDay}, ${viewYear}` : 'Schedule View'}
                            </p>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[11px] font-bold text-[#1a202c] shadow-sm">
                            {selectedDayPlans.length}
                        </div>
                    </div>

                    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                        {!selectedDay ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                                <span className="material-icons text-3xl text-gray-300 mb-3">touch_app</span>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Tap a date<br/>to audit plans</p>
                            </div>
                        ) : selectedDayPlans.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10">
                                <span className="material-icons text-3xl text-gray-200 mb-3">event_available</span>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No plans for<br/>this date</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedDayPlans.map((p, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-4 rounded-xl border border-gray-100 bg-[#F9FAFB] hover:border-primary/30 transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md text-white`} style={{ backgroundColor: p.color }}>
                                                {p.type}
                                            </span>
                                        </div>
                                        <p className="text-[12px] font-bold text-[#1a202c] leading-tight mb-2 uppercase">{p.title}</p>
                                        <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400 uppercase">
                                            <div className="flex items-center gap-1">
                                                <span className="material-icons text-[12px]">schedule</span>
                                                {p.startDate} to {p.endDate}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TravellerCalendar;
