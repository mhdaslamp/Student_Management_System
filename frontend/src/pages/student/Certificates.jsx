import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Award, Upload, FileText, CheckCircle, XCircle, Clock, Calendar, MapPin, Trophy } from 'lucide-react';

const StudentCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [formData, setFormData] = useState({
        semester: '',
        activityDetails: '',
        venue: '',
        activityLevel: '',
        prize: '',
        proofDetails: '',
        startDate: '',
        endDate: '',
        durDays: '',
        durHours: '',
        durMins: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const fetchCertificates = async () => {
        try {
            const res = await axios.get('/student/certificates');
            setCertificates(res.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchCertificates(); }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file to upload.');
            return;
        }

        setLoading(true);
        const data = new FormData();
        
        const combinedDates = formData.endDate ? `${formData.startDate} to ${formData.endDate}` : formData.startDate;
        const d = parseInt(formData.durDays) || 0;
        const h = parseInt(formData.durHours) || 0;
        const m = parseInt(formData.durMins) || 0;
        const combinedDuration = `${d} Days, ${h} Hrs, ${m} Mins`;

        Object.keys(formData).forEach(key => {
            if (!['startDate', 'endDate', 'durDays', 'durHours', 'durMins'].includes(key)) {
                data.append(key, formData[key]);
            }
        });
        
        data.append('dates', combinedDates);
        data.append('duration', combinedDuration);
        data.append('file', file);
        
        try {
            await axios.post('/student/certificates', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Activity documented successfully!');
            setFormData({ 
                semester: '', activityDetails: '', venue: '', activityLevel: '', prize: '', 
                proofDetails: '', startDate: '', endDate: '', durDays: '', durHours: '', durMins: '' 
            });
            setFile(null);
            fetchCertificates();
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Failed to submit actvity form.');
        }
        setLoading(false);
        setTimeout(() => setMessage(''), 4000);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return { icon: <CheckCircle className="text-green-500 h-5 w-5" />, bg: 'bg-green-50 border-green-200' };
            case 'Rejected': return { icon: <XCircle className="text-red-500 h-5 w-5" />, bg: 'bg-red-50 border-red-200' };
            default: return { icon: <Clock className="text-yellow-500 h-5 w-5" />, bg: 'bg-yellow-50 border-yellow-200' };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans max-w-2xl mx-auto relative shadow-2xl p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Award className="mr-2 h-7 w-7 text-primary-600" />
                Extra-Curricular Activity Log
            </h1>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Log New Activity</h2>
                <form onSubmit={handleUpload} className="space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Semester</label>
                            <select required name="semester" value={formData.semester} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-medium text-gray-800">
                                <option value="">Select Semester</option>
                                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Level</label>
                            <select required name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-medium text-gray-800">
                                <option value="">Select Level</option>
                                {['College Event', 'Zonal Event', 'State Event', 'University Event', 'National Event', 'International Event'].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Details (Name/Description)</label>
                        <input required type="text" name="activityDetails" placeholder="e.g. NSS Annual Camp Volunteering" value={formData.activityDetails} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-medium text-gray-800" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Venue</label>
                            <input required type="text" name="venue" placeholder="e.g. Main Auditorium" value={formData.venue} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-medium text-gray-800" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prize Secured</label>
                            <select required name="prize" value={formData.prize} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-medium text-gray-800">
                                <option value="">Select Prize</option>
                                {['First', 'Second', 'Third', 'Other', 'None'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* DATES and DURATION SLIDER SECTIONS */}
                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-sky-700 uppercase tracking-wider">Start Date</label>
                                <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-white border border-transparent shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-medium text-gray-800" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-sky-700 uppercase tracking-wider">End Date (Optional)</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-white border border-transparent shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-medium text-gray-800" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-sky-700 uppercase tracking-wider">Duration Breakdown</label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex items-center bg-white shadow-sm rounded-xl px-3 py-2 border border-transparent focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                                    <input type="number" min="0" placeholder="0" name="durDays" value={formData.durDays} onChange={handleChange} className="w-full bg-transparent outline-none text-center font-bold text-gray-800 text-lg" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Days</span>
                                </div>
                                <div className="flex items-center bg-white shadow-sm rounded-xl px-3 py-2 border border-transparent focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                                    <input type="number" min="0" max="23" placeholder="0" name="durHours" value={formData.durHours} onChange={handleChange} className="w-full bg-transparent outline-none text-center font-bold text-gray-800 text-lg" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Hrs</span>
                                </div>
                                <div className="flex items-center bg-white shadow-sm rounded-xl px-3 py-2 border border-transparent focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                                    <input type="number" min="0" max="59" placeholder="0" name="durMins" value={formData.durMins} onChange={handleChange} className="w-full bg-transparent outline-none text-center font-bold text-gray-800 text-lg" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Mins</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Details of Proof Uploaded</label>
                        <input required type="text" name="proofDetails" placeholder="e.g. Certificate of Participation PDF" value={formData.proofDetails} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm font-medium text-gray-800" />
                    </div>

                    <div className="space-y-1 pt-2">
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upload Proof Document</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer relative hover:bg-gray-50 transition-colors bg-white">
                            <input required type="file" accept=".pdf, image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files[0])} />
                            <div className="flex flex-col items-center">
                                <Upload className="h-8 w-8 text-primary-400 mb-3" />
                                <span className="text-sm font-bold text-gray-700">{file ? file.name : 'Tap to select PDF or Image'}</span>
                                {!file && <span className="text-xs text-gray-400 mt-1">Maximum size: 5MB</span>}
                            </div>
                        </div>
                    </div>

                    {message && <div className={`p-4 rounded-xl text-sm font-bold text-center border ${message.includes('successfully') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{message}</div>}
                    
                    <button disabled={loading} className="w-full py-4 mt-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 text-lg shadow-md hover:shadow-lg">
                        {loading ? 'Submitting Log...' : 'Submit Activity Log'}
                    </button>
                </form>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Your Submission History</h2>
            <div className="space-y-4">
                {certificates.map(cert => {
                    const statusStyle = getStatusStyle(cert.status);
                    return (
                        <div key={cert._id} className={`p-5 rounded-2xl border ${statusStyle.bg} flex flex-col relative`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{cert.activityDetails || 'Untitled Activity'}</h3>
                                    <div className="flex flex-wrap items-center mt-1 text-xs font-bold text-gray-500 gap-y-2">
                                        <span className="bg-white/60 px-2 py-1 rounded-md mr-2">{cert.activityLevel || 'N/A'}</span>
                                        <span className="bg-white/60 px-2 py-1 rounded-md mr-2 text-primary-700">Sem {cert.semester || '?'}</span>
                                        {cert.prize && cert.prize !== 'None' && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md mr-2 flex items-center"><Trophy className="h-3 w-3 mr-1" /> {cert.prize}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                     <div className="flex items-center space-x-1 font-bold text-sm bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                                        {statusStyle.icon} <span className="text-gray-700">{cert.status}</span>
                                     </div>
                                     {cert.points > 0 && <span className="text-emerald-600 font-black text-lg mt-2">+{cert.points} Pts</span>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mt-2 bg-white/50 p-3 rounded-xl border border-white">
                                <div className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400"/> {cert.venue || 'No Venue'}</div>
                                <div className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400"/> {cert.dates || 'N/A'} {cert.duration ? `(${cert.duration})` : ''}</div>
                            </div>

                            <a href={`http://localhost:5000${cert.fileUrl}`} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center w-full py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-primary-600 hover:bg-primary-50 hover:text-primary-700 transition-colors shadow-sm">
                                <FileText className="h-4 w-4 mr-2" /> View Attached Proof
                            </a>
                        </div>
                    );
                })}
                {certificates.length === 0 && <p className="text-center font-medium py-10 bg-white rounded-2xl border border-gray-100 text-gray-400">No activities logged yet.</p>}
            </div>
        </div>
    );
};
export default StudentCertificates;
