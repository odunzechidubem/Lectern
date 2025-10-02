import { Link } from 'react-router-dom';
import { useGetMySubmissionsQuery } from '../slices/usersApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaTimesCircle } from 'react-icons/fa';
import Meta from '../components/Meta';

const MyGradesScreen = () => {
  const { data: submissions, isLoading, error } = useGetMySubmissionsQuery();

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 70) return 'text-blue-600';
    if (grade >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div>
      <Meta title="My Grades | Lectern" />
      <h1 className="mb-8 text-3xl font-bold text-gray-800">Submissions & My Grades</h1>
      {isLoading ? <Loader /> : error ? <Message variant="error">{error?.data?.message || error.error}</Message> : (
        <div className="overflow-hidden bg-white rounded-lg shadow-md">
          <ul className="divide-y divide-gray-200">
            {submissions && submissions.length > 0 ? (
              submissions.map((sub) => (
                <li key={sub._id} className="p-4 transition-colors hover:bg-gray-50">
                  <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm text-gray-500">{sub.course?.title || 'Course not found'}</p>
                      <Link
                        to={`/course/${sub.course?._id}/assignment/${sub.assignment?._id}`}
                        className="text-lg font-semibold text-blue-600 hover:underline"
                      >
                        {sub.assignment?.title || 'Assignment not found'}
                      </Link>
                      <p className="mt-1 text-xs text-gray-500">
                        Submitted on: {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 text-left sm:mt-0 sm:text-right">
                      {sub.grade !== undefined && sub.grade !== null ? (
                        <>
                          <p className={`text-2xl font-bold ${getGradeColor(sub.grade)}`}>
                            {sub.grade} / 100
                          </p>
                          {sub.feedback && (
                            <p className="mt-1 text-xs text-gray-600">
                              <strong>Feedback:</strong> {sub.feedback}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <FaTimesCircle className="mr-2" /> Awaiting Grade
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">
                You have not made any submissions yet.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyGradesScreen;