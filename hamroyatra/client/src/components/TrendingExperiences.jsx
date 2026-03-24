import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TrendingExperiences = ({ isAuthenticated }) => {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    // ... rest of state stays same ...

    const handleAction = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
            navigate('/login');
        } else {
            // Future navigation logic
        }
    };

    // ... scroll logic stays same ...
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftState, setScrollLeftState] = useState(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [wishlist, setWishlist] = useState([]);

    const experiences = [
        {
            id: 1,
            title: "Mustang Jeep Safari",
            company: "Elite Treks Nepal",
            location: "Upper Mustang, Nepal",
            duration: "10 Days",
            price: 2200,
            rating: 5,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBactHcGKXMoYMor39Rnt_15hSMjKv3UgEOf5nU4FI-GV9EiOZUKsTes5CAWHA956QcUnAvkZqt3IhGUImlEk36F2fnCXp2ZnHB6rWAl9dR5mkIS4KGUg7wvm7SgVdv9LctdNqR1JRisi7lIJnUdOGeSEO5CdRJIDG1DCRnV-fkDJyCF4aNSPmRpbxeLiJO0EFXBi_6gdpsBGbntsrX0kZK8cudkHMs8I305uBvWi1iSFP1MQRFuNM3VPMZaqQizwm2w6B7FQ71yJI",
            verified: true
        },
        {
            id: 2,
            title: "Pokhara Zen Retreat",
            company: "Mandala Wellness",
            location: "Lakeside, Pokhara",
            duration: "4 Days",
            price: 950,
            rating: 4,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXIs5AgVmgcR6WFwhJQqDeFWaQCuVpaYXxVrqCGnu2vxLIT2C5VKoFz4WbcuWxjFLonI7AkjCeUJyY7DnZzTo3DVM_aXxBKo0KNnqdi5fvOZtlTmA1wOk1TojVZLHMM9K9O_hbc_sFaceF7zTFhIq8zlw-fouiOgcz0LGgLbSLu0-hzAuLtpTfDNqXaz1H5VLldPjAFVX6A5lyyJSE2j6PzdjBqgLO8MAvy4rEHyhlDsS6Fd9ZkpbOFZmTdT0B2Tr-dGKuA24jOh8",
            verified: true
        },
        {
            id: 3,
            title: "Chitwan Wildlife Tour",
            company: "Jungle Safari Co.",
            location: "Chitwan National Park",
            duration: "3 Days",
            price: 1100,
            rating: 5,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGYhYaK6nvVKi37qTjkT4nGNuRlN4yzCgqRt8inQZlqEaYjrrYmYRn60RAr_gcv7ZIpPKEJx4tKtaFiAtvqt11RJ9lKm4bxg0AYMqB4pwCRq0x65mLVZSCwGhR96tkh8d7aP7VAPfv-1Yc_X0GiCq_1d240yKlszCFQ7D53XMthym5cyd2xw3Gsrg2XAHtHRNJw_LPEuJoRiPdOYRv0Ze5m2yt6AJsUdFClRielWKBuo6VpZchfVCYleXXF28vEMfFKCfMc8qfR4s",
            verified: true
        },
        {
            id: 4,
            title: "Everest Heli Tour",
            company: "Skyline Helicopters",
            location: "Solukhumbu Region",
            duration: "1 Day",
            price: 1450,
            rating: 5,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTmGU_CiNKkCbZbHY7q7ZstEOJXPpnwb6Qul3EZ6Xu2ux5lIF1G72VAX8wp7GSc2YvHUsiajJHa2teddQJocO8p40HtCOP_FeJ1FktgM5u7CcQRzykxFNWlLhl0CuKoJJmdrPSMGPIDW7MH2HewjUWokkHOSEqK-kNwYoPlk35d-I6ImWjnwqdQ720tCr-hLhu6MFQV40gmHOXY9y-xUF-mV2uUZFPaFH1apPkR9pv3NG61Ts2dYiw_wSi1eY9PlhZ1hb3J3VDeGo",
            verified: true
        },
        {
            id: 5,
            title: "Langtang Valley Trek",
            company: "Himalayan Roots",
            location: "Langtang National Park",
            duration: "8 Days",
            price: 1250,
            rating: 5,
            image: "https://images.unsplash.com/photo-1544735749-2e78311e09f1?q=80&w=1470&auto=format&fit=crop",
            verified: true
        },
        {
            id: 6,
            title: "Muktinath Pilgrimage",
            company: "Divine Nepal",
            location: "Lower Mustang",
            duration: "5 Days",
            price: 880,
            rating: 5,
            image: "https://images.unsplash.com/photo-1627814441551-9f9392e276b6?q=80&w=1470&auto=format&fit=crop",
            verified: true
        },
        {
            id: 7,
            title: "Rara Lake Adventure",
            company: "Wild West Treks",
            location: "Mugu, Western Nepal",
            duration: "7 Days",
            price: 1650,
            rating: 4,
            image: "https://images.unsplash.com/photo-1623492701902-47dc207df5dc?q=80&w=1470&auto=format&fit=crop",
            verified: true
        },
        {
            id: 8,
            title: "Annapurna Base Camp",
            company: "Summit Seekers",
            location: "Annapurna Region",
            duration: "11 Days",
            price: 1350,
            rating: 5,
            image: "https://images.unsplash.com/photo-1582228229413-eb8364c77ea1?q=80&w=1470&auto=format&fit=crop",
            verified: true
        }
    ];

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 10);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const scrollEl = scrollRef.current;
        if (scrollEl) {
            scrollEl.addEventListener('scroll', checkScroll);
            checkScroll();
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (scrollEl) {
                scrollEl.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            }
        };
    }, []);

    const toggleWishlist = (id) => {
        setWishlist(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeftState(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollRef.current.scrollLeft = scrollLeftState - walk;
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = window.innerWidth < 768 ? 300 : 380;
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section id="trending-experiences" className="py-20 md:py-28 bg-[#FDFDFD] overflow-hidden relative">
            <div className="max-w-[1300px] mx-auto px-6 md:px-10 mb-12">
                <div className="max-w-xl text-left">
                    <span className="text-[#C5A059] font-bold tracking-[0.4em] uppercase text-[9px] mb-3 block">Featured Journeys</span>
                    <h2 className="font-serif text-4xl md:text-5xl text-primary font-bold mb-4 tracking-tight leading-none">Trending Experiences</h2>
                    <p className="text-gray-500 text-base font-light">Handpicked adventures across Nepal's majestic landscapes, curated for every traveler.</p>
                </div>
            </div>

            {/* Carousel Container with Absolute Side Navigation */}
            <div className="relative group/nav">
                
                {/* Left Navigation Arrow - Dynamic Visibility */}
                <button 
                    onClick={() => scroll('left')}
                    className={`
                        absolute left-4 lg:left-8 top-[40%] -translate-y-1/2 z-30
                        w-14 h-14 rounded-full border border-gray-100 bg-white/90 backdrop-blur-md
                        hidden md:flex items-center justify-center text-gray-400 
                        hover:text-primary hover:border-primary hover:shadow-2xl 
                        transition-all duration-500 active:scale-90
                        ${showLeftArrow ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}
                    `}
                >
                    <span className="material-icons text-3xl">west</span>
                </button>

                {/* Right Navigation Arrow - Dynamic Visibility */}
                <button 
                    onClick={() => scroll('right')}
                    className={`
                        absolute right-4 lg:right-8 top-[40%] -translate-y-1/2 z-30
                        w-14 h-14 rounded-full border border-gray-100 bg-white/90 backdrop-blur-md
                        hidden md:flex items-center justify-center text-gray-400 
                        hover:text-primary hover:border-primary hover:shadow-2xl 
                        transition-all duration-500 active:scale-90
                        ${showRightArrow ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}
                    `}
                >
                    <span className="material-icons text-3xl">east</span>
                </button>

                {/* Main Scrollable Area */}
                <div 
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={`flex overflow-x-auto gap-6 pb-12 no-scrollbar snap-x snap-mandatory ${isDragging ? 'select-none' : ''}`}
                    style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none',
                        paddingLeft: 'max(1.25rem, calc((100vw - 1300px) / 2 + 2.5rem))',
                        paddingRight: 'max(1.25rem, calc((100vw - 1300px) / 2 + 2.5rem))',
                        scrollPaddingLeft: 'max(1.25rem, calc((100vw - 1300px) / 2 + 2.5rem))'
                    }}
                >
                    {experiences.map((exp) => {
                        const isInWishlist = wishlist.includes(exp.id);
                        return (
                            <div 
                                key={exp.id}
                                className="snap-start shrink-0 w-[280px] md:w-[320px] group cursor-default"
                            >
                                <div className="bg-white rounded-xl overflow-hidden border border-gray-100/60 transition-all duration-300 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] h-full flex flex-col">
                                    {/* Static Image Surface */}
                                    <div className="relative h-[260px] md:h-[240px] overflow-hidden m-0 md:m-4 rounded-none md:rounded-lg bg-gray-50">
                                        <img 
                                            src={exp.image} 
                                            alt={exp.title} 
                                            className="w-full h-full object-cover pointer-events-none" 
                                        />
                                        {/* Mobile-only subtle gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden" />
                                        
                                        <div className="absolute top-4 right-4">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleWishlist(exp.id); }}
                                                className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-90 cursor-pointer
                                                    ${isInWishlist 
                                                        ? 'bg-primary text-white border-primary/50' 
                                                        : 'bg-white/40 border border-white/30 text-white hover:bg-white/60'}`}
                                            >
                                                <span className="material-icons text-xl">{isInWishlist ? 'favorite' : 'favorite_border'}</span>
                                            </button>
                                        </div>
                                        <div className="absolute bottom-4 left-4">
                                            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold tracking-wider uppercase">
                                                {exp.duration}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Details */}
                                    <div className="px-6 md:px-7 pb-8 pt-6 md:pt-2 flex flex-col gap-5 md:gap-4 flex-grow">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 cursor-pointer group/company">
                                                <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase group-hover/company:text-[#C5A059] transition-colors">{exp.company}</span>
                                                {exp.verified && (
                                                    <span className="material-icons text-[14px] text-green-500">verified</span>
                                                )}
                                            </div>
                                            <h3 className="text-[20px] md:text-xl font-bold text-primary leading-tight tracking-tight">
                                                {exp.title}
                                            </h3>
                                            
                                            {/* No Reviews + Location */}
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">No Reviews</span>
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <span className="material-icons text-[10px]">location_on</span>
                                                    <span className="text-[9px] uppercase font-bold tracking-wider">{exp.location}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Horizontal Action Row: Pricing on Left, Discover on Right */}
                                        <div className="flex items-center justify-between mt-auto pt-5 md:pt-4 border-t border-gray-50 gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-gray-300 font-bold uppercase block mb-[-2px]">Budget</span>
                                                <span className="text-xl font-black text-primary">NPR {exp.price.toLocaleString()}</span>
                                            </div>
                                            
                                            <button 
                                                onClick={handleAction}
                                                className="relative overflow-hidden group/btn flex items-center justify-center gap-2 px-5 py-2 rounded-[3.5px] text-[10px] font-black uppercase tracking-widest transition-all bg-[#1A2B23] text-white hover:bg-[#1D7447] shadow-md shadow-[#1A2B23]/10 active:scale-95 cursor-pointer"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    Discover
                                                    <span className="material-icons text-sm group-hover/btn:translate-x-1 transition-transform">east</span>
                                                </span>
                                                
                                                {/* Mirror Shine Effect */}
                                                <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] transition-all duration-700 group-hover/btn:left-[150%]"></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default TrendingExperiences;