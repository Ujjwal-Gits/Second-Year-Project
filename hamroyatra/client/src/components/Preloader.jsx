import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HamroLogo from '../assets/HamroLogo.png';

const Preloader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(onComplete, 1600); // Allow time for the split animation
                    return 100;
                }
                return prev + 1;
            });
        }, 25);
        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[999999] pointer-events-none overflow-hidden">
            {/* Top Shutter Panel */}
            <motion.div 
                initial={{ y: 0 }}
                exit={{ 
                    y: "-100%",
                    transition: { duration: 1.1, ease: [0.85, 0, 0.15, 1] }
                }}
                style={{ willChange: 'transform' }}
                className="absolute top-0 left-0 w-screen h-[50.2vh] bg-[#050806] pointer-events-auto z-50"
            />
            
            {/* Bottom Shutter Panel */}
            <motion.div 
                initial={{ y: 0 }}
                exit={{ 
                    y: "100%",
                    transition: { duration: 1.1, ease: [0.85, 0, 0.15, 1] }
                }}
                style={{ willChange: 'transform' }}
                className="absolute bottom-0 left-0 w-screen h-[50.2vh] bg-[#050806] pointer-events-auto z-50"
            />

            {/* Central Content Layer */}
            <motion.div
                initial={{ opacity: 1 }}
                exit={{ 
                    opacity: 0,
                    scale: 8, // Optimized zoom for performance
                    filter: "blur(20px)",
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                }}
                className="absolute inset-0 flex flex-col items-center justify-center z-[60] pointer-events-none"
            >
                {/* Logo with Soft Glow */}
                <div className="relative mb-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-48 h-48 flex items-center justify-center p-4"
                    >
                        <img 
                            src={HamroLogo} 
                            alt="Logo" 
                            className="w-full h-full object-contain brightness-0 invert scale-[2.8]"
                        />
                        
                        {/* Golden Orbit/Pulse */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            className="absolute inset-0 border-[1px] border-[#C5A059]/10 rounded-full"
                        />
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2], opacity: [0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }}
                            className="absolute inset-0 bg-[#C5A059]/5 rounded-full"
                        />
                    </motion.div>
                </div>

                {/* Typography Container */}
                <div className="flex flex-col items-center gap-2">
                    <div className="overflow-hidden">
                        <motion.h1
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="text-white font-serif text-4xl md:text-5xl font-black tracking-[0.3em] uppercase leading-none"
                        >
                            Hamroyatra
                        </motion.h1>
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0, letterSpacing: "1em" }}
                        animate={{ opacity: 1, letterSpacing: "0.5em" }}
                        transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                        className="text-[#C5A059] text-[10px] uppercase font-bold text-center pl-[0.5em]"
                    >
                        Nepal's Elite Collection
                    </motion.div>
                </div>

                {/* Luxury Minimalist Loader */}
                <div className="mt-16 relative w-40 h-[1px] bg-white/5 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="absolute top-0 left-0 h-full bg-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.5)]"
                    />
                </div>
                
                <motion.div 
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mt-4 text-white/20 text-[8px] font-black uppercase tracking-[0.3em]"
                >
                    {progress}% Loading Experience
                </motion.div>
            </motion.div>

            {/* Aesthetic Borders during reveal */}
            <motion.div 
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                className="absolute inset-x-0 top-[50%] h-[1px] bg-white/5 z-0"
            />
        </div>
    );
};

export default Preloader;
