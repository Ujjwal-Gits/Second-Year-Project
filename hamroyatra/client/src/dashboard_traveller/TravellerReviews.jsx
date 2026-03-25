import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const TravellerReviews = ({ user }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/dashboard/traveller/reviews`, { withCredentials: true });
            setReviews(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setLoading(false);
        }
    };

    const aggregateRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

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
            <div>
                <h2 className="text-[24px] font-black text-[#0D1F18] tracking-tight flex items-center gap-3">
                    Personal Critic Ledger
                    <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                        My Testimonials
                    </span>
                </h2>
                <p className="text-[11px] text-gray-400 mt-1 font-bold uppercase tracking-[0.2em]">Temporal Record of your verified experiences</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Average Score Given</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-[#0D1F18]">{aggregateRating}</span>
                        <div className="flex gap-0.5 text-[#C5A059] mb-1.5">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`material-icons text-[14px] ${i < Math.round(aggregateRating) ? 'text-[#C5A059]' : 'text-gray-100'}`}>star</span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Contributions</p>
                    <span className="text-3xl font-black text-[#0D1F18]">{reviews.length}</span>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Experience Impact</p>
                    <span className="text-3xl font-black text-[#0D1F18]">{reviews.length > 5 ? 'High' : reviews.length > 0 ? 'Medium' : 'None'}</span>
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                    {reviews.length > 0 ? reviews.map((review, i) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[100px] -z-10 group-hover:bg-[#0D1F18]/5 transition-colors" />
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#0D1F18] flex items-center justify-center text-white font-black text-lg">
                                        {(review.companyName || 'H').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-black text-[#0D1F18] tracking-tight">{review.companyName}</h4>
                                        <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest">{review.serviceType}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex gap-0.5 text-[#C5A059] mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`material-icons text-[16px] ${i < review.rating ? 'text-[#C5A059]' : 'text-gray-100'}`}>star</span>
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                        {new Date(review.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            <div className="relative">
                                <span className="material-icons absolute -left-2 -top-2 text-[48px] text-gray-50 opacity-50 select-none">format_quote</span>
                                <p className="text-[13px] text-gray-600 leading-relaxed relative z-10 font-medium italic">
                                    "{review.message}"
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${review.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${review.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {review.status === 'approved' ? 'Visible to Public' : 'Pending Verification'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-2 bg-white rounded-[40px] py-32 text-center border border-dashed border-gray-100">
                            <span className="material-icons text-[48px] text-gray-100 mb-4">rate_review</span>
                            <h4 className="text-[14px] font-black text-gray-300 uppercase tracking-widest">No Feedback Published</h4>
                            <p className="text-[11px] text-gray-400 mt-2 font-medium">Your shared experiences will be indexed here.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TravellerReviews;
