import React, { useState, useEffect, useRef } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Trophy } from 'lucide-react';

// ─── Pie Chart: College-Wide Performance ──────────────────────────────────────

export function PerformanceCard({ passRate, failRate }) {
    const pieData = [
        { name: 'Pass', value: passRate, fill: '#030203' },
        { name: 'Fail', value: failRate, fill: '#F61A0B' },
    ];
    return (
        <div className="border border-[#d0d3d9] rounded-[16px] flex flex-col items-center justify-center p-6 h-full">
            <p className="font-medium text-2xl text-black mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>Performance</p>
            <PieChart width={214} height={214} style={{ outline: 'none' }}>
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0];
                        return (
                            <div className="bg-white border border-[#d0d3d9] rounded-xl shadow-sm px-4 py-2 flex items-center gap-2">
                                <span className="inline-block size-2 rounded-sm" style={{ background: p.payload.fill }} />
                                <span className="text-xs text-[#54555a]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    {p.name}: {p.value}%
                                </span>
                            </div>
                        );
                    }}
                />
                <Pie
                    data={pieData}
                    cx={107} cy={107}
                    innerRadius={57} outerRadius={100}
                    startAngle={90} endAngle={-270}
                    dataKey="value"
                    strokeWidth={0}
                    animationBegin={0}
                    animationDuration={900}
                >
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
            </PieChart>
            <div className="flex items-center gap-3 mt-4">
                {pieData.map(({ fill, name }) => (
                    <div key={name} className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 12 12"><rect width="12" height="12" fill={fill} /></svg>
                        <span className="text-[#54555a] text-[10px]" style={{ fontFamily: "'Inter', sans-serif" }}>{name.toUpperCase()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Custom stacked bar shape ──────────────────────────────────────────────────

export function DeptStackShape({ x = 0, y = 0, width = 0, height = 0, pass = 0, fail = 0 }) {
    if (!width || !height) return null;
    const total = pass + fail || 1;
    const failH = Math.round((fail / total) * height);
    const passH = height - failH;
    return (
        <g>
            {failH > 0 && <rect x={x} y={y} width={width} height={failH} fill="#F92F21" />}
            {passH > 0 && <rect x={x} y={y + failH} width={width} height={passH} fill="#030303" />}
        </g>
    );
}

// ─── Department Bar Chart ─────────────────────────────────────────────────────

export function DepartmentCard({ deptData, chartHeight = 432 }) {
    const containerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(580);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const measure = () => {
            const w = el.getBoundingClientRect().width;
            if (w > 0) setChartWidth(Math.max(80, Math.round(w) - 16));
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const small = chartHeight < 300;
    const tickSize   = small ? 7  : 12;
    const leftMargin = small ? -18 : -6;
    const botMargin  = small ? 14  : 18;

    const CAT_GAP_PCT = 0.28;
    const BAR_GAP     = 3;
    const n = deptData?.length || 1;
    const dataWidth = Math.max(40, chartWidth - (small ? 24 : 36));
    const catSlot   = dataWidth / n;
    const available = catSlot * (1 - CAT_GAP_PCT);
    const barSz     = Math.max(2, Math.min(28, Math.floor((available - BAR_GAP) / 2)));

    if (!deptData?.length) return (
        <div className="border border-[#d0d3d9] rounded-[16px] p-6 flex items-center justify-center h-full">
            <p className="text-[#9c9c9c] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>No department data available</p>
        </div>
    );

    const maxTotal = Math.max(...deptData.map(d => d.total || 0), 10);
    const roundedMax = Math.ceil(maxTotal / 10) * 10;
    const yTicks = Array.from({ length: Math.floor(roundedMax / 10) + 1 }, (_, i) => i * 10);
    return (
        <div ref={containerRef} className="border border-[#d0d3d9] rounded-[16px] p-[8px] flex flex-col overflow-hidden size-full">
            <div className="px-[10px] pt-[8px] shrink-0">
                <p className="font-medium text-[24px] leading-[26px] text-black" style={{ fontFamily: "'Inter', sans-serif" }}>Department</p>
            </div>
            <div style={{ height: 16 }} className="shrink-0" />
            <div style={{ height: chartHeight, overflow: 'hidden' }}>
                <BarChart
                    width={chartWidth}
                    height={chartHeight}
                    data={deptData}
                    margin={{ top: 4, right: 6, left: leftMargin, bottom: botMargin }}
                    barCategoryGap="28%"
                    barGap={BAR_GAP}
                >
                    <CartesianGrid vertical={false} stroke="#DBDEE4" strokeWidth={0.58} />
                    <XAxis
                        dataKey="dept"
                        axisLine={{ stroke: '#54555A', strokeWidth: 0.58 }}
                        tickLine={false}
                        tick={{ fontSize: tickSize, fill: '#54555a', fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: tickSize, fill: '#54555a', fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
                        ticks={yTicks}
                        domain={[0, roundedMax]}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                        content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const entry = payload[0]?.payload;
                            if (!entry) return null;
                            const { pass = 0, fail = 0, total = pass + fail } = entry;
                            const safeTotal = total || 1;
                            return (
                                <div className="bg-white border border-[#d0d3d9] rounded-xl shadow-sm px-4 py-3">
                                    <p className="font-semibold text-sm text-black mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</p>
                                    {[{ label: 'Pass', value: pass, color: '#030303' }, { label: 'Fail', value: fail, color: '#F92F21' }].map(({ label: l, value, color }) => (
                                        <div key={l} className="flex items-center gap-2 text-xs mb-1 last:mb-0">
                                            <span className="inline-block size-2 rounded-sm shrink-0" style={{ background: color }} />
                                            <span className="text-[#54555a]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {l}: {value} students ({Math.round((value / safeTotal) * 100)}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            );
                        }}
                    />
                    <Bar dataKey="total" barSize={barSz} shape={(p) => <DeptStackShape {...p} />} isAnimationActive={false} />
                </BarChart>
            </div>
            {/* PASS / FAIL legend */}
            <div className="flex items-center justify-center gap-3 px-3 pb-1 shrink-0">
                {[{ color: '#030303', label: 'PASS' }, { color: '#F92F21', label: 'FAIL' }].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1">
                        <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none"><rect width="12.67" height="12.67" fill={color} /></svg>
                        <span className="text-[10px] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif", color: '#54555a' }}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Subject Bar Chart ────────────────────────────────────────────────────────

export function SubjectCard({ subjectData, chartHeight = 432 }) {
    const containerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(580);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const measure = () => {
            const w = el.getBoundingClientRect().width;
            if (w > 0) setChartWidth(Math.max(80, Math.round(w) - 16));
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const small = chartHeight < 300;
    const tickSize   = small ? 7  : 11;
    const leftMargin = small ? -18 : -6;
    const botMargin  = small ? 24  : 40;

    const CAT_GAP_PCT = 0.28;
    const BAR_GAP     = 3;
    const n = subjectData?.length || 1;
    const dataWidth = Math.max(40, chartWidth - (small ? 24 : 36));
    const catSlot   = dataWidth / n;
    const available = catSlot * (1 - CAT_GAP_PCT);
    const barSz     = Math.max(2, Math.min(28, Math.floor((available - BAR_GAP) / 2)));

    if (!subjectData?.length) return (
        <div className="border border-[#d0d3d9] rounded-[16px] p-6 flex items-center justify-center h-full">
            <p className="text-[#9c9c9c] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>No subject data available</p>
        </div>
    );

    const maxTotal = Math.max(...subjectData.map(d => d.total || 0), 10);
    const roundedMax = Math.ceil(maxTotal / 10) * 10;
    const yTicks = Array.from({ length: Math.floor(roundedMax / 10) + 1 }, (_, i) => i * 10);

    return (
        <div ref={containerRef} className="border border-[#d0d3d9] rounded-[16px] p-[8px] flex flex-col overflow-hidden size-full">
            <div className="px-[10px] pt-[8px] shrink-0">
                <p className="font-medium text-[24px] leading-[26px] text-black" style={{ fontFamily: "'Inter', sans-serif" }}>Subject Breakdown</p>
            </div>
            <div style={{ height: 16 }} className="shrink-0" />
            <div style={{ height: chartHeight, overflow: 'hidden' }}>
                <BarChart
                    width={chartWidth}
                    height={chartHeight}
                    data={subjectData}
                    margin={{ top: 4, right: 6, left: leftMargin, bottom: botMargin }}
                    barCategoryGap="28%"
                    barGap={BAR_GAP}
                >
                    <CartesianGrid vertical={false} stroke="#DBDEE4" strokeWidth={0.58} />
                    <XAxis
                        dataKey="code"
                        axisLine={{ stroke: '#54555A', strokeWidth: 0.58 }}
                        tickLine={false}
                        tick={{ fontSize: tickSize, fill: '#54555a', fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: tickSize, fill: '#54555a', fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
                        ticks={yTicks}
                        domain={[0, roundedMax]}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const entry = payload[0]?.payload;
                            if (!entry) return null;
                            const { code, name, pass = 0, fail = 0, total = pass + fail } = entry;
                            const safeTotal = total || 1;
                            const displayName = name && name !== code ? `${code} - ${name}` : code;
                            return (
                                <div className="bg-white border border-[#d0d3d9] rounded-xl shadow-sm px-4 py-3 max-w-[250px]">
                                    <p className="font-semibold text-sm text-black mb-2 leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>{displayName}</p>
                                    {[{ label: 'Pass', value: pass, color: '#030303' }, { label: 'Fail', value: fail, color: '#F92F21' }].map(({ label: l, value, color }) => (
                                        <div key={l} className="flex items-center gap-2 text-xs mb-1 last:mb-0">
                                            <span className="inline-block size-2 rounded-sm shrink-0" style={{ background: color }} />
                                            <span className="text-[#54555a]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {l}: {value} students ({Math.round((value / safeTotal) * 100)}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            );
                        }}
                    />
                    <Bar dataKey="total" barSize={barSz} shape={(p) => <DeptStackShape {...p} />} isAnimationActive={false} />
                </BarChart>
            </div>
            <div className="flex items-center justify-center gap-3 px-3 pb-1 shrink-0">
                {[{ color: '#030303', label: 'PASS' }, { color: '#F92F21', label: 'FAIL' }].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1">
                        <svg width="12.67" height="12.67" viewBox="0 0 12.67 12.67" fill="none"><rect width="12.67" height="12.67" fill={color} /></svg>
                        <span className="text-[10px] leading-[20px]" style={{ fontFamily: "'Inter', sans-serif", color: '#54555a' }}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Top Performers Table ─────────────────────────────────────────────────────

export function TopPerformersCard({ performers, compact = false }) {
    const thCls = compact
        ? 'text-left px-3 py-3 font-semibold text-xs text-black border-b border-[#d0d3d9] bg-white sticky top-0'
        : 'text-left px-6 py-4 font-semibold text-base text-black border-b border-[#d0d3d9] bg-white sticky top-0';
    const tdCls = compact
        ? 'px-3 py-2 text-[#616161] text-xs leading-5'
        : 'px-6 py-3 text-[#616161] text-sm leading-5';

    if (!performers?.length) return (
        <div className="border border-[#d0d3d9] rounded-[16px] overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-[#d0d3d9] flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <p className="font-medium text-2xl text-black" style={{ fontFamily: "'Inter', sans-serif" }}>Top Performers</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-[#9c9c9c] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>No performer data</p>
            </div>
        </div>
    );

    return (
        <div className="border border-[#d0d3d9] rounded-[16px] overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 shrink-0 border-b border-[#d0d3d9] flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <p className="font-medium text-2xl text-black" style={{ fontFamily: "'Inter', sans-serif" }}>Top Performers</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className={thCls} style={{ fontFamily: "'Inter', sans-serif" }}>{compact ? '#' : 'No'}</th>
                            <th className={thCls} style={{ fontFamily: "'Inter', sans-serif" }}>{compact ? 'Reg. No.' : 'Register Number'}</th>
                            <th className={thCls} style={{ fontFamily: "'Inter', sans-serif" }}>Full Name</th>
                            <th className={thCls} style={{ fontFamily: "'Inter', sans-serif" }}>SGPA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performers.map((p, i) => (
                            <tr key={i} className="border-b border-[#d0d3d9] last:border-0">
                                <td className={tdCls} style={{ fontFamily: "'Inter', sans-serif" }}>{i + 1}.</td>
                                <td className={tdCls} style={{ fontFamily: "'Inter', sans-serif" }}>{p.registerNumber || p.regNo || '—'}</td>
                                <td className={tdCls} style={{ fontFamily: "'Inter', sans-serif" }}>{p.name || '—'}</td>
                                <td className={tdCls} style={{ fontFamily: "'Inter', sans-serif" }}>{p.sgpa?.toFixed?.(2) ?? p.sgpa ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
