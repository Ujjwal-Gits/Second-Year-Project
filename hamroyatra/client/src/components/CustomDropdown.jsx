import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomDropdown = ({ 
    options, 
    value, 
    onChange, 
    placeholder, 
    icon = 'expand_more', 
    searchable = false,
    className = "" 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => (o.id === value || o.value === value));
    
    // Support filtering for searchable dropdowns
    const filteredOptions = searchable 
        ? options.filter(o => {
            const label = (o.label || o.title || '').toLowerCase();
            return label.includes(searchQuery.toLowerCase());
          })
        : options;

    return (
        <div className={`relative group ${className}`} ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full min-h-[44px] bg-[#F7F6F3]/50 border transition-all flex items-center justify-between px-6 rounded-xl cursor-pointer ${isOpen ? 'ring-4 ring-primary/5 border-primary shadow-sm' : 'border-transparent hover:border-gray-200'}`}
            >
                <div className="flex flex-col min-w-0 py-2">
                    {selectedOption && (
                        <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest mb-0.5">Selection</span>
                    )}
                    <span className={`text-[12px] font-black truncate tracking-tight transition-colors ${selectedOption ? 'text-[#0D1F18]' : 'text-gray-300 group-hover:text-gray-400'}`}>
                        {selectedOption ? (selectedOption.label || selectedOption.title) : placeholder}
                    </span>
                </div>
                <span className={`material-icons text-gray-400 text-lg transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}>{icon}</span>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 right-0 top-[110%] bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 p-2 z-[999] overflow-hidden"
                    >
                        {searchable && (
                            <div className="p-2 border-b border-gray-50 mb-1">
                                <div className="relative">
                                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-[14px]">search</span>
                                    <input 
                                        autoFocus
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Quick lookup..."
                                        className="w-full h-9 bg-gray-50 rounded-lg pl-9 pr-4 text-[11px] font-bold text-[#0D1F18] outline-none border border-transparent focus:bg-white focus:border-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="max-h-56 overflow-y-auto custom-scrollbar">
                            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                                <button
                                    key={opt.id || opt.value}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(opt.id || opt.value);
                                        setIsOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between group/opt ${value === (opt.id || opt.value) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                                >
                                    <span>{opt.label || opt.title}</span>
                                    {value === (opt.id || opt.value) && (
                                        <span className="material-icons text-[16px]">check_circle</span>
                                    )}
                                </button>
                            )) : (
                                <div className="py-8 text-center bg-gray-50/50 rounded-xl m-1">
                                    <span className="material-icons text-gray-200 text-2xl mb-1">search_off</span>
                                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">No results found</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDropdown;
