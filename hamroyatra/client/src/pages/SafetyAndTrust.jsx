import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import HamroLogo from "../assets/HamroLogo.png";

const pillars = [
  {
    icon: "verified_user",
    title: "Document Verification",
    desc: "Every agency on HamroYatra submits government-issued documents — PAN card, citizenship, and company registration — before being listed. Our admin team manually reviews each submission.",
  },
  {
    icon: "fact_check",
    title: "Nepal Tourism Board Compliance",
    desc: "We only accept agencies registered with the Nepal Tourism Board (NTB) and the Trekking Agencies Association of Nepal (TAAN). Unregistered operators are rejected.",
  },
  {
    icon: "star_rate",
    title: "Real Traveller Reviews",
    desc: "Reviews on HamroYatra are submitted by verified travellers who have completed a booking. We do not allow anonymous or unverified reviews.",
  },
  {
    icon: "lock",
    title: "Secure Authentication",
    desc: "All accounts are protected with JWT-based authentication stored in secure HTTP-only cookies. Passwords are hashed with bcrypt. Google OAuth is available for added convenience.",
  },
  {
    icon: "support_agent",
    title: "Guide License Monitoring",
    desc: "Our system automatically monitors trekking guide certificates and alerts agencies 30 days before expiry — ensuring your guide is always legally certified.",
  },
  {
    icon: "gpp_good",
    title: "Verified Badge System",
    desc: "Only agencies that pass our full verification process receive the HamroYatra Verified badge. This badge is visible on every listing and profile.",
  },
];

const SafetyAndTrust = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-display">
      <SEO
        title="Safety & Trust | How HamroYatra Verifies Travel Partners"
        description="Learn how HamroYatra verifies every travel agency, trekking company and hotel in Nepal. Document checks, NTB compliance, real reviews and secure bookings."
        keywords="verified travel agency Nepal, safe trekking agency Nepal, trusted Nepal tour operator, Nepal travel safety, HamroYatra verification"
        canonical="/safety-and-trust"
      />

      {/* Header */}
      <div className="bg-[#0D1F18] text-white py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="flex items-center gap-3 mb-10 w-fit">
            <img
              src={HamroLogo}
              alt="HamroYatra"
              className="w-8 h-8 object-contain brightness-0 invert"
            />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60">
              HamroYatra
            </span>
          </Link>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059] mb-3">
            Platform Standards
          </p>
          <h1 className="text-[32px] md:text-[42px] font-black tracking-tight leading-none mb-4">
            Safety & Trust
          </h1>
          <p className="text-white/50 text-[13px] font-light max-w-xl leading-relaxed">
            Every partner on HamroYatra goes through a rigorous verification
            process. Here's exactly how we keep travellers safe.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Intro */}
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 mb-10">
          <h2 className="text-[15px] font-black text-[#0D1F18] uppercase tracking-[0.15em] mb-4 pb-2 border-b border-gray-100">
            Our Commitment
          </h2>
          <p className="text-[13px] text-gray-600 leading-relaxed font-light">
            HamroYatra was built on a single principle — travellers deserve to
            know exactly who they are booking with. Nepal's tourism industry is
            vibrant but unregulated in many areas. We exist to change that by
            creating a platform where every listed agency, hotel and trekking
            company has been independently verified by our team.
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed font-light mt-3">
            We do not charge agencies to get verified. Verification is a
            standard requirement for all partners — not a premium feature.
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 flex gap-5"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-icons text-primary text-[18px]">
                  {p.icon}
                </span>
              </div>
              <div>
                <h3 className="text-[12px] font-black text-[#0D1F18] uppercase tracking-widest mb-2">
                  {p.title}
                </h3>
                <p className="text-[12px] text-gray-500 leading-relaxed font-light">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Verification process steps */}
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 mb-10">
          <h2 className="text-[15px] font-black text-[#0D1F18] uppercase tracking-[0.15em] mb-6 pb-2 border-b border-gray-100">
            The Verification Process
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "01",
                title: "Register",
                desc: "Agency creates an account and submits basic company details.",
              },
              {
                step: "02",
                title: "Document Submission",
                desc: "PAN card, citizenship, company registration certificate and owner details are uploaded.",
              },
              {
                step: "03",
                title: "Admin Review",
                desc: "Our team manually reviews all documents within 2–5 business days.",
              },
              {
                step: "04",
                title: "Approval",
                desc: "Approved agencies receive the Verified badge and can start listing services.",
              },
              {
                step: "05",
                title: "Ongoing Monitoring",
                desc: "Guide licenses are monitored continuously. Any expired or suspicious activity triggers an alert.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-5 items-start">
                <span className="text-[11px] font-black text-[#C5A059] tracking-widest shrink-0 mt-0.5">
                  {s.step}
                </span>
                <div>
                  <p className="text-[12px] font-black text-[#0D1F18] uppercase tracking-wider mb-1">
                    {s.title}
                  </p>
                  <p className="text-[12px] text-gray-500 font-light leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#0D1F18] rounded-2xl p-10 text-center">
          <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.3em] mb-3">
            Ready to join?
          </p>
          <h3 className="text-white text-[22px] font-black tracking-tight mb-3">
            Become a Verified Partner
          </h3>
          <p className="text-white/40 text-[12px] font-light mb-6 max-w-sm mx-auto">
            Start the verification process and reach thousands of travellers
            looking for trusted Nepal experiences.
          </p>
          <Link
            to="/verification"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1D7447] transition-all"
          >
            Start Verification
            <span className="material-icons text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SafetyAndTrust;
