import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ListingCard from "./ListingCard";

// ── Session ID: persisted in localStorage, works for guests too ──
function getSessionId() {
  let sid = localStorage.getItem("hy_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("hy_session_id", sid);
  }
  return sid;
}

const ExplorePage = () => {
  const location = useLocation();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const sessionId = useRef(getSessionId());

  const HERO_IMAGES = {
    all: [
      "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBGYhYaK6nvVKi37qTjkT4nGNuRlN4yzCgqRt8inQZlqEaYjrrYmYRn60RAr_gcv7ZIpPKEJx4tKtaFiAtvqt11RJ9lKm4bxg0AYMqB4pwCRq0x65mLVZSCwGhR96tkh8d7aP7VAPfv-1Yc_X0GiCq_1d240yKlszCFQ7D53XMthym5cyd2xw3Gsrg2XAHtHRNJw_LPEuJoRiPdOYRv0Ze5m2yt6AJsUdFClRielWKBuo6VpZchfVCYleXXF28vEMfFKCfMc8qfR4s",
    ],
    hotel: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    ],
    trekking: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBactHcGKXMoYMor39Rnt_15hSMjKv3UgEOf5nU4FI-GV9EiOZUKsTes5CAWHA956QcUnAvkZqt3IhGUImlEk36F2fnCXp2ZnHB6rWAl9dR5mkIS4KGUg7wvm7SgVdv9LctdNqR1JRisi7lIJnUdOGeSEO5CdRJIDG1DCRnV-fkDJyCF4aNSPmRpbxeLiJO0EFXBi_6gdpsBGbntsrX0kZK8cudkHMs8I305uBvWi1iSFP1MQRFuNM3VPMZaqQizwm2w6B7FQ71yJI",
      "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=900&q=80",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBTmGU_CiNKkCbZbHY7q7ZstEOJXPpnwb6Qul3EZ6Xu2ux5lIF1G72VAX8wp7GSc2YvHUsiajJHa2teddQJocO8p40HtCOP_FeJ1FktgM5u7CcQRzykxFNWlLhl0CuKoJJmdrPSMGPIDW7MH2HewjUWokkHOSEqK-kNwYoPlk35d-I6ImWjnwqdQ720tCr-hLhu6MFQV40gmHOXY9y-xUF-mV2uUZFPaFH1apPkR9pv3NG61Ts2dYiw_wSi1eY9PlhZ1hb3J3VDeGo",
    ],
    travel: [
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=900&q=80",
    ],
  };

  // Fallback just in case
  const currentImages = HERO_IMAGES[type] || HERO_IMAGES["all"];

  const HERO_WORD = {
    all: "World",
    hotel: "Hotels",
    trekking: "Trails",
    travel: "Destinations",
  };
  const currentWord = HERO_WORD[type] || HERO_WORD["all"];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const filterParam = queryParams.get("filter");
    if (filterParam && ["hotel", "trekking", "travel"].includes(filterParam)) {
      setType(filterParam);
    } else {
      setType("all");
    }
  }, [location.search]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (type !== "all") params.append("type", type);
      params.append("sessionId", sessionId.current);
      const response = await axios.get(
        `http://localhost:5000/api/public/listings?${params.toString()}`,
        { withCredentials: true },
      );
      setListings(response.data);
    } catch (err) {
      console.error("Fetch listings error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => fetchListings(), 400);
    return () => clearTimeout(debounce);
  }, [search, type]);

  const categories = [
    { id: "all", label: "All", icon: "dashboard" },
    { id: "hotel", label: "Hotel", icon: "hotel" },
    { id: "trekking", label: "Trekking", icon: "terrain" },
    { id: "travel", label: "Travel", icon: "explore" },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════
                HERO — Desktop: full mosaic | Mobile: minimal single image
            ══════════════════════════════════════════ */}

      {/* ── DESKTOP HERO (hidden on mobile) ── */}
      <section
        className="hidden md:flex"
        style={{
          background: "#0C1220",
          height: "calc(100vh - 72px)",
          alignItems: "stretch",
          overflow: "hidden",
          paddingTop: "72px",
        }}
      >
        <div
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            width: "100%",
            padding: "32px 40px 40px",
            display: "flex",
            gap: "40px",
            alignItems: "center",
          }}
        >
          {/* ── LEFT: Text content ── */}
          <div
            style={{
              flex: "0 0 38%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "0",
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  width: "28px",
                  height: "1px",
                  background: "#C5A059",
                  opacity: 0.6,
                }}
              />
              <span
                style={{
                  color: "#C5A059",
                  fontWeight: 800,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  fontSize: "9px",
                }}
              >
                Curated Collection
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                duration: 0.85,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 0.88,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                fontSize: "clamp(42px, 5vw, 76px)",
                marginBottom: "24px",
              }}
            >
              Explore
              <br />
              The{" "}
              <span style={{ color: "#C5A059" }}>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={currentWord}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15, position: "absolute" }}
                    transition={{ duration: 0.3 }}
                    style={{ display: "inline-block" }}
                  >
                    {currentWord}
                  </motion.span>
                </AnimatePresence>
              </span>
              <br />
              Today
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.8 }}
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: "13px",
                lineHeight: 1.75,
                fontWeight: 500,
                maxWidth: "260px",
                marginBottom: "32px",
              }}
            >
              Handpicked hotels, treks &amp; travel experiences across the
              breathtaking Himalayas of Nepal.
            </motion.p>
          </div>

          {/* ── RIGHT: 3-image premium mosaic ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gridTemplateRows: "1fr 1fr",
              gap: "12px",
              height: "100%",
              minHeight: 0,
            }}
          >
            <div
              style={{
                gridRow: "1 / 3",
                borderRadius: "28px",
                overflow: "hidden",
                border: "1.5px solid rgba(255,255,255,0.1)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                position: "relative",
                background: "#0C1220",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImages[0]}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  src={currentImages[0]}
                  alt="Hero 1"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    position: "absolute",
                  }}
                />
              </AnimatePresence>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)",
                }}
              />
            </div>

            <div
              style={{
                borderRadius: "22px",
                overflow: "hidden",
                border: "1.5px solid rgba(255,255,255,0.08)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                position: "relative",
                background: "#0C1220",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImages[1]}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  src={currentImages[1]}
                  alt="Hero 2"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    position: "absolute",
                  }}
                />
              </AnimatePresence>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 60%)",
                }}
              />
            </div>

            <div
              style={{
                borderRadius: "22px",
                overflow: "hidden",
                border: "1.5px solid rgba(255,255,255,0.08)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                position: "relative",
                background: "#0C1220",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImages[2]}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  src={currentImages[2]}
                  alt="Hero 3"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    position: "absolute",
                  }}
                />
              </AnimatePresence>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 60%)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MOBILE HERO (hidden on desktop) ── */}
      <section
        className="md:hidden relative overflow-hidden"
        style={{ background: "#0C1220", paddingTop: "72px" }}
      >
        <div className="relative px-5 pt-8 pb-6">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5 mb-5"
          >
            <span className="w-5 h-px bg-[#C5A059] opacity-60" />
            <span className="text-[#C5A059] text-[8px] font-extrabold tracking-[0.3em] uppercase">
              Curated Collection
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-white font-black uppercase leading-[0.92] tracking-tight text-[36px] mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Explore The
            <br />
            <span className="text-[#C5A059]">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, position: "absolute" }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  {currentWord}
                </motion.span>
              </AnimatePresence>
            </span>{" "}
            Today
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.6 }}
            className="text-white/25 text-[11px] font-medium leading-relaxed max-w-[220px] mb-6"
          >
            Handpicked hotels, treks & travel experiences across the
            breathtaking Himalayas.
          </motion.p>

          {/* Single minimal image — rounded, compact */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] bg-[#0C1220]"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImages[0]}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                src={currentImages[0]}
                alt="Mobile Hero"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C1220]/60 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
                FILTER BAR + SEARCH
            ══════════════════════════════════════════ */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-2.5 md:py-3">
          {/* Desktop: single row | Mobile: stacked */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-4">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setType(cat.id)}
                  className={`
                                        flex items-center gap-1.5 md:gap-2 px-3.5 md:px-5 py-2 md:py-2.5 rounded-full transition-all duration-300
                                        text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap
                                        ${
                                          type === cat.id
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                        }
                                    `}
                >
                  <span
                    className={`material-icons text-[12px] md:text-[14px] ${type === cat.id ? "text-accent" : "text-gray-300"}`}
                  >
                    {cat.icon}
                  </span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search pill */}
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full px-3.5 md:px-4 py-2 md:py-2.5 gap-2 w-full md:max-w-[300px] shrink-0 transition-all focus-within:border-primary/30 focus-within:shadow-sm">
              <span className="material-icons text-gray-300 text-[16px] md:text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search experiences..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-700 text-[11px] md:text-[12px] font-medium w-full placeholder:text-gray-300"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <span className="material-icons text-[14px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
                RESULTS GRID
            ══════════════════════════════════════════ */}
      <section className="bg-[#FDFDFD] py-6 md:py-20 min-h-[60vh]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-2xl md:rounded-[2rem] aspect-[3/4] md:aspect-[4/5] animate-pulse"
                />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <AnimatePresence mode="popLayout">
                {listings.map((l, idx) => (
                  <motion.div
                    key={l.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <ListingCard listing={l} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-28 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-icons text-gray-200 text-4xl">
                  travel_explore
                </span>
              </div>
              <h3 className="text-lg font-black text-primary uppercase tracking-widest mb-2">
                No Experiences Found
              </h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto font-medium">
                Adjust your search or filters to discover Nepal's finest
                experiences.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ExplorePage;
