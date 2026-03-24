import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { dashboardAPI } from "./api";

const BOOKING_TYPES = ["room", "package", "guide"];
const STATUS_OPTIONS = ["confirmed", "pending", "cancelled", "completed"];
const PAYMENT_STATUS_OPTIONS = ["done", "pending"];
const ID_TYPES = ["citizenship", "passport", "voter_id", "license", "other"];

import CustomDropdown from "../components/CustomDropdown";

const BookingsSection = ({
  bookings,
  listings,
  user,
  onRefresh,
  prefillGuest,
  onClearPrefill,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [localOverrides, setLocalOverrides] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // stores booking id to delete
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    bookingType: "room",
    listingId: "",
    startDate: "",
    endDate: "",
    roomCount: 1,
    roomType: "AC",
    guideName: "",
    totalAmount: "",
    advanceAmount: "",
    paymentStatus: "pending",
    idType: "nid",
    idNumber: "",
    otherIdType: "",
    notes: "",
    roomSelection: { ac: 0, nonAc: 0, family: 0, couple: 0 },
  });

  const roomKeyMap = {
    AC: "ac",
    "Non-AC": "nonAc",
    Family: "family",
    Couple: "couple",
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await dashboardAPI.getCustomers();
        setAllCustomers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustomers();

    const closeDropdown = () => {
      setActiveDropdown(null);
      setShowCustomerDropdown(false);
    };
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  // Prefill logic
  React.useEffect(() => {
    if (prefillGuest) {
      setForm((f) => ({
        ...f,
        guestName: prefillGuest.name,
        guestEmail: prefillGuest.email || "",
        guestPhone: prefillGuest.phone || "",
      }));
      setShowModal(true);
      onClearPrefill();
    }
  }, [prefillGuest]);

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.bookingType === filter || b.status === filter);

  const handleSave = async () => {
    try {
      setSaving(true);
      const total = parseFloat(form.totalAmount) || 0;
      const advance = parseFloat(form.advanceAmount) || 0;

      // Auto-resolve payment status: if full amount paid upfront → done
      const resolvedPaymentStatus =
        total > 0 && advance >= total ? "done" : form.paymentStatus;

      const isRoom = form.bookingType === "room";
      const roomSelection = isRoom ? form.roomSelection : {};
      const totalRoomCount = isRoom
        ? Object.values(form.roomSelection).reduce(
            (a, b) => a + (parseInt(b) || 0),
            0,
          )
        : parseInt(form.roomCount) || 1;

      const data = {
        ...form,
        roomCount: totalRoomCount,
        roomSelection: roomSelection,
        totalAmount: total,
        advanceAmount: advance,
        paymentStatus: resolvedPaymentStatus,
      };

      if (editItem) {
        await dashboardAPI.updateBooking(editItem.id, data);
      } else {
        await dashboardAPI.createBooking(data);
      }

      setShowModal(false);
      setEditItem(null);
      resetForm();
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, update) => {
    // Immediately reflect in UI — no waiting for DB round-trip
    setLocalOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...update },
    }));
    try {
      await dashboardAPI.updateBooking(id, update);
      onRefresh();
    } catch (err) {
      console.error(err);
      // Revert local override on failure
      setLocalOverrides((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await dashboardAPI.deleteBooking(id);
      onRefresh();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete booking:", err);
      setShowDeleteConfirm("error"); // Toggle error state in modal
    }
  };

  const resetForm = () => {
    setForm({
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      bookingType: "room",
      listingId: "",
      startDate: "",
      endDate: "",
      roomCount: 1,
      roomType: "AC",
      guideName: "",
      totalAmount: "",
      advanceAmount: "",
      paymentStatus: "pending",
      idType: "nid",
      idNumber: "",
      otherIdType: "",
      notes: "",
      roomSelection: { ac: 0, nonAc: 0, family: 0, couple: 0 },
    });
    setEditItem(null);
  };

  const openEdit = (booking) => {
    setEditItem(booking);
    setForm({
      guestName: booking.guestName || "",
      guestEmail: booking.guestEmail || "",
      guestPhone: booking.guestPhone || "",
      bookingType: booking.bookingType || "room",
      listingId: booking.listingId || "",
      startDate: booking.startDate || "",
      endDate: booking.endDate || "",
      roomCount: booking.roomCount || 1,
      roomType: booking.roomType || "AC",
      guideName: booking.guideName || "",
      totalAmount: booking.totalAmount || "",
      advanceAmount: booking.advanceAmount || "",
      paymentStatus: booking.paymentStatus || "pending",
      idType: booking.idType || "nid",
      idNumber: booking.idNumber || "",
      otherIdType: booking.otherIdType || "",
      notes: booking.notes || "",
      roomSelection: booking.roomSelection || {
        ac: 0,
        nonAc: 0,
        family: 0,
        couple: 0,
      },
    });
    setShowModal(true);
  };

  const typeIcon = { room: "hotel", guide: "hiking", package: "card_travel" };
  const typeColor = {
    room: "bg-emerald-50 text-emerald-700",
    guide: "bg-slate-50 text-slate-700",
    package: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] lg:text-[18px] font-black text-[#0D1F18] tracking-tight">
            Ledger Manifest
          </h2>
          <p className="text-[9px] lg:text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-[0.15em]">
            {bookings.length} Operations Indexed
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-[#1D7447] text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-[#1D7447]/10"
        >
          <span className="material-icons text-[15px] lg:text-[16px]">add</span>
          <span className="hidden sm:inline">Initialize Record</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar lg:flex-wrap">
        {[
          "all",
          "room",
          "guide",
          "package",
          "confirmed",
          "pending",
          "cancelled",
        ].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl text-[9px] lg:text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${filter === f ? "bg-[#0D1F18] text-white border-transparent" : "border-gray-100 text-gray-400 bg-white hover:border-gray-200"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bookings Manifest List - Card Row Design */}
      <div className="space-y-3">
        {/* Column Headers */}
        <div className="px-8 hidden lg:flex items-center text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">
          <div className="w-[80px]">Serial Id</div>
          <div className="flex-1">Guest</div>
          <div className="w-[140px]">Payment Logic</div>
          <div className="w-[130px]">Temporal</div>
          <div className="w-[110px]">Type</div>
          <div className="w-[140px]">Operational</div>
          <div className="w-[90px] text-right">Total</div>
          <div className="w-[90px] text-right">Advance</div>
          <div className="w-[60px] text-center">Action</div>
        </div>

        {filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 bg-white rounded-3xl border border-dotted border-gray-100 flex flex-col items-center justify-center"
          >
            <span className="material-icons text-4xl text-gray-100 mb-4">
              analytics
            </span>
            <p className="text-[11px] text-gray-300 font-bold uppercase tracking-widest">
              Zero Operations Authorized
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3 pb-20">
            {filteredBookings.map((b, i) => {
              const listing = listings.find((l) => l.id === b.listingId);
              const statusConfig = {
                confirmed: {
                  dot: "bg-emerald-400",
                  text: "text-emerald-700",
                  label: "CONFIRMED",
                },
                pending: {
                  dot: "bg-amber-400",
                  text: "text-amber-700",
                  label: "PENDING",
                },
                cancelled: {
                  dot: "bg-red-500",
                  text: "text-red-700",
                  label: "CANCELLED",
                },
                completed: {
                  dot: "bg-gray-400",
                  text: "text-gray-700",
                  label: "COMPLETED",
                },
              };
              const payConfig = {
                done: {
                  dot: "bg-emerald-400",
                  text: "text-emerald-700",
                  label: "PAID",
                },
                pending: {
                  dot: "bg-red-500",
                  text: "text-red-700",
                  label: "DUE",
                },
              };
              const typeConfig = {
                room: { text: "text-emerald-500", label: "HOTEL" },
                guide: { text: "text-slate-600", label: "TREKKING" },
                package: { text: "text-amber-600", label: "PACKAGE" },
              };

              const s = statusConfig[b.status] || statusConfig.pending;
              const payStatusVal =
                (localOverrides[b.id]?.paymentStatus ?? b.paymentStatus) ||
                "pending";
              const p = payConfig[payStatusVal] || payConfig.pending;
              const t = typeConfig[b.bookingType] || {
                text: "text-gray-500",
                label: b.bookingType.toUpperCase(),
              };

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-[24px] p-6 lg:py-2.5 lg:px-8 border border-gray-100 shadow-sm hover:border-emerald-100 lg:hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-0 group relative"
                >
                  {/* 1. Identity Segment */}
                  <div className="flex justify-between items-start lg:w-[80px]">
                    <div className="flex flex-col">
                      <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1.5">
                        Record ID
                      </span>
                      <span className="text-[10px] font-black text-[#0D1F18] tracking-[0.2em] uppercase opacity-40">
                        {b.serialId || `RE-${b.id.slice(-4).toUpperCase()}`}
                      </span>
                    </div>
                    {/* Mobile Header Console */}
                    <div className="lg:hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(
                            activeDropdown === b.id ? null : b.id,
                          );
                        }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeDropdown === b.id ? "bg-[#0D1F18] text-white shadow-lg" : "bg-gray-50 text-gray-300"}`}
                      >
                        <span className="material-icons text-[20px]">
                          more_horiz
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Guest Info */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center relative flex-shrink-0 group-hover:bg-[#0D1F18]/5 transition-colors">
                      <span className="text-[13px] font-black text-[#0D1F18]">
                        {(b.guestName || "G").charAt(0)}
                      </span>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${s.dot}`}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-[15px] font-black text-[#0D1F18] truncate tracking-tight group-hover:text-emerald-800 transition-colors">
                        {b.guestName}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-bold truncate tracking-widest uppercase opacity-80 mt-0.5">
                        {listing?.title || "Private Operation"}
                      </span>
                    </div>
                  </div>

                  {/* 3. Mobile Details Grid */}
                  <div className="grid grid-cols-2 gap-y-6 lg:contents">
                    {/* Payment Logic */}
                    <div className="lg:w-[140px] flex flex-col gap-2">
                      <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
                        Financial Logic
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(
                                activeDropdown === `pay-${b.id}`
                                  ? null
                                  : `pay-${b.id}`,
                              );
                            }}
                            className="flex items-center gap-0.5 cursor-pointer"
                          >
                            <span
                              className={`font-black text-[10px] uppercase tracking-widest ${p.text}`}
                            >
                              {p.label}
                            </span>
                            <span className="material-icons text-[13px] text-gray-300">
                              expand_more
                            </span>
                          </button>
                          <AnimatePresence>
                            {activeDropdown === `pay-${b.id}` && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute left-0 top-6 z-[300] bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden min-w-[90px]"
                              >
                                {[
                                  { value: "done", label: "PAID" },
                                  { value: "pending", label: "DUE" },
                                ].map((opt) => (
                                  <button
                                    key={opt.value}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(b.id, {
                                        paymentStatus: opt.value,
                                      });
                                      setActiveDropdown(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${payStatusVal === opt.value ? "bg-[#0D1F18] text-white" : "text-gray-600 hover:bg-gray-50"}`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Temporal */}
                    <div className="lg:w-[130px] flex flex-col gap-2">
                      <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
                        Temporal Key
                      </span>
                      <div className="flex items-center gap-2.5 text-gray-400">
                        <span className="material-icons text-[14px]">
                          event_available
                        </span>
                        <span className="text-[11px] font-black text-[#0D1F18]">
                          {new Date(b.startDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="lg:w-[110px] flex flex-col gap-2">
                      <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
                        Category
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${t.text} rounded lg:bg-transparent lg:px-0 lg:py-0 w-fit`}
                      >
                        {t.label}
                      </span>
                    </div>

                    {/* Operational Status */}
                    <div className="lg:w-[140px] flex flex-col gap-2">
                      <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">
                        Operational
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(
                                activeDropdown === `status-${b.id}`
                                  ? null
                                  : `status-${b.id}`,
                              );
                            }}
                            className="flex items-center gap-0.5 cursor-pointer"
                          >
                            <span
                              className={`font-black text-[10px] lg:text-[11px] uppercase tracking-widest ${s.text}`}
                            >
                              {s.label}
                            </span>
                            <span className="material-icons text-[13px] text-gray-300">
                              expand_more
                            </span>
                          </button>
                          <AnimatePresence>
                            {activeDropdown === `status-${b.id}` && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute left-0 top-6 z-[300] bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden min-w-[110px]"
                              >
                                {STATUS_OPTIONS.map((opt) => (
                                  <button
                                    key={opt}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(b.id, { status: opt });
                                      setActiveDropdown(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${(localOverrides[b.id]?.status ?? b.status) === opt ? "bg-[#0D1F18] text-white" : "text-gray-600 hover:bg-gray-50"}`}
                                  >
                                    {opt.toUpperCase()}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Financial Breakdown */}
                  <div className="flex flex-row lg:flex-row justify-between lg:justify-start items-center gap-4 lg:gap-0 pt-5 lg:pt-0 mt-2 lg:mt-0 border-t border-gray-50 lg:border-t-0">
                    <div className="lg:w-[90px] flex flex-col lg:items-end">
                      <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">
                        Fiscal Total
                      </span>
                      <span className="text-[16px] lg:text-[14px] font-black text-[#0D1F18] tracking-tighter tabular-nums">
                        {Number(b.totalAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="lg:w-[90px] flex flex-col lg:items-end">
                      <span className="lg:hidden text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">
                        Advance
                      </span>
                      <span className="text-[16px] lg:text-[14px] font-black text-emerald-500 tracking-tighter tabular-nums">
                        {Number(b.advanceAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 5. Actions Console */}
                  <div className="hidden lg:flex w-[60px] justify-end relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(
                          activeDropdown === b.id ? null : b.id,
                        );
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${activeDropdown === b.id ? "bg-[#0D1F18] text-white shadow-lg" : "text-gray-200 hover:text-[#0D1F18] hover:bg-gray-50"}`}
                    >
                      <span className="material-icons text-[18px]">
                        more_vert
                      </span>
                    </button>

                    <AnimatePresence>
                      {activeDropdown === b.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-11 w-48 bg-white rounded-[24px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.2)] border border-gray-50 p-2 z-[200]"
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
                          <div className="h-px bg-gray-50 my-1 mx-2" />
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(b.id);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                          >
                            <span className="material-icons text-[18px] opacity-40">
                              delete_outline
                            </span>
                            Purge Record
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 6. Mobile Dropdown Overlay */}
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
                            Refine Operation Plan
                          </button>
                          <div className="h-px bg-gray-50 my-1 mx-4" />
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(b.id);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-4 px-6 py-6 rounded-[24px] text-[11px] font-black uppercase tracking-widest text-red-500 active:bg-red-50"
                          >
                            <span className="material-icons text-[24px] opacity-20">
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
          </div>
        )}
      </div>

      {/* Create Booking Modal - Robust Professional Architecture */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[10000] overflow-y-auto">
            {/* High-Fidelity Backdrop with Deep Focus Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/5 backdrop-blur-[8px] cursor-zoom-out"
            />

            {/* Centering Container - Ensures visibility on all resolutions */}
            <div className="flex min-h-full items-center justify-center p-6 lg:p-12">
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative bg-white rounded-2xl w-full max-w-xl shadow-[0_48px_120px_-20px_rgba(0,0,0,0.18)] border border-white/40 ring-1 ring-black/[0.03]"
              >
                {/* Modal Header - Refined for Executive Breathability */}
                <div className="px-6 lg:px-12 pt-8 lg:pt-12 pb-6 flex items-center justify-between border-b border-gray-50/50">
                  <div>
                    <h3 className="text-[18px] lg:text-[22px] font-black text-[#0D1F18] tracking-tight hover:text-primary transition-colors cursor-default leading-tight">
                      {editItem ? "Modify Order Record" : "Add New Booking"}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[8px] lg:text-[10px] text-gray-400 font-bold uppercase tracking-[0.25em]">
                        {editItem ? "Operational Console" : "Logistical Panel"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-gray-50 hover:bg-[#0D1F18] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 group shadow-sm"
                  >
                    <span className="material-icons text-[18px] lg:text-[20px] group-rotate-90 transition-transform">
                      close
                    </span>
                  </button>
                </div>

                <div className="px-6 lg:px-12 py-8 lg:py-10 space-y-8 lg:space-y-10">
                  {/* Service Selection - Tactile & Clear */}
                  <div>
                    <label className="text-[9px] lg:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 lg:mb-5 block">
                      Service Classification
                    </label>
                    <div className="flex gap-2">
                      {BOOKING_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              bookingType: t,
                              listingId: "",
                            }))
                          }
                          className={`flex-1 py-2.5 lg:py-3 rounded-[14px] lg:rounded-2xl text-[9px] lg:text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${form.bookingType === t ? "bg-[#0D1F18] text-white border-transparent" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"}`}
                        >
                          <span className="material-icons text-[14px]">
                            {typeIcon[t]}
                          </span>
                          <span className="hidden xs:inline">{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Form Grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                    {/* Asset Selection */}
                    <div className="col-span-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                        Target Inventory Asset
                      </label>
                      <CustomDropdown
                        options={listings
                          .filter((l) => {
                            if (form.bookingType === "room")
                              return l.type === "hotel";
                            if (form.bookingType === "guide")
                              return l.type === "trekking";
                            if (form.bookingType === "package")
                              return l.type === "travel";
                            return true;
                          })
                          .map((l) => ({ ...l, label: l.title }))}
                        value={form.listingId}
                        onChange={(val) =>
                          setForm((f) => ({ ...f, listingId: val }))
                        }
                        placeholder="Locate registered asset..."
                        searchable={true}
                      />
                    </div>

                    {/* Existing Customer Lookup */}
                    {!editItem && (
                      <div className="col-span-2 relative">
                        <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-3 block">
                          Quick Lookup (Existing Guest)
                        </label>
                        <div className="relative group">
                          <input
                            value={customerSearch}
                            onChange={(e) => {
                              setCustomerSearch(e.target.value);
                              setShowCustomerDropdown(true);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Search registered guest repository..."
                            className="w-full h-10 bg-[#0D1F18]/5 border-0 rounded-xl px-4 text-[11px] font-bold text-[#0D1F18] outline-none focus:bg-emerald-50 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                          />
                          <AnimatePresence>
                            {showCustomerDropdown && customerSearch && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-[300] max-h-48 overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {allCustomers
                                  .filter((c) =>
                                    c.name
                                      .toLowerCase()
                                      .includes(customerSearch.toLowerCase()),
                                  )
                                  .map((c) => (
                                    <button
                                      key={c.email || c.name}
                                      onClick={() => {
                                        setForm((f) => ({
                                          ...f,
                                          guestName: c.name,
                                          guestEmail: c.email || "",
                                          guestPhone: c.phone || "",
                                        }));
                                        setCustomerSearch("");
                                        setShowCustomerDropdown(false);
                                      }}
                                      className="w-full flex flex-col items-start px-4 py-3 rounded-xl hover:bg-emerald-50 transition-all group"
                                    >
                                      <span className="text-[11px] font-black text-[#0D1F18] group-hover:text-emerald-700">
                                        {c.name}
                                      </span>
                                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                        {c.email || "No Email"}
                                      </span>
                                    </button>
                                  ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {/* Primary Identity Hub - Separated */}
                    <div>
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                        Guest Full Name
                      </label>
                      <input
                        value={form.guestName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, guestName: e.target.value }))
                        }
                        placeholder="Enter guest name"
                        className="w-full h-12 lg:h-14 bg-[#F7F6F3]/50 rounded-xl lg:rounded-[24px] px-5 lg:px-6 text-[12px] lg:text-[13px] font-bold text-[#0D1F18] outline-none focus:ring-4 focus:ring-[#0D1F18]/5 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                        Email Address
                      </label>
                      <input
                        value={form.guestEmail}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, guestEmail: e.target.value }))
                        }
                        placeholder="Enter email address"
                        className="w-full h-12 lg:h-14 bg-[#F7F6F3]/50 rounded-xl lg:rounded-[24px] px-5 lg:px-6 text-[12px] lg:text-[13px] font-bold text-[#0D1F18] outline-none focus:ring-4 focus:ring-[#0D1F18]/5 transition-all"
                      />
                    </div>

                    {/* Temporal Logistics Hub - Separated */}
                    <div>
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                        Commencement (Start)
                      </label>
                      <div className="relative h-14 bg-[#F7F6F3]/50 rounded-[24px] flex items-center px-6 focus-within:ring-4 focus-within:ring-[#0D1F18]/5 transition-all">
                        <span className="material-icons text-[14px] text-gray-300 mr-3">
                          event
                        </span>
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              startDate: e.target.value,
                            }))
                          }
                          className="flex-1 bg-transparent border-0 text-[12px] font-bold text-[#0D1F18] outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                        Conclusion (End)
                      </label>
                      <div className="relative h-14 bg-[#F7F6F3]/50 rounded-[24px] flex items-center px-6 focus-within:ring-4 focus-within:ring-[#0D1F18]/5 transition-all">
                        <span className="material-icons text-[14px] text-gray-300 mr-3">
                          event_available
                        </span>
                        <input
                          type="date"
                          value={form.endDate}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, endDate: e.target.value }))
                          }
                          className="flex-1 bg-transparent border-0 text-[12px] font-bold text-[#0D1F18] outline-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Operational Specs Row - Split Architecture */}
                    <div className="col-span-2 grid grid-cols-2 gap-6">
                      {/* Box 1: Contact Protocol */}
                      <div>
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                          Phone Dial
                        </label>
                        <div className="flex h-12 lg:h-14 bg-[#F7F6F3]/50 rounded-xl lg:rounded-[24px] px-5 lg:px-6 items-center focus-within:ring-4 focus-within:ring-[#0D1F18]/5 transition-all">
                          <span className="material-icons text-[14px] text-gray-400 mr-3">
                            phone
                          </span>
                          <input
                            value={form.guestPhone}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                guestPhone: e.target.value,
                              }))
                            }
                            placeholder="Phone Contact"
                            className="flex-1 bg-transparent border-0 text-[12px] lg:text-[13px] font-bold text-[#0D1F18] outline-none placeholder:text-gray-300"
                          />
                        </div>
                      </div>

                      {/* Box 2: Service Specifics (Only for Rooms) OR Traveler Info */}
                      {form.bookingType === "room" ? (
                        <div>
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                            Category & Count
                          </label>
                          <div className="flex h-14 bg-[#F7F6F3]/50 rounded-xl focus-within:ring-4 focus-within:ring-primary/5 border border-transparent focus-within:border-primary transition-all">
                            <div className="flex-1 border-r border-gray-100/50">
                              <CustomDropdown
                                options={[
                                  "AC",
                                  "Non-AC",
                                  "Family",
                                  "Couple",
                                ].map((t) => ({ value: t, label: t }))}
                                value={form.roomType}
                                onChange={(val) =>
                                  setForm((f) => ({ ...f, roomType: val }))
                                }
                                placeholder="Room Type"
                              />
                            </div>
                            <div className="flex-1 flex items-center justify-between px-6 bg-[#0D1F18]/5">
                              <button
                                type="button"
                                onClick={() => {
                                  const key = roomKeyMap[form.roomType];
                                  setForm((f) => ({
                                    ...f,
                                    roomSelection: {
                                      ...f.roomSelection,
                                      [key]: Math.max(
                                        0,
                                        f.roomSelection[key] - 1,
                                      ),
                                    },
                                  }));
                                }}
                                className="w-6 h-6 rounded-md hover:bg-[#0D1F18] hover:text-white flex items-center justify-center transition-all text-gray-400 font-black text-[14px]"
                              >
                                -
                              </button>
                              <span className="text-[12px] font-black text-[#0D1F18]">
                                {form.roomSelection[
                                  roomKeyMap[form.roomType]
                                ] || 0}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const key = roomKeyMap[form.roomType];
                                  setForm((f) => ({
                                    ...f,
                                    roomSelection: {
                                      ...f.roomSelection,
                                      [key]: (f.roomSelection[key] || 0) + 1,
                                    },
                                  }));
                                }}
                                className="w-6 h-6 rounded-md hover:bg-[#0D1F18] hover:text-white flex items-center justify-center transition-all text-gray-400 font-black text-[14px]"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="col-span-1">
                          <div className="flex items-center justify-between mb-3 px-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">
                              Extra Requirements
                            </label>
                            {editItem?.createdBy === "traveller" && (
                              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100/50 flex items-center justify-center text-amber-500 shadow-sm">
                                <span className="material-icons text-[16px]">
                                  lock
                                </span>
                              </div>
                            )}
                          </div>
                          <div
                            className={`flex min-h-[56px] max-h-[140px] rounded-[24px] px-6 py-4 items-start transition-all overflow-hidden ${editItem?.createdBy === "traveller" ? "bg-gray-100/40 border border-gray-100" : "bg-[#F7F6F3]/50 focus-within:ring-4 focus-within:ring-[#0D1F18]/5"}`}
                          >
                            <span className="material-icons text-[16px] text-gray-400 mr-3 mt-0.5">
                              edit_note
                            </span>
                            <textarea
                              value={form.notes}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  notes: e.target.value,
                                }))
                              }
                              disabled={editItem?.createdBy === "traveller"}
                              placeholder={
                                editItem?.createdBy === "traveller"
                                  ? "Customer notes (Read-Only)..."
                                  : "Special instructions or requirements..."
                              }
                              className={`flex-1 bg-transparent border-0 text-[12px] font-black outline-none placeholder:text-gray-300 resize-none overflow-y-auto no-scrollbar scroll-smooth ${editItem?.createdBy === "traveller" ? "text-gray-500" : "text-[#0D1F18]"}`}
                              style={{ minHeight: "24px" }}
                              rows={2}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Identification Protocol Hub - Complete Row */}
                    <div className="col-span-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                        ID Verification Context Matrix
                      </label>
                      <div className="space-y-3">
                        <div className="flex h-14 bg-[#F7F6F3]/50 rounded-xl focus-within:ring-4 focus-within:ring-primary/5 border border-transparent focus-within:border-primary transition-all">
                          <div className="w-44 border-r border-gray-100/50">
                            <CustomDropdown
                              options={ID_TYPES.map((t) => ({
                                value: t,
                                label:
                                  t.charAt(0).toUpperCase() +
                                  t.slice(1).replace("_", " "),
                              }))}
                              value={form.idType}
                              onChange={(val) =>
                                setForm((f) => ({ ...f, idType: val }))
                              }
                              placeholder="ID System"
                            />
                          </div>
                          <input
                            value={form.idNumber}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                idNumber: e.target.value,
                              }))
                            }
                            placeholder="Document Identification Number"
                            className="flex-1 bg-transparent border-0 px-7 text-[13px] font-bold text-[#0D1F18] outline-none placeholder:text-gray-300"
                          />
                        </div>
                        {form.idType === "other" && (
                          <input
                            value={form.otherIdType}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                otherIdType: e.target.value,
                              }))
                            }
                            placeholder="Specify custom document classification"
                            className="w-full h-11 bg-[#F7F6F3]/50 border-0 rounded-[20px] px-6 text-[11px] font-bold text-[#0D1F18] outline-none focus:ring-4 focus:ring-[#0D1F18]/5 transition-all"
                          />
                        )}
                      </div>
                    </div>

                    {/* Financial Oversight */}
                    <div className="col-span-2 space-y-4">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                        Capital Management
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 px-6 block">
                            Total Authorization
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={form.totalAmount}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                totalAmount: Math.max(0, e.target.value),
                              }))
                            }
                            placeholder="0.00"
                            className="w-full h-14 bg-[#0D1F18]/5 border-0 rounded-[24px] px-6 text-[14px] font-black text-[#0D1F18] outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em] mb-2 px-6 block">
                            Advance Commitment
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={form.advanceAmount}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                advanceAmount: Math.max(0, e.target.value),
                              }))
                            }
                            placeholder="Optional"
                            className="w-full h-14 bg-[#F7F6F3]/50 border-0 rounded-[24px] px-6 text-[14px] font-black text-emerald-600 outline-none placeholder:text-gray-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Operational Authorization */}
                    <div className="col-span-2 pt-4 lg:pt-6">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-14 lg:h-16 bg-[#1D7447] rounded-xl text-white text-[11px] lg:text-[12px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 lg:gap-4 shadow-[0_20px_50px_-15px_rgba(29,116,71,0.3)] hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="material-icons text-[18px] lg:text-[20px]">
                              verified_user
                            </span>
                            <span>
                              {editItem ? "Commit Changes" : "Authorize Entry"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Premium Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="fixed inset-0 bg-black/5 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-[0_32px_80px_-15px_rgba(0,0,0,0.15)] border border-gray-100 p-8 text-center"
            >
              {showDeleteConfirm === "error" ? (
                <>
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-icons text-red-500 text-3xl">
                      error_outline
                    </span>
                  </div>
                  <h4 className="text-[16px] font-black text-[#0D1F18] mb-2 uppercase tracking-tight">
                    System Refusal
                  </h4>
                  <p className="text-[11px] text-gray-400 font-bold leading-relaxed px-4 mb-8">
                    The mainframe was unable to process the purge request.
                    Please verify connectivity.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="w-full h-14 bg-[#0D1F18] rounded-2xl text-white text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Acknowledge
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 group">
                    <span className="material-icons text-red-500 text-3xl group-hover:scale-110 transition-transform">
                      delete_sweep
                    </span>
                  </div>
                  <h4 className="text-[16px] font-black text-[#0D1F18] mb-2 uppercase tracking-tight">
                    Purge Authorized?
                  </h4>
                  <p className="text-[11px] text-gray-400 font-bold leading-relaxed px-4 mb-8">
                    This action will permanently strip this record from the
                    system. It cannot be recovered.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 h-14 bg-gray-50 rounded-2xl text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                    >
                      Abort
                    </button>
                    <button
                      onClick={() => handleDelete(showDeleteConfirm)}
                      className="flex-1 h-14 bg-red-500 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Confirm Purge
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingsSection;
