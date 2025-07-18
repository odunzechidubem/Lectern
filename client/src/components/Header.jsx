import { useState, useEffect, useRef } from 'react';
// --- NEW: Import useLocation ---
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { clearCredentials } from '../slices/authSlice';
import { FaSignInAlt, FaUser } from 'react-icons/fa';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- NEW: Get the current location object ---
  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleScroll = () => {
        setIsDropdownOpen(false);
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isDropdownOpen]);

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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="font-semibold flex items-center"
                >
                  {userInfo.name}
                  <span className="ml-1">▾</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    
                    {/* --- NEW: Conditional rendering for the dashboard link --- */}
                    {userInfo.role === 'lecturer' && location.pathname !== '/lecturer/dashboard' && (
                      <Link
                        to="/lecturer/dashboard"
                        onClick={handleDropdownItemClick}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Lecturer Dashboard
                      </Link>
                    )}
                    {userInfo.role === 'student' && location.pathname !== '/student/dashboard' && (
                      <Link
                        to="/student/dashboard"
                        onClick={handleDropdownItemClick}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Learning
                      </Link>
                    )}
                    
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
              // Logged out links
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