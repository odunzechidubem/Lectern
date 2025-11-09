// /client/src/screens/ProfileScreen.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, clearCredentials } from '../slices/authSlice';
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useRequestEmailChangeMutation,
  useLogoutMutation,
} from '../slices/usersApiSlice';
import { useUploadFileMutation } from '../slices/uploadApiSlice';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Meta from '../components/Meta';
import { USER_ROLES } from '../constants';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();
  const [uploadFile, { isLoading: isUploadingPhoto }] = useUploadFileMutation();
  const [requestEmailChange, { isLoading: isRequestingEmailChange }] = useRequestEmailChangeMutation();
  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
      setProfileImage(userInfo.profileImage || '');
    }
  }, [userInfo]);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(clearCredentials());
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error('Failed to log out.');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const isEmailChanged = email !== userInfo.email;
    try {
      if (!isEmailChanged) {
        const res = await updateProfile({ name }).unwrap();
        dispatch(setCredentials({ ...userInfo, ...res }));
        toast.success('Profile name updated successfully');
      } else {
        const res = await requestEmailChange({ newEmail: email }).unwrap();
        toast.info(res.message);
        if (name !== userInfo.name) {
          const nameUpdateRes = await updateProfile({ name }).unwrap();
          dispatch(setCredentials({ ...userInfo, ...nameUpdateRes }));
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploadRes = await uploadFile(formData).unwrap();
      const updatedUser = await updateProfile({
        profileImage: uploadRes.url,
        profileImagePublicId: uploadRes.publicId,
      }).unwrap();
      dispatch(setCredentials(updatedUser));
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      return toast.error('New passwords do not match');
    }
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success('Password changed successfully. Please log in again.');
      logoutHandler();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure? This action is permanent and cannot be undone.')) {
      try {
        await deleteAccount().unwrap();
        dispatch(clearCredentials());
        toast.success('Account deleted successfully');
        navigate('/');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Meta title="My Profile | Lectern" />
      <h1 className="mb-8 text-3xl font-bold text-gray-800">My Profile</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
          <div className="text-center">
            <img
              src={profileImage || `https://ui-avatars.com/api/?name=${name.split(' ').join('+')}&background=random`}
              alt="Profile"
              className="object-cover w-32 h-32 mx-auto mb-4 border-4 border-gray-200 rounded-full"
            />
            <label
              htmlFor="photo-upload"
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded cursor-pointer hover:bg-gray-300"
            >
              {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
            </label>
            <input
              type="file"
              id="photo-upload"
              className="hidden"
              onChange={handlePhotoUpload}
              accept="image/*"
            />
          </div>
          <form onSubmit={handleProfileUpdate}>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            {/* --- DEFINITIVE FIX: Conditionally disable email input for admin --- */}
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
                disabled={userInfo && userInfo.role === USER_ROLES.SUPER_ADMIN}
              />
              {userInfo && userInfo.role === USER_ROLES.SUPER_ADMIN && (
                <p className="mt-1 text-xs text-gray-500">
                  Admin email cannot be changed from the profile page.
                </p>
              )}
            </div>
            {/* --- END OF FIX --- */}

            <button
              type="submit"
              disabled={isUpdatingProfile || isRequestingEmailChange}
              className="w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              {isUpdatingProfile || isRequestingEmailChange ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="relative mb-4">
                <label className="block mb-2 text-gray-700">Current Password</label>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 top-7"
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="relative mb-4">
                <label className="block mb-2 text-gray-700">New Password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 top-7"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="relative mb-4">
                <label className="block mb-2 text-gray-700">Confirm New Password</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 top-7"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2 text-white bg-orange-500 rounded hover:bg-orange-600"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          {userInfo && userInfo.role !== USER_ROLES.SUPER_ADMIN && (
            <div className="p-6 bg-white border-2 border-red-300 rounded-lg shadow-md">
              <h2 className="mb-4 text-2xl font-bold text-red-600">Danger Zone</h2>
              <p className="mb-4 text-gray-600">
                Deleting your account is a permanent action. All your data will be lost.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="w-full py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                {isDeletingAccount ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;