// src/components/CourseCard.jsx
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4">
          Created by: {course.lecturer?.name || 'Unknown'}
        </p>
        <p className="text-gray-700 mb-4">{course.description.substring(0, 100)}...</p>
        <Link
          to={`/course/${course._id}`}
          className="inline-block bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          View Course
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;