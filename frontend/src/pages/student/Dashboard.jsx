import { Routes, Route } from 'react-router-dom';
import StudentHome             from './Home';
import StudentResults          from './Results';
import StudentRequests         from './Requests';
import WriteRequest            from './WriteRequest';
import PreviewRequest          from './PreviewRequest';
import StudentInternalResults  from './InternalResults';
import ActivityPoints          from './ActivityPoints';
import AddActivity             from './AddActivity';
import ActivityDetail          from './ActivityDetail';

const StudentDashboard = () => {
    return (
        <Routes>
            <Route path="/"              element={<StudentHome />} />
            <Route path="/results"       element={<StudentResults />} />
            <Route path="/internals"     element={<StudentInternalResults />} />
            <Route path="/requests"      element={<StudentRequests />} />
            <Route path="/requests/new"             element={<WriteRequest />} />
            <Route path="/requests/preview"          element={<PreviewRequest />} />
            <Route path="/activity-points"            element={<ActivityPoints />} />
            <Route path="/activity-points/add"        element={<AddActivity />} />
            <Route path="/activity-points/:id"        element={<ActivityDetail />} />
            <Route path="/activity-points/:id/edit"   element={<AddActivity />} />
        </Routes>
    );
};

export default StudentDashboard;
