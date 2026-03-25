import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import destinationsCsv from "../assets/destinations.csv?url";

const Hero = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    fetch(destinationsCsv)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const validData = results.data.filter((row) => row.City);
            setDestinations(validData);
          },
        });
      })
      .catch((err) => console.error("Error loading CSV:", err));
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    if (value.length > 0) {
      setFilteredDestinations(
        destinations.filter((d) =>
          d.City.toLowerCase().startsWith(value.toLowerCase()),
        ),
      );
    } else {
      setFilteredDestinations([]);
    }
  };

  const selectDestination = (city) => {
    setQuery(city);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="relative w-full h-screen font-sans overflow-hidden scroll-snap-align-start">
      {/* Background Image - Moody Dark Mountain */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2600&q=80"
          alt="Dark Majestic Mountain"
          className="w-full h-full object-cover"
        />
        {/* Heavy Dark Overlay to match the prompt */}
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-24 md:pt-32 pb-16 md:pb-32">
        {/* Headline - Reduced Size as requested */}
        <h1 className="text-white text-3xl md:text-6xl lg:text-7xl font-sans font-medium tracking-tight uppercase mb-12 drop-shadow-2xl opacity-95 w-full">
          Amazing Mountain <br />
          <span className="font-bold block mt-2">To Explore</span>
        </h1>

        {/* Simple Professional Search Bar */}
        <div className="w-full max-w-xl relative mb-auto px-2" ref={searchRef}>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full flex items-center shadow-2xl transition-all hover:bg-white/15">
            <input
              type="text"
              placeholder="Search location..."
              className="flex-1 min-w-0 bg-transparent border-none text-white placeholder-gray-300 px-4 py-3 focus:outline-none text-base font-light tracking-wide"
              value={query}
              onChange={handleSearchChange}
            />
            <button
              onClick={() => navigate("/explore")}
              className="bg-[#0F5146] hover:bg-[#0A3D34] text-white px-5 py-3 md:px-10 md:py-4 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs transition-colors duration-300 shadow-lg whitespace-nowrap shrink-0"
            >
              Explore Now
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredDestinations.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl overflow-hidden text-left z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {filteredDestinations.map((dest, i) => (
                <div
                  key={i}
                  onClick={() => selectDestination(dest.City)}
                  className="px-6 py-3 hover:bg-gray-50 cursor-pointer text-gray-800 transition-colors border-b border-gray-100 last:border-0 text-sm"
                >
                  <span className="font-bold">{dest.City}</span>{" "}
                  <span className="text-gray-400 text-xs uppercase ml-2">
                    {dest.Type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats Section - Fixed Alignment */}
      <div className="absolute bottom-0 left-0 w-full z-20 px-4 md:px-8 pb-8 md:pb-12">
        <div className="max-w-6xl mx-auto border-t border-white/15 pt-8">
          {/* Retrying with Flexbox for centered layout with dividers */}
          <div className="hidden md:flex flex-row justify-center items-center gap-16 text-white mt-[-2rem]">
            {" "}
            {/* Adjusted neg margin to replace grid above if needed, but let's just replace the grid content */}
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold font-serif">12</span>
              <div className="text-xs font-light text-gray-300 leading-tight uppercase tracking-wider text-left">
                Years of <br /> Experience
              </div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold font-serif">2K</span>
              <div className="text-xs font-light text-gray-300 leading-tight uppercase tracking-wider text-left">
                Camping <br /> Destination
              </div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold font-serif">3K</span>
              <div className="text-xs font-light text-gray-300 leading-tight uppercase tracking-wider text-left">
                Happy <br /> Costumers
              </div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold font-serif">4.8</span>
              <div className="text-xs font-light text-gray-300 leading-tight uppercase tracking-wider text-left">
                Overal <br /> Rating
              </div>
            </div>
          </div>

          {/* Mobile version of stats (Grid) */}
          <div className="grid grid-cols-2 gap-8 md:hidden text-white justify-items-center mt-[-1rem]">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold font-serif">12</span>
              <div className="text-[10px] font-light text-gray-300 leading-tight uppercase tracking-wider text-left">
                Years of <br /> Experience
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold font-serif">2K</span>
              <div className="text-[10px] font-light text-gray-300 leading-tight uppercase tracking-wider text-left">
                Camping <br /> Destination
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold font-serif">3K</span>
              <div className="text-[10px] font-light text-gray-300 leading-tight uppercase tracking-wider text-left">
                Happy <br /> Costumers
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold font-serif">4.8</span>
              <div className="text-[10px] font-light text-gray-300 leading-tight uppercase tracking-wider text-left">
                Overal <br /> Rating
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
