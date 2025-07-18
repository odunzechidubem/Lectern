import { useGetCoursesQuery } from '../slices/coursesApiSlice';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';
import Message from '../components/Message';

const HomeScreen = () => {
  // The hook remains the same
  const { data: courses, isLoading, error } = useGetCoursesQuery();

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Available Courses</h1>
      
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='error'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        // --- THIS IS THE NEW LOGIC ---
        <>
          {courses.length === 0 ? (
            // If the courses array is empty, display this message
            <Message>
              No courses have been created yet. Please check back later!
            </Message>
          ) : (
            // Otherwise, display the grid of courses
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </>
        // --- END OF NEW LOGIC ---
      )}
    </>
  );
};

export default HomeScreen;