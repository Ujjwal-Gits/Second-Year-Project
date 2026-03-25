import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Reuse the same session ID as ExplorePage
function getSessionId() {
  let sid = localStorage.getItem("hy_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("hy_session_id", sid);
  }
  return sid;
}

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);

  const {
    id,
    title = "Untitled Experience",
    type = "trekking",
    price = 0,
    images = [],
    agentId,
  } = listing;

  const trackView = () => {
    axios
      .post(
        `${import.meta.env.VITE_API_URL}/api/public/listings/${id}/view`,
        { sessionId: getSessionId() },
        { withCredentials: true },
      )
      .catch(() => {}); // fire-and-forget, never block navigation
  };

  // Prefer live agent name over the denormalized snapshot on the listing
  const companyName =
    listing.agent?.companyName || listing.companyName || "Hamroyatra Partner";

  const image = images?.[0]
    ? images[0].startsWith("http")
      ? images[0]
      : `${import.meta.env.VITE_API_URL}${images[0]}`
    : "https://images.unsplash.com/photo-1544735749-2e78311e09f1?q=80&w=1470&auto=format&fit=crop";

  const durationDays = listing.duration || 1;
  const stayLabel =
    type === "hotel"
      ? listing.hotelCategory === "homestay"
        ? "Homestay"
        : "Hotel Stay"
      : `${durationDays} Day${durationDays !== 1 ? "s" : ""}`;
  const location = "Nepal";

  return (
    <>
      {/* ══════════════════════════════════
                DESKTOP CARD — keep original design
            ══════════════════════════════════ */}
      <div className="hidden md:block snap-center shrink-0 w-full group cursor-default">
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100/60 transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] h-full flex flex-col">
          {/* Image Surface */}
          <div className="relative h-[240px] overflow-hidden m-4 rounded-lg bg-gray-50">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute top-4 right-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInWishlist(!isInWishlist);
                }}
                className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-90 cursor-pointer
                                    ${
                                      isInWishlist
                                        ? "bg-primary text-white border-primary/50"
                                        : "bg-white/80 border border-white/40 text-primary hover:bg-white/100"
                                    }`}
              >
                <span className="material-icons text-xl">
                  {isInWishlist ? "favorite" : "favorite_border"}
                </span>
              </button>
            </div>
            <div className="absolute bottom-4 left-4">
              <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold tracking-wider uppercase">
                {stayLabel}
              </div>
            </div>
          </div>

          {/* Content Details */}
          <div className="px-7 pb-8 pt-2 flex flex-col gap-4 flex-grow">
            <div className="flex flex-col gap-1">
              <Link
                to={`/agent/${agentId}`}
                className="flex items-center gap-2 cursor-pointer group/company"
              >
                <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase group-hover/company:text-[#C5A059] transition-colors">
                  {companyName}
                </span>
                {listing?.agent?.verified && (
                  <span className="material-icons text-[14px] text-green-500">
                    verified
                  </span>
                )}
              </Link>
              <h3 className="text-xl font-bold text-primary leading-tight">
                {title}
              </h3>

              {/* No Reviews + Location */}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  No Reviews
                </span>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="material-icons text-[10px]">
                    location_on
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider">
                    {location}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing + Discover */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-300 font-bold uppercase block mb-[-2px]">
                  Budget
                </span>
                <span className="text-base font-black text-primary leading-tight">
                  NPR {parseFloat(price || 0).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => {
                  trackView();
                  navigate(`/explore/${id}`);
                }}
                className="relative overflow-hidden group/btn flex items-center justify-center gap-1.5 px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all bg-[#1A2B23] text-white hover:bg-[#1D7447] shadow-md shadow-[#1A2B23]/10 active:scale-95 cursor-pointer shrink-0"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  Discover
                  <span className="material-icons text-[12px] group-hover/btn:translate-x-0.5 transition-transform">
                    east
                  </span>
                </span>
                {/* Mirror Shine Effect */}
                <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] transition-all duration-700 group-hover/btn:left-[150%]"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
                MOBILE CARD — minimalistic, compact
            ══════════════════════════════════ */}
      <div
        className="md:hidden cursor-pointer active:scale-[0.98] transition-transform duration-200"
        onClick={() => {
          trackView();
          navigate(`/explore/${id}`);
        }}
      >
        <div className="bg-white rounded-md overflow-hidden border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] h-full flex flex-col">
          {/* Image — compact, no hover effects */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover pointer-events-none select-none"
            />
            {/* Wishlist — smaller */}
            <div className="absolute top-2.5 right-2.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInWishlist(!isInWishlist);
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-colors cursor-pointer
                                    ${
                                      isInWishlist
                                        ? "bg-primary text-white"
                                        : "bg-white/90 text-primary"
                                    }`}
              >
                <span className="material-icons text-[16px]">
                  {isInWishlist ? "favorite" : "favorite_border"}
                </span>
              </button>
            </div>
            {/* Duration badge — bottom left, minimal */}
            <div className="absolute bottom-2.5 left-2.5">
              <div className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[7px] font-bold tracking-wider uppercase">
                {stayLabel}
              </div>
            </div>
          </div>

          {/* Content — tight, no company name, no reviews */}
          <div className="px-3 py-3 flex flex-col gap-1.5 flex-grow">
            <h3 className="text-[13px] font-bold text-primary leading-snug line-clamp-1">
              {title}
            </h3>

            <div className="flex items-center gap-1 text-gray-400">
              <span className="material-icons text-[9px]">location_on</span>
              <span className="text-[8px] uppercase font-semibold tracking-wider">
                {location}
              </span>
            </div>

            {/* Price + Discover — bottom row */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
              <span className="text-[12px] font-black text-primary leading-none">
                NPR {parseFloat(price || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                Discover
                <span className="material-icons text-[12px]">east</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingCard;
