import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FileText, Check, X, Award } from 'lucide-react';

const PendingCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCertificates = async () => {
        try {
            const res = await axios.get('/teacher/certificates/pending');
            setCertificates(res.data);
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    useEffect(() => { fetchCertificates(); }, []);

    const handleAction = async (id, status, points = 0) => {
        try {
            await axios.put(`/teacher/certificates/${id}/status`, { status, points });
            fetchCertificates();
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="p-8 font-bold text-gray-500 animate-pulse">Loading certificates...</div>;

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Award className="mr-2 h-6 w-6 text-primary-500" />
                    Pending Activity Certificates
                </h2>
                <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-xs">
                    {certificates.length} Pending
                </span>
            </div>

            <div className="p-0">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Upload Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Document</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {certificates.map(cert => (
                            <tr key={cert._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{cert.student?.name}</div>
                                    <div className="text-xs text-gray-500 font-mono mt-1">{cert.student?.admissionNo}</div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-700">{cert.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(cert.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <a href={`http://localhost:5000${cert.fileUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary-600 hover:text-primary-700 hover:underline text-sm font-bold">
                                        <FileText className="h-4 w-4 mr-1" /> View
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2 items-center">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id={`points-${cert._id}`}
                                                className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-primary-500 outline-none"
                                                placeholder="Pts"
                                                defaultValue={10}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const pts = parseInt(document.getElementById(`points-${cert._id}`).value) || 0;
                                                handleAction(cert._id, 'Approved', pts);
                                            }}
                                            className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors" title="Approve"
                                        >
                                            <Check className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleAction(cert._id, 'Rejected')}
                                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors" title="Reject"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {certificates.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-12 text-gray-500 font-medium">No pending certificates to review.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default PendingCertificates;
