import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardAPI } from "./api";

const TeamSection = ({ user }) => {
  const [view, setView] = useState("agents"); // 'agents' or 'guides'
  const [team, setTeam] = useState({ agents: [], guides: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("agent"); // 'agent' or 'guide'
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(null);

  const [agentForm, setAgentForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNo: "",
  });

  // OTP state for adding a new agent
  const [teamOtpStep, setTeamOtpStep] = useState(false);
  const [teamOtp, setTeamOtp] = useState("");
  const [teamOtpSending, setTeamOtpSending] = useState(false);
  const [teamOtpError, setTeamOtpError] = useState("");
  const [guideForm, setGuideForm] = useState({
    fullName: "",
    email: "",
    phoneNo: "",
    experienceYears: "",
    profileImage: "",
    certificateImage: "",
    certificateExpiry: "",
  });

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const { data } = await dashboardAPI.getTeam();
      setTeam(data);
    } catch (err) {
      console.error("Failed to fetch team:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const resetForms = () => {
    setAgentForm({ fullName: "", email: "", password: "", phoneNo: "" });
    setGuideForm({
      fullName: "",
      email: "",
      phoneNo: "",
      experienceYears: "",
      profileImage: "",
      certificateImage: "",
      certificateExpiry: "",
    });
    setIsEditMode(false);
    setEditingId(null);
    setTeamOtpStep(false);
    setTeamOtp("");
    setTeamOtpError("");
  };

  const openEditModal = (member, type) => {
    setModalType(type);
    setIsEditMode(true);
    setEditingId(member.id);
    if (type === "agent") {
      setAgentForm({
        fullName: member.fullName,
        email: member.email,
        password: "",
        phoneNo: member.phoneNo || "",
      });
    } else {
      setGuideForm({
        fullName: member.fullName,
        email: member.email,
        phoneNo: member.phoneNo,
        experienceYears: member.experienceYears,
        profileImage: member.profileImage,
        certificateImage: member.certificateImage,
        certificateExpiry: member.certificateExpiry
          ? member.certificateExpiry.split("T")[0]
          : "",
      });
    }
    setShowModal(true);
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(type);
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await dashboardAPI.uploadImage(formData);
      if (type === "profile")
        setGuideForm((f) => ({ ...f, profileImage: data.url }));
      else setGuideForm((f) => ({ ...f, certificateImage: data.url }));
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(null);
    }
  };

  const handleSaveAgent = async () => {
    try {
      if (isEditMode) {
        await dashboardAPI.updateAgent(editingId, agentForm);
        setShowModal(false);
        resetForms();
        fetchTeam();
      } else {
        // New agent: require OTP confirmation from the requesting agent
        if (!teamOtpStep) {
          // Step 1: request OTP
          setTeamOtpSending(true);
          setTeamOtpError("");
          try {
            await dashboardAPI.sendTeamAgentOtp();
            setTeamOtpStep(true);
          } catch (err) {
            setTeamOtpError(err.response?.data?.error || "Failed to send OTP");
          } finally {
            setTeamOtpSending(false);
          }
        } else {
          // Step 2: submit with OTP
          setTeamOtpError("");
          try {
            await dashboardAPI.addAgentToTeam({ ...agentForm, otp: teamOtp });
            setShowModal(false);
            resetForms();
            fetchTeam();
          } catch (err) {
            setTeamOtpError(err.response?.data?.error || "Operation failed");
          }
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || "Operation failed");
    }
  };

  const handleSaveGuide = async () => {
    try {
      if (isEditMode) {
        await dashboardAPI.updateGuide(editingId, guideForm);
      } else {
        await dashboardAPI.addGuideToTeam(guideForm);
      }
      setShowModal(false);
      resetForms();
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.error || "Operation failed");
    }
  };

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: "",
    id: "",
    name: "",
  });

  const triggerRemove = (id, name, type) => {
    setConfirmModal({ show: true, type, id, name });
  };

  const handleConfirmRemoval = async () => {
    try {
      if (confirmModal.type === "agent") {
        await dashboardAPI.deleteAgent(confirmModal.id);
      } else {
        await dashboardAPI.deleteGuide(confirmModal.id);
      }
      setConfirmModal({ show: false, type: "", id: "", name: "" });
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.error || "Purge failed");
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-20">
      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setConfirmModal({ show: false, type: "", id: "", name: "" })
              }
              className="fixed inset-0 bg-black/5 backdrop-blur-[4px]"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white/90 backdrop-blur-xl rounded-[32px] p-8 w-full max-w-[340px] shadow-[0_25px_50px_-12px_rgba(13,31,24,0.15)] border border-white text-center"
            >
              <div className="w-16 h-16 rounded-[22px] bg-red-50/50 flex items-center justify-center mx-auto mb-6">
                <span className="material-icons text-red-500 text-[28px]">
                  {confirmModal.type === "agent" ? "person_remove" : "close"}
                </span>
              </div>
              <h3 className="text-[17px] font-black text-[#0D1F18] leading-tight mb-6">
                <span className="text-[10px] text-red-500 uppercase tracking-[0.2em] font-black mb-1 block">
                  Confirm Action
                </span>
                {confirmModal.type === "agent"
                  ? "Revoke Agent Access?"
                  : "Remove Professional Guide?"}
              </h3>
              <button
                onClick={handleConfirmRemoval}
                className="w-full h-12 bg-[#0D1F18] text-white rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] mb-2"
              >
                Confirm Removal
              </button>
              <button
                onClick={() =>
                  setConfirmModal({ show: false, type: "", id: "", name: "" })
                }
                className="w-full h-12 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-[18px] lg:text-[24px] font-black text-[#0D1F18] tracking-tight flex flex-wrap items-center gap-2 lg:gap-3">
            Team Architecture
            <span className="text-[8px] lg:text-[10px] bg-emerald-50 text-emerald-600 px-2 lg:px-3 py-0.5 lg:py-1 rounded-full uppercase tracking-widest font-bold">
              {user?.companyName || "Corporate"}
            </span>
          </h2>
          <p className="text-[9px] lg:text-[11px] text-gray-400 mt-1 font-bold uppercase tracking-[0.2em]">
            Operational Human Capital Management
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-[22px] shadow-sm border border-gray-100">
          <button
            onClick={() => setView("agents")}
            className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${view === "agents" ? "bg-[#0D1F18] text-white shadow-lg" : "text-gray-400 hover:text-[#0D1F18]"}`}
          >
            Agents
          </button>
          <button
            onClick={() => setView("guides")}
            className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${view === "guides" ? "bg-[#0D1F18] text-white shadow-lg" : "text-gray-400 hover:text-[#0D1F18]"}`}
          >
            Guides
          </button>
        </div>

        <button
          onClick={() => {
            if (view === "guides" && !user?.verified) {
              alert(
                'Badge Verification Required. Only verified agencies with a "PRO" badge can register and display professional guides on their profile. Please complete your partner verification first from the "Become a Partner" section.',
              );
              return;
            }
            resetForms();
            setModalType(view === "agents" ? "agent" : "guide");
            setShowModal(true);
          }}
          className="bg-[#0D1F18] text-white px-5 lg:px-8 py-2.5 lg:py-3.5 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0D1F18]/10 flex items-center justify-center gap-2"
        >
          <span className="material-icons text-[16px]">add_circle</span>
          <span className="hidden sm:inline">
            Enroll {view === "agents" ? "Agent" : "Guide"}
          </span>
          <span className="sm:hidden">Enroll</span>
        </button>
      </div>

      {/* List Header */}
      <div className="hidden lg:grid grid-cols-12 px-8 py-2">
        <div className="col-span-1 text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Profile
        </div>
        <div className="col-span-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Member Identity
        </div>
        <div className="col-span-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Institutional Contact
        </div>
        <div className="col-span-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Operational Role
        </div>
        <div className="col-span-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Status / EXP
        </div>
        <div className="col-span-1 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
          Actions
        </div>
      </div>

      {/* List Rows */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-40 flex justify-center">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : view === "agents" ? (
          team.agents.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl lg:rounded-[16px] flex flex-col lg:grid lg:grid-cols-12 lg:items-center p-5 lg:px-8 lg:py-2.5 border border-gray-100 shadow-sm hover:shadow-md transition-all group gap-4 lg:gap-0"
            >
              <div className="flex items-center justify-between lg:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#0D1F18] group-hover:text-white transition-all">
                  <span className="material-icons text-[16px]">
                    account_balance
                  </span>
                </div>
                <div className="lg:hidden flex gap-1.5">
                  <button
                    onClick={() => openEditModal(member, "agent")}
                    className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center"
                  >
                    <span className="material-icons text-[14px]">edit</span>
                  </button>
                  {member.id !== user.id && (
                    <button
                      onClick={() =>
                        triggerRemove(member.id, member.fullName, "agent")
                      }
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"
                    >
                      <span className="material-icons text-[14px]">
                        delete_outline
                      </span>
                    </button>
                  )}
                </div>
              </div>
              <div className="lg:col-span-3">
                <span className="lg:hidden text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Member Identity
                </span>
                <span className="text-[13px] font-black text-[#0D1F18] block">
                  {member.fullName}
                </span>
                <span className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">
                  ID: {member.id.slice(0, 8)}
                </span>
              </div>
              <div className="lg:col-span-3">
                <span className="lg:hidden text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Institutional Contact
                </span>
                <span className="text-[11px] font-bold text-gray-500 block truncate">
                  {member.email}
                </span>
                <span className="text-[10px] font-medium text-gray-400">
                  {member.phoneNo || "No Phone"}
                </span>
              </div>
              <div className="lg:col-span-2">
                <span className="lg:hidden text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Operational Role
                </span>
                <span className="text-[8px] px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-black uppercase tracking-widest">
                  Corporate Agent
                </span>
              </div>
              <div className="lg:col-span-2">
                <span className="lg:hidden text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Status
                </span>
                <span className="text-[10px] font-black text-[#0D1F18] uppercase tracking-tighter flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" />{" "}
                  Authorized
                </span>
              </div>
              <div className="hidden lg:flex lg:col-span-1 justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                <button
                  onClick={() => openEditModal(member, "agent")}
                  className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[#0D1F18] hover:text-white transition-all"
                >
                  <span className="material-icons text-[14px]">edit</span>
                </button>
                {member.id !== user.id && (
                  <button
                    onClick={() =>
                      triggerRemove(member.id, member.fullName, "agent")
                    }
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <span className="material-icons text-[14px]">
                      delete_outline
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          team.guides.map((guide, i) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl lg:rounded-[16px] flex flex-col lg:grid lg:grid-cols-12 lg:items-center p-5 lg:px-8 lg:py-2.5 border border-gray-100 shadow-sm hover:shadow-md transition-all group gap-4 lg:gap-0"
            >
              <div className="flex items-center justify-between lg:col-span-1">
                {guide.profileImage ? (
                  <img
                    src={guide.profileImage}
                    className="w-8 h-8 rounded-lg object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300">
                    <span className="material-icons text-[18px]">
                      directions_walk
                    </span>
                  </div>
                )}
                <div className="lg:hidden flex gap-1.5">
                  <button
                    onClick={() => openEditModal(guide, "guide")}
                    className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center"
                  >
                    <span className="material-icons text-[14px]">edit</span>
                  </button>
                  <button
                    onClick={() =>
                      triggerRemove(guide.id, guide.fullName, "guide")
                    }
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"
                  >
                    <span className="material-icons text-[14px]">
                      delete_outline
                    </span>
                  </button>
                </div>
              </div>
              <div className="lg:col-span-3">
                <span className="lg:hidden text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Member Identity
                </span>
                <span className="text-[13px] font-black text-[#0D1F18] block">
                  {guide.fullName}
                </span>
                <span className="text-[8px] text-amber-600 font-extrabold uppercase tracking-widest">
                  Certified Field Guide
                </span>
              </div>
              <div className="lg:col-span-3">
                <span className="lg:hidden text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Institutional Contact
                </span>
                <span className="text-[11px] font-bold text-gray-500 block truncate">
                  {guide.email}
                </span>
                <span className="text-[10px] font-medium text-gray-400">
                  {guide.phoneNo}
                </span>
              </div>
              <div className="lg:col-span-2 flex items-center lg:items-center gap-2">
                <span className="lg:hidden text-[8px] font-black text-gray-400 uppercase tracking-widest">
                  EXP:
                </span>
                <span className="text-[12px] font-black text-[#0D1F18]">
                  {guide.experienceYears}Y
                </span>
              </div>
              <div className="lg:col-span-2">
                <span className="lg:hidden text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Status
                </span>
                <a
                  href={guide.certificateImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[8px] font-black text-emerald-600 hover:underline flex items-center gap-1 uppercase tracking-widest"
                >
                  Verified{" "}
                  <span className="material-icons text-[10px]">verified</span>
                </a>
              </div>
              <div className="hidden lg:flex lg:col-span-1 justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                <button
                  onClick={() => openEditModal(guide, "guide")}
                  className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[#0D1F18] hover:text-white transition-all"
                >
                  <span className="material-icons text-[14px]">edit</span>
                </button>
                <button
                  onClick={() =>
                    triggerRemove(guide.id, guide.fullName, "guide")
                  }
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                  <span className="material-icons text-[14px]">
                    delete_outline
                  </span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[10000] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowModal(false);
                resetForms();
              }}
              className="fixed inset-0 bg-black/5 backdrop-blur-[8px]"
            />
            <div className="flex min-h-full items-center justify-center p-6 lg:p-12">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                className="relative bg-white rounded-[40px] w-full max-w-xl shadow-2xl border border-white p-12"
              >
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForms();
                  }}
                  className="absolute top-6 lg:top-8 right-6 lg:right-8 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#0D1F18] hover:text-white transition-all shadow-sm z-10"
                >
                  <span className="material-icons text-[18px]">close</span>
                </button>

                <h3 className="text-[18px] lg:text-[22px] font-black text-[#0D1F18] mb-1">
                  {isEditMode ? "Modify" : "Enroll"}{" "}
                  {modalType === "agent"
                    ? "Corporate Agent"
                    : "Field Professional"}
                </h3>
                <p className="text-[9px] lg:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8 lg:mb-10">
                  Institutional Human Capital Management
                </p>

                <div className="space-y-6">
                  {modalType === "agent" ? (
                    <>
                      <div>
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                          Member Full Name
                        </label>
                        <input
                          value={agentForm.fullName}
                          onChange={(e) =>
                            setAgentForm((f) => ({
                              ...f,
                              fullName: e.target.value,
                            }))
                          }
                          className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[13px] font-bold outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                            Corporate Email
                          </label>
                          <input
                            value={agentForm.email}
                            onChange={(e) =>
                              setAgentForm((f) => ({
                                ...f,
                                email: e.target.value,
                              }))
                            }
                            className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[13px] font-bold outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                            Access Key{" "}
                            {!isEditMode ? "(Required)" : "(Optional)"}
                          </label>
                          <input
                            type="password"
                            value={agentForm.password}
                            onChange={(e) =>
                              setAgentForm((f) => ({
                                ...f,
                                password: e.target.value,
                              }))
                            }
                            className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[13px] font-bold outline-none"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                          Primary Contact
                        </label>
                        <input
                          value={agentForm.phoneNo}
                          onChange={(e) =>
                            setAgentForm((f) => ({
                              ...f,
                              phoneNo: e.target.value,
                            }))
                          }
                          className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[13px] font-bold outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 flex justify-center mb-4">
                        <div className="relative">
                          <input
                            type="file"
                            id="profile-upload"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "profile")}
                          />
                          <label
                            htmlFor="profile-upload"
                            className="cursor-pointer block"
                          >
                            {guideForm.profileImage ? (
                              <img
                                src={guideForm.profileImage}
                                className="w-24 h-24 rounded-[32px] object-cover border-4 border-emerald-500/10 shadow-lg"
                                alt=""
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-[32px] bg-[#F7F6F3] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 hover:border-emerald-500/20 transition-all">
                                <span className="material-icons text-3xl">
                                  add_a_photo
                                </span>
                                <span className="text-[7px] font-bold uppercase mt-1">
                                  Portrait
                                </span>
                              </div>
                            )}
                          </label>
                          {uploading === "profile" && (
                            <div className="absolute inset-0 bg-white/60 rounded-[32px] flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                          Guide Full Name
                        </label>
                        <input
                          value={guideForm.fullName}
                          onChange={(e) =>
                            setGuideForm((f) => ({
                              ...f,
                              fullName: e.target.value,
                            }))
                          }
                          className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[13px] font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                          Corporate Email
                        </label>
                        <input
                          value={guideForm.email}
                          onChange={(e) =>
                            setGuideForm((f) => ({
                              ...f,
                              email: e.target.value,
                            }))
                          }
                          className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[13px] font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                          Contact Number
                        </label>
                        <input
                          value={guideForm.phoneNo}
                          onChange={(e) =>
                            setGuideForm((f) => ({
                              ...f,
                              phoneNo: e.target.value,
                            }))
                          }
                          className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[13px] font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                          Experience (Yrs)
                        </label>
                        <input
                          type="number"
                          value={guideForm.experienceYears}
                          onChange={(e) =>
                            setGuideForm((f) => ({
                              ...f,
                              experienceYears: e.target.value,
                            }))
                          }
                          className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[13px] font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                          License Expiry
                        </label>
                        <input
                          type="date"
                          value={guideForm.certificateExpiry}
                          onChange={(e) =>
                            setGuideForm((f) => ({
                              ...f,
                              certificateExpiry: e.target.value,
                            }))
                          }
                          className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[13px] font-bold outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                          Upload Verification Document
                        </label>
                        <input
                          type="file"
                          id="cert-upload"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "certificate")}
                        />
                        <label
                          htmlFor="cert-upload"
                          className="w-full h-20 bg-[#F7F6F3]/50 rounded-[20px] border-2 border-dashed border-gray-100 flex items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-all text-gray-400"
                        >
                          <span className="material-icons">
                            {guideForm.certificateImage
                              ? "verified"
                              : "upload_file"}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {guideForm.certificateImage
                              ? "Update Document"
                              : "Browse License Proof"}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 lg:mt-12 flex flex-col gap-4">
                  {/* OTP step for new agent enrollment */}
                  {modalType === "agent" && !isEditMode && teamOtpStep && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                        OTP sent to your registered email. Enter it to confirm.
                      </p>
                      <input
                        type="text"
                        maxLength={6}
                        value={teamOtp}
                        onChange={(e) => {
                          setTeamOtp(e.target.value.replace(/\D/g, ""));
                          setTeamOtpError("");
                        }}
                        placeholder="6-digit OTP"
                        className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[20px] font-black tracking-[0.4em] text-center outline-none text-[#0D1F18]"
                      />
                    </div>
                  )}
                  {teamOtpError && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center">
                      {teamOtpError}
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForms();
                      }}
                      className="h-12 lg:h-14 px-6 rounded-xl lg:rounded-[22px] border border-gray-100 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all shrink-0"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={
                        modalType === "agent"
                          ? handleSaveAgent
                          : handleSaveGuide
                      }
                      disabled={teamOtpSending}
                      className="flex-1 h-12 lg:h-14 bg-[#0D1F18] text-white rounded-xl lg:rounded-[22px] text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0D1F18]/20 transition-all hover:bg-primary disabled:opacity-70"
                    >
                      {teamOtpSending
                        ? "Sending OTP..."
                        : modalType === "agent" && !isEditMode && !teamOtpStep
                          ? "Send OTP & Enroll"
                          : isEditMode
                            ? "Update Member"
                            : "Confirm Enrollment"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamSection;
