import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapNepal from '../assets/Map-Nepal.png';

const TopDestinations = () => {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState(null);

    const destinations = [
        {
            id: 'everest',
            name: 'EVEREST',
            category: 'Majestic',
            description: 'The ultimate pilgrimage for trekkers, reimagined with luxury lodges and helicopter returns.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnIpcKhf5CEZtt_K18oRRXWgQ72JvjAwJYVlFyEWgN687stDdHMNv2f2BcHzWrcKUgWkzU5hL6JVEWVdPTBJvlJbpEZlDxrFgwOUkEG6bSWyMvVhXv4Y3HFCwoqMg0nHcZB-b3omrBRPXmh_NNeh4-7-MX7i0GPHQ0vadZnE8DBaQeNYEETxQ5EVCX2Vp_D5sFxRHmeHePZbyvYOX5J8_EaGt213fgbwViBc8vhmtYW5C665hKwqotx1PT-ds-Q9Jx9ujg-iOtF3Q'
        },
        {
            id: 'pokhara',
            name: 'POKHARA',
            category: 'Lakes & Treks',
            description: 'The valley of lakes, where the Annapurna range mirrors in the calm waters of Phewa.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoLznwU32nDBXczUWpDiQZef0Yagzf_g9CrmFyifgIsDwsf6mAUik35mgV2D1jEdSJ685UmuR-g0iCUHlXTJ7YyHdNOssObm0jmE_4BIUsos3NgnH5zlj_8sub253eXokvwYboN6vt0lFv30O9ZMNgpCUS4NS1exhRrKJ3lJ_TnSOhU1g3Urq8dEvl8-Ac2kob--EKb6YEDK9iqcVy3aO2jXS4602uYKTMaINXAcFpYnWarl3frWpMW-cq8Yd8Wj1wqhF_wQF35to'
        },
        {
            id: 'chitwan',
            name: 'CHITWAN',
            category: 'Wilderness',
            description: 'Perched on the banks of the Rapti river, this lodge offers a seamless blend of wildlife adventure and unparalleled luxury.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGYhYaK6nvVKi37qTjkT4nGNuRlN4yzCgqRt8inQZlqEaYjrrYmYRn60RAr_gcv7ZIpPKEJx4tKtaFiAtvqt11RJ9lKm4bxg0AYMqB4pwCRq0x65mLVZSCwGhR96tkh8d7aP7VAPfv-1Yc_X0GiCq_1d240yKlszCFQ7D53XMthym5cyd2xw3Gsrg2XAHtHRNJw_LPEuJoRiPdOYRv0Ze5m2yt6AJsUdFClRielWKBuo6VpZchfVCYleXXF28vEMfFKCfMc8qfR4s'
        },
        {
            id: 'mustang',
            name: 'MUSTANG',
            category: 'Mystical',
            description: 'A mystical journey into the forbidden kingdom.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBactHcGKXMoYMor39Rnt_15hSMjKv3UgEOf5nU4FI-GV9EiOZUKsTes5CAWHA956QcUnAvkZqt3IhGUImlEk36F2fnCXp2ZnHB6rWAl9dR5mkIS4KGUg7wvm7SgVdv9LctdNqR1JRisi7lIJnUdOGeSEO5CdRJIDG1DCRnV-fkDJyCF4aNSPmRpbxeLiJO0EFXBi_6gdpsBGbntsrX0kZK8cudkHMs8I305uBvWi1iSFP1MQRFuNM3VPMZaqQizwm2w6B7FQ71yJI'
        },
        {
            id: 'lumbini',
            name: 'LUMBINI',
            category: 'Peaceful',
            description: 'Birthplace of Lord Buddha, a peaceful pilgrimage.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXIs5AgVmgcR6WFwhJQqDeFWaQCuVpaYXxVrqCGnu2vxLIT2C5VKoFz4WbcuWxjFLonI7AkjCeUJyY7DnZzTo3DVM_aXxBKo0KNnqdi5fvOZtlTmA1wOk1TojVZLHMM9K9O_hbc_sFaceF7zTFhIq8zlw-fouiOgcz0LGgLbSLu0-hzAuLtpTfDNqXaz1H5VLldPjAFVX6A5lyyJSE2j6PzdjBqgLO8MAvy4rEHyhlDsS6Fd9ZkpbOFZmTdT0B2Tr-dGKuA24jOh8'
        }
    ];

    return (
        <section className="bg-primary pt-20 md:pt-32 pb-0 relative overflow-visible">
            <div className="max-w-7xl mx-auto px-0 md:px-8">
                <div className="text-center mb-12 md:mb-16 relative z-10">
                    <span className="text-accent font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">Regional Gems</span>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-bold tracking-tight">Top Destinations</h2>
                </div>

                {/* Map Section - Now visible on all devices */}
                <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] mb-8 md:mb-12">
                    <img src={mapNepal} alt="Map of Nepal" className="w-full h-full object-contain opacity-60 mix-blend-overlay" />
                    
                    {/* Map Pins - Precisely positioned according to reference image */}
                    
                    {/* Everest - Far right edge */}
                    <div className="absolute top-[33.5%] left-[73%] md:top-[40%] md:left-[68%] group cursor-pointer">
                        <div className="relative">
                            <div className="w-3.5 h-3.5 md:w-6 md:h-6 bg-accent rounded-full map-pin-glow animate-pulse"></div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-14 md:h-16 bg-gradient-to-b from-accent to-transparent"></div>
                        </div>
                        <span className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 text-accent text-[8px] md:text-[11px] font-bold uppercase tracking-ultra whitespace-nowrap drop-shadow-md">Everest</span>
                    </div>

                    {/* Duplicate Everest Design Point - Ilam repositioned */}
                    <div className="absolute top-[56%] left-[87%] md:top-[58%] md:left-[79%] group cursor-pointer">
                        <div className="relative">
                            <div className="w-3.5 h-3.5 md:w-6 md:h-6 bg-accent rounded-full map-pin-glow animate-pulse"></div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-12 md:h-16 bg-gradient-to-b from-accent to-transparent"></div>
                        </div>
                        <span className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 text-accent text-[8px] md:text-[11px] font-bold uppercase tracking-ultra whitespace-nowrap drop-shadow-md">Ilam</span>
                    </div>

                    {/* Pathibhara Temple - Duplicate of Mustang design */}
                    <div className="absolute top-[38%] left-[86%] md:top-[42%] md:left-[79%] group cursor-pointer">
                        <div className="relative">
                            <div className="w-3.5 h-3.5 md:w-6 md:h-6 bg-accent rounded-full map-pin-glow animate-pulse"></div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-10 md:h-12 bg-gradient-to-b from-accent to-transparent"></div>
                        </div>
                        <span className="absolute -top-7 md:-top-9 left-1/2 -translate-x-1/2 text-accent text-[8px] md:text-[11px] font-bold uppercase tracking-ultra whitespace-nowrap drop-shadow-md">Pathibhara Temple</span>
                    </div>

                    {/* Pokhara - Center, upper area */}
                    <div className="absolute top-[29%] left-[45%] md:left-[48%] group cursor-pointer">
                        <div className="relative">
                            <div className="w-3.5 h-3.5 md:w-6 md:h-6 bg-accent rounded-full map-pin-glow animate-pulse"></div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-10 md:h-16 bg-gradient-to-b from-accent to-transparent"></div>
                        </div>
                        <span className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 text-accent text-[8px] md:text-[11px] font-bold uppercase tracking-ultra whitespace-nowrap drop-shadow-md">Pokhara</span>
                    </div>

                    {/* Chitwan - Center-right, lower middle */}
                    <div className="absolute top-[46%] left-[50%] md:top-[51%] md:left-[50%] group cursor-pointer">
                        <div className="relative">
                            <div className="w-3.5 h-3.5 md:w-6 md:h-6 bg-accent rounded-full map-pin-glow animate-pulse"></div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-10 md:h-12 bg-gradient-to-b from-accent to-transparent"></div>
                        </div>
                        <span className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 text-accent text-[8px] md:text-[11px] font-bold uppercase tracking-ultra whitespace-nowrap drop-shadow-md">Chitwan</span>
                    </div>

                    {/* Mustang - Upper center */}
                    <div className="absolute top-[12%] left-[45%] md:top-[11%] md:left-[48%] group cursor-pointer">
                        <div className="relative">
                            <div className="w-3.5 h-3.5 md:w-6 md:h-6 bg-accent rounded-full map-pin-glow animate-pulse"></div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-24 md:h-36 bg-gradient-to-b from-accent to-transparent"></div>
                        </div>
                        <span className="absolute -top-7 md:-top-9 left-1/2 -translate-x-1/2 text-accent text-[8px] md:text-[11px] font-bold uppercase tracking-ultra whitespace-nowrap drop-shadow-md">Mustang</span>
                    </div>

                    {/* Lumbini - Left side, lower middle */}
                    <div className="absolute top-[47.4%] left-[39%] md:top-[49%] md:left-[42%] group cursor-pointer">
                        <div className="relative">
                            <div className="w-3.5 h-3.5 md:w-6 md:h-6 bg-accent rounded-full map-pin-glow animate-pulse"></div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-8 md:h-12 bg-gradient-to-b from-accent to-transparent"></div>
                        </div>
                        <span className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 text-accent text-[8px] md:text-[11px] font-bold uppercase tracking-ultra whitespace-nowrap drop-shadow-md">Lumbini</span>
                    </div>

                    {/* Khaptad NP - Duplicate of Lumbini design, repositioned */}
                    <div className="absolute top-[18%] left-[16.6%] md:top-[17%] md:left-[25%] group cursor-pointer">
                        <div className="relative">
                            <div className="w-3.5 h-3.5 md:w-6 md:h-6 bg-accent rounded-full map-pin-glow animate-pulse"></div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-10 md:h-12 bg-gradient-to-b from-accent to-transparent"></div>
                        </div>
                        <span className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 text-accent text-[8px] md:text-[11px] font-bold uppercase tracking-ultra whitespace-nowrap drop-shadow-md">Khaptad NP</span>
                    </div>

                    {/* Bardia NP - Duplicate of Pokhara design, repositioned */}
                    <div className="absolute top-[30%] left-[20%] md:top-[29%] md:left-[28%] group cursor-pointer">
                        <div className="relative">
                            <div className="w-3.5 h-3.5 md:w-6 md:h-6 bg-accent rounded-full map-pin-glow animate-pulse"></div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-10 md:h-16 bg-gradient-to-b from-accent to-transparent"></div>
                        </div>
                        <span className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 text-accent text-[8px] md:text-[11px] font-bold uppercase tracking-ultra whitespace-nowrap drop-shadow-md">Bardia NP</span>
                    </div>
                </div>

                {/* Cards Section - Full width on mobile, expandable on desktop */}
                <div className="relative z-20 grid grid-cols-2 gap-0 md:flex w-full h-auto md:h-[450px] overflow-hidden md:rounded-t-[3rem] shadow-2xl">
                    {destinations.map((dest, index) => (
                        <div
                            key={dest.id}
                            onMouseEnter={() => setHoveredCard(dest.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            className={`
                                relative group cursor-pointer overflow-hidden
                                transition-all duration-700 ease-in-out
                                ${hoveredCard === dest.id ? 'md:flex-[3]' : hoveredCard ? 'md:flex-[0.8]' : 'md:flex-1'}
                                h-[280px] sm:h-[320px] md:h-full
                                rounded-none md:rounded-none
                                ${index > 0 ? 'md:border-l border-white/10' : ''}
                                ${index === 4 ? 'col-span-2 md:col-span-1' : ''}
                            `}
                        >
                            {/* Background Image */}
                            <img 
                                alt={dest.name} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110" 
                                src={dest.image}
                            />
                            
                            {/* Removed blur on mobile, maintained for desktop hover states */}
                            <div className={`
                                absolute inset-0 md:backdrop-blur-[3px]
                                transition-opacity duration-500 ease-in-out
                                ${hoveredCard === dest.id ? 'opacity-0 pointer-events-none' : 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'}
                            `}></div>
                            
                            {/* Gradient Overlay - Always present for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
                            
                            {/* Content - Shows on hover for ALL cards */}
                            <div className={`
                                absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-between
                                transition-all duration-500 ease-in-out
                            `}>
                                {/* Top Content */}
                                <div className={`
                                    transition-all duration-500 ease-in-out
                                    ${hoveredCard === dest.id ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0 md:opacity-0 md:-translate-y-4'}
                                `}>
                                    <div className="w-8 md:w-12 h-0.5 bg-accent mb-3 md:mb-4 transition-all duration-500 ease-in-out group-hover:w-16 md:group-hover:w-20"></div>
                                    <span className="text-accent text-[9px] md:text-xs font-bold uppercase tracking-ultra block mb-2 md:mb-3">{dest.category}</span>
                                    <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-bold tracking-tight mb-3 md:mb-4">{dest.name}</h3>
                                </div>

                                {/* Bottom Content - Description appears with delay on hover, disappears immediately on hover out */}
                                <div className={`
                                    ${hoveredCard === dest.id 
                                        ? 'opacity-100 translate-y-0 transition-all duration-700 ease-in-out md:delay-200' 
                                        : 'opacity-100 translate-y-0 md:opacity-0 md:translate-y-8 transition-all duration-200 ease-in-out delay-0'}
                                `}>
                                    <p className="text-white/90 text-[10px] sm:text-xs md:text-sm font-light leading-relaxed mb-3 md:mb-6">
                                        {dest.description}
                                    </p>
                                    <button 
                                        onClick={() => navigate('/explore')}
                                        className="
                                        bg-white/10 backdrop-blur-md border border-white/20 text-white 
                                        px-4 sm:px-6 md:px-8 py-2 md:py-3 rounded-full 
                                        text-[9px] md:text-xs font-bold uppercase tracking-ultra 
                                        transition-all duration-500 ease-in-out
                                        hover:bg-accent hover:text-black hover:border-accent hover:scale-105
                                    ">
                                        Explore Region
                                    </button>
                                </div>
                            </div>

                            {/* Default State - Vertical Text (only visible when NOT hovered) */}
                            <div className={`
                                absolute bottom-4 sm:bottom-6 md:bottom-10 left-4 sm:left-6 md:left-10 
                                rotate-0 md:-rotate-90 origin-left
                                transition-all duration-500 ease-in-out
                                ${hoveredCard === dest.id ? 'opacity-0 pointer-events-none scale-90' : 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto scale-100'}
                            `}>
                                <p className="text-white/60 text-[8px] md:text-[10px] font-bold uppercase tracking-ultra mb-1 md:mb-2">{dest.category}</p>
                                <h3 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl text-white font-bold tracking-widest whitespace-nowrap">{dest.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TopDestinations;
