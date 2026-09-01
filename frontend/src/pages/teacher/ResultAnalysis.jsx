import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { X, AlertCircle } from 'lucide-react';
import { PerformanceCard, DepartmentCard, SubjectCard, TopPerformersCard } from '../../components/CleanAnalysisCards';

const ResultAnalysis = ({ batchId, title, type, onClose, mode: initialMode = 'batch', deptOverride: initialDept = null }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentMode, setCurrentMode] = useState(initialMode);
    const [currentDept, setCurrentDept] = useState(initialDept);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                let url = '';
                if (currentMode === 'college') {
                    url = `/academic/result/analysis/college?title=${encodeURIComponent(title)}&type=${type}`;
                } else if (currentMode === 'department') {
                    url = `/academic/result/analysis/department?title=${encodeURIComponent(title)}&type=${type}`;
                    if (currentDept) url += `&dept=${encodeURIComponent(currentDept)}`;
                } else {
                    url = `/academic/result/analysis/${batchId}?title=${encodeURIComponent(title)}&type=${type}`;
                }
                const res = await axios.get(url);
                setData(res.data);
            } catch (error) {
                console.error('Error fetching analysis:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [batchId, title, type, currentMode, currentDept]);

    if (loading) return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl animate-pulse text-gray-700 font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>Loading Analysis...</div>
        </div>
    );

    if (!data) return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[16px] text-center space-y-3 max-w-sm shadow-2xl border border-[#d0d3d9]">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
                <p className="font-semibold text-lg text-black" style={{ fontFamily: "Inter, sans-serif" }}>No Data Available</p>
                <p className="text-[#616161] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>No results found for this exam.</p>
                <button onClick={onClose} className="mt-4 px-6 py-2 bg-black text-white hover:bg-neutral-800 rounded-[56px] font-semibold transition" style={{ fontFamily: "Inter, sans-serif" }}>Close</button>
            </div>
        </div>
    );

    const isCollege = currentMode === 'college';
    
    // Derived values for the clean cards
    const passRate = data.passFail?.[0]?.value ?? 0;
    const failRate = data.passFail?.[1]?.value ?? 0;
    const totalStudents = (passRate + failRate) || 0;
    const passPercent = totalStudents ? Math.round((passRate / totalStudents) * 100) : 0;
    const failPercent = totalStudents ? Math.round((failRate / totalStudents) * 100) : 0;

    const deptData = (data.deptBreakdown || []).map(d => ({
        dept: d.dept,
        pass: d.pass || 0,
        fail: d.fail || 0,
        total: (d.pass || 0) + (d.fail || 0),
    }));

    const subjectData = (data.subjectAnalysis || []).map(s => ({
        code: s.code,
        name: s.name,
        pass: s.pass || 0,
        fail: s.fail || 0,
        total: (s.pass || 0) + (s.fail || 0),
    }));

    const performers = data.topPerformers || [];

    const displayTitle = currentMode === 'department' && (data.department || currentDept)
        ? `${data.department || currentDept} Department`
        : 'Result Analysis';

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 lg:p-8 animate-in fade-in duration-300">
            <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#d0d3d9] flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${isCollege ? 'bg-blue-50 text-blue-600' :
                                currentMode === 'department' ? 'bg-violet-50 text-violet-600' :
                                    'bg-gray-100 text-gray-600'
                                }`} style={{ fontFamily: "Inter, sans-serif" }}>
                                {isCollege ? 'College-Wide' :
                                    currentMode === 'department' ? `${data.department || currentDept || ''} Dept` :
                                        'Batch'}
                            </span>

                            {(initialMode === 'college' || initialMode === 'department') && (
                                <select 
                                    className="ml-2 bg-white border border-[#d0d3d9] text-[#616161] rounded-[8px] px-2 py-0.5 text-xs font-medium outline-none focus:border-black cursor-pointer hover:border-gray-400 transition-colors"
                                    style={{ fontFamily: "Inter, sans-serif" }}
                                    value={currentMode === 'college' ? 'college' : currentDept}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'college') {
                                            setCurrentMode('college');
                                            setCurrentDept(null);
                                        } else {
                                            setCurrentMode('department');
                                            setCurrentDept(val);
                                        }
                                    }}
                                >
                                    <option value="college">College-Wide</option>
                                    <option value="CS">Computer Science</option>
                                    <option value="IT">Information Technology</option>
                                    <option value="EC">Electronics & Comm.</option>
                                    <option value="EE">Electrical & Elect.</option>
                                    <option value="CE">Civil Engineering</option>
                                    <option value="ME">Mechanical Engg.</option>
                                </select>
                            )}
                        </div>
                        <h1 className="text-xl font-semibold text-black" style={{ fontFamily: "Inter, sans-serif" }}>{displayTitle}</h1>
                        <p className="text-[#616161] mt-0.5 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                            {title} &nbsp;|&nbsp; {type?.toUpperCase()}
                            {data.totalStudents && <span className="ml-2">• {data.totalStudents} students</span>}
                        </p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-[56px] bg-white border border-[#d0d3d9] flex items-center justify-center hover:border-black transition-colors shrink-0">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'none' }}>
                    <div className="flex flex-col gap-6">
                        {/* Top row: Top Performers + Pass/Fail Pie Chart */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 min-h-[350px]">
                                <TopPerformersCard performers={performers} />
                            </div>
                            <div className="min-h-[350px]">
                                <PerformanceCard passRate={passPercent} failRate={failPercent} />
                            </div>
                        </div>

                        {/* Middle row: Department Breakdown (only if college-wide and data exists) */}
                        {isCollege && deptData.length > 0 && (
                            <div className="h-[432px]">
                                <DepartmentCard deptData={deptData} chartHeight={432} />
                            </div>
                        )}

                        {/* Bottom row: Subject Breakdown */}
                        {subjectData.length > 0 && (
                            <div className="h-[432px]">
                                <SubjectCard subjectData={subjectData} chartHeight={432} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultAnalysis;
