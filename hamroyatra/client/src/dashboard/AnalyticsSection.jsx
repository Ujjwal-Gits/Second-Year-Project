import React, { useState } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";

const StatCard = ({
  icon,
  label,
  value,
  change,
  color = "green",
  index = 0,
}) => {
  const isPositive = parseFloat(change) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white rounded-[24px] p-4 lg:p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-emerald-100 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F7F6F3] group-hover:bg-primary/5 transition-colors">
          <span className="material-icons text-[18px] text-primary">
            {icon}
          </span>
        </div>
        {change !== null && change !== undefined && (
          <span
            className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="mt-4 lg:mt-6">
        <p className="text-[9px] lg:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
          {label}
        </p>
        <div className="flex items-baseline gap-1 mt-1.5">
          <p className="text-[15px] lg:text-[22px] font-black text-[#0D1F18] tracking-tighter tabular-nums truncate">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const AnalyticsSection = ({
  analytics,
  bookings,
  listings,
  loading,
  onRefresh,
}) => {
  const [revenueRange, setRevenueRange] = useState("12w");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">
            Loading Analytics...
          </p>
        </div>
      </div>
    );
  }

  // Build chart data from daily revenue
  const dailyData = analytics?.revenueDaily || [];
  const buildChartData = () => {
    const daysToShow =
      revenueRange === "1w" ? 7 : revenueRange === "4w" ? 30 : 90;
    const labels = [];
    const revenues = [];
    const dataMap = {};

    // Helper to get YYYY-MM-DD for local date
    const formatDateKey = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    // Build a map of existing data for quick lookup
    dailyData.forEach((d) => {
      // d.day is "2026-02-21T00:00:00.000Z" (UTC midnight from DB)
      const date = new Date(d.day);
      const dateKey = formatDateKey(date);
      dataMap[dateKey] = (dataMap[dateKey] || 0) + parseFloat(d.revenue || 0);
    });

    // Generate the last N days
    const today = new Date();
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const dateKey = formatDateKey(d);

      labels.push(label);
      revenues.push(dataMap[dateKey] || 0);
    }

    return { labels, revenues };
  };
  const { labels, revenues } = buildChartData();

  const lineChartData = {
    labels,
    datasets: [
      {
        label: "Revenue (NPR)",
        data: revenues,
        borderColor: "#1D7447",
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 250);
          g.addColorStop(0, "rgba(29,116,71,0.15)");
          g.addColorStop(1, "rgba(29,116,71,0)");
          return g;
        },
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#1D7447",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0D1F18",
        titleColor: "#C5A059",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: "Inter", size: 10, weight: "bold" },
        bodyFont: { family: "Inter", size: 12, weight: "bold" },
        callbacks: {
          label: (ctx) => ` NPR ${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 1000,
        grid: {
          color: "rgba(0,0,0,0.04)",
          drawBorder: false,
          borderDash: [5, 5],
        },
        ticks: {
          color: "#9CA3AF",
          autoSkip: true,
          maxTicksLimit: 7,
          font: { family: "Inter", size: 10 },
          callback: (v) => {
            if (v === 0) return "NPR 0";
            if (v < 1) return ""; // Hide fractional ticks below 1
            if (v >= 1000) {
              return `NPR ${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
            }
            return `NPR ${Math.round(v)}`;
          },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: "#9CA3AF",
          font: { family: "Inter", size: 10 },
          autoSkip: true,
          maxTicksLimit: revenueRange === "12w" ? 12 : 7,
        },
      },
    },
  };

  // Doughnut for booking types
  const byType = analytics?.bookingsByType || [];
  const typeMap = { room: "#1D7447", package: "#C5A059", guide: "#0D1F18" };
  const doughnutData = {
    labels: byType.map(
      (t) => t.bookingType?.charAt(0).toUpperCase() + t.bookingType?.slice(1),
    ),
    datasets: [
      {
        data: byType.map((t) => parseInt(t.count)),
        backgroundColor: byType.map((t) => typeMap[t.bookingType] || "#9CA3AF"),
        borderWidth: 0,
        hoverOffset: 0,
      },
    ],
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0D1F18",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: () => "",
          label: (item) => {
            const total = item.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((item.raw / total) * 100).toFixed(1);
            return ` ${item.label}: ${item.raw} (${percentage}%)`;
          },
        },
      },
    },
    layout: {
      padding: 10,
    },
  };

  const totalRevenue = analytics?.totalRevenue || 0;
  const totalBookings = analytics?.totalBookings || 0;
  const thisMonth = analytics?.thisMonthRevenue || 0;
  const totalListings = listings?.length || 0;

  const recentBookings = analytics?.recentBookings || [];

  // ── Dynamic percentage changes ──────────────────────────────
  // Calculate last month's revenue from dailyData
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  let lastMonthRevenue = 0;
  dailyData.forEach((d) => {
    const date = new Date(d.day);
    if (date >= lastMonthStart && date <= lastMonthEnd) {
      lastMonthRevenue += parseFloat(d.revenue || 0);
    }
  });

  const calcChange = (current, previous) => {
    if (previous === 0 && current === 0) return null; // no data at all
    if (previous === 0) return null; // can't compute % from zero base
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
  };

  // This month vs last month revenue change
  const thisMonthChange = calcChange(thisMonth, lastMonthRevenue);

  // Total revenue: compare last 30 days vs prior 30 days
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(now.getDate() - 60);
  let last30Rev = 0,
    prior30Rev = 0;
  dailyData.forEach((d) => {
    const date = new Date(d.day);
    if (date >= thirtyDaysAgo) last30Rev += parseFloat(d.revenue || 0);
    else if (date >= sixtyDaysAgo) prior30Rev += parseFloat(d.revenue || 0);
  });
  const totalRevenueChange = calcChange(last30Rev, prior30Rev);

  // Bookings: compare last 30 days vs prior 30 days using recentBookings count
  const last30Bookings = (analytics?.recentBookings || []).filter(
    (b) => new Date(b.createdAt) >= thirtyDaysAgo,
  ).length;
  // Use bookingsByType total as a proxy for prior period if recentBookings is limited
  const bookingsChange =
    totalBookings > 0
      ? calcChange(last30Bookings, totalBookings - last30Bookings)
      : null;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <StatCard
          index={0}
          icon="receipt_long"
          label="Total Bookings"
          value={totalBookings.toLocaleString()}
          change={bookingsChange}
        />
        <StatCard
          index={1}
          icon="payments"
          label="Revenue (k)"
          value={`NPR ${(totalRevenue / 1000).toFixed(1)}k`}
          change={totalRevenueChange}
        />
        <StatCard
          index={2}
          icon="calendar_today"
          label="This Month"
          value={`NPR ${(thisMonth / 1000).toFixed(1)}k`}
          change={thisMonthChange}
        />
        <StatCard
          index={3}
          icon="add_business"
          label="Listings"
          value={totalListings}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-5 lg:p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[10px] lg:text-[11px] font-black text-[#0D1F18] uppercase tracking-[0.2em] leading-tight">
                Operational Revenue
              </h3>
              <p className="text-[8px] lg:text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                3-Month Trajectory Audit
              </p>
            </div>
            <div className="flex gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100">
              {["1w", "4w", "12w"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRevenueRange(r)}
                  className={`px-2 lg:px-3 py-1.5 rounded-lg text-[9px] lg:text-[10px] font-bold uppercase tracking-wider transition-all ${revenueRange === r ? "bg-primary text-white shadow-sm" : "text-gray-400"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-56 lg:h-64">
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </motion.div>

        {/* Doughnut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="mb-4 lg:mb-6">
            <h3 className="text-[10px] lg:text-[11px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">
              Service Mix
            </h3>
            <p className="text-[8px] lg:text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
              Global Allocation
            </p>
          </div>
          <div
            className="flex items-center justify-center"
            style={{ height: "140px" }}
          >
            {byType.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <p className="text-[11px] text-gray-300 font-semibold text-center">
                No data
                <br />
                available
              </p>
            )}
          </div>
          <div className="mt-5 space-y-2.5">
            {[
              { label: "Rooms", type: "room", color: "#1D7447" },
              { label: "Packages", type: "package", color: "#C5A059" },
              { label: "Guides", type: "guide", color: "#0D1F18" },
            ].map((item) => {
              const found = byType.find((t) => t.bookingType === item.type);
              return (
                <div
                  key={item.type}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-[11px] text-gray-500 font-medium">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#0D1F18]">
                    {found ? parseInt(found.count) : 0}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-5 lg:px-6 py-4 lg:py-5 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-[10px] lg:text-[11px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">
              Activity Ledger
            </h3>
            <p className="text-[8px] lg:text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
              Recent Transactions
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="text-gray-300 hover:text-primary transition-colors"
          >
            <span className="material-icons text-[16px] lg:text-[18px]">
              refresh
            </span>
          </button>
        </div>
        <div className="px-1 lg:p-0">
          {recentBookings.length > 0 ? (
            <>
              {/* Desktop View Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-6 py-3 text-left text-[9px] font-black text-gray-300 uppercase tracking-[0.15em]">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-[9px] font-black text-gray-300 uppercase tracking-[0.15em]">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-[9px] font-black text-gray-300 uppercase tracking-[0.15em]">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-[9px] font-black text-gray-300 uppercase tracking-[0.15em]">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-[9px] font-black text-gray-300 uppercase tracking-[0.15em]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b, i) => (
                      <tr
                        key={b.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[11px] font-black">
                              {b.guestName?.charAt(0) || "G"}
                            </div>
                            <div>
                              <p className="text-[12px] font-semibold text-[#0D1F18]">
                                {b.guestName}
                              </p>
                              <p className="text-[10px] text-gray-400 leading-none mt-1">
                                {b.guestEmail || "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <TypeBadge type={b.bookingType} />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[11px] font-bold text-[#0D1F18]">
                            {new Date(b.startDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[12px] font-black text-[#0D1F18]">
                            NPR{" "}
                            {parseFloat(b.totalAmount || 0).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Cards */}
              <div className="lg:hidden space-y-3">
                {recentBookings.map((b, i) => (
                  <div
                    key={b.id}
                    className="bg-gray-50/50 rounded-xl p-4 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0D1F18] text-white flex items-center justify-center text-[10px] font-black">
                          {b.guestName?.charAt(0) || "G"}
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-[#0D1F18] pr-2 truncate max-w-[120px]">
                            {b.guestName}
                          </p>
                          <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest leading-none mt-1">
                            Transaction Node
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-y-4">
                      <div>
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">
                          Operational Type
                        </p>
                        <TypeBadge type={b.bookingType} />
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">
                          Fiscal Value
                        </p>
                        <p className="text-[12px] font-black text-[#0D1F18]">
                          NPR {parseFloat(b.totalAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">
                          Temporal Key
                        </p>
                        <p className="text-[10px] font-bold text-gray-500">
                          {new Date(b.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <span className="material-icons text-4xl text-gray-200">
                receipt_long
              </span>
              <p className="text-[11px] text-gray-300 font-semibold mt-3 uppercase tracking-widest">
                No activity indexed
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const TypeBadge = ({ type }) => {
  const styles = {
    room: "bg-emerald-50 text-emerald-700",
    package: "bg-amber-50 text-amber-700",
    guide: "bg-slate-50 text-slate-700",
  };
  return (
    <span
      className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1.5 rounded-lg ${styles[type] || "bg-gray-50 text-gray-500"}`}
    >
      {type || "—"}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    confirmed: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    cancelled: "bg-red-50 text-red-600",
    completed: "bg-blue-50 text-blue-700",
  };
  return (
    <span
      className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1.5 rounded-lg ${styles[status] || "bg-gray-50 text-gray-500"}`}
    >
      {status || "confirmed"}
    </span>
  );
};

export default AnalyticsSection;
