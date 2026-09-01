/**
 * analyticsHelper.js
 * Shared pure functions for result analysis.
 * Used by getBatchResultAnalysis, getCollegeResultAnalysis, getDepartmentResultAnalysis.
 */

const FAILED_GRADES = ['F', 'FE', 'I', 'ABSENT', 'Absent'];

/**
 * From a raw results array, filters to only the "regular" (majority admission year) cohort.
 * Extracts the 2-digit year from each result's registerId and picks the most common year.
 * @param {Array} results - Raw Result documents (with registerId field)
 * @returns {Array} regularResults - Filtered subset
 */
function filterRegularStudents(results) {
    const yearCounts = {};
    results.forEach(r => {
        const yM = (r.registerId || '').match(/\d{2}/);
        const y = yM ? yM[0] : '00';
        r.admissionYear = y;
        yearCounts[y] = (yearCounts[y] || 0) + 1;
    });
    let majorityYear = null, maxCount = 0;
    for (const y in yearCounts) {
        if (yearCounts[y] > maxCount) { maxCount = yearCounts[y]; majorityYear = y; }
    }
    return results.filter(r => r.admissionYear === majorityYear);
}

/**
 * Calculates the top 10 performing students sorted by SGPA descending.
 * @param {Array} regularResults - Already filtered result documents
 * @returns {Array} Top 10 performers with name, registerNumber, sgpa
 */
function calculateTopPerformers(regularResults) {
    return [...regularResults]
        .filter(r => r.sgpa > 0)
        .sort((a, b) => b.sgpa - a.sgpa)
        .slice(0, 10)
        .map(r => ({
            name: r.student?.name || r.registerId,
            registerNumber: r.registerId,
            sgpa: r.sgpa
        }));
}

/**
 * Iterates regularResults and computes pass/fail counts and per-subject stats.
 * @param {Array} regularResults - Already filtered result documents
 * @param {string[]} [failedGrades] - Grade strings considered as fail (defaults to FAILED_GRADES)
 * @returns {{ passed, failed, subjectStats }}
 */
function calculatePassFailStats(regularResults, failedGrades = FAILED_GRADES) {
    let passed = 0, failed = 0;
    const subjectStats = {};

    regularResults.forEach(r => {
        let isStudentFailed = false;
        r.subjects.forEach(sub => {
            if (!subjectStats[sub.subCode]) {
                subjectStats[sub.subCode] = {
                    code: sub.subCode,
                    name: sub.name && sub.name !== sub.subCode ? sub.name : sub.subCode,
                    pass: 0,
                    fail: 0
                };
            }
            if (failedGrades.includes(sub.grade)) {
                subjectStats[sub.subCode].fail++;
                isStudentFailed = true;
            } else {
                subjectStats[sub.subCode].pass++;
            }
        });
        if (isStudentFailed) failed++;
        else passed++;
    });

    return { passed, failed, subjectStats };
}

/**
 * Builds department-wise pass/fail breakdown from regularResults.
 * Infers department from registerId pattern (e.g. PKD24CE001 → CE).
 * @param {Array} regularResults
 * @param {Map} passFails - Pre-computed per-student fail flag: Map<registerId, boolean>
 * @returns {Array} Sorted array of { dept, pass, fail, total }
 */
function calculateDeptBreakdown(regularResults, studentFailMap) {
    const deptStats = {};
    regularResults.forEach(r => {
        const regId = r.registerId || '';
        const deptMatch = regId.match(/\d{2}([A-Z]{2,3})\d{3}/i);
        const deptCode = deptMatch ? deptMatch[1].toUpperCase() : 'XX';
        if (!deptStats[deptCode]) deptStats[deptCode] = { dept: deptCode, pass: 0, fail: 0, total: 0 };
        deptStats[deptCode].total++;
        if (studentFailMap.get(r.registerId)) deptStats[deptCode].fail++;
        else deptStats[deptCode].pass++;
    });
    return Object.values(deptStats).sort((a, b) => a.dept.localeCompare(b.dept));
}

module.exports = {
    filterRegularStudents,
    calculateTopPerformers,
    calculatePassFailStats,
    calculateDeptBreakdown,
    FAILED_GRADES
};
