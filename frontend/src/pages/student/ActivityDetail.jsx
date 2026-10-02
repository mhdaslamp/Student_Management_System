import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axios";
import {
    ChevronLeft, Edit2, Trash2, FileText, ExternalLink,
    Calendar, Building2, Star, Award, BarChart2, AlertCircle,
} from "lucide-react";
import { ACTIVITY_STATUS_LABELS, ACTIVITY_GROUP_LABELS } from "../../config/constants";

const GROUP_COLORS = {
    "I":   "from-emerald-500 to-teal-600",
    "II":  "from-blue-500 to-indigo-600",
    "III": "from-purple-500 to-violet-600",
};

const DetailRow = ({ label, value, icon: Icon }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
            {Icon && <div className="h-8 w-8 bg-gray-50 rounded-xl flex items-center justify-center shrink-0"><Icon className="h-4 w-4 text-gray-400"/></div>}
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
            </div>
        </div>
    );
};

const DeleteModal = ({ activityName, onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-500"/>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Delete Activity?</h3>
                    <p className="text-sm text-gray-500">This cannot be undone.</p>
                </div>
            </div>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mb-5 font-medium">&ldquo;{activityName}&rdquo;</p>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                    {loading ? "Deleting..." : "Delete"}
                </button>
            </div>
        </div>
    </div>
);

const ActivityDetail = () => {
    const navigate = useNavigate();
    const { id }   = useParams();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState("");
    const [showDelete, setShowDelete] = useState(false);
    const [deleting, setDeleting]     = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`/activity-points/${id}`);
                setActivity(res.data.activity);
            } catch (err) {
                setError("Failed to load activity.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await axios.delete(`/activity-points/${id}`);
            navigate("/student/activity-points", { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Delete failed.");
            setShowDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" }) : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full"/>
            </div>
        );
    }

    if (error && !activity) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
                <AlertCircle className="h-12 w-12 text-red-400"/>
                <p className="text-gray-600 font-medium">{error}</p>
                <button onClick={() => navigate(-1)} className="text-violet-600 font-semibold">Go Back</button>
            </div>
        );
    }

    const statusMeta = ACTIVITY_STATUS_LABELS[activity.status] || { label: activity.status, color: "bg-gray-100 text-gray-600" };
    const gradientCls = GROUP_COLORS[activity.activityGroup] || "from-violet-500 to-purple-600";
    const canEdit = ["DRAFT","SUBMITTED"].includes(activity.status);
    const evidenceUrl = `/api/activity-points/${id}/evidence`;

    const dateText = () => {
        if (activity.startDate && activity.endDate) return `${formatDate(activity.startDate)} - ${formatDate(activity.endDate)}`;
        if (activity.activityDate) return formatDate(activity.activityDate);
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10 max-w-md mx-auto">
            {/* Hero header */}
            <div className={`bg-gradient-to-br ${gradientCls} pt-12 pb-16 px-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"/>
                <div className="relative z-10 flex items-center justify-between mb-6">
                    <button onClick={() => navigate(-1)} className="bg-white/20 backdrop-blur-md p-2 rounded-xl hover:bg-white/30 transition-colors">
                        <ChevronLeft className="h-5 w-5 text-white"/>
                    </button>
                    <div className="flex gap-2">
                        {canEdit && (
                            <button
                                onClick={() => navigate(`/student/activity-points/${id}/edit`)}
                                className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2"
                            >
                                <Edit2 className="h-4 w-4 text-white"/>
                                <span className="text-white text-sm font-semibold">Edit</span>
                            </button>
                        )}
                        {canEdit && (
                            <button onClick={() => setShowDelete(true)} className="bg-white/20 backdrop-blur-md p-2 rounded-xl hover:bg-red-400/40 transition-colors">
                                <Trash2 className="h-4 w-4 text-white"/>
                            </button>
                        )}
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-white/25 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Group {activity.activityGroup} · Rule {activity.ktuRuleId}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusMeta.color}`}>
                            {statusMeta.label}
                        </span>
                    </div>
                    <h1 className="text-white font-bold text-xl leading-snug mb-1">{activity.activityName}</h1>
                    <p className="text-white/70 text-sm">{activity.activityLabel}</p>
                </div>
            </div>

            {/* Cards */}
            <div className="px-4 -mt-8 space-y-4 relative z-10">
                {/* Group badge */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 font-medium mb-1">Activity Group</p>
                    <p className="text-sm font-bold text-gray-800">{ACTIVITY_GROUP_LABELS[activity.activityGroup]}</p>
                </div>

                {/* Core details */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-700 text-sm mb-2">Details</h2>
                    <DetailRow label="Semester" value={activity.semester} icon={Star}/>
                    <DetailRow label="Date" value={dateText()} icon={Calendar}/>
                    <DetailRow label="Organizer" value={activity.organizer} icon={Building2}/>
                </div>

                {/* Conditional result fields */}
                {(activity.eventLevel || activity.achievementType || activity.stageOrPhase || activity.scoreOrRank) && (
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-700 text-sm mb-2">Result & Achievement</h2>
                        <DetailRow label="Event Level" value={activity.eventLevel} icon={BarChart2}/>
                        <DetailRow label="Achievement" value={activity.achievementType} icon={Award}/>
                        <DetailRow label="Stage / Phase" value={activity.stageOrPhase} icon={Award}/>
                        <DetailRow label="Score / Band / Rank" value={activity.scoreOrRank} icon={BarChart2}/>
                    </div>
                )}

                {/* Notes */}
                {activity.otherDescription && (
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-700 text-sm mb-2">Additional Notes</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">{activity.otherDescription}</p>
                    </div>
                )}

                {/* Evidence */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-700 text-sm mb-3">Supporting Evidence</h2>
                    <a
                        href={evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-2xl p-3 hover:bg-violet-100 transition-colors"
                    >
                        <div className="h-10 w-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-violet-500"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-violet-700">View Evidence File</p>
                            <p className="text-xs text-violet-400 truncate">{activity.evidence?.originalName || "Evidence file"}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-violet-400 shrink-0"/>
                    </a>
                </div>

                {/* Future sections placeholder */}
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-4 text-center">
                    <p className="text-xs text-gray-400 font-medium">AI extraction & point calculation</p>
                    <p className="text-xs text-gray-300 mt-0.5">Coming in a future update</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-700">
                        <AlertCircle className="h-5 w-5 shrink-0"/>
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
            </div>

            {showDelete && (
                <DeleteModal
                    activityName={activity.activityName}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDelete(false)}
                    loading={deleting}
                />
            )}
        </div>
    );
};

export default ActivityDetail;
