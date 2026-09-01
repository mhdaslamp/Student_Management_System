import { useState, useEffect, useRef, useCallback } from 'react';
import { LogOut, Settings, Search, FileText, Menu, X, ChevronDown, Building2, Trophy, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import samsLogoSmall from '../../assets/SAMS LOGO SMALL.svg';
import { PerformanceCard, DepartmentCard, SubjectCard, TopPerformersCard } from '../../components/CleanAnalysisCards';
import { formatResultTitle } from '../../utils/formatters';



// ─── Main Principal Dashboard ─────────────────────────────────────────────────

const PrincipalDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const mobileAnalyticsRef = useRef(null);

    // UI state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('results');

    // Data state
    const [publishedResults, setPublishedResults] = useState([]);
    const [activeResultId, setActiveResultId] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [showAllResults, setShowAllResults] = useState(false);
    const [selectedScope, setSelectedScope] = useState('college');

    // Fetch published results list
    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await axios.get('/academic/result/overview');
                const published = (res.data || []).filter(r => r.status === 'published' || !r.status);
                setPublishedResults(published);
            } catch (err) {
                console.error('Error fetching results:', err);
            }
        };
        fetchResults();
    }, []);

    // Fetch analysis based on scope
    const fetchAnalysis = useCallback(async (result, scope = selectedScope) => {
        if (!result) return;
        setLoadingAnalysis(true);
        setAnalysisData(null);
        try {
            const endpoint = scope === 'college' ? '/academic/result/analysis/college' : '/academic/result/analysis/department';
            const params = { title: result.title, type: result.type };
            if (scope !== 'college') params.dept = scope;
            const res = await axios.get(endpoint, { params });
            setAnalysisData(res.data);
        } catch (err) {
            console.error('Error fetching analysis:', err);
        } finally {
            setLoadingAnalysis(false);
        }
    }, [selectedScope]);

    const activeResult = publishedResults.find(r => `${r.title}|${r.type}` === activeResultId);

    useEffect(() => {
        if (activeResult) fetchAnalysis(activeResult, selectedScope);
    }, [activeResult, fetchAnalysis, selectedScope]);

    // Derive chart data from analysis
    const passRate = analysisData?.passFail?.[0]?.value ?? 0;
    const failRate = analysisData?.passFail?.[1]?.value ?? 0;
    const totalStudents = (passRate + failRate) || 0;
    const passPercent = totalStudents ? Math.round((passRate / totalStudents) * 100) : 0;
    const failPercent = totalStudents ? Math.round((failRate / totalStudents) * 100) : 0;

    const deptData = (analysisData?.deptBreakdown || []).map(d => ({
        dept: d.dept,
        pass: d.pass || 0,
        fail: d.fail || 0,
        total: (d.pass || 0) + (d.fail || 0),
    }));

    const subjectData = (analysisData?.subjectAnalysis || []).map(s => ({
        code: s.code,
        name: s.name,
        pass: s.pass || 0,
        fail: s.fail || 0,
        total: (s.pass || 0) + (s.fail || 0),
    }));

    const performers = analysisData?.topPerformers || [];

    const visibleResults = showAllResults ? publishedResults : publishedResults.slice(0, 3);

    // ── Published Results Card ─────────────────────────────────────────────────

    const publishedCard = (
        <div className="border border-[#d0d3d9] rounded-[16px] overflow-hidden flex flex-col" style={{ height: 342 }}>
            <div className="px-6 py-[22px] border-b border-[#d0d3d9] shrink-0">
                <p className="font-medium text-2xl text-black" style={{ fontFamily: "'Inter', sans-serif" }}>Published Results</p>
            </div>
            {/* Table header */}
            <table className="w-full table-fixed shrink-0">
                <thead>
                    <tr>
                        <th className="text-left px-6 py-3 font-semibold text-sm text-black border-b border-[#d0d3d9] w-[40%]" style={{ fontFamily: "'Inter', sans-serif" }}>Result</th>
                        <th className="text-left px-4 py-3 font-semibold text-sm text-black border-b border-[#d0d3d9] w-[20%]" style={{ fontFamily: "'Inter', sans-serif" }}>Date</th>
                        <th className="border-b border-[#d0d3d9] w-[40%]" />
                    </tr>
                </thead>
            </table>
            {/* Scrollable rows */}
            <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {publishedResults.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-[#9c9c9c] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>No published results found.</p>
                    </div>
                ) : (
                    <table className="w-full table-fixed">
                        <tbody>
                            {visibleResults.map(item => {
                                const id = `${item.title}|${item.type}`;
                                const isActive = activeResultId === id;
                                return (
                                    <tr key={id} className="border-b border-[#d0d3d9] last:border-0">
                                        <td className="px-6 py-3 text-[#616161] text-sm leading-5 w-[40%]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {formatResultTitle(item.title)}
                                        </td>
                                        <td className="px-4 py-3 text-[#616161] text-xs w-[20%]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {item.lastUploaded ? new Date(item.lastUploaded).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-4 py-3 w-[40%]">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => { setActiveResultId(id); if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                    className={`h-10 px-5 rounded-[56px] font-semibold text-sm transition-colors whitespace-nowrap ${isActive ? 'bg-black text-white' : 'bg-white border border-black text-black hover:bg-gray-50'}`}
                                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                                >
                                                    {isActive ? 'Viewing' : 'View'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            {!showAllResults && publishedResults.length > 3 && (
                <div className="shrink-0 flex justify-center py-2 border-t border-[#d0d3d9]">
                    <button onClick={() => setShowAllResults(true)} className="flex items-center gap-1 px-4 h-8 font-semibold text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Load More <ChevronDown size={16} />
                    </button>
                </div>
            )}
        </div>
    );

    // ── Sidebar ───────────────────────────────────────────────────────────────

    const sidebar = (
        <aside className="w-[80px] xl:w-[260px] shrink-0 h-full flex flex-col border-r border-[#d0d3d9] overflow-y-auto hidden md:flex transition-all duration-300 bg-white z-10">
            <div className="px-4 xl:px-4 py-1 h-[85px] flex items-center justify-center xl:justify-start overflow-hidden">
                <img src={samsLogoSmall} alt="SAMS Logo" className="w-[155px] h-[58px] object-contain hidden xl:block" />
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
                    className={`flex items-center justify-center xl:justify-start gap-2 px-0 xl:px-4 py-3 xl:py-2 rounded-[8px] text-sm font-semibold w-full text-left transition-colors ${activeTab === 'results' ? 'bg-black text-white' : 'text-[#333] hover:bg-gray-100'}`} 
                    style={{ fontFamily: "'Inter', sans-serif" }} 
                    title="KTU Result Analysis"
                >
                    <FileText size={18} className="shrink-0" />
                    <span className="hidden xl:inline">KTU Result Analysis</span>
                </button>
                <button 
                    onClick={() => setActiveTab('approvals')}
                    className={`flex items-center justify-center xl:justify-start gap-2 px-0 xl:px-4 py-3 xl:py-2 rounded-[8px] text-sm font-medium w-full text-left transition-colors ${activeTab === 'approvals' ? 'bg-black text-white' : 'text-[#333] hover:bg-gray-100'}`} 
                    style={{ fontFamily: "'Inter', sans-serif" }} 
                    title="Approvals"
                >
                    <CheckSquare size={18} className="shrink-0" />
                    <span className="hidden xl:inline">Approvals</span>
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
    );

    // ── Analytics section (shared between desktop/tablet/mobile) ─────────────

    const analyticsSection = loadingAnalysis ? (
        <div className="flex flex-col gap-6 mt-2">
            {[342, 300].map((h, i) => (
                <div key={i} className="border border-[#d0d3d9] rounded-[16px] animate-pulse bg-gray-50" style={{ height: h }} />
            ))}
        </div>
    ) : !analysisData ? (
        <div className="border border-[#d0d3d9] rounded-[16px] flex items-center justify-center py-16 mt-2">
            <p className="text-[#9c9c9c] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                {publishedResults.length === 0 ? 'No published results available.' : 'Select a result to view analytics.'}
            </p>
        </div>
    ) : null;

    return (
        <div className="flex h-screen bg-white font-sans">

            {sidebar}

            {/* ── Main ─────────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">

                {/* Header */}
                <header className="flex flex-col justify-center items-start pt-[10px] pr-[16px] pb-[10px] pl-[24px] gap-0 w-full shrink-0 border-b border-[#d0d3d9] bg-white md:min-h-[78px]">
                    {/* Desktop */}
                    <div className="hidden md:flex w-full items-center justify-between">
                        <p className="font-semibold text-black text-base" style={{ fontFamily: "'Inter', sans-serif" }}>KTU Result Analysis</p>
                        <div className="flex items-center gap-3">
                            <button style={{ display: 'flex', width: '56px', height: '56px', padding: '10px', justifyContent: 'center', alignItems: 'center', border: '1px solid #d0d3d9', borderRadius: '56px', background: 'white' }} className="hover:border-black transition-colors">
                                <div className="relative">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                                    <span className="absolute -top-1 -right-1 size-[9px] bg-red-500 rounded-full" />
                                </div>
                            </button>
                            <button style={{ display: 'flex', height: '56px', padding: '10px 10px 10px 8px', alignItems: 'center', gap: '10px', border: '1px solid #d0d3d9', borderRadius: '56px', background: 'white' }} className="hover:border-black transition-colors">
                                <div className="size-[36px] rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-gray-500 text-sm">{user?.name?.[0]?.toUpperCase() || 'P'}</span>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                            </button>
                        </div>
                    </div>
                    {/* Mobile */}
                    <div className="flex md:hidden w-full items-center justify-between py-2">
                        <img src={samsLogoSmall} alt="SAMS Logo" className="w-[100px] object-contain" />
                        <button onClick={() => setMobileMenuOpen(true)} className="size-12 rounded-[56px] border border-[#d0d3d9] bg-white flex items-center justify-center">
                            <Menu size={20} className="text-black" />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main ref={mainRef} className="flex-1 overflow-y-auto p-6 md:px-10 md:py-8 bg-white">

                    {/* Welcome & Scope Selection */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-black text-2xl" style={{ fontFamily: "'Inter', sans-serif" }}>Welcome, {user?.name || 'Principal'}</p>
                                <span className="text-2xl">👋</span>
                            </div>
                            <p className="font-semibold text-[#616161] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>College-wide KTU result analysis and performance overview.</p>
                        </div>
                        {activeTab === 'results' && (
                            <div className="flex items-center gap-3 bg-gray-50 border border-[#d0d3d9] rounded-xl px-4 py-2 shrink-0">
                                <Building2 size={18} className="text-gray-500" />
                                <select
                                    value={selectedScope}
                                    onChange={(e) => setSelectedScope(e.target.value)}
                                    className="bg-transparent text-sm font-semibold text-black outline-none cursor-pointer"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    <option value="college">College-Wide</option>
                                    <option value="CS">Computer Science (CSE)</option>
                                    <option value="EC">Electronics (ECE)</option>
                                    <option value="EE">Electrical (EEE)</option>
                                    <option value="ME">Mechanical (ME)</option>
                                    <option value="CE">Civil (CE)</option>
                                    <option value="IT">Information Tech (IT)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Mobile tabs */}
                    <div className="flex md:hidden gap-2 mb-6">
                        <button onClick={() => setActiveTab('results')} className={`flex-1 py-3 px-4 rounded-[56px] border text-sm font-semibold transition-colors ${activeTab === 'results' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`} style={{ fontFamily: "'Inter', sans-serif" }}>KTU Result</button>
                        <button onClick={() => setActiveTab('approvals')} className={`flex-1 py-3 px-4 rounded-[56px] border text-sm font-semibold transition-colors ${activeTab === 'approvals' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`} style={{ fontFamily: "'Inter', sans-serif" }}>Approvals</button>
                    </div>

                    {/* ── DESKTOP layout (md+) ───────────────────────────── */}
                    <div className="hidden md:flex flex-col gap-6">
                        {activeTab === 'results' ? (
                            <>
                                {/* Row 1: Published Results | Performance Pie */}
                                <div className="flex gap-6 items-stretch">
                                    <div className="flex-[2_1_0%] min-w-0">{publishedCard}</div>
                                    <div className="shrink-0 flex flex-col" style={{ width: 300, minHeight: 342 }}>
                                        {loadingAnalysis ? (
                                            <div className="border border-[#d0d3d9] rounded-[16px] animate-pulse bg-gray-50 h-full" />
                                        ) : analysisData ? (
                                            <PerformanceCard passRate={passPercent} failRate={failPercent} />
                                        ) : (
                                            <div className="border border-[#d0d3d9] rounded-[16px] flex items-center justify-center h-full">
                                                <p className="text-[#9c9c9c] text-xs text-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {activeResult ? 'No data available' : 'Select a result to view performance'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 2: Department Chart (left) | Top Performers (right) */}
                                {analysisData ? (
                                    <div className="flex flex-col xl:flex-row gap-6 xl:items-stretch" style={{ minHeight: 490 }}>
                                        <div className="w-full xl:flex-[615_1_0%] min-w-0">
                                            {selectedScope === 'college' ? (
                                                <DepartmentCard deptData={deptData} chartHeight={432} />
                                            ) : (
                                                <SubjectCard subjectData={subjectData} chartHeight={432} />
                                            )}
                                        </div>
                                        <div className="w-full xl:flex-[490_1_0%] min-w-0 flex flex-col min-h-0">
                                            <TopPerformersCard performers={performers} />
                                        </div>
                                    </div>
                                ) : !loadingAnalysis && (
                                    <div className="border border-[#d0d3d9] rounded-[16px] flex items-center justify-center py-16">
                                        <p className="text-[#9c9c9c] text-sm text-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {publishedResults.length === 0
                                                ? 'No published results available.'
                                                : activeResult
                                                    ? `No data found for ${selectedScope === 'college' ? 'this exam' : 'the selected department'} in this result.`
                                                    : 'Select a result above to view analytics and top performers.'}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-16 text-center text-[#9c9c9c] text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Approvals coming soon...
                            </div>
                        )}
                        {loadingAnalysis && (
                            <div className="flex gap-6" style={{ minHeight: 490 }}>
                                <div className="flex-[615_1_0%] min-w-0 border border-[#d0d3d9] rounded-[16px] animate-pulse bg-gray-50" />
                                <div className="flex-[490_1_0%] min-w-0 border border-[#d0d3d9] rounded-[16px] animate-pulse bg-gray-50" />
                            </div>
                        )}
                    </div>

                    {/* ── MOBILE layout ─────────────────────────────────── */}
                    <div className="flex md:hidden flex-col gap-6 pb-20">
                        {activeTab === 'results' ? (
                            <>
                                {/* Mobile: published results list */}
                                <div>
                                    <p className="font-medium text-2xl text-black mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Published Results</p>
                                    {publishedResults.length === 0 ? (
                                        <p className="text-[#9c9c9c] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>No published results found.</p>
                                    ) : publishedResults.map(item => {
                                        const id = `${item.title}|${item.type}`;
                                        const isActive = activeResultId === id;
                                        return (
                                            <div key={id} className="border-b border-[#d0d3d9] py-5">
                                                <p className="font-medium text-xl text-black mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{formatResultTitle(item.title)}</p>
                                                <p className="text-[#616161] text-sm mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    {item.lastUploaded ? new Date(item.lastUploaded).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                    {item.totalStudents ? ` · ${item.totalStudents} students` : ''}
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setActiveResultId(id);
                                                            setTimeout(() => {
                                                                if (mobileAnalyticsRef.current) {
                                                                    mobileAnalyticsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                }
                                                            }, 100);
                                                        }}
                                                        className={`h-12 flex-1 rounded-[56px] font-semibold text-sm transition-colors ${isActive ? 'bg-black text-white' : 'bg-white border border-black text-black'}`}
                                                        style={{ fontFamily: "'Inter', sans-serif" }}
                                                    >
                                                        {isActive ? 'Viewing Analytics' : 'View Analytics'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Mobile: Inline Analytics */}
                                <div ref={mobileAnalyticsRef} className="mt-4">
                                    {loadingAnalysis ? (
                                        <div className="flex flex-col gap-4">
                                            <div className="border border-[#d0d3d9] rounded-[16px] animate-pulse bg-gray-50 h-64" />
                                            <div className="border border-[#d0d3d9] rounded-[16px] animate-pulse bg-gray-50 h-48" />
                                        </div>
                                    ) : !analysisData ? (
                                        <div className="border border-[#d0d3d9] rounded-[16px] flex items-center justify-center py-16">
                                            <p className="text-[#9c9c9c] text-sm text-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {activeResult
                                                    ? `No data found for ${selectedScope === 'college' ? 'this exam' : 'the selected department'}.`
                                                    : 'Select a result above to view analytics.'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            {activeResult && (
                                                <p className="text-[#616161] text-sm -mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    Viewing: <span className="font-semibold text-black">{formatResultTitle(activeResult.title)}</span>
                                                </p>
                                            )}
                                            <div style={{ height: 300 }}>
                                                <PerformanceCard passRate={passPercent} failRate={failPercent} />
                                            </div>
                                            {selectedScope === 'college' ? (
                                                <DepartmentCard deptData={deptData} />
                                            ) : (
                                                <SubjectCard subjectData={subjectData} />
                                            )}
                                            <TopPerformersCard performers={performers} compact />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Mobile approvals tab */
                            <div className="py-16 text-center text-[#9c9c9c] text-sm font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Approvals coming soon...
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
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
            )}
        </div>
    );
};

export default PrincipalDashboard;
