// src/screens/CreateCourseScreen.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateCourseMutation } from '../slices/coursesApiSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

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
      <Link to="/lecturer/dashboard" className="inline-block bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 mb-6">
        Go Back
      </Link>
      <div className="flex justify-center">
        <form className="p-8 mt-10 bg-white rounded shadow-md w-full max-w-lg" onSubmit={submitHandler}>
          <h1 className="text-2xl font-bold mb-6 text-gray-700">Create a New Course</h1>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="title">Course Title</label>
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
            <label className="block text-gray-700 mb-2" htmlFor="description">Course Description</label>
            <textarea
              id="description"
              rows="5"
              placeholder="Provide a detailed description of your course..."
              className="w-full px-3 py-2 border rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 flex justify-center items-center"
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