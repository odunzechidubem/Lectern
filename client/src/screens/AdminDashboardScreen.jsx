import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useGetUsersByRoleQuery, useToggleUserStatusMutation, useDeleteUserByIdMutation, useGetAllCoursesQuery, useDeleteCourseByIdMutation } from '../slices/adminApiSlice';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../slices/settingsApiSlice';
import { useUploadFileMutation } from '../slices/uploadApiSlice';
import { useGetFooterLinksQuery, useCreateFooterLinkMutation, useUpdateFooterLinkMutation, useDeleteFooterLinkMutation } from '../slices/footerLinksApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaBook, FaCheckCircle, FaTimesCircle, FaTrash, FaUserShield, FaCog, FaUsers, FaPalette, FaLink, FaEdit } from 'react-icons/fa';

const AdminDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState('userManagement');

  // State and Hooks for User Management Tab
  const [activeUserTab, setActiveUserTab] = useState('lecturers');
  const { data: users, isLoading: isLoadingUsers, error: usersError, refetch: refetchUsers } = useGetUsersByRoleQuery(activeUserTab === 'lecturers' ? 'lecturer' : 'student');
  const [toggleUserStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();
  const [deleteUserById, { isLoading: isDeletingUser }] = useDeleteUserByIdMutation();

  // Hooks for Course Management Tab
  const { data: courses, isLoading: isLoadingCourses, error: coursesError } = useGetAllCoursesQuery();
  const [deleteCourseById, { isLoading: isDeletingCourse }] = useDeleteCourseByIdMutation();

  // Hooks for Settings Tabs
  const { data: settings, isLoading: isLoadingSettings, refetch: refetchSettings } = useGetSettingsQuery();
  const [updateSystemSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  // Hooks for Footer Links Tab
  const { data: links, isLoading: isLoadingLinks, error: linksError } = useGetFooterLinksQuery();
  const [createLink, { isLoading: isCreatingLink }] = useCreateFooterLinkMutation();
  const [updateLink, { isLoading: isUpdatingLink }] = useUpdateFooterLinkMutation();
  const [deleteLink, { isLoading: isDeletingLink }] = useDeleteFooterLinkMutation();

  // State for forms
  const [formState, setFormState] = useState({});
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [editingLink, setEditingLink] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');

  useEffect(() => { if (settings) { setFormState(settings); } }, [settings]);

  // All handler functions are now at the top level
  const handleToggle = async (userId) => { try { await toggleUserStatus(userId).unwrap(); toast.success('User status updated'); } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleDeleteUser = async (userId) => { if (window.confirm('Are you sure?')) { try { await deleteUserById(userId).unwrap(); toast.success('User deleted'); refetchUsers(); } catch (err) { toast.error(err?.data?.message || err.error); } } };
  const handleDeleteCourse = async (courseId) => { if (window.confirm('Are you sure?')) { try { await deleteCourseById(courseId).unwrap(); toast.success('Course deleted'); } catch (err) { toast.error(err?.data?.message || err.error); } } };
  const handleStudentRegToggle = async () => { try { await updateSystemSettings({ isStudentRegistrationEnabled: !settings.isStudentRegistrationEnabled }).unwrap(); toast.success('Student registration setting updated'); } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleLecturerRegToggle = async () => { try { await updateSystemSettings({ isLecturerRegistrationEnabled: !settings.isLecturerRegistrationEnabled }).unwrap(); toast.success('Lecturer registration setting updated'); } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleFileUpload = async (e) => { const file = e.target.files[0]; if (!file) return; const formData = new FormData(); formData.append('file', file); try { const res = await uploadFile(formData).unwrap(); const updatedField = e.target.name; await updateSystemSettings({ [updatedField]: res.url }).unwrap(); toast.success(`${e.target.dataset.label} updated successfully`); refetchSettings(); } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleSubmitContent = async (e) => { e.preventDefault(); try { await updateSystemSettings(formState).unwrap(); toast.success('Site content updated'); refetchSettings(); } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleInputChange = (e) => setFormState({ ...formState, [e.target.name]: e.target.value });
  const handleCreateLink = async (e) => { e.preventDefault(); try { await createLink({ title: newLinkTitle, url: newLinkUrl }).unwrap(); toast.success('Link created'); setNewLinkTitle(''); setNewLinkUrl(''); } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleDeleteLink = async (id) => { if (window.confirm('Are you sure?')) { try { await deleteLink(id).unwrap(); toast.success('Link deleted'); } catch (err) { toast.error(err?.data?.message || err.error); } } };
  const handleEditClick = (link) => { setEditingLink(link); setEditTitle(link.title); setEditUrl(link.url); };
  const handleUpdateLink = async (e) => { e.preventDefault(); try { await updateLink({ linkId: editingLink._id, title: editTitle, url: editUrl }).unwrap(); toast.success('Link updated'); setEditingLink(null); } catch (err) { toast.error(err?.data?.message || err.error); } };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center"><FaUserShield className="mr-3" /> Admin Dashboard</h1>
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('userManagement')} className={`${activeTab === 'userManagement' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}><FaUsers className="mr-2 inline" />User Management</button>
          <button onClick={() => setActiveTab('courseManagement')} className={`${activeTab === 'courseManagement' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}><FaBook className="mr-2 inline" />Course Management</button>
          <button onClick={() => setActiveTab('userSettings')} className={`${activeTab === 'userSettings' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}><FaCog className="mr-2 inline" />User Settings</button>
          <button onClick={() => setActiveTab('siteContent')} className={`${activeTab === 'siteContent' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}><FaPalette className="mr-2 inline" />Site Content</button>
          <button onClick={() => setActiveTab('footerLinks')} className={`${activeTab === 'footerLinks' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}><FaLink className="mr-2 inline" />Footer Links</button>
        </nav>
      </div>
      
      <div>
        {activeTab === 'userManagement' && (
          <div>
            <div className="mb-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs"><button onClick={() => setActiveUserTab('lecturers')} className={`${activeUserTab === 'lecturers' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Manage Lecturers</button><button onClick={() => setActiveUserTab('students')} className={`${activeUserTab === 'students' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Manage Students</button></nav>
            </div>
            {isLoadingUsers ? <Loader /> : usersError ? <Message variant="error">{usersError?.data?.message || usersError.error}</Message> : (<div className="bg-white shadow-md rounded-lg"><ul className="divide-y divide-gray-200">{users && users.length > 0 ? (users.map(user => (<li key={user._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center"><div className="flex items-center"><img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name.split(' ').join('+')}&background=random`} alt="Profile" className="w-10 h-10 rounded-full mr-4 object-cover" /><div><p className="font-semibold text-gray-800">{user.name}</p><p className="text-sm text-gray-600">{user.email}</p></div></div><div className="mt-4 sm:mt-0 flex items-center space-x-4"><div className={`flex items-center text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>{user.isActive ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}{user.isActive ? 'Active' : 'Disabled'}</div><button onClick={() => handleToggle(user._id)} disabled={isToggling} className="bg-yellow-500 text-white text-xs py-1 px-3 rounded hover:bg-yellow-600">{user.isActive ? 'Disable' : 'Enable'}</button><button onClick={() => handleDeleteUser(user._id)} disabled={isDeletingUser} className="bg-red-600 text-white text-xs p-2 rounded-full hover:bg-red-700"><FaTrash /></button></div></li>))) : <Message>No {activeUserTab} found.</Message>}</ul></div>)}
          </div>
        )}
        {activeTab === 'courseManagement' && (
          isLoadingCourses ? <Loader /> : coursesError ? <Message variant="error">{coursesError?.data?.message || coursesError.error}</Message> : (
            <div className="bg-white shadow-md rounded-lg">
              <ul className="divide-y divide-gray-200">{courses && courses.length > 0 ? (courses.map(course => (<li key={course._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center"><div><p className="font-semibold text-gray-800">{course.title}</p><p className="text-sm text-gray-600">Lecturer: {course.lecturer?.name || 'N/A'}</p></div><div className="mt-4 sm:mt-0"><button onClick={() => handleDeleteCourse(course._id)} disabled={isDeletingCourse} className="bg-red-600 text-white text-xs p-2 rounded-full hover:bg-red-700"><FaTrash /></button></div></li>))) : <Message>No courses found on the platform.</Message>}</ul>
            </div>
          )
        )}
        {activeTab === 'userSettings' && (
          isLoadingSettings ? <Loader /> : (
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
              <div className="flex items-center justify-between"><p className="text-gray-700">Allow Student Registration:</p><button onClick={handleStudentRegToggle} disabled={isUpdatingSettings} className={`w-28 text-center px-4 py-2 rounded-full font-semibold text-white ${settings?.isStudentRegistrationEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>{isUpdatingSettings ? '...' : settings?.isStudentRegistrationEnabled ? 'Enabled' : 'Disabled'}</button></div>
              <div className="flex items-center justify-between"><p className="text-gray-700">Allow Lecturer Registration:</p><button onClick={handleLecturerRegToggle} disabled={isUpdatingSettings} className={`w-28 text-center px-4 py-2 rounded-full font-semibold text-white ${settings?.isLecturerRegistrationEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>{isUpdatingSettings ? '...' : settings?.isLecturerRegistrationEnabled ? 'Enabled' : 'Disabled'}</button></div>
            </div>
          )
        )}
        {activeTab === 'siteContent' && (
          isLoadingSettings ? <Loader /> : (
            <form onSubmit={handleSubmitContent} className="bg-white p-6 rounded-lg shadow-md space-y-6">
              <h3 className="text-xl font-bold">General Settings</h3>
              <div><label className="block text-gray-700 font-bold mb-2">Site Name</label><input type="text" name="siteName" value={formState.siteName || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="block text-gray-700 font-bold mb-2">Logo</label><img src={formState.logoUrl || '/logo.png'} alt="Logo Preview" className="h-12 w-auto bg-gray-200 p-1 rounded mb-2" /><input type="file" name="logoUrl" data-label="Logo" onChange={handleFileUpload} className="w-full" accept="image/*" /></div>
              <hr /><h3 className="text-xl font-bold">Home Page (Hero Section)</h3>
              <div><label className="block text-gray-700 font-bold mb-2">Hero Title</label><input type="text" name="heroTitle" value={formState.heroTitle || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="block text-gray-700 font-bold mb-2">Hero Text</label><textarea name="heroText" rows="3" value={formState.heroText || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="block text-gray-700 font-bold mb-2">Hero Image</label><img src={formState.heroImageUrl || ''} alt="Hero Preview" className="h-32 w-auto rounded mb-2 object-cover" /><input type="file" name="heroImageUrl" data-label="Hero Image" onChange={handleFileUpload} className="w-full" accept="image/*" /></div>
              <hr /><h3 className="text-xl font-bold">About Us Page</h3>
              <div><label className="block text-gray-700 font-bold mb-2">About Us Title</label><input type="text" name="aboutUsTitle" value={formState.aboutUsTitle || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="block text-gray-700 font-bold mb-2">About Us Text</label><textarea name="aboutUsText" rows="5" value={formState.aboutUsText || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="block text-gray-700 font-bold mb-2">About Us Image</label><img src={formState.aboutUsImageUrl || ''} alt="About Us Preview" className="h-32 w-auto rounded mb-2 object-cover" /><input type="file" name="aboutUsImageUrl" data-label="About Us Image" onChange={handleFileUpload} className="w-full" accept="image/*" /></div>
              <hr /><h3 className="text-xl font-bold">Footer Settings</h3>
              <div><label className="block text-gray-700 font-bold mb-2">Footer About Text</label><input type="text" name="footerAboutText" value={formState.footerAboutText || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="block text-gray-700 font-bold mb-2">Contact Email</label><input type="email" name="footerContactEmail" value={formState.footerContactEmail || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="block text-gray-700 font-bold mb-2">Contact Phone</label><input type="text" name="footerContactPhone" value={formState.footerContactPhone || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
              <button type="submit" disabled={isUpdatingSettings || isUploading} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">{isUpdatingSettings || isUploading ? 'Saving...' : 'Save All Text Changes'}</button>
            </form>
          )
        )}
        {activeTab === 'footerLinks' && (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <form onSubmit={handleCreateLink} className="border-b pb-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">Add New Quick Link</h3>
              <div className="flex flex-col sm:flex-row gap-4"><input type="text" placeholder="Link Title" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="w-full px-3 py-2 border rounded" /><input type="text" placeholder="URL" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="w-full px-3 py-2 border rounded" /><button type="submit" disabled={isCreatingLink} className="bg-green-500 text-white px-4 py-2 rounded whitespace-nowrap">{isCreatingLink ? 'Adding...' : 'Add Link'}</button></div>
            </form>
            <h3 className="text-lg font-semibold">Existing Links</h3>
            {isLoadingLinks ? <Loader /> : linksError ? <Message variant="error">{linksError?.data?.message || linksError.error}</Message> : (
              <ul className="divide-y divide-gray-200">{links && links.length > 0 ? links.map(link => (<li key={link._id} className="py-2">{editingLink?._id === link._id ? (<form onSubmit={handleUpdateLink} className="flex flex-col sm:flex-row gap-2 items-center"><input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-1 border rounded" /><input type="text" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="w-full px-3 py-1 border rounded" /><button type="submit" disabled={isUpdatingLink} className="bg-blue-500 text-white px-3 py-1 rounded whitespace-nowrap">{isUpdatingLink ? '...' : 'Save'}</button><button type="button" onClick={() => setEditingLink(null)} className="bg-gray-200 px-3 py-1 rounded whitespace-nowrap">Cancel</button></form>) : (<div className="flex justify-between items-center"><div><p className="font-medium">{link.title}</p><p className="text-sm text-gray-500">{link.url}</p></div><div className="flex items-center space-x-2"><button onClick={() => handleEditClick(link)} className="p-2 hover:bg-gray-100 rounded-full"><FaEdit /></button><button onClick={() => handleDeleteLink(link._id)} disabled={isDeletingLink} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><FaTrash /></button></div></div>)}</li>)) : <Message>No quick links created yet.</Message>}</ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminDashboardScreen;