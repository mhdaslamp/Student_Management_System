import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { X, Check } from 'lucide-react';

const AssignBatchModal = ({ staff, onClose, onAssign }) => {
    const [batches, setBatches] = useState([]);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                // Admin can see all batches by fetching from teacher/batch 
                // because backend for admin returns all batches.
                const res = await axios.get('/teacher/batch');
                setBatches(res.data);
                
                // Pre-select batches already assigned to this staff member
                const assigned = res.data.filter(b => b.createdBy === staff._id).map(b => b._id);
                setSelectedBatches(assigned);
            } catch (error) {
                console.error('Error fetching batches:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBatches();
    }, [staff]);

    const handleToggle = (batchId) => {
        setSelectedBatches(prev => 
            prev.includes(batchId) 
                ? prev.filter(id => id !== batchId) 
                : [...prev, batchId]
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await axios.put(`/admin/staff/${staff._id}/batches`, { batchIds: selectedBatches });
            onAssign(); // Refresh or close
            onClose();
        } catch (error) {
            console.error('Error assigning batches:', error);
            alert(error.response?.data?.message || 'Failed to assign batches');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-xl">Assign Batches</h3>
                        <p className="text-sm text-gray-500">For {staff.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6 space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                        </div>
                    ) : batches.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 text-sm">No batches available.</p>
                    ) : (
                        batches.map(batch => {
                            const isSelected = selectedBatches.includes(batch._id);
                            return (
                                <div 
                                    key={batch._id} 
                                    onClick={() => handleToggle(batch._id)}
                                    className={`p-4 rounded-2xl cursor-pointer border-2 transition-all flex items-center justify-between ${
                                        isSelected ? 'border-black bg-gray-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'
                                    }`}
                                >
                                    <div>
                                        <h4 className="font-bold text-gray-900">{batch.name}</h4>
                                        <p className="text-xs text-gray-500">
                                            {batch.branch} • Scheme {batch.scheme}
                                        </p>
                                    </div>
                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        isSelected ? 'bg-black border-black' : 'border-gray-300'
                                    }`}>
                                        {isSelected && <Check size={14} className="text-white" />}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="flex gap-3 mt-auto shrink-0">
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-3.5 rounded-2xl border border-[#d0d3d9] text-black font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={saving || loading}
                        className="flex-1 py-3.5 rounded-2xl bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Assign"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignBatchModal;
