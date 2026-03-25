import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const HERO_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBactHcGKXMoYMor39Rnt_15hSMjKv3UgEOf5nU4FI-GV9EiOZUKsTes5CAWHA956QcUnAvkZqt3IhGUImlEk36F2fnCXp2ZnHB6rWAl9dR5mkIS4KGUg7wvm7SgVdv9LctdNqR1JRisi7lIJnUdOGeSEO5CdRJIDG1DCRnV-fkDJyCF4aNSPmRpbxeLiJO0EFXBi_6gdpsBGbntsrX0kZK8cudkHMs8I305uBvWi1iSFP1MQRFuNM3VPMZaqQizwm2w6B7FQ71yJI",
  "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
];

const CATEGORIES = [
  { id: "all", label: "All Partners", icon: "verified" },
  { id: "trekking", label: "Trekking", icon: "terrain" },
  { id: "travel", label: "Travel", icon: "explore" },
  { id: "hotel", label: "Hotel", icon: "hotel" },
];

// ── Partner Card ──────────────────────────────────────────────────────────────
const PartnerCard = ({ partner, index }) => {
  const profileImg = partner.profileImage
    ? partner.profileImage.startsWith("http")
      ? partner.profileImage
      : `${import.meta.env.VITE_API_URL}${partner.profileImage}`
    : null;

  const initials = (partner.companyName || partner.fullName || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const services = partner.serviceTypes || [];
  const listingCount = partner.listings?.length || 0;
  const followerCount = partner.followers?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="bg-white rounded-[28px] overflow-hidden border border-gray-100 hover:border-primary/20 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all group"
    >
      {/* Cover */}
      <div className="h-28 bg-gradient-to-br from-[#0D1F18] to-[#1D7447] relative overflow-hidden">
        {partner.coverImage && (
          <img
            src={
              partner.coverImage.startsWith("http")
                ? partner.coverImage
                : `${import.meta.env.VITE_API_URL}${partner.coverImage}`
            }
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 30%, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* Avatar */}
      <div className="px-5 relative">
        <div className="w-14 h-14 rounded-2xl -mt-7 border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-emerald-800 to-[#1D7447] flex items-center justify-center relative">
          <span className="text-[15px] font-black text-white absolute">
            {initials}
          </span>
          {profileImg && (
            <img
              src={profileImg}
              alt={partner.companyName}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-3 pb-5">
        <div className="min-w-0 mb-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[14px] font-black text-[#0D1F18] tracking-tight leading-tight truncate">
              {partner.companyName || partner.fullName}
            </h3>
            <span className="material-icons text-[16px] text-primary shrink-0">
              verified
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 truncate">
            {partner.bio
              ? partner.bio.slice(0, 40) + (partner.bio.length > 40 ? "…" : "")
              : "Verified Travel Partner"}
          </p>
        </div>

        {/* Location */}
        {partner.location && (
          <div className="flex items-center gap-1 mt-2 mb-3">
            <span className="material-icons text-[12px] text-gray-300">
              location_on
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              {partner.location}
            </span>
          </div>
        )}

        {/* Service tags */}
        {services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {services.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-[#F7F6F3] text-gray-500 rounded-md capitalize"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
          <div className="flex flex-col">
            <span className="text-[13px] font-black text-[#0D1F18]">
              {listingCount}
            </span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
              Listings
            </span>
          </div>
          <div className="w-px h-6 bg-gray-100" />
          <div className="flex flex-col">
            <span className="text-[13px] font-black text-[#0D1F18]">
              {followerCount}
            </span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
              Followers
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to={`/agent/${partner.id}`}
            className="flex-1 h-9 rounded-xl bg-[#0D1F18] text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-primary transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const VerifiedPartners = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const filterParam = queryParams.get("filter");
  const activeFilter = ["trekking", "travel", "hotel"].includes(filterParam)
    ? filterParam
    : "all";

  const setFilter = (id) => {
    if (id === "all") navigate("/partners");
    else navigate(`/partners?filter=${id}`);
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/public/agents/verified`)
      .then((res) => setPartners(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = partners.filter((p) => {
    const services = (p.serviceTypes || []).map((s) => s.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || services.includes(activeFilter);
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (p.companyName || "").toLowerCase().includes(q) ||
      (p.bio || "").toLowerCase().includes(q) ||
      (p.location || "").toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-display">
      {/* DESKTOP HERO */}
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
          <div
            style={{
              flex: "0 0 38%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
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
                Certified Travel Partners
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
              Nepal's
              <br />
              <span style={{ color: "#C5A059" }}>Finest</span>
              <br />
              Agencies
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
              }}
            >
              Every partner is background-checked, document-verified, and rated
              by real travellers.
            </motion.p>
          </div>

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
            {[
              { row: "1 / 3", img: HERO_IMAGES[0], radius: "28px" },
              { row: "auto", img: HERO_IMAGES[1], radius: "22px" },
              { row: "auto", img: HERO_IMAGES[2], radius: "22px" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  gridRow: item.row,
                  borderRadius: item.radius,
                  overflow: "hidden",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                  position: "relative",
                  background: "#0C1220",
                }}
              >
                <img
                  src={item.img}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)",
                  }}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MOBILE HERO */}
      <section
        className="md:hidden relative overflow-hidden"
        style={{ background: "#0C1220", paddingTop: "72px" }}
      >
        <div className="relative px-5 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5 mb-5"
          >
            <span className="w-5 h-px bg-[#C5A059] opacity-60" />
            <span className="text-[#C5A059] text-[8px] font-extrabold tracking-[0.3em] uppercase">
              Certified Travel Partners
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-white font-black uppercase leading-[0.92] tracking-tight text-[36px] mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Nepal's <span className="text-[#C5A059]">Finest</span>
            <br />
            Agencies
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] bg-[#0C1220]"
          >
            <img
              src={HERO_IMAGES[0]}
              alt="Partners"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C1220]/60 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* FILTER BAR */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-2.5 md:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`flex items-center gap-1.5 px-3 md:px-5 py-1.5 md:py-2.5 rounded-full transition-all duration-300 text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${activeFilter === cat.id ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                >
                  <span
                    className={`material-icons text-[12px] md:text-[14px] ${activeFilter === cat.id ? "text-accent" : "text-gray-300"}`}
                  >
                    {cat.icon}
                  </span>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 gap-1.5 shrink-0 w-[130px] md:w-[300px] transition-all focus-within:border-primary/30">
              <span className="material-icons text-gray-300 text-[15px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-700 text-[11px] font-medium w-full placeholder:text-gray-300"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-300 hover:text-gray-500"
                >
                  <span className="material-icons text-[13px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* STATS BAR */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-3 md:py-4 flex items-center gap-4 md:gap-6">
          {[
            {
              icon: "verified",
              label: "Verified Partners",
              value: partners.length || "—",
            },
            {
              icon: "explore",
              label: "Total Listings",
              value:
                partners.reduce((a, p) => a + (p.listings?.length || 0), 0) ||
                "—",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2.5 shrink-0"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-icons text-primary text-[13px] md:text-[15px]">
                  {stat.icon}
                </span>
              </div>
              <div>
                <p className="text-[13px] md:text-[14px] font-black text-[#0D1F18]">
                  {stat.value}
                </p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((partner, i) => (
                  <PartnerCard key={partner.id} partner={partner} index={i} />
                ))}
              </AnimatePresence>
            </div>
            {filtered.length === 0 && (
              <div className="py-24 text-center">
                <span className="material-icons text-[48px] text-gray-200 mb-3 block">
                  search_off
                </span>
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">
                  {partners.length === 0
                    ? "No verified partners yet"
                    : "No partners found"}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Banner */}
      <div className="relative bg-[#0D1F18] overflow-hidden mx-4 md:mx-10 mb-12 rounded-[32px]">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-8 py-14 text-center">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">
            Hamro Yatra
          </p>
          <h2 className="text-3xl font-black text-white italic tracking-tight mb-3">
            Want personalized travel support?
          </h2>
          <p className="text-white/50 text-[13px] font-medium mb-8 max-w-sm mx-auto">
            Our dedicated local experts are ready to curate every detail of your
            journey.
          </p>
          <button className="bg-white text-[#0D1F18] px-8 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl">
            Contact an Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifiedPartners;
