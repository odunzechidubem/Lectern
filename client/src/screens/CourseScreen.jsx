import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useGetCourseDetailsQuery, useEnrollInCourseMutation } from '../slices/coursesApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaPlayCircle, FaFilePdf, FaClipboardList } from 'react-icons/fa';

const CourseScreen = () => {
  const { id: courseId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  const { data: course, isLoading, refetch, error } = useGetCourseDetailsQuery(courseId);
  const [enrollInCourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation();

  const handleEnroll = async () => {
    try {
      await enrollInCourse(courseId).unwrap();
      toast.success('Enrolled successfully!');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const isEnrolled = course?.students?.some((s) => s._id === userInfo?._id);

  return (
    <div>
      <Link to="/" className="inline-block bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 mb-6">
        Go Back
      </Link>

      {isLoading ? <Loader /> : error ? <Message variant='error'>{error?.data?.message || error.error}</Message> : course ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Course Details & Assignments */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h1 className="text-3xl font-bold mb-2 text-gray-800">{course.title}</h1>
              <p className="text-sm text-gray-500 mb-4">By {course?.lecturer?.name || 'Deleted User'}</p>
              <p className="text-gray-700">{course.description}</p>
              
              {userInfo && userInfo.role === 'student' && !isEnrolled && (
                <button onClick={handleEnroll} disabled={isEnrolling} className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600">
                  {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}
              {userInfo && userInfo.role === 'student' && isEnrolled && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md text-center font-semibold">You are enrolled in this course.</div>
              )}
            </div>

            {(isEnrolled || userInfo?.role === 'lecturer') && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Assignments</h2>
                {course.assignments && course.assignments.length > 0 ? (
                  <ul className="space-y-3">
                    {course.assignments.map(assignment => (
                      <li key={assignment._id}>
                        <Link to={`/course/${courseId}/assignment/${assignment._id}`} className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left">
                          <FaClipboardList className="text-purple-500 mr-4 flex-shrink-0" />
                          <span className="font-medium text-gray-800">{assignment.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : <Message>No assignments have been added for this course yet.</Message>}
              </div>
            )}
          </div>

          {/* Right Column: Lectures */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lectures</h2>
            {(isEnrolled || userInfo?.role === 'lecturer') ? (
              course.lectures && course.lectures.length > 0 ? (
                <ul className="space-y-4">
                  {course.lectures.map((lecture, index) => (
                    <li key={lecture._id} className="bg-white flex justify-between items-center transition-shadow">
                      <Link 
                        to={`/course/${course._id}/lecture/${index}`}
                        className="flex items-center group p-2 rounded-l-lg hover:bg-gray-100 flex-grow"
                      >
                        <FaPlayCircle className="text-blue-500 mr-4 text-2xl group-hover:text-blue-700" />
                        <h3 className="font-semibold text-gray-700 group-hover:text-blue-700">{lecture.title}</h3>
                      </Link>
                      {lecture.notesUrl && (
                        <a href={lecture.notesUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-red-500 hover:text-red-700 p-2 rounded-r-lg hover:bg-gray-100">
                          <FaFilePdf className="mr-2" />
                          <span className="hidden sm:inline">View Notes</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : <Message>No lectures have been added yet.</Message>
            ) : <Message>You must be enrolled to view lectures and assignments.</Message>}
          </div>
        </div>
      ) : <Message variant="error">Course could not be loaded.</Message>}
    </div>
  );
};

export default CourseScreen;