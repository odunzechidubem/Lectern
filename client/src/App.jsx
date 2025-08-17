import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from './slices/usersApiSlice';
import { clearCredentials } from './slices/authSlice';
import { useSocket } from './context/SocketContext';
import { apiSlice } from './slices/apiSlice';
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

  // --- THIS IS THE FIX for Light/Dark Mode ---
  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  // --- END OF FIX ---

  useEffect(() => {
    if (settings) {
      if (settings.siteName) { document.title = settings.siteName; }
      const favicon = document.getElementById('favicon');
      if (favicon && settings.faviconUrl) { favicon.href = settings.faviconUrl; }
    }
  }, [settings]);

  useEffect(() => {
    if (socket && userInfo) {
      const handleForceLogout = (data) => { toast.error(data.message || 'Your session has been terminated.'); logoutApiCall(); dispatch(clearCredentials()); };
      socket.on('force-logout', handleForceLogout);
      const handleNewNotification = () => { dispatch(apiSlice.util.invalidateTags(['Notifications'])); };
      socket.on('newNotification', handleNewNotification);
      return () => { socket.off('force-logout', handleForceLogout); socket.off('newNotification', handleNewNotification); };
    }
  }, [socket, userInfo, dispatch, logoutApiCall]);
  
  if (isLoadingSettings) {
    return <FullScreenLoader />;
  }

  if (settingsError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-red-50 text-red-800">
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
        <main className="flex-grow flex pt-[0px] md:pt-20">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/about" element={<div className="container mx-auto px-4 py-8 w-full"><AboutScreen /></div>} />
            <Route path="/login" element={<div className="container mx-auto px-4 py-8 w-full"><LoginScreen /></div>} />
            <Route path="/register" element={<div className="container mx-auto px-4 py-8 w-full"><RegisterScreen /></div>} />
            <Route path="/forgot-password" element={<div className="container mx-auto px-4 py-8 w-full"><ForgotPasswordScreen /></div>} />
            <Route path="/reset-password/:token" element={<div className="container mx-auto px-4 py-8 w-full"><ResetPasswordScreen /></div>} />
            <Route path="/course/:id" element={<div className="container mx-auto px-4 py-8 w-full"><CourseScreen /></div>} />
            <Route path="/verify-email-change/:token" element={<div className="container mx-auto px-4 py-8 w-full"><VerifyEmailChangeScreen /></div>} />
            <Route path="" element={<PrivateRoute />}>
              <Route path="/course/:courseId/lecture/:lectureIndex" element={<div className="container mx-auto px-4 py-8 w-full"><LectureScreen /></div>} />
              <Route path="/profile" element={<div className="container mx-auto px-4 py-8 w-full"><ProfileScreen /></div>} />
              <Route path="/course/:courseId/chat" element={<div className="container mx-auto px-4 py-8 w-full"><ChatScreen /></div>} />
            </Route>
            <Route path="" element={<LecturerRoute />}>
              <Route path="/lecturer/dashboard" element={<div className="container mx-auto px-4 py-8 w-full"><LecturerDashboardScreen /></div>} />
              <Route path="/lecturer/course/create" element={<div className="container mx-auto px-4 py-8 w-full"><CreateCourseScreen /></div>} />
              <Route path="/lecturer/course/:id/edit" element={<div className="container mx-auto px-4 py-8 w-full"><CourseEditScreen /></div>} />
              <Route path="/lecturer/course/:courseId/assignment/:assignmentId/submissions" element={<div className="container mx-auto px-4 py-8 w-full"><SubmissionsScreen /></div>} />
            </Route>
            <Route path="" element={<StudentRoute />}>
              <Route path="/student/dashboard" element={<div className="container mx-auto px-4 py-8 w-full"><StudentDashboardScreen /></div>} />
              <Route path="/course/:courseId/assignment/:assignmentId" element={<div className="container mx-auto px-4 py-8 w-full"><AssignmentScreen /></div>} />
              <Route path="/my-grades" element={<div className="container mx-auto px-4 py-8 w-full"><MyGradesScreen /></div>} />
            </Route>
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