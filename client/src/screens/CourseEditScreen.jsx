// /client/src/screens/CourseEditScreen.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaPlayCircle, FaTrash, FaUserGraduate, FaClipboardList, FaFilePdf, FaEye, FaBullhorn } from 'react-icons/fa';
import {
  useGetCourseDetailsQuery,
  useUpdateCourseMutation,
  useAddLectureMutation,
  useDeleteLectureMutation,
} from '../slices/coursesApiSlice';
import { useUploadFileMutation } from '../slices/uploadApiSlice';
import { useCreateAssignmentMutation, useDeleteAssignmentMutation } from '../slices/assignmentsApiSlice';
import {
  useGetAnnouncementsForCourseQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from '../slices/announcementsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';

const CourseEditScreen = () => {
  const { id: courseId } = useParams();

  // State for all forms
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lectureTitle, setLectureTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [notesFile, setNotesFile] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [announcementContent, setAnnouncementContent] = useState('');

  // API Hooks
  const { data: course, isLoading, refetch, error } = useGetCourseDetailsQuery(courseId);
  const { data: announcements, isLoading: isLoadingAnnouncements, error: announcementsError, refetch: refetchAnnouncements } =
    useGetAnnouncementsForCourseQuery(courseId);
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [addLecture, { isLoading: isAddingLecture }] = useAddLectureMutation();
  const [uploadFile, { isLoading: isUploadingSmallFile }] = useUploadFileMutation(); // Kept for other potential small uploads
  const [deleteLecture, { isLoading: isDeletingLecture }] = useDeleteLectureMutation();
  const [createAssignment, { isLoading: isCreatingAssignment }] = useCreateAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeletingAssignment }] = useDeleteAssignmentMutation();
  const [createAnnouncement, { isLoading: isCreatingAnnouncement }] = useCreateAnnouncementMutation();
  const [deleteAnnouncement, { isLoading: isDeletingAnnouncement }] = useDeleteAnnouncementMutation();
  const [isUploading, setIsUploading] = useState(false); // Unified state for all upload processes

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
    }
  }, [course]);

  const uploadDirectlyToCloudinary = async (file, toastId, toastMessage) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = 'lms_unsigned_preset';
    if (!cloudName) throw new Error("Cloudinary cloud name is not configured on the frontend.");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'lms_uploads');

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    
    const response = await axios.post(cloudinaryUrl, formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          toast.update(toastId, { render: `${toastMessage}: ${percentCompleted}%` });
        }
      }
    });
    return { url: response.data.secure_url, publicId: response.data.public_id };
  };
  
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await updateCourse({ courseId, title, description }).unwrap();
      toast.success('Course updated');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lectureTitle || !videoFile) {
        return toast.error('Lecture title and video file are required.');
    }

    setIsUploading(true);
    const uploadToastId = toast.info('Starting upload...', { autoClose: false, closeButton: false });

    try {
        const { url: videoUrl, publicId: videoPublicId } = await uploadDirectlyToCloudinary(videoFile, uploadToastId, "Uploading video");
        
        let notesUrl = '';
        let notesPublicId = '';
        if (notesFile) {
            const notesRes = await uploadDirectlyToCloudinary(notesFile, uploadToastId, "Uploading notes");
            notesUrl = notesRes.url;
            notesPublicId = notesRes.publicId;
        }

        toast.update(uploadToastId, { render: 'Saving lecture...' });
        await addLecture({ courseId, title: lectureTitle, videoUrl, videoPublicId, notesUrl, notesPublicId }).unwrap();
        
        toast.dismiss(uploadToastId);
        toast.success('Lecture added successfully!');

        refetch();
        setLectureTitle('');
        setVideoFile(null);
        setNotesFile(null);
        document.getElementById('videoFile').value = null;
        if (document.getElementById('notesFile')) document.getElementById('notesFile').value = null;

    } catch (err) {
        toast.dismiss(uploadToastId);
        console.error('An error occurred during the upload process:', err);
        const errorMessage = err.response?.data?.error?.message || 'An unknown upload error occurred.';
        toast.error(`Failed to add lecture: ${errorMessage}`);
    } finally {
        setIsUploading(false);
    }
  };

  const handleDeleteLecture = async (lectureId) => { if (window.confirm('Are you sure you want to delete this lecture?')) { try { await deleteLecture({ courseId, lectureId }).unwrap(); toast.success('Lecture deleted'); refetch(); } catch (err) { toast.error(err?.data?.message || err.error); } } };
  
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentTitle || !assignmentDueDate) { return toast.error('Assignment title and due date are required.'); }
    
    setIsUploading(true);
    const uploadToastId = toast.info('Processing request...', { autoClose: false, closeButton: false });

    try {
      let instructionFileUrl = '';
      let instructionFilePublicId = '';
      if (assignmentFile) {
        toast.update(uploadToastId, { render: 'Uploading instruction file...' });
        const fileRes = await uploadDirectlyToCloudinary(assignmentFile, uploadToastId, "Uploading file");
        instructionFileUrl = fileRes.url;
        instructionFilePublicId = fileRes.publicId;
      }
      
      toast.update(uploadToastId, { render: 'Saving assignment...' });
      await createAssignment({ courseId, title: assignmentTitle, description: assignmentDesc, dueDate: assignmentDueDate, instructionFileUrl, instructionFilePublicId }).unwrap();
      
      toast.dismiss(uploadToastId);
      toast.success('Assignment created');
      refetch();
      setAssignmentTitle(''); setAssignmentDesc(''); setAssignmentDueDate(''); setAssignmentFile(null);
      document.getElementById('assignmentFile').value = null;

    } catch (err) {
      toast.dismiss(uploadToastId);
      console.error('Assignment creation failed:', err);
      toast.error(err.response?.data?.error?.message || 'Failed to create assignment.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => { if (window.confirm('Are you sure you want to delete this assignment?')) { try { await deleteAssignment({ courseId, assignmentId }).unwrap(); toast.success('Assignment deleted'); refetch(); } catch (err) { toast.error(err?.data?.message || err.error); } } };
  const handleCreateAnnouncement = async (e) => { e.preventDefault(); if (!announcementContent) { return toast.error('Announcement content cannot be empty.'); } try { await createAnnouncement({ courseId, content: announcementContent }).unwrap(); toast.success('Announcement posted'); setAnnouncementContent(''); refetchAnnouncements(); } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleDeleteAnnouncement = async (announcementId) => { if (window.confirm('Are you sure?')) { try { await deleteAnnouncement(announcementId).unwrap(); toast.success('Announcement deleted'); refetchAnnouncements(); } catch (err) { toast.error(err?.data?.message || err.error); } } };

  return (
    <div>
      {course && <Meta title={`Edit: ${course.title} | Lectern`} />}
      <Link to="/lecturer/dashboard" className="inline-block px-4 py-2 mb-6 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
        Back to Dashboard
      </Link>
      {isLoading ? <Loader /> : error ? <Message variant="error">{error?.data?.message || error.error}</Message> : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* --- LEFT COLUMN (REORDERED) --- */}
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="mb-4 text-2xl font-bold">Edit Course Details</h2>
              <form onSubmit={handleUpdateCourse}>
                <div className="mb-4">
                  <label htmlFor="courseTitle" className="block mb-2 text-gray-700">Title</label>
                  <input id="courseTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label htmlFor="courseDescription" className="block mb-2 text-gray-700 whitespace-pre-wrap">Description</label>
                  <textarea id="courseDescription" rows="5" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded whitespace-pre-wrap" />
                </div>
                <button type="submit" disabled={isUpdating} className="w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="mb-4 text-2xl font-bold">Manage Announcements</h2>
                <form onSubmit={handleCreateAnnouncement} className="pb-6 mb-6 border-b">
                    <h3 className="text-lg font-semibold">Post New Announcement</h3>
                    <textarea rows="4" value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} className="w-full px-3 py-2 my-2 border rounded whitespace-pre-wrap" placeholder="Announce an upcoming class..."></textarea>
                    <button type="submit" disabled={isCreatingAnnouncement} className="w-full py-2 text-white bg-indigo-500 rounded hover:bg-indigo-600">{isCreatingAnnouncement ? 'Posting...' : 'Post Announcement'}</button>
                </form>
                <h3 className="text-lg font-semibold">Posted Announcements</h3>
                {isLoadingAnnouncements ? <Loader /> : announcementsError ? <Message variant="error">{announcementsError.data?.message || 'Could not load announcements.'}</Message> : (
                    announcements && announcements.length > 0 ? (
                        <ul className="mt-4 space-y-3 divide-y divide-gray-200">
                            {announcements.map(ann => (
                                <li key={ann._id} className="pt-3">
                                    <p className="text-gray-700">{ann.content}</p>
                                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                                        <span>Posted on {new Date(ann.createdAt).toLocaleString()}</span>
                                        <button onClick={() => handleDeleteAnnouncement(ann._id)} disabled={isDeletingAnnouncement} className="text-red-400 hover:text-red-600"><FaTrash /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <Message>No announcements posted yet.</Message>
                )}
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="mb-4 text-2xl font-bold">Enrolled Students</h2>
                {course?.students?.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {course.students.map(student => (
                            <li key={student._id} className="flex items-center py-3">
                                <FaUserGraduate className="mr-4 text-xl text-gray-500" />
                                <div>
                                    <p className="font-semibold text-gray-800">{student.name}</p>
                                    <p className="text-sm text-gray-600">{student.email}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <Message>No students have enrolled yet.</Message>}
            </div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="mb-4 text-2xl font-bold">Add New Lecture</h2>
              <form onSubmit={handleAddLecture}>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-700" htmlFor="lectureTitle">Lecture Title</label>
                  <input id="lectureTitle" type="text" value={lectureTitle} onChange={(e) => setLectureTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-700" htmlFor="videoFile">Video File (MP4, MOV)</label>
                  <input id="videoFile" type="file" onChange={(e) => setVideoFile(e.target.files[0])} className="w-full" accept="video/*" />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-700" htmlFor="notesFile">Notes File (PDF, optional)</label>
                  <input id="notesFile" type="file" onChange={(e) => setNotesFile(e.target.files[0])} className="w-full" accept=".pdf" />
                </div>
                <button type="submit" disabled={isUploading || isAddingLecture} className="w-full py-2 text-white bg-green-500 rounded hover:bg-green-600">
                  {isUploading ? 'Uploading...' : 'Add Lecture'}
                </button>
              </form>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="mb-4 text-2xl font-bold">Existing Lectures</h2>
              {course?.lectures?.length > 0 ? (
                <ul className="space-y-4">
                  {course.lectures.map(lec => (
                    <li key={lec._id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                      <div className="flex items-center">
                        <FaPlayCircle className="mr-3 text-blue-500" />{lec.title}
                      </div>
                      <button onClick={() => handleDeleteLecture(lec._id)} disabled={isDeletingLecture} className="p-2 text-red-500 rounded-full hover:text-red-700 hover:bg-red-100" title="Delete Lecture">
                        <FaTrash />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <Message>No lectures yet.</Message>}
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="mb-4 text-2xl font-bold">Manage Assignments</h2>
                <form onSubmit={handleCreateAssignment} className="pb-6 mb-6 border-b">
                    <h3 className="mb-2 text-lg font-semibold">Create New Assignment</h3>
                    <div className="mb-4"><label className="block mb-2 text-gray-700" htmlFor="assignmentTitle">Title</label><input id="assignmentTitle" type="text" value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} className="w-full px-3 py-2 border rounded" /></div>
                    <div className="mb-4"><label className="block mb-2 text-gray-700" htmlFor="assignmentDesc">Description (optional)</label><textarea id="assignmentDesc" rows="3" value={assignmentDesc} onChange={(e) => setAssignmentDesc(e.target.value)} className="w-full px-3 py-2 border rounded whitespace-pre-wrap" /></div>
                    <div className="mb-4"><label className="block mb-2 text-gray-700" htmlFor="assignmentDueDate">Due Date</label><input id="assignmentDueDate" type="date" value={assignmentDueDate} onChange={(e) => setAssignmentDueDate(e.target.value)} className="w-full px-3 py-2 border rounded" /></div>
                    <div className="mb-4"><label className="block mb-2 text-gray-700" htmlFor="assignmentFile">Instruction File (PDF, optional)</label><input type="file" id="assignmentFile" onChange={(e) => setAssignmentFile(e.target.files[0])} className="w-full" accept=".pdf" /></div>
                    <button type="submit" disabled={isUploading || isCreatingAssignment} className="w-full py-2 text-white bg-purple-500 rounded hover:bg-purple-600">{isUploading || isCreatingAssignment ? 'Creating...' : 'Create Assignment'}</button>
                </form>
                <h3 className="mb-2 text-lg font-semibold">Existing Assignments</h3>
                {course?.assignments?.length > 0 ? (
                    <ul className="space-y-2">
                        {course.assignments.map(ass => (
                            <li key={ass._id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                                <div className="flex items-center">
                                    <FaClipboardList className="mr-3 text-purple-500" />
                                    <div><p>{ass.title}</p><p className="text-xs text-gray-500">Due: {new Date(ass.dueDate).toLocaleDateString()}</p></div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {ass.instructionFileUrl && (<a href={ass.instructionFileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-sm text-red-500 rounded-full hover:text-red-700 hover:bg-red-100" title="View Instructions"><FaFilePdf /></a>)}
                                    <Link to={`/lecturer/course/${courseId}/assignment/${ass._id}/submissions`} className="p-2 text-sm text-green-500 rounded-full hover:text-green-700 hover:bg-green-100" title="View Submissions"><FaEye /></Link>
                                    <button onClick={() => handleDeleteAssignment(ass._id)} disabled={isDeletingAssignment} className="p-2 text-red-500 rounded-full hover:text-red-700 hover:bg-red-100" title="Delete Assignment"><FaTrash /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <Message>No assignments created yet.</Message>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};  

export default CourseEditScreen;