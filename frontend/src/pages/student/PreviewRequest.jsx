import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, Eye, Paperclip, FileText } from 'lucide-react';

const PreviewRequest = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const formData = location.state?.formData;

    if (!formData) {
        // If accessed directly without state, go back
        navigate('/student/requests');
        return null;
    }

    // Generate a temporary Req ID to show on preview (real one assigned on submit)
    const previewId = Math.floor(100000 + Math.random() * 900000).toString();

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const formDataPayload = new FormData();
            formDataPayload.append('type', formData.type);
            formDataPayload.append('subject', formData.subject);
            formDataPayload.append('body', formData.body);
            formDataPayload.append('flow', JSON.stringify(formData.flow.map(f => ({ role: f.role, assignedTo: f.assignedTo }))));
            
            if (formData.attachments && formData.attachments.length > 0) {
                formData.attachments.forEach(file => {
                    formDataPayload.append('attachments', file);
                });
            }

            await axios.post('/request', formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Navigate back to dashboard on success
            navigate('/student/requests', { replace: true });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit request.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#eaf4fc] pb-28 font-sans flex flex-col">
            {/* Header */}
            <div className="bg-[#eaf4fc] text-[#1a2744] pt-10 pb-4 px-6 relative z-10 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Eye className="h-6 w-6 text-[#1a2744]" />
                    <h1 className="text-xl font-bold">Preview</h1>
                </div>
            </div>

            <div className="px-5 py-2 flex-1 overflow-y-auto space-y-6">
                
                {/* Flow Section */}
                <div>
                    <p className="text-[13px] font-bold text-[#1a2744] mb-2">Request flow</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        {formData.flow.map((step, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="bg-white rounded-[20px] shadow-sm px-4 py-2">
                                    <span className="font-bold text-[#1a2744] text-[13px]">
                                        {step.role.toUpperCase()} {step.name ? step.name.split(' ')[0] : ''}
                                    </span>
                                </div>
                                {i < formData.flow.length - 1 && (
                                    <ChevronRight className="h-5 w-5 text-gray-500" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Req ID */}
                <p className="text-sm font-bold text-[#1a2744]">Req ID : {previewId}</p>

                {/* Formal Letter */}
                <div className="bg-white rounded-[24px] shadow-sm p-6 text-[14px] font-medium leading-relaxed text-gray-800">
                    <p className="font-bold text-[#1a2744] mb-1">From</p>
                    <p className="font-bold text-black">{user?.name}</p>
                    <p>{user?.department ? `S5 ${user.department}` : ''}</p>
                    <p>{user?.registerId}</p>
                    
                    <div className="h-4"></div>
                    
                    <p className="font-bold text-[#0E6EB8] mb-1">To</p>
                    <p className="font-bold text-black">
                        {formData.flow[formData.flow.length - 1]?.role === 'principal'
                            ? 'The Principal'
                            : formData.flow[formData.flow.length - 1]?.name || 'Target Approver'}
                    </p>
                    <p>Gec Palakkad</p>
                    
                    <div className="h-6"></div>
                    
                    <p><span className="font-bold text-black">Subject :</span> {formData.subject}</p>
                    
                    <div className="h-6"></div>
                    
                    <p className="font-bold text-black">Respected Sir,</p>
                    <div className="h-4"></div>
                    
                    <p className="whitespace-pre-wrap leading-relaxed">{formData.body}</p>
                    
                    <div className="h-6"></div>
                    
                    <p>Sincerely,</p>
                    <p className="font-bold text-black">{user?.name}</p>
                    {user?.phone && <p>{user.phone}</p>}
                    
                    <div className="h-6"></div>
                    <p className="font-bold text-[#0E6EB8]">Signature</p>
                </div>

                {/* Attachments Preview */}
                {formData.attachments?.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-[13px] font-bold text-[#1a2744] flex items-center gap-2 px-1">
                            <Paperclip className="h-4 w-4" />
                            Attachments ({formData.attachments.length})
                        </p>
                        <div className="space-y-2">
                            {formData.attachments.map((file, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-2xl shadow-sm flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-5 w-5 text-primary-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                                        <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit + Submit Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-6 flex gap-4 bg-gradient-to-t from-[#E8F3FD] via-[#E8F3FD] to-transparent">
                <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-4 bg-primary-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:bg-primary-700 transition-transform active:scale-95 text-center"
                >
                    Edit
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-[1.5] py-4 bg-primary-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:bg-primary-700 transition-transform active:scale-95 text-center disabled:opacity-60"
                >
                    {submitting ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        </div>
    );
};

export default PreviewRequest;
