import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // --- THIS IS THE CRITICAL FIX ---
  // This useEffect is now the SINGLE source of truth for redirection.
  // It runs whenever userInfo changes.
  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'lecturer') {
        navigate('/lecturer/dashboard');
      } else if (userInfo.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/'); // Fallback
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
      // The handler's only job is to call the API and update the state.
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      // The useEffect will now handle the navigation automatically.
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const emailBorderStyle = isEmailValid ? 'border-gray-300' : 'border-red-500';

  return (
    <div className="flex justify-center">
      <form className="p-8 mt-10 bg-white rounded shadow-md w-96" onSubmit={submitHandler}>
        <h1 className="text-2xl font-bold mb-6 text-gray-700">Sign In</h1>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
          <input type="email" id="email" className={`w-full px-3 py-2 border rounded ${emailBorderStyle}`} value={email} onChange={handleEmailChange} />
          {!isEmailValid && <p className="text-red-500 text-xs mt-1">Please enter a valid email format.</p>}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} id="password" className="w-full px-3 py-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
        <div className="flex justify-between items-center mt-4 text-sm">
          <Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot Password?</Link>
          <p className="text-gray-600">
            New Customer?{' '}
            <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
          </p>
        </div>
      </form>
    </div>
  );
};
export default LoginScreen;