import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { clearCredentials } from '../slices/authSlice';
import { useGetSettingsQuery } from '../slices/settingsApiSlice';
import { FaSignInAlt, FaUser } from 'react-icons/fa';
import Notifications from './Notifications';
import LanguageSelector from './LanguageSelector'; // <-- IMPORT

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const { data: settings } = useGetSettingsQuery();
  
  // Create a ref to hold the target location for the widget
  const translateElementRef = useRef(null);

  useEffect(() => {
    // This effect moves the Google Translate widget into our header
    const googleTranslateElement = document.getElementById('google_translate_element');
    if (googleTranslateElement && translateElementRef.current) {
      translateElementRef.current.appendChild(googleTranslateElement);
      googleTranslateElement.style.display = 'block'; // Make it visible
    }
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
    }
  };

  const handleNavigate = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  return (
    <header className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link 
          to={userInfo && userInfo.role === 'superAdmin' ? '/admin/dashboard' : '/'} 
          className="flex items-center"
        >
          <img 
            src={settings?.logoUrl || '/client/public/logo.jpg'} 
            alt={settings?.siteName || 'Site Logo'} 
            className="h-10 w-auto" 
          />
          <span className="hidden sm:block text-xl font-bold tracking-wider ml-3">
            {settings?.siteName || 'Lectern'}
          </span>
        </Link>
        <nav>
          <ul className="flex items-center space-x-4">
            {/* The LanguageSelector component handles styling logic */}
            <LanguageSelector />
            {/* This li is the target where the widget will be moved */}
            <li ref={translateElementRef} className="notranslate"></li>

            {userInfo ? (
              <>
                {(userInfo.role === 'student' || userInfo.role === 'lecturer') && (
                  <li>
                    <Notifications />
                  </li>
                )}
                <li className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="font-semibold flex items-center">
                    <img src={userInfo.profileImage || `https://ui-avatars.com/api/?name=${userInfo.name.split(' ').join('+')}&background=random&color=fff`} alt="Profile" className="w-8 h-8 rounded-full mr-2 object-cover" />
                    {userInfo.name}
                    <span className="ml-1 text-xs">▾</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                      <button onClick={() => handleNavigate(userInfo.role === 'superAdmin' ? '/admin/dashboard' : userInfo.role === 'lecturer' ? '/lecturer/dashboard' : '/student/dashboard')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Dashboard
                      </button>
                      <button onClick={() => handleNavigate('/profile')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Profile
                      </button>
                      {userInfo.role === 'student' && (
                        <button onClick={() => handleNavigate('/my-grades')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          My Grades
                        </button>
                      )}
                      {userInfo.role !== 'superAdmin' && (
                        <Link to="/" state={{ scrollToCourses: true }} onClick={() => setIsDropdownOpen(false)} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t mt-1 pt-1">
                          All Courses
                        </Link>
                      )}
                      <button onClick={() => { setIsDropdownOpen(false); logoutHandler(); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Logout
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="flex items-center hover:text-gray-300"><FaSignInAlt className="mr-2" /> Sign In</Link></li>
                <li><Link to="/register" className="flex items-center hover:text-gray-300"><FaUser className="mr-2" /> Sign Up</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};
export default Header;