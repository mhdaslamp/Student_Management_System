import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FileText, Check, X, Award, MapPin, Calendar, Clock, Trophy, Edit2 } from 'lucide-react';

const PendingCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState(null); // For Review Modal
    const [editData, setEditData] = useState({ semester: '', activityDetails: '', venue: '', points: 0 });

    const fetchCertificates = async () => {
        try {
            const res = await axios.get('/teacher/certificates/pending');
            setCertificates(res.data);
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    useEffect(() => { fetchCertificates(); }, []);

    const openReviewModal = (cert) => {
        setSelectedCert(cert);
        setEditData({
            semester: cert.semester,
            activityDetails: cert.activityDetails,
            venue: cert.venue,
            points: 10 // default suggestion
        });
    };

    const handleAction = async (status) => {
        try {
            await axios.put(`/teacher/certificates/${selectedCert._id}/status`, { 
                status, 
                points: editData.points,
                semester: editData.semester,
                activityDetails: editData.activityDetails,
                venue: editData.venue
            });
            setSelectedCert(null);
            fetchCertificates();
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="p-8 font-bold text-gray-500 animate-pulse">Loading certificates...</div>;

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative">
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
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Activity</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Level & Prize</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {certificates.map(cert => (
                            <tr key={cert._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{cert.student?.name}</div>
                                    <div className="text-xs text-gray-500 font-mono mt-1">{cert.student?.admissionNo} • Sem {cert.semester}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-700">{cert.activityDetails}</div>
                                    <div className="text-xs text-gray-400 mt-1 flex items-center"><MapPin className="h-3 w-3 mr-1"/> {cert.venue}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-600">{cert.activityLevel}</div>
                                    <div className="text-xs text-amber-600 mt-1 font-bold">{cert.prize !== 'None' ? cert.prize : ''}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                     <button onClick={() => openReviewModal(cert)} className="px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-sm font-bold transition-colors">
                                        Review Proof
                                     </button>
                                </td>
                            </tr>
                        ))}
                        {certificates.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-12 text-gray-500 font-medium">No pending certificates to review.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Review Modal */}
            {selectedCert && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-900">Review Activity Submission</h3>
                            <button onClick={() => setSelectedCert(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                            {/* Read-only Student Info */}
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
                                <div>
                                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Student</div>
                                    <div className="font-bold text-gray-900">{selectedCert.student?.name} <span className="text-gray-500 font-normal">({selectedCert.student?.admissionNo})</span></div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Submission Date</div>
                                    <div className="text-sm font-medium text-gray-700">{new Date(selectedCert.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* Read-only Achievement Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-100 rounded-2xl">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Activity Level</div>
                                    <div className="font-bold text-gray-800">{selectedCert.activityLevel}</div>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-2xl">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Prize Secured</div>
                                    <div className="font-bold text-gray-800 flex items-center">
                                        {selectedCert.prize !== 'None' && <Trophy className="h-4 w-4 mr-2 text-amber-500"/>} {selectedCert.prize}
                                    </div>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-2xl">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dates</div>
                                    <div className="font-medium text-gray-700 flex items-center"><Calendar className="h-4 w-4 mr-2 text-gray-400"/> {selectedCert.dates}</div>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-2xl">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Duration</div>
                                    <div className="font-medium text-gray-700 flex items-center"><Clock className="h-4 w-4 mr-2 text-gray-400"/> {selectedCert.duration}</div>
                                </div>
                            </div>

                            {/* Editable Form */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 flex items-center"><Edit2 className="h-4 w-4 mr-2"/> Editable Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="col-span-1 border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Semester</label>
                                        <select className="w-full text-sm font-medium outline-none bg-transparent" value={editData.semester} onChange={(e) => setEditData({...editData, semester: e.target.value})}>
                                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Venue</label>
                                        <input type="text" className="w-full text-sm font-medium outline-none bg-transparent" value={editData.venue} onChange={(e) => setEditData({...editData, venue: e.target.value})} />
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Activity Details</label>
                                    <input type="text" className="w-full text-sm font-medium outline-none bg-transparent" value={editData.activityDetails} onChange={(e) => setEditData({...editData, activityDetails: e.target.value})} />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex justify-between items-center">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 mb-1">Attached Proof</div>
                                    <div className="text-sm font-medium text-gray-900">{selectedCert.proofDetails}</div>
                                </div>
                                <a href={`http://localhost:5000${selectedCert.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">
                                    <FileText className="h-4 w-4 mr-2 text-primary-600"/> View Document
                                </a>
                            </div>

                            <div className="border-2 border-primary-100 bg-primary-50/30 rounded-2xl p-6 flex flex-col items-center justify-center">
                                <label className="text-sm font-bold text-gray-700 mb-3">Assign Activity Points</label>
                                <div className="flex items-center text-3xl font-black text-primary-600">
                                    <input type="number" className="w-24 bg-white border border-primary-200 rounded-xl px-2 py-2 text-center outline-none focus:ring-4 focus:ring-primary-100 transition-all mr-2" value={editData.points} onChange={(e) => setEditData({...editData, points: e.target.value})} />
                                    Pts
                                </div>
                            </div>

                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                            <button onClick={() => handleAction('Rejected')} className="px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center transition-colors">
                                <X className="h-4 w-4 mr-2"/> Reject
                            </button>
                            <button onClick={() => handleAction('Approved')} className="px-6 py-2.5 bg-green-500 text-white hover:bg-green-600 rounded-xl font-bold flex items-center shadow-md shadow-green-500/20 transition-all">
                                <Check className="h-4 w-4 mr-2"/> Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default PendingCertificates;
