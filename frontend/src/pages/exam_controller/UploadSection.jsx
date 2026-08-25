import React, { useState } from 'react';
import axios from '../../api/axios';
import { Upload, FileText, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

const UploadSection = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('ERROR: Please select a PDF file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('examType', 'university');

        setMessage('Processing PDF... This may take a moment...');
        setLoading(true);

        try {
            const res = await axios.post('/academic/result/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `University_Results.xlsx`);
            document.body.appendChild(link);
            link.click();

            setMessage('SUCCESS: PDF processed. Review in Recent Uploads below, then Publish when ready.');
            setFile(null);
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            console.error(error);
            setMessage('ERROR: Failed to process PDF. Ensure it is a valid University Result file.');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white">
                <div>
                    <h2 className="text-xl font-bold flex items-center">
                        <Upload className="mr-3 h-6 w-6" />
                        Upload University Results
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">Upload the official PDF result sheet. After upload, review and publish to release to teachers and students.</p>
                </div>
            </div>

            <div className="p-8">
                <form onSubmit={handleUpload} className="space-y-6">
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer relative group">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center">
                            <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileText className="h-7 w-7" />
                            </div>
                            <span className="font-bold text-gray-700 text-lg">
                                {file ? file.name : 'Click to Upload PDF'}
                            </span>
                            <span className="text-sm text-gray-400 mt-2">Official University Result PDF — semester detected automatically</span>
                        </div>
                    </div>

                    <button
                        disabled={!file || loading}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? 'Processing...' : 'Process & Save as Draft'}
                        {!loading && <ChevronRight className="ml-2 h-5 w-5" />}
                    </button>
                </form>

                {message && (
                    <div className={`mt-6 p-4 rounded-xl flex items-center font-bold text-sm ${message.includes('SUCCESS') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {message.includes('SUCCESS') ? <CheckCircle className="mr-3 h-5 w-5" /> : <AlertCircle className="mr-3 h-5 w-5" />}
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadSection;
