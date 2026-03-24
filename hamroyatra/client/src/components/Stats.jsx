import React, { useEffect, useState, useRef } from 'react';

const Stats = () => {
    // Using the same high-quality mountain image for all 10 items as requested
    const mountainImage = "https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=1471&auto=format&fit=crop";
    
    const galleryItems = [
        { id: 1, name: "Kathmandu Valley", image: mountainImage },
        { id: 2, name: "Phewa Lake", image: mountainImage },
        { id: 3, name: "Boudhanath Stupa", image: mountainImage },
        { id: 4, name: "Annapurna Range", image: mountainImage },
        { id: 5, name: "Everest Base Camp", image: mountainImage },
        { id: 6, name: "Bhaktapur Durbar", image: mountainImage },
        { id: 7, name: "Chitwan Wildlife", image: mountainImage },
        { id: 8, name: "Lumbini Garden", image: mountainImage },
        { id: 9, name: "Mustang Desert", image: mountainImage },
        { id: 10, name: "Rara Lake", image: mountainImage }
    ];

    const [angle, setAngle] = useState(0);
    const requestRef = useRef();

    useEffect(() => {
        const animate = () => {
            // Even slower rotation speed for a very professional feel
            setAngle(prevAngle => (prevAngle + 0.08) % 360);
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return (
        <section className="bg-[#f0f2f5] py-20 md:py-32 overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-4 mb-16 md:mb-24 text-center md:text-left md:px-20">
                <span className="text-primary/40 font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">Visual Journey</span>
                <h2 className="font-serif text-3xl md:text-5xl text-primary font-bold tracking-tight">Our Heritage Gallery</h2>
            </div>

            <div className="relative w-full h-[250px] md:h-[450px] flex items-center justify-center perspective-wide">
                <div className="relative w-full h-full preserve-3d">
                    {galleryItems.map((item, index) => {
                        const itemAngle = (index * (360 / galleryItems.length)) + angle;
                        const radian = (itemAngle * Math.PI) / 180;
                        
                        // Tighter horizontal and vertical spacing to bring cards closer
                        const radiusX = 35; 
                        const radiusZ = 280; 
                        
                        const x = Math.sin(radian) * radiusX;
                        const z = Math.cos(radian) * radiusZ;
                        
                        const depthScale = (z + radiusZ) / (2 * radiusZ); 
                        
                        const scale = 0.4 + (depthScale * 0.5); 
                        
                        // Show exactly 5 cards (front half of rotation)
                        const isVisible = depthScale > 0.45;
                        const opacity = isVisible ? 1 : 0;
                        
                        const zIndex = Math.round(depthScale * 100);
                        const blur = isVisible ? (1 - depthScale) * 3 : 10;

                        return (
                            <div 
                                key={item.id}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                                style={{
                                    transform: `translate3d(calc(-50% + ${x}vw), -50%, ${z}px) scale(${scale})`,
                                    opacity: opacity,
                                    zIndex: zIndex,
                                    filter: `blur(${blur}px)`,
                                    visibility: isVisible ? 'visible' : 'hidden',
                                    transition: 'transform 0.1s linear, opacity 0.3s ease-in-out'
                                }}
                            >
                                {/* Small and elegant cards */}
                                <div className="w-[110px] sm:w-[150px] md:w-[220px] h-[160px] sm:h-[220px] md:h-[320px] rounded-[1.2rem] md:rounded-[2.2rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.1)] border-[4px] border-white">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div 
                                    className="mt-6 text-center"
                                    style={{ opacity: isVisible ? 1 : 0 }}
                                >
                                    <h3 
                                        className="font-serif text-xs md:text-xl font-bold tracking-widest italic uppercase"
                                        style={{ color: '#C5A059' }}
                                    >
                                        {item.name}
                                    </h3>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Depth gradient fades */}
                <div className="absolute inset-y-0 left-0 w-32 md:w-[25%] bg-gradient-to-r from-[#f0f2f5] via-[#f0f2f5]/80 to-transparent z-[110] pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-32 md:w-[25%] bg-gradient-to-l from-[#f0f2f5] via-[#f0f2f5]/80 to-transparent z-[110] pointer-events-none"></div>
            </div>
        </section>
    );
};

export default Stats;
