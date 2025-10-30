import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useForgotPasswordMutation, useLogoutMutation } from '../slices/usersApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import Meta from '../components/Meta';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    // If a logged-in user navigates to this page, force them to log out first.
    if (userInfo) {
      const performLogout = async () => {
        await logoutApiCall();
        dispatch(clearCredentials());
      };
      performLogout();
    }
  }, [userInfo, dispatch, logoutApiCall]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await forgotPassword({ email }).unwrap();
      toast.info(res.message);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Meta title="Lectern | Forgot Password" description="Reset your Lectern account password" />
      <div className="flex justify-center">
        <form className="w-96 p-8 mt-0 bg-white rounded shadow-md" onSubmit={submitHandler}>
          <h1 className="mb-4 text-2xl font-bold text-gray-700">Forgot Password</h1>
          <p className="mb-6 text-sm text-gray-600">Enter your email and we'll send a reset link.</p>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : 'Send Reset Link'}
          </button>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-blue-500 hover:underline">Back to Login</Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default ForgotPasswordScreen;