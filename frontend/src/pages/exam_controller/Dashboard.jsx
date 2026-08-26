import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Shield, LogOut } from 'lucide-react';
import UploadSection from './UploadSection';
import ResultSection from './ResultSection';

const ExamControllerDashboard = () => {
    const { logout } = useAuth();


    const [drafts, setDrafts] = useState([]);
    const [overview, setOverview] = useState([]);

    const fetchDrafts = async () => {
        try {
            const res = await axios.get('/academic/result/draft-overview');
            setDrafts(res.data);
        } catch (error) {
            console.error("Error fetching drafts:", error);
        }
    };

    const fetchOverview = async () => {
        try {
            const res = await axios.get('/academic/result/overview');
            setOverview(res.data);
        } catch (error) {
            console.error("Error fetching overview:", error);
        }
    };

    const refreshAll = () => {
        fetchDrafts();
        fetchOverview();
    };

    useEffect(() => {
        refreshAll();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-gray-900 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Exam Controller Portal</h1>
                        <p className="text-xs text-gray-500 font-medium">University Result Management</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-colors text-sm font-bold"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                </button>
            </header>

            <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8">
                <UploadSection onUploadSuccess={refreshAll} />
                <ResultSection drafts={drafts} overview={overview} refreshAll={refreshAll} />
            </main>
        </div>
    );
};

export default ExamControllerDashboard;
