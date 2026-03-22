const pdf = require('pdf-parse');
const xlsx = require('xlsx');

const parseUniversityPDF = async (buffer) => {
    try {
        const data = await pdf(buffer);
        const text = data.text;

        const lines = text.split(/\n+/);
        const results = [];
        let currentStudent = null;
        let accumulatedLine = "";

        // Regex for Register ID (e.g., PKD24CE001)
        const regIdRegex = /^([A-Z]{3}\d{2}[A-Z]{2}\d{3})(.*)/;

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            const match = line.match(regIdRegex);
            if (match) {
                // If we have a previous student accumulating, push them first
                if (currentStudent) {
                    processStudentResults(currentStudent, accumulatedLine);
                    results.push(currentStudent);
                }

                // Start new student
                currentStudent = {
                    registerId: match[1],
                    results: [] // Will populate after processing full string
                };
                accumulatedLine = match[2]; // The rest of the line (first course usually)
            } else if (currentStudent) {
                // Continuation line
                accumulatedLine += " " + line;
            }
        }

        // Push the last student
        if (currentStudent) {
            processStudentResults(currentStudent, accumulatedLine);
            results.push(currentStudent);
        }

        return results;

    } catch (error) {
        throw new Error('PDF Parsing Failed: ' + error.message);
    }
};

const processStudentResults = (student, textChunk) => {
    // textChunk looks like: "UCHUT128(PASS), GZPHT121(C), ... "
    // Clean up spaces
    const cleanText = textChunk.replace(/\s+/g, '').replace(/,/g, ' ');
    // Now looks like: "UCHUT128(PASS) GZPHT121(C) ..."

    // Split by closing parenthesis to get items
    // Regex to find "Code(Grade)"
    // Matches "UCHUT128(PASS)" or "GZPHT121(C+)"
    const resultRegex = /([A-Z0-9]+)\(([^)]+)\)/g;

    let match;
    while ((match = resultRegex.exec(cleanText)) !== null) {
        // match[1] = Course Code, match[2] = Grade
        student.results.push({
            subjectCode: match[1],
            grade: match[2]
        });
    }
};

const generateExcel = (parsedData) => {
    const flatData = [];
    parsedData.forEach(student => {
        student.results.forEach(res => {
            flatData.push({
                'Register ID': student.registerId,
                'Subject Code': res.subjectCode,
                'Grade': res.grade
            });
        });
    });

    const ws = xlsx.utils.json_to_sheet(flatData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Results");

    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = { parseUniversityPDF, generateExcel };
