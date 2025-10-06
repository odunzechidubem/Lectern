// /src/App.js

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from './slices/usersApiSlice';
import { clearCredentials } from './slices/authSlice';
import { useSocket } from './context/SocketContext';
import { useGetSettingsQuery } from './slices/settingsApiSlice';

// --- Core Components ---
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import InactivityHandler from './components/InactivityHandler';
import FullScreenLoader from './components/FullScreenLoader';

// --- Route Protection Components ---
import PrivateRoute from './components/PrivateRoute';
import LecturerRoute from './components/LecturerRoute';
import StudentRoute from './components/StudentRoute';
import AdminRoute from './components/AdminRoute';

// --- Screen Components ---
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import VerifyEmailChangeScreen from './screens/VerifyEmailChangeScreen';
import AboutScreen from './screens/AboutScreen';
import ProfileScreen from './screens/ProfileScreen';
import CourseScreen from './screens/CourseScreen';
import LectureScreen from './screens/LectureScreen';
import AssignmentScreen from './screens/AssignmentScreen';
import ChatScreen from './screens/ChatScreen';
import MyGradesScreen from './screens/MyGradesScreen';
import StudentDashboardScreen from './screens/StudentDashboardScreen';
import LecturerDashboardScreen from './screens/LecturerDashboardScreen';
import CreateCourseScreen from './screens/CreateCourseScreen';
import CourseEditScreen from './screens/CourseEditScreen';
import SubmissionsScreen from './screens/SubmissionsScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';

function App() {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();
  const { data: settings, isLoading: isLoadingSettings, error: settingsError } = useGetSettingsQuery();

  // --- Light/Dark Mode Effect ---
  const { theme } = useSelector((state) => state.theme);
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // --- Dynamic Title/Favicon Effect ---
  useEffect(() => {
    if (settings) {
      if (settings.siteName) { document.title = settings.siteName; }
      const favicon = document.getElementById('favicon');
      if (favicon && settings.faviconUrl) { favicon.href = settings.faviconUrl; }
    }
  }, [settings]);

  // --- Socket Event Listeners Effect (Simplified) ---
  useEffect(() => {
    if (socket && userInfo) {
      const handleForceLogout = (data) => {
        toast.error(data.message || 'Your session has been terminated.');
        logoutApiCall();
        dispatch(clearCredentials());
      };
      socket.on('force-logout', handleForceLogout);

      // The 'newNotification' listener is now handled inside notificationsApiSlice
      
      return () => {
        socket.off('force-logout', handleForceLogout);
      };
    }
  }, [socket, userInfo, dispatch, logoutApiCall]);

  if (isLoadingSettings) {
    return <FullScreenLoader message="Loading Platform..." />;
  }

  if (settingsError) {
    return (
      <div className="flex items-center justify-center w-screen h-screen text-red-800 bg-red-50">
        Could not load essential application data. Please try again later.
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <InactivityHandler />
      <div className="flex flex-col min-h-screen">
        <Header />
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
        <main className="flex flex-grow pt-[80px] md:pt-20">
            <Routes>
                {/* Your Routes Here - No changes needed to the routing structure */}
                <Route path="/" element={<HomeScreen />} />
                <Route path="/about" element={<div className="container w-full px-4 py-8 mx-auto"><AboutScreen /></div>} />
                <Route path="/login" element={<div className="container w-full px-4 py-8 mx-auto"><LoginScreen /></div>} />
                <Route path="/register" element={<div className="container w-full px-4 py-8 mx-auto"><RegisterScreen /></div>} />
                <Route path="/forgot-password" element={<div className="container w-full px-4 py-8 mx-auto"><ForgotPasswordScreen /></div>} />
                <Route path="/reset-password/:token" element={<div className="container w-full px-4 py-8 mx-auto"><ResetPasswordScreen /></div>} />
                <Route path="/course/:id" element={<div className="container w-full px-4 py-8 mx-auto"><CourseScreen /></div>} />
                <Route path="/verify-email-change/:token" element={<div className="container w-full px-4 py-8 mx-auto"><VerifyEmailChangeScreen /></div>} />

                <Route path="" element={<PrivateRoute />}>
                    <Route path="/profile" element={<div className="container w-full px-4 py-8 mx-auto"><ProfileScreen /></div>} />
                    <Route path="/course/:courseId/lecture/:lectureIndex" element={<div className="container w-full px-4 py-8 mx-auto"><LectureScreen /></div>} />
                    <Route path="/course/:courseId/chat" element={<div className="container w-full px-4 py-8 mx-auto"><ChatScreen /></div>} />
                </Route>

                <Route path="" element={<LecturerRoute />}>
                    <Route path="/lecturer/dashboard" element={<div className="container w-full px-4 py-8 mx-auto"><LecturerDashboardScreen /></div>} />
                    <Route path="/lecturer/course/create" element={<div className="container w-full px-4 py-8 mx-auto"><CreateCourseScreen /></div>} />
                    <Route path="/lecturer/course/:id/edit" element={<div className="container w-full px-4 py-8 mx-auto"><CourseEditScreen /></div>} />
                    <Route path="/lecturer/course/:courseId/assignment/:assignmentId/submissions" element={<div className="container w-full px-4 py-8 mx-auto"><SubmissionsScreen /></div>} />
                </Route>

                <Route path="" element={<StudentRoute />}>
                    <Route path="/student/dashboard" element={<div className="container w-full px-4 py-8 mx-auto"><StudentDashboardScreen /></div>} />
                    <Route path="/course/:courseId/assignment/:assignmentId" element={<div className="container w-full px-4 py-8 mx-auto"><AssignmentScreen /></div>} />
                    <Route path="/my-grades" element={<div className="container w-full px-4 py-8 mx-auto"><MyGradesScreen /></div>} />
                </Route>

                <Route path="" element={<AdminRoute />}>
                    <Route path="/admin/dashboard" element={<div className="container w-full px-4 py-8 mx-auto"><AdminDashboardScreen /></div>} />
                </Route>
            </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;