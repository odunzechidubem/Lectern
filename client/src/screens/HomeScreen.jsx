import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Import useSelector
import Hero from '../components/Hero';
import { useGetCoursesQuery } from '../slices/coursesApiSlice';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import Message from '../components/Message';

const HomeScreen = () => {
  const { data: courses, isLoading, error } = useGetCoursesQuery();
  const coursesSectionRef = useRef(null);
  const location = useLocation();
  
  // --- THIS IS THE FIX ---
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // If a SuperAdmin ever lands on this page, redirect them immediately.
    if (userInfo && userInfo.role === 'superAdmin') {
      navigate('/admin/dashboard');
    }
    
    // This handles the "scroll to courses" feature for other roles.
    if (location.state?.scrollToCourses) {
      coursesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userInfo, navigate, location.state]);
  // --- END OF FIX ---

  // While redirecting, show a loader to prevent content flash.
  if (userInfo && userInfo.role === 'superAdmin') {
    return <Loader />;
  }

  return (
    // <div className="flex flex-col flex-grow">
    <div className="flex flex-col flex-grow m-4">
      <Hero />
      <div ref={coursesSectionRef} className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Available Courses</h1>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='error'>{error?.data?.message || error.error}</Message>
        ) : (
          <>
            {courses && courses.length === 0 ? (
              <Message>No courses have been created yet. Please check back later!</Message>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses?.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;