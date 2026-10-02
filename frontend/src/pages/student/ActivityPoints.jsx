import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
    Plus, ChevronLeft, ChevronRight, Trash2,
    AlertCircle, FileText, Calendar, Building2,
} from "lucide-react";
import { ACTIVITY_STATUS_LABELS } from "../../config/constants";

const GROUP_COLORS = {
    "I":   "bg-emerald-100 text-emerald-700 border-emerald-200",
    "II":  "bg-blue-100   text-blue-700   border-blue-200",
    "III": "bg-purple-100 text-purple-700 border-purple-200",
};

const ActivityCard = ({ activity, onDelete, onClick }) => {
    const statusMeta = ACTIVITY_STATUS_LABELS[activity.status] || { label: activity.status, color: "bg-gray-100 text-gray-600" };
    const groupColor = GROUP_COLORS[activity.activityGroup] || "bg-gray-100 text-gray-600";

    const dateDisplay = () => {
        if (activity.startDate && activity.endDate) {
            const s = new Date(activity.startDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
            const e = new Date(activity.endDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
            return `${s} - ${e}`;
        }
        if (activity.activityDate) {
            return new Date(activity.activityDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
        }
        return "Date not specified";
    };

    return (
        <div
            onClick={() => onClick(activity._id)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md hover:border-violet-200 transition-all duration-200 active:scale-[0.98]"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${groupColor}`}>
                            Grp {activity.activityGroup}
                        </span>
                        {activity.calculatedPoints != null && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                {activity.calculatedPoints} Pts
                            </span>
                        )}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusMeta.color}`}>
                            {statusMeta.label}
                        </span>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                            {activity.semester}
                        </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug truncate pr-2">
                        {activity.activityName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.activityLabel}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {dateDisplay()}
                        </span>
                        {activity.organizer && (
                            <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                <span className="truncate max-w-[140px]">{activity.organizer}</span>
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <ChevronRight className="h-5 w-5 text-gray-300" />
                    {["DRAFT","SUBMITTED","PROCESSING","REVIEW_REQUIRED","PENDING_VERIFICATION"].includes(activity.status) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(activity); }}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const DeleteModal = ({ activity, onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-500" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Delete Activity?</h3>
                    <p className="text-sm text-gray-500">This cannot be undone.</p>
                </div>
            </div>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mb-5 font-medium">
                &ldquo;{activity?.activityName}&rdquo;
            </p>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                    {loading ? "Deleting..." : "Delete"}
                </button>
            </div>
        </div>
    </div>
);

const ActivityPoints = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState("");
    const [toDelete, setToDelete]     = useState(null);
    const [deleting, setDeleting]     = useState(false);

    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get("/activity-points");
            setActivities(res.data.activities || []);
        } catch (err) {
            setError("Failed to load activities. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchActivities(); }, [fetchActivities]);

    const handleDelete = async () => {
        if (!toDelete) return;
        try {
            setDeleting(true);
            await axios.delete(`/activity-points/${toDelete._id}`);
            setActivities(prev => prev.filter(a => a._id !== toDelete._id));
            setToDelete(null);
        } catch (err) {
            setError(err.response?.data?.message || "Delete failed.");
        } finally {
            setDeleting(false);
        }
    };

    const groupCounts = activities.reduce((acc, a) => {
        acc[a.activityGroup] = (acc[a.activityGroup] || 0) + 1;
        return acc;
    }, {});

    const totalPoints = activities.reduce((sum, a) => {
        return sum + (a.calculatedPoints || 0);
    }, 0);

    return (
        <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto relative">
            <header className="bg-violet-600 text-white pt-12 pb-20 px-6 rounded-b-[2.5rem] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-700 opacity-80" />
                <div className="relative z-10 flex items-center gap-4 mb-6">
                    <button onClick={() => navigate("/student")} className="bg-white/20 backdrop-blur-md p-2 rounded-xl hover:bg-white/30 transition-colors">
                        <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    <div className="flex-1">
                        <p className="text-violet-200 text-xs font-medium uppercase tracking-wider">KTU 2024 Scheme</p>
                        <h1 className="text-2xl font-bold">Activity Points</h1>
                    </div>
                    <div className="bg-white rounded-2xl px-4 py-2 text-center shadow-sm">
                        <p className="text-violet-600 text-xs font-bold uppercase">Total</p>
                        <p className="text-violet-700 font-black text-xl leading-none">{totalPoints}</p>
                    </div>
                </div>
                <div className="relative z-10 flex gap-2 flex-wrap">
                    {["I","II","III"].map(g => (
                        <div key={g} className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 text-center min-w-[80px]">
                            <p className="text-white/70 text-xs font-medium">Group {g}</p>
                            <p className="text-white font-bold text-lg">{groupCounts[g] || 0}</p>
                            <p className="text-white/60 text-xs">activities</p>
                        </div>
                    ))}
                </div>
            </header>

            <div className="px-4 -mt-6 relative z-10 space-y-3">
                {loading && (
                    <div className="space-y-3 pt-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse">
                                <div className="flex gap-2 mb-3"><div className="h-5 w-16 bg-gray-100 rounded-full"/><div className="h-5 w-20 bg-gray-100 rounded-full"/></div>
                                <div className="h-5 w-3/4 bg-gray-100 rounded mb-2"/><div className="h-4 w-1/2 bg-gray-50 rounded"/>
                            </div>
                        ))}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-700 mt-2">
                        <AlertCircle className="h-5 w-5 shrink-0"/>
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
                {!loading && !error && activities.length === 0 && (
                    <div className="text-center py-16">
                        <div className="h-20 w-20 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-10 w-10 text-violet-300"/>
                        </div>
                        <h3 className="font-bold text-gray-700 text-lg mb-1">No activities yet</h3>
                        <p className="text-gray-400 text-sm mb-6">Add your first KTU activity to get started.</p>
                        <button onClick={() => navigate("/student/activity-points/add")} className="bg-violet-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-violet-700 transition-colors inline-flex items-center gap-2">
                            <Plus className="h-5 w-5"/>Add Activity
                        </button>
                    </div>
                )}
                {!loading && activities.length > 0 && (
                    <div className="pt-2 space-y-3">
                        {activities.map(activity => (
                            <ActivityCard
                                key={activity._id}
                                activity={activity}
                                onClick={(id) => navigate(`/student/activity-points/${id}`)}
                                onDelete={(a) => setToDelete(a)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {!loading && (
                <button
                    onClick={() => navigate("/student/activity-points/add")}
                    className="fixed bottom-6 right-4 h-14 w-14 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-400/40 flex items-center justify-center hover:bg-violet-700 active:scale-95 transition-all z-20"
                >
                    <Plus className="h-7 w-7"/>
                </button>
            )}

            {toDelete && (
                <DeleteModal activity={toDelete} onConfirm={handleDelete} onCancel={() => setToDelete(null)} loading={deleting}/>
            )}
        </div>
    );
};

export default ActivityPoints;
