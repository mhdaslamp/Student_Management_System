import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { UserPlus, LogOut, Users, Search, Trash2, Edit2, X, FileText, Settings, Eye, EyeOff, RefreshCw, BarChart2, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminResultsPage from './ResultsPage';
import SyncPanel from './SyncPanel';
import samsLogoSmall from '../../assets/SAMS LOGO SMALL.svg';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const mainContentRef = useRef(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });
    const [staffList, setStaffList] = useState([]);
    const [editingStaff, setEditingStaff] = useState(null);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('sync'); // Default to sync as per design
    const [activeRole, setActiveRole] = useState('HOD'); // 'Principal', 'HOD', 'Tutor', 'Professor'
    const [showPwd, setShowPwd] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Results state
    const [drafts, setDrafts] = useState([]);
    const [overview, setOverview] = useState([]);

    useEffect(() => {
        if (activeTab === 'staff') fetchStaff();
        if (activeTab === 'results') fetchResults();
    }, [activeTab, activeRole]);

    const fetchStaff = async () => {
        try {
            const res = await axios.get('/admin/staff');
            setStaffList(res.data);
        } catch (error) {
            console.error('Error fetching staff:', error);
            setStaffList([]);
        }
    };

    const fetchResults = async () => {
        try {
            const [draftsRes, overviewRes] = await Promise.all([
                axios.get('/academic/result/draft-overview'),
                axios.get('/academic/result/overview'),
            ]);
            setDrafts(draftsRes.data || []);
            setOverview(overviewRes.data || []);
        } catch (error) {
            console.error('Error fetching results:', error);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            let backendRole = 'teacher';
            let designation = 'teacher';
            if (activeRole === 'Principal') { backendRole = 'principal'; designation = 'principal'; }
            else if (activeRole === 'HOD') { backendRole = 'hod'; designation = 'hod'; }
            else if (activeRole === 'Tutor') { backendRole = 'teacher'; designation = 'tutor'; }
            else if (activeRole === 'Professor') { backendRole = 'teacher'; designation = 'teacher'; }

            const payload = { ...formData, role: backendRole, designation };
            if (activeRole === 'Principal' || activeRole === 'Admin') payload.department = undefined;

            const res = await axios.post('/admin/staff', payload);
            setMessage(`${activeRole} added successfully`);
            setStaffList([...staffList, res.data.user]);
            setFormData({ name: '', email: '', password: '', department: 'CSE' });
            setTimeout(() => setMessage(''), 3000);
            fetchStaff();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error adding user');
        }
    };

    const handleUpdateStaff = async (e) => {
        e.preventDefault();
        try {
            let backendRole = 'teacher';
            if (activeRole === 'Principal') backendRole = 'principal';
            else if (activeRole === 'HOD') backendRole = 'hod';

            const payload = { ...formData, role: backendRole };
            const res = await axios.put(`/admin/staff/${editingStaff._id}`, payload);
            setMessage('User updated successfully');
            setStaffList(staffList.map(s => s._id === editingStaff._id ? res.data.user : s));
            setFormData({ name: '', email: '', password: '', department: 'CSE' });
            setEditingStaff(null);
            setTimeout(() => setMessage(''), 3000);
            fetchStaff();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error updating user');
        }
    };

    const handleDeleteStaff = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`/admin/staff/${id}`);
            setStaffList(staffList.filter(s => s._id !== id));
            setMessage('User deleted successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error deleting user');
        }
    };

    const startEdit = (staff) => {
        setEditingStaff(staff);
        setFormData({
            name: staff.name || '',
            email: staff.email || '',
            department: staff.department || '',
            password: ''
        });
        if (mainContentRef.current) {
            mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const cancelEdit = () => {
        setEditingStaff(null);
        setFormData({ name: '', email: '', password: '', department: '' });
    };

    const displayRole = (staff) => {
        if (staff.designation === 'tutor') return 'Tutor';
        if (staff.role === 'principal') return 'Principal';
        if (staff.role === 'hod') return 'HOD';
        if (staff.role === 'teacher') return 'Professor';
        return staff.role;
    };

    const displayDept = (dept) => {
        if (!dept) return null;
        if (dept === 'Computer Science and Engineering' || dept === 'CSE') return 'Computer Science & Engineering';
        if (dept === 'Mechanical Engineering' || dept === 'ME') return 'Mechanical Engineering';
        if (dept === 'Information Technology' || dept === 'IT') return 'Information Technology';
        if (dept === 'Electronics and Communication Engineering' || dept === 'ECE') return 'Electronics & Communication';
        return dept;
    };

    const DeptTag = ({ dept }) => {
        if (!dept) return null;
        return (
            <span className="bg-[#c9e3ff] px-3 py-0.5 rounded-[56px] text-[#616161] text-sm" style={{ fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
                {displayDept(dept)}
            </span>
        );
    };

    const PillBtn = ({ active, onClick, children, size = "text", className = "" }) => {
        const base = size === "icon"
            ? "relative shrink-0 size-14 rounded-[56px] flex items-center justify-center transition-colors"
            : "relative shrink-0 h-14 rounded-[56px] px-8 font-semibold text-base transition-colors";
        const style = active ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50 border border-[#d0d3d9]";
        return (
            <button type="button" onClick={onClick} className={`${base} ${style} ${className}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                {children}
            </button>
        );
    };

    const filteredStaff = staffList.filter(s => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.department?.toLowerCase().includes(q));
    });

    return (
        <div className="flex h-screen bg-white font-sans overflow-hidden">
            {/* ── Desktop Sidebar ── */}
            <aside className="w-[180px] shrink-0 h-full flex-col border-r border-[#d0d3d9] bg-white z-10 hidden md:flex">
                <div className="px-4 py-6 h-[85px] flex items-center justify-start overflow-hidden">
                    <img src={samsLogoSmall} alt="SAMS Logo" className="w-[120px] object-contain" />
                </div>
                <div className="px-4 py-2">
                    <div className="bg-white border border-[#9c9c9c] flex gap-2 h-11 items-center px-4 rounded-[56px]">
                        <Search size={16} className="text-[#9c9c9c] shrink-0" />
                        <input type="text" placeholder="Search here..." className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-[#9c9c9c]" style={{ fontFamily: "'Inter', sans-serif" }} disabled />
                    </div>
                </div>
                <nav className="flex flex-col px-4 gap-2 flex-1 mt-4">
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm transition-colors w-full text-left ${activeTab === 'results' ? 'bg-black text-white font-semibold' : 'text-[#616161] font-medium hover:bg-gray-100'}`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        <FileText size={18} className="shrink-0" />
                        <span>KTU Result</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm transition-colors w-full text-left ${activeTab === 'staff' ? 'bg-black text-white font-semibold' : 'text-[#616161] font-medium hover:bg-gray-100'}`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        <Users size={18} className="shrink-0" />
                        <span>Staff Enrollment</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('sync')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm transition-colors w-full text-left ${activeTab === 'sync' ? 'bg-black text-white font-semibold' : 'text-[#616161] font-medium hover:bg-gray-100'}`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        <RefreshCw size={18} className="shrink-0" />
                        <span>Directory Sync</span>
                    </button>
                </nav>
                <div className="flex flex-col px-4 pb-6 gap-2">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm text-[#616161] font-medium hover:bg-gray-100 w-full text-left transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <Settings size={18} className="shrink-0" />
                        <span>Settings</span>
                    </button>
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm text-[#ff3232] font-medium hover:bg-red-50 w-full text-left transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <LogOut size={18} className="shrink-0" />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-between px-10 py-5 w-full shrink-0 border-b border-[#d0d3d9] bg-white h-[85px]">
                    <p className="font-semibold text-black text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {activeTab === 'results' ? 'KTU Result' : activeTab === 'sync' ? 'Directory Sync' : 'Staff Enrollment'}
                    </p>
                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <button className="relative flex items-center justify-center size-[46px] rounded-full border border-[#d0d3d9] hover:border-black transition-colors bg-white">
                            <Bell size={20} className="text-black" />
                            <span className="absolute top-[10px] right-[10px] size-2 bg-red-500 rounded-full border border-white" />
                        </button>
                        {/* Profile Dropdown */}
                        <button className="flex items-center gap-3 h-[46px] pl-2 pr-4 rounded-full border border-[#d0d3d9] hover:border-black transition-colors bg-white">
                            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="size-8 rounded-full object-cover" />
                            <ChevronDown size={16} className="text-[#616161]" />
                        </button>
                    </div>
                </header>

                {/* Mobile Header (Minimal, just for spacing if needed, but the design shows no top header on mobile. We'll add a simple padding to the main content instead) */}
                <div className="md:hidden w-full px-6 pt-6 pb-2">
                    {/* Empty or minimal header for mobile if required, but the content usually starts directly. */}
                </div>

                <main ref={mainContentRef} className="flex-1 overflow-y-auto px-6 pb-28 md:px-10 md:py-8 bg-white md:pb-8">
                    {/* ── Results Panel ─────────────────────────────────── */}
                    {activeTab === 'results' && (
                        <AdminResultsPage drafts={drafts} overview={overview} refreshAll={fetchResults} />
                    )}

                    {/* ── Staff Panel ───────────────────────────────────── */}
                    {activeTab === 'staff' && (
                        <div className="flex flex-col gap-6 w-full">
                            {/* Create Form Card */}
                            <div className="border border-[#d0d3d9] rounded-[16px] p-4 md:p-6 flex flex-col gap-6">
                                {message && (
                                    <div className={`px-4 py-3 rounded-[12px] flex items-center ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                        <span className="font-medium text-sm">{message}</span>
                                    </div>
                                )}

                                <form onSubmit={editingStaff ? handleUpdateStaff : handleAddStaff} className="flex flex-col gap-6">
                                    <div className="flex flex-wrap gap-6">
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <p className="font-semibold text-black text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Staff Name</p>
                                            <div className="bg-white border border-[#9c9c9c] flex h-14 items-center px-4 rounded-[56px]">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter name here"
                                                    className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-[#9c9c9c]"
                                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <p className="font-semibold text-black text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Email</p>
                                            <div className="bg-white border border-[#9c9c9c] flex h-14 items-center px-4 rounded-[56px]">
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="Enter email here"
                                                    className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-[#9c9c9c]"
                                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    disabled={editingStaff}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <p className="font-semibold text-black text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Password</p>
                                            <div className="bg-white border border-[#9c9c9c] flex h-14 items-center px-4 rounded-[56px] gap-2">
                                                <input
                                                    type={showPwd ? "text" : "password"}
                                                    required={!editingStaff}
                                                    placeholder="Enter Password here"
                                                    className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-[#9c9c9c]"
                                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                                {!editingStaff && (
                                                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="shrink-0 text-black outline-none">
                                                        {showPwd ? <Eye size={20} /> : <EyeOff size={20} />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="font-semibold text-black text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Staff Role</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Principal', 'HOD', 'Tutor', 'Professor', 'Admin'].map(role => (
                                                <button
                                                    type="button"
                                                    key={role}
                                                    onClick={() => setActiveRole(role)}
                                                    className={`h-14 px-8 rounded-[56px] text-base font-semibold border transition-colors ${activeRole === role ? 'bg-black text-white border-black' : 'bg-white text-black border-[#d0d3d9] hover:border-black'}`}
                                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {activeRole !== 'Principal' && activeRole !== 'Admin' && (
                                        <div className="flex flex-col gap-2">
                                            <p className="font-semibold text-black text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Department</p>
                                            <div className="flex flex-wrap gap-2">
                                                {['CSE', 'ME', 'IT', 'ECE'].map(dept => (
                                                    <PillBtn key={dept} active={formData.department === dept} onClick={() => setFormData({ ...formData, department: dept })}>
                                                        {dept}
                                                    </PillBtn>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full h-14 bg-black hover:bg-neutral-800 text-white text-base font-semibold rounded-[56px] transition-colors"
                                        style={{ fontFamily: "'Inter', sans-serif" }}
                                    >
                                        {editingStaff ? 'Update Staff' : 'Create Staff'}
                                    </button>
                                    {editingStaff && (
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="w-full h-14 bg-white border border-black hover:bg-gray-50 text-black text-base font-semibold rounded-[56px] transition-colors"
                                            style={{ fontFamily: "'Inter', sans-serif" }}
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </form>
                            </div>

                            {/* History Section */}
                            <div className="flex flex-col gap-4 mt-8 md:mt-0">
                                {/* MOBILE History Header */}
                                <div className="flex md:hidden flex-col gap-3">
                                    <p className="font-medium text-black text-2xl" style={{ fontFamily: "'Inter', sans-serif" }}>Staff Details</p>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white border border-[#9c9c9c] flex gap-2 h-14 items-center pl-4 pr-4 rounded-[56px] flex-1 min-w-0">
                                            <Search size={18} className="text-[#9c9c9c] shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Search here"
                                                className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-[#9c9c9c]"
                                                style={{ fontFamily: "'Inter', sans-serif" }}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* DESKTOP History Header */}
                                <div className="hidden md:flex items-center justify-between gap-3 min-h-[56px]">
                                    <p className="font-medium text-black text-2xl shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>Staff Details</p>
                                    <div className="flex gap-3 items-center min-w-0">
                                        <div className="bg-white border border-[#9c9c9c] flex gap-2 h-14 items-center pl-4 pr-4 rounded-[56px] w-56 shrink-0">
                                            <Search size={18} className="text-[#9c9c9c] shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Search here"
                                                className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-[#9c9c9c]"
                                                style={{ fontFamily: "'Inter', sans-serif" }}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* DESKTOP List */}
                                <div className="hidden md:block bg-white border border-[#d0d3d9] rounded-[16px] overflow-hidden">
                                    <div className="flex items-center px-6 py-4 border-b border-[#d0d3d9] bg-white">
                                        <div className="flex-1 min-w-0 font-semibold text-black text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Staff Name</div>
                                        <div className="flex-1 min-w-0 font-semibold text-black text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Role</div>
                                        <div className="flex-1 min-w-0 font-semibold text-black text-base" style={{ fontFamily: "'Inter', sans-serif" }}>Department</div>
                                        <div className="w-[180px] shrink-0"></div>
                                    </div>

                                    {filteredStaff.length === 0 ? (
                                        <div className="px-6 py-8 text-center text-[#9c9c9c] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>No staff records found.</div>
                                    ) : (
                                        <div className="flex flex-col">
                                            {filteredStaff.map((staff, i) => (
                                                <div key={staff._id} className={`flex items-center px-6 py-4 gap-4 ${i < filteredStaff.length - 1 ? 'border-b border-[#d0d3d9]' : ''}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#616161" }}>
                                                    <div className="flex-1 min-w-0 text-black font-medium">{staff.name}</div>
                                                    <div className="flex-1 min-w-0">{displayRole(staff)}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <DeptTag dept={staff.department} />
                                                    </div>
                                                    <div className="flex gap-3 shrink-0 justify-end w-[180px]">
                                                        <button onClick={() => startEdit(staff)} className="size-14 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors" title="Edit">
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleDeleteStaff(staff._id)} className="size-14 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors" title="Delete">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* MOBILE List */}
                                <div className="flex md:hidden flex-col w-full">
                                    {filteredStaff.length === 0 ? (
                                        <p className="text-[#9c9c9c] text-sm py-4" style={{ fontFamily: "'Inter', sans-serif" }}>No staff records found.</p>
                                    ) : (
                                        filteredStaff.map((staff, i) => (
                                            <div key={staff._id} className={`flex gap-2 items-start pb-4 pt-10 ${i > 0 ? "border-t border-[#d0d3d9]" : ""}`}>
                                                <div className="flex-1 min-w-0 flex flex-col gap-6">
                                                    <p className="font-bold text-black text-2xl leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>{staff.name}</p>
                                                    <div>
                                                        <p className="font-semibold text-black text-base mb-[-2px]" style={{ fontFamily: "'Inter', sans-serif" }}>Role: {displayRole(staff)}</p>
                                                        {staff.department && (
                                                            <div className="mt-2">
                                                                <DeptTag dept={staff.department} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-[10px] items-end h-24 shrink-0">
                                                    <button onClick={() => startEdit(staff)} className="size-14 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDeleteStaff(staff._id)} className="size-14 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-red-400 hover:text-red-500 transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Sync Panel ────────────────────────────────────── */}
                    {activeTab === 'sync' && (
                        <SyncPanel />
                    )}
                </main>

                {/* ── Mobile Bottom Nav Bar ── */}
                <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-[rgba(116,116,116,0.46)] backdrop-blur-md p-2 rounded-[120px] flex items-center gap-[9px] shadow-lg border border-white/20">
                        {/* Results Tab */}
                        {activeTab === 'results' ? (
                            <button className="bg-black text-white h-[51px] px-6 rounded-[56px] flex items-center gap-2 font-medium text-sm transition-all shadow-sm">
                                <BarChart2 size={24} />
                                <span>Results</span>
                            </button>
                        ) : (
                            <button onClick={() => setActiveTab('results')} className="bg-white text-black size-[51px] rounded-[56px] flex items-center justify-center transition-all hover:bg-gray-100 shadow-sm shrink-0">
                                <BarChart2 size={24} />
                            </button>
                        )}

                        {/* Staff Tab */}
                        {activeTab === 'staff' ? (
                            <button className="bg-black text-white h-[51px] px-6 rounded-[56px] flex items-center gap-2 font-medium text-sm transition-all shadow-sm">
                                <Users size={24} />
                                <span>Staff</span>
                            </button>
                        ) : (
                            <button onClick={() => setActiveTab('staff')} className="bg-white text-black size-[51px] rounded-[56px] flex items-center justify-center transition-all hover:bg-gray-100 shadow-sm shrink-0">
                                <Users size={24} />
                            </button>
                        )}

                        {/* Sync Tab */}
                        {activeTab === 'sync' ? (
                            <button className="bg-black text-white h-[51px] px-6 rounded-[56px] flex items-center gap-2 font-medium text-sm transition-all shadow-sm">
                                <RefreshCw size={24} />
                                <span>Sync</span>
                            </button>
                        ) : (
                            <button onClick={() => setActiveTab('sync')} className="bg-white text-black size-[51px] rounded-[56px] flex items-center justify-center transition-all hover:bg-gray-100 shadow-sm shrink-0">
                                <RefreshCw size={24} />
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
