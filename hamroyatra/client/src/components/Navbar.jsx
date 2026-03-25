import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HamroLogo from "../assets/HamroLogo.png";

const Navbar = ({ onShowAuth, isAuthenticated, user, onLogout }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Lock body scroll when logout popup is open
  useEffect(() => {
    document.body.style.overflow = showLogoutConfirm ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showLogoutConfirm]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = {
    explore: {
      label: "Explore",
      path: "/explore",
      items: [
        {
          title: "Trekking Packages",
          icon: "landscape",
          desc: "Conquer the Himalayas",
          path: "/explore?filter=trekking",
        },
        {
          title: "Travel Packages",
          icon: "explore",
          desc: "Curated adventures",
          path: "/explore?filter=travel",
        },
        {
          title: "Hotels",
          icon: "hotel",
          desc: "Luxury & Boutique stays",
          path: "/explore?filter=hotel",
        },
      ],
    },
    partners: {
      label: "Verified Partners",
      path: "/partners",
      items: [
        {
          title: "Trekking Agencies",
          icon: "hiking",
          desc: "Expert mountain guides",
          path: "/partners?filter=trekking",
        },
        {
          title: "Travel Agencies",
          icon: "business",
          desc: "Expert local guides",
          path: "/partners?filter=travel",
        },
        {
          title: "Verified Hotels",
          icon: "verified_user",
          desc: "Quality assured stays",
          path: "/partners?filter=hotel",
        },
        {
          title: "Verification Process",
          icon: "fact_check",
          desc: "Join our elite network",
          path: "/verification",
        },
      ],
    },
    about: {
      label: "About",
      items: [
        {
          title: "Advertisement Process",
          icon: "campaign",
          desc: "Sponsor your listings",
          path: "/advertisement",
        },
        {
          title: "Safety & Trust",
          icon: "gpp_good",
          desc: "Your security first",
        },
        { title: "Contact Us", icon: "mail", desc: "Get in touch" },
      ],
    },
  };

  const handleProtectedAction = (e) => {
    if (!isAuthenticated) {
      if (e) e.preventDefault();
      onShowAuth();
    } else {
      navigate("/plan");
    }
  };

  const toggleMobileSection = (key) => {
    setExpandedMobileSection(expandedMobileSection === key ? null : key);
  };

  return (
    <>
      {/* Logout Confirmation Popup */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[360px] bg-white rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              {/* Icon + Title */}
              <div className="flex flex-col items-center pt-8 pb-4 px-8">
                <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                  <span className="material-icons text-red-400 text-2xl">
                    logout
                  </span>
                </div>
                <h3 className="text-gray-900 font-black text-base tracking-tight">
                  Sign Out?
                </h3>
                <p className="text-gray-400 text-[11px] font-medium text-center mt-2 leading-relaxed">
                  You will be logged out of your Hamroyatra account.
                </p>
              </div>
              {/* Divider */}
              <div className="h-px bg-gray-100 mx-6" />
              {/* Buttons */}
              <div className="flex gap-3 p-5">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="flex-1 h-11 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1D7447] transition-all active:scale-[0.98] shadow-md shadow-primary/20"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed w-full z-[110] px-4 transition-all duration-500 flex justify-center pointer-events-none ${scrolled ? "py-4" : "py-8"}`}
      >
        <nav
          className={`
                    pointer-events-auto
                    flex items-center justify-between
                    gap-4 md:gap-8
                    px-4 md:px-8 py-1 md:py-1.5
                    rounded-full
                    bg-[#1A2B23]/40 backdrop-blur-xl
                    border border-white/10
                    shadow-[0_15px_35px_rgba(0,0,0,0.15)]
                    transition-all duration-500
                    w-full max-w-[1100px]
                `}
        >
          {/* Logo Section */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 md:gap-2 shrink-0 group cursor-pointer"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center overflow-hidden -ml-1">
              <img
                src={HamroLogo}
                alt="Hamroyatra Logo"
                className="w-full h-full object-contain scale-[1.8] md:scale-[2.2] transition-colors"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] md:text-sm font-serif font-black text-white tracking-[0.05em] uppercase leading-none drop-shadow-sm">
                Hamroyatra
              </span>
              <span className="text-[5px] md:text-[6px] text-white/80 font-bold tracking-[0.2em] uppercase mt-0.5">
                Nepal Elite Collection
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 text-white">
            {Object.entries(navigation).map(([key, section]) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => setActiveDropdown(key)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => (section.path ? navigate(section.path) : null)}
                  className={`
                                    flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300
                                    text-[10px] font-bold tracking-[0.15em] uppercase whitespace-nowrap
                                    ${activeDropdown === key ? "text-primary bg-white" : "text-white hover:text-white/80"}
                                `}
                >
                  {section.label}
                  <span
                    className={`material-icons text-[14px] transition-transform duration-300 ${activeDropdown === key ? "rotate-180" : ""}`}
                  >
                    expand_more
                  </span>
                </button>

                {/* Desktop Dropdown */}
                <div
                  className={`
                                    absolute top-full left-1/2 -translate-x-1/2 pt-5 transition-all duration-500 ease-out
                                    ${activeDropdown === key ? "opacity-100 translate-y-0 pointer-events-auto scale-100" : "opacity-0 translate-y-3 pointer-events-none scale-[0.98]"}
                                `}
                >
                  <div className="bg-white/95 border border-white/20 rounded-2xl p-1 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]">
                    <div className="flex flex-row items-center gap-0.5">
                      {section.items.map((item, idx) => (
                        <a
                          key={idx}
                          href={item.path || "#"}
                          onClick={(e) => {
                            if (item.path) {
                              e.preventDefault();
                              navigate(item.path);
                              setActiveDropdown(null);
                            }
                          }}
                          className="group/item flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 min-w-max"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center group-hover/item:bg-primary group-hover/item:border-primary transition-all duration-300 shrink-0">
                            <span className="material-icons text-gray-400 group-hover/item:text-white text-base transition-colors">
                              {item.icon}
                            </span>
                          </div>
                          <div className="flex flex-col text-left pr-2">
                            <span className="text-[10px] font-bold text-gray-800 tracking-wider uppercase leading-none mb-0.5 group-hover/item:text-primary transition-colors">
                              {item.title}
                            </span>
                            <span className="text-[8px] text-gray-400 font-medium leading-none whitespace-nowrap">
                              {item.desc}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 rounded-sm z-[-1] shadow-sm"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-5 shrink-0">
            {isAuthenticated ? (
              <div
                className="relative hidden sm:block"
                onMouseEnter={() => setActiveDropdown("account")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`
                                    flex items-center gap-2 transition-all group/login
                                    ${activeDropdown === "account" ? "text-white" : "text-white hover:text-white/80"}
                                `}
                >
                  <div
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center transition-all duration-300
                                        ${activeDropdown === "account" ? "border-white bg-white/10" : "border-white/20 group-hover/login:border-white group-hover/login:bg-white/10"}
                                    `}
                  >
                    <span className="material-icons text-base md:text-lg transition-transform duration-300 group-hover/login:scale-110">
                      person
                    </span>
                  </div>
                  <span className="text-[9px] md:text-[10px] font-bold tracking-[0.15em] uppercase">
                    Account
                  </span>
                  <span
                    className={`material-icons text-[14px] transition-transform duration-300 ${activeDropdown === "account" ? "rotate-180" : ""}`}
                  >
                    expand_more
                  </span>
                </button>

                {/* Account Dropdown */}
                <div
                  className={`
                                    absolute top-full right-0 pt-5 transition-all duration-500 ease-out
                                    ${activeDropdown === "account" ? "opacity-100 translate-y-0 pointer-events-auto scale-100" : "opacity-0 translate-y-3 pointer-events-none scale-[0.98]"}
                                `}
                >
                  <div className="bg-white/95 border border-white/20 rounded-2xl p-1 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] translate-x-40">
                    <div className="flex flex-row items-center gap-0.5">
                      {[
                        {
                          title:
                            user?.role === "superadmin"
                              ? "Super Terminal"
                              : "Dashboard",
                          icon:
                            user?.role === "superadmin"
                              ? "admin_panel_settings"
                              : "dashboard",
                          desc:
                            user?.role === "superadmin"
                              ? "Master Administration"
                              : "Your travel overview",
                          path:
                            user?.role === "superadmin"
                              ? "/super-dashboard"
                              : "/dashboard",
                        },
                        {
                          title: "Profile",
                          icon: "manage_accounts",
                          desc: "Manage your details",
                          path:
                            user?.role === "agent"
                              ? `/agent/${user.id}`
                              : user?.role === "superadmin"
                                ? "/super-dashboard"
                                : "/dashboard",
                        },
                        {
                          title: "Logout",
                          icon: "logout",
                          desc: "Sign out securely",
                          isLogout: true,
                        },
                      ].map((item, idx) => (
                        <a
                          key={idx}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (item.path) {
                              navigate(item.path);
                              setActiveDropdown(null);
                            } else if (item.isLogout) {
                              setActiveDropdown(null);
                              setShowLogoutConfirm(true);
                            }
                          }}
                          className="group/item flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 min-w-max"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center group-hover/item:bg-primary group-hover/item:border-primary transition-all duration-300 shrink-0">
                            <span className="material-icons text-gray-400 group-hover/item:text-white text-base transition-colors">
                              {item.icon}
                            </span>
                          </div>
                          <div className="flex flex-col text-left pr-2">
                            <span className="text-[10px] font-bold text-gray-800 tracking-wider uppercase leading-none mb-0.5 group-hover/item:text-primary transition-colors">
                              {item.title}
                            </span>
                            <span className="text-[8px] text-gray-400 font-medium leading-none whitespace-nowrap">
                              {item.desc}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-[12px] right-6 w-4 h-4 bg-white rotate-45 rounded-sm z-[-1] shadow-sm"></div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleProtectedAction}
                className="hidden sm:flex items-center gap-2 text-white hover:text-white/80 transition-all group/login"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/20 flex items-center justify-center group-hover/login:border-white group-hover/login:bg-white/10 transition-all duration-300">
                  <span className="material-icons text-base md:text-lg transition-transform duration-300 group-hover/login:scale-110">
                    person_outline
                  </span>
                </div>
                <span className="text-[9px] md:text-[10px] font-bold tracking-[0.15em] uppercase">
                  Login
                </span>
              </button>
            )}

            <button
              onClick={handleProtectedAction}
              className="
                                relative group overflow-hidden
                                bg-primary text-white
                                px-4 md:px-7 py-2 md:py-2.5 rounded-full
                                transition-all duration-300
                                shadow-lg hover:shadow-primary/25
                                border border-primary/20
                            "
            >
              <span className="relative z-10 text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-1.5 md:gap-2">
                <span className="hidden xs:inline">Plan My Trip</span>
                <span className="xs:hidden">Plan</span>
                <span className="material-icons text-xs md:text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </span>
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-1000 group-hover:left-[100%] pointer-events-none"></div>
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all"
            >
              <span className="material-icons text-xl md:text-2xl">menu</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[320px] bg-white z-[200] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                  <img
                    src={HamroLogo}
                    alt="Hamroyatra Logo"
                    className="w-full h-full object-contain scale-[1.4]"
                  />
                </div>
                <span className="text-xs font-serif font-black text-gray-900 tracking-[0.1em] uppercase">
                  Hamroyatra
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {Object.entries(navigation).map(([key, section]) => (
                <div key={key} className="mb-2">
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        section.path
                          ? (navigate(section.path), setMobileMenuOpen(false))
                          : toggleMobileSection(key)
                      }
                      className="flex-1 flex items-center justify-between px-4 py-4 rounded-2xl hover:bg-gray-50 transition-all text-[11px] font-black tracking-widest uppercase text-gray-400 text-left"
                    >
                      {section.label}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMobileSection(key);
                      }}
                      className="px-4 py-4 text-gray-400"
                    >
                      <span
                        className={`material-icons transition-transform ${expandedMobileSection === key ? "rotate-180" : ""}`}
                      >
                        expand_more
                      </span>
                    </button>
                  </div>
                  <AnimatePresence>
                    {expandedMobileSection === key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {section.items.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              if (item.path) navigate(item.path);
                              else navigate("/explore"); // Fallback for specific items that should lead to explore
                              setMobileMenuOpen(false);
                            }}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                          >
                            <span className="material-icons text-gray-400">
                              {item.icon}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-gray-800">
                                {item.title}
                              </span>
                              <span className="text-[8px] text-gray-400">
                                {item.desc}
                              </span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-50">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                  >
                    My Dashboard
                  </button>
                  <button
                    onClick={() => {
                      const path =
                        user?.role === "agent"
                          ? `/agent/${user.id}`
                          : "/dashboard";
                      navigate(path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-4 rounded-2xl border border-gray-100 text-[#1A2B23] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowLogoutConfirm(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-4 rounded-2xl border border-red-100 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleProtectedAction();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-4 rounded-2xl bg-[#1A2B23] text-white font-black text-[10px] uppercase tracking-widest shadow-lg"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
