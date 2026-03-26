import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { CheckCircle, XCircle, AlertCircle, Clock, Loader2, Download, FileText, Paperclip } from 'lucide-react';

const ROLE_LABELS = { tutor: 'Tutor', hod: 'HoD', principal: 'Principal' };

const VerifyRequest = () => {
    // Extract reqId from URL: /verify/:reqId
    const reqId = window.location.pathname.split('/verify/')[1];
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState(null);
    const [validStatus, setValidStatus] = useState(false);

    useEffect(() => {
        if (!reqId) { setNotFound(true); setLoading(false); return; }
        axios.get(`/request/verify/${reqId}`)
            .then(r => {
                setData(r.data);
                setValidStatus(true); // Set validStatus to true on successful fetch
            })
            .catch(err => {
                if (err.response && err.response.status === 404) {
                    setNotFound(true);
                } else {
                    setError(err.response?.data?.message || 'An unexpected error occurred.'); // Set error message
                }
            })
            .finally(() => setLoading(false));
    }, [reqId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-600 to-primary-800">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center">
                <AlertCircle className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <p className="text-white font-bold">Verifying Request...</p>
            </div>
        </div>
    );

    if (notFound) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Request Not Found</h1>
            <p className="text-gray-500 mt-2">The request ID "{reqId}" could not be found or may be invalid.</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-600 to-primary-800 p-6">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                <p className="text-gray-500 text-sm mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    const isApproved = data.status === 'approved';

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-600 to-primary-800 py-10 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <p className="text-primary-300 text-sm font-semibold uppercase tracking-widest mb-2">GEC Palakkad</p>
                    <h1 className="text-2xl font-bold text-white">Request Verification</h1>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center justify-center gap-3 py-4 rounded-2xl mb-6 ${
                    isApproved ? 'bg-green-500/20 border border-green-400/30' : 'bg-orange-500/20 border border-orange-400/30'
                }`}>
                    {isApproved
                        ? <CheckCircle className="h-7 w-7 text-green-400" />
                        : <Clock className="h-7 w-7 text-orange-400" />
                    }
                    <div>
                        <p className={`font-bold text-lg ${isApproved ? 'text-green-300' : 'text-orange-300'}`}>
                            {isApproved ? 'Officially Approved' : data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                        </p>
                        <p className="text-xs text-primary-200 font-mono">{data.reqId}</p>
                    </div>
                </div>

                {/* Request Details */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-white space-y-3 mb-4 border border-white/10">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-primary-300 text-xs uppercase font-bold">Student</p>
                            <p className="font-semibold">{data.student?.name}</p>
                        </div>
                        <div>
                            <p className="text-primary-300 text-xs uppercase font-bold">Register No</p>
                            <p className="font-mono">{data.student?.registerId}</p>
                        </div>
                        <div>
                            <p className="text-primary-300 text-xs uppercase font-bold">Department</p>
                            <p>{data.student?.department || '—'}</p>
                        </div>
                        <div>
                            <p className="text-primary-300 text-xs uppercase font-bold">Type</p>
                            <p className="capitalize">{data.type?.replace(/_/g, ' ')}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-primary-300 text-xs uppercase font-bold">Subject</p>
                        <p className="text-sm">{data.subject}</p>
                    </div>
                    <div>
                        <p className="text-primary-300 text-xs uppercase font-bold">Submitted On</p>
                        <p className="text-sm">{new Date(data.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                {/* Attachments */}
                {data.attachments?.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 mb-4">
                        <p className="text-primary-300 text-xs uppercase font-bold mb-4 flex items-center gap-2">
                             <Paperclip className="h-4 w-4" />
                             Attachments ({data.attachments.length})
                        </p>
                        <div className="space-y-3">
                            {data.attachments.map((file, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="h-4 w-4 text-primary-300" />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-semibold text-white truncate">{file.filename}</p>
                                            <p className="text-[10px] text-primary-300/70">Verified Attachment</p>
                                        </div>
                                    </div>
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-primary-300 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Download className="h-4 w-4" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Approval Trail */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                    <p className="text-primary-300 text-xs uppercase font-bold mb-4">Approval Trail</p>
                    <div className="space-y-3">
                        {data.approvalTrail.map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className={`mt-0.5 rounded-full p-1 ${
                                    step.status === 'approved' ? 'bg-green-500/30' : 'bg-gray-500/20'
                                }`}>
                                    {step.status === 'approved'
                                        ? <CheckCircle className="h-4 w-4 text-green-400" />
                                        : <Clock className="h-4 w-4 text-gray-400" />
                                    }
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">
                                        {ROLE_LABELS[step.role] || step.role}: {step.approver || '—'}
                                    </p>
                                    {step.actedAt && (
                                        <p className="text-blue-300 text-xs">
                                            Approved on {new Date(step.actedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    )}
                                    {!step.actedAt && (
                                        <p className="text-gray-400 text-xs">Pending</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-blue-300/50 text-xs mt-6">
                    This page is auto-generated by GEC Palakkad Student Management System
                </p>
            </div>
        </div>
    );
};

export default VerifyRequest;
