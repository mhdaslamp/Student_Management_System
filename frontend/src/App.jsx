import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import PrincipalDashboard from './pages/principal/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import VerifyRequest from './pages/VerifyRequest';


const RedirectToDashboard = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin')           return <Navigate to="/admin" />;
  if (user.role === 'teacher')         return <Navigate to="/teacher" />;
  if (user.role === 'student')         return <Navigate to="/student" />;
  if (user.role === 'hod')             return <Navigate to="/teacher" />;
  if (user.role === 'principal')       return <Navigate to="/principal" />;
  return <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes — no auth required */}
            <Route path="/login" element={<Login />} />
            <Route path="/verify/:reqId" element={<VerifyRequest />} />
            <Route path="/" element={<RedirectToDashboard />} />

            {/* Admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>

            {/* Teacher / HoD — share TeacherDashboard */}
            <Route element={<ProtectedRoute allowedRoles={['teacher', 'hod']} />}>
              <Route path="/teacher/*" element={<TeacherDashboard />} />
            </Route>

            {/* Principal — dedicated dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['principal']} />}>
              <Route path="/principal/*" element={<PrincipalDashboard />} />
            </Route>

            {/* Student */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/*" element={<StudentDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
