// src/components/Header.jsx

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
import { USER_ROLES } from '../constants'; // Corrected: Import constants

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(clearCredentials());
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to log out.');
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
      <header className="fixed top-0 left-0 right-0 z-50 text-white bg-gray-800 shadow-lg">
        <div className="container flex items-center justify-between p-4 sm:p-2 mx-auto">
          <Link
            to={userInfo && userInfo.role === USER_ROLES.SUPER_ADMIN ? '/admin/dashboard' : '/'}
            className="flex items-center min-w-0"
          >
            <img
              src={settings?.logoUrl || ''}
              alt={settings?.siteName || 'Site Logo'}
              className="flex-shrink-0 w-auto h-12 sm:h-8"
            />
            <span className="ml-3 font-bold tracking-wider truncate text-lg sm:text-l">
              {settings?.siteName || ''}
            </span>
          </Link>
          <nav>
            <ul className="flex items-center space-x-3 sm:space-x-4">
              <LanguageSelector />
              <li ref={desktopTranslateRef} className="hidden md:block notranslate"></li>
              <li>
                <ThemeToggle />
              </li>
              {userInfo ? (
                <>
                  {(userInfo.role === USER_ROLES.STUDENT || userInfo.role === USER_ROLES.LECTURER) && (
                    <li>
                      <Notifications />
                    </li>
                  )}
                  <li className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center font-semibold"
                      aria-label="User menu"
                    >
                      <img
                        src={
                          userInfo.profileImage ||
                          `https://ui-avatars.com/api/?name=${userInfo.name
                            .split(' ')
                            .join('+')}&background=random&color=fff`
                        }
                        alt="Profile"
                        className="object-cover w-10 h-10 sm:w-8 sm:h-8 rounded-full"
                      />
                      <span className="hidden ml-2 text-base sm:text-sm sm:block">{userInfo.name}</span>
                      <span className="ml-1 text-sm">▾</span>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 z-20 w-44 mt-2 py-1 bg-white rounded-md shadow-lg text-sm dark:bg-gray-700 dark:border dark:border-gray-600">
                        <button
                          onClick={() =>
                            handleNavigate(
                              userInfo.role === USER_ROLES.SUPER_ADMIN
                                ? '/admin/dashboard'
                                : userInfo.role === USER_ROLES.LECTURER
                                ? '/lecturer/dashboard'
                                : '/student/dashboard'
                            )
                          }
                          className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => handleNavigate('/profile')}
                          className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          My Profile
                        </button>
                        {userInfo.role === USER_ROLES.STUDENT && (
                          <button
                            onClick={() => handleNavigate('/my-grades')}
                            className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                          >
                            My Grades
                          </button>
                        )}
                        {userInfo.role !== USER_ROLES.SUPER_ADMIN && (
                          <Link
                            to="/"
                            state={{ scrollToCourses: true }}
                            onClick={() => setIsDropdownOpen(false)}
                            className="block w-full px-4 py-2 text-left text-gray-700 border-t border-gray-200 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 mt-1 pt-1"
                          >
                            All Courses
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logoutHandler();
                          }}
                          className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
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
                      <Link to="/login" className="flex items-center text-base sm:text-sm hover:text-gray-300">
                        <FaSignInAlt className="mr-1" /> Sign In
                      </Link>
                    </li>
                  )}
                  {showSignUpLink && (
                    <li>
                      <Link to="/register" className="flex items-center text-base sm:text-sm hover:text-gray-300">
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
      <div
        ref={mobileTranslateRef}
        className="md:hidden flex justify-center notranslate relative z-40 p-3 mt-[70px]"
      ></div>
    </>
  );
};

export default Header;
