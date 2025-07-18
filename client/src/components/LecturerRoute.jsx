// src/components/LecturerRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LecturerRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  // Check for user info AND if their role is 'lecturer'.
  return userInfo && userInfo.role === 'lecturer' ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default LecturerRoute;