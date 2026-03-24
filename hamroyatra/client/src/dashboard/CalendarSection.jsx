import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardAPI } from './api';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const STATUS_MAP = {
    low: { bg: 'bg-[#EBFDF0]', text: 'text-[#1D7447]', label: 'Rooms:' },
    med: { bg: 'bg-[#C6F6D5]', text: 'text-[#1D7447]', label: 'Rooms:' },
    high: { bg: 'bg-[#FEF9C3]', text: 'text-[#854D0E]', label: 'Rooms:' },
    full: { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', label: 'Rooms:' },
    empty: { bg: 'bg-white', text: 'text-gray-400', label: '' }
};

const getStatus = (count) => {
    if (count === 0) return 'empty';
    if (count <= 3) return 'low';
    if (count <= 8) return 'med';
    if (count < 14) return 'high';
    return 'full';
};

const CalendarSection = ({ bookings: allBookings, onRefresh }) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [monthBookings, setMonthBookings] = useState([]);
    const [selectedDay, setSelectedDay] = useState(today.getDate());
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [loadingCal, setLoadingCal] = useState(false);

    useEffect(() => {
        fetchCalendar();
    }, [viewYear, viewMonth]);

    useEffect(() => {
        if (monthBookings.length > 0 && selectedDay) {
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
            const bks = monthBookings.filter(b => b.startDate === dateStr);
            setSelectedBookings(bks);
        } else {
            setSelectedBookings([]);
        }
    }, [monthBookings, selectedDay]);

    const fetchCalendar = async () => {
        try {
            setLoadingCal(true);
            const res = await dashboardAPI.getCalendarBookings(viewYear, viewMonth + 1);
            setMonthBookings(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCal(false);
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

    const getDayInfo = (day, isCurrent) => {
        if (!isCurrent) return null;
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayBks = monthBookings.filter(b => b.startDate === dateStr);
        const roomCount = dayBks.filter(b => b.bookingType === 'room').reduce((a, b) => a + (b.roomCount || 1), 0);
        const hasService = dayBks.some(b => b.bookingType === 'package' || b.bookingType === 'guide');
        return { roomCount, hasService };
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header Section */}
            <div className="mb-4 md:mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-[#1a202c]">Availability & Guide Schedule</h1>
                <p className="text-[11px] md:text-sm text-gray-500 mt-1 font-medium">Manage room occupancy and guide assignments across all active packages.</p>
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

                    {/* Legend bar */}
                    <div className="px-4 md:px-6 py-4 bg-white border-b border-gray-50 flex items-center justify-between flex-wrap gap-2 md:gap-4">
                        <div className="flex items-center gap-3 md:gap-5 flex-wrap">
                            {[
                                { color: '#EBFDF0', label: 'Low (≤3)' },
                                { color: '#C6F6D5', label: 'Med (≤8)' },
                                { color: '#FEF9C3', label: 'High (≤14)' },
                                { color: '#FEE2E2', label: 'Full (>14)' }
                            ].map(l => (
                                <div key={l.label} className="flex items-center gap-1.5 md:gap-2">
                                    <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-md" style={{ backgroundColor: l.color }} />
                                    <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-tight">{l.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#10b981]" />
                            <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-tight">Guide Assigned</span>
                        </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-gray-100">
                        {DAYS.map(d => (
                            <div key={d} className="py-3 text-center text-[10px] font-bold text-gray-400 tracking-[0.1em]">{d}</div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className={`grid grid-cols-7 ${loadingCal ? 'opacity-50' : ''} transition-opacity`}>
                        {cells.map((cell, i) => {
                            const info = getDayInfo(cell.day, cell.current);
                            const statusKey = info ? getStatus(info.roomCount) : 'empty';
                            const status = STATUS_MAP[statusKey];
                            const isSelected = selectedDay === cell.day && cell.current;
                            const isTodayCell = cell.current && cell.day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

                            return (
                                <button
                                    key={i}
                                    onClick={() => cell.current && setSelectedDay(cell.day)}
                                    className={`relative min-h-[50px] md:min-h-[110px] border-r border-b border-gray-100 p-1 md:p-3 text-left transition-all flex flex-col group
                                        ${!cell.current ? 'bg-gray-50/40' : status.bg}
                                        ${isSelected ? 'ring-2 ring-inset ring-[#10b981] z-10 bg-white' : ''}
                                        ${!cell.current ? 'cursor-default' : 'hover:brightness-95 cursor-pointer'}
                                    `}
                                >
                                    <span className={`text-xs md:text-base font-bold ${!cell.current ? 'text-gray-200' : 'text-[#2d3748]'} ${isTodayCell ? 'text-[#10b981]' : ''}`}>
                                        {cell.day}
                                    </span>
                                    
                                    {cell.current && (
                                        <div className="mt-auto space-y-1">
                                            {info.roomCount > 0 && (
                                                <p className={`text-[9.5px] font-bold ${status.text} opacity-80`}>
                                                    Rooms: {info.roomCount}/20
                                                </p>
                                            )}
                                            {info.hasService && (
                                                <div className="flex justify-end">
                                                    <div className="w-3 h-3 rounded-full bg-[#10b981] shadow-sm ring-2 ring-white" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Daily Manifesto Side (On the Right) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-[320px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:sticky lg:top-6"
                    style={{ height: window.innerWidth > 1024 ? 'calc(100vh - 120px)' : 'auto', maxHeight: '780px' }}
                >
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                        <div>
                            <h3 className="text-sm font-bold text-[#1a202c]">Daily Manifest</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                {selectedDay ? `${MONTHS[viewMonth]} ${selectedDay}, ${viewYear}` : 'Schedule View'}
                            </p>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[11px] font-bold text-[#1a202c] shadow-sm">
                            {selectedBookings.length}
                        </div>
                    </div>

                    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                        {!selectedDay ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                                <span className="material-icons text-3xl text-gray-300 mb-3">touch_app</span>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Tap a date cell<br/>to audit listings</p>
                            </div>
                        ) : selectedBookings.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10">
                                <span className="material-icons text-3xl text-gray-200 mb-3">event_available</span>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No listings for<br/>this date</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedBookings.map((b, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-4 rounded-xl border border-gray-100 bg-[#F9FAFB] hover:border-[#10b981]/30 transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                b.bookingType === 'room' ? 'bg-[#EBFDF0] text-[#1D7447]' :
                                                'bg-[#E6FFFA] text-[#2C7A7B]'
                                            }`}>
                                                {b.bookingType}
                                            </span>
                                            <span className="text-[10px] font-bold text-[#1a202c]">NPR {parseFloat(b.totalAmount || 0).toLocaleString()}</span>
                                        </div>
                                        <p className="text-[12px] font-bold text-[#1a202c] leading-tight mb-2 uppercase">{b.guestName}</p>
                                        <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400 uppercase">
                                            {b.bookingType === 'room' ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="material-icons text-[12px]">bed</span>
                                                    {b.roomCount} Units
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <span className="material-icons text-[12px]">person</span>
                                                    {b.guideName || 'Analyst'}
                                                </div>
                                            )}
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

export default CalendarSection;
