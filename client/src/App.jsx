// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Component and Screen imports
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CourseScreen from './screens/CourseScreen';
import LecturerRoute from './components/LecturerRoute';
import LecturerDashboardScreen from './screens/LecturerDashboardScreen';
import CreateCourseScreen from './screens/CreateCourseScreen';
import CourseEditScreen from './screens/CourseEditScreen';
import PrivateRoute from './components/PrivateRoute'; // <-- IMPORT
import LectureScreen from './screens/LectureScreen'; // <-- IMPORT

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
            <Route path="/course/:id" element={<CourseScreen />} />

            {/* --- Private Routes (Any Logged-in User) --- */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/course/:courseId/lecture/:lectureIndex" element={<LectureScreen />} />
            </Route>

            {/* --- Lecturer-Only Private Routes --- */}
            <Route path="" element={<LecturerRoute />}>
              <Route path="/lecturer/dashboard" element={<LecturerDashboardScreen />} />
              <Route path="/lecturer/course/create" element={<CreateCourseScreen />} />
              <Route path="/lecturer/course/:id/edit" element={<CourseEditScreen />} />
            </Route>
          </Routes>
        </div>
      </main>
    </Router>
  );
}

export default App;