import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axios";
import { ChevronLeft, Upload, X, FileText, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import {
    ACTIVITY_TYPES, ACTIVITY_LEVELS, ACTIVITY_ACHIEVEMENT_TYPES,
    SEMESTERS, ACTIVITY_GROUP_LABELS,
} from "../../config/constants";

// ─── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, required, hint, children }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
);

const inputCls = "w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all bg-white";
const selectCls = `${inputCls} appearance-none`;

// ─── File Picker ───────────────────────────────────────────────────────────────
const FilePicker = ({ file, setFile, existingFile }) => {
    const isImage = file?.type?.startsWith("image/") || existingFile?.match(/\.(jpg|jpeg|png)$/i);
    return (
        <div>
            {file ? (
                <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-2xl p-3">
                    {file.type?.startsWith("image/") ? (
                        <ImageIcon className="h-8 w-8 text-violet-400 shrink-0"/>
                    ) : (
                        <FileText className="h-8 w-8 text-violet-400 shrink-0"/>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={() => setFile(null)} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                        <X className="h-4 w-4"/>
                    </button>
                </div>
            ) : existingFile ? (
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-3">
                    {isImage ? <ImageIcon className="h-8 w-8 text-gray-400 shrink-0"/> : <FileText className="h-8 w-8 text-gray-400 shrink-0"/>}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">Existing file uploaded</p>
                        <p className="text-xs text-gray-400">Upload a new file to replace it</p>
                    </div>
                </div>
            ) : null}
            <label className={`mt-2 flex items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-4 cursor-pointer transition-colors ${file || existingFile ? "border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-500" : "border-violet-300 text-violet-500 hover:border-violet-500"}`}>
                <Upload className="h-5 w-5"/>
                <span className="text-sm font-semibold">{file || existingFile ? "Replace file" : "Choose file"}</span>
                <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                />
            </label>
            <p className="text-xs text-gray-400 mt-1 text-center">PDF, JPG, JPEG, or PNG - max 10 MB</p>
        </div>
    );
};

// ─── Main Form ─────────────────────────────────────────────────────────────────
const AddActivity = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        ktuRuleId: "",
        activityName: "",
        semester: "",
        activityDate: "",
        startDate: "",
        endDate: "",
        eventLevel: "",
        achievementType: "",
        scoreOrRank: "",
        stageOrPhase: "",
        organizer: "",
        otherDescription: "",
    });
    const [selectedCategory, setSelectedCategory] = useState("");
    const [file, setFile]             = useState(null);
    const [existingFile, setExistingFile] = useState(null);
    const [loading, setLoading]       = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError]           = useState("");
    const [success, setSuccess]       = useState(false);

    // Derive active type meta
    const typeMeta = ACTIVITY_TYPES.find(t => t.id === form.ktuRuleId);

    // Load activity for edit mode
    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                setFetchLoading(true);
                const res = await axios.get(`/activity-points/${id}`);
                const a = res.data.activity;
                setForm({
                    ktuRuleId:        a.ktuRuleId || "",
                    activityName:     a.activityName || "",
                    semester:         a.semester || "",
                    activityDate:     a.activityDate ? a.activityDate.slice(0,10) : "",
                    startDate:        a.startDate ? a.startDate.slice(0,10) : "",
                    endDate:          a.endDate ? a.endDate.slice(0,10) : "",
                    eventLevel:       a.eventLevel || "",
                    achievementType:  a.achievementType || "",
                    scoreOrRank:      a.scoreOrRank || "",
                    stageOrPhase:     a.stageOrPhase || "",
                    organizer:        a.organizer || "",
                    otherDescription: a.otherDescription || "",
                });
                if (a.evidence?.filePath) setExistingFile(a.evidence.filePath);
                
                const matchedType = ACTIVITY_TYPES.find(t => t.id === a.ktuRuleId);
                if (matchedType) setSelectedCategory(matchedType.category);
            } catch (err) {
                setError("Failed to load activity.");
                console.error(err);
            } finally {
                setFetchLoading(false);
            }
        })();
    }, [id, isEdit]);

    // Reset conditional fields when type changes
    const handleTypeChange = (newId) => {
        setForm(prev => ({
            ...prev,
            ktuRuleId: newId,
            eventLevel: "",
            achievementType: "",
            scoreOrRank: "",
            stageOrPhase: "",
            activityDate: "",
            startDate: "",
            endDate: "",
        }));
    };

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const validate = () => {
        if (!form.ktuRuleId) return "Please select an activity type.";
        if (!form.activityName.trim()) return "Activity / Event Name is required.";
        if (!form.semester) return "Please select a semester.";
        if (!form.organizer.trim()) return "Organizer is required.";
        if (!isEdit && !file) return "Please upload supporting evidence.";
        if (typeMeta?.hasLevel && !form.eventLevel) return "Please select the event level.";
        if (typeMeta?.hasAchievement && !form.achievementType) return "Please select your achievement / result.";
        if (typeMeta?.hasScore && !form.scoreOrRank.trim()) return `Please enter your ${typeMeta.scoreLabel || "score / rank"}.`;
        if (typeMeta?.hasStage && !form.stageOrPhase) return "Please select the stage / phase.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const valErr = validate();
        if (valErr) { setError(valErr); return; }

        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v); });
        if (file) data.append("evidence", file);

        try {
            setLoading(true);
            if (isEdit) {
                await axios.put(`/activity-points/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
            } else {
                await axios.post("/activity-points", data, { headers: { "Content-Type": "multipart/form-data" } });
            }
            setSuccess(true);
            setTimeout(() => navigate("/student/activity-points"), 1200);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Group categories for the first dropdown
    const uniqueCategories = [...new Set(ACTIVITY_TYPES.map(t => t.category))]
        .filter(cat => cat !== 'Other')
        .sort();
    uniqueCategories.push('Other');

    // Activities for the selected category
    const availableActivities = selectedCategory 
        ? ACTIVITY_TYPES.filter(t => t.category === selectedCategory && t.id !== 'other')
        : [];

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full"/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10 max-w-md mx-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="flex items-center gap-4 px-4 py-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <ChevronLeft className="h-5 w-5 text-gray-600"/>
                    </button>
                    <div>
                        <h1 className="font-bold text-gray-900">{isEdit ? "Edit Activity" : "Add Activity"}</h1>
                        <p className="text-xs text-gray-400">KTU Activity Points 2024</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5">
                {/* Success banner */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 text-green-700">
                        <CheckCircle2 className="h-5 w-5 shrink-0"/>
                        <span className="text-sm font-semibold">Activity {isEdit ? "updated" : "submitted"} successfully!</span>
                    </div>
                )}

                {/* Error banner */}
                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-700">
                        <AlertCircle className="h-5 w-5 shrink-0"/>
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {/* Section: Activity Type */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-4">
                    <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider text-violet-600">Activity Type</h2>

                    <Field label="Activity Category" required>
                        <select 
                            className={selectCls} 
                            value={selectedCategory} 
                            onChange={e => {
                                setSelectedCategory(e.target.value);
                                handleTypeChange(""); // Reset specific activity
                            }}
                        >
                            <option value="">Select category...</option>
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </Field>

                    {selectedCategory && (
                        <Field label="Specific Activity / Event" required>
                            <select className={selectCls} value={form.ktuRuleId} onChange={e => handleTypeChange(e.target.value)}>
                                <option value="">Select specific activity...</option>
                                {availableActivities.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.subLabel}
                                    </option>
                                ))}
                                <option value="other">Other / Custom</option>
                            </select>
                        </Field>
                    )}

                    {typeMeta && (
                        <div className="bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3">
                            <p className="text-xs font-semibold text-violet-600">KTU Rule {typeMeta.id}</p>
                            <p className="text-xs text-violet-500 mt-0.5">{typeMeta.label}</p>
                        </div>
                    )}
                </div>

                {/* Section: Basic Details */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-4">
                    <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider text-violet-600">Details</h2>

                    <Field label="Activity / Event Name" required>
                        <input
                            type="text"
                            className={inputCls}
                            placeholder="e.g. KTU Sports Meet 2024"
                            value={form.activityName}
                            onChange={e => set("activityName", e.target.value)}
                        />
                    </Field>

                    <Field label="Semester" required>
                        <select className={selectCls} value={form.semester} onChange={e => set("semester", e.target.value)}>
                            <option value="">Select semester...</option>
                            {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </Field>

                    <Field label="Issuing Organization / Organizer" required>
                        <input
                            type="text"
                            className={inputCls}
                            placeholder="e.g. College / IEEE Kerala Section / NSS"
                            value={form.organizer}
                            onChange={e => set("organizer", e.target.value)}
                        />
                    </Field>
                </div>

                {/* Section: Adaptive — Achievement / Level / Stage / Score */}
                {typeMeta && (typeMeta.hasLevel || typeMeta.hasAchievement || typeMeta.hasStage || typeMeta.hasScore) && (
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-4">
                        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider text-violet-600">Result & Level</h2>

                        {typeMeta.hasLevel && (
                            <Field label="Event Level" required>
                                <select className={selectCls} value={form.eventLevel} onChange={e => set("eventLevel", e.target.value)}>
                                    <option value="">Select level...</option>
                                    {ACTIVITY_LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                                </select>
                            </Field>
                        )}

                        {typeMeta.hasAchievement && (
                            <Field label="Achievement / Result" required>
                                <select className={selectCls} value={form.achievementType} onChange={e => set("achievementType", e.target.value)}>
                                    <option value="">Select result...</option>
                                    {ACTIVITY_ACHIEVEMENT_TYPES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                                </select>
                            </Field>
                        )}

                        {typeMeta.hasStage && typeMeta.stageOptions && (
                            <Field label="Stage / Phase" required>
                                <select className={selectCls} value={form.stageOrPhase} onChange={e => set("stageOrPhase", e.target.value)}>
                                    <option value="">Select stage...</option>
                                    {typeMeta.stageOptions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                            </Field>
                        )}

                        {typeMeta.hasScore && (
                            <Field label={typeMeta.scoreLabel || "Score / Band / Rank"} required>
                                <input
                                    type="text"
                                    className={inputCls}
                                    placeholder={typeMeta.scoreLabel || "Enter score, band, or rank"}
                                    value={form.scoreOrRank}
                                    onChange={e => set("scoreOrRank", e.target.value)}
                                />
                            </Field>
                        )}
                    </div>
                )}

                {/* Section: Dates */}
                {typeMeta && (
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-4">
                        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider text-violet-600">Date</h2>

                        {typeMeta.isDateRange ? (
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Start Date">
                                    <input type="date" className={inputCls} value={form.startDate} onChange={e => set("startDate", e.target.value)}/>
                                </Field>
                                <Field label="End Date">
                                    <input type="date" className={inputCls} value={form.endDate} onChange={e => set("endDate", e.target.value)}/>
                                </Field>
                            </div>
                        ) : (
                            <Field label="Activity Date">
                                <input type="date" className={inputCls} value={form.activityDate} onChange={e => set("activityDate", e.target.value)}/>
                            </Field>
                        )}
                    </div>
                )}

                {/* Section: Evidence */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-4">
                    <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider text-violet-600">Supporting Evidence</h2>
                    <FilePicker file={file} setFile={setFile} existingFile={existingFile}/>
                </div>

                {/* Section: Other Description (optional) */}
                {typeMeta && (
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-4">
                        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider text-violet-600">Additional Notes</h2>
                        <Field label="Additional Description" hint="Optional — add any context that helps with verification">
                            <textarea
                                rows={3}
                                className={inputCls}
                                placeholder="Any additional details..."
                                value={form.otherDescription}
                                onChange={e => set("otherDescription", e.target.value)}
                            />
                        </Field>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-400/30 hover:bg-violet-700 transition-colors disabled:opacity-60 text-base"
                >
                    {loading ? "Submitting..." : success ? "Submitted!" : isEdit ? "Save Changes" : "Submit Activity"}
                </button>
            </form>
        </div>
    );
};

export default AddActivity;
