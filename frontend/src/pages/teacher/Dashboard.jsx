import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Upload, Plus, Users, LogOut, FileText, ChevronRight, GraduationCap, LayoutDashboard, CheckSquare, X, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TeacherResults from './Results';
import PendingRequests from './PendingRequests';
import TeacherInternalResults from './InternalResults';
import ManageBatches from './ManageBatches';

const TeacherDashboard = () => {
    const { user, logout } = useAuth();
    const isTeacher = user?.role === 'teacher';
    const isPrincipal = user?.role === 'principal';
    const [activeTab, setActiveTab] = useState(isPrincipal ? 'university-results' : 'manage-batches');
    const [batches, setBatches] = useState([]);


    const renderContent = () => {
        switch (activeTab) {
            case 'manage-batches':
                return <ManageBatches batches={batches} fetchBatches={fetchBatches} isTeacher={isTeacher} />;
            case 'university-results':
                return <TeacherResults batches={batches} />;
            case 'requests':
                return <PendingRequests />;
            case 'internal-results':
                return <TeacherInternalResults batches={batches} />;
            default:
                return <ManageBatches batches={batches} fetchBatches={fetchBatches} isTeacher={isTeacher} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FA] flex font-sans text-[#1F2937]">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-[250px] bg-white border-r border-gray-100 hidden lg:flex flex-col z-20">
                <div className="pt-[24px] px-6 pb-4">
                    <div className="flex items-center space-x-3 text-[#1A8AE5] mb-8">
                        <div className="h-8 w-8 bg-[#1A8AE5]/10 rounded-lg flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-[#1A8AE5]" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">EduCore</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-[16px] py-2">
                    {[
                        { id: 'manage-batches', label: 'Manage Batches', icon: LayoutDashboard, hideFor: ['principal'] },
                        { id: 'university-results', label: 'University Results', icon: CheckSquare },
                        { id: 'requests', label: 'Requests', icon: FileText },
                        { id: 'internal-results', label: 'Internal Results', icon: FileText },
                    ].filter(item => !item.hideFor?.includes(user?.role)).map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-[12px] px-[18px] py-[12px] rounded-[10px] transition-all duration-200 ease-in-out group font-medium relative ${activeTab === item.id
                                ? 'bg-[#E8F3FD] text-[#1A8AE5]'
                                : 'text-[#4B5563] hover:bg-[#F3F4F6] bg-transparent'
                                }`}
                        >
                            {activeTab === item.id && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#1A8AE5] rounded-full"></div>
                            )}
                            <item.icon className={`w-[18px] h-[18px] ${activeTab === item.id ? 'text-[#1A8AE5]' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            <span className="text-[15px]">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 mt-auto">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-[12px] px-[18px] py-[12px] rounded-[10px] text-[#4B5563] hover:bg-red-50 hover:text-red-600 transition-colors duration-200 ease-in-out group mt-4"
                    >
                        <LogOut className="w-[18px] h-[18px] group-hover:text-red-500 transition-colors" />
                        <span className="font-medium text-[15px]">Logout</span>
                    </button>
                    <div className="mt-4 px-2 pb-2 text-center">
                        <p className="text-[10px] text-gray-300 font-medium">© 2025 EduCore Inc.</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-[250px] flex-1 min-h-screen">
                <header className="sticky top-0 z-10 bg-[#F5F7FA]/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 capitalize text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                            {activeTab === 'manage-batches' ? 'Manage Batches' : activeTab === 'requests' ? 'Pending Requests' : 'University Results'}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">Welcome back, Professor</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-[#1A8AE5] to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 ring-4 ring-white">
                            P
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>


        </div>
    );
};

export default TeacherDashboard;
