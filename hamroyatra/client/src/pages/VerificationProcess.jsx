import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomDropdown from "../components/CustomDropdown";
import SEO from "../components/SEO";

const SERVICE_TYPES = [
  { id: "hotel", label: "Hotel & Stays", icon: "hotel" },
  { id: "travel", label: "Travel & Tours", icon: "explore" },
  { id: "trekking", label: "Trekking & Outdoors", icon: "landscape" },
];

const VerificationProcess = ({ isAuthenticated, user }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Keep for legacy if needed elsewhere
  const isUpgrade = Boolean(isAuthenticated);

  useEffect(() => {
    // Only redirect if we ARE NOT authenticated and we finished app initialization
    if (isAuthenticated === false) {
      // Maybe wait a bit or check a global loading state
      // For now, let's just assume if it's explicitly false, we redirect
      navigate("/login", { state: { from: "/become-partner" } });
    }
  }, [isAuthenticated, navigate]);

  const [step, setStep] = useState(isUpgrade ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [companyNameLocked, setCompanyNameLocked] = useState(true);
  const [locationLocked, setLocationLocked] = useState(true);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    password: "",
    legalCompanyName: user?.companyName || "",
    location: user?.location || "",
    phoneNo: "",
    companyOwner: user?.fullName || "",
    ownerContactNo: user?.contactNumber || "",
    panNumber: "",
    gender: "male",
    serviceTypes: [],
    panImage: null,
    citizenshipFrontImage: null,
    citizenshipBackImage: null,
    citizenshipNumber: "",
    citizenshipDistrict: "",
    citizenshipIssueDate: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        companyOwner: user.fullName || prev.companyOwner,
        ownerContactNo: user.contactNumber || prev.ownerContactNo,
        legalCompanyName: user.companyName || prev.legalCompanyName,
        location: user.location || prev.location,
      }));
      // Lock fields if they already have a value from profile
      if (user.companyName) setCompanyNameLocked(true);
      if (user.location) setLocationLocked(true);
      // Automate flow for authenticated users
      if (step === 1) setStep(2);
    }
  }, [user, step]);

  const [previews, setPreviews] = useState({
    pan: null,
    citizenshipFront: null,
    citizenshipBack: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleServiceType = (typeId) => {
    setFormData((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(typeId)
        ? prev.serviceTypes.filter((t) => t !== typeId)
        : [...prev.serviceTypes, typeId],
    }));
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewKey =
        field === "panImage"
          ? "pan"
          : field === "citizenshipFrontImage"
            ? "citizenshipFront"
            : "citizenshipBack";
      setPreviews((prev) => ({ ...prev, [previewKey]: reader.result }));
    };
    reader.readAsDataURL(file);

    // Upload to server
    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/dashboard/upload`,
        uploadData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setFormData((prev) => ({ ...prev, [field]: res.data.url }));
    } catch (err) {
      setError("Image upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      // validate step 2 before proceeding
      if (step === 2) {
        if (!formData.legalCompanyName?.trim())
          return setError(
            "Company name is required. Please enter your registered business name.",
          );
        if (!formData.location?.trim())
          return setError("Location is required.");
        if (formData.serviceTypes.length === 0)
          return setError("Please select at least one service type.");
        setError(null);
      }
      return setStep(step + 1);
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        companyName: formData.legalCompanyName,
        verificationStatus: "pending",
        citizenshipImage: formData.citizenshipFrontImage,
      };

      if (isUpgrade) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/dashboard/profile`,
          payload,
          { withCredentials: true },
        );
        setSuccess(true);
        setTimeout(() => navigate("/dashboard"), 3000);
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/register/agent`,
          payload,
        );
        if (res.status === 201) {
          setSuccess(true);
          setTimeout(() => navigate("/login"), 3000);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Submission failed. Please check your data.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Only render nothingness if we are still verifying session (App.jsx starts it as null)
  if (isAuthenticated === null) return null;

  return (
    <div className="min-h-screen bg-[#FBFBFB] pt-32 pb-24 px-4 lg:px-8 font-display selection:bg-primary/10">
      <SEO
        title="List Your Travel Agency on HamroYatra | Become a Verified Partner"
        description="Register your trekking agency, travel company or hotel on HamroYatra. Get verified, reach thousands of travellers and grow your bookings."
        keywords="list trekking agency Nepal, register travel agency Nepal, Nepal travel platform for agents, get more bookings Nepal travel, verified travel partner Nepal"
        canonical="/verification"
      />
      <div className="max-w-[1000px] mx-auto space-y-12">
        {/* Intro Section / SEO Blog */}
        <div className="bg-white p-8 lg:p-12 border border-gray-100 shadow-sm rounded-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          <h1 className="text-3xl lg:text-4xl font-black text-[#0D1F18] tracking-tight uppercase mb-4">
            Verification Process
          </h1>
          <p className="text-lg font-bold text-gray-800 mb-8">
            Building Trust in Nepal's Elite Tourism Ecosystem.
          </p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-6 mb-10">
            <p className="text-sm font-medium leading-relaxed">
              At Hamroyatra, the cornerstone of our platform is trust. We
              strictly enforce a protocol wherein only fully verified agency
              nodes and hoteliers are permitted to leverage our elite channels.
              This is not simply a metric of quality control — it ensures that
              when a traveler engages with a <strong>Verified Partner</strong>,
              they are engaging with a legally compliant, highly reputable
              Nepalese business.
            </p>

            <h2 className="text-xl font-bold text-[#0D1F18] uppercase tracking-wide mt-6 mb-3">
              Why Become a Verified Partner?
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm font-medium">
              <li>
                <strong>Unmatched Visibility:</strong> Gain priority placement
                across our ecosystem and directly bypass the noise.
              </li>
              <li>
                <strong>Trust Signaling:</strong> The "Verified Partner" badge
                instantly boosts traveler confidence and increases conversion
                rates.
              </li>
              <li>
                <strong>Exclusive Channels:</strong> Only verified partners are
                permitted to run targeted Advertisement Listing Campaigns.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-[#0D1F18] uppercase tracking-wide mt-6 mb-3">
              Compliance & Documentation
            </h2>
            <p className="text-sm font-medium leading-relaxed">
              The verification process includes rigorous background checks,
              document verification, and operational audits. Our team
              cross-references your PAN/VAT details, citizenship information,
              and local incorporation certificates with regional and national
              registries to protect the integrity of the ecosystem.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-5 flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-icons text-emerald-600 text-[16px]">
                info
              </span>
            </div>
            <div>
              <p className="text-emerald-800 font-black text-sm uppercase tracking-wide mb-1">
                Critical Notice
              </p>
              <p className="text-emerald-700/80 text-[12px] font-bold leading-relaxed">
                You must naturally register your name as an agent to verify your
                company. All submitted identification and corporate documents
                must unequivocally trace back to the accountable person's
                identity.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[580px] mx-auto">
          <div
            className="bg-white border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] overflow-hidden rounded-sm relative"
            id="registration-form"
          >
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Form Header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-50 bg-[#FBFBFB]/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold text-primary tracking-tight">
                    Partner Registration
                  </h1>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mt-1">
                    Verification & Compliance
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 border ${step >= s ? "bg-primary text-white border-primary" : "bg-white text-gray-300 border-gray-200"}`}
                      >
                        {s}
                      </div>
                      {s < 3 && (
                        <div
                          className={`w-4 h-[1px] mx-1 transition-colors duration-500 ${step > s ? "bg-primary" : "bg-gray-100"}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-16 flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 bg-emerald-50 rounded-sm flex items-center justify-center mb-6 border border-emerald-100 text-emerald-500">
                    <span className="material-icons text-3xl">
                      check_circle
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-primary mb-2">
                    Application Received
                  </h2>
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest max-w-[300px] leading-relaxed">
                    Our team will verify your details within 24-48 hours.
                    Redirecting you shortly...
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-50 rounded-sm border border-red-100 flex items-center gap-3"
                    >
                      <span className="material-icons text-red-500 text-lg">
                        error_outline
                      </span>
                      <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest leading-none">
                        {error}
                      </p>
                    </motion.div>
                  )}

                  <div className="min-h-[280px]">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1 font-display">
                              Accountable Person
                            </label>
                            <input
                              required
                              name="companyOwner"
                              value={formData.companyOwner}
                              onChange={handleInputChange}
                              className="w-full h-11 bg-white border border-gray-200 rounded-md px-4 text-[12px] font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-primary"
                              placeholder="Full legal name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                              Primary Phone
                            </label>
                            <input
                              required
                              name="ownerContactNo"
                              value={formData.ownerContactNo}
                              onChange={handleInputChange}
                              className="w-full h-11 bg-white border border-gray-200 rounded-md px-4 text-[12px] font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-primary"
                              placeholder="Contact number"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                              Gender Identification
                            </label>
                            <CustomDropdown
                              options={[
                                { value: "male", label: "Male" },
                                { value: "female", label: "Female" },
                                { value: "other", label: "Other" },
                              ]}
                              value={formData.gender}
                              onChange={(val) =>
                                setFormData((p) => ({ ...p, gender: val }))
                              }
                              placeholder="Select Gender"
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                              Official Email
                            </label>
                            <input
                              required
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full h-11 bg-white border border-gray-200 rounded-sm px-4 text-[12px] font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-primary"
                            />
                          </div>
                        </div>
                        {!isUpgrade && (
                          <div className="space-y-2 pt-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                              Secure Password
                            </label>
                            <input
                              required
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="w-full h-11 bg-white border border-gray-200 rounded-sm px-4 text-[12px] font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-primary"
                              placeholder="••••••••"
                            />
                          </div>
                        )}
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-7"
                      >
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                            Registered Business Name
                          </label>
                          <div className="relative">
                            <input
                              required
                              name="legalCompanyName"
                              value={formData.legalCompanyName}
                              onChange={handleInputChange}
                              readOnly={companyNameLocked}
                              className={`w-full h-11 border rounded-sm px-4 pr-12 text-[12px] font-bold outline-none transition-all text-primary ${
                                companyNameLocked
                                  ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-white border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/5"
                              }`}
                              placeholder="E.g. Travel Nepal Pvt. Ltd."
                            />
                            <button
                              type="button"
                              onClick={() => setCompanyNameLocked((l) => !l)}
                              title={
                                companyNameLocked
                                  ? "Click to edit"
                                  : "Lock field"
                              }
                              className={`absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md transition-all ${
                                companyNameLocked
                                  ? "text-gray-300 hover:text-primary"
                                  : "text-primary"
                              }`}
                            >
                              <span className="material-icons text-[15px]">
                                {companyNameLocked ? "edit" : "lock_open"}
                              </span>
                            </button>
                          </div>
                          {companyNameLocked && formData.legalCompanyName && (
                            <p className="text-[9px] font-bold text-gray-300 pl-1 uppercase tracking-widest">
                              Pre-filled from your profile — click{" "}
                              <span className="material-icons text-[10px] align-middle">
                                edit
                              </span>{" "}
                              to change
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                              Location
                            </label>
                            <div className="relative">
                              <input
                                required
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                readOnly={locationLocked}
                                className={`w-full h-11 border rounded-sm px-4 pr-12 text-[12px] font-bold outline-none transition-all text-primary ${
                                  locationLocked
                                    ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/5"
                                }`}
                                placeholder="City, District"
                              />
                              <button
                                type="button"
                                onClick={() => setLocationLocked((l) => !l)}
                                title={
                                  locationLocked
                                    ? "Click to edit"
                                    : "Lock field"
                                }
                                className={`absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md transition-all ${
                                  locationLocked
                                    ? "text-gray-300 hover:text-primary"
                                    : "text-primary"
                                }`}
                              >
                                <span className="material-icons text-[15px]">
                                  {locationLocked ? "edit" : "lock_open"}
                                </span>
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                              Business Hotline
                            </label>
                            <input
                              required
                              name="phoneNo"
                              value={formData.phoneNo}
                              onChange={handleInputChange}
                              className="w-full h-11 bg-white border border-gray-200 rounded-sm px-4 text-[12px] font-bold outline-none focus:border-primary transition-all text-primary"
                              placeholder="Office Phone"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                            Service Specialization
                          </label>
                          <div className="grid grid-cols-3 gap-4">
                            {SERVICE_TYPES.map((type) => (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => toggleServiceType(type.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-sm border transition-all duration-300 ${formData.serviceTypes.includes(type.id) ? "bg-primary text-white border-primary shadow-md shadow-primary/10" : "bg-gray-50/50 text-gray-400 border-gray-100 hover:border-primary/20 hover:bg-white"}`}
                              >
                                <span className="material-icons text-xl mb-2">
                                  {type.icon}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-widest">
                                  {type.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-7"
                      >
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                              Citizenship No.
                            </label>
                            <input
                              required
                              name="citizenshipNumber"
                              value={formData.citizenshipNumber}
                              onChange={handleInputChange}
                              className="w-full h-11 bg-white border border-gray-200 rounded-sm px-3 text-[12px] font-bold outline-none focus:border-primary transition-all text-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                              Issue District
                            </label>
                            <input
                              required
                              name="citizenshipDistrict"
                              value={formData.citizenshipDistrict}
                              onChange={handleInputChange}
                              className="w-full h-11 bg-white border border-gray-200 rounded-sm px-3 text-[12px] font-bold outline-none focus:border-primary transition-all text-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                              Issue Date
                            </label>
                            <input
                              required
                              type="date"
                              name="citizenshipIssueDate"
                              value={formData.citizenshipIssueDate}
                              onChange={handleInputChange}
                              className="w-full h-11 bg-white border border-gray-200 rounded-sm px-3 text-[12px] font-bold outline-none focus:border-primary transition-all text-primary"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                              9-Digit PAN Number
                            </label>
                            <input
                              required
                              name="panNumber"
                              value={formData.panNumber}
                              onChange={handleInputChange}
                              className="w-full h-11 bg-white border border-gray-200 rounded-sm px-4 text-[12px] font-bold outline-none focus:border-primary transition-all text-primary"
                              placeholder="Enter PAN"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                              PAN Certificate
                            </label>
                            <label className="w-full h-11 bg-gray-50 border border-dashed border-gray-200 rounded-sm flex items-center justify-center cursor-pointer hover:bg-white hover:border-primary/30 transition-all overflow-hidden relative">
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileChange(e, "panImage")
                                }
                              />
                              {previews.pan ? (
                                <div className="flex items-center gap-2 text-emerald-600">
                                  <span className="material-icons text-sm">
                                    task_alt
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-widest">
                                    Uploaded
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-gray-400">
                                  <span className="material-icons text-sm">
                                    cloud_upload
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-widest">
                                    Upload File
                                  </span>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-50">
                          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                            Proof of Identity (Citizenship)
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              "citizenshipFrontImage",
                              "citizenshipBackImage",
                            ].map((field, i) => (
                              <label
                                key={field}
                                className="w-full h-28 bg-gray-50 border border-dashed border-gray-200 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-primary/20 transition-all overflow-hidden relative group"
                              >
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => handleFileChange(e, field)}
                                />
                                {previews[
                                  field === "citizenshipFrontImage"
                                    ? "citizenshipFront"
                                    : "citizenshipBack"
                                ] ? (
                                  <img
                                    src={
                                      previews[
                                        field === "citizenshipFrontImage"
                                          ? "citizenshipFront"
                                          : "citizenshipBack"
                                      ]
                                    }
                                    className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                                    alt="Preview"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center gap-1 text-gray-300 group-hover:text-primary transition-colors">
                                    <span className="material-icons text-xl">
                                      add_a_photo
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest">
                                      {i === 0 ? "Front View" : "Back View"}
                                    </span>
                                  </div>
                                )}
                                {previews[
                                  field === "citizenshipFrontImage"
                                    ? "citizenshipFront"
                                    : "citizenshipBack"
                                ] && (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-primary text-white text-[9px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest shadow-lg">
                                      Change File
                                    </span>
                                  </div>
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        step > (isUpgrade ? 2 : 1)
                          ? setStep(step - 1)
                          : navigate(-1)
                      }
                      className="px-6 py-2.5 text-[11px] font-bold text-gray-400 hover:text-primary uppercase tracking-[0.1em] transition-all rounded-sm flex items-center gap-2 group"
                    >
                      <span className="material-icons text-[14px] group-hover:-translate-x-1 transition-transform">
                        arrow_back
                      </span>
                      {step === (isUpgrade ? 2 : 1) ? "Cancel" : "Go Back"}
                    </button>
                    <button
                      type="submit"
                      className="px-10 py-3 bg-primary text-white rounded-sm text-[11px] font-bold uppercase tracking-[0.15em] hover:opacity-90 hover:shadow-xl hover:shadow-primary/10 transition-all active:scale-[0.98] flex items-center gap-3"
                    >
                      {step === 3 ? "Complete Registration" : "Next Step"}
                      <span className="material-icons text-sm">
                        {step === 3 ? "verified" : "arrow_forward"}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-8 text-center text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
            HamroYatra ensures compliance through strict regulatory oversight.
            Your data is encrypted at rest.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationProcess;
