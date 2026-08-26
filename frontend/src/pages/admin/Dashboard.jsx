import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { UserPlus, LogOut, Users, Search, Trash2, Edit2, X, FileText, Settings, Menu, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminResultsPage from './ResultsPage';
import samsLogoSmall from '../../assets/SAMS LOGO SMALL.svg';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const mainContentRef = useRef(null);
    // Reusing teacherData state structure but renaming conceptually
    const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });
    const [staffList, setStaffList] = useState([]);
    const [editingStaff, setEditingStaff] = useState(null);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('results');
    const [activeRole, setActiveRole] = useState('HOD'); // 'Principal', 'HOD', 'Tutor', 'Professor'
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Results state (moved from exam_controller)
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
            // If Principal is selected, we don't send department (or send empty)
            if (activeRole === 'Principal') payload.department = undefined;

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

    const roleLabels = {
        teacher: 'Teachers',
        hod: 'HODs',
        principal: 'Principals'
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
        const style = active ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50";
        return (
            <button type="button" onClick={onClick} className={`${base} ${style} ${className}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                {!active && <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none rounded-[56px]" />}
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
        <div className="flex h-screen bg-white font-sans">
            {/* ── Sidebar ── */}
            <aside className="w-[80px] xl:w-[260px] shrink-0 h-full flex flex-col border-r border-[#d0d3d9] overflow-y-auto hidden md:flex transition-all duration-300 bg-white z-10">
                <div className="px-4 xl:px-4 py-1 h-[85px] flex items-center justify-center xl:justify-start overflow-hidden">
                    <img src={samsLogoSmall} alt="SAMS Logo" className="w-[155.637px] h-[58.137px] object-contain hidden xl:block" />
                    <span className="xl:hidden font-bold text-2xl tracking-tighter">S.</span>
                </div>
                <div className="px-4 py-4 hidden xl:block">
                    <div className="bg-white border border-[#9c9c9c] flex gap-2 h-11 items-center pl-4 pr-4 rounded-[56px]">
                        <Search size={16} className="text-[#9c9c9c] shrink-0" />
                        <input type="text" placeholder="Search here..." className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-[#9c9c9c]" style={{ fontFamily: "'Inter', sans-serif" }} disabled />
                    </div>
                </div>
                <nav className="flex flex-col px-2 xl:px-4 gap-2 xl:gap-1 flex-1 mt-4 xl:mt-0">
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`flex items-center justify-center xl:justify-start gap-2 px-0 xl:px-4 py-3 xl:py-2 rounded-[8px] text-sm transition-colors w-full text-left ${activeTab === 'results' ? 'bg-black text-white font-semibold' : 'text-[#333] font-normal hover:bg-gray-100'}`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        title="KTU Result"
                    >
                        <FileText size={18} className="shrink-0" />
                        <span className="hidden xl:inline">KTU Result</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`flex items-center justify-center xl:justify-start gap-2 px-0 xl:px-4 py-3 xl:py-2 rounded-[8px] text-sm transition-colors w-full text-left ${activeTab === 'staff' ? 'bg-black text-white font-semibold' : 'text-[#333] font-normal hover:bg-gray-100'}`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        title="Staff Enrollment"
                    >
                        <Users size={18} className="shrink-0" />
                        <span className="hidden xl:inline">Staff Enrollment</span>
                    </button>
                </nav>
                <div className="flex flex-col px-2 xl:px-4 pb-4 gap-2 xl:gap-1">
                    <button className="flex items-center justify-center xl:justify-start gap-2 px-0 xl:px-4 py-3 xl:py-2 rounded-[8px] text-sm text-[#333] hover:bg-gray-100 w-full text-left transition-colors" style={{ fontFamily: "'Inter', sans-serif" }} title="Settings">
                        <Settings size={18} className="shrink-0" />
                        <span className="hidden xl:inline">Settings</span>
                    </button>
                    <button onClick={logout} className="flex items-center justify-center xl:justify-start gap-2 px-0 xl:px-4 py-3 xl:py-2 rounded-[8px] text-sm text-[#ff3232] hover:bg-red-50 w-full text-left transition-colors" style={{ fontFamily: "'Inter', sans-serif" }} title="Log out">
                        <LogOut size={18} className="shrink-0" />
                        <span className="hidden xl:inline">Log out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
                <header className="flex flex-col justify-center items-start pt-[10px] pr-[16px] pb-[10px] pl-[24px] gap-0 w-full shrink-0 border-b border-[#d0d3d9] bg-white md:min-h-[78px]">
                    {/* Desktop Header */}
                    <div className="hidden md:flex w-full items-center justify-between">
                        <p className="font-semibold text-black text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {activeTab === 'results' ? 'KTU Result' : 'Staff Enrollment'}
                        </p>
                        <div className="flex items-center gap-[10px]">
                            {/* Notification: 56x56, padding 10px */}
                            <button
                                style={{ display: "flex", width: "56px", height: "56px", padding: "10px", justifyContent: "center", alignItems: "center", gap: "10px", flexShrink: 0, aspectRatio: "1/1", border: "1px solid #d0d3d9", borderRadius: "56px", background: "white" }}
                                className="hover:border-black transition-colors"
                            >
                                <div className="relative">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                    <span className="absolute -top-1 -right-1 size-[9px] bg-red-500 rounded-full" />
                                </div>
                            </button>
                            {/* Profile: h-56px, padding 10px 10px 10px 8px, gap 10px */}
                            <button
                                style={{ display: "flex", height: "56px", padding: "10px 10px 10px 8px", justifyContent: "center", alignItems: "center", gap: "10px", border: "1px solid #d0d3d9", borderRadius: "56px", background: "white" }}
                                className="hover:border-black transition-colors"
                            >
                                <div className="size-[36px] rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-gray-500 text-sm">A</span>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                        </div>
                    </div>
                    {/* Mobile Header */}
                    <div className="flex md:hidden w-full items-center justify-between py-2">
                        <img src={samsLogoSmall} alt="SAMS Logo" className="w-[100px] object-contain" />
                        <button onClick={() => setMobileMenuOpen(true)} className="size-12 rounded-[56px] border border-[#d0d3d9] bg-white flex items-center justify-center">
                            <Menu size={20} className="text-black" />
                        </button>
                    </div>
                </header>

                <main ref={mainContentRef} className="flex-1 overflow-y-auto p-6 md:px-10 md:py-8 bg-white">
                    <div className="flex flex-col gap-2 mb-8">
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-black text-2xl" style={{ fontFamily: "'Inter', sans-serif" }}>Welcome, Admin</p>
                            <span className="text-2xl">👋</span>
                        </div>
                        <p className="font-semibold text-[#616161] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>Your academic work is now a digital asset.</p>
                    </div>

                    {/* Mobile Tabs */}
                    <div className="flex md:hidden gap-2 mb-8">
                        <button
                            onClick={() => setActiveTab('results')}
                            className={`flex-1 py-3 px-4 rounded-[56px] border text-[15px] font-semibold text-center transition-colors ${activeTab === 'results' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            KTU Result
                        </button>
                        <button
                            onClick={() => setActiveTab('staff')}
                            className={`flex-1 py-3 px-4 rounded-[56px] border text-[15px] font-semibold text-center transition-colors ${activeTab === 'staff' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            Staff Role
                        </button>
                    </div>

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
                                            {['Principal', 'HOD', 'Tutor', 'Professor'].map(role => (
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

                                    {activeRole !== 'Principal' && (
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
                                        {/*}  <button className="relative shrink-0 size-14 rounded-[56px] flex items-center justify-center transition-colors bg-white">
                                            <div aria-hidden className="absolute border border-[#d0d3d9] border-solid inset-0 pointer-events-none rounded-[56px]" />
                                            <div className="flex gap-[2px] items-center rotate-90">
                                                <div className="w-[14px] h-[1px] bg-black relative"><div className="size-1 bg-black rounded-full absolute -top-[1.5px] left-0"></div></div>
                                                <div className="w-[14px] h-[1px] bg-black relative"><div className="size-1 bg-black rounded-full absolute -top-[1.5px] right-0"></div></div>
                                            </div>
                                        </button>*/}
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
                                        {/*}   <button className="relative shrink-0 size-14 rounded-[56px] flex items-center justify-center transition-colors bg-white">
                                            <div aria-hidden className="absolute border border-[#d0d3d9] border-solid inset-0 pointer-events-none rounded-[56px]" />
                                            <div className="flex gap-[2px] items-center rotate-90">
                                                <div className="w-[14px] h-[1px] bg-black relative"><div className="size-1 bg-black rounded-full absolute -top-[1.5px] left-0"></div></div>
                                                <div className="w-[14px] h-[1px] bg-black relative"><div className="size-1 bg-black rounded-full absolute -top-[1.5px] right-0"></div></div>
                                            </div>
                                        </button>*/}
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
                                                    <div className="flex-1 min-w-0">{staff.name}</div>
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
                                                    <p className="font-medium text-black text-2xl" style={{ fontFamily: "'Inter', sans-serif" }}>{staff.name}</p>
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
                </main>
            </div >

            {/* Mobile Menu Overlay */}
            {
                mobileMenuOpen && (
                    <div className="fixed inset-0 bg-white z-[100] flex flex-col md:hidden">
                        <div className="flex justify-between items-center p-4 py-6 border-b border-[#d0d3d9]">
                            <img src={samsLogoSmall} alt="SAMS Logo" className="w-[100px] object-contain ml-2" />
                            <button onClick={() => setMobileMenuOpen(false)} className="size-12 rounded-[56px] border border-[#d0d3d9] bg-white flex items-center justify-center mr-2">
                                <X size={20} className="text-black" />
                            </button>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-end pb-16 gap-6">
                            <button className="flex items-center gap-2 text-[#333] font-medium text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
                                <Settings size={20} /> Settings
                            </button>
                            <button onClick={logout} className="flex items-center gap-2 text-[#ff3232] font-medium text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
                                <LogOut size={20} /> Log out
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminDashboard;
