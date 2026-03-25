import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const TravellerTripProgress = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewingItem, setReviewingItem] = useState(null);
    const [reviewText, setReviewText] = useState('');

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/dashboard/traveller/bookings`, { withCredentials: true });
            const item = res.data.find(b => b.id === id);
            if (!item) throw new Error('Booking not found');
            setBooking(item);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const startTrip = async () => {
        try {
            const res = await axios.put(`${BASE_URL}/dashboard/bookings/${id}/start-trip`, {}, { withCredentials: true });
            setBooking(res.data.booking);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to start trip');
        }
    };

    const updateChecklist = async (itemId, completed, review = null) => {
        try {
            const res = await axios.put(`${BASE_URL}/dashboard/bookings/${id}/checklist/update`, {
                itemId,
                completed,
                review
            }, { withCredentials: true });
            setBooking(res.data.booking);
            setReviewingItem(null);
            setReviewText('');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update progress');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold uppercase tracking-widest">{error}</div>;

    const completedCount = booking.checklist?.filter(i => i.completed).length || 0;
    const totalCount = booking.checklist?.length || 0;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0D1F18] rounded-[32px] p-8 lg:p-10 text-white relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                
                <button 
                    onClick={() => navigate('/dashboard/bookings')}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-6"
                >
                    <span className="material-icons text-[16px]">arrow_back</span>
                    Back to Inventory
                </button>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                                {booking.bookingType}
                            </span>
                            <span className="text-white/40 text-[10px] font-medium tracking-wide">
                                {booking.serialId}
                            </span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black italic tracking-tight mb-2">
                            {booking.guestName}'s Journey
                        </h1>
                        <p className="text-white/60 text-[13px] font-medium max-w-md">
                            Track your trekking progress, check milestones, and share private feedback with your agent.
                        </p>
                    </div>

                    {booking.tripStatus === 'pending' ? (
                        <button 
                            onClick={startTrip}
                            className="bg-primary hover:bg-emerald-600 px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 active:translate-y-0"
                        >
                            Commence Adventure
                        </button>
                    ) : (
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Global Progress</div>
                            <div className="text-4xl font-black italic text-primary">{Math.round(progress)}%</div>
                        </div>
                    )}
                </div>

                {booking.tripStatus !== 'pending' && (
                    <div className="mt-10 h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="absolute inset-y-0 left-0 bg-primary"
                        />
                    </div>
                )}
            </motion.div>

            {/* Content Section */}
            {booking.tripStatus === 'pending' ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center space-y-4"
                >
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-icons text-[32px] text-gray-200">rocket_launch</span>
                    </div>
                    <h3 className="text-[14px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">Ready to Launch?</h3>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                        Your itinerary is ready. Once you click "Commence Adventure", you can start tracking your daily progress and milestones.
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2 mb-6">
                        <h3 className="text-[11px] font-black text-[#0D1F18] uppercase tracking-[0.25em]">Itinerary Checklist</h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{completedCount}/{totalCount} Completed</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {booking.checklist?.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-white rounded-3xl p-6 border transition-all ${item.completed ? 'border-emerald-100 bg-emerald-50/20' : 'border-gray-100 hover:border-primary/20'}`}
                            >
                                <div className="flex items-start gap-4 lg:gap-6">
                                    <button 
                                        onClick={() => updateChecklist(item.id, !item.completed)}
                                        className={`w-10 lg:w-12 h-10 lg:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${item.completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[#FAFAF8] text-gray-200 border border-gray-100 hover:border-primary/40 hover:text-primary/40'}`}
                                    >
                                        <span className="material-icons text-[20px] lg:text-[24px]">
                                            {item.completed ? 'check_circle' : 'circle'}
                                        </span>
                                    </button>

                                    <div className="flex-1">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2">
                                            <h4 className={`text-sm lg:text-base font-black italic tracking-tight ${item.completed ? 'text-emerald-900 line-through opacity-60' : 'text-[#0D1F18]'}`}>
                                                {item.title}
                                            </h4>
                                            {item.completedAt && (
                                                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                                                    Reached: {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] lg:text-[12px] text-gray-500 font-medium leading-relaxed mb-4">
                                            {item.location || 'Location details in itinerary'}
                                        </p>

                                        {item.completed ? (
                                            <div className="pt-4 border-t border-emerald-100 flex items-start gap-3">
                                                <span className="material-icons text-[16px] text-emerald-400 mt-0.5">rate_review</span>
                                                <div className="flex-1">
                                                    <p className="text-[11px] font-black text-emerald-900 uppercase tracking-widest mb-1 opacity-40">Agent Feedback</p>
                                                    {item.review ? (
                                                        <p className="text-[13px] text-emerald-700/80 font-medium italic italic">"{item.review}"</p>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setReviewingItem(item)}
                                                            className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                                                        >
                                                            + Add Private Review
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest italic">Awaiting arrival...</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Review Modal */}
            <AnimatePresence>
                {reviewingItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0D1F18]/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-icons text-[18px]">rate_review</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[#0D1F18] italic">Agent Review</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Share your internal feedback</p>
                                </div>
                            </div>
                            
                            <p className="text-[12px] text-gray-500 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100 font-medium italic">
                                "{reviewingItem.title}"
                            </p>

                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="How was the experience at this milestone? (Internal only, visible to agent)"
                                className="w-full h-32 bg-[#F7F6F3] rounded-2xl p-5 text-[14px] font-medium text-[#0D1F18] outline-none border border-transparent focus:border-primary/20 transition-all resize-none mb-6"
                            />

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setReviewingItem(null)}
                                    className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => updateChecklist(reviewingItem.id, true, reviewText)}
                                    className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-[#0D1F18] shadow-lg shadow-black/10"
                                >
                                    Log Review
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TravellerTripProgress;
