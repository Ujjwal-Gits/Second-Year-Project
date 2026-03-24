import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import TravellerSidebar from "./TravellerSidebar";
import TravellerHeader from "./TravellerHeader";
import TravellerAnalytics from "./TravellerAnalytics";
import TravellerCalendar from "./TravellerCalendar";
import TravellerBookings from "./TravellerBookings";
import TravellerMessages from "./TravellerMessages";
import TravellerReviews from "./TravellerReviews";
import TravellerHistory from "./TravellerHistory";
import axios from "axios";

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

const BASE_URL = "http://localhost:5000/api";

const TravellerDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Global Modal States (Lifting to cover everything including Header/Sidebar)
  const [activeTrip, setActiveTrip] = useState(null);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budget, setBudget] = useState(250000);
  const [tempBudget, setTempBudget] = useState(budget);

  const updateChecklist = async (
    bookingId,
    itemId,
    completed,
    review = null,
    isEdit = false,
  ) => {
    try {
      const body = { itemId, completed };
      if (review !== null) {
        body.review = review;
        if (isEdit) body.isEdited = true;
      }
      const res = await axios.put(
        `${BASE_URL}/dashboard/bookings/${bookingId}/checklist/update`,
        body,
        { withCredentials: true },
      );
      if (activeTrip && activeTrip.id === bookingId) {
        const updatedTripRaw = res.data.booking;
        setActiveTrip({
          id: updatedTripRaw.id,
          title: updatedTripRaw.listing?.title || updatedTripRaw.guestName,
          status: updatedTripRaw.tripStatus,
          checklist: updatedTripRaw.checklist || [],
        });
      }
      setReviewingItem(null);
      setReviewText("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update");
    }
  };

  const startTrip = async (bookingId) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/dashboard/bookings/${bookingId}/start-trip`,
        {},
        { withCredentials: true },
      );
      const updatedTripRaw = res.data.booking;
      setActiveTrip({
        id: updatedTripRaw.id,
        title: updatedTripRaw.listing?.title || updatedTripRaw.guestName,
        status: updatedTripRaw.tripStatus,
        checklist: updatedTripRaw.checklist || [],
      });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to start trip");
    }
  };

  const getActiveTab = () => {
    const path = location.pathname.split("/")[2];
    return path || "overview";
  };

  const activeTab = getActiveTab();

  const checkUnreadMessages = async () => {
    if (activeTab === "messages") return;
    try {
      const res = await axios.get(`${BASE_URL}/dashboard/traveller/messages`, {
        withCredentials: true,
      });
      const unread = res.data.some((t) => (t.unreadCount || 0) > 0);
      setHasUnreadMessages(unread);
    } catch (err) {
      console.error("Error checking unread messages:", err);
    }
  };

  useEffect(() => {
    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleTabChange = (tab, subTab = null) => {
    if (tab === "messages") {
      setHasUnreadMessages(false);
    }
    setSidebarOpen(false);
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
        <TravellerSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={user}
          onClose={() => setSidebarOpen(false)}
          hasUnreadMessages={hasUnreadMessages}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <TravellerHeader
          user={user}
          onLogout={onLogout}
          onTabChange={handleTabChange}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8">
          <Routes>
            <Route
              index
              element={
                <TravellerAnalytics
                  user={user}
                  activeTrip={activeTrip}
                  setActiveTrip={setActiveTrip}
                  reviewingItem={reviewingItem}
                  setReviewingItem={setReviewingItem}
                  reviewText={reviewText}
                  setReviewText={setReviewText}
                  isEditingBudget={isEditingBudget}
                  setIsEditingBudget={setIsEditingBudget}
                  budget={budget}
                  setBudget={setBudget}
                  tempBudget={tempBudget}
                  setTempBudget={setTempBudget}
                  updateChecklist={updateChecklist}
                  startTrip={startTrip}
                />
              }
            />
            <Route
              path="calander"
              element={<TravellerCalendar user={user} />}
            />
            <Route
              path="bookings"
              element={<TravellerBookings user={user} />}
            />
            <Route
              path="messages"
              element={<TravellerMessages user={user} />}
            />
            <Route path="reviews" element={<TravellerReviews user={user} />} />
            <Route
              path="history"
              element={<TravellerHistory user={user} initialSubTab="logs" />}
            />
            <Route
              path="history/notifications"
              element={
                <TravellerHistory user={user} initialSubTab="notifications" />
              }
            />
          </Routes>
        </main>
      </div>

      {/* IMMERSIVE GLOBAL MODALS */}

      {/* Checklist Modal */}
      <AnimatePresence>
        {activeTrip && (
          <div className="fixed inset-0 w-full h-full z-[9999] flex items-center justify-center p-4 bg-[#0D1F18]/20 backdrop-blur-[6px]">
            <motion.div
              initial={{ scale: 0.99, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.99, opacity: 0 }}
              className={`bg-white rounded-lg overflow-hidden w-full ${activeTrip.status === "pending" ? "max-w-md" : "max-w-2xl"} max-h-[85vh] flex flex-col shadow-2xl border border-gray-100/50`}
            >
              <div className="bg-[#0D1F18] p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-emerald-400 text-sm">
                    explore
                  </span>
                  <h3 className="font-bold text-[12px] uppercase tracking-[0.2em]">
                    {activeTrip.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTrip(null)}
                  className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-3 bg-[#FAFAF8]/30">
                {activeTrip.status === "pending" ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                      <span className="material-icons">rocket_launch</span>
                    </div>
                    <button
                      onClick={() => startTrip(activeTrip.id)}
                      className="bg-primary px-8 h-12 rounded-lg text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/10 hover:opacity-90 transition-opacity"
                    >
                      Initialize Journey
                    </button>
                  </div>
                ) : (
                  activeTrip.checklist?.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border flex gap-4 transition-all ${item.completed ? "bg-white border-emerald-100 shadow-sm shadow-emerald-500/5" : "bg-white border-gray-100 shadow-sm"}`}
                    >
                      <button
                        onClick={() =>
                          updateChecklist(
                            activeTrip.id,
                            item.id,
                            !item.completed,
                          )
                        }
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${item.completed ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-gray-50 text-gray-300 border border-gray-100 hover:border-emerald-200"}`}
                      >
                        <span className="material-icons text-[16px]">
                          {item.completed ? "check" : ""}
                        </span>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-emerald-600/60">
                            Node {idx + 1}
                          </span>
                          <h4
                            className={`text-[13px] font-bold text-[#0D1F18] ${item.completed ? "opacity-40" : ""}`}
                          >
                            {item.title}
                          </h4>
                        </div>
                        {item.completed && (
                          <div className="mt-2 text-[11px] text-gray-400 font-medium italic flex items-center justify-between">
                            {item.review ? (
                              <>
                                <span>"{item.review}"</span>
                                {!item.isEdited && (
                                  <button
                                    onClick={() => {
                                      setReviewingItem(item);
                                      setReviewText(item.review);
                                    }}
                                    className="ml-2 text-primary hover:underline font-black uppercase text-[9px] tracking-widest flex items-center gap-1"
                                  >
                                    <span className="material-icons text-[12px]">
                                      edit
                                    </span>
                                    Edit Feedback
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => setReviewingItem(item)}
                                className="text-primary font-black uppercase text-[9px] tracking-widest hover:underline"
                              >
                                Write Progress Review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewingItem && (
          <div className="fixed inset-0 w-full h-full z-[10000] flex items-center justify-center bg-[#0D1F18]/20 backdrop-blur-[6px] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 md:p-8 rounded-lg w-full max-w-md shadow-2xl border border-gray-100/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="material-icons">rate_review</span>
                </div>
                <h3 className="text-[13px] font-black uppercase tracking-tight">
                  Experience Feedback
                </h3>
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full h-32 bg-gray-50 rounded-lg p-4 mb-6 outline-none border border-gray-100 focus:border-emerald-200 transition-all text-[12px] font-medium"
                placeholder="Share your experience for this milestone..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setReviewingItem(null);
                    setReviewText("");
                  }}
                  className="flex-1 h-11 bg-gray-100 text-gray-400 font-bold rounded-lg uppercase text-[9px] tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    updateChecklist(
                      activeTrip.id,
                      reviewingItem.id,
                      true,
                      reviewText,
                      !!reviewingItem.review,
                    )
                  }
                  className="flex-1 h-11 bg-[#0D1F18] text-white font-bold rounded-lg uppercase text-[9px] tracking-widest hover:opacity-90 transition-opacity shadow-md shadow-black/10"
                >
                  Save Decision
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Budget Modal */}
      <AnimatePresence>
        {isEditingBudget && (
          <div className="fixed inset-0 w-full h-full z-[10000] flex items-center justify-center bg-[#0D1F18]/20 backdrop-blur-[6px] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-lg w-full max-w-sm text-center shadow-2xl border border-gray-100/50"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-icons">account_balance_wallet</span>
                </div>
                <h3 className="text-[12px] font-black mb-1 uppercase tracking-wider">
                  Set Advisory Limit
                </h3>
                <p className="text-[9px] text-gray-400 uppercase font-black mb-8 tracking-[0.2em]">
                  Target Ceiling Amount (NPR)
                </p>
              </div>
              <input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                className="w-full h-14 bg-gray-50 rounded-lg text-center text-xl font-black mb-8 outline-none border border-gray-100 focus:border-amber-200"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditingBudget(false)}
                  className="flex-1 h-11 bg-gray-100 font-bold rounded-lg uppercase text-[9px] tracking-widest text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setBudget(tempBudget);
                    setIsEditingBudget(false);
                  }}
                  className="flex-1 h-11 bg-[#0D1F18] text-white font-bold rounded-lg uppercase text-[9px] tracking-widest"
                >
                  Update Limit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TravellerDashboard;
