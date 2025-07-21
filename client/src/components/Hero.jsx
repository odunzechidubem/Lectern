import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetSettingsQuery } from '../slices/settingsApiSlice';
import Loader from './Loader';

const Hero = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: settings, isLoading } = useGetSettingsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-104px)]">
        <Loader />
      </div>
    );
  }

  return (
    // --- THIS IS THE DEFINITIVE FIX ---
    // 1. `min-h-[calc(100vh-104px)]`: This sets the hero section's minimum height.
    //    - `100vh` is the full height of the browser window.
    //    - `104px` is a precise calculation of the space taken up by the Header and the top padding of the main content area.
    // 2. `flex flex-col md:flex-row`: This maintains your desired two-column layout on desktops and stacks them on mobile.
    <div className="flex flex-col md:flex-row bg-white shadow-md rounded-lg mb-8 overflow-hidden min-h-[calc(100vh-104px)]">
      
      {/* Left Side: Welcome Text */}
      <div className="md:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">
          {settings?.heroTitle || 'Welcome to the LMS Platform'}
        </h1>
        <p className="text-gray-600 mb-6 text-lg">
          {settings?.heroText || 'Your central hub for accessing course materials, submitting assignments, and tracking your learning progress.'}
        </p>
        {!userInfo && (
          <Link
            to="/register"
            className="w-full sm:w-auto bg-blue-500 text-white font-semibold py-3 px-6 rounded hover:bg-blue-600 transition-colors text-center text-lg"
          >
            Get Started Now
          </Link>
        )}
      </div>
      
      {/* Right Side: Banner Image */}
      <div className="md:w-1/2 h-64 md:h-auto">
        <img
          src={settings?.heroImageUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80'}
          alt="Students learning"
          className="w-full h-full object-cover"
        />
      </div>

    </div>
  );
};

export default Hero;