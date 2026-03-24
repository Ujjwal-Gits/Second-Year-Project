import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardAPI } from './api';

const ReviewsSection = ({ user }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data } = await dashboardAPI.getReviews();
            setReviews(data);
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const aggregateRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";
    
    const verificationRate = reviews.length > 0
        ? Math.round((reviews.filter(r => r.status === 'approved').length / reviews.length) * 100)
        : 0;

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header */}
            <div>
                <h2 className="text-[24px] font-black text-[#0D1F18] tracking-tight flex items-center gap-3">
                    Experience Ledger
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                        Public Sentiment
                    </span>
                </h2>
                <p className="text-[11px] text-gray-400 mt-1 font-bold uppercase tracking-[0.2em]">Verified Customer Feedback Repository</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Aggregate Rating</p>
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
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Submissions</p>
                    <span className="text-3xl font-black text-[#0D1F18]">{reviews.length}</span>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Verification Rate</p>
                    <span className="text-3xl font-black text-[#0D1F18]">{verificationRate}%</span>
                </div>
            </div>

            {/* Reviews Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-40">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin" />
                </div>
            ) : (
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
                                {/* Decorative Accent */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[100px] -z-10 group-hover:bg-[#0D1F18]/5 transition-colors" />
                                
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#0D1F18] flex items-center justify-center text-white font-black text-lg">
                                            {review.customerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-black text-[#0D1F18] tracking-tight">{review.customerName}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{review.serviceType || 'Public Service'}</p>
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

                                {/* Message */}
                                <div className="relative">
                                    <span className="material-icons absolute -left-2 -top-2 text-[48px] text-gray-50 opacity-50 select-none">format_quote</span>
                                    <p className="text-[13px] text-gray-600 leading-relaxed relative z-10 font-medium italic">
                                        "{review.message}"
                                    </p>
                                </div>

                                {/* Card Footer */}
                                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${review.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${review.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {review.status === 'approved' ? 'Verified Account' : 'Pending Audit'}
                                        </span>
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 hover:bg-[#0D1F18] hover:text-white transition-all">
                                        <span className="material-icons text-[16px]">more_horiz</span>
                                    </button>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-2 bg-white rounded-[40px] py-32 text-center border border-dashed border-gray-100">
                                <span className="material-icons text-[48px] text-gray-100 mb-4">rate_review</span>
                                <h4 className="text-[14px] font-black text-gray-300 uppercase tracking-widest">No Feedback Recorded</h4>
                                <p className="text-[11px] text-gray-400 mt-2 font-medium">Customer sentiment will appear here once publicly submitted.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ReviewsSection;
