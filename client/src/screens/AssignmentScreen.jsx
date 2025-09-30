import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetAssignmentDetailsQuery,
  useSubmitAssignmentMutation,
} from "../slices/assignmentsApiSlice";
import { useUploadFileMutation } from "../slices/uploadApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Meta from "../components/Meta"; // Corrected: Added Meta for SEO
import { FaFilePdf, FaUpload, FaCheckCircle, FaClock } from "react-icons/fa";

const AssignmentScreen = () => {
  const { courseId, assignmentId } = useParams();
  const [submissionFile, setSubmissionFile] = useState(null);

  const { data, isLoading, error, refetch } =
    useGetAssignmentDetailsQuery(assignmentId);
  const [submitAssignment, { isLoading: isSubmitting }] =
    useSubmitAssignmentMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const assignment = data?.assignment;
  const submission = data?.submission;

  const [isPastDue, setIsPastDue] = useState(false);

  useEffect(() => {
    if (assignment?.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(assignment.dueDate);
      setIsPastDue(today > dueDate);
    }
  }, [assignment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionFile) {
      return toast.error("Please select a file to submit."); // Corrected: Better user feedback
    }
    try {
      const formData = new FormData();
      formData.append("file", submissionFile);
      const uploadRes = await uploadFile(formData).unwrap();
      await submitAssignment({ assignmentId, fileUrl: uploadRes.url }).unwrap();
      toast.success("Assignment submitted successfully!");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div>
      {/* Corrected: Added dynamic meta tags for the assignment page */}
      {assignment && (
        <Meta
          title={`${assignment.title} | Lectern`}
          description={assignment.description}
        />
      )}

      <Link
        to={`/course/${courseId}`}
        className="inline-block px-4 py-2 mb-6 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
      >
        Back to Course
      </Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error?.data?.message || error.error}</Message>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              {assignment.title}
            </h1>
            {assignment.dueDate && (
              <p
                className={`flex items-center mb-4 text-sm ${
                  isPastDue ? "text-red-500" : "text-gray-500"
                }`}
              >
                <FaClock className="mr-2" />
                Due:{" "}
                {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                  timeZone: "UTC",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            <p className="mb-4 text-gray-700 whitespace-pre-wrap">
              {assignment.description}
            </p>
            {assignment.instructionFileUrl && (
              <a
                href={assignment.instructionFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center font-semibold text-red-500 hover:text-red-700"
              >
                <FaFilePdf className="mr-2" /> View Instructions (PDF)
              </a>
            )}
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              Your Submission
            </h2>
            {submission ? (
              <div className="space-y-4">
                <div className="flex items-center p-4 text-green-800 bg-green-100 rounded-md">
                  <FaCheckCircle className="mr-3" />
                  <div>
                    <p className="font-semibold">
                      Submitted on:{" "}
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline"
                    >
                      View Your Submission
                    </a>
                  </div>
                </div>
                {submission.grade !== null &&
                  submission.grade !== undefined && ( // Corrected: Check for null/undefined
                    <div className="p-4 text-blue-800 bg-blue-100 rounded-md">
                      <h3 className="font-semibold">
                        Grade: {submission.grade} / 100
                      </h3>
                      {submission.feedback && (
                        <p className="mt-2">
                          <strong>Feedback:</strong> {submission.feedback}
                        </p>
                      )}
                    </div>
                  )}
              </div>
            ) : isPastDue ? (
              <Message variant="error">
                The deadline for this assignment has passed. Submissions are no
                longer being accepted.
              </Message>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="submissionFile"
                    className="block mb-2 text-gray-700"
                  >
                    Upload your file
                  </label>
                  <input
                    type="file"
                    id="submissionFile"
                    accept="application/pdf,.doc,.docx"
                    onChange={(e) => setSubmissionFile(e.target.files[0])}
                    className="w-full"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUploading || isSubmitting}
                  className="flex items-center justify-center w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  <FaUpload className="mr-2" />
                  {isUploading
                    ? "Uploading..."
                    : isSubmitting
                    ? "Submitting..."
                    : "Submit Assignment"}
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
