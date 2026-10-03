import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import {
    LogOut, Users, FileText, RefreshCw, BarChart2,
    Award, Settings, CheckSquare, Bell, ChevronDown, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TeacherResults from './Results';
import PendingRequests from './PendingRequests';
import TeacherInternalResults from './InternalResults';
import ManageBatches from './ManageBatches';
import ActivityApproval from './ActivityApproval';
import samsLogoSmall from '../../assets/SAMS LOGO SMALL.svg';

const NAV_ITEMS = [
    { id: 'manage-batches',   label: 'My Batches',        icon: Users,       hideFor: ['principal'] },
    { id: 'university-results', label: 'KTU Results',     icon: FileText },
    { id: 'internal-results', label: 'Internal Results',  icon: BarChart2,   hideFor: ['principal'] },
    { id: 'activity-approval', label: 'Activity Points',  icon: Award,       hideFor: ['principal'] },
    { id: 'requests',         label: 'Requests',           icon: CheckSquare, hideFor: ['principal'] },
];

const PAGE_TITLES = {
    'manage-batches':    'My Batches',
    'university-results':'KTU Results',
    'internal-results':  'Internal Results',
    'activity-approval': 'Activity Points',
    'requests':          'Pending Requests',
};

const TeacherDashboard = () => {
    const { user, logout } = useAuth();
    const isPrincipal = user?.role === 'principal';
    const isTeacher   = user?.role === 'teacher' || user?.role === 'hod';

    const [activeTab, setActiveTab]   = useState(isPrincipal ? 'university-results' : 'manage-batches');
    const [batches,   setBatches]     = useState([]);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/teacher/batch');
            setBatches(res.data);
        } catch (err) {
            console.error('Error fetching batches:', err);
        }
    };

    useEffect(() => { fetchBatches(); }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'manage-batches':    return <ManageBatches batches={batches} fetchBatches={fetchBatches} isTeacher={isTeacher} />;
            case 'university-results':return <TeacherResults batches={batches} />;
            case 'activity-approval': return <ActivityApproval batches={batches} />;
            case 'requests':          return <PendingRequests />;
            case 'internal-results':  return <TeacherInternalResults batches={batches} />;
            default:                  return <ManageBatches batches={batches} fetchBatches={fetchBatches} isTeacher={isTeacher} />;
        }
    };

    const visibleNav = NAV_ITEMS.filter(item => !item.hideFor?.includes(user?.role));
    const nameInitial = (user?.name || 'T')[0].toUpperCase();

    return (
        <div className="flex h-screen bg-white font-sans overflow-hidden">

            {/* ── Desktop Sidebar ── */}
            <aside className="w-[180px] shrink-0 h-full flex-col border-r border-[#d0d3d9] bg-white z-10 hidden md:flex">
                {/* Logo */}
                <div className="px-4 py-6 h-[85px] flex items-center justify-start overflow-hidden">
                    <img src={samsLogoSmall} alt="SAMS Logo" className="w-[120px] object-contain" />
                </div>

                {/* Search bar (decorative, same as admin) */}
                <div className="px-4 py-2">
                    <div className="bg-white border border-[#9c9c9c] flex gap-2 h-11 items-center px-4 rounded-[56px]">
                        <Search size={16} className="text-[#9c9c9c] shrink-0" />
                        <input
                            type="text"
                            placeholder="Search here..."
                            className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-[#9c9c9c]"
                            disabled
                        />
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex flex-col px-4 gap-2 flex-1 mt-4">
                    {visibleNav.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm transition-colors w-full text-left ${
                                activeTab === item.id
                                    ? 'bg-black text-white font-semibold'
                                    : 'text-[#616161] font-medium hover:bg-gray-100'
                            }`}
                        >
                            <item.icon size={18} className="shrink-0" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Bottom actions */}
                <div className="flex flex-col px-4 pb-6 gap-2">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm text-[#616161] font-medium hover:bg-gray-100 w-full text-left transition-colors">
                        <Settings size={18} className="shrink-0" />
                        <span>Settings</span>
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm text-[#ff3232] font-medium hover:bg-red-50 w-full text-left transition-colors"
                    >
                        <LogOut size={18} className="shrink-0" />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">

                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-between px-10 py-5 w-full shrink-0 border-b border-[#d0d3d9] bg-white h-[85px] z-10">
                    <p className="font-semibold text-black text-lg">
                        {PAGE_TITLES[activeTab] || 'Dashboard'}
                    </p>
                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <button className="relative flex items-center justify-center size-[46px] rounded-full border border-[#d0d3d9] hover:border-black transition-colors bg-white">
                            <Bell size={20} className="text-black" />
                            <span className="absolute top-[10px] right-[10px] size-2 bg-red-500 rounded-full border border-white" />
                        </button>
                        {/* Profile */}
                        <button className="flex items-center gap-3 h-[46px] pl-3 pr-4 rounded-full border border-[#d0d3d9] hover:border-black transition-colors bg-white">
                            <div className="size-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                                {nameInitial}
                            </div>
                            <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user?.name}</span>
                            <ChevronDown size={16} className="text-[#616161]" />
                        </button>
                    </div>
                </header>

                {/* Mobile minimal header */}
                <div className="md:hidden w-full px-6 pt-6 pb-2" />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto px-6 pb-28 md:px-10 md:py-8 bg-white md:pb-8">
                    {renderContent()}
                </main>

                {/* Floating Bottom Nav (Mobile Only) */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
                    <div className="bg-[#2c2c2c] rounded-full p-1.5 flex items-center gap-1 shadow-2xl border border-[#3c3c3c]">
                        {visibleNav.map((item) => 
                            activeTab === item.id ? (
                                <button 
                                    key={item.id}
                                    className="bg-black text-white h-[51px] px-5 rounded-[56px] flex items-center gap-2 font-medium text-[13px] transition-all shadow-sm"
                                >
                                    <item.icon size={20} />
                                    <span className="whitespace-nowrap">{item.label.split(' ')[0]}</span>
                                </button>
                            ) : (
                                <button 
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)} 
                                    className="bg-white text-black size-[51px] rounded-[56px] flex items-center justify-center transition-all hover:bg-gray-100 shadow-sm shrink-0"
                                >
                                    <item.icon size={20} />
                                </button>
                            )
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TeacherDashboard;
