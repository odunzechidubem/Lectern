// src/components/Header.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// --- THIS IS THE FIX: Import from 'react-redux', not 'redux' ---
import { useSelector, useDispatch } from 'react-redux'; 
import { useLogoutMutation } from '../slices/usersApiSlice';
import { clearCredentials } from '../slices/authSlice';
import { FaSignInAlt, FaUser } from 'react-icons/fa';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(clearCredentials());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleDropdownItemClick = () => {
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-xl font-bold tracking-wider">
          LMS Platform
        </Link>
        <nav>
          <ul className="flex items-center space-x-6">
            {userInfo ? (
              // If user is logged in
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="font-semibold flex items-center"
                >
                  {userInfo.name}
                  <span className="ml-1">▾</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <Link
                      to="/profile"
                      onClick={handleDropdownItemClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logoutHandler();
                        handleDropdownItemClick();
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // If user is logged out
              <>
                <li>
                  <Link to="/login" className="flex items-center hover:text-gray-300">
                    <FaSignInAlt className="mr-2" /> Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="flex items-center hover:text-gray-300">
                    <FaUser className="mr-2" /> Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;