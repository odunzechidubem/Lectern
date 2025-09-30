import { Link } from 'react-router-dom';
import PropTypes from 'prop-types'; // Corrected: Import PropTypes for validation

const CourseCard = ({ course }) => {
  return (
    // The main card container
    <div className="flex flex-col overflow-hidden transition-transform duration-300 transform bg-white rounded-lg shadow-md hover:-translate-y-1">
      {/* The content area */}
      <div className="flex-grow p-6">
        <h3 className="mb-2 text-xl font-bold text-gray-800">{course.title}</h3>
        <p className="mb-4 text-sm text-gray-600">
          Created by: {course.lecturer?.name || 'Unknown'}
        </p>

        {/* --- THIS IS THE FIX --- */}
        {/* We use line-clamp to truncate the text to 3 lines */}
        {/* We also add break-words to handle long, unbroken strings */}
        <p className="h-20 mb-4 overflow-hidden text-gray-700 break-words whitespace-pre-wrap line-clamp-3">
          {course.description}
        </p>
      </div>

      {/* The "View Course" button at the bottom */}
      <div className="p-6 pt-0">
        <Link
          to={`/course/${course._id}`}
          className="inline-block px-4 py-2 font-semibold text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
        >
          View Course
        </Link>
      </div>
    </div>
  );
};

// Corrected: Add prop validation for better component contract
CourseCard.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    lecturer: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
};

export default CourseCard;