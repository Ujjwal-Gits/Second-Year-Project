import React from 'react';
import { useNavigate } from 'react-router-dom';

const ExclusiveStays = () => {
    const navigate = useNavigate();
    const properties = [
        {
            id: 1,
            name: "The Dwarika's",
            location: "Battisputali, Kathmandu",
            price: 450,
            rating: 5,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPeU73N6nrIoJNYbEt4KIwVGAqv00Pcvd1mtlP4x9_7GCpHbNuXV2MdKbLutezfjxgB4RQ7_w9Y7_KRproCPc9WvXxCkJifjLglxMhove-Vuf700S5kLhpc_GXtwvNYYqA3aomExKy531VtQgOzUc1EkECQUFe37bGxVNj_LbByZ1ztX60ZUQ-TKlSA_35MBaxyq_7ODOiF4xBP78vJIbzt5iu7TRU2hdoY5Dj8meWvVo5doi-blf3aJs2zRjBrhhSc6NOeROzAfQ",
            verified: true,
            link: "#booking"
        },
        {
            id: 2,
            name: "Meghauli Serai",
            location: "Chitwan National Park",
            price: 620,
            rating: 5,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAe0veKLq2OiIGUonEI6MkxCcmXtzAj7yvc9Syk7fmkQzSTb0mSgldBZL_gmIO1ZVR3K4r1QTffi1fYvYQZdtymIfXXUb0guc7uG1Dvk96jeDj_1LP4ePAFZ7nHg3PxGd9VcFq7RFFI3ZL0a2bgjXdjtMmRAtYrIDufpGs5iV8xu2qunNJYFVHAHAa8w6dxtPjgyutdT-SF0xV9VdEAHN0vlo6YSSC0BheEdZqkiH3QCGD3ynTBl3DxQYB61QboShtNmyu8pXDdtf4",
            verified: true,
            link: "#booking"
        },
        {
            id: 3,
            name: "Temple Tree Resort",
            location: "Lakeside, Pokhara",
            price: 280,
            rating: 4,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1470&auto=format&fit=crop",
            verified: true,
            link: "#booking"
        },
        {
            id: 4,
            name: "Tiger Tops Lodge",
            location: "Chitwan Wildlife",
            price: 540,
            rating: 5,
            image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1470&auto=format&fit=crop",
            verified: true,
            link: "#booking"
        }
    ];

    const handleCardClick = () => {
        navigate('/explore');
    };

    return (
        <section id="exclusive-stays" className="py-20 md:py-28 bg-[#F5F5F7]">
            <div className="max-w-[1300px] mx-auto px-6 md:px-10">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-xl">
                        <span className="text-[#C5A059] font-bold tracking-[0.4em] uppercase text-[9px] mb-3 block">Refined Hospitality</span>
                        <h2 className="font-serif text-4xl md:text-5xl text-primary font-bold mb-4 tracking-tight">Exclusive Stays</h2>
                        <p className="text-gray-500 text-base font-light leading-relaxed">Retreat to architectural masterpieces where heritage meets contemporary luxury.</p>
                    </div>
                </div>

                {/* Grid Structure: Refined for Mobile Responsiveness */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    
                    {/* Feature Banner 1: Hotels - Full Width on Mobile */}
                    <div 
                        onClick={() => handleCardClick('#hotels')}
                        className="col-span-2 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 p-6 md:p-10 flex flex-col justify-between h-[280px] md:h-[320px] shadow-sm relative group overflow-hidden cursor-pointer transition-all hover:shadow-xl active:scale-[0.98]"
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1470" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700" 
                            alt="Hotels Banner"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-[5]"></div>
                        
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h3 className="text-white text-3xl md:text-5xl font-bold mb-2 md:mb-4 tracking-tight">Hotels</h3>
                                <p className="text-white/85 text-[10px] md:text-xs font-medium max-w-[180px] md:max-w-[200px] leading-relaxed">
                                    Your dream destination awaits, book moments, make memories
                                </p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg transition-all group-hover:rotate-45 shrink-0">
                                <span className="material-icons text-primary group-hover:text-[#C5A059] transition-colors scale-75 md:scale-90">north_east</span>
                            </div>
                        </div>
                        <div className="relative z-10 flex items-center -space-x-3">
                            <img className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/50 object-cover shadow-sm" src="https://i.pravatar.cc/100?u=a" alt="u1" />
                            <img className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/50 object-cover shadow-sm" src="https://i.pravatar.cc/100?u=b" alt="u2" />
                            <img className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/50 object-cover shadow-sm" src="https://i.pravatar.cc/100?u=c" alt="u3" />
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-md flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white shadow-sm">+12k</div>
                        </div>
                    </div>

                    {/* Property Cards Row - 2 per row on Mobile */}
                    {properties.map((prop) => (
                        <div 
                            key={prop.id} 
                            onClick={() => handleCardClick(prop.link)}
                            className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-[280px] md:h-[320px] transition-all duration-300 hover:shadow-xl relative cursor-pointer group active:scale-[0.98]"
                        >
                            <div className="relative h-[55%] md:h-[60%] overflow-hidden">
                                <img src={prop.image} alt={prop.name} className="w-full h-full object-cover transition-all duration-500" />
                                <div className="absolute top-3 left-3 md:top-4 md:left-4 glass-badge px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[6px] md:text-[8px] font-bold text-primary flex items-center gap-1 md:gap-1.5 backdrop-blur-md bg-white/90">
                                    <span className="material-icons text-[#22C55E] text-[8px] md:text-[10px]">verified</span> <span className="hidden xs:inline">VERIFIED</span>
                                </div>
                                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-md transition-all group-hover:rotate-45">
                                    <span className="material-icons text-primary group-hover:text-[#C5A059] transition-colors text-sm md:text-base">north_east</span>
                                </div>
                            </div>
                            <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-[13px] md:text-base font-bold text-primary leading-tight mb-0.5 md:mb-1 group-hover:text-[#C5A059] transition-colors line-clamp-1">{prop.name}</h4>
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <span className="material-icons text-[8px] md:text-[10px]">location_on</span>
                                        <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-wider">{prop.location.split(',')[0]}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="flex text-[#C5A059] gap-0.5 scale-75 md:scale-100 origin-left">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`material-icons text-[12px] ${i < prop.rating ? 'text-[#C5A059]' : 'text-gray-100'}`}>star</span>
                                        ))}
                                    </div>
                                    <span className="text-base md:text-xl font-bold text-primary">NPR {prop.price}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Feature Banner 2: Homestays - Full Width on Mobile */}
                    <div 
                        onClick={() => handleCardClick('#homestays')}
                        className="col-span-2 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 p-6 md:p-10 flex flex-col justify-between h-[280px] md:h-[320px] shadow-sm relative group overflow-hidden cursor-pointer transition-all hover:shadow-xl active:scale-[0.98]"
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1470" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700" 
                            alt="Homestays Banner"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-[5]"></div>
                        
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h3 className="text-white text-3xl md:text-5xl font-bold mb-2 md:mb-4 tracking-tight">Homestays</h3>
                                <p className="text-white/85 text-[10px] md:text-xs font-medium max-w-[180px] md:max-w-[200px] leading-relaxed">
                                    Local warmth, authentic stories, and high-altitude hospitality
                                </p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg transition-all group-hover:rotate-45 shrink-0">
                                <span className="material-icons text-primary group-hover:text-[#C5A059] transition-colors scale-75 md:scale-90">north_east</span>
                            </div>
                        </div>
                        <div className="relative z-10 flex items-center -space-x-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm">
                                <span className="material-icons text-white text-[10px] md:text-xs">home</span>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm">
                                <span className="material-icons text-white text-[10px] md:text-xs">nature</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ExclusiveStays;
