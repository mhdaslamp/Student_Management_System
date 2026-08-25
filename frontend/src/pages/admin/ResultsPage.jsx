import { useState, useRef } from "react";
import axios from "../../api/axios";
import {
    Upload, FileText, X, CheckCircle, AlertCircle,
    Clock, Trash2, Download, BarChart2, Globe, Eye,
    Search, Filter, ChevronDown
} from "lucide-react";
import ResultAnalysis from "../teacher/ResultAnalysis";

const formatResultTitle = (rawTitle) => {
    if (!rawTitle) return "";
    // Matches patterns like "B.Tech S6 (R, S) Exam April 2026 (2019 Scheme)"
    let type = "";
    const typeMatch = rawTitle.match(/\((R|S|R,\s*S|R,S)\)/i);
    if (typeMatch) {
        type = "(" + typeMatch[1].replace(/\s/g, '').toUpperCase() + ")";
    } else if (rawTitle.match(/Supplementary/i)) {
        type = "(S)";
    } else if (rawTitle.match(/Regular/i)) {
        type = "(R)";
    }

    let date = "";
    const dateMatch = rawTitle.match(/(?:Exam|Examination|Exam\.)\s+([a-zA-Z]+\s+\d{4})/i);
    if (dateMatch) {
        date = dateMatch[1].charAt(0).toUpperCase() + dateMatch[1].slice(1).toLowerCase();
    }

    let semester = "";
    const semMatch = rawTitle.match(/\b(S[1-8])\b/i);
    if (semMatch) semester = semMatch[1].toUpperCase();

    if (semester || type || date) {
        return `B.Tech ${semester} ${type} ${date}`.replace(/\s+/g, ' ').trim();
    }
    return rawTitle; // Fallback if it doesn't match
};

function UploadFileIcon() {
    return (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="56" height="56" rx="28" fill="#F3F4F6" />
            <path d="M28 36V22M22 28L28 22L34 28" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function DraftCard({ item, onPublish, onDelete, onDownload, onView, onAnalysis }) {
    const [deptPickerOpen, setDeptPickerOpen] = useState(false);
    const DEPTS = ["IT", "CS", "EC", "EE", "CE", "ME"];
    return (
        <div className="border border-[#d0d3d9] rounded-[16px] px-5 py-4 flex flex-col gap-3 hover:border-black transition-colors cursor-pointer" onClick={() => onView(item)}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-black text-base truncate" style={{ fontFamily: "Inter, sans-serif" }}>{formatResultTitle(item.title)}</p>
                        <span className="shrink-0 px-2.5 py-0.5 rounded-[56px] bg-amber-100 text-amber-700 text-xs font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>Draft</span>
                    </div>
                    <p className="text-[#616161] text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        {item.totalStudents} students · Avg SGPA: {item.averageSGPA} · {new Date(item.lastUploaded).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse mt-1.5 shrink-0" />
            </div>
            <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={() => onPublish(item)} className="w-full h-10 px-4 rounded-[56px] bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-neutral-800 transition-colors" style={{ fontFamily: "Inter, sans-serif" }}>
                    <CheckCircle size={13} />Publish
                </button>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => onDownload(item)} className="size-10 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors" title="Download Excel"><Download size={15} /></button>
                    <button onClick={() => onAnalysis(item, "college")} className="size-10 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors" title="College Analysis"><Globe size={15} /></button>
                    <div className="relative">
                        <button onClick={() => setDeptPickerOpen(v => !v)} className="size-10 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors" title="Department Analysis"><BarChart2 size={15} /></button>
                        {deptPickerOpen && (
                            <div className="absolute left-0 top-12 z-50 bg-white border border-[#d0d3d9] rounded-[12px] shadow-xl p-2 flex flex-wrap gap-1 w-40">
                                <p className="w-full text-[10px] text-[#9c9c9c] font-semibold px-1 mb-1 uppercase tracking-wide">Department</p>
                                {DEPTS.map(d => (
                                    <button key={d} onClick={() => { setDeptPickerOpen(false); onAnalysis(item, "department", d); }} className="px-3 py-1 text-xs font-semibold bg-gray-100 hover:bg-black hover:text-white rounded-[56px] transition-colors" style={{ fontFamily: "Inter, sans-serif" }}>{d}</button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => onDelete(item)} className="size-10 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={15} /></button>
                </div>
            </div>
        </div>
    );
}

const AdminResultsPage = ({ drafts = [], overview = [], refreshAll }) => {
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState(null);
    const [viewingResult, setViewingResult] = useState(null);
    const [resultDetails, setResultDetails] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [viewingAnalysis, setViewingAnalysis] = useState(null);

    const handleUpload = async () => {
        if (!file) { setUploadMsg({ type: "error", text: "Please select a PDF file." }); return; }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("examType", "university");
        setUploadMsg({ type: "info", text: "Processing PDF… this may take a moment." });
        setUploading(true);
        try {
            const res = await axios.post("/academic/result/upload", formData, { headers: { "Content-Type": "multipart/form-data" }, responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a"); link.href = url; link.setAttribute("download", "University_Results.xlsx"); document.body.appendChild(link); link.click(); link.remove();
            setUploadMsg({ type: "success", text: "PDF processed and saved as draft. Review below, then publish." });
            setFile(null); if (fileInputRef.current) fileInputRef.current.value = "";
            if (refreshAll) refreshAll();
        } catch { setUploadMsg({ type: "error", text: "Failed to process PDF. Ensure it is a valid University Result file." }); }
        setUploading(false);
    };

    const handlePublish = async (item) => {
        if (!window.confirm(`Publish "${item.title}" to all teachers and students? This cannot be undone.`)) return;
        try { await axios.post("/academic/result/publish", { title: item.title, type: item.type }); if (refreshAll) refreshAll(); }
        catch { alert("Failed to publish result."); }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`DANGER: Delete "${item.title}"? This cannot be undone.`)) return;
        try { await axios.post("/academic/result/delete", { title: item.title, type: item.type }); if (refreshAll) refreshAll(); }
        catch { alert("Failed to delete result."); }
    };

    const handleDownload = async (item) => {
        try {
            const response = await axios.get("/academic/result/download/all", { params: { title: item.title, type: item.type }, responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a"); link.href = url; link.setAttribute("download", `${item.title}.xlsx`); document.body.appendChild(link); link.click(); link.remove();
        } catch { alert("Failed to download Excel."); }
    };

    const handleViewDetails = async (item) => {
        setViewingResult(item); setLoadingDetails(true);
        try { const res = await axios.get("/academic/result/details/all", { params: { title: item.title, type: item.type } }); setResultDetails(res.data); }
        catch { alert("Failed to load result details."); }
        setLoadingDetails(false);
    };

    const handleAnalysis = (item, mode, deptOverride = null) => setViewingAnalysis({ ...item, mode, deptOverride });
    const clearFile = () => { setFile(null); setUploadMsg(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

    return (
        <>
            <div className="flex flex-col gap-6 w-full">
                <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
                    <div className="lg:w-[360px] shrink-0 w-full">
                        <div className="border border-[#d0d3d9] rounded-[16px] p-6 flex flex-col gap-5 h-full">
                            <div>
                                <p className="font-semibold text-black text-lg" style={{ fontFamily: "Inter, sans-serif" }}>Upload Result PDF</p>
                                <p className="text-[#616161] text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>Semester, scheme &amp; month are detected automatically from the PDF.</p>
                            </div>
                            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={e => { setFile(e.target.files?.[0] ?? null); setUploadMsg(null); }} />
                            {!file ? (
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="border border-[#d0d3d9] rounded-[16px] pt-10 pb-8 px-6 flex flex-col items-center justify-center gap-5 w-full hover:border-black transition-colors flex-1">
                                    <UploadFileIcon />
                                    <div className="text-center">
                                        <p className="font-medium text-black text-xl" style={{ fontFamily: "Inter, sans-serif" }}>Click to Upload PDF</p>
                                        <p className="text-[#9c9c9c] text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>Supports University Result PDF</p>
                                    </div>
                                </button>
                            ) : (
                                <div className="border border-black rounded-[16px] pt-10 pb-8 px-6 flex flex-col items-center justify-center gap-5 w-full flex-1">
                                    <div className="size-14 rounded-full bg-gray-100 flex items-center justify-center"><FileText size={24} className="text-gray-500" /></div>
                                    <div className="text-center">
                                        <p className="font-medium text-black text-base truncate max-w-[260px]" style={{ fontFamily: "Inter, sans-serif" }}>{file.name}</p>
                                        <p className="text-[#9c9c9c] text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>Ready to process</p>
                                    </div>
                                </div>
                            )}
                            {!file ? (
                                <button type="button" onClick={handleUpload} disabled={uploading} className="bg-black text-white h-14 rounded-[56px] w-full font-semibold text-base hover:bg-neutral-800 transition-colors disabled:opacity-50" style={{ fontFamily: "Inter, sans-serif" }}>
                                    {uploading ? "Processing…" : "Upload"}
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button type="button" onClick={clearFile} className="relative size-14 rounded-[56px] bg-white border border-black flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0"><X size={18} /></button>
                                    <button type="button" onClick={handleUpload} disabled={uploading} className="flex-1 bg-black text-white h-14 rounded-[56px] font-semibold text-base hover:bg-neutral-800 transition-colors disabled:opacity-50" style={{ fontFamily: "Inter, sans-serif" }}>
                                        {uploading ? "Processing…" : "Process & Save Draft"}
                                    </button>
                                </div>
                            )}
                            {uploadMsg && (
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium ${uploadMsg.type === "success" ? "bg-green-50 text-green-700" : uploadMsg.type === "error" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                                    {uploadMsg.type === "success" ? <CheckCircle size={16} className="shrink-0" /> : uploadMsg.type === "error" ? <AlertCircle size={16} className="shrink-0" /> : <Clock size={16} className="shrink-0 animate-spin" />}
                                    {uploadMsg.text}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="border border-[#d0d3d9] rounded-[16px] p-6 flex flex-col gap-4 h-full">
                            <div className="flex items-center gap-3">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                                <p className="font-semibold text-black text-base" style={{ fontFamily: "Inter, sans-serif" }}>Awaiting Publishing</p>
                                <span className="px-2.5 py-0.5 rounded-[56px] bg-amber-100 text-amber-700 text-xs font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>{drafts.length}</span>
                            </div>
                            {drafts.length === 0 ? (
                                <div className="border border-dashed border-[#d0d3d9] rounded-[16px] flex flex-col items-center justify-center gap-3 text-[#9c9c9c] flex-1">
                                    <FileText size={28} className="opacity-30" />
                                    <p className="text-sm" style={{ fontFamily: "Inter, sans-serif" }}>No drafts yet. Upload a PDF to get started.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 overflow-y-auto pr-2" style={{ scrollbarWidth: "thin" }}>
                                    {drafts.map((item, idx) => <DraftCard key={idx} item={item} onPublish={handlePublish} onDelete={handleDelete} onDownload={handleDownload} onView={handleViewDetails} onAnalysis={handleAnalysis} />)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* DESKTOP VIEW: Normal Table */}
                <div className="hidden md:flex flex-col gap-4 w-full mt-4">
                    <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <p className="font-semibold text-black text-base" style={{ fontFamily: "Inter, sans-serif" }}>Published Results</p>
                        <span className="px-2.5 py-0.5 rounded-[56px] bg-green-100 text-green-700 text-xs font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>{overview.length}</span>
                    </div>
                    {overview.length === 0 ? (
                        <div className="border border-dashed border-[#d0d3d9] rounded-[16px] py-10 flex flex-col items-center justify-center gap-3 text-[#9c9c9c]">
                            <FileText size={28} className="opacity-30" />
                            <p className="text-sm" style={{ fontFamily: "Inter, sans-serif" }}>No published results yet.</p>
                        </div>
                    ) : (
                        <div className="border border-[#d0d3d9] rounded-[16px] overflow-hidden">
                            <div className="flex items-center px-5 py-3 border-b border-[#d0d3d9] bg-gray-50/60">
                                <div className="flex-1 min-w-0 text-xs font-semibold text-[#616161] uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>Title</div>
                                <div className="w-28 shrink-0 text-xs font-semibold text-[#616161] uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>Students</div>
                                <div className="w-24 shrink-0 text-xs font-semibold text-[#616161] uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>Avg SGPA</div>
                                <div className="w-32 shrink-0" />
                            </div>
                            {overview.map((item, idx) => (
                                <div key={idx} className={`flex items-center px-5 py-4 gap-4 hover:bg-gray-50/60 cursor-pointer transition-colors ${idx < overview.length - 1 ? "border-b border-[#d0d3d9]" : ""}`} onClick={() => handleViewDetails(item)} style={{ fontFamily: "Inter, sans-serif" }}>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-black text-sm truncate">{formatResultTitle(item.title)}</p>
                                        <p className="text-[#9c9c9c] text-xs mt-0.5">{new Date(item.lastUploaded).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                                    </div>
                                    <div className="w-28 shrink-0 text-sm text-[#616161]">{item.totalStudents}</div>
                                    <div className="w-24 shrink-0 text-sm font-semibold text-black">{item.averageSGPA}</div>
                                    <div className="w-32 shrink-0 flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => handleViewDetails(item)} className="size-9 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors" title="View Details"><Eye size={14} /></button>
                                        <button onClick={() => handleDownload(item)} className="size-9 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors" title="Download Excel"><Download size={14} /></button>
                                        <button onClick={() => handleDelete(item)} className="size-9 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* MOBILE VIEW: History List */}
                <div className="flex md:hidden flex-col gap-4 w-full mt-8">
                    {/* Header */}
                    <div className="flex flex-col gap-3">
                        <p className="font-medium text-black text-2xl shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>History</p>
                        <div className="flex items-center gap-2 w-full">
                            <div className="bg-white border border-[#9c9c9c] flex gap-2 h-14 items-center pl-4 pr-4 rounded-[56px] flex-1 min-w-0">
                                <Search size={18} className="text-[#9c9c9c] shrink-0" />
                                <input type="text" placeholder="Search here" className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-[#9c9c9c]" style={{ fontFamily: "'Inter', sans-serif" }} />
                            </div>
                            <button className="relative shrink-0 size-14 rounded-[56px] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors border border-[#d0d3d9]">
                                <div className="flex-none rotate-90"><Filter size={18} /></div>
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex flex-col w-full mt-4">
                        {overview.length === 0 ? (
                            <p className="text-[#9c9c9c] text-sm py-4" style={{ fontFamily: "'Inter', sans-serif" }}>No published results found</p>
                        ) : (
                            overview.map((item, idx) => (
                                <div key={idx} className={`flex justify-between items-start gap-3 pb-4 pt-8 ${idx > 0 ? "border-t border-[#d0d3d9]" : ""}`}>
                                    <div className="flex flex-col gap-4 flex-1 min-w-0">
                                        <p className="font-medium text-black text-xl [word-break:break-word]" style={{ fontFamily: "'Inter', sans-serif" }}>{formatResultTitle(item.title)}</p>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold text-black text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                Scheme: <span className="font-normal">{item.scheme || '2019'}</span>
                                            </p>
                                            <p className="text-[#9c9c9c] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                Uploaded: {new Date(item.lastUploaded).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, '-')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-[10px] items-center shrink-0">
                                        <button onClick={(e) => { e.stopPropagation(); handleViewDetails(item); }} className="size-10 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors" title="View Details"><Eye size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDownload(item); }} className="size-10 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors" title="Download Excel"><Download size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} className="size-10 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {overview.length > 0 && (
                        <div className="flex justify-center mt-6">
                            <button className="flex items-center gap-2 px-8 h-14 rounded-[56px] font-semibold text-base hover:bg-gray-50 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Load More <ChevronDown size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {viewingResult && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#d0d3d9] flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-black text-lg" style={{ fontFamily: "Inter, sans-serif" }}>{formatResultTitle(viewingResult.title)}</p>
                                <p className="text-[#9c9c9c] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>{resultDetails.length} records</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!viewingResult.published && (
                                    <button onClick={() => { handlePublish(viewingResult); setViewingResult(null); }} className="h-10 px-5 rounded-[56px] bg-black text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-neutral-800 transition-colors" style={{ fontFamily: "Inter, sans-serif" }}>
                                        <CheckCircle size={14} />Publish
                                    </button>
                                )}
                                <button onClick={() => setViewingResult(null)} className="size-10 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors"><X size={18} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {loadingDetails ? (
                                <div className="py-12 text-center text-[#9c9c9c] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>Loading…</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/60 sticky top-0">
                                        <tr>{["Reg No", "Name", "Credits", "SGPA"].map(h => <th key={h} className="px-5 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {resultDetails.map((res, i) => (
                                            <tr key={i} className={`hover:bg-gray-50 ${i < resultDetails.length - 1 ? "border-b border-[#d0d3d9]" : ""}`}>
                                                <td className="px-5 py-3 font-mono text-xs text-[#616161]">{res.registerId}</td>
                                                <td className="px-5 py-3 font-medium text-black text-sm">{res.student?.name || <span className="text-[#9c9c9c] italic">Unknown</span>}</td>
                                                <td className="px-5 py-3 text-sm text-[#616161]">{res.totalCredits}</td>
                                                <td className="px-5 py-3 text-sm font-semibold text-black">{res.sgpa}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {viewingAnalysis && (
                <ResultAnalysis batchId={null} title={viewingAnalysis.title} type={viewingAnalysis.type} mode={viewingAnalysis.mode} deptOverride={viewingAnalysis.deptOverride || null} onClose={() => setViewingAnalysis(null)} />
            )}
        </>
    );
};

export default AdminResultsPage;
