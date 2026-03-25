// This is the PlanPage — the AI-powered trip planning chat interface.
// Only logged-in users can access it. It sends messages to the Gemini AI via the backend,
// renders clickable listing/agent links inline in the chat, and shows remaining daily message count.

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "../components/SEO";

const API = import.meta.env.VITE_API_URL;

function parseAIMessage(text) {
  const parts = [];
  const regex = /\[\[(LISTING|AGENT):([^\|]+)\|([^\]]+)\]\]/g;
  let last = 0,
    m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last)
      parts.push({ type: "text", content: text.slice(last, m.index) });
    parts.push({
      type: m[1] === "LISTING" ? "listing_link" : "agent_link",
      id: m[2],
      label: m[3],
      href: m[1] === "LISTING" ? `/explore/${m[2]}` : `/agent/${m[2]}`,
    });
    last = regex.lastIndex;
  }
  if (last < text.length)
    parts.push({ type: "text", content: text.slice(last) });
  return parts;
}

function Bubble({ msg, user }) {
  const isUser = msg.role === "user";
  const parts = parseAIMessage(msg.content);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white text-[12px] font-bold mt-0.5"
        style={{
          background: isUser
            ? "#0D1F18"
            : "linear-gradient(135deg,#1D7447,#0D3D22)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        {isUser ? (
          (user?.fullName?.[0] || "U").toUpperCase()
        ) : (
          <span className="material-icons" style={{ fontSize: 14 }}>
            auto_awesome
          </span>
        )}
      </div>
      <div
        className={`max-w-[80%] px-4 py-3 text-[13.5px] leading-[1.8] ${
          isUser
            ? "bg-[#0D1F18] text-white rounded-[18px_4px_18px_18px]"
            : "bg-white text-gray-700 border border-gray-100 rounded-[4px_18px_18px_18px] shadow-sm"
        }`}
      >
        {parts.map((p, i) => {
          if (p.type === "listing_link")
            return (
              <Link
                key={i}
                to={p.href}
                className="text-primary font-semibold underline underline-offset-2 hover:text-[#155c38] transition-colors"
              >
                {p.label}
              </Link>
            );
          if (p.type === "agent_link")
            return (
              <Link
                key={i}
                to={p.href}
                className="text-[#C5A059] font-semibold underline underline-offset-2 hover:text-[#a8863d] transition-colors"
              >
                {p.label}
              </Link>
            );
          return (
            <span key={i}>
              {p.content.split("\n").map((line, li, arr) => {
                const isHeader = /^(Day \d+:|#{1,3} )/.test(line.trim());
                const bolds = line.split(/\*\*(.+?)\*\*/g);
                return (
                  <React.Fragment key={li}>
                    {isHeader ? (
                      <strong className="block mt-3 mb-1 text-[#0D1F18]">
                        {line.replace(/^#{1,3} /, "")}
                      </strong>
                    ) : (
                      bolds.map((b, bi) =>
                        bi % 2 === 1 ? <strong key={bi}>{b}</strong> : b,
                      )
                    )}
                    {li < arr.length - 1 && !isHeader && <br />}
                  </React.Fragment>
                );
              })}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-3">
      <div
        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#1D7447,#0D3D22)" }}
      >
        <span className="material-icons text-white" style={{ fontSize: 14 }}>
          auto_awesome
        </span>
      </div>
      <div className="bg-white border border-gray-100 rounded-[4px_18px_18px_18px] px-4 py-3 flex items-center gap-1.5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-gray-300 block"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

const CARDS = [
  {
    icon: "terrain",
    title: "Trek Planning",
    prompt: "How do I plan the Annapurna Circuit trek?",
  },
  {
    icon: "hotel",
    title: "Hotel Finder",
    prompt: "Best budget hotels in Pokhara under NPR 2000",
  },
  {
    icon: "explore",
    title: "Tour Packages",
    prompt: "Show me the best tour packages in Nepal",
  },
  {
    icon: "calendar_month",
    title: "Trip Planner",
    prompt: "Plan a 7-day Nepal trip itinerary for me",
  },
  {
    icon: "savings",
    title: "Budget Travel",
    prompt: "Best trekking packages under NPR 5000",
  },
  {
    icon: "forest",
    title: "Wildlife & Nature",
    prompt: "Wildlife safari options in Chitwan National Park",
  },
  {
    icon: "temple_hindu",
    title: "Cultural Tours",
    prompt: "Best cultural and heritage tours in Kathmandu Valley",
  },
  {
    icon: "wb_sunny",
    title: "Best Season",
    prompt: "What is the best time of year to visit Nepal?",
  },
];

export default function PlanPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(null); // null = unknown yet
  const [started, setStarted] = useState(false);
  const endRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (promptText) => {
    const text = (promptText !== undefined ? promptText : input).trim();
    if (!text || loading) return;
    setInput("");
    if (taRef.current) taRef.current.style.height = "44px";
    if (!started) setStarted(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const { data } = await axios.post(
        `${API}/api/plan/chat`,
        { message: text, history },
        { withCredentials: true },
      );
      if (data.remaining !== undefined) setRemaining(data.remaining);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          listingRefs: data.listingRefs || {},
        },
      ]);
    } catch (err) {
      const errText =
        err.response?.data?.error || "Connection issue. Please try again.";
      if (err.response?.status === 429) setRemaining(0);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${errText}`, listingRefs: {} },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => taRef.current?.focus(), 80);
    }
  };

  const firstName = user?.fullName?.split(" ")[0] || "Traveller";

  return (
    // Full viewport, starts below navbar (navbar is fixed ~72px + py-8 = ~104px at top, ~88px when scrolled)
    // We use pt that accounts for the fixed navbar
    <div
      className="fixed inset-0 bg-[#F0F4F1] flex flex-col"
      style={{ paddingTop: "100px" }}
    >
      <SEO
        title="AI Trip Planner for Nepal | Plan Your Perfect Trek or Tour"
        description="Use HamroYatra's AI-powered trip planner to build your perfect Nepal itinerary. Get personalized recommendations for treks, hotels and tours."
        keywords="Nepal trip planner, plan Nepal trek, Nepal itinerary planner, AI travel planner Nepal, Nepal travel guide AI"
        canonical="/plan"
      />
      {/* ── Card container ── */}
      <div className="flex-1 flex flex-col min-h-0 max-w-[1100px] w-full mx-auto px-4 pb-4">
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
          {/* Card header */}
          <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg,#1D7447,#0D3D22)",
                boxShadow: "0 4px 12px rgba(29,116,71,0.2)",
              }}
            >
              <span
                className="material-icons text-white"
                style={{ fontSize: 16 }}
              >
                auto_awesome
              </span>
            </div>
            <div>
              <h1 className="text-[14px] font-bold text-[#0D1F18] leading-tight">
                HamroYatra AI
              </h1>
              <p className="text-[11px] text-gray-400">
                Your Nepal travel planning assistant
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-gray-400 font-medium">
                Online
              </span>
            </div>
          </div>

          {/* ── Scrollable messages area ── */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 flex flex-col gap-4">
            {/* Welcome state */}
            {!started && (
              <div className="flex flex-col gap-5">
                <div className="text-center pt-2">
                  <p className="text-[22px] font-bold text-[#0D1F18] leading-tight">
                    Plan your Nepal trip, {firstName}
                  </p>
                  <p className="text-[13px] text-gray-400 mt-1.5">
                    Ask me about treks, hotels, itineraries, budgets, or best
                    seasons.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CARDS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => send(c.prompt)}
                      className="text-left p-4 rounded-xl border border-gray-100 bg-[#F7F6F3] hover:border-primary/30 hover:bg-[#edf7f2] transition-all duration-200 group cursor-pointer"
                    >
                      <span className="material-icons text-gray-300 group-hover:text-primary text-[20px] mb-2 block transition-colors">
                        {c.icon}
                      </span>
                      <p className="text-[12px] font-semibold text-[#0D1F18] mb-0.5">
                        {c.title}
                      </p>
                      <p className="text-[11px] text-gray-400 leading-snug">
                        {c.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <Bubble key={idx} msg={msg} user={user} />
            ))}

            {loading && <TypingDots />}
            <div ref={endRef} />
          </div>

          {/* ── Input bar — pinned inside card at bottom ── */}
          <div className="shrink-0 px-5 py-2.5 border-t border-gray-100 bg-white">
            {remaining !== null && (
              <p
                className={`text-[10px] mb-1.5 text-right font-medium ${remaining <= 3 ? "text-red-400" : "text-gray-400"}`}
              >
                {remaining === 0
                  ? "Daily limit reached"
                  : `${remaining} messages left today`}
              </p>
            )}
            <div
              className="flex items-center gap-3 bg-[#F7F6F3] rounded-xl border border-gray-200 px-3 py-1.5
              focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(29,116,71,0.08)] transition-all duration-200"
            >
              <textarea
                ref={taRef}
                value={input}
                rows={1}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 46) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask about treks, hotels, itineraries, best seasons..."
                disabled={loading || remaining === 0}
                className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-gray-800 placeholder:text-gray-400 resize-none leading-relaxed overflow-y-auto overflow-x-hidden scrollbar-hide disabled:opacity-50"
                style={{
                  maxHeight: 46,
                  minHeight: 22,
                  fontFamily: "inherit",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading || remaining === 0}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150 active:scale-95 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() && !loading ? "#1D7447" : "#e5e7eb",
                }}
              >
                <span
                  className="material-icons text-[15px]"
                  style={{
                    color: input.trim() && !loading ? "#fff" : "#9ca3af",
                  }}
                >
                  arrow_upward
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
