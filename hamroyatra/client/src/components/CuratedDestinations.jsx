import React from 'react';

const CuratedDestinations = () => {
    return (
        <section className="py-20 px-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <span className="text-accent font-bold tracking-widest uppercase text-sm mb-2 block">Destinations</span>
                    <h2 className="font-serif text-4xl text-primary-dark font-bold">Curated for the Elite Explorer</h2>
                </div>
                <a className="hidden md:flex items-center gap-1 text-primary font-medium hover:text-accent transition-colors group" href="#">
                    View all destinations 
                    <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
                <div className="col-span-1 md:col-span-2 row-span-2 relative group overflow-hidden rounded-[32px] cursor-pointer">
                    <img alt="Mount Everest Base Camp wide shot" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnIpcKhf5CEZtt_K18oRRXWgQ72JvjAwJYVlFyEWgN687stDdHMNv2f2BcHzWrcKUgWkzU5hL6JVEWVdPTBJvlJbpEZlDxrFgwOUkEG6bSWyMvVhXv4Y3HFCwoqMg0nHcZB-b3omrBRPXmh_NNeh4-7-MX7i0GPHQ0vadZnE8DBaQeNYEETxQ5EVCX2Vp_D5sFxRHmeHePZbyvYOX5J8_EaGt213fgbwViBc8vhmtYW5C665hKwqotx1PT-ds-Q9Jx9ujg-iOtF3Q"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 transform transition-transform duration-500 group-hover:-translate-y-2">
                        <h3 className="font-serif text-3xl text-white mb-2">Everest Base Camp</h3>
                        <p className="text-white/80 line-clamp-2">The ultimate pilgrimage for trekkers, reimagined with luxury lodges and helicopter returns.</p>
                    </div>
                </div>

                <div className="relative group overflow-hidden rounded-[32px] cursor-pointer h-[288px]">
                    <img alt="Serene Phewa Lake in Pokhara with boats" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoLznwU32nDBXczUWpDiQZef0Yagzf_g9CrmFyifgIsDwsf6mAUik35mgV2D1jEdSJ685UmuR-g0iCUHlXTJ7YyHdNOssObm0jmE_4BIUsos3NgnH5zlj_8sub253eXokvwYboN6vt0lFv30O9ZMNgpCUS4NS1exhRrKJ3lJ_TnSOhU1g3Urq8dEvl8-Ac2kob--EKb6YEDK9iqcVy3aO2jXS4602uYKTMaINXAcFpYnWarl3frWpMW-cq8Yd8Wj1wqhF_wQF35to"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 transform transition-transform duration-500 group-hover:-translate-y-1">
                        <h3 className="font-serif text-xl text-white">Pokhara</h3>
                        <p className="text-accent text-sm font-medium">Lakeside Luxury</p>
                    </div>
                </div>

                <div className="relative group overflow-hidden rounded-[32px] cursor-pointer h-[288px]">
                    <img alt="Elephant walking in Chitwan jungle mist" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGYhYaK6nvVKi37qTjkT4nGNuRlN4yzCgqRt8inQZlqEaYjrrYmYRn60RAr_gcv7ZIpPKEJx4tKtaFiAtvqt11RJ9lKm4bxg0AYMqB4pwCRq0x65mLVZSCwGhR96tkh8d7aP7VAPfv-1Yc_X0GiCq_1d240yKlszCFQ7D53XMthym5cyd2xw3Gsrg2XAHtHRNJw_LPEuJoRiPdOYRv0Ze5m2yt6AJsUdFClRielWKBuo6VpZchfVCYleXXF28vEMfFKCfMc8qfR4s"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 transform transition-transform duration-500 group-hover:-translate-y-1">
                        <h3 className="font-serif text-xl text-white">Chitwan</h3>
                        <p className="text-accent text-sm font-medium">Jungle Safari</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CuratedDestinations;
