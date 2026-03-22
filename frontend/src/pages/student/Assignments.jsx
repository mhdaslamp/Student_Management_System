import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Calendar, FileText, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await axios.get('/academic/assignment');
                setAssignments(res.data);
            } catch (error) { console.error(error); }
        };
        fetchAssignments();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 p-6">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-3 p-2 bg-white rounded-full text-gray-600 shadow-sm">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            </div>

            <div className="space-y-4">
                {assignments.map(assign => (
                    <div key={assign._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg leading-tight">{assign.title}</h3>
                                <p className="text-xs font-bold text-primary-600 mt-1 uppercase tracking-wider">{assign.batch?.name}</p>
                            </div>
                            <div className="bg-primary-50 p-2 rounded-lg text-primary-600">
                                <FileText className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-3">{assign.description}</p>
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center text-xs text-gray-500 font-medium">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            Due: {new Date(assign.dueDate).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
            {assignments.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <p>No assignments pending.</p>
                </div>
            )}
        </div>
    );
};

export default StudentAssignments;
