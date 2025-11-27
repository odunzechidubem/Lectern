// /src/screens/CourseScreen.jsx

import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetCourseDetailsQuery,
  useEnrollInCourseMutation,
} from "../slices/coursesApiSlice";
import { useGetAnnouncementsForCourseQuery } from "../slices/announcementsApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Meta from "../components/Meta";
import { USER_ROLES } from "../constants"; // Corrected: Import constants
import {
  FaPlayCircle,
  FaFilePdf,
  FaClipboardList,
  FaBullhorn,
  FaComments,
} from "react-icons/fa";

const CourseScreen = () => {
  const { id: courseId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: courseData,
    isLoading,
    refetch,
    error,
  } = useGetCourseDetailsQuery(courseId);
  const course = courseData; // Simplified for usage

  const isEnrolled = course?.students?.some((s) => s._id === userInfo?._id);

  const { data: announcements, isLoading: isLoadingAnnouncements } =
    useGetAnnouncementsForCourseQuery(courseId, {
      skip: !isEnrolled && userInfo?.role !== USER_ROLES.LECTURER,
    });

  const [enrollInCourse, { isLoading: isEnrolling }] =
    useEnrollInCourseMutation();

  const handleEnroll = async () => {
    try {
      await enrollInCourse(courseId).unwrap();
      toast.success("Enrolled!");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      {/* --- Dynamic SEO Content --- */}
      <Meta title={course?.title} description={course?.description} />

      <div>
        <Link
          to={
            userInfo?.role === USER_ROLES.STUDENT
              ? "/student/dashboard"
              : userInfo?.role === USER_ROLES.LECTURER
              ? "/"
              : "/"
          }
          state={userInfo?.role === USER_ROLES.LECTURER ? { scrollToCourses: true } : {}}
          className="inline-block px-4 py-2 mb-6 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          Go Back
        </Link>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="error">
            {error?.data?.message || error.error}
          </Message>
        ) : course ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Section */}
            <div className="space-y-6 lg:col-span-2">
              {/* Course Overview */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>
                <p className="mb-4 text-sm text-gray-500">
                  By {course?.lecturer?.name || "Deleted User"}
                </p>
                <p className="text-gray-700 break-words whitespace-pre-wrap break-all">{course.description}</p>
                {(isEnrolled || userInfo?.role === USER_ROLES.LECTURER) && (
                  <Link
                    to={`/course/${courseId}/chat`}
                    className="flex items-center justify-center w-full px-4 py-2 mt-4 font-semibold text-white bg-indigo-500 rounded hover:bg-indigo-600"
                  >
                    <FaComments className="mr-2" />
                    Go to Course Chat Room
                  </Link>
                )}
                {userInfo && userInfo.role === USER_ROLES.STUDENT && !isEnrolled && (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full px-4 py-2 mt-4 font-semibold text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    {isEnrolling ? "Enrolling..." : "Enroll Now"}
                  </button>
                )}
                {userInfo && userInfo.role === USER_ROLES.STUDENT && isEnrolled && (
                  <div className="p-3 mt-4 font-semibold text-center text-green-800 bg-green-100 rounded-md">
                    You are enrolled in this course.
                  </div>
                )}
              </div>
              {/* Lectures */}
              {(isEnrolled || userInfo?.role === USER_ROLES.LECTURER) && (
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h2 className="mb-4 text-2xl font-semibold text-gray-800">
                    Lectures
                  </h2>
                  {course.lectures?.length > 0 ? (
                    <ul className="space-y-4">
                      {course.lectures.map((lecture, index) => (
                        <li key={lecture._id} className="flex items-center justify-between transition-shadow bg-white">
                          <Link to={`/course/${course._id}/lecture/${index}`} className="flex items-center flex-grow p-2 rounded-l-lg group hover:bg-gray-100">
                            <FaPlayCircle className="mr-4 text-2xl text-blue-500 group-hover:text-blue-700" />
                            <h3 className="font-semibold text-gray-700 group-hover:text-blue-700">
                              {lecture.title}
                            </h3>
                          </Link>
                          {lecture.notesUrl && (
                            <a href={lecture.notesUrl} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 text-red-500 rounded-r-lg hover:text-red-700 hover:bg-gray-100">
                              <FaFilePdf className="mr-2" />
                              <span className="hidden sm:inline">
                                View Notes
                              </span>
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Message>No lectures yet.</Message>
                  )}
                </div>
              )}
            </div>
            {/* Right Section */}
            <div className="space-y-6">
              {(isEnrolled || userInfo?.role === USER_ROLES.LECTURER) && (
                <>
                  {/* Announcements */}
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="flex items-center mb-4 text-2xl font-semibold">
                      <FaBullhorn className="mr-3 text-indigo-500" />
                      Announcements
                    </h2>
                    {isLoadingAnnouncements ? (
                      <Loader />
                    ) : announcements && announcements.length > 0 ? (
                      <ul className="space-y-4">
                        {announcements.map((ann) => (
                          <li key={ann._id} className="pl-4 border-l-4 border-indigo-500">
                            <p className="text-gray-800">{ann.content}</p>
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date(ann.createdAt).toLocaleString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Message>No announcements yet.</Message>
                    )}
                  </div>
                  {/* Assignments */}
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="mb-4 text-2xl font-semibold">Assignments</h2>
                    {course.assignments?.length > 0 ? (
                      <ul className="space-y-3">
                        {course.assignments.map((assignment) => (
                          <li key={assignment._id}>
                            <Link to={`/course/${courseId}/assignment/${assignment._id}`} className="flex items-center w-full p-3 text-left rounded-lg hover:bg-gray-100">
                              <FaClipboardList className="flex-shrink-0 mr-4 text-purple-500" />
                              <span className="font-medium">
                                {assignment.title}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Message>No assignments yet.</Message>
                    )}
                  </div>
                </>
              )}
              {!isEnrolled && userInfo?.role === USER_ROLES.STUDENT && (
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <Message>
                    Enroll in this course to view content and join the chat.
                  </Message>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Message variant="error">Course could not be loaded.</Message>
        )}
      </div>
    </>
  );
};

export default CourseScreen;