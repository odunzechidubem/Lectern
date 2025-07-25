import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlayCircle, FaTrash, FaUserGraduate, FaClipboardList, FaFilePdf, FaEye, FaBullhorn } from 'react-icons/fa';
import {
  useGetCourseDetailsQuery,
  useUpdateCourseMutation,
  useAddLectureMutation,
  useDeleteLectureMutation,
} from '../slices/coursesApiSlice';
import { useUploadFileMutation } from '../slices/uploadApiSlice';
import { useCreateAssignmentMutation, useDeleteAssignmentMutation } from '../slices/assignmentsApiSlice';
import { useGetAnnouncementsForCourseQuery, useCreateAnnouncementMutation, useDeleteAnnouncementMutation } from '../slices/announcementsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

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
  const { data: announcements, isLoading: isLoadingAnnouncements, refetch: refetchAnnouncements } = useGetAnnouncementsForCourseQuery(courseId);
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [addLecture, { isLoading: isAddingLecture }] = useAddLectureMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [deleteLecture, { isLoading: isDeletingLecture }] = useDeleteLectureMutation();
  const [createAssignment, { isLoading: isCreatingAssignment }] = useCreateAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeletingAssignment }] = useDeleteAssignmentMutation();
  const [createAnnouncement, { isLoading: isCreatingAnnouncement }] = useCreateAnnouncementMutation();
  const [deleteAnnouncement, { isLoading: isDeletingAnnouncement }] = useDeleteAnnouncementMutation();

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
    }
  }, [course]);

  // Handlers
  const handleUpdateCourse = async (e) => { e.preventDefault(); try { await updateCourse({ courseId, title, description }).unwrap(); toast.success('Course updated'); } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleAddLecture = async (e) => { e.preventDefault(); if (!lectureTitle || !videoFile) return toast.error('Lecture title and video are required.'); try { const videoFormData = new FormData(); videoFormData.append('file', videoFile); const videoRes = await uploadFile(videoFormData).unwrap(); let notesUrl = ''; if (notesFile) { const notesFormData = new FormData(); notesFormData.append('file', notesFile); notesUrl = (await uploadFile(notesFormData).unwrap()).url; } await addLecture({ courseId, title: lectureTitle, videoUrl: videoRes.url, notesUrl }).unwrap(); toast.success('Lecture added'); refetch(); setLectureTitle(''); setVideoFile(null); setNotesFile(null); document.getElementById('videoFile').value = null; document.getElementById('notesFile').value = null; } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleDeleteLecture = async (lectureId) => { if (window.confirm('Are you sure?')) { try { await deleteLecture({ courseId, lectureId }).unwrap(); toast.success('Lecture deleted'); refetch(); } catch (err) { toast.error(err?.data?.message || err.error); } } };
  const handleCreateAssignment = async (e) => { e.preventDefault(); if (!assignmentTitle || !assignmentDueDate) return toast.error('Assignment title and due date are required.'); try { let instructionFileUrl = ''; if (assignmentFile) { const formData = new FormData(); formData.append('file', assignmentFile); instructionFileUrl = (await uploadFile(formData).unwrap()).url; } await createAssignment({ courseId, title: assignmentTitle, description: assignmentDesc, dueDate: assignmentDueDate, instructionFileUrl }).unwrap(); toast.success('Assignment created'); refetch(); setAssignmentTitle(''); setAssignmentDesc(''); setAssignmentDueDate(''); setAssignmentFile(null); document.getElementById('assignmentFile').value = null; } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleDeleteAssignment = async (assignmentId) => { if (window.confirm('Are you sure?')) { try { await deleteAssignment(assignmentId).unwrap(); toast.success('Assignment deleted'); refetch(); } catch (err) { toast.error(err?.data?.message || err.error); } } };
  const handleCreateAnnouncement = async (e) => { e.preventDefault(); if (!announcementContent) return toast.error('Announcement content cannot be empty.'); try { await createAnnouncement({ courseId, content: announcementContent }).unwrap(); toast.success('Announcement posted'); setAnnouncementContent(''); } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleDeleteAnnouncement = async (announcementId) => { if (window.confirm('Are you sure?')) { try { await deleteAnnouncement(announcementId).unwrap(); toast.success('Announcement deleted'); refetchAnnouncements(); } catch (err) { toast.error(err?.data?.message || err.error); } } };

  return (
    <div>
      <Link to="/lecturer/dashboard" className="inline-block bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 mb-6">
        Back to Dashboard
      </Link>
      {isLoading ? <Loader /> : error ? <Message variant="error">{error?.data?.message || error.error}</Message> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* --- LEFT COLUMN (REORDERED) --- */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Edit Course Details</h2>
              <form onSubmit={handleUpdateCourse}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 whitespace-pre-wrap">Description</label>
                  <textarea rows="5" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded whitespace-pre-wrap" />
                </div>
                <button type="submit" disabled={isUpdating} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Manage Announcements</h2>
              <form onSubmit={handleCreateAnnouncement} className="mb-6 border-b pb-6">
                <h3 className="text-lg font-semibold">Post New Announcement</h3>
                <textarea rows="4" value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} className="w-full px-3 py-2 border rounded my-2 whitespace-pre-wrap" placeholder="Announce an upcoming class..."></textarea>
                <button type="submit" disabled={isCreatingAnnouncement} className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600">{isCreatingAnnouncement ? 'Posting...' : 'Post Announcement'}</button>
              </form>
              <h3 className="text-lg font-semibold">Posted Announcements</h3>
              {isLoadingAnnouncements ? <Loader /> : announcements && announcements.length > 0 ? (
                <ul className="space-y-3 divide-y divide-gray-200 mt-4">
                  {announcements.map(ann => (
                    <li key={ann._id} className="pt-3">
                      <p className="text-gray-700">{ann.content}</p>
                      <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">
                        <span>Posted on {new Date(ann.createdAt).toLocaleString()}</span>
                        <button onClick={() => handleDeleteAnnouncement(ann._id)} disabled={isDeletingAnnouncement} className="text-red-400 hover:text-red-600"><FaTrash /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <Message>No announcements posted yet.</Message>}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Enrolled Students</h2>
                {course.students?.length > 0 ? (
                  <ul className="divide-y divide-gray-200">{course.students.map(student => ( <li key={student._id} className="py-3 flex items-center"><FaUserGraduate className="text-gray-500 mr-4 text-xl" /><div><p className="font-semibold text-gray-800">{student.name}</p><p className="text-sm text-gray-600">{student.email}</p></div></li>))}</ul>
                ) : <Message>No students have enrolled yet.</Message>}
            </div>
          </div>

          {/* Right Column (Unchanged) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Add New Lecture</h2>
              <form onSubmit={handleAddLecture}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Lecture Title</label>
                  <input type="text" value={lectureTitle} onChange={(e) => setLectureTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Video File (MP4, MOV)</label>
                  <input type="file" id="videoFile" onChange={(e) => setVideoFile(e.target.files[0])} className="w-full" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Notes File (PDF, optional)</label>
                  <input type="file" id="notesFile" onChange={(e) => setNotesFile(e.target.files[0])} className="w-full" />
                </div>
                <button type="submit" disabled={isAddingLecture || isUploading} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
                  {isAddingLecture || isUploading ? 'Adding...' : 'Add Lecture'}
                </button>
              </form>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Existing Lectures</h2>
                {course.lectures?.length > 0 ? (
                  <ul className="space-y-4">{course.lectures.map(lec => ( <li key={lec._id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50"><div className="flex items-center"><FaPlayCircle className="text-blue-500 mr-3" />{lec.title}</div><button onClick={() => handleDeleteLecture(lec._id)} disabled={isDeletingLecture} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100" title="Delete Lecture"><FaTrash /></button></li>))}</ul>
                ) : <Message>No lectures yet.</Message>}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Manage Assignments</h2>
              <form onSubmit={handleCreateAssignment} className="mb-6 border-b pb-6">
                <h3 className="text-lg font-semibold mb-2">Create New Assignment</h3>
                <div className="mb-4"><label className="block text-gray-700 mb-2">Title</label><input type="text" value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} className="w-full px-3 py-2 border rounded" /></div>
                <div className="mb-4"><label className="block text-gray-700 mb-2">Description (optional)</label><textarea rows="3" value={assignmentDesc} onChange={(e) => setAssignmentDesc(e.target.value)} className="w-full px-3 py-2 border rounded whitespace-pre-wrap" /></div>
                <div className="mb-4"><label className="block text-gray-700 mb-2">Due Date</label><input type="date" value={assignmentDueDate} onChange={(e) => setAssignmentDueDate(e.target.value)} className="w-full px-3 py-2 border rounded" /></div>
                <div className="mb-4"><label className="block text-gray-700 mb-2">Instruction File (PDF, optional)</label><input type="file" id="assignmentFile" onChange={(e) => setAssignmentFile(e.target.files[0])} className="w-full" /></div>
                <button type="submit" disabled={isCreatingAssignment || isUploading} className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600">{isCreatingAssignment || isUploading ? 'Creating...' : 'Create Assignment'}</button>
              </form>
              <h3 className="text-lg font-semibold mb-2">Existing Assignments</h3>
              {course.assignments?.length > 0 ? (
                <ul className="space-y-2">{course.assignments.map(ass => (
                  <li key={ass._id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div className="flex items-center">
                      <FaClipboardList className="text-purple-500 mr-3" />
                      <div><p>{ass.title}</p><p className="text-xs text-gray-500">Due: {new Date(ass.dueDate).toLocaleDateString()}</p></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {ass.instructionFileUrl && (<a href={ass.instructionFileUrl} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-700 text-sm p-2 rounded-full hover:bg-red-100" title="View Instructions"><FaFilePdf /></a>)}
                      <Link to={`/lecturer/course/${courseId}/assignment/${ass._id}/submissions`} className="text-green-500 hover:text-green-700 text-sm p-2 rounded-full hover:bg-green-100" title="View Submissions"><FaEye /></Link>
                      <button onClick={() => handleDeleteAssignment(ass._id)} disabled={isDeletingAssignment} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100" title="Delete Assignment"><FaTrash /></button>
                    </div>
                  </li>
                ))}</ul>
              ) : <Message>No assignments created yet.</Message>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEditScreen;