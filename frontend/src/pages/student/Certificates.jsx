import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Award, Upload, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

const StudentCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [title, setTitle] = useState('');
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

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);
        try {
            await axios.post('/student/certificates', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Certificate uploaded successfully!');
            setTitle('');
            setFile(null);
            fetchCertificates();
        } catch (error) {
            console.error(error);
            setMessage('Failed to upload certificate.');
        }
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle className="text-green-500 h-5 w-5" />;
            case 'Rejected': return <XCircle className="text-red-500 h-5 w-5" />;
            default: return <Clock className="text-yellow-500 h-5 w-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans max-w-md mx-auto relative shadow-2xl p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Award className="mr-2 h-6 w-6 text-primary-600" />
                Extra-Curricular Certificates
            </h1>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-bold mb-4">Upload New</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <input
                            required
                            type="text"
                            placeholder="Certificate Title (e.g. NSS Camp)"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all font-medium text-sm"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer relative hover:bg-gray-50 transition-colors">
                        <input
                            required
                            type="file"
                            accept=".pdf, image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <div className="flex flex-col items-center">
                            <Upload className="h-6 w-6 text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-gray-600">{file ? file.name : 'Tap to select file'}</span>
                        </div>
                    </div>
                    {message && <p className="text-xs font-bold text-center text-primary-600">{message}</p>}
                    <button disabled={loading} className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
                        {loading ? 'Uploading...' : 'Submit'}
                    </button>
                </form>
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">Your Uploads</h2>
            <div className="space-y-4">
                {certificates.map(cert => (
                    <div key={cert._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm">{cert.title}</h3>
                                <div className="flex items-center text-xs text-gray-500 mt-0.5 space-x-2">
                                    <span className="flex items-center mr-2">{getStatusIcon(cert.status)} <span className="ml-1">{cert.status}</span></span>
                                    {cert.points > 0 && <span className="font-bold text-primary-600">({cert.points} pts)</span>}
                                </div>
                            </div>
                        </div>
                        <a href={`http://localhost:5000${cert.fileUrl}`} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-primary-600">
                            <Upload className="h-5 w-5 rotate-180" />
                        </a>
                    </div>
                ))}
                {certificates.length === 0 && <p className="text-center text-sm text-gray-500 py-8">No certificates uploaded yet.</p>}
            </div>
        </div>
    );
};
export default StudentCertificates;
