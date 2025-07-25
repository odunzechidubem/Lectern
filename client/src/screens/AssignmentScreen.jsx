// src/screens/AssignmentScreen.jsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetAssignmentDetailsQuery, useSubmitAssignmentMutation } from '../slices/assignmentsApiSlice';
import { useUploadFileMutation } from '../slices/uploadApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaFilePdf, FaUpload, FaCheckCircle } from 'react-icons/fa';

const AssignmentScreen = () => {
  const { courseId, assignmentId } = useParams();
  const [submissionFile, setSubmissionFile] = useState(null);

  const { data, isLoading, error, refetch } = useGetAssignmentDetailsQuery(assignmentId);
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const assignment = data?.assignment;
  const submission = data?.submission;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionFile) {
      return toast.error('Please select a file to submit.');
    }
    try {
      // 1. Upload the submission file
      const formData = new FormData();
      formData.append('file', submissionFile);
      const uploadRes = await uploadFile(formData).unwrap();

      // 2. Create the submission with the returned URL
      await submitAssignment({
        assignmentId,
        fileUrl: uploadRes.url,
      }).unwrap();

      toast.success('Assignment submitted successfully!');
      refetch(); // Refetch to show the submission status
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div>
      <Link to={`/course/${courseId}`} className="inline-block bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 mb-6">
        Back to Course
      </Link>

      {isLoading ? <Loader /> : error ? <Message variant='error'>{error?.data?.message || error.error}</Message> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Assignment Details */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">{assignment.title}</h1>
            {assignment.dueDate && (
              <p className="text-sm text-gray-500 mb-4">
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
            )}
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{assignment.description}</p>
            {assignment.instructionFileUrl && (
              <a href={assignment.instructionFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-red-500 hover:text-red-700 font-semibold">
                <FaFilePdf className="mr-2" /> View Instructions (PDF)
              </a>
            )}
          </div>

          {/* Right Column: Submission Status & Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Submission</h2>
            {submission ? (
              // If already submitted
              <div className="space-y-4">
                <div className="p-4 bg-green-100 text-green-800 rounded-md flex items-center">
                  <FaCheckCircle className="mr-3" />
                  <div>
                    <p className="font-semibold">Submitted on: {new Date(submission.submittedAt).toLocaleDateString()}</p>
                    <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline">View Your Submission</a>
                  </div>
                </div>
                {submission.grade && (
                   <div className="p-4 bg-blue-100 text-blue-800 rounded-md">
                     <h3 className="font-semibold">Grade: {submission.grade} / 100</h3>
                     {submission.feedback && <p className="mt-2"><strong>Feedback:</strong> {submission.feedback}</p>}
                   </div>
                )}
              </div>
            ) : (
              // If not yet submitted
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Upload your file</label>
                  <input type="file" onChange={(e) => setSubmissionFile(e.target.files[0])} className="w-full" />
                </div>
                <button type="submit" disabled={isUploading || isSubmitting} className="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 flex items-center justify-center">
                  <FaUpload className="mr-2" />
                  {isUploading ? 'Uploading...' : isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentScreen;