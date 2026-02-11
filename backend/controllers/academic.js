const Result = require('../models/Result');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { processedData, generateExcel } = require('../utils/resultProcessor');

// --- Results ---
exports.addResult = async (req, res) => {
    try {
        const { studentId, batchId, type, title, subjects } = req.body;

        const result = new Result({
            student: studentId,
            batch: batchId,
            type,
            title,
            subjects,
            publishedBy: req.user.userId
        });

        await result.save();
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getResultsByStudent = async (req, res) => {
    try {
        // Find results linked to this student OR matching their registerId
        const student = await User.findById(req.user.userId);

        let query = { student: req.user.userId };
        if (student && student.registerId) {
            query = {
                $or: [
                    { student: req.user.userId },
                    { registerId: student.registerId }
                ]
            };
        }

        const results = await Result.find(query).sort({ date: -1 });
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getResultsByBatch = async (req, res) => {
    try {
        // Teacher views results for a specific batch (optional filter)
        const { batchId } = req.query;
        let query = {};
        if (batchId) query.batch = batchId;

        const results = await Result.find(query)
            .populate('student', 'name admissionNo')
            .populate('batch', 'name');
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// --- Assignments ---
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, batchId, dueDate } = req.body;

        const assignment = new Assignment({
            title,
            description,
            batch: batchId,
            dueDate,
            createdBy: req.user.userId
        });

        await assignment.save();
        res.status(201).json(assignment);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getAssignments = async (req, res) => {
    try {
        // Teachers see what they created, Students see what's for their batch
        // Simplified: Teachers see all for now (or filtered by their batches)
        // Students: Need to find their batch first.

        let query = {};
        if (req.user.role === 'teacher') {
            query.createdBy = req.user.userId;
        } else if (req.user.role === 'student') {
            // Find student's batch
            const student = await User.findById(req.user.userId);
            if (student && student.batch) {
                query.batch = student.batch;
            } else {
                return res.json([]); // No batch assigned
            }
        }

        const assignments = await Assignment.find(query).populate('batch', 'name branch');
        res.json(assignments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// --- PDF Upload for Results ---
const uploadResultPDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        // 1. Parse PDF using new logic
        // 1. Parse PDF using new logic
        const { rawStudents, metadata } = await processedData(req.file.buffer);

        // 2. Generate Excel Buffer (Advanced)
        // Pass the full object including metadata
        const excelBuffer = await generateExcel({ rawStudents, metadata });

        // 3. Save to Database (Bulk)
        const bulkOperations = [];

        for (const studentData of rawStudents) {
            // Find student by Register ID
            const student = await User.findOne({ registerId: studentData.registerId });

            // Prepare Result Document
            const resultPayload = {
                registerId: studentData.registerId,
                type: 'university',
                title: `${metadata.semester} Result`, // Use detected semester
                subjects: Object.entries(studentData.grades).map(([code, grade]) => ({
                    subCode: code,
                    name: code,
                    grade: grade
                })),
                published: true,
                date: new Date()
            };

            // If we found a student, link them. If not, just store the registerId.
            if (student) {
                resultPayload.student = student._id;
                resultPayload.batch = student.batch; // Attempt to link batch if available
            }

            // Upsert: Join on registerId + type. 
            // We use registerId as the primary key for the result now.
            bulkOperations.push({
                updateOne: {
                    filter: { registerId: studentData.registerId, type: 'university' },
                    update: { $set: resultPayload },
                    upsert: true
                }
            });
        } // End of For Loop

        // Execute Bulk Write
        if (bulkOperations.length > 0) {
            await Result.bulkWrite(bulkOperations);
        }

        // 4. Return Excel file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=university_results.xlsx');
        res.send(excelBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing PDF', error: error.message });
    }
};

exports.uploadResultPDF = uploadResultPDF;
