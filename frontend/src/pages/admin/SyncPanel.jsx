import { useState, useEffect } from "react";
import axios from "../../api/axios";
import {
    RefreshCw, Users, Database, CheckCircle2,
    GraduationCap, AlertCircle, Play,
    ChevronDown, Edit2, Trash2, Search, SlidersHorizontal,
    Clock
} from "lucide-react";

/** Years from current down to 2023 */
function getAvailableYears() {
    const cur = new Date().getFullYear();
    const years = [];
    for (let y = cur; y >= 2023; y--) years.push(y);
    return years;
}

/** Format a date string to DD-MM-YYYY */
function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, suffix }) {
    return (
        <div
            className="flex items-center gap-4 bg-white border border-[#d0d3d9] rounded-2xl px-5 py-4 w-full"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* Icon box — light blue */}
            <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                <Icon size={24} style={{ color: "#3B82F6" }} />
            </div>
            {/* Text */}
            <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold text-[#616161] leading-tight">{label}</p>
                <p className="text-2xl font-bold text-black leading-tight">
                    {value}
                    {suffix && <span className="text-sm font-semibold text-[#616161] ml-1">{suffix}</span>}
                </p>
            </div>
        </div>
    );
}

// ─── Batch List Item (Mobile) ────────────────────────────────────────────────────────
function BatchItem({ batch, isLast, onEdit, onDelete }) {
    const name = batch.name || "—";
    const studentCount = batch.students ? batch.students.length : (batch.studentCount ?? 0);
    const scheme = batch.scheme || "2019";
    const uploadedDate = formatDate(batch.updatedAt || batch.createdAt);

    return (
        <div
            className={`flex items-start justify-between py-10 gap-4 ${!isLast ? "border-b border-[#d0d3d9]" : ""}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* Left info */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">
                {/* Batch name + student count */}
                <div className="flex items-baseline gap-1 flex-wrap">
                    <p className="font-bold text-black text-2xl leading-tight">{name}</p>
                    <p className="text-sm text-[#616161] font-medium">· {studentCount} students</p>
                </div>
                {/* Details */}
                <div className="flex flex-col gap-1">
                    <p className="font-semibold text-black text-base">Scheme: {scheme}</p>
                    <p className="text-sm text-[#616161] font-medium">Uploaded: {uploadedDate}</p>
                </div>
            </div>

            {/* Right action buttons — aligned to center */}
            <div className="flex gap-[10px] items-center shrink-0 self-center">
                <button
                    onClick={() => onEdit && onEdit(batch)}
                    className="size-14 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors"
                    title="Edit"
                >
                    <Edit2 size={18} />
                </button>
                <button
                    onClick={() => onDelete && onDelete(batch._id)}
                    className="size-14 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors"
                    title="Delete"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function SyncPanel() {
    const [status,       setStatus]       = useState(null);
    const [checkpoint,   setCheckpoint]   = useState(null);
    const [batches,      setBatches]      = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [isSyncing,    setIsSyncing]    = useState(false);
    const [syncMode,     setSyncMode]     = useState("");
    const [message,      setMessage]      = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [gapResult,    setGapResult]    = useState(null);
    const [searchQuery,  setSearchQuery]  = useState("");
    const [visibleCount, setVisibleCount] = useState(6);
    const [showYearPicker, setShowYearPicker] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [statusRes, checkpointRes] = await Promise.all([
                axios.get("/sync/status"),
                axios.get("/sync/checkpoint").catch(() => ({ data: null })),
            ]);
            setStatus(statusRes.data);
            setBatches(statusRes.data?.batches || []);
            if (checkpointRes?.data) setCheckpoint(checkpointRes.data);
        } catch (err) {
            console.error("Error fetching sync data:", err);
        } finally {
            setLoading(false);
        }
    };

    const pendingCount   = checkpoint?.pendingCount   ?? 0;
    const completedCount = checkpoint?.completedCount ?? 0;
    const totalPrefixes  = checkpoint?.totalPrefixes  ?? 0;
    const allPrefixesDone = completedCount > 0 && completedCount >= totalPrefixes;
    const hasPending     = pendingCount > 0;

    const handleSync = async () => {
        setIsSyncing(true);
        setGapResult(null);
        setMessage("");

        try {
            if (allPrefixesDone) {
                setSyncMode("gaps");
                const res = await axios.post("/sync/fill-gaps", { year: String(selectedYear) }, { timeout: 120000 });
                setGapResult(res.data);
                setMessage(res.data.message || "✅ Gap fill complete.");
            } else {
                setSyncMode("balance");
                const res = await axios.post(
                    "/sync/automate-browser",
                    { mode: "balance", year: String(selectedYear) },
                    { timeout: 360000 }
                );
                setMessage(res.data.message || "✅ Google Contacts Sync completed successfully!");
            }
            await loadData();
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || "Sync failed. Please check terminal logs.");
        } finally {
            setIsSyncing(false);
            setSyncMode("");
            loadData();
        }
    };

    const handleSyncDirectory = async () => {
        setIsSyncing(true);
        setSyncMode("directory");
        setMessage("");
        try {
            const res = await axios.post(
                "/sync/automate-browser",
                { mode: "balance", year: String(selectedYear) },
                { timeout: 360000 }
            );
            setMessage(res.data.message || "✅ Directory sync completed!");
            await loadData();
        } catch (err) {
            setMessage(err.response?.data?.message || "Sync failed.");
        } finally {
            setIsSyncing(false);
            setSyncMode("");
        }
    };

    // Filtered + paginated batches
    const filteredBatches = batches.filter(b => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            b.name?.toLowerCase().includes(q) ||
            b.branch?.toLowerCase().includes(q) ||
            String(b.admissionYear).includes(q)
        );
    });
    const visibleBatches = filteredBatches.slice(0, visibleCount);
    const hasMore = visibleCount < filteredBatches.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <RefreshCw size={28} className="animate-spin text-gray-700 mr-3" />
                <span className="font-semibold text-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Loading sync status…
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0 w-full" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Page Title ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-1 mb-8 md:mb-10">
                <h1 className="font-bold text-black text-2xl md:text-[28px] leading-tight">
                    Directory Sync &amp; Batch Auto - Creation
                </h1>
                <p className="text-sm md:text-base text-[#616161] font-medium leading-snug">
                    Seamless Google Contacts Sync with Real-Time Progress and Reliable Recovery
                </p>
            </div>

            {/* ── Notification ───────────────────────────────────────── */}
            {message && (
                <div className={`mb-6 px-4 py-3 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
                    message.startsWith("✅")
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border-rose-200 text-rose-700"
                }`}>
                    {message.startsWith("✅")
                        ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                        : <AlertCircle  size={18} className="shrink-0 text-rose-600" />}
                    <span>{message}</span>
                </div>
            )}

            {/* ── Stat Cards (stacked mobile, horizontal desktop) ────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-10">
                <StatCard
                    icon={Users}
                    label="Total Synced Students"
                    value={status?.totalStudents ?? 0}
                />
                <StatCard
                    icon={Database}
                    label="Active Managed Batches"
                    value={status?.totalBatches ?? batches.length ?? 0}
                />
                <StatCard
                    icon={Clock}
                    label="Prefix Sync Progress"
                    value={`${completedCount}/${totalPrefixes || 36}`}
                    suffix="Done"
                />
            </div>

            {/* ── Automated Prefix Sync Engine Card (Black) ───────────── */}
            <div className="bg-black rounded-[16px] md:rounded-[24px] p-5 md:p-8 flex flex-col gap-5 md:gap-8 mb-8 md:mb-12">
                {/* Title + description */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-white font-bold text-xl md:text-2xl leading-snug">
                        Automated Prefix Sync Engine
                    </h2>
                    <p className="text-[#d0d3d9] md:text-[#e0e0e0] text-sm md:text-base leading-relaxed md:max-w-3xl">
                        Queries each class prefix ( ‘PKD23CS’, ‘LPKD23CS’ ), scrolls only results to
                        prevent rate limits, and stream each batch directly into MongoDB with zero
                        data loss on interrupts.
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-wrap">
                    {/* Academic Year pill */}
                    <div className="relative w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => setShowYearPicker(!showYearPicker)}
                            className="flex items-center justify-between md:justify-center gap-2 h-14 w-full md:w-auto px-5 md:px-8 rounded-[56px] border border-white bg-transparent text-white font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
                            disabled={isSyncing}
                        >
                            <span>Academic Year</span>
                            <span className="font-bold text-white ml-2">{selectedYear}</span>
                            <ChevronDown size={18} className="text-white ml-1" />
                        </button>
                        {showYearPicker && (
                            <div className="absolute top-16 left-0 w-full md:w-48 z-50 bg-[#1a1a1a] border border-[#3f3f3f] rounded-2xl overflow-hidden shadow-xl">
                                {getAvailableYears().map(y => (
                                    <button
                                        key={y}
                                        onClick={() => { setSelectedYear(y); setShowYearPicker(false); }}
                                        className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors hover:bg-[#2a2a2a] ${
                                            y === selectedYear ? "text-white" : "text-[#9c9c9c]"
                                        }`}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sync button (only visible on mobile, per the two designs) */}
                    <button
                        type="button"
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex md:hidden items-center justify-center gap-2 h-14 px-6 w-full rounded-[56px] bg-white hover:bg-gray-100 text-black font-bold transition-colors disabled:opacity-50"
                    >
                        {isSyncing && syncMode !== "directory"
                            ? <RefreshCw size={18} className="animate-spin" />
                            : hasPending
                                ? <Play size={18} className="text-amber-600 fill-amber-600" />
                                : <Play size={18} />}
                        {isSyncing && syncMode !== "directory"
                            ? syncMode === "gaps" ? "Checking Gaps…" : `Syncing ${selectedYear}…`
                            : hasPending
                                ? `Resume (${pendingCount} left)`
                                : "Sync"}
                    </button>

                    {/* Sync Directory button */}
                    <button
                        type="button"
                        onClick={handleSyncDirectory}
                        disabled={isSyncing}
                        className="flex items-center justify-center gap-2 h-14 w-full md:w-auto px-5 md:px-8 rounded-[56px] border border-white bg-transparent hover:bg-white/10 text-white font-semibold transition-colors disabled:opacity-50"
                    >
                        {isSyncing && syncMode === "directory"
                            ? <RefreshCw size={18} className="animate-spin" />
                            : <RefreshCw size={18} />}
                        Sync Directory
                    </button>
                </div>
            </div>

            {/* ── Gap Fill Result ─────────────────────────────────────── */}
            {gapResult && (
                <div className="bg-white border border-[#d0d3d9] rounded-2xl p-5 flex flex-col gap-4 mb-8">
                    <div className="border-b border-[#d0d3d9] pb-3">
                        <h2 className="font-bold text-black text-base">Gap Fill Report — {selectedYear}</h2>
                        <p className="text-xs text-[#616161] font-medium mt-0.5">
                            {gapResult.totalGaps} gap(s) · {gapResult.foundInDirectory} found · {gapResult.addedToDb || 0} added to DB
                        </p>
                    </div>
                    {gapResult.gapReport && gapResult.gapReport.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {gapResult.gapReport.map((b, i) => (
                                <div key={i} className="bg-gray-50 border border-[#d0d3d9] rounded-xl p-4 flex flex-col gap-2">
                                    <p className="font-bold text-black text-sm">{b.batch}</p>
                                    {b.regular.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-[#616161] mb-1">Regular gaps ({b.regular.length})</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {b.regular.map(r => (
                                                    <span key={r} className="font-mono text-xs bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-md">{r}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {b.lateral.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-[#616161] mb-1">Lateral gaps ({b.lateral.length})</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {b.lateral.map(r => (
                                                    <span key={r} className="font-mono text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-md">{r}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-emerald-600 font-semibold py-4 text-sm">
                            ✅ All roll numbers accounted for — no gaps detected!
                        </p>
                    )}
                </div>
            )}

            {/* ── Current Class Batches ───────────────────────────────── */}
            <div className="flex flex-col gap-4 md:gap-6">
                {/* Section header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="font-semibold text-black text-xl md:text-2xl">Current Class Batches in SAMS</h2>
                    
                    {/* Search bar + filter */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 md:w-[320px] bg-white border border-[#d0d3d9] flex gap-2 h-14 items-center pl-4 pr-4 rounded-[56px]">
                            <Search size={18} className="text-[#9c9c9c] shrink-0" />
                            <input
                                type="text"
                                placeholder="Search here"
                                className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-[#9c9c9c]"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* Filter icon button */}
                        <button className="relative shrink-0 size-14 rounded-[56px] flex items-center justify-center transition-colors bg-white border border-[#d0d3d9] hover:border-black">
                            <SlidersHorizontal size={18} className="text-black" />
                        </button>
                    </div>
                </div>

                {/* Batch list - MOBILE (Card List) */}
                <div className="md:hidden flex flex-col mt-4">
                    {filteredBatches.length === 0 ? (
                        <p className="text-[#9c9c9c] text-sm py-6 text-center">
                            {searchQuery ? "No batches match your search." : "No batches found. Click \"Sync Now\" to auto-create batches."}
                        </p>
                    ) : (
                        visibleBatches.map((batch, i) => (
                            <BatchItem
                                key={batch._id || i}
                                batch={batch}
                                isLast={i === visibleBatches.length - 1 && !hasMore}
                            />
                        ))
                    )}
                </div>

                {/* Batch list - DESKTOP (Table) */}
                <div className="hidden md:block bg-white border border-[#d0d3d9] rounded-[16px] overflow-hidden mt-2">
                    <div className="flex items-center px-6 py-5 border-b border-[#d0d3d9] bg-white">
                        <div className="flex-[1.5] min-w-0 font-semibold text-black text-[15px]">Batch Name</div>
                        <div className="flex-1 min-w-0 font-semibold text-black text-[15px]">Department</div>
                        <div className="flex-1 min-w-0 font-semibold text-black text-[15px]">Admission Year</div>
                        <div className="flex-1 min-w-0 font-semibold text-black text-[15px]">Scheme</div>
                        <div className="flex-1 min-w-0 font-semibold text-black text-[15px]">Students Enrolled</div>
                        <div className="w-[140px] shrink-0"></div>
                    </div>

                    {filteredBatches.length === 0 ? (
                        <div className="px-6 py-12 text-center text-[#9c9c9c] text-base">
                            {searchQuery ? "No batches match your search." : "No batches found. Click \"Sync Now\" to auto-create batches."}
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {visibleBatches.map((batch, i) => {
                                const studentCount = batch.students ? batch.students.length : (batch.studentCount ?? 0);
                                return (
                                    <div key={batch._id || i} className={`flex items-center px-6 py-5 gap-4 ${i < visibleBatches.length - 1 ? 'border-b border-[#d0d3d9]' : ''}`}>
                                        <div className="flex-[1.5] min-w-0 text-black font-semibold text-base">{batch.name || "—"}</div>
                                        <div className="flex-1 min-w-0 text-[#616161] font-medium text-sm">{batch.branch?.toUpperCase() || "—"}</div>
                                        <div className="flex-1 min-w-0 text-[#616161] font-medium text-sm">{batch.admissionYear || "—"}</div>
                                        <div className="flex-1 min-w-0 text-[#616161] font-medium text-sm">{batch.scheme || "2019"}</div>
                                        <div className="flex-1 min-w-0 text-[#616161] font-medium text-sm">{studentCount} Students</div>
                                        <div className="flex gap-3 shrink-0 justify-end w-[140px]">
                                            <button className="size-[46px] rounded-full bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="size-[46px] rounded-full bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Load More */}
                {hasMore && (
                    <button
                        type="button"
                        onClick={() => setVisibleCount(v => v + 6)}
                        className="flex items-center justify-center gap-2 w-full py-6 md:py-8 text-black font-semibold text-[15px] hover:opacity-70 transition-opacity"
                    >
                        Load More
                        <ChevronDown size={20} />
                    </button>
                )}
            </div>

            {/* ── Sync Overlay ────────────────────────────────────────── */}
            {isSyncing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 max-w-sm w-full mx-4 shadow-2xl">
                        <RefreshCw size={44} className="text-black animate-spin" />
                        <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {syncMode === "gaps"
                                ? `Checking Gaps — ${selectedYear}`
                                : syncMode === "directory"
                                    ? `Syncing Directory…`
                                    : `Syncing ${selectedYear}…`}
                        </h3>
                        <p className="text-[#616161] text-center text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {syncMode === "gaps"
                                ? `Scanning for missing roll numbers in ${selectedYear} batches via Google Directory.`
                                : `Scanning all 6 department prefixes for ${selectedYear}. Progress is checkpointed — safe to interrupt anytime.`}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
