import React, { useState } from 'react';
import axios from '../../api/axios';
import { Users, ChevronRight, Edit2, Trash2, X, UserPlus } from 'lucide-react';

const ManageBatches = ({ batches, fetchBatches, isTeacher }) => {
    const totalBatches = batches?.length || 0;


    // Student Management State
    const [viewingBatch, setViewingBatch] = useState(null);
    const [batchStudents, setBatchStudents] = useState([]);
    const [editingStudent, setEditingStudent] = useState(null);
    const [studentForm, setStudentForm] = useState({ name: '', admissionNo: '', registerId: '' });

    // Add Student State
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({ name: '', email: '', admissionNo: '', registerId: '' });
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);

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

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setAddError('');
        setAddLoading(true);
        try {
            const res = await axios.post(`/teacher/batch/${viewingBatch._id}/student`, addForm);
            setBatchStudents(prev => [...prev, res.data.student]);
            setAddForm({ name: '', email: '', admissionNo: '', registerId: '' });
            setShowAddForm(false);
            fetchBatches();
        } catch (err) {
            setAddError(err.response?.data?.message || 'Failed to add student.');
        } finally {
            setAddLoading(false);
        }
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
        <div className="w-full">
            {/* Batches List */}
            <div>
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Assigned Batches</h2>
                        <p className="text-gray-500">Click a batch to view and manage its students.</p>
                    </div>
                    <span className="bg-[#1A8AE5]/10 text-[#1A8AE5] px-3 py-1 rounded-full text-xs font-bold">
                        {totalBatches} Total
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

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
                            <div className="flex items-center gap-2">
                                {isTeacher && (
                                    <button
                                        onClick={() => { setShowAddForm(f => !f); setEditingStudent(null); setAddError(''); }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            showAddForm
                                                ? 'bg-gray-200 text-gray-700'
                                                : 'bg-[#1A8AE5] text-white hover:bg-[#1570B9] shadow-md shadow-[#1A8AE5]/20'
                                        }`}
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        {showAddForm ? 'Cancel' : 'Add Student'}
                                    </button>
                                )}
                                <button onClick={() => { setViewingBatch(null); setShowAddForm(false); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="h-6 w-6 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6">

                            {/* Add Student Form */}
                            {showAddForm && (
                                <form onSubmit={handleAddStudent} className="space-y-4 bg-blue-50 border border-blue-100 p-5 rounded-2xl mb-6">
                                    <h3 className="font-bold text-[#1A8AE5] flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" /> Add New Student
                                    </h3>
                                    {addError && (
                                        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 font-medium">{addError}</p>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name *</label>
                                            <input
                                                required
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#1A8AE5] focus:border-transparent outline-none transition-all"
                                                placeholder="e.g. John Doe"
                                                value={addForm.name}
                                                onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">College Email *</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#1A8AE5] focus:border-transparent outline-none transition-all"
                                                placeholder="student@gecskp.ac.in"
                                                value={addForm.email}
                                                onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Register No / KTU ID</label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#1A8AE5] focus:border-transparent outline-none transition-all"
                                                placeholder="e.g. PKD23CS038"
                                                value={addForm.registerId}
                                                onChange={e => setAddForm({ ...addForm, registerId: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Admission No</label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#1A8AE5] focus:border-transparent outline-none transition-all"
                                                placeholder="e.g. TVE23CS001"
                                                value={addForm.admissionNo}
                                                onChange={e => setAddForm({ ...addForm, admissionNo: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={addLoading}
                                            className="px-6 py-2.5 bg-[#1A8AE5] disabled:opacity-50 text-white rounded-xl font-bold hover:bg-[#1570B9] transition-all shadow-lg shadow-[#1A8AE5]/20"
                                        >
                                            {addLoading ? 'Addingâ€¦' : 'Add to Batch'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {editingStudent ? (
                                <form onSubmit={handleUpdateStudent} className="space-y-4 bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-gray-800 flex items-center">
                                            <Edit2 className="h-4 w-4 mr-2 text-[#1A8AE5]" />
                                            Edit Student Details
                                        </h3>
                                        <button type="button" onClick={() => setEditingStudent(null)} className="text-xs text-gray-500 hover:text-gray-900 font-bold uppercase">Cancel</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Register No / KTU ID</label>
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
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase rounded-l-xl">Register No</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right rounded-r-xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {batchStudents.map(student => (
                                        <tr key={student._id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-4 py-3.5 font-mono text-xs text-gray-500 font-bold">{student.registerId}</td>
                                            <td className="px-4 py-3.5 font-medium text-gray-900">{student.name}</td>
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

