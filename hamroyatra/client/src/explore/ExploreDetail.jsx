import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BookingCard = ({ listing, bookingForm, setBookingForm, calculateTotal, handleBooking, bookingStatus }) => {
    const allRooms = [
        { key: 'ac',     label: 'AC Room',      qty: listing.acRooms,     price: listing.acPrice,     icon: 'ac_unit'  },
        { key: 'nonAc',  label: 'Non-AC Room',   qty: listing.nonAcRooms,  price: listing.nonAcPrice,  icon: 'hotel'    },
        { key: 'family', label: 'Family Suite',  qty: listing.familyRooms, price: listing.familyPrice, icon: 'groups'   },
        { key: 'couple', label: 'Couple Suite',  qty: listing.coupleRooms, price: listing.couplePrice, icon: 'favorite' },
    ].filter(r => (r.qty > 0 || parseFloat(r.price) > 0) || bookingForm.roomSelection[r.key] > 0);

    const upd = (key, d, max) => setBookingForm(b => ({
        ...b,
        roomSelection: { ...b.roomSelection, [key]: Math.min(max || 99, Math.max(0, b.roomSelection[key] + d)) }
    }));

    return (
        <div id="reservation-card" className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm">

            {/* Price Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.18em] mb-0.5">Est. Total</p>
                    <p className="text-[20px] font-black text-[#1A2B23] tracking-tight leading-none">NPR {calculateTotal().toLocaleString()}</p>
                </div>
                <div className="h-8 w-px bg-gray-100" />
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full">In Stock</span>
            </div>

            <form onSubmit={handleBooking} className="space-y-3">

                {/* Date Selection Grid - Unified Row */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest pl-1">Commencement</label>
                        <div className="flex items-center gap-2 bg-[#F7F6F3] rounded-xl px-3 h-11 focus-within:ring-1 focus-within:ring-[#1A2B23]/10 transition-all">
                                <input 
                                    type="date" 
                                    required 
                                    value={bookingForm.startDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => {
                                        const start = new Date(e.target.value);
                                        if (isNaN(start.getTime())) return;
                                        
                                        // Logic: Use listing duration if available and NOT a hotel
                                        const isFixedDuration = listing.type !== 'hotel' && parseInt(listing.duration) > 0;
                                        const duration = parseInt(listing.duration) || 0;
                                        const newForm = { ...bookingForm, startDate: e.target.value };
                                        
                                        if (isFixedDuration) {
                                            const end = new Date(start);
                                            end.setDate(start.getDate() + duration);
                                            newForm.endDate = end.toISOString().split('T')[0];
                                        } else if (!newForm.endDate || new Date(newForm.endDate) <= start) {
                                            // Default to +1 day for flexibility if empty or invalid
                                            const end = new Date(start);
                                            end.setDate(start.getDate() + 1);
                                            newForm.endDate = end.toISOString().split('T')[0];
                                        }
                                        setBookingForm(newForm);
                                    }}
                                    className="bg-transparent text-[10px] font-bold text-[#1A2B23] outline-none w-full cursor-pointer" 
                                />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest pl-1">Conclusion</label>
                        <div className={`flex items-center gap-2 rounded-xl px-3 h-11 transition-all ${
                            (listing.duration > 0 && listing.type !== 'hotel') 
                                ? 'bg-gray-100/50 cursor-not-allowed' 
                                : 'bg-[#F7F6F3] focus-within:ring-1 focus-within:ring-[#1A2B23]/10'
                        }`}>
                            <input 
                                type="date" 
                                required 
                                value={bookingForm.endDate || ''}
                                min={bookingForm.startDate || new Date().toISOString().split('T')[0]}
                                readOnly={parseInt(listing.duration) > 0 && listing.type !== 'hotel'}
                                onChange={e => setBookingForm(b => ({ ...b, endDate: e.target.value }))}
                                className={`bg-transparent text-[10px] font-bold outline-none w-full ${
                                    (listing.duration > 0 && listing.type !== 'hotel') 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-[#1A2B23] cursor-pointer'
                                }`} 
                            />
                        </div>
                    </div>
                </div>

                {listing.type !== 'hotel' ? (
                    /* Travellers row for non-hotel */
                    <div className="flex items-center justify-between bg-[#F7F6F3] rounded-xl px-4 h-11">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Travellers</span>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setBookingForm(b => ({ ...b, roomCount: Math.max(1, b.roomCount - 1) }))}
                                className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors">
                                <span className="material-icons text-[13px]">remove</span>
                            </button>
                            <span className="text-[12px] font-black text-[#1A2B23] min-w-[18px] text-center">{bookingForm.roomCount}</span>
                            <button type="button" onClick={() => setBookingForm(b => ({ ...b, roomCount: b.roomCount + 1 }))}
                                className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-[#1A2B23] transition-colors">
                                <span className="material-icons text-[13px]">add</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Room grid — 2 columns, all types unified */
                    <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.18em] mb-2 px-1">Select Rooms</p>
                        <div className="grid grid-cols-2 gap-2">
                            {allRooms.map(room => {
                                const sel = bookingForm.roomSelection[room.key] > 0;
                                return (
                                    <div key={room.key}
                                        className={`flex flex-col justify-between p-3 rounded-xl transition-all border ${
                                            sel ? 'border-[#1A2B23]/15 bg-[#1A2B23]/[0.03]' : 'border-gray-100 bg-[#FAFAF9]'
                                        }`}>
                                        {/* Top row: name + qty badge */}
                                        <div className="flex items-start justify-between mb-2">
                                            <span className={`text-[10px] font-black leading-tight ${sel ? 'text-[#1A2B23]' : 'text-gray-500'}`}>
                                                {room.label}
                                            </span>
                                            {sel && (
                                                <span className="text-[8px] font-black text-[#1A2B23] bg-[#1A2B23]/10 px-1.5 py-0.5 rounded-md leading-none">
                                                    ×{bookingForm.roomSelection[room.key]}
                                                </span>
                                            )}
                                        </div>
                                        {/* Price */}
                                        <p className="text-[9px] font-bold text-gray-700 mb-3">
                                            NPR {parseFloat(room.price).toLocaleString()}
                                            <span className="text-gray-500"> · {room.qty} left</span>
                                        </p>
                                        {/* Stepper */}
                                        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-100 p-0.5">
                                            <button type="button" onClick={() => upd(room.key, -1, room.qty)}
                                                className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 rounded-md transition-colors">
                                                <span className="material-icons text-[12px]">remove</span>
                                            </button>
                                            <span className="text-[11px] font-black text-[#1A2B23]">{bookingForm.roomSelection[room.key]}</span>
                                            <button type="button" onClick={() => upd(room.key, 1, room.qty)}
                                                className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-emerald-500 rounded-md transition-colors">
                                                <span className="material-icons text-[12px]">add</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Special Requests */}
                <div className="flex items-center gap-3 bg-[#F7F6F3] rounded-xl px-4 h-11 focus-within:ring-1 focus-within:ring-[#1A2B23]/10 transition-all">
                    <span className="material-icons text-gray-300 text-[14px]">edit_note</span>
                    <input 
                        type="text" 
                        placeholder="Special Requests (eg: late check-in)"
                        value={bookingForm.notes}
                        onChange={e => setBookingForm(b => ({ ...b, notes: e.target.value }))}
                        className="bg-transparent text-[10px] font-bold text-[#1A2B23] outline-none w-full placeholder:text-gray-400" 
                    />
                </div>

                {/* CTA */}
                <button type="submit"
                    className="w-full h-11 bg-[#1A2B23] text-white rounded-xl text-[9px] font-black uppercase tracking-[0.22em] hover:bg-[#111f19] active:scale-[0.98] transition-all shadow-sm mt-1">
                    Finalize Booking
                </button>

                <AnimatePresence>
                    {bookingStatus.msg && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`p-3 rounded-lg text-[8px] font-black uppercase tracking-widest text-center ${
                                bookingStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                            }`}>
                            {bookingStatus.msg}
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
};

const ExploreDetail = ({ isAuthenticated, user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState(0);
    const [bookingStatus, setBookingStatus] = useState({ type: '', msg: '' });
    const [messageStatus, setMessageStatus] = useState({ type: '', msg: '' });
    const [reviewStatus, setReviewStatus] = useState({ type: '', msg: '' });
    const [reviews, setReviews] = useState([]);

    const [bookingForm, setBookingForm] = useState({ 
        startDate: '', 
        endDate: '',
        roomCount: 1, 
        roomSelection: { ac: 0, nonAc: 0, family: 0, couple: 0 },
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        notes: ''
    });
    const [messageForm, setMessageForm] = useState({ customerName: '', customerEmail: '', message: '' });
    const [reviewForm, setReviewForm] = useState({ customerName: '', rating: 0, message: '' });
    const [hoverRating, setHoverRating] = useState(0);
    const [showMobileBar, setShowMobileBar] = useState(false);

    // Initial pre-fill when user is loaded
    useEffect(() => {
        if (user) {
            setMessageForm(prev => ({
                ...prev,
                customerName: user.fullName || user.username || '',
                customerEmail: user.email || ''
            }));
            setReviewForm(prev => ({
                ...prev,
                customerName: user.fullName || user.username || ''
            }));
            setBookingForm(prev => ({
                ...prev,
                guestName: user.fullName || user.username || '',
                guestEmail: user.email || '',
                guestPhone: user.phoneNo || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:5000/api/public/listings/${id}`);
                setData(res.data);
                // Fetch reviews for this listing's company
                if (res.data?.listing?.companyName) {
                    try {
                        const reviewRes = await axios.get(`http://localhost:5000/api/public/reviews?companyName=${encodeURIComponent(res.data.listing.companyName)}&listingId=${id}`);
                        setReviews(reviewRes.data || []);
                    } catch (e) {
                        setReviews([]);
                    }
                }
            } catch (err) {
                console.error('Detail fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        const handleScroll = () => {
            const bookingCard = document.getElementById('reservation-card');
            if (bookingCard) {
                const rect = bookingCard.getBoundingClientRect();
                setShowMobileBar(rect.top > window.innerHeight);
            }
        };

        window.addEventListener('scroll', handleScroll);
        fetchDetail();
        window.scrollTo(0, 0);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    const calculateTotal = () => {
        if (!data?.listing) return 0;
        const listing = data.listing;
        
        // Calculate nights if it's a hotel
        let multiplier = 1;
        if (listing.type === 'hotel' && bookingForm.startDate && bookingForm.endDate) {
            const start = new Date(bookingForm.startDate);
            const end = new Date(bookingForm.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            multiplier = diffDays || 1;
        }

        if (listing.type !== 'hotel') return parseFloat(listing.price || 0) * (bookingForm.roomCount || 1);
        
        let total = 0;
        const prices = {
            ac: parseFloat(listing.acPrice || 0),
            nonAc: parseFloat(listing.nonAcPrice || 0),
            family: parseFloat(listing.familyPrice || 0),
            couple: parseFloat(listing.couplePrice || 0)
        };
        
        Object.keys(bookingForm.roomSelection).forEach(type => {
            total += (bookingForm.roomSelection[type] || 0) * prices[type];
        });
        return total * multiplier;
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setBookingStatus({ type: 'error', msg: 'Please sign in to reserve this experience.' });
            return;
        }

        const { listing } = data;
        const totalRooms = Object.values(bookingForm.roomSelection).reduce((a, b) => a + b, 0);
        if (listing.type === 'hotel' && totalRooms === 0) {
            setBookingStatus({ type: 'error', msg: 'Please select at least one room.' });
            return;
        }

        // Map listing type to booking type accepted by backend
        const bookingTypeMap = { hotel: 'room', trekking: 'package', travel: 'package' };
        const bookingType = bookingTypeMap[listing.type] || 'package';

        try {
            const payload = {
                listingId: id,
                bookingType,
                startDate: bookingForm.startDate,
                endDate: bookingForm.endDate,
                totalAmount: calculateTotal(),
                companyName: listing.companyName,
                guestName: user.fullName || user.username || 'Guest',
                guestEmail: user.email || '',
                guestPhone: user.phoneNo || '',
                roomCount: listing.type === 'hotel' ? totalRooms : (bookingForm.roomCount || 1),
                roomSelection: listing.type === 'hotel' ? bookingForm.roomSelection : {},
                notes: bookingForm.notes || ''
            };

            await axios.post('http://localhost:5000/api/dashboard/bookings', payload, { withCredentials: true });
            setBookingStatus({ type: 'success', msg: 'Reservation submitted! The operator will confirm shortly.' });
        } catch (err) {
            console.error('Booking failed:', err.response?.data || err.message);
            setBookingStatus({ type: 'error', msg: err.response?.data?.error || 'Reservation failed. Please try later.' });
        }
    };

    const handleMessage = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setMessageStatus({ type: 'error', msg: 'Please sign in to contact the operator.' });
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/dashboard/public/message', {
                ...messageForm,
                companyName: data.listing.companyName,
                subject: `Inquiry: ${data.listing.title}`,
                travellerId: user.id
            }, { withCredentials: true });
            setMessageStatus({ type: 'success', msg: 'Inquiry sent! The partner will reach out soon.' });
            setMessageForm(prev => ({ ...prev, message: '' }));
        } catch (err) {
            setMessageStatus({ type: 'error', msg: 'Failed to send. Please try again.' });
        }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setReviewStatus({ type: 'error', msg: 'Please sign in to share your experience.' });
            return;
        }
        if (reviewForm.rating === 0) {
            setReviewStatus({ type: 'error', msg: 'Please select a star rating.' });
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/dashboard/public/review', {
                ...reviewForm,
                companyName: data.listing.companyName,
                serviceType: data.listing.type,
                listingId: id,
                travellerId: user.id
            }, { withCredentials: true });
            setReviewStatus({ type: 'success', msg: 'Thank you! Your review has been submitted.' });
            setReviewForm(prev => ({ ...prev, rating: 0, message: '' }));
            setHoverRating(0);
            // Refresh reviews
            try {
                const reviewRes = await axios.get(`http://localhost:5000/api/public/reviews?companyName=${encodeURIComponent(data.listing.companyName)}&listingId=${id}`);
                setReviews(reviewRes.data || []);
            } catch (e) {}
        } catch (err) {
            setReviewStatus({ type: 'error', msg: 'Failed to submit review. Please try again.' });
        }
    };

    // Calculate average rating from reviews
    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8]">
            <div className="flex flex-col items-center gap-6">
                <div className="w-12 h-12 border-[3px] border-[#1A2B23]/10 border-t-[#1A2B23] rounded-full animate-spin" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">Loading Experience</span>
            </div>
        </div>
    );

    if (!data) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF8] gap-5">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="material-icons text-gray-300 text-3xl">search_off</span>
            </div>
            <p className="text-gray-500 font-bold text-sm">Experience not found</p>
            <button onClick={() => navigate('/explore')} className="text-[#1A2B23] text-[10px] font-black uppercase tracking-[0.2em] hover:underline flex items-center gap-2">
                <span className="material-icons text-sm">arrow_back</span>
                Back to Explore
            </button>
        </div>
    );

    const { listing, company } = data;
    const images = listing.images?.length > 0
        ? listing.images.map(img => img.startsWith('http') ? img : `http://localhost:5000${img}`)
        : ['https://images.unsplash.com/photo-1544735749-2e78311e09f1?q=80&w=1470&auto=format&fit=crop'];

    const durationDays = listing.duration || 1;
    const duration = listing.type === 'hotel' ? 'Per Night' : `${durationDays} Day${durationDays !== 1 ? 's' : ''}`;
    const typeLabels = { 
        hotel: listing.hotelCategory === 'homestay' ? 'Homestay' : 'Hotel Stay', 
        trekking: 'Adventure Trek', 
        travel: 'Curated Tour' 
    };

    return (
        <div className="bg-[#FAFAF8] min-h-screen">
            {/* ═══ IMMERSIVE GALLERY ═══ */}
            <section className="pt-[88px]">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                    {/* Back Navigation */}
                    <div className="py-6">
                        <button 
                            onClick={() => navigate('/explore')}
                            className="flex items-center gap-2.5 text-gray-400 hover:text-[#1A2B23] transition-colors group"
                        >
                            <span className="material-icons text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Back to Collection</span>
                        </button>
                    </div>

                    {/* Gallery Grid: 1 Feature + 2 Supporting */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 rounded-[1.5rem] overflow-hidden h-[350px] md:h-[520px]">
                        {/* Feature Image */}
                        <div 
                            className="lg:col-span-2 lg:row-span-2 relative cursor-pointer overflow-hidden"
                            onClick={() => setSelectedImg(0)}
                        >
                            <img 
                                src={images[selectedImg] || images[0]} 
                                className="w-full h-full object-cover" 
                                alt={listing.title}
                            />
                        </div>
                        
                        {/* Supporting Images */}
                        {[1, 2].map((idx) => (
                            <div 
                                key={idx}
                                className="hidden lg:block relative cursor-pointer overflow-hidden"
                                onClick={() => images[idx] && setSelectedImg(idx)}
                            >
                                <img 
                                    src={images[idx] || images[0]} 
                                    className="w-full h-full object-cover" 
                                    alt="" 
                                />
                                {idx === 2 && images.length > 3 && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                                        <span className="text-white font-bold text-[10px] tracking-widest uppercase">+{images.length - 3} More Photos</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Thumbnail Strip (Mobile) */}
                    {images.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar lg:hidden pb-2">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImg(i)}
                                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-[#1A2B23] shadow-lg' : 'border-transparent opacity-60'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ MAIN CONTENT ═══ */}
            <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                    
                    {/* ─── LEFT CONTENT ─── */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        
                        {/* Header */}
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1A2B23] text-white text-[8px] font-bold tracking-[0.2em] uppercase">
                                    <span className="material-icons text-[11px]">
                                        {listing.type === 'hotel' ? 'hotel' : listing.type === 'trekking' ? 'terrain' : 'explore'}
                                    </span>
                                    {typeLabels[listing.type] || listing.type}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-[8px] font-bold tracking-[0.15em] uppercase">
                                    <span className="material-icons text-[11px]">schedule</span>
                                    {duration}
                                </span>
                            </div>

                            <h1 className="font-serif text-3xl md:text-[2.8rem] text-[#1A2B23] font-bold tracking-tight leading-[1.15] mb-5">
                                {listing.title}
                            </h1>

                            {/* Company + Review Summary */}
                            <div className="flex items-center gap-4 flex-wrap">
                            <Link 
                                to={`/agent/${company?.id || listing.agentId}`}
                                className="flex items-center gap-4 group-hover:opacity-80 transition-opacity"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#1A2B23] flex items-center justify-center overflow-hidden">
                                        <span className="text-white text-[10px] font-black">{(company?.companyName || listing.companyName || 'H')[0]}</span>
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold text-[#1A2B23] block leading-tight hover:underline">{company?.companyName || listing.companyName}</span>
                                        {company?.verified && (
                                            <span className="text-[8px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                                Verified Partner <span className="material-icons text-green-500 text-[10px]">verified</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                                <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                                <div className="flex items-center gap-1.5">
                                    {avgRating ? (
                                        <>
                                            <span className="material-icons text-[#C5A059] text-sm">star</span>
                                            <span className="text-sm font-black text-[#1A2B23]">{avgRating}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                                        </>
                                    ) : (
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">No Reviews Yet</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-100 mb-10" />

                        {/* Minimal Info Grid */}
                        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10 py-6 border-y border-gray-100/60">
                            {[
                                { icon: 'hotel', label: typeLabels[listing.type] || listing.type, sublabel: 'Identity' },
                                { icon: 'schedule', label: duration, sublabel: 'Duration' },
                                { icon: 'location_on', label: 'Nepal', sublabel: 'Location' },
                            ].map((chip, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#F7F6F3] flex items-center justify-center">
                                        <span className="material-icons text-base text-[#1A2B23] opacity-60">{chip.icon}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-black text-[#C5A059] uppercase tracking-[0.2em] leading-none mb-1">{chip.sublabel}</span>
                                        <span className="text-[11px] lg:text-[12px] font-black text-[#1A2B23] leading-tight tracking-tight truncate">{chip.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Services & Amenities Tags */}
                        {listing.amenities && listing.amenities.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-[11px] font-black text-[#C5A059] uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                                    <span className="w-8 h-px bg-[#C5A059]/30"></span>
                                    Included Amenities
                                </h3>
                                <div className="grid grid-cols-3 gap-2 md:gap-3">
                                    {listing.amenities.map((amenity, i) => (
                                        <div key={i} className="flex items-center gap-2 px-2.5 py-3 bg-white border border-gray-100/60 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="w-5 h-5 rounded-lg bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                                                <span className="material-icons text-[#C5A059] text-[12px]">check</span>
                                            </div>
                                            <span className="text-[9px] md:text-[11px] font-bold text-[#1A2B23] tracking-tight leading-tight line-clamp-2">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mobile Booking Section Proxy (shown only on mobile below amenities) */}
                        <div className="lg:hidden mb-14">
                            <BookingCard 
                                listing={listing} 
                                bookingForm={bookingForm} 
                                setBookingForm={setBookingForm}
                                calculateTotal={calculateTotal}
                                handleBooking={handleBooking}
                                bookingStatus={bookingStatus}
                            />
                        </div>

                        {/* About */}
                        <div className="mb-14">
                            <h3 className="text-[13px] font-black text-[#1A2B23] uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                                <span className="w-5 h-0.5 bg-[#C5A059] rounded-full"></span>
                                About This Experience
                            </h3>
                            <p className="text-gray-500 text-[15px] font-light leading-[2] whitespace-pre-wrap">
                                {listing.description || 'Detailed information about this experience will be provided by the partner company. Contact the operator for more details about this experience.'}
                            </p>
                        </div>

                        {/* Itinerary Section */}
                        {(listing.type === 'trekking' || listing.type === 'travel') && listing.itinerary && listing.itinerary.length > 0 && (
                            <div className="mb-14">
                                <h3 className="text-[13px] font-black text-[#1A2B23] uppercase tracking-[0.15em] mb-8 flex items-center gap-2">
                                    <span className="w-5 h-0.5 bg-[#C5A059] rounded-full"></span>
                                    Trip Itinerary
                                </h3>
                                <div className="space-y-0 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-gradient-to-b before:from-gray-100 before:via-gray-200 before:to-gray-100">
                                    {listing.itinerary.map((desc, idx) => (
                                        <div key={idx} className="relative pl-10 pb-10 group last:pb-0">
                                            {/* Logic node */}
                                            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center group-hover:border-[#C5A059] transition-all z-10 shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#C5A059] transition-all" />
                                            </div>
                                            
                                            <div className="p-6 md:p-8 bg-white rounded-2xl border border-gray-100/80 shadow-sm group-hover:shadow-md transition-all group-hover:border-[#C5A059]/10">
                                                <p className="text-gray-500 text-[13px] font-medium leading-[1.8] whitespace-pre-wrap">
                                                    <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.2em] mr-4 inline-block">Day {idx + 1}:</span>
                                                    {desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Offers */}
                        {listing.offers && (
                            <div className="mb-12">
                                <h3 className="text-[13px] font-black text-[#1A2B23] uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                                    <span className="w-5 h-0.5 bg-[#C5A059] rounded-full"></span>
                                    Special Offers
                                </h3>
                                <div className="bg-gradient-to-br from-[#C5A059]/[0.06] to-[#C5A059]/[0.02] rounded-2xl p-7 border border-[#C5A059]/10">
                                    <div className="flex items-start gap-3">
                                        <span className="material-icons text-[#C5A059] text-xl mt-0.5">local_offer</span>
                                        <p className="text-gray-600 text-sm font-medium leading-relaxed whitespace-pre-wrap">{listing.offers}</p>
                                    </div>
                                </div>
                            </div>
                        )}





                        {/* ─── REVIEWS SECTION ─── */}
                        <div className="mb-12">
                            <h3 className="text-[13px] font-black text-[#1A2B23] uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                                <span className="w-5 h-0.5 bg-[#C5A059] rounded-full"></span>
                                Reviews {reviews.length > 0 && <span className="text-gray-400 font-medium normal-case tracking-normal text-xs">({reviews.length})</span>}
                            </h3>
                            
                            {reviews.length > 0 ? (
                                <div className="space-y-4 mb-8">
                                    {reviews.map((review, i) => (
                                        <div key={review.id || i} className="bg-white rounded-2xl p-6 border border-gray-100/80">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1A2B23] to-[#2D4F3C] flex items-center justify-center">
                                                        <span className="text-white text-[10px] font-black">{(review.customerName || 'G')[0].toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[12px] font-bold text-[#1A2B23] block">{review.customerName || 'Guest'}</span>
                                                        <span className="text-[8px] text-gray-400 font-medium">
                                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, s) => (
                                                        <span key={s} className={`material-icons text-[13px] ${s < (review.rating || 0) ? 'text-[#C5A059]' : 'text-gray-200'}`}>star</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-500 text-[13px] leading-relaxed">{review.message}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl p-8 border border-gray-100/80 text-center mb-8">
                                    <span className="material-icons text-gray-200 text-3xl mb-2 block">rate_review</span>
                                    <p className="text-gray-400 text-sm font-medium">No reviews yet</p>
                                    <p className="text-gray-300 text-xs">Be the first to share your experience</p>
                                </div>
                            )}

                            {/* Write a Review */}
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100/80">
                                <h4 className="text-[11px] font-black text-[#1A2B23] uppercase tracking-[0.15em] mb-5">Write a Review</h4>
                                <form onSubmit={handleReview} className="space-y-4">
                                    {!isAuthenticated ? (
                                        <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Sign in to share your experience</p>
                                            <button 
                                                type="button"
                                                onClick={() => navigate('/login')}
                                                className="px-6 py-2 bg-[#1A2B23] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#2D4F3C] transition-all"
                                            >
                                                Sign In
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Rating</label>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onMouseEnter={() => setHoverRating(star)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            onClick={() => setReviewForm(r => ({ ...r, rating: star }))}
                                                            className="transition-transform hover:scale-110 cursor-pointer"
                                                        >
                                                            <span className={`material-icons text-2xl transition-colors ${
                                                                star <= (hoverRating || reviewForm.rating) ? 'text-[#C5A059]' : 'text-gray-200'
                                                            }`}>star</span>
                                                        </button>
                                                    ))}
                                                    {reviewForm.rating > 0 && (
                                                        <span className="text-[10px] text-gray-400 font-medium self-center ml-2">
                                                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Your Review</label>
                                                <textarea 
                                                    placeholder="Share your experience..." required rows={3}
                                                    value={reviewForm.message}
                                                    onChange={e => setReviewForm(r => ({ ...r, message: e.target.value }))}
                                                    className="w-full bg-[#F7F6F3] rounded-xl p-5 text-[12px] font-medium outline-none border border-transparent focus:border-[#1A2B23]/10 transition-all resize-none placeholder:text-gray-300 leading-relaxed" 
                                                />
                                            </div>
                                            <div className="flex items-center justify-between pb-2">
                                                <span className="text-[9px] text-gray-400 font-medium italic">Posting as <span className="text-[#1A2B23] font-bold not-italic">{user?.fullName || user?.username}</span></span>
                                            </div>
                                            <button type="submit" className="w-full h-12 bg-[#1A2B23] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#2D4F3C] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                                Submit Review
                                                <span className="material-icons text-sm">send</span>
                                            </button>
                                            <AnimatePresence>
                                                {reviewStatus.msg && (
                                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                        className={`p-3.5 rounded-xl text-[9px] font-bold uppercase tracking-widest text-center ${reviewStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                                        {reviewStatus.msg}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* ─── RIGHT SIDEBAR ─── */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 lg:sticky lg:top-28 self-start">
                            {/* Booking Card */}
                            <div className="hidden lg:block">
                                <BookingCard 
                                    listing={listing} 
                                    bookingForm={bookingForm} 
                                    setBookingForm={setBookingForm}
                                    calculateTotal={calculateTotal}
                                    handleBooking={handleBooking}
                                    bookingStatus={bookingStatus}
                                />
                            </div>

                            {/* Contact Card */}
                            <div className="bg-white rounded-2xl p-7 md:p-8 border border-gray-100/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-[#F7F6F3] flex items-center justify-center">
                                        <span className="material-icons text-[#1A2B23] text-lg">mail_outline</span>
                                    </div>
                                    <div>
                                        <h3 className="text-[12px] font-black text-[#1A2B23]">Contact Operator</h3>
                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Direct message to partner</p>
                                    </div>
                                </div>

                                <form onSubmit={handleMessage} className="space-y-4">
                                    {!isAuthenticated ? (
                                        <div className="py-4 text-center">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3 leading-relaxed">Please sign in to message the operator directly</p>
                                            <button 
                                                type="button"
                                                onClick={() => navigate('/login')}
                                                className="w-full h-10 bg-[#1A2B23] text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#2D4F3C] transition-all"
                                            >
                                                Sign In
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 px-1 mb-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Logged in as {user?.username}</span>
                                            </div>
                                            <textarea 
                                                placeholder="Your message or inquiry..."
                                                required rows={4}
                                                value={messageForm.message}
                                                onChange={e => setMessageForm(m => ({ ...m, message: e.target.value }))}
                                                className="w-full bg-[#F7F6F3] rounded-xl p-4 text-[11px] font-medium outline-none border border-transparent focus:border-[#1A2B23]/10 transition-all resize-none placeholder:text-gray-300 leading-relaxed" 
                                            />
                                            <button type="submit" className="w-full h-12 bg-[#1A2B23] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#2D4F3C] transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-[#1A2B23]/5">
                                                Send Inquiry
                                                <span className="material-icons text-sm">send</span>
                                            </button>
                                        </>
                                    )}
                                    
                                    <AnimatePresence>
                                        {messageStatus.msg && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className={`p-3 rounded-xl text-[9px] font-bold uppercase tracking-widest text-center ${messageStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                                {messageStatus.msg}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </div>

                            {/* Company Info Mini Card */}
                            {company && (
                                <div className="bg-white rounded-2xl p-6 border border-gray-100/80">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1A2B23] to-[#2D4F3C] flex items-center justify-center">
                                            <span className="text-white text-sm font-black">{(company.companyName || 'H')[0]}</span>
                                        </div>
                                        <div>
                                            <span className="text-[12px] font-bold text-[#1A2B23] block">{company.companyName}</span>
                                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                Verified <span className="material-icons text-green-500 text-[10px]">verified</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        {company.fullName && (
                                            <div className="flex items-center gap-2.5 text-gray-500">
                                                <span className="material-icons text-sm text-gray-300">person</span>
                                                <span className="text-[11px] font-medium">{company.fullName}</span>
                                            </div>
                                        )}
                                        {company.email && (
                                            <div className="flex items-center gap-2.5 text-gray-500">
                                                <span className="material-icons text-sm text-gray-300">email</span>
                                                <span className="text-[11px] font-medium">{company.email}</span>
                                            </div>
                                        )}
                                        {company.phoneNo && (
                                            <div className="flex items-center gap-2.5 text-gray-500">
                                                <span className="material-icons text-sm text-gray-300">phone</span>
                                                <span className="text-[11px] font-medium">{company.phoneNo}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
            </section>

            {/* ═══ STICKY BOOKING BAR (Mobile) ═══ */}
            <AnimatePresence>
                {showMobileBar && (
                    <motion.div 
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 z-[100] flex items-center justify-between lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
                    >
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest block mb-0.5">Total Value</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-black text-[#1A2B23]">{calculateTotal().toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">NPR</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => document.getElementById('reservation-card')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-[#1A2B23] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#1A2B23]/20 active:scale-95 transition-all"
                        >
                            Reserve Now
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExploreDetail;
