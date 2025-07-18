// src/screens/LectureScreen.jsx
import { useParams, Link } from 'react-router-dom';
import { useGetCourseDetailsQuery } from '../slices/coursesApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaFilePdf } from 'react-icons/fa';

const LectureScreen = () => {
  // Get both the courseId and the lecture's index from the URL
  const { courseId, lectureIndex } = useParams();

  const { data: course, isLoading, error } = useGetCourseDetailsQuery(courseId);

  // Find the specific lecture from the course data using its index
  const lecture = course?.lectures?.[lectureIndex];

  return (
    <div>
      {/* Go Back link navigates back to the main course page */}
      <Link
        to={`/course/${courseId}`}
        className="inline-block bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 mb-6"
      >
        Back to Course
      </Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">
          {error?.data?.message || error.error}
        </Message>
      ) : !lecture ? (
        <Message variant="error">Lecture not found.</Message>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {lecture.title}
            </h1>
            <p className="text-gray-500">From course: {course.title}</p>
          </div>

          {/* --- The HTML5 Video Player (Container is now 70% width and centered) --- */}
          <div className="flex justify-center">
            {' '}
            {/* Wrapper to center the video container */}
            <div className="bg-black rounded-lg shadow-lg mb-6 w-[70%]">
              {' '}
              {/* <<< CHANGED: Width is now 70% using arbitrary value */}
              <video
                className="w-full h-auto" // Fills its new, smaller parent
                src={lecture.videoUrl}
                controls // This attribute adds all the player controls (play, pause, volume, fullscreen)
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* --- Link to PDF Notes --- */}
          {lecture.notesUrl && (
            <a
              href={lecture.notesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-red-500 hover:text-red-700 text-lg font-semibold"
            >
              <FaFilePdf className="mr-2" />
              Download/View Lecture Notes (PDF)
            </a>
          )}
        </>
      )}
    </div>
  );
};

export default LectureScreen;