import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardAPI } from './api';

const LISTING_TYPES = ['hotel', 'trekking', 'travel'];

const ListingsSection = ({ listings, onRefresh }) => {
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ 
        title: '', description: '', type: 'hotel', price: '', offers: '', images: '', 
        acRooms: 0, nonAcRooms: 0, familyRooms: 0, coupleRooms: 0, duration: 1,
        totalRooms: 0,
        amenities: '', itinerary: [''], hotelCategory: 'hotel',
        acPrice: 0, nonAcPrice: 0, familyPrice: 0, couplePrice: 0
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [error, setError] = useState(null);

    const openCreate = () => {
        setEditItem(null);
        setError(null);
        setForm({ 
            title: '', description: '', type: 'hotel', price: '', offers: '', images: '', 
            acRooms: 0, nonAcRooms: 0, familyRooms: 0, coupleRooms: 0, duration: 1,
            totalRooms: 0,
            amenities: '', itinerary: [''], hotelCategory: 'hotel',
            acPrice: 0, nonAcPrice: 0, familyPrice: 0, couplePrice: 0
        });
        setShowModal(true);
    };

    const openEdit = (listing) => {
        setEditItem(listing);
        setError(null);
        setForm({
            title: listing.title || '',
            description: listing.description || '',
            type: listing.type || 'hotel',
            price: listing.price || '',
            offers: listing.offers || '',
            images: (listing.images || []).join(', '),
            totalRooms: listing.totalRooms || '',
            acRooms: listing.acRooms || 0,
            nonAcRooms: listing.nonAcRooms || 0,
            familyRooms: listing.familyRooms || 0,
            coupleRooms: listing.coupleRooms || 0,
            duration: listing.duration || 1,
            amenities: (listing.amenities || []).join(', '),
            itinerary: listing.itinerary?.length > 0 ? listing.itinerary : [''],
            hotelCategory: listing.hotelCategory || 'hotel',
            acPrice: listing.acPrice || 0,
            nonAcPrice: listing.nonAcPrice || 0,
            familyPrice: listing.familyPrice || 0,
            couplePrice: listing.couplePrice || 0
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            setError(null);
            setSaving(true);
            
            // Strictly sanitize numeric fields to avoid Postgres "" (empty string) errors for INTEGERS
            const data = {
                ...form,
                price: parseFloat(form.price) || 0,
                totalRooms: parseInt(form.totalRooms) || 0,
                acRooms: parseInt(form.acRooms) || 0,
                nonAcRooms: parseInt(form.nonAcRooms) || 0,
                familyRooms: parseInt(form.familyRooms) || 0,
                coupleRooms: parseInt(form.coupleRooms) || 0,
                acPrice: parseFloat(form.acPrice) || 0,
                nonAcPrice: parseFloat(form.nonAcPrice) || 0,
                familyPrice: parseFloat(form.familyPrice) || 0,
                couplePrice: parseFloat(form.couplePrice) || 0,
                duration: form.type === 'hotel' ? 1 : (parseInt(form.duration) || 1),
                images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
                amenities: form.amenities ? form.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
                itinerary: form.itinerary.map(s => s.trim()).filter(Boolean)
            };

            // Remove id, agentId, companyName from data if they exist to prevent primary key/identity issues
            delete data.id;
            delete data.agentId;
            delete data.companyName;

            if (editItem) {
                await dashboardAPI.updateListing(editItem.id, data);
            } else {
                await dashboardAPI.createListing(data);
            }
            setShowModal(false);
            setEditItem(null);
            onRefresh();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.message || "Failed to commit changes. Check your inputs.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setDeleting(id);
            await dashboardAPI.deleteListing(id);
            onRefresh();
            setDeleteConfirm(null);
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(null);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('image', file);
            const { data } = await dashboardAPI.uploadImage(formData);
            const currentImages = form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [];
            setForm(f => ({ ...f, images: [...currentImages, data.url].join(', ') }));
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    const typeIcon = { hotel: 'hotel', trekking: 'terrain', travel: 'flight_takeoff' };
    const typeColor = { hotel: 'text-emerald-600 bg-emerald-50', trekking: 'text-amber-600 bg-amber-50', travel: 'text-blue-600 bg-blue-50' };

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-[18px] lg:text-[24px] font-black text-[#0D1F18] tracking-tight">Active Inventory</h2>
                    <p className="text-[9px] lg:text-[11px] text-gray-400 mt-1 font-bold uppercase tracking-[0.2em]">{listings.length} Registered Institutional Assets</p>
                </div>
                <button 
                    onClick={openCreate}
                    className="bg-[#0D1F18] text-white px-5 lg:px-8 py-2.5 lg:py-3.5 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0D1F18]/10 flex items-center justify-center gap-2"
                >
                    <span className="material-icons text-[16px]">add_business</span>
                    <span className="hidden sm:inline">Register New Asset</span>
                    <span className="sm:hidden">Register</span>
                </button>
            </div>

            {/* List Header */}
            {/* Responsive Header */}
            <div className="flex lg:grid lg:grid-cols-12 px-2 lg:px-8 py-2 text-[10px] font-black text-gray-400 lg:text-gray-500 uppercase tracking-widest border-b border-gray-50 mb-4 lg:mb-2">
                <div className="w-[40px] lg:col-span-1">Icon</div>
                <div className="flex-1 lg:col-span-3">Asset Identity</div>
                <div className="w-[80px] lg:col-span-1 hidden sm:block lg:block">Type</div>
                <div className="w-[120px] lg:col-span-3 hidden lg:block">Inventory Segmentation</div>
                <div className="w-[100px] lg:col-span-2 text-center lg:text-left">Baseline</div>
                <div className="w-[60px] lg:col-span-2 text-right lg:text-right">Actions</div>
            </div>

            {/* List Rows */}
            <div className="space-y-4">
                {listings.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-24 lg:py-40 flex flex-col items-center justify-center bg-white rounded-[32px] border border-dashed border-gray-100"
                    >
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <span className="material-icons text-[32px] text-gray-200">storefront</span>
                        </div>
                        <h3 className="text-[14px] font-black text-[#0D1F18] uppercase tracking-[0.2em] mb-2">Registry Currently Bare</h3>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest text-center max-w-[240px] leading-relaxed">
                            There are no assets currently registered in the system. Use the action button above to list a new experience.
                        </p>
                    </motion.div>
                ) : (
                    listings.map((l, i) => (
                         <motion.div 
                             key={l.id}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: i * 0.04 }}
                             className="bg-white rounded-2xl lg:rounded-[16px] flex flex-col lg:grid lg:grid-cols-12 lg:items-center p-4 lg:px-8 lg:py-2.5 border border-gray-100 shadow-sm hover:shadow-md transition-all group gap-4 lg:gap-0"
                         >
                            <div className="flex items-center justify-between lg:col-span-1">
                                {l.images?.[0] ? (
                                    <img src={l.images[0]} className="w-12 h-12 lg:w-8 lg:h-8 rounded-xl lg:rounded-lg object-cover shadow-sm" alt="" />
                                ) : (
                                    <div className="w-12 h-12 lg:w-8 lg:h-8 rounded-xl lg:rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 transition-all group-hover:bg-[#0D1F18] group-hover:text-white border border-gray-100"><span className="material-icons text-[20px] lg:text-[18px]">{typeIcon[l.type]}</span></div>
                                )}
                                <div className="lg:hidden flex gap-2">
                                    <button onClick={() => openEdit(l)} className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center active:bg-[#0D1F18] active:text-white transition-all border border-gray-100">
                                        <span className="material-icons text-[16px]">edit</span>
                                    </button>
                                    <button onClick={() => setDeleteConfirm(l.id)} className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center active:bg-red-500 active:text-white transition-all border border-red-100">
                                        <span className="material-icons text-[16px]">delete_outline</span>
                                    </button>
                                </div>
                            </div>
                            <div className="lg:col-span-3">
                                <span className="lg:hidden text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Asset Identity</span>
                                <span className="text-[14px] lg:text-[13px] font-black text-[#0D1F18] block truncate lg:pr-4 leading-tight">{l.title}</span>
                                <span className="text-[9px] lg:text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-60">REF-ID: {l.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className="lg:col-span-1">
                                <span className="lg:hidden text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Classification</span>
                                <div className="flex flex-row lg:flex-col gap-2 items-center lg:items-start">
                                    <span className={`w-fit text-[8px] lg:text-[7px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm ${typeColor[l.type]}`}>{l.type}</span>
                                    {l.type === 'hotel' && l.hotelCategory === 'homestay' && (
                                        <span className="w-fit text-[7px] lg:text-[6px] font-black text-gray-400 uppercase tracking-widest opacity-80">{l.hotelCategory}</span>
                                    )}
                                </div>
                            </div>
                            <div className="lg:col-span-3">
                                <span className="lg:hidden text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Inventory Segmentation</span>
                                <div className="flex flex-wrap gap-2 max-w-full">
                                    {l.type === 'hotel' ? (
                                        <>
                                            {l.acRooms > 0 && <div className="bg-gray-50/80 border border-gray-100 px-2 py-1.5 rounded-lg flex items-center gap-2"><p className="text-[8px] font-black text-gray-400 uppercase leading-none">AC</p><p className="text-[10px] lg:text-[8px] font-black text-[#0D1F18] tracking-tighter">NPR {parseFloat(l.acPrice).toLocaleString()}</p></div>}
                                            {l.nonAcRooms > 0 && <div className="bg-gray-50/80 border border-gray-100 px-2 py-1.5 rounded-lg flex items-center gap-2"><p className="text-[8px] font-black text-gray-400 uppercase leading-none">NAC</p><p className="text-[10px] lg:text-[8px] font-black text-[#0D1F18] tracking-tighter">NPR {parseFloat(l.nonAcPrice).toLocaleString()}</p></div>}
                                            {l.familyRooms > 0 && <div className="bg-gray-50/80 border border-gray-100 px-2 py-1.5 rounded-lg flex items-center gap-2"><p className="text-[8px] font-black text-gray-400 uppercase leading-none">FAM</p><p className="text-[10px] lg:text-[8px] font-black text-[#0D1F18] tracking-tighter">NPR {parseFloat(l.familyPrice).toLocaleString()}</p></div>}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="bg-gray-50/80 border border-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                <p className="text-[8px] font-black text-gray-400 uppercase leading-none">Duration</p>
                                                <p className="text-[11px] lg:text-[10px] font-black text-[#0D1F18]">{l.duration || 1} Days Operation</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <div className="flex flex-row lg:flex-col justify-between items-center lg:items-start pt-3 lg:pt-0 border-t lg:border-none border-gray-50 mt-1 lg:mt-0">
                                    <div>
                                        <span className="lg:hidden text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Baseline Rate</span>
                                        <span className="text-[16px] lg:text-[13px] font-black text-[#0D1F18] tracking-tight">NPR {parseFloat(l.price || 0).toLocaleString()}</span>
                                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest block leading-none mt-1 opacity-60">
                                            {l.type === 'hotel' ? 'Base Reference' : 'Operational Rate'}
                                        </span>
                                    </div>
                                    <div className="lg:hidden">
                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:flex lg:col-span-2 justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                <button onClick={() => openEdit(l)} className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[#0D1F18] hover:text-white transition-all shadow-sm"><span className="material-icons text-[14px]">edit</span></button>
                                <button onClick={() => setDeleteConfirm(l.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"><span className="material-icons text-[14px]">delete_outline</span></button>
                            </div>
                        </motion.div>
                    )
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[10000] overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            onClick={() => setShowModal(false)} 
                            className="fixed inset-0 bg-black/5 backdrop-blur-[8px]" 
                        />
                        <div className="flex min-h-full items-end lg:items-center justify-center p-0 lg:p-12">
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0, y: 100 }} 
                                animate={{ scale: 1, opacity: 1, y: 0 }} 
                                exit={{ scale: 0.95, opacity: 0, y: 100 }}
                                className="relative bg-white rounded-t-[40px] lg:rounded-[40px] w-full max-w-xl shadow-2xl border border-white p-6 md:p-12"
                            >
                                 <button 
                                    onClick={() => { setShowModal(false); setEditItem(null); }} 
                                    className="absolute top-6 lg:top-8 right-6 lg:right-8 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#0D1F18] hover:text-white transition-all shadow-sm z-10"
                                >
                                    <span className="material-icons text-[18px]">close</span>
                                </button>

                                <h3 className="text-[18px] lg:text-[22px] font-black text-[#0D1F18] mb-1">{editItem ? 'Update Asset' : 'Register Asset'}</h3>
                                <p className="text-[9px] lg:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8 lg:mb-10">Inventory Management Console</p>
                                
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }} 
                                        animate={{ opacity: 1, height: 'auto' }} 
                                        className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-500"
                                    >
                                        <span className="material-icons text-[18px]">error_outline</span>
                                        <span className="text-[11px] font-bold uppercase tracking-wider">{error}</span>
                                    </motion.div>
                                )}

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Classification</label>
                                        <div className="flex gap-2">
                                            {LISTING_TYPES.map(t => (
                                                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.type === t ? 'bg-[#0D1F18] text-white' : 'bg-white text-gray-400'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {form.type === 'hotel' && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Stay Category</label>
                                            <div className="flex gap-2 p-1.5 bg-[#F7F6F3]/50 rounded-[22px]">
                                                {['hotel', 'homestay'].map(c => (
                                                    <button 
                                                        key={c} 
                                                        onClick={() => setForm(f => ({ ...f, hotelCategory: c }))} 
                                                        className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${form.hotelCategory === c ? 'bg-white text-[#0D1F18] shadow-sm' : 'text-gray-400 hover:text-gray-500'}`}
                                                    >
                                                        {c === 'hotel' ? 'Standard Hotel' : 'Homestay'}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                    <div><label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Asset Title</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[13px] font-bold outline-none" /></div>
                                    {(form.type === 'trekking' || form.type === 'travel') && (
                                        <div>
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Duration (Days)</label>
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value={form.duration === 0 ? '' : form.duration} 
                                                onChange={e => {
                                                    const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                    setForm(f => ({ ...f, duration: isNaN(val) ? 0 : Math.max(0, val) }));
                                                }} 
                                                className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[13px] font-bold outline-none" 
                                                placeholder="e.g. 7" 
                                            />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Institutional Rate (NPR)</label><input 
                                            type="number" 
                                            min="0" 
                                            value={form.price === 0 ? '' : form.price} 
                                            onChange={e => {
                                                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                setForm(f => ({ ...f, price: isNaN(val) ? 0 : Math.max(0, val) }));
                                            }} 
                                            placeholder="0"
                                            className="w-full h-14 bg-[#F7F6F3]/50 rounded-[20px] px-6 text-[13px] font-bold outline-none" 
                                        /></div>
                                        <div>
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Visual Documentation</label>
                                            <div className="relative group/upload h-14">
                                                <input 
                                                    type="file" 
                                                    id="asset-upload" 
                                                    className="hidden" 
                                                    accept="image/png, image/jpeg, image/jpg"
                                                    onChange={handleFileUpload}
                                                    multiple
                                                />
                                                <label 
                                                    htmlFor="asset-upload" 
                                                    className="w-full h-full bg-[#F7F6F3]/50 rounded-[20px] border-2 border-dashed border-gray-100 flex items-center justify-center gap-3 cursor-pointer hover:bg-white hover:border-[#0D1F18]/20 transition-all text-gray-400 group-hover/upload:text-[#0D1F18]"
                                                >
                                                    <span className="material-icons text-[18px]">{uploading ? 'sync' : 'add_a_photo'}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{uploading ? 'Processing...' : 'Upload Image'}</span>
                                                </label>
                                                {uploading && <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] rounded-[20px] flex items-center justify-center"><div className="w-5 h-5 border-2 border-[#0D1F18] border-t-transparent rounded-full animate-spin" /></div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image List / URLs */}
                                    <div>
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Asset Visual Registry (URLs)</label>
                                        <div className="space-y-3">
                                            <input 
                                                value={form.images} 
                                                onChange={e => setForm(f => ({ ...f, images: e.target.value }))} 
                                                className="w-full h-12 bg-[#F7F6F3]/50 rounded-[18px] px-6 text-[11px] font-medium outline-none" 
                                                placeholder="URLs (comma separated)" 
                                            />
                                            
                                            {form.images && (
                                                <div className="flex gap-2 p-3 bg-gray-50/50 rounded-[20px] overflow-x-auto no-scrollbar">
                                                    {form.images.split(',').map(s => s.trim()).filter(Boolean).map((img, idx) => (
                                                        <div key={idx} className="relative group/preview flex-shrink-0">
                                                            <img src={img} className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm" alt="" />
                                                            <button 
                                                                onClick={() => {
                                                                    const current = form.images.split(',').map(s => s.trim()).filter(Boolean);
                                                                    current.splice(idx, 1);
                                                                    setForm(f => ({ ...f, images: current.join(', ') }));
                                                                }}
                                                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all scale-75"
                                                            >
                                                                <span className="material-icons text-[12px]">close</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {form.type === 'hotel' && (
                                        <div>
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Inventory & Pricing Segmentation</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { key: 'ac', label: 'AC Room' },
                                                    { key: 'nonAc', label: 'Non-AC Room' },
                                                    { key: 'family', label: 'Family Suite' },
                                                    { key: 'couple', label: 'Couple Suite' }
                                                ].map(r => (
                                                    <div key={r.key} className="bg-[#F7F6F3]/50 p-4 rounded-2xl border border-transparent focus-within:border-[#0D1F18]/10 transition-all">
                                                        <p className="text-[7px] font-black text-gray-400 uppercase mb-3 tracking-widest">{r.label}</p>
                                                        <div className="flex gap-4">
                                                            <div className="flex-1">
                                                                <span className="text-[6px] font-bold text-gray-300 uppercase block mb-1">Qty</span>
                                                                <input 
                                                                    type="number" 
                                                                    min="0" 
                                                                    value={form[`${r.key}Rooms`] === 0 ? '' : form[`${r.key}Rooms`]} 
                                                                    onChange={e => {
                                                                        const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                                        setForm(f => ({ ...f, [`${r.key}Rooms`]: isNaN(val) ? 0 : Math.max(0, val) }));
                                                                    }} 
                                                                    placeholder="0"
                                                                    className="bg-transparent w-full text-[13px] font-black outline-none" 
                                                                />
                                                            </div>
                                                            <div className="flex-[1.5] border-l border-gray-100 pl-4">
                                                                <span className="text-[6px] font-bold text-gray-300 uppercase block mb-1">Price (NPR)</span>
                                                                <input 
                                                                    type="number" 
                                                                    min="0" 
                                                                    value={form[`${r.key}Price`] === 0 ? '' : form[`${r.key}Price`]} 
                                                                    onChange={e => {
                                                                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                                        setForm(f => ({ ...f, [`${r.key}Price`]: isNaN(val) ? 0 : Math.max(0, val) }));
                                                                    }} 
                                                                    placeholder="0"
                                                                    className="bg-transparent w-full text-[13px] font-black outline-none" 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block">Service Amenities (Comma Separated)</label>
                                        <input 
                                            value={form.amenities} 
                                            onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} 
                                            className="w-full h-12 bg-[#F7F6F3]/50 rounded-[18px] px-6 text-[11px] font-medium outline-none" 
                                            placeholder="e.g. Wifi, Breakfast, AC, Pool, Trekking Guide" 
                                        />
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {form.amenities.split(',').map(s => s.trim()).filter(Boolean).map((tag, idx) => (
                                                <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {(form.type === 'trekking' || form.type === 'travel') && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Itinerary Detail</label>
                                                <span className="text-[7px] font-bold text-[#C5A059] uppercase tracking-widest opacity-40">Paste or Type</span>
                                            </div>
                                            
                                            <div 
                                                className="bg-[#F7F6F3]/30 rounded-[28px] overflow-hidden transition-all"
                                                style={{ 
                                                    maxHeight: '320px',
                                                    overflowY: form.itinerary.length > 4 ? 'auto' : 'visible'
                                                }}
                                            >
                                                <div className="divide-y divide-gray-100/20">
                                                    {form.itinerary.map((desc, idx) => (
                                                        <div key={idx} className="flex min-h-[50px] group">
                                                            <div className="w-20 flex items-start justify-center pt-4 tracking-normal">
                                                                <span className="text-[9px] font-black text-gray-200 group-focus-within:text-[#C5A059] transition-colors uppercase">
                                                                    Day {(idx + 1).toString().padStart(2, '0')}
                                                                </span>
                                                            </div>
                                                            <textarea 
                                                                value={desc}
                                                                placeholder={idx === 0 ? "Trip starts here..." : ""}
                                                                rows={1}
                                                                onInput={(e) => {
                                                                    e.target.style.height = 'auto';
                                                                    e.target.style.height = e.target.scrollHeight + 'px';
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        const next = [...form.itinerary];
                                                                        next.splice(idx + 1, 0, '');
                                                                        setForm(f => ({ ...f, itinerary: next }));
                                                                        setTimeout(() => {
                                                                            const inputs = e.target.closest('.divide-y').querySelectorAll('textarea');
                                                                            inputs[idx + 1]?.focus();
                                                                        }, 0);
                                                                    }
                                                                    if (e.key === 'Backspace' && !desc && form.itinerary.length > 1) {
                                                                        e.preventDefault();
                                                                        const next = [...form.itinerary];
                                                                        next.splice(idx, 1);
                                                                        setForm(f => ({ ...f, itinerary: next }));
                                                                        setTimeout(() => {
                                                                            const inputs = e.target.closest('.divide-y').querySelectorAll('textarea');
                                                                            inputs[Math.max(0, idx - 1)]?.focus();
                                                                        }, 0);
                                                                    }
                                                                }}
                                                                onPaste={(e) => {
                                                                    const text = e.clipboardData.getData('text');
                                                                    if (text.includes('\n')) {
                                                                        e.preventDefault();
                                                                        const parts = text.split('\n').map(s => s.trim()).filter(Boolean);
                                                                        const next = [...form.itinerary];
                                                                        next.splice(idx, 1, ...parts);
                                                                        setForm(f => ({ ...f, itinerary: next }));
                                                                    }
                                                                }}
                                                                onChange={e => {
                                                                    const next = [...form.itinerary];
                                                                    next[idx] = e.target.value;
                                                                    setForm(f => ({ ...f, itinerary: next }));
                                                                }}
                                                                className="flex-1 bg-transparent py-4 pr-6 text-[11px] font-medium outline-none resize-none placeholder:text-gray-200/50 leading-relaxed overflow-hidden" 
                                                            />
                                                            {form.itinerary.length > 1 && (
                                                                <button 
                                                                    onClick={() => {
                                                                        const next = [...form.itinerary];
                                                                        next.splice(idx, 1);
                                                                        setForm(f => ({ ...f, itinerary: next }));
                                                                    }}
                                                                    className="w-8 opacity-0 group-hover:opacity-100 flex items-center justify-center text-gray-200 hover:text-[#1A2B23] transition-all"
                                                                >
                                                                    <span className="material-icons text-[14px]">close</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 block px-1">Institutional Description</label>
                                        <textarea 
                                            value={form.description} 
                                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                                            placeholder="Overview of the experience..."
                                            rows={3} 
                                            className="w-full bg-[#F7F6F3]/30 rounded-[28px] p-6 text-[11px] font-medium outline-none resize-none placeholder:text-gray-200/50 leading-relaxed" 
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 lg:mt-12 flex flex-col lg:flex-row gap-4">
                                    <button 
                                        disabled={saving}
                                        onClick={() => setShowModal(false)} 
                                        className="h-12 lg:h-14 rounded-xl lg:rounded-[22px] border border-gray-100 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        disabled={saving || !form.title}
                                        onClick={handleSave} 
                                        className="h-12 lg:h-14 bg-[#0D1F18] text-white rounded-xl lg:rounded-[22px] text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0D1F18]/20 transition-all border-none flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:shadow-none lg:flex-[2]"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            'Commit Record'
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setDeleteConfirm(null)}
                            className="absolute inset-0 bg-[#0D1F18]/40 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl text-center"
                        >
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="material-icons text-red-500 text-3xl">delete_sweep</span>
                            </div>
                            <h3 className="text-lg font-black text-[#0D1F18] mb-2">De-register Asset?</h3>
                            <p className="text-[12px] text-gray-400 font-medium leading-relaxed mb-8">
                                This action will permanently remove the asset from the platform registry. This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleDelete(deleteConfirm)}
                                    disabled={deleting === deleteConfirm}
                                    className="flex-[1.5] h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-[#0D1F18] hover:bg-red-600 transition-all shadow-lg shadow-red-500/10 flex items-center justify-center gap-2"
                                >
                                    {deleting === deleteConfirm ? 'Removing...' : 'Delete Asset'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ListingsSection;
