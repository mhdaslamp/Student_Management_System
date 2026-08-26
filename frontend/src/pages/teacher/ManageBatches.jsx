import React, { useState } from 'react';
import axios from '../../api/axios';
import { Upload, Plus, Users, ChevronRight, CheckSquare, Edit2, Trash2, X, FileText } from 'lucide-react';

const ManageBatches = ({ batches, fetchBatches, isTeacher }) => {
    const [newBatch, setNewBatch] = useState({ name: '', scheme: '2024' });
    const [selectedBatch, setSelectedBatch] = useState('');
    const [file, setFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Student Management State
    const [viewingBatch, setViewingBatch] = useState(null);
    const [batchStudents, setBatchStudents] = useState([]);
    const [editingStudent, setEditingStudent] = useState(null);
    const [studentForm, setStudentForm] = useState({ name: '', admissionNo: '', registerId: '' });

    const totalBatches = batches?.length || 0;

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/teacher/batch', newBatch);
            setNewBatch({ name: '', scheme: '2024' });
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
            fetchBatches();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Upload failed. Check format.';
            const details = error.response?.data?.errors ? ` (${error.response.data.errors[0]})` : '';
            setUploadMessage(`ERROR: ${msg}${details}`);
        }
    };

    const openBatchDetails = async (batch) => {
        setViewingBatch(batch);
        try {
            const res = await axios.get(`/teacher/batch/${batch._id}`);
            setBatchStudents(res.data.students || []);
        } catch (error) {
            console.error('Error fetching batch details:', error);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm('Are you sure you want to remove this student?')) return;
        try {
            await axios.delete(`/teacher/student/${studentId}`);
            setBatchStudents(batchStudents.filter(s => s._id !== studentId));
            fetchBatches(); // Update counts
        } catch (error) {
            console.error('Error deleting student', error);
        }
    };

    const startEditStudent = (student) => {
        setEditingStudent(student);
        setStudentForm({
            name: student.name,
            admissionNo: student.admissionNo,
            registerId: student.registerId
        });
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`/teacher/student/${editingStudent._id}`, studentForm);
            setBatchStudents(batchStudents.map(s => s._id === editingStudent._id ? res.data.student : s));
            setEditingStudent(null);
        } catch (error) {
            console.error('Error updating student', error);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Actions */}
            {isTeacher && (
            <div className="lg:col-span-1 space-y-8">
                {/* Create Batch Card */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-[#1A8AE5] to-[#0066CC]">
                        <h2 className="text-lg font-bold text-white flex items-center">
                            <Plus className="mr-2 h-5 w-5 opacity-80" />
                            New Batch
                        </h2>
                        <p className="text-white/80 text-sm mt-1">Initialize a new student group</p>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleCreateBatch} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">New Batch Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Class of 2025"
                                    className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#1A8AE5] focus:ring-4 focus:ring-[#1A8AE5]/10 transition-all font-medium"
                                    value={newBatch.name}
                                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Scheme</label>
                                <select
                                    className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-[#1A8AE5] focus:ring-4 focus:ring-[#1A8AE5]/10 transition-all font-medium"
                                    value={newBatch.scheme}
                                    onChange={(e) => setNewBatch({ ...newBatch, scheme: e.target.value })}
                                    required
                                >
                                    <option value="2024">2024</option>
                                    <option value="2019">2019</option>
                                </select>
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
                <div className="bg-white rounded-[24px] shadow-lg shadow-[#1A8AE5]/5 border border-[#1A8AE5]/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Upload className="h-24 w-24 text-[#1A8AE5]" />
                    </div>
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                            <Upload className="mr-2 h-5 w-5 text-[#1A8AE5]" />
                            Bulk Upload
                        </h2>

                        <form onSubmit={handleFileUpload} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Target Batch</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:ring-4 focus:ring-[#1A8AE5]/10 outline-none cursor-pointer"
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                    value={selectedBatch}
                                    required
                                >
                                    <option value="">Select a batch...</option>
                                    {batches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.branch})</option>)}
                                </select>
                            </div>

                            <div className="border-2 border-dashed border-[#1A8AE5]/20 rounded-2xl p-6 text-center hover:bg-[#1A8AE5]/5 transition-colors group cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center">
                                    <div className="h-10 w-10 bg-[#1A8AE5]/10 text-[#1A8AE5] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-[#1A8AE5]">
                                        {file ? file.name : 'Drop Excel file here'}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">.xlsx or .csv</span>
                                </div>
                            </div>

                            {uploadMessage && (
                                <div className={`text-xs font-bold p-3 rounded-lg text-center ${uploadMessage.includes('SUCCESS') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {uploadMessage}
                                </div>
                            )}

                            <button
                                disabled={!file || !selectedBatch}
                                className="w-full py-3 bg-[#1A8AE5] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold hover:bg-[#1570B9] transition-all shadow-lg shadow-[#1A8AE5]/20"
                            >
                                Process & Generate Logins
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            )}

            {/* Right Column: Batches List */}
            <div className={`lg:col-span-2 ${!isTeacher ? 'lg:col-span-3' : ''}`}>
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Active Batches</h2>
                        <p className="text-gray-500">Overview of all student groups under your management.</p>
                    </div>
                    <span className="bg-[#1A8AE5]/10 text-[#1A8AE5] px-3 py-1 rounded-full text-xs font-bold">
                        {totalBatches} Total
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.isArray(batches) && batches.map(batch => (
                        <div
                            key={batch._id}
                            onClick={() => openBatchDetails(batch)}
                            className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
                        >
                            <div className="flex justify-between items-start">
                                <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#1A8AE5] group-hover:text-white transition-colors">
                                    <Users className="h-6 w-6" />
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#1A8AE5] transition-colors" />
                            </div>

                            <div className="mt-4">
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#1A8AE5] transition-colors">{batch.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">{batch.branch}</p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex -space-x-2">
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
                    {totalBatches === 0 && (
                        <div className="col-span-2 py-12 text-center bg-white rounded-[24px] border border-dashed border-gray-200">
                            <div className="mx-auto h-12 w-12 text-gray-300">
                                <Users className="h-full w-full" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No batches yet</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new batch on the left.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Student Management Modal */}
            {viewingBatch && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{viewingBatch.name}</h2>
                                <p className="text-sm text-gray-500">{batchStudents.length} Students Enrolled</p>
                            </div>
                            <button onClick={() => setViewingBatch(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6">
                            {editingStudent ? (
                                <form onSubmit={handleUpdateStudent} className="space-y-4 bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-gray-800 flex items-center">
                                            <Edit2 className="h-4 w-4 mr-2 text-[#1A8AE5]" />
                                            Edit Student Details
                                        </h3>
                                        <button type="button" onClick={() => setEditingStudent(null)} className="text-xs text-gray-500 hover:text-gray-900 font-bold uppercase">Cancel</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Full Name</label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1A8AE5] focus:border-transparent outline-none transition-all"
                                                placeholder="Name"
                                                value={studentForm.name}
                                                onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Admission No</label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1A8AE5] focus:border-transparent outline-none transition-all"
                                                placeholder="Admission No"
                                                value={studentForm.admissionNo}
                                                onChange={e => setStudentForm({ ...studentForm, admissionNo: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Register ID</label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1A8AE5] focus:border-transparent outline-none transition-all"
                                                placeholder="Register ID"
                                                value={studentForm.registerId}
                                                onChange={e => setStudentForm({ ...studentForm, registerId: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200">Save Changes</button>
                                    </div>
                                </form>
                            ) : null}

                            <table className="w-full text-left">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase rounded-l-xl">Roll No</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Adm No</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right rounded-r-xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {batchStudents.map(student => (
                                        <tr key={student._id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-4 py-3.5 font-mono text-xs text-gray-500 font-bold">{student.registerId}</td>
                                            <td className="px-4 py-3.5 font-medium text-gray-900">{student.name}</td>
                                            <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{student.admissionNo}</td>
                                            <td className="px-4 py-3.5 text-right">
                                                {isTeacher && (
                                                <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEditStudent(student)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteStudent(student._id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {batchStudents.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-12">
                                                <div className="mx-auto h-12 w-12 text-gray-200 mb-2">
                                                    <Users className="h-full w-full" />
                                                </div>
                                                <p className="text-gray-400 font-medium text-sm">No students available.</p>
                                                <p className="text-gray-300 text-xs mt-1">Upload an Excel file to add them.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBatches;
