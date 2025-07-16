// src/screens/CourseScreen.jsx
import { useParams, Link } from 'react-router-dom';
import { useGetCourseDetailsQuery } from '../slices/coursesApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaPlayCircle, FaFilePdf } from 'react-icons/fa'; // Icons for lectures

const CourseScreen = () => {
  // Get the courseId from the URL parameters
  const { id: courseId } = useParams();

  // Use the hook to fetch course details
  const { data: course, isLoading, error } = useGetCourseDetailsQuery(courseId);

  return (
    <div>
      <Link to="/" className="inline-block bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 mb-6">
        Go Back
      </Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='error'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          {/* Course Header Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">{course.title}</h1>
            <p className="text-sm text-gray-500 mb-4">By {course.lecturer.name}</p>
            <p className="text-gray-700">{course.description}</p>
          </div>

          {/* Lectures List Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lectures</h2>
            {course.lectures && course.lectures.length > 0 ? (
              <ul className="space-y-4">
                {course.lectures.map((lecture, index) => (
                  <li key={index} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <div className="flex items-center">
                      <FaPlayCircle className="text-blue-500 mr-4 text-2xl" />
                      <div>
                        <h3 className="font-semibold text-gray-700">{lecture.title}</h3>
                      </div>
                    </div>
                    {lecture.notesUrl && (
                      <a 
                        href={lecture.notesUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-red-500 hover:text-red-700"
                      >
                        <FaFilePdf className="mr-2" />
                        View Notes
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <Message>No lectures have been added to this course yet.</Message>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CourseScreen;