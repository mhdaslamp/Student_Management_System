import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { RefreshCw, Users, Database, Bot, CheckCircle2, GraduationCap, AlertCircle, Play, RotateCcw, Clock, Plus, X } from 'lucide-react';

export default function SyncPanel() {
    const [status, setStatus] = useState(null);
    const [checkpoint, setCheckpoint] = useState(null);
    const [batches, setBatches] = useState([]);
    const [prefixes, setPrefixes] = useState([]);
    const [defaultPrefixes, setDefaultPrefixes] = useState([]);
    const [newPrefix, setNewPrefix] = useState('');
    const [loading, setLoading] = useState(true);
    const [browserSyncing, setBrowserSyncing] = useState(false);
    const [syncMode, setSyncMode] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statusRes, checkpointRes, prefixesRes] = await Promise.all([
                axios.get('/sync/status'),
                axios.get('/sync/checkpoint').catch(() => ({ data: null })),
                axios.get('/sync/prefixes').catch(() => ({ data: { prefixes: [], defaultPrefixes: [] } }))
            ]);
            setStatus(statusRes.data);
            setBatches(statusRes.data?.batches || []);
            if (checkpointRes?.data) {
                setCheckpoint(checkpointRes.data);
            }
            if (prefixesRes?.data?.prefixes) {
                setPrefixes(prefixesRes.data.prefixes);
            }
            if (prefixesRes?.data?.defaultPrefixes) {
                setDefaultPrefixes(prefixesRes.data.defaultPrefixes);
            }
        } catch (error) {
            console.error('Error fetching sync data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async (mode = 'balance') => {
        setBrowserSyncing(true);
        setSyncMode(mode);
        setMessage('');

        try {
            const res = await axios.post('/sync/automate-browser', { mode }, { timeout: 360000 });
            setMessage(res.data.message || '✅ Google Contacts Sync completed successfully!');
            await loadData();
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Sync failed. Please check terminal logs.');
        } finally {
            setBrowserSyncing(false);
            setSyncMode('');
            loadData();
        }
    };

    const handleAddPrefix = async (e) => {
        e.preventDefault();
        if (!newPrefix.trim()) return;
        try {
            const res = await axios.post('/sync/prefixes', { prefix: newPrefix });
            setPrefixes(res.data.prefixes);
            setDefaultPrefixes(res.data.defaultPrefixes);
            setNewPrefix('');
            setMessage(res.data.message || 'Prefix added successfully.');
            // Reload checkpoint to reflect new total if necessary
            loadData();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to add prefix.');
        }
    };

    const handleRemovePrefix = async (prefix) => {
        if (!window.confirm(`Are you sure you want to remove the custom prefix '${prefix}'?`)) return;
        try {
            const res = await axios.delete(`/sync/prefixes/${prefix}`);
            setPrefixes(res.data.prefixes);
            setDefaultPrefixes(res.data.defaultPrefixes);
            setMessage(res.data.message || 'Prefix removed successfully.');
            loadData();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to remove prefix.');
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

    const pendingCount = checkpoint?.pendingCount ?? 0;
    const completedCount = checkpoint?.completedCount ?? 0;
    const totalPrefixes = checkpoint?.totalPrefixes ?? 0;
    const hasPendingBalance = pendingCount > 0 && completedCount > 0;

    return (
        <div className="max-w-6xl w-full mx-auto p-6 flex flex-col gap-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Directory Sync &amp; Batch Auto-Creation
                </h1>
                <p className="text-gray-600 font-medium">
                    Prefix-targeted Google Contacts synchronization with resilient streaming, instant checkpointing, and balance recovery.
                </p>
            </div>

            {/* Notification Banner */}
            {message && (
                <div className={`p-4 font-medium rounded-2xl border flex items-center gap-3 ${
                    message.startsWith('✅') 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                    {message.startsWith('✅') ? (
                        <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
                    ) : (
                        <AlertCircle size={20} className="shrink-0 text-rose-600" />
                    )}
                    <span>{message}</span>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prefix Sync Progress</p>
                        <p className="text-2xl font-black text-gray-900 mt-0.5">
                            {completedCount} / {totalPrefixes || 36} <span className="text-xs text-gray-500 font-semibold">Done</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* 🤖 Automated Sync Trigger Card with Dual Modes */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                        <Bot size={30} className="text-white" />
                    </div>
                    <div className="flex flex-col gap-1.5 max-w-xl">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight">
                                Automated Prefix Sync Engine
                            </h2>
                            {hasPendingBalance && (
                                <span className="bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                                    {pendingCount} Balance Pending
                                </span>
                            )}
                        </div>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Queries each class prefix (`pkd23cs0`, `lpkd23cs`), scrolls only results to prevent rate limits, and streams each batch directly into MongoDB with zero data loss on interrupts.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    {/* Primary Button: Resume Balance if interrupted / pending, otherwise Start Sync */}
                    <button
                        type="button"
                        onClick={() => handleSync('balance')}
                        disabled={browserSyncing}
                        className="w-full sm:w-auto h-13 px-6 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-95 cursor-pointer"
                    >
                        {browserSyncing && syncMode === 'balance' ? (
                            <RefreshCw size={18} className="animate-spin" />
                        ) : hasPendingBalance ? (
                            <Play size={18} className="text-amber-600 fill-amber-600" />
                        ) : (
                            <Play size={18} />
                        )}
                        {browserSyncing && syncMode === 'balance' 
                            ? 'Syncing Balance...' 
                            : hasPendingBalance 
                                ? `Resume Pending Balance (${pendingCount})` 
                                : 'Sync Directory Now'}
                    </button>

                    {/* Secondary Button: Start Fresh Full Sync */}
                    <button
                        type="button"
                        onClick={() => handleSync('fresh')}
                        disabled={browserSyncing}
                        className="w-full sm:w-auto h-13 px-5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
                        title="Resets all batch checkpoints and rescans everything from the beginning"
                    >
                        <RotateCcw size={16} className={browserSyncing && syncMode === 'fresh' ? 'animate-spin' : ''} />
                        {browserSyncing && syncMode === 'fresh' ? 'Resetting & Syncing...' : 'Fresh Full Sync'}
                    </button>
                </div>
            </div>

            {/* Prefix Management Section */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Manage Prefix List</h2>
                        <p className="text-xs text-gray-500 font-medium">Add or remove prefixes used for Google Contacts synchronization.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                    <form onSubmit={handleAddPrefix} className="flex gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            value={newPrefix}
                            onChange={(e) => setNewPrefix(e.target.value)}
                            placeholder="e.g. pkd23cs0"
                            className="border border-gray-300 rounded-xl px-4 py-2 text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={!newPrefix.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Plus size={16} /> Add
                        </button>
                    </form>
                </div>

                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
                    {prefixes.map((p) => {
                        const isDefault = defaultPrefixes.includes(p);
                        return (
                            <div key={p} className={`border px-3 py-1.5 rounded-lg text-sm font-mono flex items-center gap-2 ${isDefault ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                                <span>{p}</span>
                                {!isDefault && (
                                    <button
                                        onClick={() => handleRemovePrefix(p)}
                                        className="text-blue-400 hover:text-rose-600 transition-colors"
                                        title="Remove Custom Prefix"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {prefixes.length === 0 && (
                        <div className="text-gray-500 text-sm py-2">No prefixes found.</div>
                    )}
                </div>
            </div>

            {/* Prefix Checkpoint Status Grid */}
            {checkpoint?.prefixes && checkpoint.prefixes.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Prefix Checkpoint Tracker</h2>
                            <p className="text-xs text-gray-500 font-medium">Tracks which prefixes are completed vs pending balance.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
                                {completedCount} Done
                            </span>
                            <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200">
                                {pendingCount} Pending
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto pr-1">
                        {checkpoint.prefixes.map((p) => (
                            <div 
                                key={p.prefix}
                                className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1 transition-colors ${
                                    p.status === 'completed'
                                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                        : p.status === 'failed'
                                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                                            : 'bg-gray-50 border-gray-200 text-gray-600'
                                }`}
                            >
                                <div className="flex items-center justify-between font-mono font-bold">
                                    <span>{p.prefix}</span>
                                    <span>{p.status === 'completed' ? '✓' : '•'}</span>
                                </div>
                                <div className="text-[11px] text-gray-500 font-medium">
                                    {p.status === 'completed' ? `${p.count} students` : 'Pending'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                        No batches found in database. Click "Sync Directory Now" above to auto-create batches!
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
                        <h3 className="text-xl font-bold text-gray-900">
                            {syncMode === 'fresh' ? 'Fresh Directory Sync...' : 'Syncing Balance Prefixes...'}
                        </h3>
                        <p className="text-gray-500 text-center text-sm leading-relaxed">
                            Scanning Google Contacts, parsing B.Tech roll numbers, and streaming batches into database. You can safely close or interrupt anytime without losing progress.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

