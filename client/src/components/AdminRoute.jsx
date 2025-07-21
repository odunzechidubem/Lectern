import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  // Check for user info AND if their role is 'superAdmin'
  return userInfo && userInfo.role === 'superAdmin' ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AdminRoute;