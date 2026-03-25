import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { dashboardAPI } from "../dashboard/api";
import SEO from "../components/SEO";

const TABS = ["Listings", "Reviews", "About", "Guides"];

// ── Listing Card ─────────────────────────────────────────────────────────────
const ProfileListingCard = ({ listing: l, agentName, index }) => {
  const [wished, setWished] = useState(false);
  const imgSrc = l.images?.[0]
    ? l.images[0].startsWith("http")
      ? l.images[0]
      : `${import.meta.env.VITE_API_URL}${l.images[0]}`
    : "https://images.unsplash.com/photo-1544735749-2e78311e09f1?q=80&w=1470&auto=format&fit=crop";
  const stayLabel = l.type === "hotel" ? "Hotel Stay" : `${l.duration} Days`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100/60 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full"
    >
      <Link
        to={`/explore/${l.id}`}
        className="block relative h-[200px] overflow-hidden m-3 rounded-xl bg-gray-50"
      >
        <img
          src={imgSrc}
          alt={l.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWished((w) => !w);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-90 ${wished ? "bg-primary text-white" : "bg-white/80 border border-white/40 text-primary hover:bg-white"}`}
        >
          <span className="material-icons text-[18px]">
            {wished ? "favorite" : "favorite_border"}
          </span>
        </button>
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-[#1A2B23]/80 backdrop-blur-md text-white text-[9px] font-black tracking-wider uppercase">
          {stayLabel}
        </div>
      </Link>

      <div className="px-5 pb-6 pt-3 flex flex-col gap-3 flex-grow">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">
              {agentName}
            </span>
            <span className="material-icons text-primary text-[12px]">
              verified
            </span>
          </div>
          <h3 className="text-[15px] font-bold text-primary leading-snug">
            {l.title}
          </h3>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex items-center gap-1">
              <span className="material-icons text-accent text-[11px]">
                star
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                {parseFloat(l.averageRating || 0).toFixed(1)} (
                {l.reviewCount || 0})
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <span className="material-icons text-[10px]">location_on</span>
              <span className="text-[9px] uppercase font-bold tracking-wider">
                {l.location || "Nepal"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 gap-3">
          <div className="flex flex-col">
            <span className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">
              Budget
            </span>
            <span className="text-[15px] font-black text-primary leading-tight">
              NPR {parseFloat(l.price || 0).toLocaleString()}
            </span>
          </div>
          <Link
            to={`/explore/${l.id}`}
            className="relative overflow-hidden group/btn flex items-center gap-1.5 px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest bg-[#1A2B23] text-white hover:bg-primary shadow-md transition-all active:scale-95 shrink-0"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              Discover
              <span className="material-icons text-[12px] group-hover/btn:translate-x-0.5 transition-transform">
                east
              </span>
            </span>
            <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] transition-all duration-700 group-hover/btn:left-[150%]" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AgentProfile = ({ isAuthenticated, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [activeTab, setActiveTab] = useState("Listings");
  const [showContact, setShowContact] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [msgForm, setMsgForm] = useState({ name: "", email: "", message: "" });
  const [msgStatus, setMsgStatus] = useState({ type: "", msg: "" });
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sub-agents visiting the parent's profile page should also see it as "own profile"
  const isOwnProfile =
    isAuthenticated &&
    user &&
    (String(user.id) === String(id) ||
      String(user.parentAgentId) === String(id));

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/agent/${id}`,
      );
      setAgent(res.data);
      setFollowerCount(res.data.followers?.length || 0);
      if (isAuthenticated && user) {
        const fRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/agent/${id}/is-following/${user.id}`,
        );
        setIsFollowing(fRes.data.following);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
    window.scrollTo(0, 0);
  }, [id, isAuthenticated, user]);

  const handleFollow = async () => {
    if (!isAuthenticated) return navigate("/login");
    try {
      setFollowLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/agent/${id}/follow`,
        { travellerId: user.id },
      );
      setIsFollowing(res.data.following);
      setFollowerCount((c) => (res.data.following ? c + 1 : c - 1));
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/dashboard/public/message`,
        {
          customerName: isAuthenticated
            ? user.fullName || user.username
            : msgForm.name,
          customerEmail: isAuthenticated ? user.email : msgForm.email,
          message: msgForm.message,
          companyName: agent.companyName,
          subject: `General Inquiry for ${agent.companyName}`,
          travellerId: isAuthenticated ? user.id : null,
        },
        { withCredentials: true },
      );
      setMsgStatus({ type: "success", msg: "Message sent!" });
      setTimeout(() => {
        setShowContact(false);
        setMsgStatus({ type: "", msg: "" });
        setMsgForm({ name: "", email: "", message: "" });
      }, 2000);
    } catch (err) {
      setMsgStatus({ type: "error", msg: "Failed to send." });
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await dashboardAPI.uploadImage(fd);
      await dashboardAPI.updateProfile({ [field]: data.url });
      setAgent((prev) => ({ ...prev, [field]: data.url }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const openProfileEdit = () => {
    setProfileForm({
      companyName: agent.companyName || "",
      bio: agent.bio || "",
      phoneNo: agent.phoneNo || "",
      location: agent.location || "",
      website: agent.website || "",
    });
    setShowProfileEdit(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dashboardAPI.updateProfile(profileForm);
      setAgent((prev) => ({ ...prev, ...profileForm }));
      setShowProfileEdit(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F6F3]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );

  if (!agent)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F6F3]">
        <span className="material-icons text-gray-300 text-6xl mb-6">
          explore_off
        </span>
        <h2 className="text-2xl font-black text-[#0D1F18]">
          Profile Not Found
        </h2>
        <Link
          to="/explore"
          className="mt-8 px-6 py-3 bg-[#0D1F18] text-white rounded-xl text-sm font-bold hover:bg-primary transition-all"
        >
          Back to Explore
        </Link>
      </div>
    );

  const coverImg = agent.coverImage
    ? agent.coverImage.startsWith("http")
      ? agent.coverImage
      : `${import.meta.env.VITE_API_URL}${agent.coverImage}`
    : "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1471&q=80";

  const profileImg = agent.profileImage
    ? agent.profileImage.startsWith("http")
      ? agent.profileImage
      : `${import.meta.env.VITE_API_URL}${agent.profileImage}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.companyName || agent.fullName || "A")}&background=1D7447&color=fff&size=512`;

  const services = agent.serviceTypes || [];
  const certifications = agent.verified ? ["Nepal Tourism Board Verified"] : [];

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-display">
      <SEO
        title={`${agent.companyName || agent.fullName} | Verified Nepal Travel Partner`}
        description={
          agent.bio
            ? agent.bio.slice(0, 155)
            : `${agent.companyName || agent.fullName} is a verified travel partner on HamroYatra. Browse their listings, read reviews and get in touch.`
        }
        keywords={`${agent.companyName || agent.fullName} Nepal, ${(agent.serviceTypes || []).join(" agency Nepal, ")} agency Nepal, verified travel partner Nepal`}
        canonical={`/agent/${agent.id}`}
        ogImage={profileImg || undefined}
        ogType="profile"
        schema={{
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          name: agent.companyName || agent.fullName,
          url: `https://hamroyatra.ujjwalrupakheti.com.np/agent/${agent.id}`,
          description: agent.bio || `Verified travel partner on HamroYatra`,
          image: profileImg,
          address: {
            "@type": "PostalAddress",
            addressCountry: "NP",
            addressLocality: agent.location || "Nepal",
          },
          telephone: agent.phoneNo,
          aggregateRating:
            agent.listings?.length > 0
              ? {
                  "@type": "AggregateRating",
                  ratingValue: "4.5",
                  reviewCount: agent.listings.reduce(
                    (a, l) => a + (l.reviewCount || 0),
                    0,
                  ),
                }
              : undefined,
        }}
      />
      {/* COVER */}
      <div className="relative h-[320px] md:h-[420px] overflow-hidden">
        <img
          src={coverImg}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#F7F6F3]" />
        {isOwnProfile && (
          <label className="absolute top-6 right-6 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full cursor-pointer hover:bg-white/90 transition-all border border-white/50 text-[#0D1F18] shadow-sm flex items-center gap-2">
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e, "coverImage")}
            />
            <span className="material-icons text-[14px]">photo_camera</span>
            <span className="text-[11px] font-bold hidden sm:block">
              Update Cover
            </span>
          </label>
        )}
      </div>

      {/* PROFILE HEADER */}
      <div className="max-w-[1100px] mx-auto px-5 md:px-10 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          {/* Left: Avatar + Info */}
          <div className="flex items-end gap-5">
            <div className="relative shrink-0">
              {uploading && (
                <div className="absolute inset-0 z-10 bg-black/50 rounded-[28px] flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-[28px] overflow-hidden border-4 border-white shadow-xl bg-white">
                <img
                  src={profileImg}
                  alt={agent.companyName}
                  className="w-full h-full object-cover"
                />
              </div>
              {isOwnProfile && (
                <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-all text-gray-500">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "profileImage")}
                  />
                  <span className="material-icons text-[14px]">camera_alt</span>
                </label>
              )}
            </div>

            <div className="pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-[#0D1F18] tracking-tight">
                  {agent.companyName || agent.fullName}
                </h1>
                {agent.verified && (
                  <span className="material-icons text-[22px] text-primary">
                    verified
                  </span>
                )}
              </div>
              <p className="text-[12px] text-gray-500 font-medium mt-0.5">
                Premium Tourism Experience Provider
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="material-icons text-[13px] text-gray-400">
                  location_on
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {agent.location || "Nepal"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 pb-2">
            {isOwnProfile ? (
              <button
                onClick={openProfileEdit}
                className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#0D1F18] text-white hover:bg-primary transition-all flex items-center gap-2"
              >
                <span className="material-icons text-[14px]">edit</span>
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isFollowing ? "bg-primary/10 text-primary border-primary/20" : "bg-[#0D1F18] text-white border-transparent hover:bg-primary"}`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  onClick={() => setShowContact(true)}
                  className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary transition-all"
                >
                  Message
                </button>
              </>
            )}
            <button className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all">
              <span className="material-icons text-[18px]">share</span>
            </button>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="flex items-center gap-6 md:gap-10 mt-6 pb-6 border-b border-gray-200 overflow-x-auto">
          {[
            { label: "Followers", value: followerCount.toLocaleString() },
            { label: "Listings", value: agent.listings?.length || 0 },
            { label: "Guides", value: agent.guides?.length || 0 },
          ].map((s) => (
            <div key={s.label} className="shrink-0">
              <p className="text-[22px] font-black text-[#0D1F18] leading-none">
                {s.value}
              </p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {s.label}
              </p>
            </div>
          ))}
          {agent.verified && (
            <div className="ml-auto shrink-0 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2.5">
              <span className="material-icons text-primary text-[18px]">
                verified
              </span>
              <p className="text-[11px] font-black text-primary uppercase tracking-widest">
                Verified Partner
              </p>
            </div>
          )}
        </div>

        {/* SERVICE TAGS */}
        {(services.length > 0 || certifications.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap py-4 border-b border-gray-200">
            {services.map((s) => (
              <span
                key={s}
                className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-white border border-gray-200 text-gray-500 rounded-full capitalize"
              >
                {s}
              </span>
            ))}
            {certifications.map((c) => (
              <span
                key={c}
                className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center gap-1"
              >
                <span className="material-icons text-[10px]">verified</span>
                {c}
              </span>
            ))}
          </div>
        )}

        {/* TABS */}
        <div className="flex items-center gap-1 mt-6 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? "bg-[#0D1F18] text-white shadow-md" : "bg-white text-gray-400 border border-gray-200 hover:border-gray-300"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="py-8">
          {/* LISTINGS */}
          {activeTab === "Listings" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(agent.listings || []).length === 0 ? (
                <div className="col-span-4 py-20 text-center text-gray-400">
                  <span className="material-icons text-5xl mb-3 block">
                    explore_off
                  </span>
                  <p className="text-[13px] font-medium">No listings yet</p>
                </div>
              ) : (
                (agent.listings || []).map((l, i) => (
                  <ProfileListingCard
                    key={l.id}
                    listing={l}
                    agentName={agent.companyName || agent.fullName}
                    index={i}
                  />
                ))
              )}
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === "Reviews" && (
            <div className="max-w-2xl">
              <div className="py-20 text-center text-gray-400">
                <span className="material-icons text-5xl mb-3 block">
                  rate_review
                </span>
                <p className="text-[13px] font-medium">Reviews coming soon</p>
              </div>
            </div>
          )}

          {/* ABOUT */}
          {activeTab === "About" && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-white rounded-[24px] p-6 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  About
                </p>
                <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                  {agent.bio || "No bio provided yet."}
                </p>
              </div>
              <div className="bg-white rounded-[24px] p-6 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Contact Info
                </p>
                <div className="space-y-3">
                  {[
                    {
                      icon: "location_on",
                      label: "Address",
                      value: agent.location,
                    },
                    {
                      icon: "language",
                      label: "Website",
                      value: agent.website,
                    },
                    { icon: "phone", label: "Phone", value: agent.phoneNo },
                    { icon: "mail", label: "Email", value: agent.email },
                  ]
                    .filter((i) => i.value)
                    .map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-icons text-primary text-[14px]">
                            {item.icon}
                          </span>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            {item.label}
                          </p>
                          <p className="text-[12px] font-medium text-[#0D1F18]">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* GUIDES */}
          {activeTab === "Guides" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(agent.guides || []).length === 0 ? (
                <div className="col-span-4 py-20 text-center text-gray-400">
                  <span className="material-icons text-5xl mb-3 block">
                    badge
                  </span>
                  <p className="text-[13px] font-medium">
                    No guides registered
                  </p>
                </div>
              ) : (
                (agent.guides || []).map((guide, i) => {
                  const isExpired = guide.certificateExpiry
                    ? new Date(guide.certificateExpiry) < new Date()
                    : false;
                  const daysLeft = guide.certificateExpiry
                    ? Math.ceil(
                        (new Date(guide.certificateExpiry) - new Date()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : null;
                  const soonExpiring =
                    daysLeft !== null && daysLeft > 0 && daysLeft <= 60;
                  const guideImg = guide.profileImage
                    ? guide.profileImage.startsWith("http")
                      ? guide.profileImage
                      : `${import.meta.env.VITE_API_URL}${guide.profileImage}`
                    : null;
                  const initials = (guide.fullName || "G")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <motion.div
                      key={guide.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-white rounded-[24px] overflow-hidden border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all flex flex-col"
                    >
                      {/* Color band + avatar */}
                      <div className="h-16 bg-gradient-to-br from-emerald-800 to-[#1D7447] relative">
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
                          <div className="w-14 h-14 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-emerald-800 to-[#1D7447] relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white font-black text-sm">
                                {initials}
                              </span>
                            </div>
                            {guideImg && (
                              <img
                                src={guideImg}
                                alt={guide.fullName}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-10 px-4 pb-4 flex flex-col gap-3 flex-1">
                        <div className="text-center">
                          <p className="text-[13px] font-black text-[#0D1F18] tracking-tight">
                            {guide.fullName}
                          </p>
                          <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-0.5">
                            Tour Guide
                          </p>
                          {guide.experienceYears && (
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                              {guide.experienceYears} yrs experience
                            </p>
                          )}
                        </div>

                        {/* Certificate status */}
                        {guide.certificateExpiry && (
                          <div
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-bold ${isExpired ? "bg-red-50 text-red-500" : soonExpiring ? "bg-amber-50 text-amber-600" : "bg-primary/10 text-primary"}`}
                          >
                            <span className="material-icons text-[13px]">
                              {isExpired ? "cancel" : "verified"}
                            </span>
                            <span className="flex-1 truncate">
                              {isExpired
                                ? "Expired"
                                : soonExpiring
                                  ? `Expires in ${daysLeft}d`
                                  : "Valid"}
                            </span>
                            <span className="text-[8px] opacity-70">
                              {new Date(
                                guide.certificateExpiry,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {guide.certificateImage && (
                          <button
                            onClick={() => setSelectedGuide(guide)}
                            className="w-full h-8 rounded-xl border border-gray-200 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5"
                          >
                            <span className="material-icons text-[13px]">
                              badge
                            </span>
                            View Certificate
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* CERTIFICATE MODAL */}
      <AnimatePresence>
        {selectedGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setSelectedGuide(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[520px]"
            >
              <button
                onClick={() => setSelectedGuide(null)}
                className="absolute -top-4 -right-4 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all"
              >
                <span className="material-icons text-[18px] text-gray-700">
                  close
                </span>
              </button>
              <img
                src={
                  selectedGuide.certificateImage?.startsWith("http")
                    ? selectedGuide.certificateImage
                    : `${import.meta.env.VITE_API_URL}${selectedGuide.certificateImage}`
                }
                alt="Guide Certificate"
                className="w-full rounded-[20px] shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTACT MODAL */}
      <AnimatePresence>
        {showContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setShowContact(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] bg-white rounded-[28px] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-black text-[#0D1F18]">
                    Send a Message
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {agent.companyName}
                  </p>
                </div>
                <button
                  onClick={() => setShowContact(false)}
                  className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  <span className="material-icons text-[16px]">close</span>
                </button>
              </div>
              <form onSubmit={handleMessage} className="p-6 space-y-3">
                {!isAuthenticated && (
                  <>
                    <input
                      type="text"
                      placeholder="Your name"
                      required
                      value={msgForm.name}
                      onChange={(e) =>
                        setMsgForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full h-11 bg-[#F7F6F3] rounded-xl px-4 text-[12px] font-medium text-[#0D1F18] outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      required
                      value={msgForm.email}
                      onChange={(e) =>
                        setMsgForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="w-full h-11 bg-[#F7F6F3] rounded-xl px-4 text-[12px] font-medium text-[#0D1F18] outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </>
                )}
                <textarea
                  rows={4}
                  placeholder="Your message..."
                  required
                  value={msgForm.message}
                  onChange={(e) =>
                    setMsgForm((f) => ({ ...f, message: e.target.value }))
                  }
                  className="w-full bg-[#F7F6F3] rounded-xl px-4 py-3 text-[12px] font-medium text-[#0D1F18] outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                {msgStatus.msg && (
                  <p
                    className={`text-[11px] font-bold ${msgStatus.type === "success" ? "text-primary" : "text-red-500"}`}
                  >
                    {msgStatus.msg}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full h-11 bg-[#0D1F18] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors"
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROFILE EDIT MODAL */}
      <AnimatePresence>
        {showProfileEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-start justify-center px-4 pt-20 overflow-y-auto"
            onClick={() => setShowProfileEdit(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] bg-white rounded-[28px] overflow-hidden shadow-2xl mb-8"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <p className="text-[14px] font-black text-[#0D1F18]">
                  Edit Profile
                </p>
                <button
                  onClick={() => setShowProfileEdit(false)}
                  className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  <span className="material-icons text-[16px]">close</span>
                </button>
              </div>
              <form onSubmit={handleSaveProfile} className="p-6 space-y-3">
                {[
                  {
                    key: "companyName",
                    label: "Company Name",
                    placeholder: "Company name",
                  },
                  {
                    key: "bio",
                    label: "Bio",
                    placeholder: "About your company...",
                  },
                  {
                    key: "location",
                    label: "Location",
                    placeholder: "City, Country",
                  },
                  {
                    key: "website",
                    label: "Website",
                    placeholder: "www.example.com",
                  },
                  { key: "phoneNo", label: "Phone", placeholder: "+977 ..." },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                      {label}
                    </label>
                    {key === "bio" ? (
                      <textarea
                        rows={3}
                        placeholder={placeholder}
                        value={profileForm[key] || ""}
                        onChange={(e) =>
                          setProfileForm((f) => ({
                            ...f,
                            [key]: e.target.value,
                          }))
                        }
                        className="w-full bg-[#F7F6F3] rounded-xl px-4 py-3 text-[12px] font-medium text-[#0D1F18] outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={profileForm[key] || ""}
                        onChange={(e) =>
                          setProfileForm((f) => ({
                            ...f,
                            [key]: e.target.value,
                          }))
                        }
                        className="w-full h-11 bg-[#F7F6F3] rounded-xl px-4 text-[12px] font-medium text-[#0D1F18] outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-11 bg-[#0D1F18] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentProfile;
