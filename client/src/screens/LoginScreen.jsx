// /src/screens/LoginScreen.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Meta from '../components/Meta';
import Message from '../components/Message'; // Import Message component
import Loader from '../components/Loader'; // Assuming Loader is in your components
import { USER_ROLES } from '../constants';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation(); // Get location to read state and query params

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // --- THE FIX: Check for state and params ---
  const fromRegistration = location.state?.fromRegistration;
  const urlParams = new URLSearchParams(location.search);
  const isVerified = urlParams.get('verified');
  // --- END FIX ---

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === USER_ROLES.SUPER_ADMIN) {
        navigate('/admin/dashboard');
      } else if (userInfo.role === USER_ROLES.LECTURER) {
        navigate('/lecturer/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  }, [userInfo, navigate]);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail.length > 0) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      setIsEmailValid(emailRegex.test(newEmail));
    } else {
      setIsEmailValid(true);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isEmailValid || email.length === 0) {
      return toast.error('Please enter a valid email address.');
    }
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const emailBorderStyle = isEmailValid ? 'border-gray-300' : 'border-red-500';

  return (
    <>
      <Meta title="Lectern | Sign in" description="Sign in to your Lectern account" />
      <div className="flex justify-center">
        <form className="w-96 p-8 mt-10 bg-white rounded shadow-md" onSubmit={submitHandler}>

          {/* --- THE FIX: Display contextual messages --- */}
          {fromRegistration && (
            <div className="mb-4">
              <Message variant="success">
                Registration successful! Please check your email to verify your account.
              </Message>
            </div>
          )}
          {isVerified && (
            <div className="mb-4">
              <Message variant="success">
                Email verified successfully! You can now log in.
              </Message>
            </div>
          )}
          {/* --- END FIX --- */}

          <h1 className="mb-6 text-2xl font-bold text-gray-700">Sign In</h1>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className={`w-full px-3 py-2 border rounded ${emailBorderStyle}`}
              value={email}
              onChange={handleEmailChange}
              required
            />
            {!isEmailValid && <p className="mt-1 text-xs text-red-500">Please enter a valid email format.</p>}
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-gray-700" htmlFor="password">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="w-full px-3 py-2 border rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"} 
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300 flex justify-center"
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : 'Sign In'}
          </button>
          <div className="flex items-center justify-between mt-4 text-sm">
            <Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot Password?</Link>
            <p className="text-gray-600">
              New User?{' '}
              <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginScreen;