import { useState } from 'react';
import axios from '../../api/axios';
import { UserPlus, LogOut, Users, School, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [teacherData, setTeacherData] = useState({ name: '', email: '', password: '', department: '' });
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('teachers');

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/admin/teacher', teacherData);
            setMessage('Teacher added successfully');
            setTeacherData({ name: '', email: '', password: '', department: '' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error adding teacher');
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex-shrink-0 hidden md:flex flex-col shadow-sm z-10">
                <div className="p-8 pb-4">
                    <div className="flex items-center space-x-3 text-primary-700">
                        <School className="h-8 w-8" />
                        <span className="text-xl font-bold tracking-tight">EduAdmin</span>
                    </div>
                </div>

                <nav className="mt-8 px-4 space-y-2 flex-1">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center space-x-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('teachers')}
                        className={`flex items-center space-x-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 ${activeTab === 'teachers' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <Users className="h-5 w-5" />
                        <span>Manage Teachers</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50/50">
                {/* Mobile Header */}
                <header className="md:hidden bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
                    <div className="flex items-center space-x-2 text-primary-700">
                        <School className="h-6 w-6" />
                        <span className="font-bold text-lg">EduAdmin</span>
                    </div>
                    <button onClick={logout} className="p-2 bg-gray-100 rounded-full text-gray-600">
                        <LogOut className="h-5 w-5" />
                    </button>
                </header>

                <div className="p-6 md:p-10 max-w-5xl mx-auto">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
                        <p className="text-gray-500 mt-2">Add and manage teaching staff access.</p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                    <UserPlus className="mr-2 h-5 w-5 text-primary-600" />
                                    Add New Teacher
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Create credentials for a new staff member</p>
                            </div>
                        </div>

                        <div className="p-8">
                            {message && (
                                <div className={`px-4 py-3 rounded-xl mb-8 flex items-center ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                    <span className="font-medium text-sm">{message}</span>
                                </div>
                            )}

                            <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-4 md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Sarah Connor"
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all duration-200"
                                        value={teacherData.name}
                                        onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="sarah@school.edu"
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all duration-200"
                                        value={teacherData.email}
                                        onChange={(e) => setTeacherData({ ...teacherData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Department</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Computer Science"
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all duration-200"
                                        value={teacherData.department}
                                        onChange={(e) => setTeacherData({ ...teacherData, department: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Initial Password</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all duration-200"
                                        value={teacherData.password}
                                        onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 pt-4">
                                    <button
                                        type="submit"
                                        className="w-full md:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-600/30 hover:-translate-y-0.5"
                                    >
                                        Create Teacher Account
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
