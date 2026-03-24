import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { dashboardAPI } from "./api";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import AnalyticsSection from "./AnalyticsSection";
import CalendarSection from "./CalendarSection";
import ListingsSection from "./ListingsSection";
import BookingsSection from "./BookingsSection";
import TeamSection from "./TeamSection";
import CustomersSection from "./CustomersSection";
import ReviewsSection from "./ReviewsSection";
import HistorySection from "./HistorySection";
import MessagesSection from "./MessagesSection";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname.split("/")[2];
    return path || "overview";
  };

  const activeTab = getActiveTab();
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prefillGuest, setPrefillGuest] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, bookingsRes, listingsRes] = await Promise.all([
        dashboardAPI.getAnalytics(),
        dashboardAPI.getBookings(),
        dashboardAPI.getListings(),
      ]);
      setAnalytics(analyticsRes.data);
      setBookings(bookingsRes.data);
      setListings(listingsRes.data);
      checkUnreadMessages();
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkUnreadMessages = async () => {
    if (activeTab === "messages") return;
    try {
      const { data } = await dashboardAPI.getMessages();
      const unread = data.some((t) => (t.unreadCount || 0) > 0);
      setHasUnreadMessages(unread);
    } catch (err) {
      console.error("Error checking unread messages:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(checkUnreadMessages, 5000); // Check every 5s for live feel
    return () => clearInterval(interval);
  }, [activeTab]);

  // Custom tab change handler to support routing
  const handleTabChange = (tab, subTab = null) => {
    if (tab === "messages") {
      setHasUnreadMessages(false);
    }
    setSidebarOpen(false); // Close sidebar on change if on mobile
    if (tab === "overview") {
      navigate("/dashboard");
    } else if (tab === "history" && subTab === "notifications") {
      navigate("/dashboard/history/notifications");
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F6F3] font-display overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar with mobile support */}
      <div
        className={`
                fixed lg:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
      >
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={user}
          onClose={() => setSidebarOpen(false)}
          hasUnreadMessages={hasUnreadMessages}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          user={user}
          onLogout={onLogout}
          onTabChange={handleTabChange}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Simple Verification Popup — only for root agents, not sub-agents */}
        {!user?.verified && !user?.parentAgentId && showVerifyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowVerifyModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white max-w-[320px] w-full rounded-xl shadow-2xl relative z-10 p-7 text-center border border-gray-100"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="material-icons text-amber-500 text-lg">
                  gpp_maybe
                </span>
                <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-tight">
                  Identity Verification
                </h2>
              </div>

              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed mb-6 opacity-70">
                Submit your documents to unlock full features.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate("/become-partner")}
                  className="w-full bg-amber-600 text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-md active:scale-[0.98]"
                >
                  Verify Profile
                </button>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="w-full bg-gray-50 text-gray-400 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-[0.98]"
                >
                  Later
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto w-full px-2 py-4 lg:p-12 md:p-8">
          <Routes>
            <Route
              index
              element={
                <AnalyticsSection
                  analytics={analytics}
                  bookings={bookings}
                  listings={listings}
                  loading={loading}
                  onRefresh={fetchData}
                />
              }
            />
            <Route
              path="calander"
              element={
                <CalendarSection
                  bookings={bookings}
                  onRefresh={fetchData}
                  agentId={user?.id}
                />
              }
            />
            <Route
              path="listing"
              element={
                <ListingsSection listings={listings} onRefresh={fetchData} />
              }
            />
            <Route
              path="bookings"
              element={
                <BookingsSection
                  bookings={bookings}
                  listings={listings}
                  user={user}
                  onRefresh={fetchData}
                  prefillGuest={prefillGuest}
                  onClearPrefill={() => setPrefillGuest(null)}
                />
              }
            />
            <Route path="team" element={<TeamSection user={user} />} />
            <Route
              path="customers"
              element={
                <CustomersSection
                  user={user}
                  onAddBookingForCustomer={(customer) => {
                    setPrefillGuest(customer);
                    handleTabChange("bookings");
                  }}
                />
              }
            />
            <Route path="reviews" element={<ReviewsSection user={user} />} />
            <Route path="messages" element={<MessagesSection user={user} />} />
            <Route
              path="history"
              element={<HistorySection user={user} initialSubTab="logs" />}
            />
            <Route
              path="history/notifications"
              element={
                <HistorySection user={user} initialSubTab="notifications" />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
