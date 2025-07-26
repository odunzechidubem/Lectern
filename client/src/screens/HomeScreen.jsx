import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import { useGetCoursesQuery } from '../slices/coursesApiSlice';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaSearch } from 'react-icons/fa';
import useDebounce from '../hooks/useDebounce'; // <-- IMPORT our new custom hook

const HomeScreen = () => {
  const coursesSectionRef = useRef(null);
  const location = useLocation();

  // --- THIS IS THE UPDATED SEARCH LOGIC ---
  const [searchTerm, setSearchTerm] = useState(''); // Live value from the input box
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounced value for the API

  // The hook now uses the debounced term. It will automatically refetch
  // whenever the debouncedSearchTerm changes.
  const { data: courses, isLoading, error } = useGetCoursesQuery(debouncedSearchTerm);

  useEffect(() => {
    if (location.state?.scrollToCourses) {
      coursesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.state]);

  // The old submitHandler is no longer needed.

  return (
    <div className="flex flex-col flex-grow">
      <Hero />
      <div ref={coursesSectionRef} className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Available Courses
          </h1>
          
          {/* The form is now just a div container for the input */}
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              name="search"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              placeholder="Search for courses..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='error'>{error?.data?.message || error.error}</Message>
        ) : (
          <>
            {courses && courses.length === 0 ? (
              <Message>
                No courses found. Try a different search keyword or clear the search.
              </Message>
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