import { Routes, Route } from 'react-router-dom';
import StudentHome from './Home';
import StudentResults from './Results';
import StudentRequests from './Requests';
import WriteRequest from './WriteRequest';
import PreviewRequest from './PreviewRequest';
import StudentInternalResults from './InternalResults';
import StudentCertificates from './Certificates';

const StudentDashboard = () => {
    return (
        <Routes>
            <Route path="/" element={<StudentHome />} />
            <Route path="/results" element={<StudentResults />} />
            <Route path="/requests" element={<StudentRequests />} />
            <Route path="/requests/new" element={<WriteRequest />} />
            <Route path="/requests/preview" element={<PreviewRequest />} />
            <Route path="/internals" element={<StudentInternalResults />} />
            <Route path="/certificates" element={<StudentCertificates />} />
            {/* Add more routes here like /assignments */}
        </Routes>
    );
};

export default StudentDashboard;
