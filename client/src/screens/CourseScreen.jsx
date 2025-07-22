import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useGetCourseDetailsQuery, useEnrollInCourseMutation } from '../slices/coursesApiSlice';
import { useGetAnnouncementsForCourseQuery } from '../slices/announcementsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaPlayCircle, FaFilePdf, FaClipboardList, FaBullhorn, FaComments } from 'react-icons/fa';

const CourseScreen = () => {
  const { id: courseId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: course, isLoading, refetch, error } = useGetCourseDetailsQuery(courseId);
  const isEnrolled = course?.students?.some((s) => s._id === userInfo?._id);
  const { data: announcements, isLoading: isLoadingAnnouncements } = useGetAnnouncementsForCourseQuery(courseId, { skip: !isEnrolled && userInfo?.role !== 'lecturer' });
  const [enrollInCourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation();

  const handleEnroll = async () => { try { await enrollInCourse(courseId).unwrap(); toast.success('Enrolled!'); refetch(); } catch (err) { toast.error(err?.data?.message || err.error); } };

  return (
    <div>
      <Link to="/" className="inline-block bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 mb-6">Go Back</Link>
      {isLoading ? <Loader /> : error ? <Message variant='error'>{error?.data?.message || error.error}</Message> : course ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-sm text-gray-500 mb-4">By {course?.lecturer?.name || 'Deleted User'}</p>
              <p className="text-gray-700">{course.description}</p>
              {(isEnrolled || userInfo?.role === 'lecturer') && (<Link to={`/course/${courseId}/chat`} className="mt-4 w-full bg-indigo-500 text-white font-semibold py-2 px-4 rounded hover:bg-indigo-600 flex items-center justify-center"><FaComments className="mr-2" />Go to Course Chat Room</Link>)}
              {userInfo && userInfo.role === 'student' && !isEnrolled && (<button onClick={handleEnroll} disabled={isEnrolling} className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600">{isEnrolling ? 'Enrolling...' : 'Enroll Now'}</button>)}
              {userInfo && userInfo.role === 'student' && isEnrolled && (<div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md text-center font-semibold">You are enrolled in this course.</div>)}
            </div>
            {(isEnrolled || userInfo?.role === 'lecturer') && (<div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-2xl font-semibold text-gray-800 mb-4">Lectures</h2>{course.lectures?.length > 0 ? (<ul>{course.lectures.map((lecture, index) => (<li key={lecture._id} className="bg-white flex justify-between items-center transition-shadow"><Link to={`/course/${course._id}/lecture/${index}`} className="flex items-center group p-2 rounded-l-lg hover:bg-gray-100 flex-grow"><FaPlayCircle className="text-blue-500 mr-4 text-2xl group-hover:text-blue-700" /><h3 className="font-semibold text-gray-700 group-hover:text-blue-700">{lecture.title}</h3></Link>{lecture.notesUrl && (<a href={lecture.notesUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-red-500 hover:text-red-700 p-2 rounded-r-lg hover:bg-gray-100"><FaFilePdf className="mr-2" /><span className="hidden sm:inline">View Notes</span></a>)}</li>))}</ul>) : <Message>No lectures yet.</Message>}</div>)}
          </div>
          <div className="space-y-6">
            {(isEnrolled || userInfo?.role === 'lecturer') && (<>
                <div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-2xl font-semibold mb-4 flex items-center"><FaBullhorn className="mr-3 text-indigo-500" />Announcements</h2>{isLoadingAnnouncements ? <Loader /> : announcements && announcements.length > 0 ? (<ul className="space-y-4">{announcements.map(ann => (<li key={ann._id} className="border-l-4 border-indigo-500 pl-4"><p className="text-gray-800">{ann.content}</p><p className="text-xs text-gray-400 mt-1">{new Date(ann.createdAt).toLocaleString()}</p></li>))}</ul>) : <Message>No announcements yet.</Message>}</div>
                <div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-2xl font-semibold mb-4">Assignments</h2>{course.assignments?.length > 0 ? (<ul className="space-y-3">{course.assignments.map(assignment => (<li key={assignment._id}><Link to={`/course/${courseId}/assignment/${assignment._id}`} className="flex items-center p-3 rounded-lg hover:bg-gray-100 w-full text-left"><FaClipboardList className="text-purple-500 mr-4 flex-shrink-0" /><span className="font-medium">{assignment.title}</span></Link></li>))}</ul>) : <Message>No assignments yet.</Message>}</div>
              </>)}
            {!isEnrolled && userInfo?.role === 'student' && (<div className="bg-white p-6 rounded-lg shadow-md"><Message>Enroll in this course to view content and join the chat.</Message></div>)}
          </div>
        </div>
      ) : <Message variant="error">Course could not be loaded.</Message>}
    </div>
  );
};
export default CourseScreen;