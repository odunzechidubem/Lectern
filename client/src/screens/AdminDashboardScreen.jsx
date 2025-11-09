// /src/screens/AdminDashboardScreen.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  useGetUsersByRoleQuery,
  useToggleUserStatusMutation,
  useDeleteUserByIdMutation,
  useGetAllCoursesQuery,
  useDeleteCourseByIdMutation,
} from "../slices/adminApiSlice";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../slices/settingsApiSlice";
import { useUploadFileMutation } from "../slices/uploadApiSlice";
import {
  useGetFooterLinksQuery,
  useCreateFooterLinkMutation,
  useUpdateFooterLinkMutation,
  useDeleteFooterLinkMutation,
} from "../slices/footerLinksApiSlice";
import {
  useGetArticlesQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
} from "../slices/articlesApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import {
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
  FaUserShield,
  FaCog,
  FaUsers,
  FaPalette,
  FaLink,
  FaEdit,
  FaFileAlt,
} from "react-icons/fa";

const AdminDashboardScreen = () => {
  // ... (all state definitions remain the same) ...
  const [activeTab, setActiveTab] = useState("userManagement");
  const [activeUserTab, setActiveUserTab] = useState("lecturers");
  const {
    data: users,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useGetUsersByRoleQuery(
    activeUserTab === "lecturers" ? "lecturer" : "student"
  );
  const [toggleUserStatus, { isLoading: isToggling }] =
    useToggleUserStatusMutation();
  const [deleteUserById, { isLoading: isDeletingUser }] =
    useDeleteUserByIdMutation();
  const {
    data: courses,
    isLoading: isLoadingCourses,
    error: coursesError,
    refetch: refetchCourses,
  } = useGetAllCoursesQuery();
  const [deleteCourseById, { isLoading: isDeletingCourse }] =
    useDeleteCourseByIdMutation();
  const {
    data: settings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = useGetSettingsQuery();
  const [updateSystemSettings, { isLoading: isUpdatingSettings }] =
    useUpdateSettingsMutation();
  const [uploadFile, { isLoading: isUploadingSmallFile }] =
    useUploadFileMutation();
  const {
    data: links,
    isLoading: isLoadingLinks,
    error: linksError,
    refetch: refetchLinks,
  } = useGetFooterLinksQuery();
  const [createLink, { isLoading: isCreatingLink }] =
    useCreateFooterLinkMutation();
  const [updateLink, { isLoading: isUpdatingLink }] =
    useUpdateFooterLinkMutation();
  const [deleteLink, { isLoading: isDeletingLink }] =
    useDeleteFooterLinkMutation();
  const {
    data: articles,
    isLoading: isLoadingArticles,
    error: articlesError,
    refetch: refetchArticles,
  } = useGetArticlesQuery();
  const [createArticle, { isLoading: isCreatingArticle }] =
    useCreateArticleMutation();
  const [updateArticle, { isLoading: isUpdatingArticle }] =
    useUpdateArticleMutation();
  const [deleteArticle, { isLoading: isDeletingArticle }] =
    useDeleteArticleMutation();
  const [formState, setFormState] = useState({});
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [editingLink, setEditingLink] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [articleDescription, setArticleDescription] = useState("");
  const [articleFile, setArticleFile] = useState(null);
  const [articlePublicPages, setArticlePublicPages] = useState(1);
  const [articleContactEmail, setArticleContactEmail] = useState("");
  const [articleContactPhone, setArticleContactPhone] = useState("");
  const [editingArticle, setEditingArticle] = useState(null);
  const [editArticleForm, setEditArticleForm] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormState(settings);
    }
  }, [settings]);

  const handleToggle = async (userId) => {
    try {
      await toggleUserStatus(userId).unwrap();
      toast.success("User status updated");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteUserById(userId).unwrap();
        toast.success("User deleted");
        refetchUsers();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteCourseById(courseId).unwrap();
        toast.success("Course deleted");
        refetchCourses();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const handleStudentRegToggle = async () => {
    if (!settings) return;
    try {
      await updateSystemSettings({
        isStudentRegistrationEnabled: !settings.isStudentRegistrationEnabled,
      }).unwrap();
      toast.success("Student registration setting updated");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleLecturerRegToggle = async () => {
    if (!settings) return;
    try {
      await updateSystemSettings({
        isLecturerRegistrationEnabled: !settings.isLecturerRegistrationEnabled,
      }).unwrap();
      toast.success("Lecturer registration setting updated");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // --- DEFINITIVE FIX: Send all necessary data to the backend ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // The uploadFile mutation hook returns url, publicId, and resourceType
      const res = await uploadFile(formData).unwrap();

      // Dynamically create the field names for the URL, public ID, and resource type
      const urlField = e.target.name; // e.g., 'logoUrl'
      const baseName = urlField.replace("Url", ""); // e.g., 'logo'
      const publicIdField = `${baseName}PublicId`; // e.g., 'logoPublicId'
      const resourceTypeField = `${baseName}ResourceType`; // e.g., 'logoResourceType'

      // Send all three pieces of information to the update endpoint
      await updateSystemSettings({
        [urlField]: res.url,
        [publicIdField]: res.publicId,
        [resourceTypeField]: res.resourceType, // Send the resource type
      }).unwrap();

      toast.success(`${e.target.dataset.label} updated successfully`);
      refetchSettings();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };
  // --- END OF FIX ---

  const handleSubmitContent = async (e) => {
    e.preventDefault();
    try {
      await updateSystemSettings(formState).unwrap();
      toast.success("Site content updated");
      refetchSettings();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleInputChange = (e) =>
    setFormState({ ...formState, [e.target.name]: e.target.value });

  const handleCreateLink = async (e) => {
    e.preventDefault();
    try {
      await createLink({ title: newLinkTitle, url: newLinkUrl }).unwrap();
      toast.success("Link created");
      setNewLinkTitle("");
      setNewLinkUrl("");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleDeleteLink = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteLink(id).unwrap();
        toast.success("Link deleted");
        refetchLinks();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const handleEditClick = (link) => {
    setEditingLink(link);
    setEditTitle(link.title);
    setEditUrl(link.url);
  };

  const handleUpdateLink = async (e) => {
    e.preventDefault();
    try {
      await updateLink({
        linkId: editingLink._id,
        title: editTitle,
        url: editUrl,
      }).unwrap();
      toast.success("Link updated");
      setEditingLink(null);
      refetchLinks();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    if (!articleFile) {
      return toast.error("An Article PDF File is required.");
    }
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = "lms_unsigned_preset";
    if (!cloudName) {
      toast.error("Upload configuration error. Please contact support.");
      console.error(
        "VITE_CLOUDINARY_CLOUD_NAME environment variable is not set."
      );
      return;
    }
    setIsUploading(true);
    const uploadToastId = toast.info("Uploading article PDF...", {
      autoClose: false,
      closeButton: false,
    });
    try {
      const formData = new FormData();
      formData.append("file", articleFile);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "lms_uploads");
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
      const cloudinaryResponse = await axios.post(cloudinaryUrl, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            toast.update(uploadToastId, {
              render: `Uploading PDF: ${percentCompleted}%`,
            });
          }
        },
      });
      const { secure_url: fileUrl, public_id: filePublicId } =
        cloudinaryResponse.data;
      toast.update(uploadToastId, { render: "Saving article..." });
      await createArticle({
        title: articleTitle,
        description: articleDescription,
        fileUrl,
        filePublicId,
        publicPages: articlePublicPages,
        contactEmail: articleContactEmail,
        contactPhone: articleContactPhone,
      }).unwrap();
      toast.dismiss(uploadToastId);
      toast.success("Article created successfully!");
      refetchArticles();
      setArticleTitle("");
      setArticleDescription("");
      setArticleFile(null);
      setArticlePublicPages(1);
      setArticleContactEmail("");
      setArticleContactPhone("");
      if (document.getElementById("articleFile")) {
        document.getElementById("articleFile").value = null;
      }
    } catch (err) {
      toast.dismiss(uploadToastId);
      console.error("Article creation failed:", err);
      toast.error(err.response?.data?.message || "Failed to create article.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteArticle(id).unwrap();
        toast.success("Article deleted");
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const handleEditArticleClick = (article) => {
    setEditingArticle(article);
    setEditArticleForm({
      title: article.title,
      description: article.description,
      publicPages: article.publicPages,
      contactEmail: article.contactEmail,
      contactPhone: article.contactPhone,
    });
  };

  const handleUpdateArticle = async (e) => {
    e.preventDefault();
    try {
      await updateArticle({
        articleId: editingArticle._id,
        ...editArticleForm,
      }).unwrap();
      toast.success("Article updated");
      setEditingArticle(null);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const tabs = [
    { key: "userManagement", label: "User Management", icon: FaUsers },
    { key: "courseManagement", label: "Course Management", icon: FaBook },
    { key: "articles", label: "Articles", icon: FaFileAlt },
    { key: "userSettings", label: "User Settings", icon: FaCog },
    { key: "siteContent", label: "Site Content", icon: FaPalette },
    { key: "footerLinks", label: "Footer Links", icon: FaLink },
  ];

  return (
    <div>
      <div className="flex flex-col mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center text-3xl font-bold text-gray-800">
          <FaUserShield className="mr-3" /> Admin Dashboard
        </h1>
        <div className="mt-4 sm:mt-0 sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.key} value={tab.key}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="hidden mb-4 border-b border-gray-200 sm:block">
        <nav className="flex flex-wrap -mb-px gap-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${
                activeTab === tab.key
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500"
              } py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {/* User Management Tab */}
        {activeTab === "userManagement" && (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="mb-4 border-b border-gray-200">
              <nav className="flex -mb-px space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveUserTab("lecturers")}
                  className={`${
                    activeUserTab === "lecturers"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500"
                  } py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  Manage Lecturers
                  {activeUserTab === "lecturers" && users && (
                    <span className="text-xs font-semibold text-gray-500">
                      ({users.length})
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveUserTab("students")}
                  className={`${
                    activeUserTab === "students"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500"
                  } py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  Manage Students
                  {activeUserTab === "students" && users && (
                    <span className="text-xs font-semibold text-gray-500">
                      ({users.length})
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {isLoadingUsers ? (
              <Loader />
            ) : usersError ? (
              <Message variant="error">
                {usersError?.data?.message || usersError.error}
              </Message>
            ) : (
              <ul className="divide-y divide-gray-200">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <li
                      key={user._id}
                      className="flex flex-col justify-between p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center">
                        <img
                          src={
                            user.profileImage ||
                            `https://ui-avatars.com/api/?name=${user.name
                              .split(" ")
                              .join("+")}&background=random`
                          }
                          alt="Profile"
                          className="object-cover w-10 h-10 mr-4 rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center mt-4 space-x-2 self-start sm:self-center sm:space-x-4 sm:mt-0">
                        <div
                          className={`flex items-center text-sm ${
                            user.isActive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {user.isActive ? (
                            <FaCheckCircle className="mr-1" />
                          ) : (
                            <FaTimesCircle className="mr-1" />
                          )}
                          {user.isActive ? "Active" : "Disabled"}
                        </div>
                        <button
                          onClick={() => handleToggle(user._id)}
                          disabled={isToggling}
                          className="px-3 py-1 text-xs text-white bg-yellow-500 rounded hover:bg-yellow-600"
                        >
                          {user.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={isDeletingUser}
                          className="p-2 text-xs text-white bg-red-600 rounded-full hover:bg-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <Message>No {activeUserTab} found.</Message>
                )}
              </ul>
            )}
          </div>
        )}
        {/* Course Management Tab */}
        {activeTab === "courseManagement" && (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Course Management
              </h2>
              {courses && (
                <span className="text-sm font-semibold text-gray-600">
                  Total Courses: {courses.length}
                </span>
              )}
            </div>
            {isLoadingCourses ? (
              <Loader />
            ) : coursesError ? (
              <Message variant="error">
                {coursesError?.data?.message || coursesError.error}
              </Message>
            ) : (
              <ul className="divide-y divide-gray-200">
                {courses && courses.length > 0 ? (
                  courses.map((course) => (
                    <li
                      key={course._id}
                      className="flex flex-col justify-between p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {course.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          Lecturer: {course.lecturer?.name || "N/A"}
                        </p>
                      </div>
                      <div className="mt-4 sm:mt-0">
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          disabled={isDeletingCourse}
                          className="p-2 text-xs text-white bg-red-600 rounded-full hover:bg-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <Message>No courses found on the platform.</Message>
                )}
              </ul>
            )}
          </div>
        )}
        {/* Articles Tab */}
        {activeTab === "articles" && (
          <div className="space-y-6">
            <form
              onSubmit={handleCreateArticle}
              className="p-6 space-y-4 bg-white rounded-lg shadow-md"
            >
              <h2 className="text-2xl font-bold">Create New Article</h2>
              <div>
                <label
                  htmlFor="articleTitle"
                  className="block mb-1 font-bold text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="articleTitle"
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="articleDescription"
                  className="block mb-1 font-bold text-gray-700"
                >
                  Description
                </label>
                <textarea
                  rows="3"
                  id="articleDescription"
                  value={articleDescription}
                  onChange={(e) => setArticleDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="articleFile"
                  className="block mb-1 font-bold text-gray-700"
                >
                  Article PDF File
                </label>
                <input
                  type="file"
                  id="articleFile"
                  onChange={(e) => setArticleFile(e.target.files[0])}
                  className="w-full"
                  accept=".pdf"
                />
              </div>
              <div>
                <label
                  htmlFor="articlePublicPages"
                  className="block mb-1 font-bold text-gray-700"
                >
                  Number of Public Pages
                </label>
                <input
                  type="number"
                  min="1"
                  id="articlePublicPages"
                  value={articlePublicPages}
                  onChange={(e) =>
                    setArticlePublicPages(Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="articleContactEmail"
                  className="block mb-1 font-bold text-gray-700"
                >
                  Contact Email for Full Version
                </label>
                <input
                  type="email"
                  id="articleContactEmail"
                  value={articleContactEmail}
                  onChange={(e) => setArticleContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="articleContactPhone"
                  className="block mb-1 font-bold text-gray-700"
                >
                  Contact Phone for Full Version
                </label>
                <input
                  type="tel"
                  id="articleContactPhone"
                  value={articleContactPhone}
                  onChange={(e) => setArticleContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isCreatingArticle || isUploading}
                className="w-full py-2 text-white bg-blue-500 rounded"
              >
                {isCreatingArticle || isUploading
                  ? "Processing..."
                  : "Create Article"}
              </button>
            </form>
            <div className="p-6 space-y-4 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Existing Articles</h2>
                {articles && (
                  <span className="text-sm font-semibold text-gray-600">
                    Total Articles: {articles.length}
                  </span>
                )}
              </div>

              {isLoadingArticles ? (
                <Loader />
              ) : articlesError ? (
                <Message variant="error">
                  {articlesError.data?.message || articlesError.error}
                </Message>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {articles && articles.length > 0 ? (
                    articles.map((article) => (
                      <li key={article._id} className="py-4">
                        {editingArticle?._id === article._id ? (
                          <form
                            onSubmit={handleUpdateArticle}
                            className="space-y-2"
                          >
                            <input
                              type="text"
                              value={editArticleForm.title}
                              onChange={(e) =>
                                setEditArticleForm({
                                  ...editArticleForm,
                                  title: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border rounded"
                            />
                            <textarea
                              rows="2"
                              value={editArticleForm.description}
                              onChange={(e) =>
                                setEditArticleForm({
                                  ...editArticleForm,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border rounded"
                            />
                            <input
                              type="number"
                              min="1"
                              value={editArticleForm.publicPages}
                              onChange={(e) =>
                                setEditArticleForm({
                                  ...editArticleForm,
                                  publicPages: Number(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1 border rounded"
                            />
                            <input
                              type="email"
                              value={editArticleForm.contactEmail}
                              onChange={(e) =>
                                setEditArticleForm({
                                  ...editArticleForm,
                                  contactEmail: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border rounded"
                            />
                            <input
                              type="tel"
                              value={editArticleForm.contactPhone}
                              onChange={(e) =>
                                setEditArticleForm({
                                  ...editArticleForm,
                                  contactPhone: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border rounded"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={isUpdatingArticle}
                                className="px-3 py-1 text-sm text-white bg-green-500 rounded"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingArticle(null)}
                                className="px-3 py-1 text-sm bg-gray-200 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {article.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {article.publicPages} pages visible
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditArticleClick(article)}
                                className="p-2 rounded-full hover:bg-gray-100"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(article._id)}
                                disabled={isDeletingArticle}
                                className="p-2 text-red-500 rounded-full hover:bg-red-100"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))
                  ) : (
                    <Message>No articles have been created.</Message>
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
        {/* User Settings Tab */}
        {activeTab === "userSettings" &&
          (isLoadingSettings ? (
            <Loader />
          ) : (
            <div className="p-6 space-y-4 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-gray-700">Allow Student Registration:</p>
                <button
                  onClick={handleStudentRegToggle}
                  disabled={isUpdatingSettings}
                  className={`w-28 text-center px-4 py-2 rounded-full font-semibold text-white ${
                    settings?.isStudentRegistrationEnabled
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {isUpdatingSettings
                    ? "..."
                    : settings?.isStudentRegistrationEnabled
                    ? "Enabled"
                    : "Disabled"}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-700">Allow Lecturer Registration:</p>
                <button
                  onClick={handleLecturerRegToggle}
                  disabled={isUpdatingSettings}
                  className={`w-28 text-center px-4 py-2 rounded-full font-semibold text-white ${
                    settings?.isLecturerRegistrationEnabled
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {isUpdatingSettings
                    ? "..."
                    : settings?.isLecturerRegistrationEnabled
                    ? "Enabled"
                    : "Disabled"}
                </button>
              </div>
            </div>
          ))}
        {/* Site Content Tab */}
        {activeTab === "siteContent" &&
          (isLoadingSettings ? (
            <Loader />
          ) : (
            <form
              onSubmit={handleSubmitContent}
              className="p-6 space-y-6 bg-white rounded-lg shadow-md"
            >
              <h3 className="text-xl font-bold">General Settings</h3>
              <div>
                <label className="block mb-2 font-bold text-gray-700">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={formState.siteName || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-bold text-gray-700">
                  Logo
                </label>
                <img
                  src={formState.logoUrl || "/logo.png"}
                  alt="Logo Preview"
                  className="h-12 p-1 mb-2 bg-gray-200 rounded w-auto"
                />
                <input
                  type="file"
                  name="logoUrl"
                  data-label="Logo"
                  onChange={handleFileUpload}
                  className="w-full"
                  accept="image/*"
                />
              </div>
              <div>
                <label className="block mb-2 font-bold text-gray-700">
                  Favicon
                </label>
                <img
                  src={formState.faviconUrl || "/vite.svg"}
                  alt="Favicon Preview"
                  className="w-8 h-8 p-1 mb-2 bg-gray-200 rounded"
                />
                <input
                  type="file"
                  name="faviconUrl"
                  data-label="Favicon"
                  onChange={handleFileUpload}
                  className="w-full"
                  accept="image/png, image/svg+xml, image/x-icon"
                />
              </div>
              <hr />
              <h3 className="text-xl font-bold">Home Page (Hero Section)</h3>
              <div>
                <label className="block mb-2 font-bold text-gray-700">
                  Hero Title
                </label>
                <input
                  type="text"
                  name="heroTitle"
                  value={formState.heroTitle || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-bold text-gray-700">
                  Hero Text
                </label>
                <textarea
                  name="heroText"
                  rows="3"
                  value={formState.heroText || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-bold text-gray-700">
                  Hero Image
                </label>
                <img
                  src={formState.heroImageUrl || ""}
                  alt="Hero Preview"
                  className="object-cover w-auto h-32 mb-2 rounded"
                />
                <input
                  type="file"
                  name="heroImageUrl"
                  data-label="Hero Image"
                  onChange={handleFileUpload}
                  className="w-full"
                  accept="image/*"
                />
              </div>
              <hr />
              <h3 className="text-xl font-bold">About Us Page</h3>
              <div>
                <label className="block mb-2 font-bold text-gray-700">
                  About Us Title
                </label>
                <input
                  type="text"
                  name="aboutUsTitle"
                  value={formState.aboutUsTitle || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-bold text-gray-700">
                  About Us Text
                </label>
                <textarea
                  name="aboutUsText"
                  rows="5"
                  value={formState.aboutUsText || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-bold text-gray-700">
                  About Us Image
                </label>
                <img
                  src={formState.aboutUsImageUrl || ""}
                  alt="About Us Preview"
                  className="object-cover w-auto h-32 mb-2 rounded"
                />
                <input
                  type="file"
                  name="aboutUsImageUrl"
                  data-label="About Us Image"
                  onChange={handleFileUpload}
                  className="w-full"
                  accept="image/*"
                />
              </div>
              <hr />
              <h3 className="text-xl font-bold">Footer Settings</h3>
              <div>
                <label className="block mb-2 font-bold text-gray-700">
                  Footer About Text
                </label>
                <input
                  type="text"
                  name="footerAboutText"
                  value={formState.footerAboutText || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-bold text-gray-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="footerContactEmail"
                  value={formState.footerContactEmail || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 font-bold text-gray-700">
                  Contact Phone
                </label>
                <input
                  type="text"
                  name="footerContactPhone"
                  value={formState.footerContactPhone || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingSettings || isUploading}
                className="w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                {isUpdatingSettings || isUploading
                  ? "Saving..."
                  : "Save All Text Changes"}
              </button>
            </form>
          ))}
        {/* Footer Links Tab */}
        {activeTab === "footerLinks" && (
          <div className="p-6 space-y-6 bg-white rounded-lg shadow-md">
            <form onSubmit={handleCreateLink} className="pb-6 mb-6 border-b">
              <h3 className="mb-2 text-lg font-semibold">Add New Quick Link</h3>
              <div className="flex flex-col gap-4 sm:flex-row">
                <input
                  type="text"
                  placeholder="Link Title"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
                <button
                  type="submit"
                  disabled={isCreatingLink}
                  className="px-4 py-2 text-white bg-green-500 rounded whitespace-nowrap"
                >
                  {isCreatingLink ? "Adding..." : "Add Link"}
                </button>
              </div>
            </form>
            <h3 className="text-lg font-semibold">Existing Links</h3>
            {isLoadingLinks ? (
              <Loader />
            ) : linksError ? (
              <Message variant="error">
                {linksError?.data?.message || linksError.error}
              </Message>
            ) : (
              <ul className="divide-y divide-gray-200">
                {links && links.length > 0 ? (
                  links.map((link) => (
                    <li key={link._id} className="py-2">
                      {editingLink?._id === link._id ? (
                        <form
                          onSubmit={handleUpdateLink}
                          className="flex flex-col items-center gap-2 sm:flex-row"
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-1 border rounded"
                          />
                          <input
                            type="text"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="w-full px-3 py-1 border rounded"
                          />
                          <button
                            type="submit"
                            disabled={isUpdatingLink}
                            className="px-3 py-1 text-white bg-blue-500 rounded whitespace-nowrap"
                          >
                            {isUpdatingLink ? "..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingLink(null)}
                            className="px-3 py-1 bg-gray-200 rounded whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{link.title}</p>
                            <p className="text-sm text-gray-500">{link.url}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditClick(link)}
                              className="p-2 rounded-full hover:bg-gray-100"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteLink(link._id)}
                              disabled={isDeletingLink}
                              className="p-2 text-red-500 rounded-full hover:bg-red-100"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <Message>No quick links created yet.</Message>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardScreen;