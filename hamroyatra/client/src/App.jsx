// This is the root React component. It manages global auth state (logged in user),
// handles routing for all pages, shows/hides the navbar and footer based on the current route,
// and controls the preloader animation on first visit.

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import axios from "axios";

// Components
import Navbar from "./components/Navbar";
import SEO from "./components/SEO";
import Hero from "./components/Hero";
import PartnerLogos from "./components/PartnerLogos";
import TopDestinations from "./components/TopDestinations";
import TrendingExperiences from "./components/TrendingExperiences";
import ExclusiveStays from "./components/ExclusiveStays";
import HeritageGallery from "./components/HeritageGallery";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import Preloader from "./components/Preloader";
import AuthModal from "./components/AuthModal";
import ScrollToTop from "./components/ScrollToTop";
import Dashboard from "./dashboard/Dashboard";
import ExplorePage from "./explore/ExplorePage";
import ExploreDetail from "./explore/ExploreDetail";
import TravellerDashboard from "./dashboard_traveller/TravellerDashboard";
import AgentProfile from "./explore/AgentProfile";
import SuperDashboard from "./dashboard_super/SuperDashboard";
import VerificationProcess from "./pages/VerificationProcess";
import Advertisement from "./pages/Advertisement";
import VerifiedPartners from "./pages/VerifiedPartners";
import PlanPage from "./pages/PlanPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import SafetyAndTrust from "./pages/SafetyAndTrust";
import ContactUs from "./pages/ContactUs";
import AuthCallback from "./pages/AuthCallback";

function App() {
  const [loading, setLoading] = useState(() => {
    // Check if preloader has already been shown in this tab session
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("preloader_shown");
    }
    return true;
  });
  const [showScroll, setShowScroll] = useState(() => {
    if (typeof window !== "undefined") {
      return !!sessionStorage.getItem("preloader_shown");
    }
    return false;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Show modal if path matches auth routes
  const showAuthModal = [
    "/login",
    "/register",
    "/register/traveller",
    "/register/agent",
  ].includes(location.pathname);

  // Persistence: Verify token with backend on mount
  React.useEffect(() => {
    const verifySession = async () => {
      try {
        const fallbackToken = localStorage.getItem("hv_token_fallback");
        const headers = fallbackToken
          ? { Authorization: `Bearer ${fallbackToken}` }
          : {};
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/verify`,
          { withCredentials: true, headers },
        );
        if (response.data.valid) {
          setIsAuthenticated(true);
          setAuthUser(response.data.user);
        } else {
          localStorage.removeItem("hv_token_fallback");
          setIsAuthenticated(false);
        }
      } catch (err) {
        localStorage.removeItem("hv_token_fallback");
        setIsAuthenticated(false);
      }
    };
    verifySession();
  }, []);

  const handleCloseAuth = () => {
    navigate("/");
  };

  const handleAuthSuccess = (userData) => {
    setIsAuthenticated(true);
    setAuthUser(userData);
    navigate("/");
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        withCredentials: true,
      });
    } catch (e) {}
    localStorage.removeItem("hv_token_fallback");
    setIsAuthenticated(false);
    setAuthUser(null);
    navigate("/");
  };

  const isFullDashboard =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/super-dashboard");

  const hideFooter = isFullDashboard || location.pathname === "/plan";

  return (
    <div
      className={`bg-background-light dark:bg-background-dark font-display text-gray-800 antialiased selection:bg-primary selection:text-white overflow-x-hidden max-w-[100vw] ${isFullDashboard || !showScroll ? "h-screen overflow-hidden" : ""}`}
    >
      <ScrollToTop />
      <AnimatePresence>
        {loading && (
          <Preloader
            onComplete={() => {
              setLoading(false);
              setShowScroll(true);
              sessionStorage.setItem("preloader_shown", "true");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            key="auth-modal"
            onClose={handleCloseAuth}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>

      <main
        className={`transition-opacity duration-1000 ${loading ? "opacity-0" : "opacity-100"}`}
      >
        {!isFullDashboard && (
          <Navbar
            onShowAuth={() => navigate("/login")}
            isAuthenticated={isAuthenticated}
            user={authUser}
            onLogout={handleLogout}
          />
        )}

        <Routes>
          {[
            "/",
            "/login",
            "/register",
            "/register/traveller",
            "/register/agent",
          ].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <>
                  <SEO
                    title="Find Verified Travel Agencies & Hotels in Nepal"
                    description="Discover Nepal's finest verified trekking agencies, travel companies and hotels. Compare, review and book your perfect Nepal adventure on HamroYatra."
                    keywords="verified travel agency Nepal, trekking agencies Nepal, Nepal tour operator, Nepal hotel booking, Nepal trekking company, Nepal travel packages"
                    canonical="/"
                    schema={{
                      "@context": "https://schema.org",
                      "@type": "TravelAgency",
                      name: "HamroYatra",
                      url: "https://hamroyatra.ujjwalrupakheti.com.np",
                      description:
                        "Nepal's verified travel platform connecting travellers with certified trekking agencies, travel companies and hotels.",
                      address: {
                        "@type": "PostalAddress",
                        addressCountry: "NP",
                        addressLocality: "Kathmandu",
                      },
                      areaServed: "Nepal",
                    }}
                  />
                  <Hero />
                  <PartnerLogos />
                  <TopDestinations />
                  <TrendingExperiences isAuthenticated={isAuthenticated} />
                  <ExclusiveStays />
                  <HeritageGallery />
                  <Testimonials />
                </>
              }
            />
          ))}

          <Route path="/explore" element={<ExplorePage />} />
          {/* Clean SEO URLs for explore filters */}
          <Route
            path="/trekking-packages"
            element={<ExplorePage defaultFilter="trekking" />}
          />
          <Route
            path="/hotel-stays"
            element={<ExplorePage defaultFilter="hotel" />}
          />
          <Route
            path="/travel-packages"
            element={<ExplorePage defaultFilter="travel" />}
          />
          <Route
            path="/explore/:id"
            element={
              <ExploreDetail
                isAuthenticated={isAuthenticated}
                user={authUser}
              />
            }
          />
          <Route
            path="/agent/:id"
            element={
              <AgentProfile isAuthenticated={isAuthenticated} user={authUser} />
            }
          />
          <Route
            path="/verification"
            element={
              <VerificationProcess
                isAuthenticated={isAuthenticated}
                user={authUser}
              />
            }
          />
          <Route
            path="/become-partner"
            element={<Navigate to="/verification" replace />}
          />
          <Route
            path="/advertisement"
            element={
              <Advertisement
                isAuthenticated={isAuthenticated}
                user={authUser}
              />
            }
          />
          <Route path="/partners" element={<VerifiedPartners />} />
          {/* Clean SEO URLs for partner filters */}
          <Route
            path="/hotels-nepal"
            element={<VerifiedPartners defaultFilter="hotel" />}
          />
          <Route
            path="/trekking-agencies-nepal"
            element={<VerifiedPartners defaultFilter="trekking" />}
          />
          <Route
            path="/travel-agencies-nepal"
            element={<VerifiedPartners defaultFilter="travel" />}
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route path="/safety-and-trust" element={<SafetyAndTrust />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route
            path="/auth/callback"
            element={<AuthCallback onAuthSuccess={handleAuthSuccess} />}
          />
          <Route
            path="/plan"
            element={
              isAuthenticated === null ? (
                <div className="h-screen flex items-center justify-center bg-[#F7F6F3]">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : isAuthenticated ? (
                <PlanPage user={authUser} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/super-dashboard"
            element={
              authUser?.role === "superadmin" ? (
                <SuperDashboard user={authUser} onLogout={handleLogout} />
              ) : (
                <div className="h-screen flex items-center justify-center">
                  Unauthorized Access Restricted
                </div>
              )
            }
          />

          {/* Dashboard Route with wildcard for nested paths */}
          <Route
            path="/dashboard/*"
            element={
              !isAuthenticated ? (
                <div className="h-screen flex items-center justify-center bg-[#F7F6F3]">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : authUser?.role === "superadmin" ? (
                <SuperDashboard user={authUser} onLogout={handleLogout} />
              ) : authUser?.role === "agent" ? (
                <Dashboard user={authUser} onLogout={handleLogout} />
              ) : (
                <TravellerDashboard user={authUser} onLogout={handleLogout} />
              )
            }
          />
        </Routes>

        {!hideFooter && <Footer />}
      </main>
    </div>
  );
}

export default App;
