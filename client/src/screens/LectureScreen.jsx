import { useParams, Link } from 'react-router-dom';
import { useGetCourseDetailsQuery } from '../slices/coursesApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaFilePdf } from 'react-icons/fa';

const LectureScreen = () => {
  const { courseId, lectureIndex } = useParams();

  const { data: course, isLoading, error } = useGetCourseDetailsQuery(courseId);

  const lecture = course?.lectures?.[lectureIndex];

  return (
    <div>
      <Link to={`/course/${courseId}`} className="inline-block bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 mb-6">
        Back to Course
      </Link>

      {isLoading ? <Loader /> : error ? <Message variant='error'>{error?.data?.message || error.error}</Message> : !lecture ? <Message variant='error'>Lecture not found.</Message> : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{lecture.title}</h1>
            <p className="text-gray-500">From course: {course.title}</p>
          </div>
          
          {/* --- The HTML5 Video Player --- */}
          <div className="bg-black rounded-lg shadow-lg mb-6 overflow-hidden">
            <video 
              key={lecture.videoUrl}
              className="w-full h-auto" 
              src={lecture.videoUrl} 
              controls
              // --- THIS IS THE DEFINITIVE FIX ---
              // This attribute explicitly grants permission for the video to enter fullscreen mode.
              allowFullScreen
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Link to PDF Notes */}
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