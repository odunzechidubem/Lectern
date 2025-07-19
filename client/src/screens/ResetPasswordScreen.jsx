import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useResetPasswordMutation, useLogoutMutation } from '../slices/usersApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    // If a logged-in user navigates to this page, force them to log out first.
    if (userInfo) {
      logoutApiCall();
      dispatch(clearCredentials());
    }
  }, [userInfo, dispatch, logoutApiCall]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    try {
      const res = await resetPassword({ token, password }).unwrap();
      toast.success(res.message);
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="flex justify-center">
      <form className="p-8 mt-10 bg-white rounded shadow-md w-96" onSubmit={submitHandler}>
        <h1 className="text-2xl font-bold mb-6 text-gray-700">Set New Password</h1>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">New Password</label>
          <input type="password" id="password" className="w-full px-3 py-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">Confirm New Password</label>
          <input type="password" id="confirmPassword" className="w-full px-3 py-2 border rounded" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Set New Password'}
        </button>
      </form>
    </div>
  );
};
export default ResetPasswordScreen;