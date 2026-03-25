import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const StatCard = ({ icon, label, value, change, color = 'green', index = 0, onClick }) => {
    const isPositive = parseFloat(change) >= 0;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            className={`bg-white rounded-xl p-4 md:p-5 border border-gray-100 shadow-sm ${onClick ? 'cursor-pointer hover:border-primary/30 transition-all' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/8" style={{ background: 'rgba(29,116,71,0.08)' }}>
                    <span className="material-icons text-[18px] text-primary">{icon}</span>
                </div>
            </div>
            <div className="mt-3 md:mt-4">
                <p className="text-[8px] md:text-[10px] text-gray-400 font-semibold uppercase tracking-widest">{label}</p>
                <p className="text-[16px] md:text-2xl font-black text-[#0D1F18] mt-0.5 md:mt-1 tracking-tight">{value}</p>
            </div>
        </motion.div>
    );
};

const TravellerAnalytics = ({ 
    user, 
    activeTrip, setActiveTrip, 
    reviewingItem, setReviewingItem, 
    reviewText, setReviewText, 
    isEditingBudget, setIsEditingBudget, 
    budget, setBudget, 
    tempBudget, setTempBudget, 
    updateChecklist, startTrip 
}) => {
    const navigate = useNavigate();
    const [revenueRange, setRevenueRange] = useState('12w');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/dashboard/traveller/analytics`, { withCredentials: true });
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching stats:", err);
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-gray-100 border-t-[#0D1F18] rounded-full animate-spin" /></div>;
    }

    // Build chart data from daily revenue
    const buildChartData = () => {
        const daysToShow = revenueRange === '1w' ? 7 : revenueRange === '4w' ? 30 : 90;
        const labels = [];
        const revenues = [];
        const dataMap = {};

        // Helper to get YYYY-MM-DD for local date
        const formatDateKey = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        // Build a map of existing data for quick lookup
        const dailyData = stats.revenueDaily || [];
        dailyData.forEach(d => {
            const date = new Date(d.day);
            const dateKey = formatDateKey(date);
            dataMap[dateKey] = (dataMap[dateKey] || 0) + parseFloat(d.revenue || 0);
        });

        // Generate the last N days
        const today = new Date();
        for (let i = daysToShow - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const dateKey = formatDateKey(d);
            
            labels.push(label);
            revenues.push(dataMap[dateKey] || 0);
        }

        return { labels, revenues };
    };
    const { labels, revenues } = buildChartData();

    const trajectoryData = {
        labels,
        datasets: [{
            label: 'Expense (NPR)',
            data: revenues,
            borderColor: '#1D7447',
            backgroundColor: (ctx) => {
                const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 250);
                g.addColorStop(0, 'rgba(29,116,71,0.15)');
                g.addColorStop(1, 'rgba(29,116,71,0)');
                return g;
            },
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#1D7447',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0D1F18',
                titleColor: '#C5A059',
                bodyColor: '#fff',
                padding: 10,
                cornerRadius: 8,
                titleFont: { family: 'Inter', size: 10, weight: 'bold' },
                bodyFont: { family: 'Inter', size: 12, weight: 'bold' },
                callbacks: {
                    label: (ctx) => ` NPR ${ctx.parsed.y.toLocaleString()}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: 1000,
                grid: { 
                    color: 'rgba(0,0,0,0.04)', 
                    drawBorder: false,
                    borderDash: [5, 5]
                },
                ticks: {
                    color: '#9CA3AF',
                    autoSkip: true,
                    maxTicksLimit: 7,
                    font: { family: 'Inter', size: 10 },
                    callback: v => {
                        if (v === 0) return 'NPR 0';
                        if (v < 1) return ''; 
                        if (v >= 1000) {
                            return `NPR ${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
                        }
                        return `NPR ${Math.round(v)}`;
                    }
                }
            },
            x: {
                grid: { display: false },
                ticks: { 
                    color: '#9CA3AF', 
                    font: { family: 'Inter', size: 10 },
                    autoSkip: true,
                    maxTicksLimit: revenueRange === '12w' ? 12 : 7 
                }
            }
        }
    };

    const allocationData = {
        labels: ['Hotels', 'Packages', 'Guide'],
        datasets: [{
            data: [stats.allocationCounts.hotel, stats.allocationCounts.package, stats.allocationCounts.guide],
            backgroundColor: ['#1D7447', '#C5A059', '#0D1F18'],
            borderWidth: 0,
            hoverOffset: 0
        }]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0D1F18',
                bodyColor: '#fff',
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: () => '',
                    label: (item) => {
                        const total = item.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((item.raw / (total || 1)) * 100).toFixed(1);
                        return ` ${item.label}: ${item.raw} (${percentage}%)`;
                    }
                }
            }
        },
        layout: {
            padding: 2
        }
    };

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard index={0} icon="receipt_long" label="Total Bookings" value={stats.totalBookings} />
                <StatCard index={1} icon="payments" label="Spent This Month" value={`NPR ${(stats.spentThisMonth/1000).toFixed(1)}k`} />
                <StatCard index={2} icon="account_balance_wallet" label="Remaining" value={`NPR ${((budget - stats.totalSpent)/1000).toFixed(1)}k`} />
                <StatCard index={3} icon="tune" label="Budget" value={`NPR ${(budget/1000).toFixed(0)}k`} onClick={() => setIsEditingBudget(true)} />
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                 <div className="lg:col-span-2 bg-white rounded-2xl p-5 lg:p-6 border border-gray-100 shadow-sm h-72 lg:h-80">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-[10px] lg:text-[11px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">Spending Trajectory</h3>
                            <p className="text-[8px] lg:text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">3-Month Trajectory Audit</p>
                        </div>
                        <div className="flex gap-1 bg-gray-50 rounded-lg lg:rounded-xl p-1 border border-gray-100 scale-90 lg:scale-100 origin-right">
                            {['1w', '4w', '12w'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRevenueRange(r)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] lg:text-[10px] font-bold uppercase tracking-wider transition-all ${revenueRange === r ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-48 lg:h-56">
                        <Line data={trajectoryData} options={lineOptions} />
                    </div>
                </div>
                 <div className="bg-white rounded-2xl p-5 lg:p-6 border border-gray-100 shadow-sm h-72 lg:h-80">
                    <div className="mb-6">
                        <h3 className="text-[10px] lg:text-[11px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">Allocation</h3>
                        <p className="text-[8px] lg:text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Global Allocation</p>
                    </div>
                    <div className="flex items-center justify-center h-32 lg:h-40">
                        <Doughnut data={allocationData} options={doughnutOptions} />
                    </div>
                    <div className="mt-4 md:mt-0.5 space-y-2.5">
                        {[
                            { label: 'Hotels', type: 'hotel', color: '#1D7447' },
                            { label: 'Packages', type: 'package', color: '#C5A059' },
                            { label: 'Guides', type: 'guide', color: '#0D1F18' },
                        ].map(item => (
                            <div key={item.type} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                                    <span className="text-[8px] lg:text-[9px] text-gray-400 font-black uppercase tracking-[0.15em]">{item.label}</span>
                                </div>
                                <span className="text-[10px] lg:text-[11px] font-black text-[#0D1F18]">
                                    {stats.allocationCounts[item.type] || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Checklist Hub */}
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 md:p-8">
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600"><span className="material-icons text-[20px] md:text-[24px]">fact_check</span></div>
                    <div><h3 className="text-[13px] md:text-[15px] font-black text-[#0D1F18]">Active Journey Checklist</h3><p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Live Milestone Tracking</p></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {stats.activeTrips?.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-gray-200 font-black uppercase text-[10px] border border-dashed border-gray-100 rounded-2xl">No Active Trips</div>
                    ) : stats.activeTrips?.map(trip => {
                        const done = trip.checklist?.filter(i => i.completed).length || 0;
                        const total = trip.checklist?.length || 0;
                        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                        return (
                            <div key={trip.id} onClick={() => setActiveTrip(trip)} className="p-4 bg-[#FAFAF8] rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all cursor-pointer group">
                                <h4 className="text-[12px] font-bold text-[#0D1F18] mb-1 group-hover:text-emerald-700 transition-colors">{trip.title}</h4>
                                <div className="flex items-center justify-between text-[9px] font-black text-gray-300 uppercase mb-4 tracking-tighter">
                                    <span>{trip.status}</span>
                                    <span>#{trip.id.slice(-4).toUpperCase()}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold mb-1.5"><span>Progress</span><span className="text-emerald-600">{pct}%</span></div>
                                <div className="h-1 bg-gray-200/50 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} /></div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Recent Activities */}
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 md:p-6 pb-8 md:pb-6">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h3 className="text-[11px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">Activity Ledger</h3>
                        <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Recent Adventure History</p>
                    </div>
                </div>

                {/* Mobile Card Layout */}
                <div className="lg:hidden space-y-3">
                    {stats.recentBookings.map(b => (
                        <div key={b.id} className="p-4 bg-[#FAFAF8] rounded-xl border border-gray-100 flex items-center justify-between group active:border-[#C5A059]/30 transition-all">
                            <div className="flex flex-col gap-1">
                                <span className="text-[12px] font-black text-[#0D1F18] group-active:text-[#C5A059] transition-colors">{b.guestName}</span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(b.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">Investment</p>
                                <p className="text-[14px] font-black text-[#0D1F18]">NPR {Number(b.totalAmount).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                    {stats.recentBookings.length === 0 && <div className="py-12 text-center text-gray-300 font-black uppercase text-[10px] border border-dashed border-gray-100 rounded-xl">No recent activities</div>}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-[12px]">
                        <thead><tr className="text-gray-400 font-black uppercase text-[9px] border-b border-gray-50"><th className="pb-3 text-left">Experience</th><th className="pb-3 text-center">Date</th><th className="pb-3 text-right">Cost</th></tr></thead>
                        <tbody>{stats.recentBookings.map(b => (
                            <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 font-bold text-[#0D1F18]">{b.guestName}</td>
                                <td className="py-4 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">{new Date(b.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</td>
                                <td className="py-4 text-right font-black">NPR {Number(b.totalAmount).toLocaleString()}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default TravellerAnalytics;
