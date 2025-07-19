import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFilePdf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useGetSubmissionsQuery } from '../slices/assignmentsApiSlice';
import { useGradeSubmissionMutation } from '../slices/submissionsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const SubmissionsScreen = () => {
  const { courseId, assignmentId } = useParams();

  // State for the currently selected submission and the grading form
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  // API Hooks
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
        assignmentId, // Pass for tag invalidation
        grade: Number(grade),
        feedback,
      }).unwrap();
      toast.success('Submission graded successfully');
      refetch(); // Refetch the list to show the new grade
      setSelectedSubmission(null); // Close the modal/form
      setGrade('');
      setFeedback('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };
  
  // When a lecturer clicks "Grade", pre-fill the form with existing data
  const openGradingModal = (submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || '');
    setFeedback(submission.feedback || '');
  };

  return (
    <div>
      <Link to={`/lecturer/course/${courseId}/edit`} className="inline-block bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 mb-6">
        Back to Course Edit
      </Link>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Assignment Submissions</h1>
      
      {isLoading ? <Loader /> : error ? <Message variant="error">{error?.data?.message || error.error}</Message> : (
        <div className="bg-white shadow-md rounded-lg">
          <ul className="divide-y divide-gray-200">
            {submissions && submissions.length > 0 ? (
              submissions.map(submission => (
                <li key={submission._id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-800">{submission.student.name}</p>
                    <p className="text-sm text-gray-600">{submission.student.email}</p>
                    
                    {/* --- THIS IS THE NEWLY ADDED LINE --- */}
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                    </p>

                    <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline mt-1 inline-block">
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
                      <div className="flex items-center text-gray-500">
                        <FaTimesCircle className="mr-2" />
                        Not Graded
                      </div>
                    )}
                    <button onClick={() => openGradingModal(submission)} className="mt-1 bg-blue-500 text-white text-sm py-1 px-3 rounded hover:bg-blue-600">
                      {submission.grade !== undefined ? 'Edit Grade' : 'Grade'}
                    </button>
                  </div>
                </li>
              ))
            ) : <Message>No submissions for this assignment yet.</Message>}
          </ul>
        </div>
      )}

      {/* Grading Modal/Form */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Grade Submission</h2>
            <p className="mb-2"><strong>Student:</strong> {selectedSubmission.student.name}</p>
            <p className="mb-4"><strong>Submission:</strong> <a href={selectedSubmission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View File</a></p>
            <form onSubmit={handleGradeSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Grade (0-100)</label>
                <input type="number" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Feedback (optional)</label>
                <textarea rows="3" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full px-3 py-2 border rounded"></textarea>
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setSelectedSubmission(null)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={isGrading} className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">{isGrading ? 'Saving...' : 'Save Grade'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsScreen;