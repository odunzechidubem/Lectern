import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFilePdf, FaCheckCircle, FaTimesCircle, FaUserTimes } from 'react-icons/fa';
import { useGetSubmissionsQuery } from '../slices/assignmentsApiSlice';
import { useGradeSubmissionMutation } from '../slices/submissionsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';

const SubmissionsScreen = () => {
  const { courseId, assignmentId } = useParams();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const { data: submissions, isLoading, error, refetch } = useGetSubmissionsQuery(assignmentId);
  const [gradeSubmission, { isLoading: isGrading }] = useGradeSubmissionMutation();

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (grade === '' || grade < 0 || grade > 100) {
      return toast.error('Please enter a valid grade between 0 and 100.');
    }
    try {
      await gradeSubmission({
        submissionId: selectedSubmission._id,
        assignmentId,
        grade: Number(grade),
        feedback,
      }).unwrap();
      toast.success('Submission graded successfully');
      refetch();
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const openGradingModal = (submission) => {
    if (!submission.student) {
      toast.error('Cannot grade a submission from a deleted user.');
      return;
    }
    setSelectedSubmission(submission);
    setGrade(submission.grade ?? '');
    setFeedback(submission.feedback || '');
  };

  return (
    <div>
      <Meta title="Assignment Submissions | Lectern" />
      <Link
        to={`/lecturer/course/${courseId}/edit`}
        className="inline-block px-4 py-2 mb-6 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
      >
        Back to Course Edit
      </Link>
      <h1 className="mb-4 text-3xl font-bold text-gray-800">Assignment Submissions</h1>

      {isLoading ? <Loader /> : error ? <Message variant="error">{error?.data?.message || error.error}</Message> : (
        <div className="bg-white rounded-lg shadow-md">
          <ul className="divide-y divide-gray-200">
            {submissions && submissions.length > 0 ? (
              submissions.map(submission => {
                // --- THIS IS THE DEFINITIVE FIX ---
                const studentName = submission.student?.name ?? 'Deleted User';
                const studentEmail = submission.student?.email ?? 'N/A';
                const isDeletedUser = !submission.student;

                return (
                  <li key={submission._id} className={`flex justify-between items-center p-4 ${isDeletedUser ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'}`}>
                    <div>
                      <p className="flex items-center font-semibold text-gray-800">
                        {isDeletedUser && <FaUserTimes className="mr-2 text-red-500" />}
                        {studentName}
                      </p>
                      <p className="text-sm text-gray-600">{studentEmail}</p>
                      <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-sm text-blue-500 hover:underline">
                        View Submission File
                      </a>
                    </div>
                    <div className="text-right">
                      {submission.grade !== undefined && submission.grade !== null ? (
                        <div className="flex items-center text-green-600">
                          <FaCheckCircle className="mr-2" />
                          Graded: {submission.grade}/100
                        </div>
                      ) : (
                        <div className={`flex items-center ${isDeletedUser ? 'text-red-500' : 'text-gray-500'}`}>
                          {isDeletedUser ? <FaTimesCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />}
                          {isDeletedUser ? 'Cannot Grade' : 'Not Graded'}
                        </div>
                      )}
                      <button
                        onClick={() => openGradingModal(submission)}
                        disabled={isDeletedUser}
                        className="px-3 py-1 mt-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {submission.grade !== undefined && submission.grade !== null ? 'Edit Grade' : 'Grade'}
                      </button>
                    </div>
                  </li>
                );
              })
            ) : <Message>No submissions for this assignment yet.</Message>}
          </ul>
        </div>
      )}

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h2 className="mb-4 text-2xl font-bold">Grade Submission</h2>
            <p className="mb-2"><strong>Student:</strong> {selectedSubmission.student?.name}</p>
            <p className="mb-4"><strong>Submission:</strong> <a href={selectedSubmission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View File</a></p>
            <form onSubmit={handleGradeSubmit}>
              <div className="mb-4">
                <label htmlFor="grade" className="block mb-2 text-gray-700">Grade (0-100)</label>
                <input id="grade" type="number" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="mb-4">
                <label htmlFor="feedback" className="block mb-2 text-gray-700">Feedback (optional)</label>
                <textarea id="feedback" rows="3" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full px-3 py-2 border rounded whitespace-pre-wrap"></textarea>
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setSelectedSubmission(null)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={isGrading} className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">{isGrading ? 'Saving...' : 'Save Grade'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsScreen;