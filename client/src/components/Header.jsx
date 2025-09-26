import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { clearCredentials } from '../slices/authSlice';
import { useGetSettingsQuery } from '../slices/settingsApiSlice';
import { FaSignInAlt, FaUser } from 'react-icons/fa';
import Notifications from './Notifications';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const { data: settings } = useGetSettingsQuery();
  const location = useLocation();
  const desktopTranslateRef = useRef(null);
  const mobileTranslateRef = useRef(null);

  useEffect(() => {
    const moveWidget = () => {
      const widget = document.getElementById('google_translate_element');
      if (widget) {
        if (window.innerWidth >= 768) {
          if (desktopTranslateRef.current) {
            desktopTranslateRef.current.appendChild(widget);
            widget.style.display = 'block';
          }
        } else {
          if (mobileTranslateRef.current) {
            mobileTranslateRef.current.appendChild(widget);
            widget.style.display = 'block';
          }
        }
      }
    };
    const timer = setTimeout(moveWidget, 500);
    window.addEventListener('resize', moveWidget);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', moveWidget);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
  const handleNavigate = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  const showSignInLink = location.pathname !== '/login' && location.pathname !== '/forgot-password';
  const showSignUpLink =
    location.pathname !== '/register' &&
    !location.pathname.startsWith('/reset-password') &&
    location.pathname !== '/' &&
    location.pathname !== '/about' &&
    !location.pathname.startsWith('/course');

  return (
    <>
      <header className="bg-gray-800 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center p-2">
          <Link
            to={userInfo && userInfo.role === 'superAdmin' ? '/admin/dashboard' : '/'}
            className="flex items-center min-w-0"
          >
            <img
              src={settings?.logoUrl || ''}
              alt={settings?.siteName || ''}
              className="h-8 w-auto flex-shrink-0"
            />
            <span className="truncate text-lg font-bold tracking-wider ml-2">
              {settings?.siteName || ''}
            </span>
          </Link>
          <nav>
            <ul className="flex items-center space-x-2 sm:space-x-4">
              <LanguageSelector />
              <li ref={desktopTranslateRef} className="hidden md:block notranslate"></li>
              <li>
                <ThemeToggle />
              </li>
              {userInfo ? (
                <>
                  {(userInfo.role === 'student' || userInfo.role === 'lecturer') && (
                    <li>
                      <Notifications />
                    </li>
                  )}
                  <li className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="font-semibold flex items-center"
                    >
                      <img
                        src={
                          userInfo.profileImage ||
                          `https://ui-avatars.com/api/?name=${userInfo.name
                            .split(' ')
                            .join('+')}&background=random&color=fff`
                        }
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="hidden sm:block ml-1 text-sm">{userInfo.name}</span>
                      <span className="ml-1 text-xs">▾</span>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg py-1 z-20 dark:bg-gray-700 dark:border dark:border-gray-600 text-sm">
                        <button
                          onClick={() =>
                            handleNavigate(
                              userInfo.role === 'superAdmin'
                                ? '/admin/dashboard'
                                : userInfo.role === 'lecturer'
                                ? '/lecturer/dashboard'
                                : '/student/dashboard'
                            )
                          }
                          className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => handleNavigate('/profile')}
                          className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          My Profile
                        </button>
                        {userInfo.role === 'student' && (
                          <button
                            onClick={() => handleNavigate('/my-grades')}
                            className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                          >
                            My Grades
                          </button>
                        )}
                        {userInfo.role !== 'superAdmin' && (
                          <Link
                            to="/"
                            state={{ scrollToCourses: true }}
                            onClick={() => setIsDropdownOpen(false)}
                            className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 border-t border-gray-200 dark:border-gray-600 mt-1 pt-1"
                          >
                            All Courses
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logoutHandler();
                          }}
                          className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </li>
                </>
              ) : (
                <>
                  {showSignInLink && (
                    <li>
                      <Link to="/login" className="flex items-center hover:text-gray-300 text-sm">
                        <FaSignInAlt className="mr-1" /> Sign In
                      </Link>
                    </li>
                  )}
                  {showSignUpLink && (
                    <li>
                      <Link to="/register" className="flex items-center hover:text-gray-300 text-sm">
                        <FaUser className="mr-1" /> Sign Up
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile translate widget */}
      <div ref={mobileTranslateRef} className="md:hidden flex justify-center notranslate relative z-40 p-2 mt-[60px]"></div>
    </>
  );
};
export default Header;
