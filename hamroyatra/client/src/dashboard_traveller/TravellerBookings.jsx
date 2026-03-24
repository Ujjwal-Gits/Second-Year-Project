import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import axios from "axios";

const ROOM_OPTIONS = ["AC", "Non-AC", "Family", "Couple"];
const BASE_URL = "http://localhost:5000/api";

// Modal Component Portaled to root body to fix the blur issue and stacking context
const ModalPortal = ({ children, onClose }) => {
  return createPortal(
    <>
      {/* Backdrop — always covers the full fixed screen */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[99998] bg-black/40 backdrop-blur-md"
      />
      {/* Scroll container — sits above backdrop, scrollable if content is tall */}
      <div className="fixed inset-0 z-[99999] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-6">
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

const TravellerBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filter, setFilter] = useState("all");

  // Trip Progress states
  const [activeTrip, setActiveTrip] = useState(null); // the booking currently being tracked
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [showChecklistDropdown, setShowChecklistDropdown] = useState(false);

  const [form, setForm] = useState({
    guestName: "",
    startDate: "",
    endDate: "",
    notes: "",
    rooms: [],
    amount: 0,
    travellerCount: 1,
    pricePerPerson: 0,
    tripDuration: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dashboard/traveller/bookings`, {
        withCredentials: true,
      });
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setLoading(false);
    }
  };

  // ── Trip Progress Functions ──
  const startTrip = async (bookingId) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/dashboard/bookings/${bookingId}/start-trip`,
        {},
        { withCredentials: true },
      );
      const updated = res.data.booking;
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, ...updated } : b)),
      );
      setActiveTrip(updated);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to start trip");
    }
  };

  const updateChecklist = async (
    bookingId,
    itemId,
    completed,
    review = null,
  ) => {
    try {
      const body = { itemId, completed };
      if (review !== null) body.review = review;
      const res = await axios.put(
        `${BASE_URL}/dashboard/bookings/${bookingId}/checklist/update`,
        body,
        { withCredentials: true },
      );
      const updated = res.data.booking;
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, ...updated } : b)),
      );
      setActiveTrip(updated);
      setReviewingItem(null);
      setReviewText("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update");
    }
  };

  // Helper: calculate end date from a start date + duration in days
  const calcEndDate = (startDateStr, durationDays) => {
    if (!startDateStr || !durationDays) return startDateStr;
    const d = new Date(startDateStr);
    d.setDate(d.getDate() + durationDays);
    return d.toISOString().split("T")[0];
  };

  const openEdit = (b) => {
    setEditItem(b);
    const rooms = b.roomSelection
      ? Object.entries(b.roomSelection).map(([type, count]) => ({
          type,
          count,
        }))
      : [];
    const travellerCount = b.roomCount || 1;
    const pricePerPerson = b.listingPrice || 0;
    const tripDuration = b.listingDuration || 0;
    const endDate = tripDuration
      ? calcEndDate(b.startDate, tripDuration)
      : b.endDate || "";
    setForm({
      guestName: b.guestName || "",
      startDate: b.startDate,
      endDate,
      notes: b.notes || "",
      rooms,
      amount: pricePerPerson
        ? pricePerPerson * travellerCount
        : b.totalAmount || 0,
      travellerCount,
      pricePerPerson,
      tripDuration,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editItem) return;

    try {
      const roomSelection = {};
      form.rooms.forEach((r) => {
        roomSelection[r.type] = r.count;
      });

      const updatedAmount = form.pricePerPerson
        ? form.pricePerPerson * form.travellerCount
        : form.amount;

      await axios.put(
        `${BASE_URL}/dashboard/bookings/${editItem.id}`,
        {
          startDate: form.startDate,
          endDate: form.endDate,
          notes: form.notes,
          roomSelection: roomSelection,
          roomCount: form.travellerCount,
          totalAmount: updatedAmount,
        },
        { withCredentials: true },
      );

      fetchBookings();
      setShowModal(false);
      setEditItem(null);
    } catch (err) {
      console.error("Error updating booking:", err);
    }
  };

  const addRoomType = () => {
    setForm((f) => ({ ...f, rooms: [...f.rooms, { type: "AC", count: 1 }] }));
  };

  const updateRoomType = (index, type) => {
    const newRooms = [...form.rooms];
    newRooms[index].type = type;
    setForm({ ...form, rooms: newRooms });
  };

  const updateRoomCount = (index, count) => {
    const newRooms = [...form.rooms];
    newRooms[index].count = Math.max(1, count);
    setForm({ ...form, rooms: newRooms });
  };

  const removeRoom = (index) => {
    setForm((f) => ({ ...f, rooms: f.rooms.filter((_, i) => i !== index) }));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/dashboard/bookings/${id}`, {
        withCredentials: true,
      });
      fetchBookings();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status === filter || b.bookingType === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-[#0D1F18] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 px-1">
        <div>
          <h2 className="text-[20px] lg:text-[24px] font-black text-[#0D1F18] tracking-tight">
            Adventure Inventory
          </h2>
          <p className="text-[10px] lg:text-[11px] text-gray-400 mt-1 font-bold uppercase tracking-[0.2em]">
            {bookings.length} reservations verified
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {["all", "hotel", "package", "confirmed", "pending"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === f ? "bg-[#0D1F18] text-white border-transparent shadow-lg shadow-black/10" : "border-gray-100 text-gray-400 bg-white hover:border-gray-200"}`}
              >
                {f === "package" ? "trekking" : f}
              </button>
            ))}
          </div>

          {/* Checklist Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowChecklistDropdown(!showChecklistDropdown)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto px-5 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              <span className="material-icons text-[18px]">fact_check</span>
              Checklist
            </button>

            <AnimatePresence>
              {showChecklistDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-13 w-full sm:w-72 bg-white rounded-2xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.2)] border border-gray-50 p-2 z-50"
                >
                  <div className="p-3 border-b border-gray-50 mb-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                      Active Journey Tracking
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {bookings.filter(
                      (b) =>
                        b.status === "confirmed" &&
                        b.tripStatus !== "completed" &&
                        (b.bookingType === "trekking" ||
                          b.bookingType === "package"),
                    ).length === 0 ? (
                      <div className="py-8 text-center">
                        <span className="material-icons text-[30px] text-gray-100 mb-2">
                          assignment_late
                        </span>
                        <p className="text-[9px] font-black text-gray-300 tracking-widest uppercase">
                          No Active Expeditions
                        </p>
                      </div>
                    ) : (
                      bookings
                        .filter(
                          (b) =>
                            b.status === "confirmed" &&
                            b.tripStatus !== "completed" &&
                            (b.bookingType === "trekking" ||
                              b.bookingType === "package"),
                        )
                        .map((b) => (
                          <button
                            key={`cl-${b.id}`}
                            onClick={() => {
                              setActiveTrip(b);
                              setShowChecklistDropdown(false);
                            }}
                            className="w-full text-left px-4 py-4 rounded-xl hover:bg-emerald-50 group flex flex-col gap-1 transition-all"
                          >
                            <span className="text-[12px] font-bold text-[#0D1F18] truncate group-hover:text-emerald-700">
                              {b.title || b.guestName}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-300">
                              {b.serialId ||
                                `REF-${b.id.slice(-4).toUpperCase()}`}
                            </span>
                          </button>
                        ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4 lg:space-y-2">
        {/* Ultra-Balanced Header Alignment */}
        <div className="hidden lg:flex px-12 items-center text-[8px] font-black text-gray-300 uppercase tracking-[0.35em] mb-4">
          <div className="w-[80px]">Reg. ID</div>
          <div className="w-[280px]">Verified Participant</div>
          <div className="w-[140px]">Service Status</div>
          <div className="w-[130px]">Temporal</div>
          <div className="w-[130px]">Experience</div>
          <div className="w-[140px]">Financials</div>
          <div className="flex-1 flex justify-end gap-0 pr-6">
            <div className="w-[100px] text-right">Total</div>
            <div className="w-[100px] text-right">Advance</div>
          </div>
          <div className="w-[50px]"></div>
        </div>

        {filteredBookings.map((b) => {
          const statusConfig = {
            confirmed: {
              dot: "bg-emerald-400",
              color: "text-[#0D1F18]",
              label: "CONFIRMED",
            },
            pending: {
              dot: "bg-red-500",
              color: "text-[#0D1F18]",
              label: "PENDING",
            },
            cancelled: {
              dot: "bg-gray-300",
              color: "text-gray-400",
              label: "CANCELLED",
            },
            completed: {
              dot: "bg-blue-400",
              color: "text-[#0D1F18]",
              label: "COMPLETED",
            },
          };
          const payConfig = {
            done: {
              dot: "bg-emerald-400",
              color: "text-[#0D1F18]",
              label: "PAID",
            },
            due: {
              dot: "bg-amber-400",
              color: "text-[#0D1F18]",
              label: "PENDING",
            },
          };

          const s = statusConfig[b.status] || statusConfig.pending;
          const p = payConfig[b.paymentStatus === "done" ? "done" : "due"];
          const displayName = b.title || b.guestName;
          const initials =
            displayName
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "G";
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[24px] py-6 lg:py-2.5 px-6 lg:px-12 border border-gray-100 flex flex-col lg:flex-row lg:items-center group hover:border-emerald-100 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.06)] transition-all gap-5 lg:gap-0 relative"
            >
              {/* 1. Identity + Actions (Grouped on mobile) */}
              <div className="flex justify-between items-start lg:w-[80px]">
                <div className="flex flex-col">
                  <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">
                    Entry ID
                  </span>
                  <span className="text-[10px] font-black text-[#0D1F18] tracking-[0.2em] uppercase opacity-40">
                    {b.serialId || `RE-${b.id.slice(-4).toUpperCase()}`}
                  </span>
                </div>
                {/* Mobile Header Console Trigger */}
                <div className="lg:hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === b.id ? null : b.id);
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeDropdown === b.id ? "bg-[#0D1F18] text-white shadow-lg" : "bg-gray-50 text-gray-400"}`}
                  >
                    <span className="material-icons text-[20px]">
                      more_horiz
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Participant */}
              <div className="lg:w-[280px] flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center relative flex-shrink-0 border border-gray-100/50">
                  <span className="text-[13px] font-black text-[#0D1F18]">
                    {initials}
                  </span>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-[15px] font-black text-[#0D1F18] truncate tracking-tight group-hover:text-emerald-800 transition-colors">
                    {b.title || b.guestName}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-bold truncate tracking-widest uppercase opacity-80 mt-0.5">
                    {b.companyName || "Private Expedition"}
                  </span>
                </div>
              </div>

              {/* Mobile Grid Section */}
              <div className="grid grid-cols-2 gap-y-6 lg:contents">
                {/* 3. Service Status */}
                <div className="flex flex-col gap-2 lg:w-[140px]">
                  <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
                    Service Status
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>

                {/* 4. Temporal */}
                <div className="flex flex-col gap-2 lg:w-[130px]">
                  <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
                    Date Schedule
                  </span>
                  <div className="flex items-center gap-2.5 text-gray-400">
                    <span className="material-icons text-[14px]">event</span>
                    <span className="text-[11px] font-black text-[#0D1F18]">
                      {new Date(b.startDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* 5. Experience Type */}
                <div className="flex flex-col gap-2 lg:w-[130px]">
                  <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
                    Category
                  </span>
                  <span className="text-[10px] font-black text-[#C5A059] bg-[#C5A059]/5 px-2 py-1 rounded lg:bg-transparent lg:px-0 lg:py-0 w-fit uppercase tracking-widest">
                    {b.bookingType || "TREKKING"}
                  </span>
                </div>

                {/* 6. Financials (Payment Status) */}
                <div className="flex flex-col gap-2 lg:w-[140px]">
                  <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
                    Financials
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${p.color}`}
                    >
                      {p.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* 7. Financial Breakdown */}
              <div className="flex-1 flex flex-row lg:flex-row justify-between lg:justify-end items-center gap-4 lg:gap-0 lg:pr-6 pt-4 lg:pt-0 mt-2 lg:mt-0 border-t border-gray-50 lg:border-t-0">
                <div className="lg:w-[100px] flex flex-col lg:items-end">
                  <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">
                    Gross Total
                  </span>
                  <span className="text-[16px] lg:text-[14px] font-black text-[#0D1F18] tracking-tighter tabular-nums">
                    {Number(b.totalAmount).toLocaleString()}
                  </span>
                </div>
                <div className="lg:w-[100px] flex flex-col lg:items-end">
                  <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">
                    Advance
                  </span>
                  <span className="text-[16px] lg:text-[14px] font-black text-emerald-500 tracking-tighter tabular-nums">
                    {Number(b.advanceAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 8. Console (Desktop) */}
              <div className="hidden lg:flex lg:w-[50px] justify-end relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === b.id ? null : b.id);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${activeDropdown === b.id ? "bg-[#0D1F18] text-white shadow-lg" : "text-gray-200 hover:text-[#0D1F18] hover:bg-gray-50"}`}
                >
                  <span className="material-icons text-[18px]">more_vert</span>
                </button>

                {/* Dropdown logic remains same, just position adjustment */}
                <AnimatePresence>
                  {activeDropdown === b.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-11 w-48 bg-white rounded-[24px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.2)] border border-gray-50 p-2 z-50"
                    >
                      <button
                        onClick={() => {
                          openEdit(b);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-[#0D1F18] transition-all"
                      >
                        <span className="material-icons text-[18px] opacity-40">
                          tune
                        </span>
                        Refine Plan
                      </button>
                      {(b.bookingType === "trekking" ||
                        b.bookingType === "package") && (
                        <button
                          onClick={() => {
                            setActiveTrip(b);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-all"
                        >
                          <span className="material-icons text-[18px]">
                            fact_check
                          </span>
                          Milestones
                        </button>
                      )}
                      <div className="h-px bg-gray-50 my-1 mx-2" />
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(b.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                      >
                        <span className="material-icons text-[18px]">
                          delete_outline
                        </span>
                        Purge Record
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Dropdown Overlay (Reusing same logic) */}
              <AnimatePresence>
                {activeDropdown === b.id && (
                  <div
                    className="lg:hidden fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10 bg-black/20 backdrop-blur-sm"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <motion.div
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 100, opacity: 0 }}
                      className="w-full max-w-sm bg-white rounded-[32px] p-2 shadow-2xl overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          openEdit(b);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-4 px-6 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-widest text-gray-600 active:bg-gray-50"
                      >
                        <span className="material-icons text-[24px] opacity-20">
                          tune
                        </span>
                        Refine Adventure Plan
                      </button>
                      {(b.bookingType === "trekking" ||
                        b.bookingType === "package") && (
                        <button
                          onClick={() => {
                            setActiveTrip(b);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-4 px-6 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-widest text-emerald-600 active:bg-emerald-50"
                        >
                          <span className="material-icons text-[24px]">
                            fact_check
                          </span>
                          Track Milestones
                        </button>
                      )}
                      <div className="h-px bg-gray-50 my-1 mx-4" />
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(b.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-4 px-6 py-6 rounded-[24px] text-[11px] font-black uppercase tracking-widest text-red-500 active:bg-red-50"
                      >
                        <span className="material-icons text-[24px]">
                          delete_sweep
                        </span>
                        Terminate Record
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredBookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 lg:py-32 flex flex-col items-center justify-center bg-white rounded-[32px] border border-dashed border-gray-100"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <span className="material-icons text-[32px] text-gray-200">
                auto_awesome_motion
              </span>
            </div>
            <h3 className="text-[14px] font-black text-[#0D1F18] uppercase tracking-[0.2em] mb-2">
              No Active Records Found
            </h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest text-center max-w-[240px] leading-relaxed">
              Your adventure inventory is currently empty. Start exploring and
              book your next experience!
            </p>
          </motion.div>
        )}
      </div>

      {/* Adjustment Modal — Complete Redesign */}
      <AnimatePresence>
        {showModal &&
          (() => {
            const isLocked = editItem?.status === "confirmed";
            const bookingInitials =
              editItem?.guestName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "TR";
            const typeLabel =
              editItem?.bookingType === "room"
                ? "Hotel Stay"
                : editItem?.bookingType === "guide"
                  ? "Guided Trek"
                  : "Travel Package";

            return (
              <ModalPortal onClose={() => setShowModal(false)}>
                <motion.div
                  initial={{ scale: 0.92, opacity: 0, y: 40 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.92, opacity: 0, y: 40 }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="bg-white rounded-t-[36px] lg:rounded-[36px] overflow-hidden shadow-[0_60px_140px_-30px_rgba(0,0,0,0.25)] w-full"
                >
                  {/* ── Header Identity Strip ── */}
                  <div className="bg-gradient-to-br from-[#0D1F18] to-[#1a3328] px-8 lg:px-10 py-7 lg:py-8 relative overflow-hidden">
                    {/* Background pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                        backgroundSize: "24px 24px",
                      }}
                    />

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                          <span className="text-[14px] font-extrabold text-white/90 tracking-tight">
                            {bookingInitials}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-[18px] lg:text-[20px] font-semibold text-white tracking-[-0.02em] leading-tight">
                            Modify Booking
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-medium text-white/40 tracking-wide">
                              {editItem?.serialId || "REF-XXXX"}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-[10px] font-medium text-[#C5A059]/80 tracking-wide">
                              {typeLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowModal(false)}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/5"
                      >
                        <span className="material-icons text-[18px]">
                          close
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* ── Modal Body ── */}
                  <div className="px-8 lg:px-10 py-7 lg:py-8 space-y-7">
                    {/* Lock Banner */}
                    {isLocked && (
                      <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-2xl px-5 py-4 border border-emerald-100/60">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/25">
                          <span className="material-icons text-[18px]">
                            lock
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-semibold text-emerald-900 leading-tight">
                            This booking is confirmed
                          </p>
                          <p className="text-[10px] text-emerald-600/80 mt-0.5">
                            All fields are locked by the agent. No modifications
                            allowed.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ── Section: Travel Dates ── */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-icons text-[16px] text-[#C5A059]/60">
                          calendar_month
                        </span>
                        <h4 className="text-[12px] font-semibold text-[#0D1F18] tracking-wide uppercase">
                          Travel Dates
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-medium text-gray-400 mb-1.5 block pl-1">
                            Start Date
                          </label>
                          <div
                            className={`h-[52px] bg-[#FAFAF8] rounded-2xl flex items-center px-4 border transition-all ${isLocked ? "border-gray-100 opacity-50" : "border-gray-100/80 hover:border-gray-200 focus-within:border-[#0D1F18]/20 focus-within:shadow-[0_0_0_3px_rgba(13,31,24,0.04)]"}`}
                          >
                            <span className="material-icons text-[16px] text-gray-300 mr-2.5">
                              hiking
                            </span>
                            <input
                              type="date"
                              value={form.startDate}
                              onChange={(e) => {
                                const newStart = e.target.value;
                                const isFixed =
                                  editItem?.bookingType !== "room" &&
                                  form.tripDuration > 0;
                                const newEnd = isFixed
                                  ? calcEndDate(newStart, form.tripDuration)
                                  : form.endDate;
                                setForm({
                                  ...form,
                                  startDate: newStart,
                                  endDate: newEnd,
                                });
                              }}
                              disabled={isLocked}
                              className="flex-1 bg-transparent text-[13px] font-medium text-[#0D1F18] outline-none disabled:cursor-not-allowed cursor-pointer"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5 pl-1">
                            <label className="text-[10px] font-medium text-gray-400">
                              End Date
                            </label>
                            {form.tripDuration > 0 && (
                              <span className="text-[9px] font-semibold text-[#C5A059]/70 bg-[#C5A059]/8 px-1.5 py-0.5 rounded-md">
                                {form.tripDuration}D
                              </span>
                            )}
                          </div>
                          <div
                            className={`h-[52px] bg-[#FAFAF8] rounded-2xl flex items-center px-4 border transition-all ${
                              isLocked ||
                              (editItem?.bookingType !== "room" &&
                                form.tripDuration > 0)
                                ? "border-gray-100 opacity-50 bg-[#0D1F18]/[0.03]"
                                : "border-gray-100/80 hover:border-gray-200 focus-within:border-[#0D1F18]/20 focus-within:shadow-[0_0_0_3px_rgba(13,31,24,0.04)]"
                            }`}
                          >
                            <span className="material-icons text-[16px] text-gray-300 mr-2.5">
                              tour
                            </span>
                            <input
                              type="date"
                              value={form.endDate}
                              min={form.startDate}
                              onChange={(e) =>
                                setForm({ ...form, endDate: e.target.value })
                              }
                              disabled={
                                isLocked ||
                                (editItem?.bookingType !== "room" &&
                                  form.tripDuration > 0)
                              }
                              className="flex-1 bg-transparent text-[13px] font-medium text-[#0D1F18] outline-none disabled:cursor-not-allowed cursor-pointer"
                            />
                            {(isLocked ||
                              (editItem?.bookingType !== "room" &&
                                form.tripDuration > 0)) && (
                              <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center border border-amber-100/60">
                                <span className="material-icons text-[12px] text-amber-500">
                                  lock
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Section: Travellers + Amount in one row ── */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Traveller Count */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-icons text-[16px] text-[#C5A059]/60">
                            group
                          </span>
                          <h4 className="text-[12px] font-semibold text-[#0D1F18] tracking-wide uppercase">
                            Travellers
                          </h4>
                        </div>
                        <div
                          className={`bg-[#FAFAF8] rounded-2xl px-4 py-3 border transition-all h-[52px] flex items-center justify-between ${isLocked ? "border-gray-100 opacity-50" : "border-gray-100/80"}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#0D1F18]/5 flex items-center justify-center">
                              <span className="material-icons text-[16px] text-[#0D1F18]/40">
                                person
                              </span>
                            </div>
                            <span className="text-[18px] font-bold text-[#0D1F18] tabular-nums">
                              {form.travellerCount || 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                if (isLocked) return;
                                const newCount = Math.max(
                                  1,
                                  (form.travellerCount || 1) - 1,
                                );
                                const newAmount = form.pricePerPerson
                                  ? form.pricePerPerson * newCount
                                  : form.amount;
                                setForm({
                                  ...form,
                                  travellerCount: newCount,
                                  amount: newAmount,
                                });
                              }}
                              disabled={isLocked}
                              className="w-7 h-7 rounded-lg bg-white border border-gray-200/80 flex items-center justify-center text-gray-500 hover:bg-[#0D1F18] hover:text-white hover:border-transparent transition-all shadow-sm disabled:opacity-30"
                            >
                              <span className="material-icons text-[14px]">
                                remove
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                if (isLocked) return;
                                const newCount = (form.travellerCount || 1) + 1;
                                const newAmount = form.pricePerPerson
                                  ? form.pricePerPerson * newCount
                                  : form.amount;
                                setForm({
                                  ...form,
                                  travellerCount: newCount,
                                  amount: newAmount,
                                });
                              }}
                              disabled={isLocked}
                              className="w-7 h-7 rounded-lg bg-white border border-gray-200/80 flex items-center justify-center text-gray-500 hover:bg-[#0D1F18] hover:text-white hover:border-transparent transition-all shadow-sm disabled:opacity-30"
                            >
                              <span className="material-icons text-[14px]">
                                add
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Settlement Value */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-icons text-[16px] text-[#C5A059]/60">
                            payments
                          </span>
                          <h4 className="text-[12px] font-semibold text-[#0D1F18] tracking-wide uppercase">
                            Amount
                          </h4>
                          {form.pricePerPerson > 0 && (
                            <span className="ml-auto text-[9px] text-gray-400 font-medium">
                              NPR {form.pricePerPerson.toLocaleString()}/person
                            </span>
                          )}
                        </div>
                        <div className="h-[52px] bg-[#0D1F18]/[0.03] rounded-2xl flex items-center px-4 border border-gray-100/60">
                          <span className="text-[10px] font-semibold text-gray-400 tracking-wider mr-2">
                            NPR
                          </span>
                          <span className="flex-1 text-[16px] font-bold text-[#0D1F18] tracking-tight tabular-nums">
                            {Number(
                              form.pricePerPerson
                                ? form.pricePerPerson * form.travellerCount
                                : form.amount,
                            ).toLocaleString()}
                          </span>
                          {!form.pricePerPerson && (
                            <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center border border-amber-100/60">
                              <span className="material-icons text-[12px] text-amber-500">
                                lock
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Section: Room Inventory (Hotel only) ── */}
                    {(editItem?.bookingType === "room" ||
                      editItem?.bookingType === "hotel") && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="material-icons text-[16px] text-[#C5A059]/60">
                              hotel
                            </span>
                            <h4 className="text-[12px] font-semibold text-[#0D1F18] tracking-wide uppercase">
                              Room Selection
                            </h4>
                          </div>
                          {!isLocked && (
                            <button
                              onClick={addRoomType}
                              className="flex items-center gap-1.5 text-[10px] font-semibold text-[#C5A059] hover:text-[#b08a3a] px-3 py-1.5 rounded-lg hover:bg-[#C5A059]/8 transition-all"
                            >
                              <span className="material-icons text-[14px]">
                                add_circle_outline
                              </span>
                              Add Room
                            </button>
                          )}
                        </div>
                        <div className="space-y-2.5">
                          {form.rooms.map((room, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-3 bg-[#FAFAF8] rounded-xl px-4 py-3 border transition-all ${isLocked ? "border-gray-100 opacity-50" : "border-gray-100/80 hover:border-gray-200"}`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#0D1F18]/5 flex items-center justify-center shrink-0">
                                <span className="material-icons text-[16px] text-[#0D1F18]/30">
                                  bed
                                </span>
                              </div>
                              <div className="relative group/sel flex-1">
                                <select
                                  value={room.type}
                                  onChange={(e) =>
                                    updateRoomType(idx, e.target.value)
                                  }
                                  disabled={isLocked}
                                  className="w-full bg-transparent text-[13px] font-bold text-[#0D1F18] outline-none cursor-pointer disabled:cursor-not-allowed appearance-none pr-8"
                                >
                                  {ROOM_OPTIONS.map((t) => (
                                    <option key={t} value={t}>
                                      {t}
                                    </option>
                                  ))}
                                </select>
                                <span className="material-icons absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none group-focus-within/sel:text-primary transition-colors">
                                  expand_more
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 border border-gray-100/80 shadow-sm">
                                <button
                                  onClick={() =>
                                    updateRoomCount(idx, room.count - 1)
                                  }
                                  disabled={isLocked}
                                  className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all text-[13px] font-bold disabled:opacity-30"
                                >
                                  −
                                </button>
                                <span className="text-[13px] font-bold text-[#0D1F18] w-5 text-center tabular-nums">
                                  {room.count}
                                </span>
                                <button
                                  onClick={() =>
                                    updateRoomCount(idx, room.count + 1)
                                  }
                                  disabled={isLocked}
                                  className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all text-[13px] font-bold disabled:opacity-30"
                                >
                                  +
                                </button>
                              </div>
                              {!isLocked && (
                                <button
                                  onClick={() => removeRoom(idx)}
                                  className="w-8 h-8 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                                >
                                  <span className="material-icons text-[16px]">
                                    close
                                  </span>
                                </button>
                              )}
                            </div>
                          ))}
                          {form.rooms.length === 0 && (
                            <div className="py-5 text-center bg-[#FAFAF8] rounded-2xl border border-dashed border-gray-200/60">
                              <span className="material-icons text-[24px] text-gray-200 mb-1.5">
                                bed
                              </span>
                              <p className="text-[10px] text-gray-300 font-medium">
                                No rooms added yet
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Section: Travel Notes (full width) ── */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-icons text-[16px] text-[#C5A059]/60">
                          sticky_note_2
                        </span>
                        <h4 className="text-[12px] font-semibold text-[#0D1F18] tracking-wide uppercase">
                          Travel Notes
                        </h4>
                        {isLocked && (
                          <span className="ml-auto text-[9px] font-semibold text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/60">
                            Locked
                          </span>
                        )}
                      </div>
                      <div
                        className={`bg-[#FAFAF8] rounded-2xl px-5 py-4 border transition-all ${isLocked ? "border-gray-100 opacity-50" : "border-gray-100/80 focus-within:border-[#0D1F18]/20 focus-within:shadow-[0_0_0_3px_rgba(13,31,24,0.04)]"}`}
                      >
                        <textarea
                          value={form.notes}
                          onChange={(e) =>
                            setForm({ ...form, notes: e.target.value })
                          }
                          disabled={isLocked}
                          rows={3}
                          className="w-full bg-transparent text-[13px] font-medium text-[#0D1F18] outline-none resize-none placeholder:text-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 leading-relaxed"
                          placeholder={
                            isLocked
                              ? "Notes locked by agent."
                              : "Add any special requests, dietary needs, preferences..."
                          }
                        />
                      </div>
                    </div>

                    {/* ── Submit Button ── */}
                    <div className="pt-2">
                      <button
                        onClick={handleSave}
                        disabled={isLocked}
                        className="w-full h-14 bg-gradient-to-r from-[#0D1F18] to-[#1a3328] rounded-2xl text-white text-[12px] font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-[0_12px_30px_-8px_rgba(13,31,24,0.35)] hover:shadow-[0_16px_40px_-8px_rgba(13,31,24,0.45)] hover:translate-y-[-1px] active:translate-y-0 active:shadow-[0_8px_20px_-8px_rgba(13,31,24,0.35)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_12px_30px_-8px_rgba(13,31,24,0.35)]"
                      >
                        <span className="material-icons text-[18px]">
                          check_circle
                        </span>
                        Save Changes
                      </button>
                      {isLocked && (
                        <p className="text-[10px] text-gray-400 text-center mt-3 font-medium">
                          Contact your agent to request modifications
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </ModalPortal>
            );
          })()}
      </AnimatePresence>

      {/* Termination Console */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <ModalPortal onClose={() => setShowDeleteConfirm(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[40px] p-10 text-center shadow-[0_60px_120px_-20px_rgba(255,0,0,0.15)] border border-red-50"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="material-icons text-red-500 text-[40px]">
                  priority_high
                </span>
              </div>
              <h4 className="text-[20px] font-black text-[#0D1F18] mb-3 tracking-tighter">
                Terminate Reservation?
              </h4>
              <p className="text-[13px] text-gray-400 font-medium mb-10 leading-relaxed">
                This action will permanently purge this record from the active
                inventory. Please confirm intentionality.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-4 rounded-2xl bg-gray-50 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 py-4 rounded-2xl bg-red-500 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-red-500/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ═══ Trip Checklist + Progress Panel ═══ */}
      <AnimatePresence>
        {activeTrip && (
          <ModalPortal onClose={() => setActiveTrip(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="bg-white rounded-xl lg:rounded-2xl overflow-hidden shadow-[0_60px_140px_-30px_rgba(0,0,0,0.3)] w-full max-w-2xl max-h-[85vh] flex flex-col"
            >
              {/* ── Header ── */}
              <div className="shrink-0 bg-gradient-to-br from-[#0D1F18] to-[#1a3328] px-8 lg:px-10 py-7 lg:py-8 relative overflow-hidden z-10">
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="absolute top-0 right-0 w-52 h-52 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                      <span className="material-icons text-primary text-[22px]">
                        hiking
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[18px] lg:text-[20px] font-semibold text-white tracking-[-0.02em] leading-tight">
                        {activeTrip.title || "Trip Checklist"}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-medium text-white/40 tracking-wide">
                          {activeTrip.serialId || "REF-XXXX"}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[10px] font-medium text-[#C5A059]/80 tracking-wide uppercase">
                          {activeTrip.bookingType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTrip(null)}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/5"
                  >
                    <span className="material-icons text-[18px]">close</span>
                  </button>
                </div>

                {/* Progress Bar */}
                {activeTrip.tripStatus !== "pending" &&
                  activeTrip.checklist?.length > 0 &&
                  (() => {
                    const done = activeTrip.checklist.filter(
                      (i) => i.completed,
                    ).length;
                    const total = activeTrip.checklist.length;
                    const pct = Math.round((done / total) * 100);
                    return (
                      <div className="mt-6 relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                            Progress
                          </span>
                          <span className="text-[13px] font-black text-primary">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })()}
              </div>

              {/* ── Body ── */}
              <div className="flex-1 px-8 lg:px-10 py-7 lg:py-8 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                {activeTrip.tripStatus === "pending" ? (
                  /* ── Start Trip CTA ── */
                  <div className="py-16 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                      <span className="material-icons text-primary text-[32px]">
                        rocket_launch
                      </span>
                    </div>
                    <h3 className="text-[16px] font-black text-[#0D1F18] tracking-tight mb-2">
                      Ready to Begin?
                    </h3>
                    <p className="text-[12px] text-gray-400 font-medium max-w-xs leading-relaxed mb-8">
                      Your itinerary has been uploaded by the agent. Once you
                      start the trip, the checklist will appear so you can track
                      each milestone.
                    </p>
                    <button
                      onClick={() => startTrip(activeTrip.id)}
                      className="bg-primary hover:bg-emerald-600 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span className="material-icons text-[16px] mr-2 align-middle">
                        play_arrow
                      </span>
                      Start Journey
                    </button>
                  </div>
                ) : (
                  /* ── Checklist Items ── */
                  <div className="space-y-4">
                    {activeTrip.checklist?.length === 0 ? (
                      <div className="py-16 text-center">
                        <span className="material-icons text-[40px] text-gray-200 mb-3">
                          checklist
                        </span>
                        <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">
                          No itinerary items found for this trip
                        </p>
                      </div>
                    ) : (
                      activeTrip.checklist?.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className={`rounded-xl p-2.5 sm:p-3 border transition-all ${item.completed ? "border-emerald-100 bg-emerald-50/10" : "border-gray-100 bg-[#FAFAF8]"}`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Checkbox */}
                            <button
                              onClick={() =>
                                updateChecklist(
                                  activeTrip.id,
                                  item.id,
                                  !item.completed,
                                )
                              }
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${item.completed ? "bg-emerald-500 text-white" : "bg-white text-gray-200 border border-gray-200 hover:border-primary/40"}`}
                            >
                              <span className="material-icons text-[16px]">
                                {item.completed
                                  ? "check"
                                  : "radio_button_unchecked"}
                              </span>
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">
                                    Day {idx + 1}
                                  </span>
                                  <h4
                                    className={`text-[14px] font-bold tracking-tight truncate max-w-[200px] sm:max-w-xs ${item.completed ? "text-emerald-800/40 line-through" : "text-[#0D1F18]"}`}
                                  >
                                    {item.title}
                                  </h4>
                                  {item.location && (
                                    <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                      <span className="material-icons text-[12px]">
                                        place
                                      </span>
                                      {item.location}
                                    </span>
                                  )}
                                </div>
                                {item.completedAt && (
                                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest whitespace-nowrap border border-emerald-100/50">
                                    ✓ Done
                                  </span>
                                )}
                              </div>

                              {/* Review Section */}
                              {item.completed && (
                                <div className="mt-2.5 pt-2.5 border-t border-emerald-100/30 flex items-center justify-between">
                                  {item.review ? (
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <span className="material-icons text-[14px] text-emerald-400 shrink-0">
                                        chat_bubble_outline
                                      </span>
                                      <p className="text-[12px] text-emerald-700/60 font-medium italic truncate pr-4">
                                        "{item.review}"
                                      </p>
                                      {!item.reviewEdited && (
                                        <button
                                          onClick={() => {
                                            setReviewingItem(item);
                                            setReviewText(item.review);
                                          }}
                                          className="text-[10px] font-black text-primary hover:text-emerald-600 uppercase tracking-widest flex items-center gap-1 shrink-0"
                                        >
                                          <span className="material-icons text-[14px]">
                                            edit
                                          </span>
                                          Edit Once
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setReviewingItem(item);
                                        setReviewText("");
                                      }}
                                      className="text-[10px] font-black text-primary hover:text-emerald-600 uppercase tracking-widest flex items-center gap-1.5"
                                    >
                                      <span className="material-icons text-[14px]">
                                        add_comment
                                      </span>
                                      Review Milestone
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

      {/* ═══ Review Writing Modal ═══ */}
      <AnimatePresence>
        {reviewingItem && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6 bg-[#0D1F18]/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-icons text-[18px]">
                    rate_review
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0D1F18] italic">
                    {reviewingItem.review ? "Edit Review" : "Private Review"}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Visible only to the agent
                  </p>
                </div>
              </div>

              {reviewingItem.review && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5">
                  <span className="material-icons text-[14px] text-amber-500 mt-0.5">
                    warning
                  </span>
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
                    Policy: You can only edit your review once after submission.
                  </p>
                </div>
              )}
              <p className="text-[12px] text-gray-500 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100 font-medium italic">
                "{reviewingItem.title}"
              </p>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="How was the experience at this checkpoint? Any feedback for the agent..."
                className="w-full h-32 bg-[#F7F6F3] rounded-2xl p-5 text-[14px] font-medium text-[#0D1F18] outline-none border border-transparent focus:border-primary/20 transition-all resize-none mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setReviewingItem(null)}
                  className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all"
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
                    )
                  }
                  disabled={
                    !reviewText.trim() || reviewingItem.review === reviewText
                  }
                  className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-[#0D1F18] shadow-lg shadow-black/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {reviewingItem.review ? "Save Edit" : "Submit Review"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TravellerBookings;
