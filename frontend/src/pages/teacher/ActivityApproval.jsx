import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { 
    CheckCircle2, XCircle, Clock, AlertTriangle, 
    FileText, Award, Calendar, ExternalLink, ChevronDown, Check, X, RefreshCw, ChevronLeft, User
} from 'lucide-react';
import { ACTIVITY_STATUSES } from '../../config/constants';

const ActivityApproval = ({ batches }) => {
    // 3 Views: 'STUDENTS' | 'ACTIVITIES' | 'REVIEW'
    const [view, setView] = useState('STUDENTS');
    
    // State
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState('all');
    const [studentFilter, setStudentFilter] = useState('all');
    
    // Drill-down states
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentActivities, setStudentActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [activityStatusFilter, setActivityStatusFilter] = useState('all');

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/teacher/activities/summary', { params: { batchId: selectedBatch } });
            setStudents(res.data.summary || []);
        } catch (error) {
            console.error('Error fetching summary:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'STUDENTS') {
            fetchSummary();
        }
    }, [selectedBatch, view]);

    const handleStudentClick = async (student) => {
        setSelectedStudent(student);
        setView('ACTIVITIES');
        try {
            setLoading(true);
            const res = await axios.get('/teacher/activities', { params: { studentId: student._id } });
            setStudentActivities(res.data.activities || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Derived activities for the view
    const filteredActivities = studentActivities
        .filter(a => activityStatusFilter === 'all' || a.status === activityStatusFilter)
        .sort((a, b) => {
            // Sort pending first
            const aPending = a.status === ACTIVITY_STATUSES.PENDING_VERIFICATION || a.status === ACTIVITY_STATUSES.REVIEW_REQUIRED;
            const bPending = b.status === ACTIVITY_STATUSES.PENDING_VERIFICATION || b.status === ACTIVITY_STATUSES.REVIEW_REQUIRED;
            if (aPending && !bPending) return -1;
            if (!aPending && bPending) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    // Auto-poll if currently viewing a processing activity
    useEffect(() => {
        let interval;
        if (view === 'REVIEW' && selectedActivity?.status === 'PROCESSING' && selectedStudent) {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get('/teacher/activities', { params: { studentId: selectedStudent._id } });
                    const activities = res.data.activities || [];
                    setStudentActivities(activities);
                    
                    const updated = activities.find(a => a._id === selectedActivity._id);
                    if (updated && updated.status !== 'PROCESSING') {
                        setSelectedActivity(updated);
                        clearInterval(interval);
                    }
                } catch (err) {
                    console.error('Polling error', err);
                }
            }, 3000); // Check every 3 seconds
        }
        return () => clearInterval(interval);
    }, [view, selectedActivity, selectedStudent]);

    const handleActivityClick = (activity) => {
        setSelectedActivity(activity);
        setView('REVIEW');
    };

    const filteredStudents = students.filter(student => {
        if (studentFilter === 'all') return true;
        if (studentFilter === 'pending') return student.pendingCount > 0;
        if (studentFilter === 'incomplete') return (student.totalPoints || 0) < 120;
        if (studentFilter === 'completed') return (student.totalPoints || 0) >= 120;
        return true;
    });

    // ---- View 1: Student List ----
    if (view === 'STUDENTS') {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between lg:justify-end items-start md:items-center mb-8 gap-4">
                    <div className="lg:hidden">
                        <h1 className="text-2xl font-bold text-gray-900">Activity Points Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">Review student progress across KTU Slabs</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none shadow-sm"
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                        >
                            <option value="all">All Batches</option>
                            {batches.map(b => (
                                <option key={b._id} value={b._id}>{b.name} ({b.scheme})</option>
                            ))}
                        </select>
                        <select
                            className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none shadow-sm"
                            value={studentFilter}
                            onChange={(e) => setStudentFilter(e.target.value)}
                        >
                            <option value="all">All Students</option>
                            <option value="pending">Pending Verification</option>
                            <option value="incomplete">Incomplete Points</option>
                            <option value="completed">120+ Completed</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" /></div>
                ) : filteredStudents.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                        <User className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No students found</h3>
                        <p className="text-gray-500 mt-2 max-w-sm">No students are currently enrolled in the selected batches.</p>
                    </div>
                ) : (
                    <div className="border border-[#d0d3d9] rounded-[16px] overflow-hidden bg-white">
                        <div className="hidden md:grid grid-cols-[minmax(0,1fr)_90px_90px_90px_90px] items-center px-5 py-3 border-b border-[#d0d3d9] bg-gray-50/60" style={{ fontFamily: "Inter, sans-serif" }}>
                            <div className="text-xs font-semibold text-[#616161] uppercase tracking-wide">Student</div>
                            <div className="text-center text-xs font-semibold text-[#616161] uppercase tracking-wide">Slab 1</div>
                            <div className="text-center text-xs font-semibold text-[#616161] uppercase tracking-wide">Slab 2</div>
                            <div className="text-center text-xs font-semibold text-[#616161] uppercase tracking-wide">Slab 3</div>
                            <div className="text-center text-xs font-semibold text-[#616161] uppercase tracking-wide">Total</div>
                        </div>

                        {filteredStudents.map((student, idx) => (
                            <div 
                                key={student._id}
                                onClick={() => handleStudentClick(student)}
                                className={`flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_90px_90px_90px_90px] items-start md:items-center px-5 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer gap-4 md:gap-0 ${idx < filteredStudents.length - 1 ? "border-b border-[#d0d3d9]" : ""}`}
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                <div className="flex items-center gap-4 min-w-0 pr-4">
                                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-bold text-sm border border-[#d0d3d9]">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-black text-sm truncate">{student.name}</h3>
                                        <div className="text-[#9c9c9c] text-xs mt-0.5 truncate">{student.rollNo || 'N/A'} • {student.email}</div>
                                        {student.pendingCount > 0 && (
                                            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-50 text-orange-700 uppercase tracking-wider border border-orange-200">
                                                {student.pendingCount} Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-row items-center justify-between w-full md:contents gap-2 mt-2 md:mt-0">
                                    <div className="flex flex-col md:flex-row md:justify-center items-center text-sm font-semibold text-[#616161] bg-gray-50 md:bg-transparent px-3 py-2 md:p-0 rounded-xl border border-gray-100 md:border-none flex-1 md:flex-auto mr-2 md:mr-0">
                                        <span className="md:hidden text-[10px] text-[#9c9c9c] font-bold uppercase tracking-wide block">Slab 1</span>
                                        <span className="text-lg md:text-sm">{student.slabs?.slab1 || 0}</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:justify-center items-center text-sm font-semibold text-[#616161] bg-gray-50 md:bg-transparent px-3 py-2 md:p-0 rounded-xl border border-gray-100 md:border-none flex-1 md:flex-auto mr-2 md:mr-0">
                                        <span className="md:hidden text-[10px] text-[#9c9c9c] font-bold uppercase tracking-wide block">Slab 2</span>
                                        <span className="text-lg md:text-sm">{student.slabs?.slab2 || 0}</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:justify-center items-center text-sm font-semibold text-[#616161] bg-gray-50 md:bg-transparent px-3 py-2 md:p-0 rounded-xl border border-gray-100 md:border-none flex-1 md:flex-auto mr-2 md:mr-0">
                                        <span className="md:hidden text-[10px] text-[#9c9c9c] font-bold uppercase tracking-wide block">Slab 3</span>
                                        <span className="text-lg md:text-sm">{student.slabs?.slab3 || 0}</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:justify-center items-center text-sm font-bold text-black border-l md:border-none border-gray-200 pl-4 md:pl-0 flex-1 md:flex-auto">
                                        <span className="md:hidden text-[10px] text-black font-bold uppercase tracking-wide block">Total</span>
                                        <span className="text-2xl md:text-sm">{student.totalPoints || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ---- View 2: Student Activities ----
    if (view === 'ACTIVITIES') {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <button 
                    onClick={() => setView('STUDENTS')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm mb-6 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Back to Students
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="h-16 w-16 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-black font-black text-2xl border border-gray-300">
                        {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">{selectedStudent.name}</h1>
                        <p className="text-gray-500 text-sm font-medium">{selectedStudent.rollNo} • {selectedStudent.totalPoints} Points Earned</p>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Submitted Activities</h2>
                    <select
                        className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2 text-sm font-medium outline-none shadow-sm"
                        value={activityStatusFilter}
                        onChange={(e) => setActivityStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value={ACTIVITY_STATUSES.PENDING_VERIFICATION}>Pending</option>
                        <option value={ACTIVITY_STATUSES.REVIEW_REQUIRED}>Review Required</option>
                        <option value={ACTIVITY_STATUSES.VERIFIED}>Verified</option>
                        <option value={ACTIVITY_STATUSES.REJECTED}>Rejected</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" /></div>
                ) : filteredActivities.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No activities found</h3>
                        <p className="text-gray-500 mt-2 max-w-sm">Try changing the filter or the student has not uploaded anything.</p>
                    </div>
                ) : (
                    <div className="border border-[#d0d3d9] rounded-[16px] overflow-hidden bg-white">
                        <div className="hidden md:grid grid-cols-[minmax(0,1fr)_120px_100px_150px_120px_80px] items-center px-5 py-3 border-b border-[#d0d3d9] bg-gray-50/60" style={{ fontFamily: "Inter, sans-serif" }}>
                            <div className="text-xs font-semibold text-[#616161] uppercase tracking-wide">Activity</div>
                            <div className="text-xs font-semibold text-[#616161] uppercase tracking-wide">Level</div>
                            <div className="text-center text-xs font-semibold text-[#616161] uppercase tracking-wide">Points</div>
                            <div className="text-center text-xs font-semibold text-[#616161] uppercase tracking-wide">Status</div>
                            <div className="text-right text-xs font-semibold text-[#616161] uppercase tracking-wide">Date</div>
                            <div className="text-right text-xs font-semibold text-[#616161] uppercase tracking-wide">Action</div>
                        </div>

                        {filteredActivities.map((activity, idx) => (
                            <div 
                                key={activity._id}
                                onClick={() => handleActivityClick(activity)}
                                className={`flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_120px_100px_150px_120px_80px] items-start md:items-center px-5 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer gap-3 md:gap-0 ${idx < filteredActivities.length - 1 ? "border-b border-[#d0d3d9]" : ""}`}
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                <div className="min-w-0 pr-4 w-full">
                                    <h3 className="font-semibold text-black text-sm truncate" title={activity.activityName || activity.activityLabel || `Activity - Rule ${activity.ktuRuleId}`}>
                                        {activity.activityName || activity.activityLabel || `Activity - Rule ${activity.ktuRuleId}`}
                                    </h3>
                                    <div className="text-[#9c9c9c] text-xs mt-0.5 truncate">Rule {activity.ktuRuleId} • {activity.achievementType || 'N/A'}</div>
                                </div>
                                <div className="w-full text-sm font-medium text-[#616161]">
                                    <span className="md:hidden text-xs text-[#9c9c9c] mr-2">Level:</span>
                                    {activity.eventLevel || 'N/A'}
                                </div>
                                <div className="w-full md:text-center text-sm font-bold text-black">
                                    <span className="md:hidden text-xs font-semibold text-[#616161] mr-2">Points:</span>
                                    {activity.calculatedPoints || 0}
                                </div>
                                <div className="w-full md:flex md:justify-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                        activity.status === ACTIVITY_STATUSES.VERIFIED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        activity.status === ACTIVITY_STATUSES.REJECTED ? 'bg-red-50 text-red-700 border-red-200' :
                                        activity.status === ACTIVITY_STATUSES.REVIEW_REQUIRED ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                        {activity.status === ACTIVITY_STATUSES.PENDING_VERIFICATION ? 'PENDING' : activity.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="w-full md:text-right text-sm font-medium text-[#616161]">
                                    <span className="md:hidden text-xs text-[#9c9c9c] mr-2">Date:</span>
                                    {new Date(activity.createdAt).toLocaleDateString()}
                                </div>
                                <div className="hidden md:flex justify-end text-black font-bold items-center gap-1 text-sm">
                                    Review <ChevronLeft className="h-3 w-3 rotate-180" />
                                </div>
                                <div className="md:hidden w-full pt-2 border-t border-gray-100 flex justify-end text-black font-bold items-center gap-1 text-sm">
                                    Review <ChevronLeft className="h-3 w-3 rotate-180" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ---- View 3: Activity Review Panel ----
    if (view === 'REVIEW') {
        return (
            <div className="p-4 lg:p-6 max-w-7xl mx-auto lg:h-[calc(100vh-100px)] flex flex-col">
                <button 
                    onClick={() => {
                        // Refresh the activities list when going back to reflect any status changes
                        handleStudentClick(selectedStudent);
                    }}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium text-sm mb-4 transition-colors shrink-0"
                >
                    <ChevronLeft className="h-4 w-4" /> Back to Activities
                </button>
                
                <div className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-sm lg:overflow-hidden flex flex-col lg:flex-row min-h-0">
                    {/* Left: Certificate Preview */}
                    <div className="lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50 p-4 flex flex-col min-h-[300px] lg:min-h-0">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-black" /> Evidence Certificate
                            </h3>
                            <a 
                                href={selectedActivity.evidence?.filePath} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-sm text-black hover:text-gray-900 font-medium flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" /> View Full
                            </a>
                        </div>
                        <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 bg-white relative">
                            {selectedActivity.evidence?.mimetype === 'application/pdf' ? (
                                <iframe 
                                    src={selectedActivity.evidence?.filePath} 
                                    className="w-full h-full absolute inset-0"
                                    title="Evidence PDF"
                                />
                            ) : (
                                <img 
                                    src={selectedActivity.evidence?.filePath} 
                                    alt="Evidence" 
                                    className="w-full h-full object-contain absolute inset-0 p-2"
                                />
                            )}
                        </div>
                    </div>

                    {/* Right: Review Panel Component */}
                    <div className="lg:w-1/2 flex flex-col flex-1 lg:h-full bg-white relative">
                        <ActivityReviewPanel 
                            activity={selectedActivity} 
                            onVerify={() => {
                                // Just go back to the list and it will refresh automatically
                                handleStudentClick(selectedStudent);
                            }} 
                            onRetryAi={() => {
                                // Update local state so it says 'Processing...' and triggers the polling effect
                                setSelectedActivity({...selectedActivity, status: 'PROCESSING'});
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return null;
};


// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: The Verification Sidebar
// ─────────────────────────────────────────────────────────────────────────────
const ActivityReviewPanel = ({ activity, onVerify, onRetryAi }) => {
    const [submitting, setSubmitting] = useState(false);
    const [note, setNote] = useState('');
    const [pointsOverride, setPointsOverride] = useState(activity.awardedPoints ?? (activity.calculatedPoints || 0));
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Reset state when activity changes
    useEffect(() => {
        setNote(activity.verificationNote || '');
        setPointsOverride(activity.awardedPoints ?? (activity.calculatedPoints || 0));
    }, [activity]);

    const handleVerify = async (status) => {
        if (status === 'REJECTED' && !note.trim()) {
            alert('Please provide a verification note explaining why this activity is being rejected.');
            return;
        }
        try {
            setSubmitting(true);
            await axios.put(`/teacher/activities/${activity._id}/verify`, {
                status,
                verificationNote: note,
                awardedPoints: Number(pointsOverride)
            });
            onVerify();
        } catch (error) {
            console.error('Verification failed', error);
            alert('Failed to verify activity.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetryAi = async () => {
        try {
            setSubmitting(true);
            await axios.post(`/teacher/activities/${activity._id}/retry-ai`);
            // Trigger the parent component to show "Processing..." and start auto-polling
            if (onRetryAi) onRetryAi();
        } catch (error) {
            console.error('Retry AI failed', error);
            alert(error.response?.data?.message || 'Failed to trigger AI retry.');
        } finally {
            setSubmitting(false);
        }
    };

    const isMismatch = Number(pointsOverride) !== (activity.calculatedPoints || 0);

    return (
        <div className="flex flex-col flex-1 lg:h-full lg:overflow-hidden">
            {/* Header info */}
            <div className="p-6 border-b border-gray-100 bg-white shrink-0">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{activity.activityName || activity.activityLabel || `Activity - Rule ${activity.ktuRuleId}`}</h2>
                        <span className="text-sm text-gray-500 font-medium block mt-1">{activity.student?.name}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                        activity.status === ACTIVITY_STATUSES.VERIFIED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        activity.status === ACTIVITY_STATUSES.REJECTED ? 'bg-red-50 text-red-700 border-red-200' :
                        activity.status === ACTIVITY_STATUSES.REVIEW_REQUIRED ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                        {activity.status === ACTIVITY_STATUSES.PENDING_VERIFICATION ? 'PENDING' : activity.status.replace('_', ' ')}
                    </span>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4 grid grid-cols-2 gap-4">
                    {activity.organizer && (
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Organizer</span>
                            <span className="text-sm text-gray-800 font-medium">{activity.organizer}</span>
                        </div>
                    )}
                    {activity.semester && (
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Semester</span>
                            <span className="text-sm text-gray-800 font-medium">{activity.semester}</span>
                        </div>
                    )}
                    {activity.activityDate && (
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Date</span>
                            <span className="text-sm text-gray-800 font-medium">{new Date(activity.activityDate).toLocaleDateString()}</span>
                        </div>
                    )}
                    {(activity.startDate || activity.endDate) && (
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Duration</span>
                            <span className="text-sm text-gray-800 font-medium">
                                {activity.startDate ? new Date(activity.startDate).toLocaleDateString() : 'N/A'} 
                                {' - '} 
                                {activity.endDate ? new Date(activity.endDate).toLocaleDateString() : 'Present'}
                            </span>
                        </div>
                    )}
                    {activity.scoreOrRank && (
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Score/Rank</span>
                            <span className="text-sm text-gray-800 font-medium">{activity.scoreOrRank}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs font-semibold">Level: {activity.eventLevel || 'N/A'}</span>
                    <span className="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs font-semibold">Rule: {activity.ktuRuleId}</span>
                    <span className="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs font-semibold">Type: {activity.achievementType || 'N/A'}</span>
                    <span className="bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs font-semibold">Stage: {activity.stageOrPhase || 'N/A'}</span>
                </div>
            </div>

            {/* AI Insights & Verification */}
            <div className="p-4 lg:p-6 flex-1 lg:overflow-y-auto custom-scrollbar space-y-6">
                
                {/* AI Verification Box */}
                {activity.status === 'PROCESSING' ? (
                    <div className="flex items-center gap-3 text-black bg-gray-100 p-4 rounded-xl border border-gray-300">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span className="font-semibold text-sm">AI is analyzing this certificate...</span>
                    </div>
                ) : activity.extractedData ? (
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">AI Verified</span>
                                <h3 className="font-bold text-black">Gemini Extraction Results</h3>
                            </div>
                            <button 
                                onClick={handleRetryAi}
                                disabled={submitting}
                                className="text-black hover:text-gray-900 p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                                title="Run AI Analysis Again"
                            >
                                <RefreshCw className={`h-4 w-4 ${submitting ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                                <span className="text-gray-500 text-xs font-semibold block mb-1">Extracted Name</span>
                                <span className="font-medium text-black">{activity.extractedData.extracted?.studentName || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 text-xs font-semibold block mb-1">Confidence Score</span>
                                <span className="font-medium text-black">{activity.ktuRule?.verification?.confidence ?? '-'}%</span>
                            </div>
                        </div>

                        {activity.ktuRule?.verification?.aiSummary && (
                            <p className="text-sm text-gray-700 bg-white/50 p-3 rounded-xl border border-white mt-4">
                                <span className="font-semibold mr-1">AI Summary:</span>
                                {activity.ktuRule.verification.aiSummary}
                            </p>
                        )}
                    </div>
                ) : (
                    <button 
                        onClick={handleRetryAi}
                        disabled={submitting}
                        className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 font-semibold hover:bg-gray-50 hover:text-black hover:border-black transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${submitting ? 'animate-spin' : ''}`} />
                        {submitting ? 'Triggering AI...' : 'Run AI Analysis'}
                    </button>
                )}

                {/* Score Editing Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-black" /> Points Verification
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-center">
                            <span className="text-xs font-bold text-gray-500 block mb-1">System Calculated</span>
                            <span className="text-2xl font-black text-gray-900">{activity.calculatedPoints || 0}</span>
                        </div>
                        <div className={`rounded-xl p-3 border ${isMismatch ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500' : 'bg-gray-100 border-gray-300'}`}>
                            <span className={`text-xs font-bold block mb-1 ${isMismatch ? 'text-amber-700' : 'text-black'}`}>Final Awarded</span>
                            <input 
                                type="number" 
                                value={pointsOverride}
                                onChange={(e) => setPointsOverride(e.target.value)}
                                className={`w-full bg-white text-xl font-black rounded-lg px-2 py-1 border outline-none ${
                                    isMismatch ? 'text-amber-900 border-amber-300 focus:border-amber-500' : 'text-black border-gray-300 focus:border-black'
                                }`}
                            />
                        </div>
                    </div>
                    {isMismatch && (
                        <p className="text-xs font-medium text-amber-600 mb-4 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Mismatch detected. Please adjust the final awarded points if necessary.
                        </p>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Verification Note (Optional)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add remarks for the student..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all resize-none h-20"
                        />
                    </div>
                </div>

            </div>

            {/* Actions */}
            {activity.status !== ACTIVITY_STATUSES.VERIFIED && activity.status !== ACTIVITY_STATUSES.REJECTED && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={submitting}
                        className="flex-1 py-3 px-4 rounded-xl bg-white border border-red-200 text-red-600 font-bold hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2"
                    >
                        <X className="h-5 w-5" /> {submitting ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                        onClick={() => handleVerify('VERIFIED')}
                        disabled={submitting}
                        className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Check className="h-5 w-5" /> {submitting ? 'Processing...' : 'Approve & Confirm'}
                    </button>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Activity</h3>
                        <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejecting this activity. This note will be visible to the student.</p>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all resize-none h-32 mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    handleVerify('REJECTED');
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-500/20"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityApproval;
