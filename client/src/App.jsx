import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import all components and screens
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import CourseScreen from './screens/CourseScreen';
import LectureScreen from './screens/LectureScreen';
import AssignmentScreen from './screens/AssignmentScreen';
import SubmissionsScreen from './screens/SubmissionsScreen';
import MyGradesScreen from './screens/MyGradesScreen';
import PrivateRoute from './components/PrivateRoute';
import LecturerRoute from './components/LecturerRoute';
import StudentRoute from './components/StudentRoute';
import LecturerDashboardScreen from './screens/LecturerDashboardScreen';
import StudentDashboardScreen from './screens/StudentDashboardScreen';
import CreateCourseScreen from './screens/CreateCourseScreen';
import CourseEditScreen from './screens/CourseEditScreen';

function App() {
  return (
    <Router>
      <Header />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
            <Route path="/course/:id" element={<CourseScreen />} />
            
            {/* --- Private Routes (All roles) --- */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/course/:courseId/lecture/:lectureIndex" element={<LectureScreen />} />
            </Route>

            {/* --- Private (Lecturer only) --- */}
            <Route path="" element={<LecturerRoute />}>
              <Route path="/lecturer/dashboard" element={<LecturerDashboardScreen />} />
              <Route path="/lecturer/course/create" element={<CreateCourseScreen />} />
              <Route path="/lecturer/course/:id/edit" element={<CourseEditScreen />} />
              <Route path="/lecturer/course/:courseId/assignment/:assignmentId/submissions" element={<SubmissionsScreen />} />
            </Route>

            {/* --- Private (Student only) --- */}
            <Route path="" element={<StudentRoute />}>
              <Route path="/student/dashboard" element={<StudentDashboardScreen />} />
              <Route path="/course/:courseId/assignment/:assignmentId" element={<AssignmentScreen />} />
              <Route path="/my-grades" element={<MyGradesScreen />} />
            </Route>
          </Routes>
        </div>
      </main>
    </Router>
  );
}

export default App;