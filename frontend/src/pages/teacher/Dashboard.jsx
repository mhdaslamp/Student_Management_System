import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Upload, Plus, Users, LogOut, FileText, ChevronRight, GraduationCap, LayoutDashboard, Calculator, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TeacherAssignments from './Assignments';
import TeacherResults from './Results';

const TeacherDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [batches, setBatches] = useState([]);
    const [newBatch, setNewBatch] = useState({ name: '', branch: '' });
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [file, setFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchBatches(); }, []);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/teacher/batch');
            setBatches(res.data);
        } catch (error) { console.error(error); }
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/teacher/batch', newBatch);
            setNewBatch({ name: '', branch: '' });
            fetchBatches();
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file || !selectedBatch) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploadMessage('Uploading...');

        try {
            const res = await axios.post(`/teacher/batch/${selectedBatch}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadMessage(`SUCCESS: ${res.data.count} students uploaded & credentials generated!`);
            setFile(null);
            fetchBatches(); // Refresh checks
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Upload failed. Check format.';
            const details = error.response?.data?.errors ? ` (${error.response.data.errors[0]})` : '';
            setUploadMessage(`ERROR: ${msg}${details}`);
        }
    }


    const renderDashboard = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Actions */}
            <div className="lg:col-span-1 space-y-8">
                {/* Create Batch Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-primary-600 to-violet-600">
                        <h2 className="text-lg font-bold text-white flex items-center">
                            <Plus className="mr-2 h-5 w-5 opacity-80" />
                            New Batch
                        </h2>
                        <p className="text-primary-100 text-sm mt-1">Initialize a new student group</p>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleCreateBatch} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Batch ID / Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Class of 2025"
                                    className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium"
                                    value={newBatch.name}
                                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Department / Branch</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Computer Science"
                                    className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all font-medium"
                                    value={newBatch.branch}
                                    onChange={(e) => setNewBatch({ ...newBatch, branch: e.target.value })}
                                    required
                                />
                            </div>
                            <button
                                disabled={loading}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg shadow-gray-200"
                            >
                                {loading ? 'Creating...' : 'Create Batch'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Upload Card */}
                <div className="bg-white rounded-3xl shadow-lg shadow-primary-500/5 border border-primary-100 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Upload className="h-24 w-24 text-primary-600" />
                    </div>
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                            <Upload className="mr-2 h-5 w-5 text-primary-600" />
                            Bulk Upload
                        </h2>

                        <form onSubmit={handleFileUpload} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Target Batch</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:ring-4 focus:ring-primary-50 outline-none cursor-pointer"
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                    required
                                >
                                    <option value="">Select a batch...</option>
                                    {batches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.branch})</option>)}
                                </select>
                            </div>

                            <div className="border-2 border-dashed border-primary-200 rounded-2xl p-6 text-center hover:bg-primary-50 transition-colors group cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center">
                                    <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-primary-700">
                                        {file ? file.name : 'Drop Excel file here'}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">.xlsx or .csv</span>
                                </div>
                            </div>

                            {uploadMessage && (
                                <div className={`text-xs font-bold p-3 rounded-lg text-center ${uploadMessage.includes('SUCCESS') ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'}`}>
                                    {uploadMessage}
                                </div>
                            )}

                            <button
                                disabled={!file || !selectedBatch}
                                className="w-full py-3 bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
                            >
                                Process & Generate Logins
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Column: Batches List */}
            <div className="lg:col-span-2">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Active Batches</h2>
                        <p className="text-gray-500">Overview of all student groups under your management.</p>
                    </div>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">
                        {batches.length} Total
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {batches.map(batch => (
                        <div key={batch._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    <Users className="h-6 w-6" />
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                            </div>

                            <div className="mt-4">
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-700 transition-colors">{batch.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">{batch.branch}</p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {/* Fake avatars for visual polish */}
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                            S{i}
                                        </div>
                                    ))}
                                    {(batch.students?.length || 0) > 3 && (
                                        <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                            +{batch.students.length - 3}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                    {batch.students?.length || 0} Students
                                </span>
                            </div>
                        </div>
                    ))}
                    {batches.length === 0 && (
                        <div className="col-span-2 py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="mx-auto h-12 w-12 text-gray-300">
                                <Users className="h-full w-full" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No batches yet</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new batch on the left.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 hidden md:flex flex-col shadow-sm z-20">
                <div className="p-8 pb-4">
                    <div className="flex items-center space-x-3 text-primary-700">
                        <GraduationCap className="h-8 w-8" />
                        <span className="text-xl font-bold tracking-tight">Portal</span>
                    </div>
                </div>

                <nav className="mt-8 px-4 space-y-2 flex-1">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center space-x-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`flex items-center space-x-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 ${activeTab === 'results' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <Calculator className="h-5 w-5" />
                        <span>University Results</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('assignments')}
                        className={`flex items-center space-x-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 ${activeTab === 'assignments' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <CheckSquare className="h-5 w-5" />
                        <span>Assignments</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50 relative">
                {/* Mobile Header */}
                <header className="md:hidden bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-30">
                    <div className="flex items-center space-x-2 text-primary-600">
                        <GraduationCap className="h-6 w-6" />
                        <span className="font-bold text-lg">Portal</span>
                    </div>
                    <button onClick={logout} className="p-2 bg-gray-100 rounded-full text-gray-600">
                        <LogOut className="h-5 w-5" />
                    </button>
                </header>

                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'assignments' && <TeacherAssignments />}
                    {activeTab === 'results' && <TeacherResults />}
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
