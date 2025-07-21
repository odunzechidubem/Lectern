import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useGetUsersByRoleQuery, useToggleUserStatusMutation, useDeleteUserByIdMutation } from '../slices/adminApiSlice';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../slices/settingsApiSlice';
import { useUploadFileMutation } from '../slices/uploadApiSlice';
import { useGetFooterLinksQuery, useCreateFooterLinkMutation, useUpdateFooterLinkMutation, useDeleteFooterLinkMutation } from '../slices/footerLinksApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaCheckCircle, FaTimesCircle, FaTrash, FaUserShield, FaCog, FaUsers, FaPalette, FaLink, FaEdit } from 'react-icons/fa';

// --- Sub-component for User Management Tab ---
const UserManagementTab = () => {
  const [activeUserTab, setActiveUserTab] = useState('lecturers');
  const { data: users, isLoading, error, refetch } = useGetUsersByRoleQuery(activeUserTab === 'lecturers' ? 'lecturer' : 'student');
  const [toggleUserStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();
  const [deleteUserById, { isLoading: isDeleting }] = useDeleteUserByIdMutation();

  const handleToggle = async (userId) => { try { await toggleUserStatus(userId).unwrap(); toast.success('User status updated'); } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleDelete = async (userId) => { if (window.confirm('Are you sure?')) { try { await deleteUserById(userId).unwrap(); toast.success('User deleted'); refetch(); } catch (err) { toast.error(err?.data?.message || err.error); } } };

  return (
    <div>
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveUserTab('lecturers')} className={`${activeUserTab === 'lecturers' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Manage Lecturers</button>
          <button onClick={() => setActiveUserTab('students')} className={`${activeUserTab === 'students' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}>Manage Students</button>
        </nav>
      </div>
      {isLoading ? <Loader /> : error ? <Message variant="error">{error?.data?.message || error.error}</Message> : (
        <div className="bg-white shadow-md rounded-lg">
          <ul className="divide-y divide-gray-200">
            {users && users.length > 0 ? (
              users.map(user => (
                <li key={user._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center">
                  <div className="flex items-center">
                    <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name.split(' ').join('+')}&background=random`} alt="Profile" className="w-10 h-10 rounded-full mr-4 object-cover" />
                    <div><p className="font-semibold text-gray-800">{user.name}</p><p className="text-sm text-gray-600">{user.email}</p></div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                    <div className={`flex items-center text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>{user.isActive ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}{user.isActive ? 'Active' : 'Disabled'}</div>
                    <button onClick={() => handleToggle(user._id)} disabled={isToggling} className="bg-yellow-500 text-white text-xs py-1 px-3 rounded hover:bg-yellow-600">{user.isActive ? 'Disable' : 'Enable'}</button>
                    <button onClick={() => handleDelete(user._id)} disabled={isDeleting} className="bg-red-600 text-white text-xs p-2 rounded-full hover:bg-red-700"><FaTrash /></button>
                  </div>
                </li>
              ))
            ) : <Message>No {activeUserTab} found.</Message>}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- Sub-component for User Settings Tab ---
const UserSettingsTab = () => {
  const { data: settings, isLoading: isLoadingSettings } = useGetSettingsQuery();
  const [updateSystemSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();

  const handleStudentRegToggle = async () => { try { await updateSystemSettings({ isStudentRegistrationEnabled: !settings.isStudentRegistrationEnabled }).unwrap(); toast.success('Student registration setting updated'); } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleLecturerRegToggle = async () => { try { await updateSystemSettings({ isLecturerRegistrationEnabled: !settings.isLecturerRegistrationEnabled }).unwrap(); toast.success('Lecturer registration setting updated'); } catch (err) { toast.error(err?.data?.message || err.error); } };

  if (isLoadingSettings) return <Loader />;
  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-700">Allow Student Registration:</p>
        <button onClick={handleStudentRegToggle} disabled={isUpdatingSettings} className={`w-28 text-center px-4 py-2 rounded-full font-semibold text-white ${settings?.isStudentRegistrationEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>{isUpdatingSettings ? '...' : settings?.isStudentRegistrationEnabled ? 'Enabled' : 'Disabled'}</button>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-gray-700">Allow Lecturer Registration:</p>
        <button onClick={handleLecturerRegToggle} disabled={isUpdatingSettings} className={`w-28 text-center px-4 py-2 rounded-full font-semibold text-white ${settings?.isLecturerRegistrationEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>{isUpdatingSettings ? '...' : settings?.isLecturerRegistrationEnabled ? 'Enabled' : 'Disabled'}</button>
      </div>
    </div>
  );
};

// --- Sub-component for Site Content Tab ---
const SiteContentTab = () => {
  const { data: settings, isLoading: isLoadingSettings, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [formState, setFormState] = useState({});

  useEffect(() => { if (settings) { setFormState(settings); } }, [settings]);
  const handleInputChange = (e) => setFormState({ ...formState, [e.target.name]: e.target.value });
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadFile(formData).unwrap();
      const updatedField = e.target.name;
      await updateSettings({ [updatedField]: res.url }).unwrap();
      toast.success(`${e.target.dataset.label} updated successfully`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };
  const handleSubmit = async (e) => { e.preventDefault(); try { await updateSettings(formState).unwrap(); toast.success('Site content updated'); refetch(); } catch (err) { toast.error(err?.data?.message || err.error); } };

  if (isLoadingSettings) return <Loader />;
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div><label className="block text-gray-700 font-bold mb-2">Site Name</label><input type="text" name="siteName" value={formState.siteName || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
      <div><label className="block text-gray-700 font-bold mb-2">Logo</label><img src={formState.logoUrl || '/logo.png'} alt="Logo Preview" className="h-12 w-auto bg-gray-200 p-1 rounded mb-2" /><input type="file" name="logoUrl" data-label="Logo" onChange={handleFileUpload} className="w-full" accept="image/*" /></div>
      <div><label className="block text-gray-700 font-bold mb-2">Hero Title</label><input type="text" name="heroTitle" value={formState.heroTitle || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
      <div><label className="block text-gray-700 font-bold mb-2">Hero Text</label><textarea name="heroText" rows="3" value={formState.heroText || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
      <div><label className="block text-gray-700 font-bold mb-2">Hero Image</label><img src={formState.heroImageUrl || ''} alt="Hero Preview" className="h-32 w-auto rounded mb-2 object-cover" /><input type="file" name="heroImageUrl" data-label="Hero Image" onChange={handleFileUpload} className="w-full" accept="image/*" /></div>
      <hr /><h3 className="text-xl font-bold">Footer Settings</h3>
      <div><label className="block text-gray-700 font-bold mb-2">Footer About Text</label><input type="text" name="footerAboutText" value={formState.footerAboutText || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
      <div><label className="block text-gray-700 font-bold mb-2">Contact Email</label><input type="email" name="footerContactEmail" value={formState.footerContactEmail || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
      <div><label className="block text-gray-700 font-bold mb-2">Contact Phone</label><input type="text" name="footerContactPhone" value={formState.footerContactPhone || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded" /></div>
      <button type="submit" disabled={isUpdating || isUploading} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">{isUpdating || isUploading ? 'Saving...' : 'Save All Text Changes'}</button>
    </form>
  );
};

// --- Sub-component for Footer Links Tab ---
const FooterLinksTab = () => {
  const { data: links, isLoading, error } = useGetFooterLinksQuery();
  const [createLink, { isLoading: isCreating }] = useCreateFooterLinkMutation();
  const [updateLink, { isLoading: isUpdating }] = useUpdateFooterLinkMutation();
  const [deleteLink, { isLoading: isDeleting }] = useDeleteFooterLinkMutation();
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [editingLink, setEditingLink] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const handleCreate = async (e) => { e.preventDefault(); try { await createLink({ title: newLinkTitle, url: newLinkUrl }).unwrap(); toast.success('Link created'); setNewLinkTitle(''); setNewLinkUrl(''); } catch (err) { toast.error(err?.data?.message || err.error); } };
  const handleDelete = async (id) => { if (window.confirm('Are you sure?')) { try { await deleteLink(id).unwrap(); toast.success('Link deleted'); } catch (err) { toast.error(err?.data?.message || err.error); } } };
  const handleEditClick = (link) => { setEditingLink(link); setEditTitle(link.title); setEditUrl(link.url); };
  const handleUpdate = async (e) => { e.preventDefault(); try { await updateLink({ linkId: editingLink._id, title: editTitle, url: editUrl }).unwrap(); toast.success('Link updated'); setEditingLink(null); } catch (err) { toast.error(err?.data?.message || err.error); } };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <form onSubmit={handleCreate} className="border-b pb-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Add New Quick Link</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input type="text" placeholder="Link Title (e.g., About Us)" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
          <input type="text" placeholder="URL (e.g., /about)" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="w-full px-3 py-2 border rounded" />
          <button type="submit" disabled={isCreating} className="bg-green-500 text-white px-4 py-2 rounded whitespace-nowrap">{isCreating ? 'Adding...' : 'Add Link'}</button>
        </div>
      </form>
      <h3 className="text-lg font-semibold">Existing Links</h3>
      {isLoading ? <Loader /> : error ? <Message variant="error">{error?.data?.message || error.error}</Message> : (
        <ul className="divide-y divide-gray-200">
          {links && links.length > 0 ? links.map(link => (
            <li key={link._id} className="py-2">
              {editingLink?._id === link._id ? (
                <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row gap-2 items-center">
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-1 border rounded" />
                  <input type="text" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="w-full px-3 py-1 border rounded" />
                  <button type="submit" disabled={isUpdating} className="bg-blue-500 text-white px-3 py-1 rounded whitespace-nowrap">{isUpdating ? '...' : 'Save'}</button>
                  <button type="button" onClick={() => setEditingLink(null)} className="bg-gray-200 px-3 py-1 rounded whitespace-nowrap">Cancel</button>
                </form>
              ) : (
                <div className="flex justify-between items-center">
                  <div><p className="font-medium">{link.title}</p><p className="text-sm text-gray-500">{link.url}</p></div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleEditClick(link)} className="p-2 hover:bg-gray-100 rounded-full"><FaEdit /></button>
                    <button onClick={() => handleDelete(link._id)} disabled={isDeleting} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><FaTrash /></button>
                  </div>
                </div>
              )}
            </li>
          )) : <Message>No quick links created yet.</Message>}
        </ul>
      )}
    </div>
  );
};


// --- Main Admin Dashboard Component ---
const AdminDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState('userManagement');
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center"><FaUserShield className="mr-3" /> Admin Dashboard</h1>
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('userManagement')} className={`${activeTab === 'userManagement' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}><FaUsers className="mr-2 inline" />User Management</button>
          <button onClick={() => setActiveTab('userSettings')} className={`${activeTab === 'userSettings' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}><FaCog className="mr-2 inline" />User Settings</button>
          <button onClick={() => setActiveTab('siteContent')} className={`${activeTab === 'siteContent' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}><FaPalette className="mr-2 inline" />Site Content</button>
          <button onClick={() => setActiveTab('footerLinks')} className={`${activeTab === 'footerLinks' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500'} py-4 px-1 border-b-2 font-medium text-sm`}><FaLink className="mr-2 inline" />Footer Links</button>
        </nav>
      </div>
      <div>
        {activeTab === 'userManagement' && <UserManagementTab />}
        {activeTab === 'userSettings' && <UserSettingsTab />}
        {activeTab === 'siteContent' && <SiteContentTab />}
        {activeTab === 'footerLinks' && <FooterLinksTab />}
      </div>
    </div>
  );
};
export default AdminDashboardScreen;