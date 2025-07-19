import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    // The main card container
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
      {/* The content area */}
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4">
          Created by: {course.lecturer?.name || 'Unknown'}
        </p>
        
        {/* --- THIS IS THE FIX --- */}
        {/* We use line-clamp to truncate the text to 3 lines */}
        {/* We also add break-words to handle long, unbroken strings */}
        <p className="text-gray-700 mb-4 h-20 overflow-hidden line-clamp-3 break-words">
          {course.description}
        </p>
      </div>
      
      {/* The "View Course" button at the bottom */}
      <div className="p-6 pt-0">
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