// /src/screens/RegisterScreen.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation, useLogoutMutation } from '../slices/usersApiSlice';
import { clearCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Meta from '../components/Meta';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false, uppercase: false, lowercase: false, number: false, specialChar: false,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    if (userInfo) {
      logoutApiCall();
      dispatch(clearCredentials());
    }
  }, [userInfo, dispatch, logoutApiCall]);

  useEffect(() => {
    setPasswordValidation({
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&#]/.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) { return toast.error('Password does not meet all the requirements.'); }
    if (password !== confirmPassword) { return toast.error('Passwords do not match'); }
    try {
      const res = await register({ name, email, password, role }).unwrap();
      toast.success(res.message);
      
      navigate('/login', { state: { fromRegistration: true } });

    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const getValidationItemClass = (isValid) => `flex items-center text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`;

  return (
    <>
      <Meta title="Lectern | Register" description="Create a Lectern account to start learning" />
      <div className="flex justify-center">
        <form className="w-96 p-8 mt-0 bg-white rounded shadow-md" onSubmit={submitHandler}>
          <h1 className="text-2xl font-bold mb-6 text-gray-700">Sign Up</h1>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">Full Name</label>
            <input type="text" id="name" className="w-full px-3 py-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
            <input type="email" id="email" className="w-full px-3 py-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} id="password" className="w-full px-3 py-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 mt-2">
              <div className={getValidationItemClass(passwordValidation.minLength)}>{passwordValidation.minLength ? <FaCheckCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />}8+ characters</div>
              <div className={getValidationItemClass(passwordValidation.uppercase)}>{passwordValidation.uppercase ? <FaCheckCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />}Uppercase</div>
              <div className={getValidationItemClass(passwordValidation.lowercase)}>{passwordValidation.lowercase ? <FaCheckCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />}Lowercase</div>
              <div className={getValidationItemClass(passwordValidation.number)}>{passwordValidation.number ? <FaCheckCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />}Number</div>
              <div className={getValidationItemClass(passwordValidation.specialChar)}>{passwordValidation.specialChar ? <FaCheckCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />}Symbol</div>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" className="w-full px-3 py-2 border rounded" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600">{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">I am a:</label>
            <select className="w-full px-3 py-2 border rounded bg-white" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 flex justify-center items-center" disabled={isLoading}>{isLoading ? 'Registering...' : 'Register'}</button>
          <p className="mt-4 text-center text-sm text-gray-600">Already have an account?{' '}<Link to="/login" className="text-blue-500 hover:underline">Login</Link></p>
        </form>
      </div>
    </>
  );
};

export default RegisterScreen;