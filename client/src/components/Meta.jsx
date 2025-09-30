import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types'; // Corrected: Import PropTypes

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
    </Helmet>
  );
};

// Corrected: Add prop types for component contract
Meta.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
};

Meta.defaultProps = {
  title: 'Lectern - A Modern Learning Platform',
  description: 'A modern Learning Management System for students and lecturers, featuring courses, real-time chat, and more.',
  keywords: 'education, learning, lms, courses, chat, students, lecturers, modern, platform, online learning, classroom, virtual classroom, e-learning, study, teach, teach online, education platform, learning management system, course management, student engagement, interactive learning, real-time communication, collaborative learning, academic tools, educational technology, lectern, Lectern',
};

export default Meta;