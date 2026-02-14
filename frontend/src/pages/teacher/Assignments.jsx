import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Plus, Calendar, FileText } from 'lucide-react';
// import { useNavigate } from 'react-router-dom'; // Not used here yet

const TeacherAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [batches, setBatches] = useState([]);
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', batchId: '', dueDate: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const fetchAssignments = async () => {
        try {
            const res = await axios.get('/academic/assignment');
            setAssignments(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/teacher/batch');
            setBatches(res.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchAssignments();
        fetchBatches();
    }, []);



    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/academic/assignment', newAssignment);
            setMessage('Assignment created!');
            setNewAssignment({ title: '', description: '', batchId: '', dueDate: '' });
            fetchAssignments();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error creating assignment');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Creation Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center">
                            <Plus className="mr-2 text-primary-600 h-5 w-5" />
                            New Assignment
                        </h2>
                        {message && <p className="mb-4 text-sm font-medium text-green-600">{message}</p>}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full mt-1 px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    value={newAssignment.title}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <textarea
                                    className="w-full mt-1 px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    rows="3"
                                    value={newAssignment.description}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Target Batch</label>
                                <select
                                    required
                                    className="w-full mt-1 px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newAssignment.batchId}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, batchId: e.target.value })}
                                >
                                    <option value="">Select Batch...</option>
                                    {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Due Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full mt-1 px-4 py-2 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newAssignment.dueDate}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                                />
                            </div>
                            <button
                                disabled={loading}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                            >
                                {loading ? 'Creating...' : 'Create Assignment'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {assignments.map(assign => (
                        <div key={assign._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{assign.title}</h3>
                                <p className="text-gray-500 text-sm mt-1">{assign.description}</p>
                                <div className="flex items-center space-x-4 mt-4">
                                    <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-xs font-bold">
                                        {assign.batch?.name || 'Unknown Batch'}
                                    </span>
                                    <span className="flex items-center text-xs text-gray-500 font-medium">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Due: {new Date(assign.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                                <FileText className="h-5 w-5" />
                            </div>
                        </div>
                    ))}
                    {assignments.length === 0 && (
                        <div className="text-center py-12 text-gray-400">No assignments created yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherAssignments;
