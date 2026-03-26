import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import HamroLogo from "../assets/HamroLogo.png";
import axios from "axios";

const AuthModal = ({ onClose, onAuthSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive mode and role from URL
  const mode = location.pathname.startsWith("/register") ? "register" : "login";
  const role = location.pathname === "/register/agent" ? "agent" : "traveller";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    phoneNo: "",
    contactNumber: "",
    companyName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // OTP step state
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Forgot password state
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Reset FORM state every time the modal path changes
  useEffect(() => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      location: "",
      phoneNo: "",
      contactNumber: "",
      companyName: "",
    });
    setIsLoading(false);
    setIsSuccess(false);
    setError("");
    setOtpStep(false);
    setOtp("");
    setOtpVerified(false);
  }, [location.pathname]);

  // Lock background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleModeSwitch = () => {
    if (mode === "login") {
      navigate("/register/traveller");
    } else {
      navigate("/login");
    }
  };

  const handleRoleSwitch = (newRole) => {
    navigate(newRole === "agent" ? "/register/agent" : "/register/traveller");
  };

  // Step 1 of registration: validate form then send OTP
  const handleSendOtp = async () => {
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      return setError("Please enter a valid email address first");
    }
    setOtpSending(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, {
        email: formData.email,
      });
      setOtpStep(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  // Step 2: verify OTP
  const handleVerifyOtp = async () => {
    setError("");
    if (!otp || otp.length !== 6) return setError("Enter the 6-digit OTP");
    setIsLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        email: formData.email,
        otp,
      });
      setOtpVerified(true);
      setOtpStep(false);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    setError("");

    // 1. First Priority: Check for Empty Fields
    if (mode === "register") {
      const requiredFields = [
        "fullName",
        "email",
        "password",
        "confirmPassword",
      ];
      if (role === "agent") {
        requiredFields.push("location", "phoneNo", "companyName");
      } else {
        requiredFields.push("contactNumber");
      }

      const missing = requiredFields.find((field) => !formData[field]?.trim());
      if (missing) {
        setError(`Please fill in all required details`);
        setIsLoading(false);
        return;
      }
    } else {
      // Login Empty Check
      if (!formData.email?.trim() || !formData.password?.trim()) {
        setError("Please enter both email and password");
        setIsLoading(false);
        return;
      }
    }

    // 2. Second Priority: Strict Email Format (Only if email is provided)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setError("Please provide a valid email address");
      setIsLoading(false);
      return;
    }

    // 3. Third Priority: Context Specific Validation
    if (mode === "register") {
      // Basic Phone Number Validation
      const phoneField =
        role === "agent" ? formData.phoneNo : formData.contactNumber;

      if (phoneField && phoneField.length < 7) {
        setError("Please provide a valid contact number");
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }
    }

    try {
      // endpoint selection logic
      const endpoint =
        mode === "login"
          ? "/api/auth/login"
          : role === "agent"
            ? "/api/auth/register/agent"
            : "/api/auth/register/traveller";

      // Construct payload based on mode and role
      let payload;
      if (mode === "login") {
        payload = { email: formData.email, password: formData.password };
      } else {
        // Register payload
        payload = { ...formData };
        // Remove irrelevant fields based on role to keep payload clean
        if (role === "traveller") {
          delete payload.location;
          delete payload.phoneNo;
          delete payload.companyName;
        } else {
          delete payload.contactNumber;
        }
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        payload,
        {
          withCredentials: true,
        },
      );

      const data = response.data;

      // Success Axis
      setIsSuccess(true);

      // Visual feedback delay
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1500);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message;
      setError(
        errorMessage === "Network Error"
          ? "Cannot connect to security server"
          : errorMessage,
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot Password Handlers ──────────────────────────────────────────────
  const handleForgotSendOtp = async () => {
    setForgotError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail || !emailRegex.test(forgotEmail))
      return setForgotError("Please enter a valid email address");
    setForgotLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password/send-otp`,
        { email: forgotEmail },
        { timeout: 15000 },
      );
      setForgotStep(2);
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        setForgotError("Request timed out. Please try again.");
      } else {
        setForgotError(err.response?.data?.error || "Failed to send OTP");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerifyOtp = async () => {
    setForgotError("");
    if (!forgotOtp || forgotOtp.length !== 6)
      return setForgotError("Enter the 6-digit OTP");
    setForgotLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password/verify-otp`,
        { email: forgotEmail, otp: forgotOtp },
      );
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async () => {
    setForgotError("");
    if (!forgotPassword || forgotPassword.length < 6)
      return setForgotError("Password must be at least 6 characters");
    if (forgotPassword !== forgotConfirm)
      return setForgotError("Passwords do not match");
    setForgotLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password/reset`,
        {
          email: forgotEmail,
          password: forgotPassword,
          confirmPassword: forgotConfirm,
        },
      );
      setForgotSuccess(true);
      setTimeout(() => {
        setForgotMode(false);
        setForgotStep(1);
        setForgotEmail("");
        setForgotOtp("");
        setForgotPassword("");
        setForgotConfirm("");
        setForgotSuccess(false);
      }, 2500);
    } catch (err) {
      setForgotError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  const modalVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.4, staggerChildren: 0.05 },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const portalVariants = {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  const backdropVariants = {
    initial: { opacity: 0, backdropFilter: "blur(0px)" },
    animate: {
      opacity: 1,
      backdropFilter: "blur(16px)",
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      backdropFilter: "blur(0px)",
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  // Minimalist slight curvature (Professional Architectural Standard)
  const roundedClass = "rounded-md";
  const inputHeight = "h-[48px]";
  const buttonHeight = "h-[48px]";

  return (
    <motion.div
      variants={modalVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
    >
      <style>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active{
                    -webkit-box-shadow: 0 0 0 30px white inset !important;
                    -webkit-text-fill-color: #1D7447 !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}</style>

      <motion.div
        variants={backdropVariants}
        onClick={onClose}
        className="absolute inset-0 bg-black/30 cursor-pointer"
      />

      {/* The Masterpiece: Rectilinear Identity Portal */}
      <motion.div
        layout
        variants={portalVariants}
        className={`relative w-full sm:max-w-[1000px] bg-white overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row sm:h-[680px] max-h-[90vh] pointer-events-auto rounded-xl`}
      >
        {/* Left Wing: Brand Axis — hidden on mobile */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="hidden sm:flex bg-[#0F1612] w-[35%] h-full flex-col items-center justify-center shrink-0 border-r border-white/5 relative overflow-hidden"
        >
          {/* Subtle Breathing Aurora */}
          <motion.div
            animate={{
              opacity: [0.05, 0.1, 0.05],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#C5A059_0%,transparent_70%)] pointer-events-none filter blur-2xl"
          />

          <div
            className="relative z-10 mb-8"
            style={{ width: "220px", height: "220px" }}
          >
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              src={HamroLogo}
              alt="Hamroyatra"
              className="w-full h-full object-contain brightness-0 invert opacity-100"
            />
          </div>

          <div className="relative z-10 space-y-3 text-center -translate-y-[75px]">
            <h2 className="text-white font-serif text-3xl font-black tracking-[0.3em] uppercase leading-none">
              Hamroyatra
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-[#C5A059]/30" />
              <span className="text-[#C5A059] text-[9px] font-bold tracking-[0.5em] uppercase opacity-70">
                Private Collection
              </span>
              <div className="h-[1px] w-8 bg-[#C5A059]/30" />
            </div>
          </div>

          <div className="absolute bottom-10 left-0 right-0 text-center opacity-10">
            <span className="text-white text-[7px] font-black uppercase tracking-[0.6em]">
              System Axis v1.1
            </span>
          </div>
        </motion.div>

        {/* Right Wing: Interaction Panel */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {/* ── Forgot Password Overlay ── */}
          <AnimatePresence>
            {forgotMode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 bg-white z-30 flex flex-col px-6 sm:px-12 py-8 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl text-primary font-bold tracking-tight leading-none">
                      Reset Password
                    </h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">
                      {forgotStep === 1
                        ? "Enter your email"
                        : forgotStep === 2
                          ? "Enter OTP"
                          : "Set new password"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setForgotMode(false);
                      setForgotStep(1);
                      setForgotError("");
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-300 hover:text-primary transition-colors"
                  >
                    <span className="material-icons text-2xl">close</span>
                  </button>
                </div>

                {forgotSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center flex-1 gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-icons text-primary text-3xl">
                        check_circle
                      </span>
                    </div>
                    <p className="text-[13px] font-black text-primary uppercase tracking-widest">
                      Password Reset!
                    </p>
                    <p className="text-[11px] text-gray-400 text-center">
                      You can now log in with your new password.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4 max-w-[420px] w-full mx-auto">
                    {forgotError && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">
                        {forgotError}
                      </div>
                    )}

                    {forgotStep === 1 && (
                      <>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={forgotEmail}
                          onChange={(e) => {
                            setForgotEmail(e.target.value);
                            setForgotError("");
                          }}
                          className={`w-full h-[46px] sm:h-[54px] bg-white border border-gray-200 rounded-md px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                        />
                        <button
                          onClick={handleForgotSendOtp}
                          disabled={forgotLoading}
                          className="w-full h-[46px] sm:h-[54px] bg-primary text-white rounded-md text-[11px] font-black uppercase tracking-[0.4em] disabled:opacity-70 transition-all"
                        >
                          {forgotLoading ? "Sending..." : "Send OTP"}
                        </button>
                      </>
                    )}

                    {forgotStep === 2 && (
                      <>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                          OTP sent to{" "}
                          <span className="text-primary">{forgotEmail}</span>
                        </p>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          value={forgotOtp}
                          onChange={(e) => {
                            setForgotOtp(e.target.value.replace(/\D/g, ""));
                            setForgotError("");
                          }}
                          className="w-full h-[46px] sm:h-[54px] bg-white border border-gray-200 rounded-md px-6 text-[18px] font-black tracking-[0.4em] text-center focus:border-[#C5A059] outline-none text-primary"
                        />
                        <button
                          onClick={handleForgotVerifyOtp}
                          disabled={forgotLoading}
                          className="w-full h-[46px] sm:h-[54px] bg-primary text-white rounded-md text-[11px] font-black uppercase tracking-[0.4em] disabled:opacity-70 transition-all"
                        >
                          {forgotLoading ? "Verifying..." : "Verify OTP"}
                        </button>
                        <button
                          onClick={() => {
                            setForgotStep(1);
                            setForgotOtp("");
                            setForgotError("");
                          }}
                          className="w-full text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-primary transition-colors text-center"
                        >
                          ← Back
                        </button>
                      </>
                    )}

                    {forgotStep === 3 && (
                      <>
                        <input
                          type="password"
                          placeholder="New Password"
                          value={forgotPassword}
                          onChange={(e) => {
                            setForgotPassword(e.target.value);
                            setForgotError("");
                          }}
                          className="w-full h-[46px] sm:h-[54px] bg-white border border-gray-200 rounded-md px-6 text-[14px] font-bold focus:border-[#C5A059] outline-none text-primary placeholder:text-gray-300 transition-all"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          value={forgotConfirm}
                          onChange={(e) => {
                            setForgotConfirm(e.target.value);
                            setForgotError("");
                          }}
                          className="w-full h-[46px] sm:h-[54px] bg-white border border-gray-200 rounded-md px-6 text-[14px] font-bold focus:border-[#C5A059] outline-none text-primary placeholder:text-gray-300 transition-all"
                        />
                        <button
                          onClick={handleForgotReset}
                          disabled={forgotLoading}
                          className="w-full h-[46px] sm:h-[54px] bg-primary text-white rounded-md text-[11px] font-black uppercase tracking-[0.4em] disabled:opacity-70 transition-all"
                        >
                          {forgotLoading ? "Resetting..." : "Reset Password"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Compact Header */}
          <div className="px-6 sm:px-12 pt-6 sm:pt-12 flex items-center justify-between z-20 shrink-0">
            <div className="space-y-1">
              <h3 className="text-3xl text-primary font-bold tracking-tight leading-none">
                {mode === "login" ? "Welcome Back" : "Create Profile"}
              </h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">
                {mode === "login"
                  ? "Secure authentication gateway"
                  : "Join the proprietary network"}
              </p>
            </div>
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors text-gray-300 hover:text-primary"
            >
              <span className="material-icons text-2xl">close</span>
            </motion.button>
          </div>

          {/* Content Area: Compressed Proportions */}
          <div className="flex-1 overflow-hidden px-6 sm:px-12 py-4 sm:py-6 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode + role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-8 h-full"
              >
                {/* Register Specific Contexts */}
                {mode === "register" && (
                  <div className="flex items-center gap-6 shrink-0 border-b border-gray-50 pb-4">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Account Type
                    </span>
                    <div className="flex bg-gray-50 p-1 rounded border border-gray-100">
                      <button
                        onClick={() => handleRoleSwitch("traveller")}
                        className={`px-8 py-2 rounded text-[9px] font-black uppercase tracking-widest transition-all ${role === "traveller" ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}
                      >
                        Traveller
                      </button>
                      <button
                        onClick={() => handleRoleSwitch("agent")}
                        className={`px-8 py-2 rounded text-[9px] font-black uppercase tracking-widest transition-all ${role === "agent" ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}
                      >
                        Agent
                      </button>
                    </div>
                  </div>
                )}

                {/* Precision Input Matrix */}
                <div className="space-y-4">
                  {mode === "register" ? (
                    role === "agent" ? (
                      <div className="grid gap-4">
                        {/* Agent Matrix Logic */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            autoComplete="off"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                            className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                          />
                          <input
                            autoComplete="off"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email Address"
                            className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            autoComplete="off"
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Location"
                            className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                          />
                          <div className="relative group">
                            <input
                              autoComplete="off"
                              type="tel"
                              name="phoneNo"
                              value={formData.phoneNo}
                              onChange={handleInputChange}
                              placeholder="Phone Number (Include country code if needed)"
                              className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold transition-all focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] placeholder:text-gray-300 text-primary outline-none`}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            autoComplete="new-password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                            className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                          />
                          <input
                            autoComplete="new-password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm Password"
                            className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                          />
                        </div>
                        <input
                          autoComplete="off"
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="Company Name"
                          className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                        />
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            autoComplete="off"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                            className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                          />
                          <input
                            autoComplete="off"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email Address"
                            className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            autoComplete="new-password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                            className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                          />
                          <input
                            autoComplete="new-password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm Password"
                            className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                          />
                        </div>
                        <div className="relative group">
                          <input
                            autoComplete="off"
                            type="tel"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            placeholder="Contact Number (Include country code if needed)"
                            className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold transition-all focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] placeholder:text-gray-300 text-primary outline-none`}
                          />
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="grid gap-4">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                      />
                      <div className="space-y-2">
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Key Password"
                          className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[14px] font-bold focus:ring-0 focus:border-[#C5A059] [&:not(:placeholder-shown)]:border-[#C5A059] transition-all placeholder:text-gray-300 text-primary outline-none`}
                        />
                        <div className="flex justify-end px-1">
                          <button
                            onClick={() => {
                              setForgotMode(true);
                              setForgotStep(1);
                              setForgotError("");
                            }}
                            className="text-[10px] text-gray-400 font-bold hover:text-primary transition-colors tracking-widest uppercase"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Core */}
                <div className="mt-auto flex flex-col items-center w-full pb-4">
                  <div className="w-full max-w-[420px] space-y-6">
                    <div className="space-y-4">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 bg-red-50 border border-red-100 rounded text-[10px] font-bold text-red-500 uppercase tracking-widest text-center"
                        >
                          {error}
                        </motion.div>
                      )}

                      {/* OTP Step — shown after Send OTP clicked */}
                      {otpStep && mode === "register" && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                            OTP sent to{" "}
                            <span className="text-primary">
                              {formData.email}
                            </span>
                          </p>
                          <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => {
                              setOtp(e.target.value.replace(/\D/g, ""));
                              if (error) setError("");
                            }}
                            placeholder="Enter 6-digit OTP"
                            className={`w-full ${inputHeight} bg-white border border-gray-200 ${roundedClass} px-6 text-[18px] font-black tracking-[0.4em] text-center focus:border-[#C5A059] outline-none text-primary`}
                          />
                          <button
                            onClick={handleVerifyOtp}
                            disabled={isLoading}
                            className={`w-full ${buttonHeight} bg-primary text-white ${roundedClass} text-[11px] font-black uppercase tracking-[0.4em] transition-all disabled:opacity-70`}
                          >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                          </button>
                          <button
                            onClick={() => {
                              setOtpStep(false);
                              setOtp("");
                              setError("");
                            }}
                            className="w-full text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-primary transition-colors"
                          >
                            ← Back
                          </button>
                        </motion.div>
                      )}

                      {/* Normal submit / send-otp button */}
                      {!otpStep && (
                        <>
                          {mode === "register" && !otpVerified ? (
                            <button
                              onClick={handleSendOtp}
                              disabled={otpSending}
                              className={`w-full ${buttonHeight} bg-primary text-white ${roundedClass} text-[11px] font-black uppercase tracking-[0.4em] shadow-lg shadow-primary/5 transition-all disabled:opacity-70 flex items-center justify-center gap-2`}
                            >
                              {otpSending
                                ? "Sending OTP..."
                                : "Verify Email & Continue"}
                            </button>
                          ) : (
                            <button
                              onClick={handleSubmit}
                              disabled={isLoading || isSuccess}
                              className={`w-full ${buttonHeight} ${isSuccess ? "bg-[#C5A059] border-[#C5A059]" : "bg-primary"} text-white ${roundedClass} text-[11px] font-black uppercase tracking-[0.4em] shadow-lg shadow-primary/5 transition-all disabled:opacity-90 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                            >
                              {isLoading
                                ? "Verifying Identity..."
                                : isSuccess
                                  ? mode === "register"
                                    ? "Account Created"
                                    : "Logged In Successfully"
                                  : mode === "login"
                                    ? "Confirm Entrance"
                                    : "Create Profile"}
                            </button>
                          )}
                        </>
                      )}

                      {/* OTP verified badge */}
                      {otpVerified && mode === "register" && (
                        <p className="text-[10px] text-[#1D7447] font-black uppercase tracking-widest text-center">
                          ✓ Email verified
                        </p>
                      )}

                      {/* Registration Footer Logic */}
                      <div className="flex justify-center text-[10px] text-gray-400 font-bold tracking-[0.1em] uppercase">
                        {mode === "login"
                          ? "New User? "
                          : "Already have account? "}
                        <button
                          onClick={handleModeSwitch}
                          className="text-primary border-b border-primary/20 hover:border-primary transition-all ml-2"
                        >
                          {mode === "login" ? "REGISTER" : "LOGIN"}
                        </button>
                      </div>
                    </div>

                    {/* Social Login Logic */}
                    {!(mode === "register" && role === "agent") && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-6">
                          <div className="h-[1px] flex-grow bg-gray-50" />
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                            or
                          </span>
                          <div className="h-[1px] flex-grow bg-gray-50" />
                        </div>

                        <button
                          onClick={() => {
                            window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
                          }}
                          className={`w-full h-[50px] flex items-center justify-center gap-4 ${roundedClass} border border-gray-100 bg-white hover:bg-gray-50 transition-all active:scale-[0.98] group relative overflow-hidden shadow-sm`}
                        >
                          <svg
                            className="w-5 h-5 flex-shrink-0"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary">
                            Continue with Google
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;
