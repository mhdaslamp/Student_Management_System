import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { RefreshCw, Users, Database, Bot, CheckCircle2, GraduationCap } from 'lucide-react';

export default function SyncPanel() {
    const [status, setStatus] = useState(null);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [browserSyncing, setBrowserSyncing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const statusRes = await axios.get('/sync/status');
            setStatus(statusRes.data);
            setBatches(statusRes.data?.batches || []);
        } catch (error) {
            console.error('Error fetching sync data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAutomatedBrowserSync = async () => {
        setBrowserSyncing(true);
        setMessage('');

        try {
            const res = await axios.post('/sync/automate-browser', {}, { timeout: 360000 });
            setMessage(res.data.message || '✅ Google Contacts Sync completed successfully!');
            loadData();
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Sync failed. Please check terminal logs.');
        } finally {
            setBrowserSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <RefreshCw size={28} className="animate-spin text-blue-600 mr-3" />
                <span className="font-semibold text-gray-700">Loading Directory Sync Status...</span>
            </div>
        );
    }

    return (
        <div className="max-w-5xl w-full mx-auto p-6 flex flex-col gap-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Directory Sync & Batch Auto-Creation
                </h1>
                <p className="text-gray-600 font-medium">
                    Automatically synchronize college Google Contacts, extract B.Tech students, and organize unified class batches.
                </p>
            </div>

            {/* Notification Banner */}
            {message && (
                <div className={`p-4 font-medium rounded-2xl border flex items-center gap-3 ${
                    message.startsWith('✅') 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                    <CheckCircle2 size={20} className="shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Synced Students</p>
                        <p className="text-3xl font-black text-gray-900 mt-0.5">{status?.totalStudents || 0}</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <Database size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Managed Batches</p>
                        <p className="text-3xl font-black text-gray-900 mt-0.5">{status?.totalBatches || batches.length || 0}</p>
                    </div>
                </div>
            </div>

            {/* 🤖 Automated Sync Trigger Card */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                        <Bot size={30} className="text-white" />
                    </div>
                    <div className="flex flex-col gap-1.5 max-w-xl">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Automated Google Contacts Sync
                        </h2>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Launches the native Chrome automation engine to scan the college directory, group Regular &amp; Lateral entries into unified class rosters, and sync all records directly to SAMS.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleAutomatedBrowserSync}
                    disabled={browserSyncing}
                    className="h-14 px-8 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-base shadow-lg transition-all flex items-center justify-center gap-3 shrink-0 disabled:opacity-50 active:scale-95"
                >
                    <RefreshCw size={20} className={browserSyncing ? 'animate-spin' : ''} />
                    {browserSyncing ? 'Scraping & Syncing...' : 'Launch Automated Sync'}
                </button>
            </div>

            {/* Live Database Batches Breakdown */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                        <GraduationCap size={24} className="text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">
                            Current Class Batches in SAMS
                        </h2>
                    </div>
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                        {batches.length} Batches Active
                    </span>
                </div>

                {batches.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 font-medium">
                        No batches found in database. Click "Launch Automated Sync" above to auto-create batches!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="pb-3 px-3">Batch Name</th>
                                    <th className="pb-3 px-3">Department</th>
                                    <th className="pb-3 px-3">Admission Year</th>
                                    <th className="pb-3 px-3">Scheme</th>
                                    <th className="pb-3 px-3 text-right">Students Enrolled</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {batches.map((b) => (
                                    <tr key={b._id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-3.5 px-3 font-bold text-gray-900">{b.name}</td>
                                        <td className="py-3.5 px-3 font-medium text-gray-600">{b.branch}</td>
                                        <td className="py-3.5 px-3 text-gray-500">{b.admissionYear}</td>
                                        <td className="py-3.5 px-3 text-gray-500">{b.scheme || '2019'}</td>
                                        <td className="py-3.5 px-3 text-right font-mono font-bold text-blue-600">
                                            {b.students ? b.students.length : 0} students
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Full Screen Loading Overlay */}
            {browserSyncing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 max-w-sm w-full mx-4 shadow-2xl">
                        <RefreshCw size={44} className="text-blue-600 animate-spin" />
                        <h3 className="text-xl font-bold text-gray-900">Synchronizing College Directory...</h3>
                        <p className="text-gray-500 text-center text-sm leading-relaxed">
                            Scanning Google Contacts, parsing B.Tech roll numbers, and enrolling students into unified batches. Please leave the browser window open.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
