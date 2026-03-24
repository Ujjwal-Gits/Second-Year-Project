import React from 'react';

const PartnerLogos = () => {
    return (
        <section className="bg-background-light py-20 relative z-20 rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.08)]">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex items-center justify-center gap-8 mb-12">
                    <div className="h-px w-24 bg-gray-200"></div>
                    <p className="text-center text-[10px] font-bold tracking-[0.4em] text-gray-400 uppercase">Verified Premium Partners</p>
                    <div className="h-px w-24 bg-gray-200"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-16 items-center">
                    <div className="group flex flex-col items-center gap-4 cursor-pointer">
                        <div className="flex items-center gap-4 transition-all duration-500 ease-in-out grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100">
                            <span className="material-symbols-outlined text-4xl text-primary transition-colors duration-500 ease-in-out group-hover:text-accent">flight_takeoff</span>
                            <span className="font-serif font-bold text-2xl text-gray-900 transition-colors duration-500 ease-in-out group-hover:text-accent">Nepal Airlines</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-primary font-bold uppercase tracking-ultra bg-primary/5 px-3 py-1 rounded-full border border-primary/10 transition-all duration-500 ease-in-out group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                            <span className="material-icons text-[10px]">verified</span> Verified
                        </div>
                    </div>
                    <div className="group flex flex-col items-center gap-4 cursor-pointer">
                        <div className="flex items-center gap-4 transition-all duration-500 ease-in-out grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100">
                            <span className="material-symbols-outlined text-4xl text-primary transition-colors duration-500 ease-in-out group-hover:text-accent">hotel</span>
                            <span className="font-serif font-bold text-2xl text-gray-900 transition-colors duration-500 ease-in-out group-hover:text-accent">Soaltee Hotel</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-primary font-bold uppercase tracking-ultra bg-primary/5 px-3 py-1 rounded-full border border-primary/10 transition-all duration-500 ease-in-out group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                            <span className="material-icons text-[10px]">verified</span> Verified
                        </div>
                    </div>
                    <div className="group flex flex-col items-center gap-4 cursor-pointer">
                        <div className="flex items-center gap-4 transition-all duration-500 ease-in-out grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100">
                            <span className="material-symbols-outlined text-4xl text-primary transition-colors duration-500 ease-in-out group-hover:text-accent">watch</span>
                            <span className="font-serif font-bold text-2xl text-gray-900 transition-colors duration-500 ease-in-out group-hover:text-accent">Rolex</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-primary font-bold uppercase tracking-ultra bg-primary/5 px-3 py-1 rounded-full border border-primary/10 transition-all duration-500 ease-in-out group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                            <span className="material-icons text-[10px]">verified</span> Verified
                        </div>
                    </div>
                    <div className="group flex flex-col items-center gap-4 cursor-pointer">
                        <div className="flex items-center gap-4 transition-all duration-500 ease-in-out grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100">
                            <span className="material-symbols-outlined text-4xl text-primary transition-colors duration-500 ease-in-out group-hover:text-accent">medical_services</span>
                            <span className="font-serif font-bold text-2xl text-gray-900 transition-colors duration-500 ease-in-out group-hover:text-accent">Nobel Hospital</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-primary font-bold uppercase tracking-ultra bg-primary/5 px-3 py-1 rounded-full border border-primary/10 transition-all duration-500 ease-in-out group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                            <span className="material-icons text-[10px]">verified</span> Verified
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PartnerLogos;
