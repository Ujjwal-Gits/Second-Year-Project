import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HamroLogo from '../assets/HamroLogo.png';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement,
    Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const SuperDashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agents, setAgents] = useState([]);
    const [travellers, setTravellers] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [timeRange, setTimeRange] = useState('3m');
    const [showDropdown, setShowDropdown] = useState(false);
    const [controlsTab, setControlsTab] = useState('pricing');
    const [adPrices, setAdPrices] = useState({
        '1_week': { festival: 5000, featured: 7000, search_top: 4000, discounts: 2500 },
        '2_week': { festival: 9000, featured: 13000, search_top: 7500, discounts: 4500 },
        '1_month': { festival: 16000, featured: 22000, search_top: 12000, discounts: 8000 }
    });
    const [adCreatives, setAdCreatives] = useState({ festival: [], featured: [], search_top: [], discounts: [] });
    const [adFilter, setAdFilter] = useState({ status: 'all', tier: 'all', search: '' });
    const [selectedAdReview, setSelectedAdReview] = useState(null);
    const [rejectionTarget, setRejectionTarget] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionError, setRejectionError] = useState(false);
    const [approvalTarget, setApprovalTarget] = useState(null);
    const [tick, setTick] = useState(0);
    const [adRequests, setAdRequests] = useState([
        { id: 'ADV-001', agent: 'Himalayan Treks Pvt. Ltd.', listing: 'Everest Base Camp Trek - 14 Days', type: 'Featured Destination (Homepage)', typeKey: 'featured', duration: '1 Month', durationDays: 30, startDate: '2026-04-01', endDate: '2026-05-01', price: 22000, designService: true, link: 'https://hamroyatra.com/listing/everest-bc', submitted: '2026-03-19', status: 'pending', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { id: 'ADV-002', agent: 'Pokhara Luxury Stays', listing: 'Pokhara Lakeside Premium Suite', type: 'Festival Highlight', typeKey: 'festival', duration: '2 Weeks', durationDays: 14, startDate: '2026-04-12', endDate: '2026-04-26', price: 9000, designService: false, link: 'https://hamroyatra.com/listing/pokhara-suite', submitted: '2026-03-19', status: 'pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { id: 'ADV-003', agent: 'Chitwan Safari Experts', listing: 'Chitwan Jungle Safari Master Pack', type: 'Exclusive Deals Section', typeKey: 'discounts', duration: '1 Week', durationDays: 7, startDate: '2026-03-25', endDate: '2026-04-01', price: 2500, designService: false, link: 'https://hamroyatra.com/listing/chitwan-safari', submitted: '2026-03-20', status: 'pending', color: 'bg-red-50 text-red-700 border-red-200' },
    ]);
    const [toggles, setToggles] = useState([
        { id: 'maintenance', title: 'Network Maintenance Mode', desc: 'Restrict public access for system upgrades. Active sessions preserved.', active: false, icon: 'build' },
        { id: 'partner_intake', title: 'New Partner Intake Protocol', desc: 'Authorize new agency registrations. Disabling locks all become-partner vectors.', active: true, icon: 'handshake' },
        { id: 'api_sync', title: 'Real-time API Synchronization', desc: 'Secondary sync across distributed edge nodes for zero-latency traveler updates.', active: true, icon: 'sync' },
        { id: 'fraud_detection', title: 'Automated Fraud Detection', desc: 'Neural compliance monitoring for all verification requests.', active: true, icon: 'security' },
        { id: 'ad_module', title: 'Advertising Module Live', desc: 'Enable or disable the advertising portal for all agent accounts globally.', active: true, icon: 'campaign' },
    ]);
    const dropdownRef = React.useRef(null);

    const initials = user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'SA';
    const [platformStats, setPlatformStats] = useState({
        totalAgents: 0,
        verifiedAgents: 0,
        totalTravellers: 0,
        totalRevenue: 0,
        userDistribution: []
    });
    const [revenueHistory, setRevenueHistory] = useState([]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 60000); // Pulse every minute
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);
            await fetchDashboardData();
            setLoading(false);
        };
        initDashboard();
    }, []);

    useEffect(() => {
        if (!loading) {
            updateChartData();
        }
    }, [timeRange]);

    const fetchDashboardData = async () => {
        try {
            const [agentsRes, travellersRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/dashboard/super/agents', {
                    headers: { 'auth-token': localStorage.getItem('token') }
                }),
                axios.get('http://localhost:5000/api/dashboard/super/travellers', {
                    headers: { 'auth-token': localStorage.getItem('token') }
                }),
                axios.get(`http://localhost:5000/api/dashboard/super/stats?range=${timeRange}`, {
                    headers: { 'auth-token': localStorage.getItem('token') }
                })
            ]);
            setAgents(agentsRes.data);
            setTravellers(travellersRes.data);
            setPlatformStats({
                totalAgents: statsRes.data.totalAgents,
                verifiedAgents: statsRes.data.verifiedAgents,
                totalTravellers: statsRes.data.totalTravellers,
                totalRevenue: statsRes.data.totalRevenue,
                userDistribution: statsRes.data.userDistribution
            });
            setRevenueHistory(statsRes.data.revenueHistory);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const updateChartData = async () => {
        try {
            setChartLoading(true);
            const statsRes = await axios.get(`http://localhost:5000/api/dashboard/super/stats?range=${timeRange}`, {
                headers: { 'auth-token': localStorage.getItem('token') }
            });
            setRevenueHistory(statsRes.data.revenueHistory);
        } catch (error) {
            console.error('Error updating chart:', error);
        } finally {
            setChartLoading(false);
        }
    };

    const handleVerifyAgent = async (id, status, verified) => {
        try {
            await axios.put(`http://localhost:5000/api/dashboard/super/verify-agent/${id}`, { status, verified }, { withCredentials: true });
            setSelectedAgent(null);
            fetchDashboardData();
        } catch (err) {
            alert("Verification update failed.");
        }
    };

    const handleReviewAd = (id, status) => {
        const ad = adRequests.find(r => r.id === id);
        
        if (status === 'rejected') {
            if (ad.status === 'rejected') {
                // Toggle back to neutral/pending
                setAdRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'pending', rejectionReason: null, approvedAt: null } : r));
                if (selectedAdReview?.id === id) {
                    setSelectedAdReview(prev => ({ ...prev, status: 'pending', rejectionReason: null, approvedAt: null }));
                }
                return;
            }
            setRejectionTarget(id);
            setRejectionReason('');
            setRejectionError(false);
            return;
        }

        if (status === 'approved') {
            if (ad.status === 'approved') {
                // Toggle back to neutral/pending
                setAdRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'pending', approvedAt: null } : r));
                if (selectedAdReview?.id === id) {
                    setSelectedAdReview(prev => ({ ...prev, status: 'pending', approvedAt: null }));
                }
                return;
            }
            setApprovalTarget(id);
            return;
        }
    };

    const submitApproval = () => {
        if (!approvalTarget) return;
        
        setAdRequests(prev => prev.map(r => r.id === approvalTarget ? { 
            ...r, 
            status: 'approved', 
            approvedAt: new Date().toISOString() 
        } : r));
        
        if (selectedAdReview?.id === approvalTarget) {
            setSelectedAdReview(prev => ({ ...prev, status: 'approved', approvedAt: new Date().toISOString() }));
        }
        
        setApprovalTarget(null);
    };

    const submitRejection = () => {
        if (!rejectionReason.trim()) {
            setRejectionError(true);
            return;
        }
        setRejectionError(false);
        
        setAdRequests(prev => prev.map(r => r.id === rejectionTarget ? { 
            ...r, 
            status: 'rejected', 
            rejectionReason: rejectionReason,
            approvedAt: null 
        } : r));
        
        if (selectedAdReview?.id === rejectionTarget) {
            setSelectedAdReview(prev => ({ ...prev, status: 'rejected', rejectionReason: rejectionReason, approvedAt: null }));
        }
        
        setRejectionTarget(null);
    };

    const pendingAgents = agents.filter(a => a.verificationStatus === 'pending');
    
    const filteredAgents = agents.filter(a => 
        (a.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const filteredTravellers = travellers.filter(t => 
        (t.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const stats = [
        { label: 'Total Earnings', value: platformStats.totalRevenue || 0, icon: 'payments', color: 'text-emerald-500', bg: 'bg-emerald-50/50', isMoney: true },
        { label: 'Total Agents', value: platformStats.totalAgents || 0, icon: 'business', color: 'text-blue-500', bg: 'bg-blue-50/50' },
        { label: 'Verified Agencies', value: platformStats.verifiedAgents || 0, icon: 'verified', color: 'text-[#C5A059]', bg: 'bg-[#C5A059]/10' },
        { label: 'Active Explorers', value: platformStats.totalTravellers || 0, icon: 'group', color: 'text-purple-500', bg: 'bg-purple-50/50' },
    ];

    if (loading) return (
        <div className="h-screen bg-[#F7F6F3] flex items-center justify-center font-display">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Master Administration Loading...</p>
            </div>
        </div>
    );

    return (
        <div className="h-screen bg-[#FBFBFB] flex font-display overflow-hidden">
            {/* Backdrop Overlay for Mobile */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-[#0D1F18]/60 backdrop-blur-[6px] z-[99] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar — Refined Minimalist Design */}
            <aside className={`fixed lg:static inset-y-0 left-0 w-72 lg:w-60 bg-[#0D1F18] flex flex-col h-full shrink-0 z-[100] transition-transform duration-500 ease-out border-r border-white/5 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Subtle aurora */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-64 bg-[radial-gradient(ellipse_at_top_left,rgba(197,160,89,0.06)_0%,transparent_70%)]" />
                </div>
                
                {/* Brand */}
                <div className="h-[72px] flex items-center px-6 border-b border-white/5 shrink-0 relative z-10">
                    <img src={HamroLogo} alt="Hamroyatra" className="w-7 h-7 object-contain brightness-0 invert opacity-90 mr-3" />
                    <div>
                        <p className="text-white text-[11px] font-black tracking-[0.25em] uppercase leading-none">Super Terminal</p>
                        <p className="text-[#C5A059] text-[8px] tracking-[0.3em] uppercase opacity-60 mt-0.5">Nepal Master Console</p>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 py-8 space-y-1 relative z-10 overflow-y-auto no-scrollbar">
                    {[
                        { id: 'overview', label: 'Master Overview', icon: 'grid_view' },
                        { id: 'verification', label: 'Verification Queue', icon: 'assignment_turned_in' },
                        { id: 'agents', label: 'Managed Agents', icon: 'business_center' },
                        { id: 'travellers', label: 'Travellers Base', icon: 'groups' },
                        { id: 'analytics', label: 'Ad Review Queue', icon: 'campaign' }
                    ].map(item => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group relative ${
                                    isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activePillSuper"
                                        className="absolute inset-0 bg-primary rounded-xl"
                                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                    />
                                )}
                                <div className="relative">
                                    <span className={`material-icons text-[18px] relative z-10 ${isActive ? 'text-white' : ''}`}>
                                        {item.icon}
                                    </span>
                                </div>
                                <span className="text-[12px] font-semibold tracking-wide relative z-10">{item.label}</span>
                            </button>
                        );
                    })}

                    <div className="pt-8 mb-4">
                        <button
                            onClick={() => {
                                setActiveTab('controls');
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 group relative ${activeTab === 'controls' ? 'bg-[#1D7447] text-white shadow-lg' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                        >
                            {activeTab === 'controls' && (
                                <motion.div layoutId="activePillSuper" className="absolute inset-0 bg-[#1D7447] rounded-lg" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                            )}
                            <span className="material-icons text-[18px] relative z-10">settings</span>
                            <span className="text-[12px] font-semibold tracking-wide relative z-10">Global Controls</span>
                        </button>
                    </div>
                </nav>

                {/* Footer Section */}
                <div className="px-6 pb-4 relative z-10 border-t border-white/5 mx-2">
                    <div className="pt-4 pb-2">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 group hover:bg-white/5 border border-transparent hover:border-white/5"
                        >
                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary transition-colors">
                                <span className="material-icons text-white/40 group-hover:text-white text-[14px]">public</span>
                            </div>
                            <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">View Website</span>
                            <span className="material-icons text-white/10 text-[12px] ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg border border-white/5 mt-2">
                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-black text-xs">SA</div>
                        <div className="min-w-0">
                            <p className="text-white text-[11px] font-black tracking-wide truncate">Super Admin</p>
                            <p className="text-[#C5A059] text-[8px] tracking-[0.2em] uppercase opacity-60 leading-tight">Master Node</p>
                        </div>
                    </div>

                    <div className="pt-3">
                        <p className="text-white/30 text-[8px] uppercase tracking-[0.3em] font-black text-center">
                            VER 1.0.2 • SECURED
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area — Minimalist & Clean */}
            <main className="flex-1 overflow-y-auto h-screen bg-[#FBFBFB] relative px-3 lg:px-12 md:px-8 py-5 lg:py-12 md:py-8">
                        <div className="max-w-[1400px] mx-auto">
                            <header className="mb-10 md:mb-12">
                                {/* Mobile-Specific Top Bar (Matches Agent Dashboard Reference) */}
                                <div className="lg:hidden flex items-center justify-between mb-8">
                                    <button 
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[#0D1F18] shadow-sm active:scale-95 transition-all"
                                    >
                                        <span className="material-icons">menu</span>
                                    </button>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 shadow-sm">
                                            <span className="material-icons text-[20px]">notifications_none</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#0D1F18] flex items-center justify-center text-white text-[11px] font-extrabold shadow-lg shadow-[#0D1F18]/10" onClick={() => setShowDropdown(!showDropdown)}>
                                            {initials}
                                        </div>
                                    </div>
                                </div>

                                {/* Title & Context Section */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1 lg:mb-2">
                                            <h1 className="text-xl lg:text-2xl font-black text-[#0D1F18] tracking-tight capitalize">
                                                {activeTab.replace('-', ' ')}
                                            </h1>
                                            <div className="h-4 w-px bg-gray-200 hidden md:block" />
                                            <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.3em] hidden md:block">Master Active</span>
                                        </div>
                                        <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-relaxed">Operational Platform Administration</p>
                                    </div>

                                    {/* Desktop-Only Actions Section */}
                                    <div className="hidden lg:flex items-center gap-6">
                                        <div className="relative group">
                                            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-base group-focus-within:text-primary transition-colors">search</span>
                                            <input 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-64 lg:w-80 h-11 bg-white border border-gray-100 rounded-xl pl-11 pr-4 text-[11px] font-bold outline-none focus:border-primary/20 transition-all shadow-sm"
                                                placeholder="Search global database..." 
                                            />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary cursor-pointer transition-all shadow-sm">
                                                <span className="material-icons text-[20px]">notifications_none</span>
                                            </div>

                                            {/* Master Profile Dropdown */}
                                            <div className="relative" ref={dropdownRef}>
                                                <button 
                                                    onClick={() => setShowDropdown(!showDropdown)}
                                                    className="flex items-center gap-3 pl-5 border-l border-gray-100 group transition-all"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-[#0D1F18] flex items-center justify-center text-white text-[11px] font-extrabold tracking-wider shadow-lg shadow-[#0D1F18]/10 group-hover:scale-105 transition-transform">
                                                        {initials}
                                                    </div>
                                                    <div className="hidden lg:block text-left">
                                                        <p className="text-[13px] font-black text-[#0D1F18] leading-none group-hover:text-primary transition-colors">{user?.fullName || 'Super Admin'}</p>
                                                        <p className="text-[9px] text-[#C5A059] mt-1.5 uppercase font-bold tracking-widest opacity-80">Master Authority</p>
                                                    </div>
                                                    <span className="material-icons text-gray-300 text-[18px] transition-transform group-hover:text-gray-400" style={{ transform: showDropdown ? 'rotate(180deg)' : 'none' }}>
                                                        expand_more
                                                    </span>
                                                </button>

                                                <AnimatePresence>
                                                    {showDropdown && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                                            className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.15)] border border-gray-50 py-3 overflow-hidden z-20"
                                                        >
                                                            <div className="px-5 py-4 border-b border-gray-50/60 mb-2">
                                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest truncate">{user?.email || 'admin@hamroyatra.com'}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => setShowDropdown(false)}
                                                                className="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0D1F18] transition-all group/opt"
                                                            >
                                                                <span className="material-icons text-[18px] text-gray-400 group-hover/opt:text-[#0D1F18] transition-colors">settings</span>
                                                                Global Configuration
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setShowDropdown(false);
                                                                    navigate('/');
                                                                }}
                                                                className="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0D1F18] transition-all group/opt"
                                                            >
                                                                <span className="material-icons text-[18px] text-gray-400 group-hover/opt:text-[#0D1F18] transition-colors">public</span>
                                                                Visit Frontend
                                                            </button>
                                                            <div className="h-px bg-gray-50 mx-5 my-1" />
                                                            <button 
                                                                onClick={() => { setShowDropdown(false); onLogout(); }}
                                                                className="w-full flex items-center gap-3 px-5 py-5 text-[11px] font-black text-red-500 hover:bg-red-50 transition-all uppercase tracking-[0.2em]"
                                                            >
                                                                <span className="material-icons text-[20px]">power_settings_new</span>
                                                                TERMINATE SESSION
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </header>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="min-h-[500px]"
                                >
                                    {activeTab === 'overview' && (
                                        <div className="space-y-8 lg:space-y-12">
                                            {/* Compact Stats Overview Section */}
                                            {/* Compact Stats Overview Section */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-6">
                                                {stats.map((stat, idx) => (
                                                    <motion.div 
                                                        key={idx} 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className="bg-white p-4 lg:p-6 rounded-[22px] lg:rounded-[28px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
                                                    >
                                                        <div className="flex items-start justify-between mb-6">
                                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} border border-white shadow-sm`}>
                                                                <span className="material-icons text-[18px]">{stat.icon}</span>
                                                            </div>
                                                            <div className="px-2 py-1 bg-emerald-50 rounded-lg">
                                                                <span className="text-[9px] font-bold text-emerald-600 tracking-wide">+2.4%</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1.5">{stat.label}</p>
                                                            <p className="text-[15px] md:text-xl font-black text-[#0D1F18] tracking-tighter leading-none whitespace-nowrap overflow-hidden">
                                                                {stat.isMoney 
                                                                    ? (stat.value >= 1000000 
                                                                        ? `NPR ${(stat.value / 1000000).toFixed(1)}M` 
                                                                        : stat.value >= 1000 
                                                                            ? `NPR ${(stat.value / 1000).toFixed(1)}k` 
                                                                            : `NPR ${stat.value.toLocaleString()}`)
                                                                    : (stat.value || 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            {/* Advanced Analytics — Trajectory and Distribution */}
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                                {/* Master Trajectory Audit */}
                                                <div className="lg:col-span-2 bg-white p-5 lg:p-8 rounded-3xl lg:rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                                        <div>
                                                            <h4 className="text-[13px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">Operational Earnings</h4>
                                                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.15em]">3-Month Trajectory Audit</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 mr-1">
                                                                {['3m', '6m', '12m'].map((r) => (
                                                                    <button
                                                                        key={r}
                                                                        onClick={() => setTimeRange(r)}
                                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                                                                            timeRange === r 
                                                                                ? 'bg-primary text-white shadow-sm' 
                                                                                : 'text-gray-400 hover:text-gray-600'
                                                                        }`}
                                                                    >
                                                                        {r === '3m' ? '1W' : r === '6m' ? '4W' : '12W'} 
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <div className="w-9 h-9 bg-primary/8 rounded-xl flex items-center justify-center text-primary" style={{ background: 'rgba(29,116,71,0.08)' }}>
                                                                <span className="material-icons text-lg">auto_graph</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="h-56 w-full relative z-10">
                                                        {chartLoading && (
                                                            <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                                                                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                            </div>
                                                        )}
                                                        <Line 
                                                            data={{
                                                                labels: revenueHistory.length > 0 ? revenueHistory.map(h => h.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                                                datasets: [{
                                                                    label: 'Revenue (NPR)',
                                                                    data: revenueHistory.length > 0 ? revenueHistory.map(h => h.total) : [300, 450, 420, 580, 520, 700],
                                                                    borderColor: '#1D7447',
                                                                    backgroundColor: (ctx) => {
                                                                        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 250);
                                                                        g.addColorStop(0, 'rgba(29,116,71,0.15)');
                                                                        g.addColorStop(1, 'rgba(29,116,71,0)');
                                                                        return g;
                                                                    },
                                                                    borderWidth: 2,
                                                                    pointRadius: 4,
                                                                    pointBackgroundColor: '#1D7447',
                                                                    pointBorderColor: '#fff',
                                                                    pointBorderWidth: 2,
                                                                    pointHoverRadius: 6,
                                                                    tension: 0.4,
                                                                    fill: true,
                                                                    clip: false
                                                                }]
                                                            }}
                                                            options={{
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
                                                                        titleFont: { size: 10, weight: 'bold' },
                                                                        bodyFont: { size: 12, weight: 'bold' },
                                                                        callbacks: {
                                                                            label: (ctx) => ` NPR ${ctx.parsed.y.toLocaleString()}`
                                                                        }
                                                                    }
                                                                },
                                                                scales: {
                                                                    y: { 
                                                                        beginAtZero: true,
                                                                        min: 0,
                                                                        grid: { 
                                                                            display: true,
                                                                            drawBorder: false,
                                                                            borderDash: [5, 5], 
                                                                            color: 'rgba(0,0,0,0.04)' 
                                                                        }, 
                                                                        ticks: { 
                                                                            font: { size: 10 }, 
                                                                            color: '#9CA3AF', 
                                                                            padding: 5,
                                                                            callback: (v) => {
                                                                                if (v === 0) return 'NPR 0';
                                                                                if (v >= 1000) return `NPR ${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
                                                                                return `NPR ${v}`;
                                                                            }
                                                                        } 
                                                                    },
                                                                    x: { 
                                                                        grid: { display: false }, 
                                                                        ticks: { 
                                                                            font: { size: 10 }, 
                                                                            color: '#9CA3AF',
                                                                            padding: 8
                                                                        } 
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Global Allocation */}
                                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                                                    <div className="mb-6 relative z-10">
                                                        <div>
                                                            <h4 className="text-[11px] font-black text-[#0D1F18] uppercase tracking-[0.2em] mb-1">Global Allocation</h4>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Demographic Weights</p>
                                                        </div>
                                                        <div className="w-9 h-9 bg-[#C5A059]/10 rounded-xl flex items-center justify-center text-[#C5A059] border border-[#C5A059]/20 hidden">
                                                            <span className="material-icons text-sm">pie_chart</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <div className="h-[170px] w-full relative z-10 flex items-center justify-center">
                                                            <Doughnut 
                                                                data={{
                                                                    labels: ['Verified Agents', 'Standard Agents', 'Travellers'],
                                                                    datasets: [{
                                                                        data: platformStats.userDistribution.length > 0 
                                                                            ? platformStats.userDistribution.map(d => d.value)
                                                                            : [12, 28, 60],
                                                                        backgroundColor: ['#C5A059', '#0D1F18', '#1D7447'],
                                                                        borderWidth: 0,
                                                                        hoverOffset: 0
                                                                    }]
                                                                }}
                                                                options={{
                                                                    responsive: true,
                                                                    maintainAspectRatio: false,
                                                                    cutout: '72%',
                                                                    layout: { padding: 10 },
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
                                                                                    const percentage = ((item.raw / total) * 100).toFixed(1);
                                                                                    return ` ${item.label}: ${item.raw} (${percentage}%)`;
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                                <p className="text-[13px] font-black text-[#0D1F18] tracking-tight">{(platformStats.totalAgents + platformStats.totalTravellers).toLocaleString()}</p>
                                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Nodes</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-full mt-5 space-y-2.5">
                                                            {[
                                                                { label: 'Verified Agencies', type: 'verified', color: '#C5A059' },
                                                                { label: 'Standard Partners', type: 'standard', color: '#0D1F18' },
                                                                { label: 'Active Explorers', type: 'traveller', color: '#1D7447' },
                                                            ].map((item, i) => {
                                                                const value = platformStats.userDistribution[i]?.value || 0;
                                                                return (
                                                                    <div key={item.label} className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                                                                            <span className="text-[11px] text-gray-500 font-medium">{item.label}</span>
                                                                        </div>
                                                                        <span className="text-[11px] font-bold text-[#0D1F18]">
                                                                            {value.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'verification' && (
                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-[13px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">Compliance Pipeline</h3>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{pendingAgents.length} Active Partner Reviews</p>
                                                </div>
                                            </div>

                                            {pendingAgents.length === 0 ? (
                                                <div className="bg-white rounded-[40px] border border-gray-100 p-24 flex flex-col items-center text-center shadow-sm">
                                                    <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center mb-8 border border-emerald-100">
                                                        <span className="material-icons text-primary text-3xl">verified_user</span>
                                                    </div>
                                                    <h4 className="text-[14px] font-black text-[#0D1F18] uppercase tracking-widest">Queue Synchronized</h4>
                                                    <p className="text-gray-400 text-[10px] mt-3 max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">System integrity is optimal. No pending verifications found.</p>
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-3xl lg:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                                                    <div className="p-2 lg:p-4 no-scrollbar bg-[#FBFBFB]/50">
                                                        {/* Header Row — Hidden on Mobile */}
                                                        <div className="hidden lg:flex items-center px-10 py-2 mb-1 border-b border-gray-100">
                                                            <div className="w-[8%] text-[8px] font-black text-gray-300 uppercase tracking-widest">UID</div>
                                                            <div className="w-[30%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-left">Partner Entity</div>
                                                            <div className="w-[18%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Legal Vector (PAN)</div>
                                                            <div className="w-[18%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Node Location</div>
                                                            <div className="w-[16%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Compliance Status</div>
                                                            <div className="w-[10%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-right">Audit</div>
                                                        </div>

                                                        {/* Rows — Responsive card concept */}
                                                        <div className="space-y-4 lg:space-y-1.5 mt-2">
                                                            {pendingAgents.map(agent => (
                                                                <motion.div 
                                                                    key={agent.id}
                                                                    initial={{ opacity: 0, y: 3 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="flex flex-col lg:flex-row lg:items-center bg-white p-4 lg:px-8 lg:py-2.5 rounded-2xl lg:rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group hover:border-amber-600/10"
                                                                >
                                                                    {/* Mobile Top: UID & Status */}
                                                                    <div className="flex items-center justify-between mb-4 lg:mb-0 lg:w-[8%]">
                                                                        <div className="text-[10px] font-bold text-gray-300">
                                                                            #{agent.id.slice(0, 4).toUpperCase()}
                                                                        </div>
                                                                        <div className="lg:hidden flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 rounded-md border border-amber-100">
                                                                            <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                                                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-600">Pending Review</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Partner Entity */}
                                                                    <div className="lg:w-[30%] flex items-center gap-3 mb-5 lg:mb-0">
                                                                        <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-xl lg:rounded-lg bg-gray-50 flex items-center justify-center text-amber-600 font-black border border-gray-100 text-[11px] lg:text-[9px]">
                                                                            {agent.companyName?.[0] || 'A'}
                                                                        </div>
                                                                        <div className="truncate">
                                                                            <p className="text-[13px] lg:text-[11px] font-black text-[#0D1F18] tracking-tight truncate leading-tight">{agent.companyName}</p>
                                                                            <p className="text-[9px] lg:text-[8px] text-gray-400 font-bold tracking-tight uppercase opacity-60">Owner: {agent.fullName || 'Unspecified'}</p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Grid Data for Mobile */}
                                                                    <div className="grid grid-cols-2 gap-4 mb-5 lg:mb-0 lg:contents">
                                                                        <div className="lg:w-[18%] lg:text-center">
                                                                            <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest lg:hidden mb-1.5">Compliance Ident</p>
                                                                            <p className="text-[11px] lg:text-[10px] font-extrabold text-[#0D1F18] tracking-widest">{agent.panNumber}</p>
                                                                        </div>
                                                                        <div className="lg:w-[18%] lg:text-center">
                                                                            <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest lg:hidden mb-1.5">Node Location</p>
                                                                            <p className="text-[11px] lg:text-[10px] font-bold text-gray-400 uppercase truncate">{agent.location || 'Nepal'}</p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Desktop Status Column */}
                                                                    <div className="hidden lg:flex lg:w-[16%] items-center justify-center">
                                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 rounded-md border border-amber-100">
                                                                            <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                                                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-600">Pending Review</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Bottom Action node */}
                                                                    <div className="lg:w-[10%] pt-4 lg:pt-0 border-t lg:border-none border-gray-50 flex items-center justify-between lg:justify-end">
                                                                        <div className="lg:hidden text-[9px] font-black text-gray-300 uppercase tracking-widest">Master Audit</div>
                                                                        <button onClick={() => setSelectedAgent(agent)} className="w-8 h-8 rounded-lg bg-gray-50 text-gray-300 hover:text-amber-600 transition-all flex items-center justify-center lg:ml-auto border border-gray-100">
                                                                            <span className="material-icons text-[16px] lg:text-[14px]">remove_red_eye</span>
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'agents' && (
                                        <div className="bg-white rounded-3xl lg:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="px-5 lg:px-8 py-4 border-b border-gray-50 flex items-center justify-between bg-white relative">
                                                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                                                    <div>
                                                        <h3 className="text-[12px] lg:text-[14px] font-black text-[#0D1F18] tracking-tight uppercase tracking-widest">Partner Directory</h3>
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mt-1">{filteredAgents.length} Nodes Indexed</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button className="px-3 py-1.5 lg:py-1 bg-[#0D1F18] text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-sm">All Nodes</button>
                                                        <button className="px-3 py-1.5 lg:py-1 bg-white text-gray-400 border border-gray-100 rounded-md text-[8px] font-black uppercase tracking-widest hover:border-primary/20 hover:text-primary transition-all">Verified</button>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="p-2 lg:p-4 no-scrollbar bg-gray-50/20">
                                                {/* Header Row — Hidden on Mobile */}
                                                <div className="hidden lg:flex items-center px-10 py-2 mb-1 border-b border-gray-100">
                                                    <div className="w-[8%] text-[8px] font-black text-gray-300 uppercase tracking-widest">UID</div>
                                                    <div className="w-[25%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-left">Partner Identity</div>
                                                    <div className="w-[20%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Mobile Vector</div>
                                                    <div className="w-[22%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Communication</div>
                                                    <div className="w-[15%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Compliance</div>
                                                    <div className="w-[10%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-right">Audit</div>
                                                </div>

                                                {/* Rows — Responsive card concept */}
                                                <div className="space-y-4 lg:space-y-1.5 mt-2">
                                                    {filteredAgents.map(agent => (
                                                        <motion.div 
                                                            key={agent.id}
                                                            initial={{ opacity: 0, y: 3 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="flex flex-col lg:flex-row lg:items-center bg-white p-4 lg:px-8 lg:py-2.5 rounded-2xl lg:rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group hover:border-primary/20"
                                                        >
                                                            {/* Mobile Header: UID & Compliance */}
                                                            <div className="flex items-center justify-between mb-4 lg:mb-0 lg:w-[8%]">
                                                                <div className="text-[10px] font-bold text-gray-300">
                                                                    #{agent.id.slice(0, 4).toUpperCase()}
                                                                </div>
                                                                <div className="lg:hidden flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100">
                                                                    <div className={`w-1 h-1 rounded-full ${agent.verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${agent.verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                                        {agent.verified ? 'Verified' : 'Pending'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Partner Identity */}
                                                            <div className="lg:w-[25%] flex items-center gap-3 mb-5 lg:mb-0">
                                                                <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-xl lg:rounded-lg bg-gray-50 flex items-center justify-center text-primary font-black border border-gray-100 text-[11px] lg:text-[9px]">
                                                                    {agent.companyName?.[0] || 'A'}
                                                                </div>
                                                                <div className="truncate">
                                                                    <p className="text-[13px] lg:text-[11px] font-black text-[#0D1F18] tracking-tight truncate leading-tight">{agent.companyName}</p>
                                                                    <p className="text-[9px] lg:text-[8px] text-gray-400 font-bold tracking-tight truncate uppercase opacity-60">Owner: {agent.fullName || 'Unspecified'}</p>
                                                                </div>
                                                            </div>

                                                            {/* Contact Grid for Mobile */}
                                                            <div className="grid grid-cols-2 gap-4 mb-5 lg:mb-0 lg:contents">
                                                                <div className="lg:w-[20%] lg:text-center">
                                                                    <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest lg:hidden mb-1.5">Primary Cellular</p>
                                                                    <p className="text-[11px] lg:text-[10px] font-black text-[#0D1F18]">{agent.contactNumber || agent.phoneNo || 'N/A'}</p>
                                                                </div>
                                                                <div className="lg:w-[22%] lg:text-center overflow-hidden">
                                                                    <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest lg:hidden mb-1.5">Official Mail</p>
                                                                    <p className="text-[10px] lg:text-[9px] text-gray-400 font-bold lowercase tracking-tight truncate px-2">{agent.email}</p>
                                                                </div>
                                                            </div>

                                                            {/* Desktop Status Column */}
                                                            <div className="hidden lg:flex lg:w-[15%] items-center justify-center">
                                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100">
                                                                    <div className={`w-1 h-1 rounded-full ${agent.verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${agent.verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                                        {agent.verified ? 'Verified' : 'Pending'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Actions Row */}
                                                            <div className="lg:w-[10%] pt-4 lg:pt-0 border-t lg:border-none border-gray-50 flex items-center justify-between lg:justify-end">
                                                                <div className="lg:hidden text-[9px] font-black text-gray-300 uppercase tracking-widest">Identity Node Access</div>
                                                                <button onClick={() => setSelectedAgent(agent)} className="w-8 h-8 rounded-lg bg-gray-50 text-gray-300 hover:text-primary transition-all flex items-center justify-center lg:ml-auto border border-gray-100">
                                                                    <span className="material-icons text-[16px] lg:text-[14px]">visibility</span>
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'travellers' && (
                                        <div className="bg-white rounded-3xl lg:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="px-5 lg:px-8 py-4 border-b border-gray-50 flex items-center justify-between bg-white relative">
                                                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                                                    <div>
                                                        <h3 className="text-[12px] lg:text-[14px] font-black text-[#0D1F18] tracking-tight uppercase tracking-widest">Traveler Base</h3>
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mt-1">{filteredTravellers.length} Accounts Operational</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button className="px-3 py-1.5 lg:py-1 bg-[#0D1F18] text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-sm">View All</button>
                                                        <button className="px-3 py-1.5 lg:py-1 bg-white text-gray-400 border border-gray-100 rounded-md text-[8px] font-black uppercase tracking-widest hover:border-emerald-600/20 hover:text-emerald-600 transition-all">Active Pulse</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2 lg:p-4 no-scrollbar bg-gray-50/20">
                                                {/* Header Row — Hidden on Mobile */}
                                                <div className="hidden lg:flex items-center px-10 py-2 mb-1 border-b border-gray-100">
                                                    <div className="w-[8%] text-[8px] font-black text-gray-300 uppercase tracking-widest">UID</div>
                                                    <div className="w-[22%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-left">Traveler Identity</div>
                                                    <div className="w-[18%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Phone Number</div>
                                                    <div className="w-[22%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Email Address</div>
                                                    <div className="w-[15%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Condition</div>
                                                    <div className="w-[15%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-right">Actions</div>
                                                </div>

                                                {/* Rows — Responsive card concept */}
                                                <div className="space-y-4 lg:space-y-1.5 mt-2">
                                                    {filteredTravellers.map(traveler => (
                                                        <motion.div 
                                                            key={traveler.id}
                                                            initial={{ opacity: 0, y: 3 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="flex flex-col lg:flex-row lg:items-center bg-white p-4 lg:px-8 lg:py-2.5 rounded-2xl lg:rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group hover:border-emerald-600/10"
                                                        >
                                                            {/* UID & Mobile Status */}
                                                            <div className="flex items-center justify-between mb-4 lg:mb-0 lg:w-[8%]">
                                                                <div className="text-[10px] font-bold text-gray-300">
                                                                    #{traveler.id.slice(0, 4).toUpperCase()}
                                                                </div>
                                                                <div className="lg:hidden flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50/50 rounded-md border border-emerald-100/50">
                                                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                                                                </div>
                                                            </div>

                                                            {/* Traveler Identity */}
                                                            <div className="lg:w-[22%] flex items-center gap-3 mb-5 lg:mb-0">
                                                                <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-xl lg:rounded-lg bg-gray-50 flex items-center justify-center text-emerald-600 font-black border border-gray-100 text-[11px] lg:text-[9px]">
                                                                    {traveler.fullName?.[0] || 'T'}
                                                                </div>
                                                                <div className="truncate">
                                                                    <p className="text-[13px] lg:text-[11px] font-black text-[#0D1F18] tracking-tight truncate leading-tight">{traveler.fullName}</p>
                                                                    <p className="text-[9px] lg:text-[8px] text-gray-400 font-bold tracking-tight uppercase opacity-60">Verified Identity</p>
                                                                </div>
                                                            </div>

                                                            {/* Mobile Contact Matrix */}
                                                            <div className="grid grid-cols-2 gap-4 mb-5 lg:mb-0 lg:contents">
                                                                <div className="lg:w-[18%] lg:text-center">
                                                                    <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest lg:hidden mb-1.5">Phone Vector</p>
                                                                    <p className="text-[11px] lg:text-[10px] font-black text-[#0D1F18]">{traveler.contactNumber || 'N/A'}</p>
                                                                </div>
                                                                <div className="lg:w-[22%] lg:text-center overflow-hidden">
                                                                    <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest lg:hidden mb-1.5">Digital Mail</p>
                                                                    <p className="text-[10px] lg:text-[9px] text-gray-400 font-bold lowercase tracking-tight truncate">{traveler.email}</p>
                                                                </div>
                                                            </div>

                                                            {/* Desktop Condition Column */}
                                                            <div className="hidden lg:flex lg:w-[15%] items-center justify-center">
                                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50/50 rounded-md border border-emerald-100/50">
                                                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                                                                </div>
                                                            </div>

                                                            {/* Actions Layer */}
                                                            <div className="lg:w-[15%] pt-4 lg:pt-0 border-t lg:border-none border-gray-50 flex items-center justify-between lg:justify-end">
                                                                <div className="lg:hidden text-[9px] font-black text-gray-300 uppercase tracking-widest">Global Action Node</div>
                                                                <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-300 hover:text-emerald-600 transition-all flex items-center justify-center lg:ml-auto border border-gray-100">
                                                                    <span className="material-icons text-[16px] lg:text-[14px]">more_vert</span>
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'analytics' && (() => {
                                        const filtered = adRequests.filter(r => {
                                            const matchStatus = adFilter.status === 'all' || r.status === adFilter.status;
                                            const matchTier = adFilter.tier === 'all' || r.typeKey === adFilter.tier;
                                            const matchSearch = !adFilter.search || r.agent.toLowerCase().includes(adFilter.search.toLowerCase()) || r.listing.toLowerCase().includes(adFilter.search.toLowerCase());
                                            return matchStatus && matchTier && matchSearch;
                                        });
                                        return (
                                        <div className="space-y-6">
                                            {/* Header */}
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                <div>
                                                    <h1 className="text-xl lg:text-2xl font-black text-[#0D1F18] tracking-tight uppercase tracking-widest">Analytics</h1>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest hidden lg:block">Pending sponsorship requests from verified agents</p>
                                                </div>
                                                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 w-fit">
                                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">{adRequests.filter(r => r.status === 'pending').length} Pending Review</span>
                                                </div>
                                            </div>

                                            {/* Filter Bar */}
                                            <div className="flex flex-wrap gap-3 items-center bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                                                {/* Status Pills */}
                                                <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-lg p-1">
                                                    {['all', 'pending', 'approved', 'rejected'].map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => setAdFilter(prev => ({ ...prev, status: s }))}
                                                            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all duration-150 ${
                                                                adFilter.status === s
                                                                    ? s === 'approved' ? 'bg-emerald-600 text-white shadow-sm'
                                                                    : s === 'rejected' ? 'bg-red-500 text-white shadow-sm'
                                                                    : s === 'pending' ? 'bg-amber-500 text-white shadow-sm'
                                                                    : 'bg-[#0D1F18] text-white shadow-sm'
                                                                : 'text-gray-400 hover:text-gray-700'
                                                            }`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="h-6 w-px bg-gray-100" />

                                                {/* Tier Filter */}
                                                <div className="relative">
                                                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-[15px] pointer-events-none">filter_list</span>
                                                    <select
                                                        value={adFilter.tier}
                                                        onChange={e => setAdFilter(prev => ({ ...prev, tier: e.target.value }))}
                                                        className="h-9 pl-9 pr-6 bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-600 rounded-lg outline-none appearance-none cursor-pointer hover:border-gray-200 transition-all"
                                                    >
                                                        <option value="all">All Tiers</option>
                                                        <option value="featured">Featured Destination</option>
                                                        <option value="festival">Festival Highlight</option>
                                                        <option value="search_top">Top Search Priority</option>
                                                        <option value="discounts">Exclusive Deals</option>
                                                    </select>
                                                </div>

                                                {/* Search */}
                                                <div className="relative flex-1 min-w-[180px]">
                                                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-[15px] pointer-events-none">search</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Search agent or listing..."
                                                        value={adFilter.search}
                                                        onChange={e => setAdFilter(prev => ({ ...prev, search: e.target.value }))}
                                                        className="w-full h-9 pl-9 pr-4 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-700 outline-none focus:border-primary/30 placeholder:text-gray-300 transition-all"
                                                    />
                                                </div>

                                                {/* Reset */}
                                                {(adFilter.status !== 'all' || adFilter.tier !== 'all' || adFilter.search) && (
                                                    <button
                                                        onClick={() => setAdFilter({ status: 'all', tier: 'all', search: '' })}
                                                        className="flex items-center gap-1.5 h-9 px-3 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                                                    >
                                                        <span className="material-icons text-[13px]">close</span>
                                                        Reset
                                                    </button>
                                                )}
                                            </div>

                                            {/* Results */}
                                            {filtered.length === 0 ? (
                                                <div className="bg-white rounded-[40px] border border-gray-100 p-16 flex flex-col items-center text-center shadow-sm">
                                                    <span className="material-icons text-gray-200 text-5xl mb-4">campaign</span>
                                                    <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">No requests match your filters</p>
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-3xl lg:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                                                    <div className="p-2 lg:p-4 no-scrollbar bg-[#FBFBFB]/50">
                                                        {/* Header Row — Hidden on Mobile */}
                                                        <div className="hidden lg:flex items-center px-10 py-2 mb-1 border-b border-gray-100">
                                                            <div className="w-[7%] text-[8px] font-black text-gray-300 uppercase tracking-widest">UID</div>
                                                            <div className="w-[30%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-left">Partner & Listing</div>
                                                            <div className="w-[18%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Investment Vector</div>
                                                            <div className="w-[15%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Placement Tier</div>
                                                            <div className="w-[18%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">Temporal Period</div>
                                                            <div className="w-[12%] text-[8px] font-black text-gray-300 uppercase tracking-widest text-right">Audit</div>
                                                        </div>

                                                        {/* Rows — Responsive card concept */}
                                                        <div className="space-y-4 lg:space-y-1.5 mt-2">
                                                            {filtered.map(req => (
                                                                <motion.div 
                                                                    key={req.id}
                                                                    initial={{ opacity: 0, y: 3 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="flex flex-col lg:flex-row lg:items-center bg-white p-4 lg:px-8 lg:py-2.5 rounded-2xl lg:rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group hover:border-primary/20"
                                                                >
                                                                    {/* Mobile Top: UID & Tier */}
                                                                    <div className="flex items-center justify-between mb-4 lg:mb-0 lg:w-[7%]">
                                                                        <div className="text-[10px] font-bold text-gray-300">
                                                                            #{req.id.split('-')[1]}
                                                                        </div>
                                                                        <div className="lg:hidden inline-flex px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-100">
                                                                            {req.typeKey}
                                                                        </div>
                                                                    </div>

                                                                    {/* Partner & Listing */}
                                                                    <div className="lg:w-[30%] flex items-center gap-3 mb-5 lg:mb-0">
                                                                        <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-xl lg:rounded-lg bg-gray-50 flex items-center justify-center text-primary font-black border border-gray-100 text-[11px] lg:text-[9px]">
                                                                            <span className="material-icons text-base">image</span>
                                                                        </div>
                                                                        <div className="truncate">
                                                                            <p className="text-[13px] lg:text-[11px] font-black text-[#0D1F18] tracking-tight truncate leading-tight">{req.agent}</p>
                                                                            <p className="text-[9px] lg:text-[8px] text-gray-400 font-bold tracking-tight uppercase opacity-60 truncate">{req.listing}</p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Investment & Period Grid */}
                                                                    <div className="grid grid-cols-2 gap-4 mb-5 lg:mb-0 lg:contents">
                                                                        <div className="lg:w-[18%] lg:text-center">
                                                                            <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest lg:hidden mb-1.5">Capital Vector</p>
                                                                            <div className="inline-flex flex-col">
                                                                                <p className="text-[13px] lg:text-[12px] font-black text-primary tracking-tighter lg:tracking-tight">NPR {req.price.toLocaleString()}</p>
                                                                                <p className="text-[8px] lg:text-[7px] text-gray-400 font-black uppercase tracking-widest leading-none mt-0.5">{req.duration}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="lg:w-[18%] lg:text-center">
                                                                            <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest lg:hidden mb-1.5">Temporal Span</p>
                                                                            {req.status === 'approved' && req.approvedAt ? (
                                                                                <div className="inline-flex flex-col items-center lg:items-center">
                                                                                    <p className="text-[10px] lg:text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                                                                        <span className="material-icons text-[10px] animate-pulse">timer</span>
                                                                                        {(() => {
                                                                                            const start = new Date(req.approvedAt);
                                                                                            const now = new Date();
                                                                                            const diff = now - start;
                                                                                            const remainingMs = (req.durationDays * 24 * 60 * 60 * 1000) - diff;
                                                                                            if (remainingMs <= 0) return 'EXPIRED';
                                                                                            const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
                                                                                            const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                                                                            return `${days}d ${hours}h left`;
                                                                                        })()}
                                                                                    </p>
                                                                                    <p className="text-[8px] lg:text-[7px] text-gray-400 font-bold lowercase tracking-tight opacity-70 mt-0.5">{req.startDate} → {req.endDate}</p>
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-[10px] lg:text-[9px] font-bold text-gray-400 lowercase tracking-tight opacity-70 truncate">{req.startDate} → {req.endDate}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Desktop Placement Tier Column */}
                                                                    <div className="hidden lg:flex lg:w-[15%] items-center justify-center">
                                                                        <div className={`inline-flex px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest ${req.color}`}>
                                                                            {req.typeKey}
                                                                        </div>
                                                                    </div>

                                                                    {/* Actions Row */}
                                                                    <div className="lg:w-[12%] pt-4 lg:pt-0 border-t lg:border-none border-gray-50 flex items-center justify-between lg:justify-end gap-1.5">
                                                                        <div className="lg:hidden text-[9px] font-black text-gray-300 uppercase tracking-widest">Master Audit Control</div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <button 
                                                                                onClick={() => handleReviewAd(req.id, 'approved')}
                                                                                className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center border ${req.status === 'approved' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}
                                                                            >
                                                                                <span className="material-icons text-[16px]">check</span>
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleReviewAd(req.id, 'rejected')}
                                                                                className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center border ${req.status === 'rejected' ? 'bg-red-500 text-white border-red-500 shadow-sm' : 'bg-red-50 text-red-500 border-red-100'}`}
                                                                            >
                                                                                <span className="material-icons text-[16px]">close</span>
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => setSelectedAdReview(req)}
                                                                                className="w-8 h-8 rounded-lg bg-gray-50 text-gray-300 hover:text-primary transition-all flex items-center justify-center border border-gray-100"
                                                                            >
                                                                                <span className="material-icons text-[16px]">visibility</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        );
                                    })()}

                                    {activeTab === 'controls' && (
                                        <div className="space-y-8">
                                            {/* Horizontal Sub-Tab Navigation */}
                                            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-1.5 shadow-sm w-fit">
                                                {[
                                                    { id: 'pricing', label: 'Pricing Engine', icon: 'price_change' },
                                                    { id: 'creatives', label: 'Ad Creatives', icon: 'image' },
                                                    { id: 'toggles', label: 'Platform Toggles', icon: 'toggle_on' },
                                                ].map(t => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => setControlsTab(t.id)}
                                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
                                                            controlsTab === t.id
                                                                ? 'bg-[#0D1F18] text-white shadow-md'
                                                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <span className="material-icons text-[15px]">{t.icon}</span>
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* SECTION: Pricing Engine */}
                                            {controlsTab === 'pricing' && (
                                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                                        <div>
                                                            <h3 className="text-[13px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">Advertising Pricing Matrix</h3>
                                                            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Live prices shown on the Advertisement page</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-primary bg-primary/5 px-4 py-2 rounded-lg">
                                                            <span className="material-icons text-[16px]">info</span>
                                                            <span className="text-[10px] font-black uppercase tracking-widest">All prices in NPR</span>
                                                        </div>
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        {/* Desktop Header Row */}
                                                        <div className="hidden lg:flex bg-gray-50 border-b border-gray-100 px-8 py-4">
                                                            <div className="w-[40%] text-[10px] font-black uppercase tracking-widest text-gray-400">Sponsorship Tier</div>
                                                            <div className="w-[20%] text-center text-[10px] font-black uppercase tracking-widest text-gray-400">1 Week</div>
                                                            <div className="w-[20%] text-center text-[10px] font-black uppercase tracking-widest text-gray-400">2 Weeks</div>
                                                            <div className="w-[20%] text-center text-[10px] font-black uppercase tracking-widest text-[#C5A059]">1 Month</div>
                                                        </div>

                                                        {/* Matrix Rows */}
                                                        <div className="divide-y divide-gray-50">
                                                            {[
                                                                { key: 'featured', label: 'Featured Destination (Homepage)', icon: 'home' },
                                                                { key: 'festival', label: 'Festival Highlight', icon: 'celebration' },
                                                                { key: 'search_top', label: 'Top Search Priority', icon: 'manage_search' },
                                                                { key: 'discounts', label: 'Exclusive Deals Section', icon: 'local_offer' },
                                                            ].map(tier => (
                                                                <div key={tier.key} className="flex flex-col lg:flex-row lg:items-center px-6 lg:px-8 py-6 lg:py-5 hover:bg-gray-50/20 transition-colors group">
                                                                    {/* Tier Label Container */}
                                                                    <div className="lg:w-[40%] flex items-center gap-3 mb-6 lg:mb-0">
                                                                        <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-xl lg:rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                                                                            <span className="material-icons text-gray-400 group-hover:text-white text-lg lg:text-[16px] transition-colors">{tier.icon}</span>
                                                                        </div>
                                                                        <span className="text-[14px] lg:text-[12px] font-black text-[#0D1F18]">{tier.label}</span>
                                                                    </div>

                                                                    {/* Duration Inputs Grid */}
                                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:contents gap-4">
                                                                        {['1_week', '2_week', '1_month'].map(dur => (
                                                                            <div key={dur} className="lg:w-[20%] lg:text-center">
                                                                                <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest lg:hidden mb-1.5">
                                                                                    {dur.replace('_', ' ')}
                                                                                </p>
                                                                                <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl lg:rounded-lg px-4 lg:px-3 py-2.5 lg:py-1.5 focus-within:border-primary focus-within:bg-white transition-all w-full lg:w-auto">
                                                                                    <span className="text-gray-400 text-[10px] lg:text-[11px] font-bold">NPR</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={adPrices[dur][tier.key]}
                                                                                        onChange={e => setAdPrices(prev => ({
                                                                                            ...prev,
                                                                                            [dur]: { ...prev[dur], [tier.key]: Number(e.target.value) }
                                                                                        }))}
                                                                                        className="w-full lg:w-20 text-[13px] lg:text-[12px] font-black text-[#0D1F18] bg-transparent outline-none text-right placeholder:text-gray-300"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="px-8 py-5 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Changes will reflect on the Advertisement portal immediately</p>
                                                        <button className="px-8 h-10 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1D7447] transition-all shadow-md shadow-primary/20">
                                                            Save Pricing Matrix
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* SECTION: Ad Creatives */}
                                            {controlsTab === 'creatives' && (
                                                <div className="space-y-6">
                                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                                        <div className="mb-6">
                                                            <h3 className="text-[13px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">Sponsored Banner Library</h3>
                                                            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Upload multiple banners per category. Recommended: 1200×300px — PNG, JPG, WEBP</p>
                                                        </div>
                                                        <div className="space-y-6">
                                                            {[
                                                                { key: 'featured', label: 'Featured Destination', icon: 'home', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                                                                { key: 'festival', label: 'Festival Highlight', icon: 'celebration', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                                                                { key: 'search_top', label: 'Search Priority', icon: 'manage_search', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                                                                { key: 'discounts', label: 'Exclusive Deals', icon: 'local_offer', color: 'bg-red-50 text-red-600 border-red-100' },
                                                            ].map(cat => (
                                                                <div key={cat.key} className="border border-gray-100 rounded-xl overflow-hidden hover:border-primary/20 transition-all">
                                                                    {/* Category Header */}
                                                                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 bg-gray-50/40">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${cat.color}`}>
                                                                                <span className="material-icons text-[14px]">{cat.icon}</span>
                                                                            </div>
                                                                            <span className="text-[11px] font-black text-[#0D1F18] uppercase tracking-wide">{cat.label}</span>
                                                                        </div>
                                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                                            {adCreatives[cat.key].length} image{adCreatives[cat.key].length !== 1 ? 's' : ''}
                                                                        </span>
                                                                    </div>

                                                                    {/* Thumbnails Grid */}
                                                                    <div className="p-4">
                                                                        <div className="flex flex-wrap gap-3">
                                                                            {adCreatives[cat.key].map((src, idx) => (
                                                                                <div key={idx} className="relative group/thumb rounded-lg overflow-hidden border border-gray-100 shadow-sm" style={{ width: '160px', height: '40px' }}>
                                                                                    <img src={src} alt={`${cat.label} ${idx + 1}`} className="w-full h-full object-cover" />
                                                                                    {/* Hover overlay */}
                                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => setAdCreatives(prev => ({
                                                                                                ...prev,
                                                                                                [cat.key]: prev[cat.key].filter((_, i) => i !== idx)
                                                                                            }))}
                                                                                            className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                                                                                        >
                                                                                            <span className="material-icons text-white text-[12px]">close</span>
                                                                                        </button>
                                                                                    </div>
                                                                                    {/* Index badge */}
                                                                                    <div className="absolute top-1 left-1 w-4 h-4 rounded bg-black/60 flex items-center justify-center">
                                                                                        <span className="text-white text-[8px] font-black">{idx + 1}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}

                                                                            {/* Add More Button */}
                                                                            <label className="cursor-pointer flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all gap-1" style={{ width: '80px', height: '40px' }}>
                                                                                <input
                                                                                    type="file"
                                                                                    className="hidden"
                                                                                    accept=".png,.jpg,.jpeg,.webp"
                                                                                    multiple
                                                                                    onChange={e => {
                                                                                        const files = Array.from(e.target.files);
                                                                                        files.forEach(file => {
                                                                                            const reader = new FileReader();
                                                                                            reader.onloadend = () => setAdCreatives(prev => ({
                                                                                                ...prev,
                                                                                                [cat.key]: [...prev[cat.key], reader.result]
                                                                                            }));
                                                                                            reader.readAsDataURL(file);
                                                                                        });
                                                                                        e.target.value = '';
                                                                                    }}
                                                                                />
                                                                                <span className="material-icons text-gray-300 text-[16px] group-hover:text-primary">add</span>
                                                                                <span className="text-[8px] text-gray-300 font-bold uppercase tracking-wider">Add</span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Banners cycle through rotation on the platform automatically</p>
                                                            <button className="px-8 h-10 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1D7447] transition-all shadow-md shadow-primary/20">
                                                                Sync Creative Library
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* SECTION: Platform Toggles */}
                                            {controlsTab === 'toggles' && (
                                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                                    <div className="p-8 border-b border-gray-50">
                                                        <h3 className="text-[13px] font-black text-[#0D1F18] uppercase tracking-[0.2em]">Global Protocol Controls</h3>
                                                        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Master system state management for the entire platform</p>
                                                    </div>
                                                    <div className="p-8 space-y-6">
                                                        {toggles.map((control, i) => (
                                                            <div key={control.id} className="flex items-center justify-between group p-4 rounded-xl hover:bg-gray-50/50 transition-colors">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                                                                        control.active ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-gray-50 border-gray-100 text-gray-300'
                                                                    }`}>
                                                                        <span className="material-icons text-[18px]">{control.icon}</span>
                                                                    </div>
                                                                    <div className="max-w-md">
                                                                        <p className="text-[12px] font-black text-[#0D1F18] tracking-tight mb-0.5">{control.title}</p>
                                                                        <p className="text-[10px] font-bold text-gray-400 leading-relaxed">{control.desc}</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => setToggles(prev => prev.map((t, idx) => idx === i ? { ...t, active: !t.active } : t))}
                                                                    className={`relative w-14 h-8 rounded-full p-1.5 transition-all duration-300 shrink-0 ${
                                                                        control.active ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-200'
                                                                    }`}
                                                                >
                                                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                                                                        control.active ? 'translate-x-6' : 'translate-x-0'
                                                                    }`} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="px-8 py-5 border-t border-gray-50 flex justify-end bg-gray-50/30">
                                                        <button className="px-8 h-10 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1D7447] transition-all shadow-md shadow-primary/20">
                                                            Commit Protocol State
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Common: System Snapshot — Responsive */}
                                            <div className="bg-[#0D1F18] rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row items-center lg:justify-between shadow-2xl shadow-[#1A2B23]/20 relative overflow-hidden text-center lg:text-left">
                                                <div className="absolute right-0 top-0 w-48 h-48 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
                                                <div className="flex flex-col lg:flex-row items-center gap-6 relative z-10 mb-6 lg:mb-0">
                                                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                                        <span className="material-icons text-white text-2xl">save</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-[14px] font-black tracking-tight">System Snapshot</p>
                                                        <p className="text-white/40 text-[9px] font-black tracking-[0.2em] uppercase mt-1">Last Sync: Operational • Auto-Save Enabled</p>
                                                    </div>
                                                </div>
                                                <button className="w-full lg:w-auto px-8 h-12 rounded-xl bg-white text-[#0D1F18] text-[10px] font-black uppercase tracking-widest hover:brightness-90 transition-all relative z-10">Export Protocol Logs</button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>

            {/* Precision Verification Console — Professional Master Terminal */}
            <AnimatePresence>
                {selectedAgent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-8">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setSelectedAgent(null)}
                            className="absolute inset-0 bg-[#0D1F18]/95 backdrop-blur-md"
                        />
                        
                        <motion.div 
                            initial={{ scale: 0.98, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.98, opacity: 0 }}
                            className="bg-white w-full max-w-[1100px] h-fit max-h-[92vh] rounded-[40px] overflow-hidden flex flex-col shadow-2xl relative z-10 border border-gray-100"
                        >
                            {/* Elite Header — Ultra Minimal */}
                            <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#0D1F18] text-white rounded-xl lg:rounded-2xl flex items-center justify-center text-base lg:text-lg font-black shadow-lg">
                                        {selectedAgent.companyName?.[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] lg:text-lg font-black text-[#0D1F18] tracking-tight">{selectedAgent.companyName}</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                            <p className="text-[8px] lg:text-[9px] font-black text-gray-400 uppercase tracking-widest">Awaiting Verification</p>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedAgent(null)} 
                                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#0D1F18] transition-all"
                                >
                                    <span className="material-icons text-xl">close</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 lg:p-10 space-y-6 lg:space-y-10 no-scrollbar bg-white">
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                                    {/* Detailed Credentials Audit */}
                                    <div className="lg:col-span-3 space-y-10">
                                        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                            {[
                                                { label: 'Company Owner', value: selectedAgent.companyOwner || selectedAgent.fullName, icon: 'person_outline' },
                                                { label: 'Email Address', value: selectedAgent.email, icon: 'alternate_email' },
                                                { label: 'Location', value: selectedAgent.location || 'Nepal', icon: 'location_on' },
                                                { label: 'Phone Number', value: selectedAgent.phoneNo || 'NOT_SPECIFIED', icon: 'smartphone' },
                                                { label: 'PAN Number', value: selectedAgent.panNumber, icon: 'corporate_fare' },
                                                { label: 'Citizenship ID', value: selectedAgent.citizenshipNumber || 'C-12345-IDX', icon: 'badge' },
                                                { label: 'Issue District', value: selectedAgent.citizenshipDistrict || 'KTM-NODE-01', icon: 'account_balance' },
                                                { label: 'Issue Date', value: selectedAgent.citizenshipIssueDate || '2023-01-12', icon: 'calendar_today' },
                                            ].map((d, i) => (
                                                <div key={i} className="group">
                                                    <p className="text-[8px] lg:text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2 lg:mb-2.5 group-hover:text-primary transition-colors">{d.label}</p>
                                                    <div className="flex items-center gap-2 lg:gap-3">
                                                        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                                            <span className="material-icons text-[14px] lg:text-base">{d.icon}</span>
                                                        </div>
                                                        <p className="text-[11px] lg:text-[13px] font-bold text-[#0D1F18] tracking-tight">{d.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Visual Evidence Section */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="p-5 lg:p-8 bg-gray-50/50 rounded-2xl lg:rounded-[32px] space-y-4 lg:space-y-6">
                                            <h5 className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] pl-1 mb-2">Uploaded Documents</h5>
                                            
                                            {/* Registration Certificate — A4 Style Concept */}
                                            <div 
                                                onClick={() => setPreviewImage(selectedAgent.panImage?.startsWith('http') ? selectedAgent.panImage : `http://localhost:5000${selectedAgent.panImage}`)}
                                                className="group cursor-pointer bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 hover:border-primary/30 transition-all flex items-center gap-4 lg:gap-5"
                                            >
                                                <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 group-hover:bg-primary/5 group-hover:text-primary transition-all overflow-hidden border border-gray-200">
                                                    {selectedAgent.panImage ? (
                                                        <img src={selectedAgent.panImage.startsWith('http') ? selectedAgent.panImage : `http://localhost:5000${selectedAgent.panImage}`} className="w-full h-full object-cover" alt="PAN" />
                                                    ) : (
                                                        <span className="material-icons">article</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[11px] font-black text-[#0D1F18] uppercase tracking-widest">PAN Document</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Scanned Copy</p>
                                                </div>
                                                <span className="material-icons text-gray-300 text-lg group-hover:text-primary transition-colors">zoom_in</span>
                                            </div>

                                            {/* Unified Citizenship Node */}
                                            <div 
                                                onClick={() => setPreviewImage(selectedAgent.citizenshipImage?.startsWith('http') ? selectedAgent.citizenshipImage : `http://localhost:5000${selectedAgent.citizenshipImage}`)}
                                                className="group cursor-pointer bg-white p-5 rounded-2xl border border-gray-100 hover:border-primary/30 transition-all flex items-center gap-5"
                                            >
                                                <div className="w-12 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 group-hover:bg-primary/5 group-hover:text-primary transition-all overflow-hidden border border-gray-200">
                                                    {selectedAgent.citizenshipImage ? (
                                                        <img src={selectedAgent.citizenshipImage.startsWith('http') ? selectedAgent.citizenshipImage : `http://localhost:5000${selectedAgent.citizenshipImage}`} className="w-full h-full object-cover" alt="Citizenship" />
                                                    ) : (
                                                        <span className="material-icons">badge</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[11px] font-black text-[#0D1F18] uppercase tracking-widest">Citizenship Document</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Scanned Copy</p>
                                                </div>
                                                <span className="material-icons text-gray-300 text-lg group-hover:text-primary transition-colors">zoom_in</span>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-3 text-emerald-600">
                                                    <span className="material-icons text-sm">verified</span>
                                                    <p className="text-[9px] font-black uppercase tracking-widest">Verified Credentials Required</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tactical Action Bar */}
                            <div className="px-6 lg:px-10 py-6 lg:py-8 border-t border-gray-50 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-0 bg-white">
                                <div className="flex items-center gap-3 lg:gap-4 text-center lg:text-left">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse lg:shrink-0" />
                                    <p className="text-[8px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Review uploaded documents to verify agency</p>
                                </div>
                                <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto">
                                    <button 
                                        onClick={() => handleVerifyAgent(selectedAgent.id, 'rejected', false)} 
                                        className="flex-1 lg:flex-none px-6 lg:px-8 h-12 bg-white border border-gray-200 text-[#0D1F18] rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                                    >
                                        DECLINE
                                    </button>
                                    <button 
                                        onClick={() => handleVerifyAgent(selectedAgent.id, 'verified', true)} 
                                        className="flex-1 lg:flex-2 lg:flex-none px-6 lg:px-10 h-12 bg-[#0D1F18] text-white rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-primary transition-all flex items-center justify-center gap-2 lg:gap-3"
                                    >
                                        <span className="material-icons text-[16px] lg:text-base">verified_user</span>
                                        <span className="whitespace-nowrap">VERIFY AGENT</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Immersive High-Definition Visual Lens */}
            <AnimatePresence>
                {previewImage && (() => {
                    const [zoomLevel, setZoomLevel] = React.useState(1);
                    const isCitizenshipPreview = previewImage === (selectedAgent.citizenshipImage?.startsWith('http') ? selectedAgent.citizenshipImage : `http://localhost:5000${selectedAgent.citizenshipImage}`);

                    const handleWheel = React.useCallback((e) => {
                        e.preventDefault();
                        setZoomLevel(prev => Math.min(Math.max(prev - e.deltaY * 0.001, 0.5), 4));
                    }, []);

                    return (
                    <motion.div 
                        key="preview-modal"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onWheel={handleWheel}
                        className="fixed inset-0 z-[200] bg-[#0D1F18]/98 backdrop-blur-[32px] flex flex-col items-center justify-center overflow-hidden"
                        style={{ cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in' }}
                    >
                        <button 
                            onClick={() => { setPreviewImage(null); setZoomLevel(1); }}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all z-20 group border border-white/5"
                        >
                            <span className="material-icons text-xl group-hover:rotate-90 transition-transform">close</span>
                        </button>
                        
                        <div className="flex flex-col items-center justify-center w-full flex-1 overflow-hidden">
                            {isCitizenshipPreview ? (
                                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 w-full h-[72vh] items-center justify-center">
                                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center justify-center flex-1 w-full max-h-[45%] lg:max-h-full">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Front Side</p>
                                        <img
                                            src={previewImage}
                                            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.1s ease-out' }}
                                            className="max-w-full max-h-[90%] lg:max-h-[60vh] object-contain rounded-xl shadow-2xl shadow-black/50"
                                            alt="Front"
                                        />
                                    </motion.div>
                                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center justify-center flex-1 w-full max-h-[45%] lg:max-h-full">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Back Side</p>
                                        <img
                                            src={selectedAgent.citizenshipBackImage ? (selectedAgent.citizenshipBackImage.startsWith('http') ? selectedAgent.citizenshipBackImage : `http://localhost:5000${selectedAgent.citizenshipBackImage}`) : previewImage}
                                            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.1s ease-out' }}
                                            className="max-w-full max-h-[90%] lg:max-h-[60vh] object-contain rounded-xl shadow-2xl shadow-black/50"
                                            alt="Back"
                                        />
                                    </motion.div>
                                </div>
                            ) : (
                                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center w-full h-[82vh]">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 whitespace-nowrap">High-Resolution PAN Document</p>
                                    <img
                                        src={previewImage}
                                        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.1s ease-out' }}
                                        className="max-w-[65vw] max-h-[78vh] object-contain rounded-md shadow-2xl shadow-black/50"
                                        alt="Document"
                                    />
                                </motion.div>
                            )}
                        </div>
                        
                        <div className="py-4 px-6 md:px-10 w-full flex justify-center">
                            <div className="px-6 md:px-10 py-4 bg-[#0D1F18]/80 backdrop-blur-[42px] rounded-[32px] md:rounded-full border border-white/10 flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                    {isCitizenshipPreview ? (
                                        <div className="flex items-center gap-4 whitespace-nowrap">
                                            <p className="text-white/80 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em]"><span className="text-white/40 mr-1.5">OWNER:</span>{selectedAgent.companyOwner || selectedAgent.fullName}</p>
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <p className="text-white/80 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em]"><span className="text-white/40 mr-1.5">CITIZENSHIP NO:</span>{selectedAgent.citizenshipNumber || 'N/A'}</p>
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <p className="text-white/80 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em]"><span className="text-white/40 mr-1.5">DISTRICT:</span>{selectedAgent.citizenshipDistrict || 'N/A'}</p>
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <p className="text-white/80 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em]"><span className="text-white/40 mr-1.5">ISSUE DATE:</span>{selectedAgent.citizenshipIssueDate || 'N/A'}</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 whitespace-nowrap">
                                            <p className="text-white/80 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em]"><span className="text-white/40 mr-1.5">COMPANY:</span>{selectedAgent.companyName || selectedAgent.fullName}</p>
                                            <div className="w-1 h-1 rounded-full bg-white/20" />
                                            <p className="text-white/80 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em]"><span className="text-white/40 mr-1.5">PAN NUMBER:</span>{selectedAgent.panNumber || 'N/A'}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="hidden md:block h-4 w-px bg-white/10 shrink-0" />
                                <p className="hidden md:block text-white/40 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">Scroll to zoom &nbsp;·&nbsp; ESC to close</p>
                            </div>
                        </div>
                    </motion.div>
                    );
                })()}
            </AnimatePresence>
            {/* Ad Detail Immersive Console */}
            <AnimatePresence>
                {selectedAdReview && (
                    <div className="fixed inset-0 z-[150] bg-[#0D1F18]/90 backdrop-blur-md flex items-center justify-center p-6 lg:p-10 p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-[800px] h-fit max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl relative z-10 border border-gray-100"
                        >
                            {/* Header */}
                            <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary text-white rounded-xl lg:rounded-2xl flex items-center justify-center text-lg lg:text-xl font-black shadow-lg">
                                        <span className="material-icons text-base lg:text-lg">campaign</span>
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] lg:text-lg font-black text-[#0D1F18] tracking-tight">Ad Intelligence Console</h2>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedAdReview.status === 'pending' ? 'bg-amber-500 animate-pulse' : selectedAdReview.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <p className="text-[8px] lg:text-[9px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[120px] lg:max-w-none">{selectedAdReview.id} • {selectedAdReview.status} Node</p>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedAdReview(null)} 
                                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#0D1F18] transition-all"
                                >
                                    <span className="material-icons text-xl">close</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 lg:p-10 space-y-6 lg:space-y-8 no-scrollbar bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Partner Data */}
                                    <div className="space-y-6">
                                        <div className="group">
                                            <p className="text-[8px] lg:text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2 lg:mb-2.5">Sponsorship Entity</p>
                                            <p className="text-[14px] lg:text-[16px] font-black text-[#0D1F18] tracking-tight">{selectedAdReview.agent}</p>
                                        </div>
                                        <div className="group">
                                            <p className="text-[8px] lg:text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2 lg:mb-2.5">Target Destination</p>
                                            <p className="text-[11px] lg:text-[13px] font-bold text-gray-500 leading-tight">{selectedAdReview.listing}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 lg:gap-6 pt-2 lg:pt-4">
                                            <div>
                                                <p className="text-[8px] lg:text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1.5">Sponsorship Tier</p>
                                                <span className={`text-[8px] lg:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${selectedAdReview.color}`}>{selectedAdReview.typeKey}</span>
                                            </div>
                                            <div>
                                                <p className="text-[8px] lg:text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1.5">Investment</p>
                                                <p className="text-[12px] lg:text-[14px] font-black text-primary truncate">NPR {selectedAdReview.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Campaign Specs */}
                                    <div className="space-y-4 lg:space-y-6 bg-gray-50 rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-gray-100">
                                        <div className="group">
                                            <p className="text-[8px] lg:text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2 lg:mb-2.5">Temporal Window</p>
                                            <div className="flex items-center gap-2">
                                                <span className="material-icons text-gray-400 text-sm">calendar_today</span>
                                                <p className="text-[10px] lg:text-[12px] font-bold text-[#0D1F18] tracking-tight">{selectedAdReview.startDate} → {selectedAdReview.endDate}</p>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <p className="text-[8px] lg:text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2 lg:mb-2.5">Campaign Duration</p>
                                            <p className="text-[11px] lg:text-[12px] font-black text-[#0D1F18]">{selectedAdReview.duration}</p>
                                        </div>
                                        <div className="pt-4 border-t border-gray-200">
                                            <p className="text-[8px] lg:text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2 lg:mb-2.5">Target Logic Vector</p>
                                            <a href={selectedAdReview.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[9px] lg:text-[10px] font-black text-primary hover:underline group">
                                                <span className="material-icons text-sm">link</span>
                                                <span className="truncate max-w-[150px] lg:max-w-[180px]">{selectedAdReview.link}</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Creative Preview Section */}
                                <div className="space-y-6">
                                    {selectedAdReview.status === 'rejected' && selectedAdReview.rejectionReason && (
                                        <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
                                            <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em] mb-2.5">Protocol Rejection Reason</p>
                                            <p className="text-[12px] font-bold text-red-900 leading-relaxed italic">"{selectedAdReview.rejectionReason}"</p>
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Creative Asset Audit</p>
                                        <div className="w-full h-32 rounded-[24px] bg-gray-50 border border-gray-100 flex items-center justify-center group overflow-hidden relative">
                                            <span className="material-icons text-gray-200 text-4xl group-hover:scale-110 transition-transform">image</span>
                                            <div className="absolute inset-x-0 bottom-0 p-3 bg-white/80 backdrop-blur-sm flex justify-center border-t border-gray-100">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Banner Simulation Logic Loaded</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                             <div className="px-6 lg:px-10 py-6 lg:py-8 border-t border-gray-50 flex flex-col lg:flex-row items-center justify-end gap-3 lg:gap-4 bg-gray-50/10">
                                <button 
                                    onClick={() => handleReviewAd(selectedAdReview.id, 'rejected')}
                                    className={`w-full lg:w-auto px-8 h-12 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-all ${selectedAdReview.status === 'rejected' ? 'bg-red-500 text-white shadow-lg' : 'bg-white border border-gray-200 text-[#0D1F18] hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
                                >
                                    {selectedAdReview.status === 'rejected' ? 'REJECTED' : 'REJECT SPONSORSHIP'}
                                </button>
                                <button 
                                    onClick={() => handleReviewAd(selectedAdReview.id, 'approved')}
                                    className={`w-full lg:w-auto px-10 h-12 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 lg:gap-3 ${selectedAdReview.status === 'approved' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-[#0D1F18] text-white hover:bg-primary shadow-2xl shadow-black/20'}`}
                                >
                                    <span className="material-icons text-base">{selectedAdReview.status === 'approved' ? 'verified' : 'publish'}</span>
                                    <span className="whitespace-nowrap">{selectedAdReview.status === 'approved' ? 'ACTIVE CAMPAIGN' : 'AUTHORIZE PLACEMENT'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Audit Rejection Dialog */}
            <AnimatePresence>
                {rejectionTarget && (
                    <div className="fixed inset-0 z-[200] bg-[#0D1F18]/95 backdrop-blur-xl flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ scale: 0.98, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            className="bg-white w-full max-w-[500px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 p-10 space-y-8"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shadow-inner">
                                    <span className="material-icons text-xl">gavel</span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-[#0D1F18] tracking-tight uppercase">Audit Rejection Protocol</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Enter manual justification for legal non-compliance</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <textarea 
                                    value={rejectionReason}
                                    onChange={(e) => {
                                        setRejectionReason(e.target.value);
                                        if (e.target.value.trim()) setRejectionError(false);
                                    }}
                                    placeholder={rejectionError ? "JUSTIFICATION REQUIRED: Provide precise details for rejection node..." : "Describe compliance violation detail..."}
                                    className={`w-full h-32 p-6 bg-gray-50 border ${rejectionError ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100'} rounded-xl text-[12px] font-bold text-[#0D1F18] focus:bg-white focus:border-red-200 transition-all outline-none resize-none no-scrollbar ${rejectionError ? 'placeholder:text-red-400' : ''}`}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => {
                                        setRejectionTarget(null);
                                        setRejectionError(false);
                                    }}
                                    className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={submitRejection}
                                    className="flex-[2] h-12 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-500/10 hover:bg-red-700 transition-all font-display"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Approval Confirmation Dialog */}
            <AnimatePresence>
                {approvalTarget && (
                    <div className="fixed inset-0 z-[200] bg-[#0D1F18]/95 backdrop-blur-xl flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ scale: 0.98, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            className="bg-white w-full max-w-[450px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 p-10 space-y-8"
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shadow-inner">
                                    <span className="material-icons text-xl">verified</span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-[#0D1F18] tracking-tight uppercase">Authorize Placement</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Proceed with authorizing this sponsorship node?</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 italic">
                                <p className="text-[11px] font-bold text-gray-500 text-center leading-relaxed">
                                    "I confirm that all creative assets and target destinations for this ad campaign have been audited and meet platform compliance standards."
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setApprovalTarget(null)}
                                    className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-all"
                                >
                                    Go Back
                                </button>
                                <button 
                                    onClick={submitApproval}
                                    className="flex-[2] h-12 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/10 hover:bg-emerald-700 transition-all font-display"
                                >
                                    Confirm Authorization
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SuperDashboard;
