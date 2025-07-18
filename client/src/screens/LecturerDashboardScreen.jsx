import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import {
  useGetMyCoursesQuery,
  useDeleteCourseMutation,
} from '../slices/coursesApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const LecturerDashboardScreen = () => {
  const { data: courses, isLoading, error } = useGetMyCoursesQuery();
  const [deleteCourse, { isLoading: isDeletingCourse }] = useDeleteCourseMutation();

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this entire course? This action cannot be undone.')) {
      try {
        await deleteCourse(courseId).unwrap();
        toast.success('Course deleted');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
        <Link
          to="/lecturer/course/create"
          className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 flex items-center transition-colors"
        >
          <FaPlus className="mr-2" /> Create Course
        </Link>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error?.data?.message || error.error}</Message>
      ) : (
        <div className="bg-white shadow-md rounded-lg">
          <ul className="divide-y divide-gray-200">
            {courses.length > 0 ? (
              courses.map((course) => (
                <li key={course._id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                    <p className="text-sm text-gray-500">
                      {course.lectures?.length || 0} Lectures
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/lecturer/course/${course._id}/edit`}
                      className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100"
                      title="Edit Course"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      disabled={isDeletingCourse}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"
                      title="Delete Course"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">
                You have not created any courses yet.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LecturerDashboardScreen;