import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../constants'; // Corrected: Import constants

const LecturerRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Check for user info AND if their role is 'lecturer'.
  return userInfo && userInfo.role === USER_ROLES.LECTURER ? ( // Corrected: Use constant
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default LecturerRoute;