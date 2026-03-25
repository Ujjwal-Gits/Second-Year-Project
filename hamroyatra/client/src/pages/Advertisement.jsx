import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CustomDropdown from "../components/CustomDropdown";
import SEO from "../components/SEO";

const SPONSORSHIP_OPTIONS = [
  { value: "festival", label: "Festival Highlight" },
  { value: "featured", label: "Featured Destination (Homepage)" },
  { value: "search_top", label: "Top Search Priority" },
  { value: "discounts", label: "Exclusive Deals Section" },
];

const DURATION_OPTIONS = [
  { value: "1_week", label: "1 Week" },
  { value: "2_week", label: "2 Weeks" },
  { value: "1_month", label: "1 Month" },
];

const LISTING_OPTIONS = [
  { value: "everest_bc", label: "Everest Base Camp Trek - 14 Days" },
  { value: "annapurna", label: "Annapurna Circuit Adventure" },
  { value: "pokhara_retreat", label: "Pokhara Luxury Retreat" },
  { value: "chitwan_safari", label: "Chitwan Jungle Safari Master Package" },
];

const DURATION_PRICES = {
  "1_week": {
    festival: 5000,
    featured: 7000,
    search_top: 4000,
    discounts: 2500,
  },
  "2_week": {
    festival: 9000,
    featured: 13000,
    search_top: 7500,
    discounts: 4500,
  },
  "1_month": {
    festival: 16000,
    featured: 22000,
    search_top: 12000,
    discounts: 8000,
  },
};

const Advertisement = () => {
  const [sponsorshipType, setSponsorshipType] = useState("festival"); // Default
  const [duration, setDuration] = useState("1_week");
  const [selectedListing, setSelectedListing] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState(0);
  const [needDesignService, setNeedDesignService] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [redirectionLink, setRedirectionLink] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [isListingDropdownOpen, setIsListingDropdownOpen] = useState(false);

  useEffect(() => {
    if (sponsorshipType === "featured" || sponsorshipType === "search_top") {
      setBannerImage(null);
      setBannerPreview(null);
      setRedirectionLink("");
      setNeedDesignService(false);
    }
  }, [sponsorshipType]);

  const filteredListings = LISTING_OPTIONS.filter((o) =>
    o.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // Calculate End Date
    if (startDate && duration) {
      const start = new Date(startDate);
      const end = new Date(start);
      if (duration === "1_week") end.setDate(start.getDate() + 7);
      else if (duration === "2_week") end.setDate(start.getDate() + 14);
      else if (duration === "1_month") end.setMonth(start.getMonth() + 1);

      setEndDate(end.toISOString().split("T")[0]);
    } else {
      setEndDate("");
    }

    // Calculate Price
    let currentPrice = DURATION_PRICES[duration][sponsorshipType] || 0;
    if (needDesignService) {
      currentPrice += 1500;
    }
    setPrice(currentPrice);
  }, [startDate, duration, sponsorshipType, needDesignService]);

  return (
    <div className="min-h-screen bg-[#FBFBFB] pt-32 pb-24 px-4 lg:px-8 font-display">
      <SEO
        title="Advertise Your Travel Business on HamroYatra | Sponsor Listings"
        description="Promote your trekking agency, hotel or travel company on HamroYatra. Reach thousands of Nepal travellers with featured listings, homepage spots and search priority."
        keywords="advertise travel agency Nepal, sponsor Nepal trekking listing, Nepal travel platform advertising, promote hotel Nepal"
        canonical="/advertisement"
      />
      <div className="max-w-[1000px] mx-auto space-y-12">
        {/* Intro Section */}
        <div className="bg-white p-8 lg:p-12 border border-gray-100 shadow-sm rounded-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          <h1 className="text-3xl lg:text-4xl font-black text-[#0D1F18] tracking-tight uppercase mb-4">
            Advertisement Process
          </h1>
          <p className="text-lg font-bold text-gray-800 mb-6">
            Amplify Your Reach. Stand Out in the Elite Collection.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-sm p-5 mb-4 flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="material-icons text-amber-600">
                  verified_user
                </span>
              </div>
              <div>
                <p className="text-amber-800 font-black text-sm uppercase tracking-wide mb-1">
                  Mandatory Verification Required
                </p>
                <p className="text-amber-700/80 text-[11px] font-bold leading-relaxed">
                  You must be a fully verified partner to apply for sponsorship.
                </p>
              </div>
            </div>
            <a
              href="/become-partner"
              className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-sm transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              Apply for Verification Here
            </a>
          </div>
        </div>

        {/* Advertisement Application Form */}
        <div className="bg-white p-8 lg:p-12 border border-gray-100 shadow-sm rounded-lg">
          <h2 className="text-xl font-black text-[#0D1F18] uppercase tracking-widest mb-10 flex items-center gap-3 border-b border-gray-100 pb-4">
            <span className="material-icons text-primary text-2xl">
              campaign
            </span>
            Advertise Your Listing
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
            {/* Left Column: Form Details */}
            <div className="space-y-8">
              {/* Sponsorship Type */}
              <div className="relative z-[90]">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                  Sponsorship Type
                </label>
                <CustomDropdown
                  options={SPONSORSHIP_OPTIONS}
                  value={sponsorshipType}
                  onChange={(val) => setSponsorshipType(val)}
                  placeholder="Select Category"
                  icon="auto_awesome"
                />
              </div>

              {/* Select Listing */}
              <div className="relative z-[80]">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                  Select Listing to Advertise
                </label>
                <div className="relative">
                  <div
                    className={`w-full h-[44px] bg-[#F7F6F3]/50 border transition-all flex items-center px-4 rounded-xl relative ${isListingDropdownOpen ? "ring-4 ring-primary/5 border-primary shadow-sm bg-white" : "border-transparent hover:border-gray-200"}`}
                  >
                    <input
                      type="text"
                      className="w-full bg-transparent text-[12px] font-black text-[#0D1F18] outline-none placeholder:text-gray-300 placeholder:font-black tracking-tight"
                      placeholder="Search your listings..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsListingDropdownOpen(true);
                      }}
                      onFocus={() => setIsListingDropdownOpen(true)}
                      onBlur={() =>
                        setTimeout(() => setIsListingDropdownOpen(false), 200)
                      }
                    />
                    <span className="material-icons text-gray-400 text-lg ml-2 shrink-0">
                      search
                    </span>
                  </div>

                  {/* Dropdown Options */}
                  <AnimatePresence>
                    {isListingDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 right-0 top-[110%] bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 p-2 z-[999] max-h-56 overflow-y-auto custom-scrollbar"
                      >
                        {filteredListings.length > 0 ? (
                          filteredListings.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setSelectedListing(opt.value);
                                setSearchQuery(opt.label);
                                setIsListingDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between ${selectedListing === opt.value ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-600 hover:bg-gray-50 hover:text-primary"}`}
                            >
                              <span>{opt.label}</span>
                              {selectedListing === opt.value && (
                                <span className="material-icons text-[16px]">
                                  check_circle
                                </span>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="py-8 text-center bg-gray-50/50 rounded-xl m-1">
                            <span className="material-icons text-gray-200 text-2xl mb-1">
                              search_off
                            </span>
                            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                              No results found
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Duration & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-[70]">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                    Duration
                  </label>
                  <CustomDropdown
                    options={DURATION_OPTIONS}
                    value={duration}
                    onChange={(val) => setDuration(val)}
                    placeholder="Select Duration"
                    icon="schedule"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full h-[44px] px-4 bg-[#F7F6F3]/50 border border-transparent hover:border-gray-200 focus:border-primary focus:bg-white rounded-xl text-xs font-black text-[#0D1F18] transition-all outline-none"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                  End Date (Auto-calculated)
                </label>
                <div className="w-full h-[44px] px-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center text-xs font-black text-gray-400 cursor-not-allowed">
                  {endDate || "Select start date first"}
                </div>
              </div>

              {/* Link */}
              {sponsorshipType !== "featured" &&
                sponsorshipType !== "search_top" && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                      Redirection Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://"
                      className="w-full h-[44px] px-4 bg-[#F7F6F3]/50 border border-transparent hover:border-gray-200 focus:border-primary focus:bg-white rounded-xl text-xs font-black text-[#0D1F18] transition-all outline-none"
                      value={redirectionLink}
                      onChange={(e) => setRedirectionLink(e.target.value)}
                    />
                  </div>
                )}
            </div>

            {/* Right Column: Upload & Pricing */}
            <div className="space-y-8 relative z-10">
              {/* Banner Image Upload */}
              {sponsorshipType !== "featured" &&
                sponsorshipType !== "search_top" && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                      Advertisement Banner Image
                    </label>
                    <label className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col items-center justify-center relative overflow-hidden h-44 w-full">
                      <input
                        type="file"
                        className="hidden"
                        accept=".png, .jpeg, .jpg, .webp"
                        onChange={handleImageUpload}
                      />
                      {bannerPreview ? (
                        <div className="absolute inset-0 w-full h-full relative group/preview">
                          <img
                            src={bannerPreview}
                            alt="Banner Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                              <span className="material-icons text-white">
                                edit
                              </span>
                              Change Image
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <span className="material-icons text-primary/60 text-xl">
                              add_photo_alternate
                            </span>
                          </div>
                          <span className="text-xs font-black text-[#0D1F18] uppercase tracking-wide">
                            Upload Desktop Banner
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-widest">
                            Format: 1200x300px (16:4)
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium mt-1">
                            Accepts: PNG, JPEG, JPG, WEBP
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                )}

              {/* Design Service Toggle */}
              {sponsorshipType !== "featured" &&
                sponsorshipType !== "search_top" && (
                  <div
                    className={`p-5 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${needDesignService ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-gray-200 hover:border-primary/40"}`}
                    onClick={() => setNeedDesignService(!needDesignService)}
                  >
                    <div
                      className={`w-5 h-5 mt-0.5 rounded-md flex shrink-0 items-center justify-center transition-colors ${needDesignService ? "bg-primary border-primary" : "bg-gray-100 border-gray-300 border"}`}
                    >
                      {needDesignService && (
                        <span className="material-icons text-white text-[14px]">
                          check
                        </span>
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-black uppercase tracking-wide ${needDesignService ? "text-primary" : "text-[#0D1F18]"}`}
                      >
                        Hamroyatra Design Service
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-1.5">
                        Let our elite design team create a high-converting
                        banner for your advertisement. (+ NPR 1,500)
                      </p>
                    </div>
                  </div>
                )}

              {/* Pricing Summary */}
              <div className="bg-[#0D1F18] p-6 md:p-8 rounded-2xl text-white shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full pointer-events-none blur-2xl" />

                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-6 md:mb-5 flex items-center gap-2">
                  <span className="material-icons text-[14px]">
                    receipt_long
                  </span>
                  Financial Overview
                </h3>

                <div className="space-y-5 md:space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                    <span className="text-white/70 font-medium text-[11px] md:text-xs">
                      Base Sponsorship (
                      {
                        DURATION_OPTIONS.find((o) => o.value === duration)
                          ?.label
                      }
                      )
                    </span>
                    <span className="font-bold text-[13px] md:text-sm">
                      NPR{" "}
                      {(
                        price - (needDesignService ? 1500 : 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                    <span className="text-white/70 font-medium text-[11px] md:text-xs">
                      Category Modifier (
                      {
                        SPONSORSHIP_OPTIONS.find(
                          (o) => o.value === sponsorshipType,
                        )?.label
                      }
                      )
                    </span>
                    <span className="font-bold text-[#C5A059] uppercase text-[9px] md:text-[10px] tracking-widest text-right whitespace-nowrap">
                      Calculated
                    </span>
                  </div>
                  {needDesignService && (
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                      <span className="text-white/70 font-medium text-[11px] md:text-xs">
                        Premium Design Service
                      </span>
                      <span className="font-bold text-[13px] md:text-sm">
                        + NPR 1,500
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-10 md:mb-8 relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Total Investment
                  </span>
                  <span className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    NPR {price.toLocaleString()}
                  </span>
                </div>

                <button className="w-full h-11 md:h-12 rounded-xl bg-primary hover:bg-[#1D7447] text-white font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all relative z-10 shadow-lg shadow-primary/20 active:scale-[0.98]">
                  Submit Protocol
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SEO-Focused Blog Content Section */}
        <div className="bg-white p-8 lg:p-14 border border-gray-100 shadow-sm rounded-lg mt-12">
          <article className="prose prose-sm md:prose-base max-w-none prose-headings:font-black prose-headings:text-[#0D1F18] prose-p:text-gray-600 prose-a:text-primary prose-strong:font-bold prose-ul:text-gray-600">
            <h1 className="text-3xl uppercase tracking-tight mb-8 pb-4 border-b border-gray-100">
              Hamroyatra Advertising Ecosystem: A Comprehensive Guide on How to
              Advertise Your Travel Business in Nepal
            </h1>

            <p>
              In the highly competitive landscape of Nepal tourism advertising,
              gaining visibility is the ultimate key to success. The Hamroyatra
              Advertising Ecosystem is engineered specifically for our verified
              partners to help you promote trekking packages, luxury hotel
              stays, and unique travel experiences directly to high-intent
              travelers. This guide will walk you through exactly how to boost
              travel agency bookings using our tailored advertising solutions.
            </p>

            <h2 className="text-2xl mt-12 mb-6">
              Why Partner Verification is the First Step to Guarantee Trust
            </h2>
            <p>
              At Hamroyatra, the foundation of every successful booking is
              trust. We have a strict rule: only fully verified travel agencies
              and hoteliers are allowed to use our advertising platform. This
              strict verification process ensures that when a traveler clicks on
              your sponsored "Featured Destination" banner, they know they are
              booking with a legally compliant, highly reputable Nepalese
              business. Unverified accounts will not be able to advertise, which
              protects the premium quality of our luxury travel marketing
              ecosystem.
            </p>

            <h2 className="text-2xl mt-12 mb-6">
              A Deep Dive into Our Strategic Sponsorship Categories
            </h2>
            <p>
              We know that a one-size-fits-all approach does not work in travel
              marketing. Therefore, we offer five unique, SEO-driven sponsorship
              categories. Each option requires a different investment and target
              specific traveler behaviors to maximize your ROI (Return on
              Investment):
            </p>

            <div className="space-y-6 mt-6">
              <div>
                <h3 className="text-xl mb-2">1. Local Festival Highlights</h3>
                <p>
                  This category is designed for culturally tied, time-sensitive
                  promotions. During Dashain, Tihar, or peak Himalayan climbing
                  seasons, website traffic surges. By choosing this tier, your
                  travel packages are placed in dedicated festive carousels
                  heavily pushed via our global digital campaigns.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-2">
                  2. Featured Destination (Homepage Priority)
                </h3>
                <p>
                  This is out most premium, high-visibility option. Your listing
                  gets a permanent graphic placement on the absolute front page
                  of Hamroyatra. This means your advertisement is the very first
                  thing travelers see when they arrive looking for Nepal travel
                  guides or experiences.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-2">
                  3. Top Search Priority in User Queries
                </h3>
                <p>
                  This is pure intent-driven advertising. When a user actively
                  searches for specific travel keywords (for instance, "Everest
                  Base Camp Trek"), your sponsored listing is placed at the very
                  top of the search engine results page (SERP), outranking
                  standard organic listings.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-2">
                  4. Exclusive Deals and Last-Minute Discounts
                </h3>
                <p>
                  This tier is perfect for high-volume strategies. If you want
                  to push heavy discounts to fill last-minute spots, this option
                  places your brand in our widely trafficked "Deals" section,
                  catering directly to budget-conscious yet premium-seeking
                  travelers.
                </p>
              </div>
            </div>

            <h2 className="text-2xl mt-12 mb-6">
              Transparent Sponsorship Pricing Matrix
            </h2>
            <p>
              We believe in absolute transparency with our partners. Our pricing
              is structured to reflect the exact traffic volume and conversion
              rate tied to each distinct tier. Below is the comprehensive
              baseline pricing matrix for advertising on Hamroyatra:
            </p>

            <div className="not-prose overflow-x-auto my-8 border border-gray-100 rounded-lg shadow-sm">
              <table className="min-w-full text-sm text-left align-middle border-collapse">
                <thead className="bg-[#0D1F18] text-white">
                  <tr>
                    <th className="px-5 py-4 font-black uppercase text-[10px] tracking-widest whitespace-nowrap">
                      Sponsorship Tier
                    </th>
                    <th className="px-5 py-4 font-black uppercase text-[10px] tracking-widest whitespace-nowrap">
                      1 Week
                    </th>
                    <th className="px-5 py-4 font-black uppercase text-[10px] tracking-widest whitespace-nowrap">
                      2 Weeks
                    </th>
                    <th className="px-5 py-4 font-black uppercase text-[10px] tracking-widest text-primary whitespace-nowrap">
                      1 Month (Best Value)
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900">
                      Featured Destination (Homepage)
                    </td>
                    <td className="px-5 py-4 font-medium">NPR 7,000</td>
                    <td className="px-5 py-4 font-medium">NPR 13,000</td>
                    <td className="px-5 py-4 font-black text-primary">
                      NPR 22,000
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900">
                      Local Festival Highlights
                    </td>
                    <td className="px-5 py-4 font-medium">NPR 5,000</td>
                    <td className="px-5 py-4 font-medium">NPR 9,000</td>
                    <td className="px-5 py-4 font-black text-primary">
                      NPR 16,000
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900">
                      Top Search Priority
                    </td>
                    <td className="px-5 py-4 font-medium">NPR 4,000</td>
                    <td className="px-5 py-4 font-medium">NPR 7,500</td>
                    <td className="px-5 py-4 font-black text-primary">
                      NPR 12,000
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900">
                      Exclusive Deals Section
                    </td>
                    <td className="px-5 py-4 font-medium">NPR 2,500</td>
                    <td className="px-5 py-4 font-medium">NPR 4,500</td>
                    <td className="px-5 py-4 font-black text-primary">
                      NPR 8,000
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 italic mt-4 mb-10 border-l-4 border-primary pl-4 bg-gray-50 py-3 rounded-r-lg">
              <strong>* Note:</strong> An additional, single flat fee of{" "}
              <strong>NPR 1,500</strong> applies if you trigger the{" "}
              <strong>Hamroyatra Design Service</strong> for custom banner
              creation.
            </p>

            <h2 className="text-2xl mt-12 mb-6">
              How to Optimize Your Ad Banners
            </h2>
            <p>
              Visual appeal is everything in travel. Your advertisement banners
              must strictly adhere to a 16:4 panoramic focal ratio (we recommend
              an exact size of <strong>1200x300 pixels</strong>).
            </p>
            <p>
              If your team needs assistance designing professional graphics, you
              can utilize the <strong>Hamroyatra Design Service</strong> for
              just NPR 1,500. Our in-house commercial design team will craft a
              stunning, high-converting banner designed to drastically increase
              your click-through rates. Start advertising today and rapidly
              scale your tourism bookings in Nepal!
            </p>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Advertisement;
