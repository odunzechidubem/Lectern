import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../constants'; // Corrected: Import constants

const StudentRoute = () => {
  // Get the user's information from the Redux state
  const { userInfo } = useSelector((state) => state.auth);

  // Check if the user is logged in AND if their role is 'student'
  return userInfo && userInfo.role === USER_ROLES.STUDENT ? ( // Corrected: Use constant
    // If they are a student, render the child route (e.g., the Student Dashboard)
    <Outlet />
  ) : (
    // Otherwise, redirect them to the login page
    <Navigate to="/login" replace />
  );
};

export default StudentRoute;