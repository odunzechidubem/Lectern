import { Link } from 'react-router-dom';
import { useGetEnrolledCoursesQuery } from '../slices/usersApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const StudentDashboardScreen = () => {
  const { data: courses, isLoading, error } = useGetEnrolledCoursesQuery();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Enrolled Courses</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error?.data?.message || error.error}</Message>
      ) : (
        <div className="bg-white shadow-md rounded-lg">
          <ul className="divide-y divide-gray-200">
            {courses && courses.length > 0 ? (
              courses.map((course) => (
                <li key={course._id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                    <p className="text-sm text-gray-500">
                      Lecturer: {course.lecturer?.name || 'N/A'}
                    </p>
                  </div>
                  <Link
                    to={`/course/${course._id}`}
                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600"
                  >
                    Go to Course
                  </Link>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">
                You are not enrolled in any courses yet.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardScreen;