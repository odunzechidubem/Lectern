import { useParams, Link } from 'react-router-dom';
import { useGetCourseDetailsQuery } from '../slices/coursesApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaFilePdf } from 'react-icons/fa';
import Meta from '../components/Meta';

const LectureScreen = () => {
  const { courseId, lectureIndex } = useParams();
  const { data: course, isLoading, error } = useGetCourseDetailsQuery(courseId);
  const lecture = course?.lectures?.[lectureIndex];

  return (
    <div>
      {lecture && <Meta title={`${lecture.title} | Lectern`} />}
      <Link
        to={`/course/${courseId}`}
        className="inline-block px-4 py-2 mb-6 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
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
            <h1 className="text-3xl font-bold text-gray-800">{lecture.title}</h1>
            <p className="text-gray-500">From course: {course?.title}</p>
          </div>
          {/* --- Responsive 16:9 Video Player --- */}
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-3xl overflow-hidden bg-black rounded-lg shadow-lg aspect-video">
              <video
                key={lecture.videoUrl} // Key prop ensures video reloads if the URL changes
                className="w-full h-full"
                src={lecture.videoUrl}
                controls
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          {/* Link to PDF Notes */}
          {lecture.notesUrl && (
            <a
              href={lecture.notesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-lg font-semibold text-red-500 hover:text-red-700"
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