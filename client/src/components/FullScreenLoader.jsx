import Loader from './Loader';
import PropTypes from 'prop-types'; // Corrected: Import PropTypes

const FullScreenLoader = ({ message }) => {
  return (
    // This div covers the entire screen with a dark background
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center w-screen h-screen bg-gray-800">
      {/* Reusing Loader component */}
      <Loader />
      <p className="mt-4 text-lg text-white">{message}</p>
    </div>
  );
};

// Corrected: Add prop validation
FullScreenLoader.propTypes = {
  message: PropTypes.string,
};

// Corrected: Provide default prop in a standard way
FullScreenLoader.defaultProps = {
  message: 'Loading Platform...',
};

export default FullScreenLoader;