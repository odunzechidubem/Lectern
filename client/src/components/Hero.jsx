// src/components/Hero.jsx

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
    <div className="flex flex-col overflow-hidden bg-white rounded-lg shadow-md md:flex-row mb-8 min-h-[calc(100vh-104px)]">
      {/* Left Side: Welcome Text */}
      <div className="flex flex-col justify-center p-8 md:w-1/2 lg:p-16">
        <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-800 lg:text-5xl">
          {settings?.heroTitle || 'Welcome to the Lectern'}
        </h1>
        <p className="mb-6 text-lg text-gray-600">
          {settings?.heroText ||
            'Your central hub for accessing course materials, submitting assignments, and tracking your learning progress.'}
        </p>
        {!userInfo && (
          <Link
            to="/register"
            className="w-full px-6 py-3 font-semibold text-center text-white bg-blue-500 rounded sm:w-auto hover:bg-blue-600 transition-colors text-lg"
          >
            Get Started Now
          </Link>
        )}
      </div>

      {/* Right Side: Banner Image */}
      <div className="h-64 md:w-1/2 md:h-auto">
        <img
          src={
            settings?.heroImageUrl ||
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80'
          }
          alt={settings?.heroImageAlt || "Students collaborating and learning together"} // Corrected: More descriptive alt text
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
};

export default Hero;