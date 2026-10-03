import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { 
    CheckCircle2, XCircle, Clock, AlertTriangle, 
    FileText, Award, Calendar, ExternalLink, ChevronDown, Check, X, RefreshCw
} from 'lucide-react';
import { ACTIVITY_STATUSES } from '../../config/constants';

const ActivityApproval = ({ batches }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState('all');
    const [statusFilter, setStatusFilter] = useState(`${ACTIVITY_STATUSES.SUBMITTED},${ACTIVITY_STATUSES.REVIEW_REQUIRED}`);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedBatch !== 'all') params.batchId = selectedBatch;
            if (statusFilter !== 'all') params.status = statusFilter;
            
            const res = await axios.get('/teacher/activities', { params });
            setActivities(res.data.activities || []);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [selectedBatch, statusFilter]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Activity Points Approval</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and verify student activities</p>
                </div>
                <div className="flex gap-3">
                    <select
                        className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                    >
                        <option value="all">All Batches</option>
                        {batches.map(b => (
                            <option key={b._id} value={b._id}>{b.name} ({b.scheme})</option>
                        ))}
                    </select>
                    <select
                        className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value={`${ACTIVITY_STATUSES.SUBMITTED},${ACTIVITY_STATUSES.REVIEW_REQUIRED}`}>Pending Verification</option>
                        <option value={ACTIVITY_STATUSES.VERIFIED}>Verified</option>
                        <option value={ACTIVITY_STATUSES.REJECTED}>Rejected</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : activities.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                    <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">All Caught Up!</h3>
                    <p className="text-gray-500 mt-2 max-w-sm">No activities pending your review in this selection. Great job keeping the queue empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                        {activities.map(activity => (
                            <div 
                                key={activity._id}
                                onClick={() => setSelectedActivity(activity)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                                    selectedActivity?._id === activity._id 
                                        ? 'bg-indigo-50 border-indigo-200 shadow-md ring-1 ring-indigo-500' 
                                        : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                        activity.status === ACTIVITY_STATUSES.VERIFIED ? 'bg-emerald-100 text-emerald-700' :
                                        activity.status === ACTIVITY_STATUSES.REJECTED ? 'bg-red-100 text-red-700' :
                                        activity.status === ACTIVITY_STATUSES.REVIEW_REQUIRED ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {activity.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                        {activity.semester}
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">{activity.activityName}</h4>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <span className="font-medium text-gray-700">{activity.student?.name}</span>
                                    <span className="text-gray-300">•</span>
                                    <span>{activity.student?.registerId}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="lg:col-span-2">
                        {selectedActivity ? (
                            <ActivityReviewPanel 
                                activity={selectedActivity} 
                                onVerify={() => {
                                    setSelectedActivity(null);
                                    fetchActivities();
                                }} 
                            />
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center">
                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Select an Activity</h3>
                                <p className="text-gray-500 mt-2">Click on an activity card from the list to view its details and verify.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ActivityReviewPanel = ({ activity, onVerify }) => {
    const [note, setNote] = useState('');
    const [pointsOverride, setPointsOverride] = useState(activity.calculatedPoints || 0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setPointsOverride(activity.awardedPoints ?? activity.calculatedPoints ?? 0);
        setNote('');
    }, [activity]);

    const handleVerify = async (status) => {
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
            const res = await axios.post(`/teacher/activities/${activity._id}/retry-ai`);
            alert(res.data.message);
            onVerify(); // Refresh the list
        } catch (error) {
            console.error('Retry AI failed', error);
            alert(error.response?.data?.message || 'Failed to trigger AI retry.');
        } finally {
            setSubmitting(false);
        }
    };

    const isMismatch = Number(pointsOverride) !== (activity.calculatedPoints || 0);

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{activity.activityName}</h2>
                        <p className="text-sm text-gray-500 mt-1">{activity.activityLabel}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Student</div>
                        <div className="font-semibold text-gray-900">{activity.student?.name}</div>
                        <div className="text-sm text-gray-500">{activity.student?.registerId}</div>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-4">
                    {activity.evidence?.filePath && (
                        <a 
                            href={`/${activity.evidence.filePath}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Evidence
                        </a>
                    )}
                </div>
            </div>

            {/* AI Insights & Verification */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* AI Verification Box */}
                {activity.extractedData ? (
                    <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-5 border border-violet-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <span className="bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">AI Verified</span>
                                <h3 className="font-bold text-violet-900">Gemini Extraction Results</h3>
                            </div>
                            <button 
                                onClick={handleRetryAi}
                                disabled={submitting || activity.status === 'PROCESSING'}
                                className="text-violet-600 hover:text-violet-800 p-1.5 hover:bg-violet-100 rounded-full transition-colors"
                                title="Retry AI Analysis"
                            >
                                <RefreshCw className={`h-4 w-4 ${submitting ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                                <span className="text-violet-600/70 text-xs font-semibold block mb-1">Extracted Name</span>
                                <span className="font-medium text-violet-900">{activity.extractedData.extracted?.studentName || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-violet-600/70 text-xs font-semibold block mb-1">Confidence Score</span>
                                <span className="font-medium text-violet-900">{activity.ktuRule?.verification?.confidence ?? '-'}%</span>
                            </div>
                        </div>

                        {activity.ktuRule?.verification?.aiSummary && (
                            <p className="text-sm text-violet-800 bg-white/50 p-3 rounded-xl border border-white mt-4">
                                <span className="font-semibold mr-1">AI Summary:</span>
                                {activity.ktuRule.verification.aiSummary}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex justify-between items-start">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-amber-800">No AI Data</h3>
                                <p className="text-sm text-amber-700/80 mt-1">This activity hasn't been processed by the AI verification pipeline yet.</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleRetryAi}
                            disabled={submitting || activity.status === 'PROCESSING'}
                            className="text-amber-700 hover:text-amber-900 px-3 py-1.5 hover:bg-amber-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-amber-200"
                        >
                            <RefreshCw className={`h-4 w-4 ${submitting ? 'animate-spin' : ''}`} />
                            Retry AI
                        </button>
                    </div>
                )}

                {/* Score Editing Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-indigo-500" /> Points Verification
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-center">
                            <span className="text-xs font-bold text-gray-500 block mb-1">System Calculated</span>
                            <span className="text-2xl font-black text-gray-900">{activity.calculatedPoints || 0}</span>
                        </div>
                        <div className={`rounded-xl p-3 border ${isMismatch ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500' : 'bg-indigo-50 border-indigo-200'}`}>
                            <span className={`text-xs font-bold block mb-1 ${isMismatch ? 'text-amber-700' : 'text-indigo-700'}`}>Final Awarded</span>
                            <input 
                                type="number" 
                                value={pointsOverride}
                                onChange={(e) => setPointsOverride(e.target.value)}
                                className={`w-full bg-white text-xl font-black rounded-lg px-2 py-1 border outline-none ${
                                    isMismatch ? 'text-amber-900 border-amber-300 focus:border-amber-500' : 'text-indigo-900 border-indigo-200 focus:border-indigo-500'
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
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none h-24"
                        />
                    </div>
                </div>

            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                    onClick={() => handleVerify('REJECTED')}
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
        </div>
    );
};

export default ActivityApproval;
