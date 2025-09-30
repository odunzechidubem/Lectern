import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../constants'; // Corrected: Import constants

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Check for user info AND if their role is 'superAdmin'
  return userInfo && userInfo.role === USER_ROLES.SUPER_ADMIN ? ( // Corrected: Use constant
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AdminRoute;