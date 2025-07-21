import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import all components and screens
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
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
import ProfileScreen from './screens/ProfileScreen';
import PrivateRoute from './components/PrivateRoute';
import LecturerRoute from './components/LecturerRoute';
import StudentRoute from './components/StudentRoute';
import AdminRoute from './components/AdminRoute';
import LecturerDashboardScreen from './screens/LecturerDashboardScreen';
import StudentDashboardScreen from './screens/StudentDashboardScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import CreateCourseScreen from './screens/CreateCourseScreen';
import CourseEditScreen from './screens/CourseEditScreen';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        
        <main className="flex-grow flex">
          {/* Note: HomeScreen manages its own container for the full-viewport hero. */}
          {/* Other screens are wrapped to maintain consistent layout. */}
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/login" element={<div className="container mx-auto px-4 py-8 w-full"><LoginScreen /></div>} />
            <Route path="/register" element={<div className="container mx-auto px-4 py-8 w-full"><RegisterScreen /></div>} />
            <Route path="/forgot-password" element={<div className="container mx-auto px-4 py-8 w-full"><ForgotPasswordScreen /></div>} />
            <Route path="/reset-password/:token" element={<div className="container mx-auto px-4 py-8 w-full"><ResetPasswordScreen /></div>} />
            <Route path="/course/:id" element={<div className="container mx-auto px-4 py-8 w-full"><CourseScreen /></div>} />
            
            {/* --- Private Routes (All roles) --- */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/course/:courseId/lecture/:lectureIndex" element={<div className="container mx-auto px-4 py-8 w-full"><LectureScreen /></div>} />
              <Route path="/profile" element={<div className="container mx-auto px-4 py-8 w-full"><ProfileScreen /></div>} />
            </Route>

            {/* --- Private (Lecturer only) --- */}
            <Route path="" element={<LecturerRoute />}>
              <Route path="/lecturer/dashboard" element={<div className="container mx-auto px-4 py-8 w-full"><LecturerDashboardScreen /></div>} />
              <Route path="/lecturer/course/create" element={<div className="container mx-auto px-4 py-8 w-full"><CreateCourseScreen /></div>} />
              <Route path="/lecturer/course/:id/edit" element={<div className="container mx-auto px-4 py-8 w-full"><CourseEditScreen /></div>} />
              <Route path="/lecturer/course/:courseId/assignment/:assignmentId/submissions" element={<div className="container mx-auto px-4 py-8 w-full"><SubmissionsScreen /></div>} />
            </Route>

            {/* --- Private (Student only) --- */}
            <Route path="" element={<StudentRoute />}>
              <Route path="/student/dashboard" element={<div className="container mx-auto px-4 py-8 w-full"><StudentDashboardScreen /></div>} />
              <Route path="/course/:courseId/assignment/:assignmentId" element={<div className="container mx-auto px-4 py-8 w-full"><AssignmentScreen /></div>} />
              <Route path="/my-grades" element={<div className="container mx-auto px-4 py-8 w-full"><MyGradesScreen /></div>} />
            </Route>

            {/* --- Private (Admin only) --- */}
            <Route path="" element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<div className="container mx-auto px-4 py-8 w-full"><AdminDashboardScreen /></div>} />
            </Route>
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;