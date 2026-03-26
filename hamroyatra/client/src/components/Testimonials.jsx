import React from "react";
import { motion } from "framer-motion";

// Import local assets
import AsmitImg from "../assets/Asmit.jpeg";
import NischalImg from "../assets/Nischal.jpeg";
import SujitImg from "../assets/Sujit.jpg";
import UjjwalImg from "../assets/Ujjwal.jpg";
import SamirImg from "../assets/Samir.jpeg";
import BinishaImg from "../assets/Binisha.jpeg";
import PritamImg from "../assets/Pritam.jpeg";
const Testimonials = () => {
  // Brand Colors
  const brandPrimary = "#1A2B23"; // Charcoal Green
  const brandAccent = "#C5A059"; // Gold

  // Unified Animation Variants for persistent scroll effects
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.7, y: 60 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        delay: i * 0.12,
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 0.8,
      },
    }),
  };

  return (
    <section className="py-20 bg-[#f4f6f8] overflow-visible relative min-h-screen flex flex-col justify-center">
      <div className="max-w-[1400px] mx-auto px-6 w-full h-full relative">
        {/* SECTION HEADER - Persistent Scroll Sync */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <span className="text-[#C5A059] font-bold tracking-[0.4em] uppercase text-[9px] mb-3 block">
            Refined Stories
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1D7447] font-bold mb-4 tracking-tight">
            Voices of Our Community
          </h2>
          <p className="text-gray-500 text-base font-light leading-relaxed">
            Discover the real experiences of travelers who explored the
            Himalayas with Hamro Yatra's premium hospitality and expert
            guidance.
          </p>
        </motion.div>

        {/* THE MAPPED MATRIX - All 7 Cards Maintained */}
        <div className="relative w-full h-[750px] mx-auto hidden lg:block">
          {/* 1. TOP LEFT: Asmit - Annapurna Trek */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="absolute top-[2%] left-[2%] w-[220px] bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100"
          >
            <div className="p-6 pb-8 text-center">
              <div className="flex justify-center mb-3 text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-icons text-[14px]">
                    star
                  </span>
                ))}
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                "Booked the Annapurna Trek from HamroYatra, got best service and
                the Guide was also experienced. Truly a lifetime experience!"
              </p>
            </div>
            <div className="bg-[#1A2B23] p-5 text-center relative mt-[-10px]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-lg bg-white">
                <img
                  src={AsmitImg}
                  alt="Asmit"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-3">
                <h4 className="text-white text-[11px] font-bold">Asmit</h4>
                <p className="text-white/30 text-[8px] uppercase tracking-widest font-bold">
                  Verified Trekker
                </p>
              </div>
            </div>
          </motion.div>

          {/* 2. UPPER MID: Speech Bubble Right */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="absolute top-[2%] left-[23%] flex items-start gap-4"
          >
            <div className="bg-white rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100 max-w-[190px] relative after:content-[''] after:absolute after:top-6 after:left-full after:border-[10px] after:border-transparent after:border-l-white">
              <h4 className="text-[#1A2B23] font-bold text-[13px] mb-1">
                "I think that's great!"
              </h4>
              <p className="text-gray-400 text-[10px] leading-relaxed mb-3">
                As a Foreigner, I feel they give the best Service
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[#1A2B23] text-[9px] font-bold">
                  Pritam
                </span>
                <div className="bg-[#1A2B23] text-[#C5A059] text-[8px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                  <span className="material-icons text-[8px]">star</span> 5.0
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-[#C5A059] overflow-hidden shadow-md mt-4 bg-white shrink-0">
              <img
                src={PritamImg}
                alt="Pritam"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* 3. UPPER MID RIGHT: Nischal - Everest Trek */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="absolute top-[2%] left-[45%] w-[260px] bg-white rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100"
          >
            <span className="material-icons absolute top-3 left-4 text-[#1A2B23] text-2xl opacity-10">
              format_quote
            </span>
            <p className="text-gray-500 text-[11px] leading-relaxed mb-8 pt-4">
              "Booked the Everest Base Camp Trek from HamroYatra, got best
              service and the guide was also very experienced. Incredible
              journey!"
            </p>
            <div className="absolute -bottom-4 right-0 flex items-center gap-3 bg-[#1A2B23] pl-2 pr-5 py-1.5 rounded-full shadow-lg">
              <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
                <img
                  src={NischalImg}
                  alt="Nischal"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-white text-[10px] font-bold">Nischal</h4>
                <p className="text-white/40 text-[7px] uppercase tracking-widest leading-none font-bold">
                  Verified Trekker
                </p>
              </div>
            </div>
          </motion.div>

          {/* 4. TOP RIGHT: Samir - Chitwan Package */}
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="absolute top-[2%] right-[2%] w-[260px] z-20"
          >
            <div className="bg-white rounded-[2.5rem] border-[2px] border-[#C5A059] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.06)] flex flex-col">
              <div className="h-[200px] overflow-hidden">
                <img
                  src={SamirImg}
                  alt="Samir"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="pt-5 pb-8 px-6 text-center">
                <p className="text-gray-500 text-[10px] leading-relaxed italic mb-5 px-1">
                  "Booked a premium Chitwan Safari package through HamroYatra.
                  The entire trip was professionally curated with exceptional
                  hospitality and a highly knowledgeable guide."
                </p>

                <div className="mt-2">
                  <h4 className="text-[#1A2B23] font-black text-[11px] uppercase tracking-tighter">
                    Samir
                  </h4>
                  <p className="text-[#C5A059] font-bold text-[9px] mt-0.5">
                    @samir_ventures
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 5. CENTER HUB - Ujjwal CEO */}
          <motion.div
            custom={4}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="absolute top-[28%] left-[35%] z-30"
          >
            <div className="bg-[#1A2B23] rounded-[2.5rem] p-10 text-center shadow-[0_40px_80px_rgba(0,0,0,0.2)] w-[320px] border-[2px] border-[#C5A059]">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-[#C5A059] overflow-hidden shadow-lg bg-gray-500">
                  <img
                    src={UjjwalImg}
                    className="w-full h-full object-cover"
                    alt="Ujjwal"
                  />
                </div>
              </div>
              <h3 className="text-white font-bold text-xl mb-1 italic uppercase tracking-tighter">
                Ujjwal
              </h3>
              <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-bold mb-4">
                CEO @HamroYatra
              </p>
              <p className="text-white/60 text-[11px] leading-relaxed mb-6">
                "Our mission is to provide the most authentic and safe Himalayan
                experiences. We take pride in our expert guides and premium
                services."
              </p>
              <div className="flex items-center justify-between border-t border-white/5 pt-5">
                <span className="text-[#C5A059] text-[10px] font-bold italic">
                  Founding Vision
                </span>
                <div className="flex text-[#C5A059]">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-icons text-xs">
                      star
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 8. LEFT MID: Sujit - Langtang Trek */}
          <motion.div
            custom={5}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="absolute top-[40%] left-[2%] flex items-center min-w-[280px] z-10"
          >
            <div className="w-[100px] h-[130px] rounded-2xl overflow-hidden shadow-xl border-4 border-white rotate-[-3deg] z-10 bg-white">
              <img
                src={SujitImg}
                alt="Sujit"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white rounded-3xl p-6 pl-10 pr-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100 translate-x-[-15px]">
              <p className="text-gray-400 text-[10px] leading-relaxed mb-3 max-w-[150px]">
                "Booked the Langtang Trek from HamroYatra, got best service and
                the guide was experienced."
              </p>
              <div className="flex items-center gap-2">
                <span className="material-icons text-[#1A2B23] text-sm">
                  terrain
                </span>
                <span className="text-[10px] font-bold text-[#1A2B23]">
                  Verified Trekker
                </span>
              </div>
            </div>
          </motion.div>

          {/* 9. MID-RIGHT: Anish - Homestay in Nepal */}
          <motion.div
            custom={6}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="absolute top-[52%] mt-[20px] right-[7%] z-20 flex items-center gap-4"
          >
            <div className="w-20 h-20 rounded-full border-4 border-[#C5A059] overflow-hidden shadow-lg bg-white shrink-0">
              <img
                src={BinishaImg}
                alt="Binisha"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white rounded-[2rem] p-6 pr-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100 relative after:content-[''] after:absolute after:top-1/2 after:right-full after:border-[12px] after:border-transparent after:border-r-white after:-translate-y-1/2 min-w-[240px]">
              <h4 className="text-[#1A2B23] font-bold text-base mb-1">
                Best Place to Book Homestay in Nepal
              </h4>
              <p className="text-gray-400 text-[10px] leading-relaxed mb-4">
                I have booked homestay in from HamroYatra, got best service.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#1A2B23]/70 uppercase tracking-widest leading-none">
                  @binisha
                </span>
                <div className="bg-[#1A2B23] text-[#C5A059] text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="material-icons text-[10px]">star</span> 4.5
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* MOBILE VIEW - Cinematic Chat Conversation */}
        <div className="lg:hidden flex flex-col gap-12 pt-10 pb-20 overflow-hidden">
          {[
            {
              img: BinishaImg,
              name: "Binisha",
              handle: "@binisha",
              title: "Best Place to Book Homestay in Nepal",
              text: "I have booked homestay in from HamroYatra, got best service.",
              rating: "4.5",
            },
            {
              img: PritamImg,
              name: "Pritam",
              handle: "@pritam_globally",
              title: "Exceptional Foreigner Support",
              text: "I think that's great! As a Foreigner, I feel they give the best Service in the Himalayas.",
              rating: "5.0",
            },
            {
              img: NischalImg,
              name: "Nischal",
              handle: "@nischal_treks",
              title: "Legendary Everest Journey",
              text: "Booked the Everest Base Camp Trek, got best service and the guide was also very experienced.",
              rating: "4.8",
            },
            {
              img: AsmitImg,
              name: "Asmit",
              handle: "@asmit_himal",
              title: "Annapurna was Breathless",
              text: "Booked the Annapurna Trek from HamroYatra, got best service and guide was professional.",
              rating: "4.9",
            },
            {
              img: SamirImg,
              name: "Samir",
              handle: "@samir_ventures",
              title: "Safari of a Lifetime",
              text: "Booked a premium Chitwan Safari package. The entire trip was professionally curated with excellence.",
              rating: "5.0",
            },
            {
              img: SujitImg,
              name: "Sujit",
              handle: "@sujit_mountains",
              title: "Langtang Hidden Gem",
              text: "Booked the Langtang Trek from HamroYatra, got best service and the guide was experienced.",
              rating: "4.7",
            },
            {
              img: UjjwalImg,
              name: "Ujjwal",
              handle: "@HamroYatra_CEO",
              title: "Our Commitment to You",
              text: "Our mission is to provide the most authentic and safe Himalayan experiences. We take pride in our service.",
              rating: "5.0",
            },
          ].map((item, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={idx}
                custom={idx}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className={`flex items-end gap-3 w-full ${isEven ? "flex-row" : "flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full border-[3px] border-[#C5A059] overflow-hidden shrink-0 shadow-md bg-white">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Chat Bubble */}
                <div
                  className={`relative flex-1 bg-white p-5 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-50
                  ${
                    isEven
                      ? 'rounded-bl-none after:content-[""] after:absolute after:bottom-0 after:right-full after:border-[10px] after:border-transparent after:border-r-white after:translate-y-0'
                      : 'rounded-br-none after:content-[""] after:absolute after:bottom-0 after:left-full after:border-[10px] after:border-transparent after:border-l-white after:translate-y-0'
                  }`}
                >
                  <h4 className="text-[#1A2B23] font-bold text-sm mb-1">
                    {item.title}
                  </h4>
                  <p className="text-gray-400 text-[10px] leading-relaxed mb-4">
                    {item.text}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      {item.handle}
                    </span>
                    <div className="bg-[#1A2B23] text-[#C5A059] text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <span className="material-icons text-[10px]">star</span>
                      {item.rating}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
