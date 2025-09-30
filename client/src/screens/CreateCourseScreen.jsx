import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateCourseMutation } from '../slices/coursesApiSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Meta from '../components/Meta'; // Corrected: Added Meta

const CreateCourseScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const [createCourse, { isLoading }] = useCreateCourseMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await createCourse({ title, description }).unwrap();
      toast.success('Course created successfully');
      navigate('/lecturer/dashboard'); // Redirect to dashboard after creation
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div>
      <Meta title="Create New Course | Lectern" />
      <Link to="/lecturer/dashboard" className="inline-block px-4 py-2 mb-6 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
        Go Back
      </Link>
      <div className="flex justify-center">
        <form className="w-full max-w-lg p-8 mt-10 bg-white rounded shadow-md" onSubmit={submitHandler}>
          <h1 className="mb-6 text-2xl font-bold text-gray-700">Create a New Course</h1>

          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="title">Course Title</label>
            <input
              type="text"
              id="title"
              placeholder="e.g., Introduction to Web Development"
              className="w-full px-3 py-2 border rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-gray-700" htmlFor="description">Course Description</label>
            <textarea
              id="description"
              rows="5"
              placeholder="Provide a detailed description of your course..."
              className="w-full px-3 py-2 border rounded whitespace-pre-wrap"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : 'Create Course'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseScreen;