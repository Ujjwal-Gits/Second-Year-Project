import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import HamroLogo from "../assets/HamroLogo.png";

const ContactUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [copied, setCopied] = useState(null);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const contacts = [
    {
      key: "email",
      icon: "mail",
      label: "Email",
      value: "work@ujjwalrupakheti.com.np",
      action: () => window.open("mailto:work@ujjwalrupakheti.com.np"),
      copyValue: "work@ujjwalrupakheti.com.np",
    },
    {
      key: "phone",
      icon: "phone",
      label: "Phone / WhatsApp",
      value: "+977 9826304766",
      action: () => window.open("tel:+9779826304766"),
      copyValue: "+9779826304766",
    },
    {
      key: "location",
      icon: "location_on",
      label: "Location",
      value: "Kathmandu, Nepal",
      action: () => window.open("https://maps.google.com/?q=Kathmandu,Nepal"),
      copyValue: "Kathmandu, Nepal",
    },
    {
      key: "website",
      icon: "language",
      label: "Website",
      value: "hamroyatra.ujjwalrupakheti.com.np",
      action: () => window.open("https://hamroyatra.ujjwalrupakheti.com.np"),
      copyValue: "https://hamroyatra.ujjwalrupakheti.com.np",
    },
  ];

  const faqs = [
    {
      q: "How do I register my travel agency?",
      a: "Go to the Verification page and submit your company documents. Our team reviews within 2–5 business days.",
    },
    {
      q: "How do I book a trekking package?",
      a: "Browse the Explore page, select a package, and fill in the booking form. The agency will confirm your booking.",
    },
    {
      q: "Is HamroYatra free to use for travellers?",
      a: "Yes, browsing and booking on HamroYatra is completely free for travellers.",
    },
    {
      q: "How do I report a problem with an agency?",
      a: "Email us at work@ujjwalrupakheti.com.np with your booking details and we will investigate promptly.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-display">
      <SEO
        title="Contact Us | HamroYatra Nepal Travel Platform"
        description="Get in touch with HamroYatra. Contact us for travel inquiries, agency verification, partnerships or support. Email: work@ujjwalrupakheti.com.np | Phone: +977 9826304766"
        keywords="contact HamroYatra, Nepal travel platform contact, HamroYatra support, travel agency Nepal contact"
        canonical="/contact"
        schema={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact HamroYatra",
          url: "https://hamroyatra.ujjwalrupakheti.com.np/contact",
          mainEntity: {
            "@type": "Organization",
            name: "HamroYatra",
            email: "work@ujjwalrupakheti.com.np",
            telephone: "+9779826304766",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Kathmandu",
              addressCountry: "NP",
            },
          },
        }}
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
            Get In Touch
          </p>
          <h1 className="text-[32px] md:text-[42px] font-black tracking-tight leading-none mb-4">
            Contact Us
          </h1>
          <p className="text-white/50 text-[13px] font-light max-w-xl leading-relaxed">
            Have a question, want to list your agency, or need support? We're
            here to help.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-16 space-y-8">
        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contacts.map((c, i) => (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-icons text-primary text-[20px]">
                  {c.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                  {c.label}
                </p>
                <p className="text-[13px] font-bold text-[#0D1F18] truncate">
                  {c.value}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => copy(c.copyValue, c.key)}
                  className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-all"
                  title="Copy"
                >
                  <span className="material-icons text-[14px]">
                    {copied === c.key ? "check" : "content_copy"}
                  </span>
                </button>
                <button
                  onClick={c.action}
                  className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                  title="Open"
                >
                  <span className="material-icons text-[14px]">
                    open_in_new
                  </span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Response time note */}
        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center shrink-0">
            <span className="material-icons text-[#C5A059] text-[18px]">
              schedule
            </span>
          </div>
          <div>
            <p className="text-[12px] font-black text-[#0D1F18] uppercase tracking-widest mb-1">
              Response Time
            </p>
            <p className="text-[12px] text-gray-500 font-light leading-relaxed">
              We typically respond to emails within{" "}
              <strong className="text-[#0D1F18] font-bold">24 hours</strong> on
              business days. For urgent matters, call or WhatsApp us directly at{" "}
              <strong className="text-[#0D1F18] font-bold">
                +977 9826304766
              </strong>
              .
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
          <h2 className="text-[15px] font-black text-[#0D1F18] uppercase tracking-[0.15em] mb-6 pb-2 border-b border-gray-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((f, i) => (
              <div key={i}>
                <p className="text-[12px] font-black text-[#0D1F18] mb-1.5">
                  {f.q}
                </p>
                <p className="text-[12px] text-gray-500 font-light leading-relaxed">
                  {f.a}
                </p>
                {i < faqs.length - 1 && (
                  <div className="mt-6 border-b border-gray-50" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-[#0D1F18] rounded-2xl p-10">
          <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.3em] mb-4">
            Quick Links
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Explore Packages", path: "/explore", icon: "explore" },
              {
                label: "Verified Partners",
                path: "/partners",
                icon: "verified",
              },
              {
                label: "Become a Partner",
                path: "/verification",
                icon: "fact_check",
              },
              { label: "Plan My Trip", path: "/plan", icon: "map" },
            ].map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 hover:border-primary/40 hover:bg-primary/10 transition-all text-center"
              >
                <span className="material-icons text-white/40 text-[20px]">
                  {l.icon}
                </span>
                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest leading-tight">
                  {l.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
