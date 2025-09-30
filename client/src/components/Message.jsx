import PropTypes from 'prop-types'; // Corrected: Import PropTypes

const Message = ({ variant, children }) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      default:
        return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  return (
    <div className={`border px-4 py-3 rounded relative ${getVariantClass()}`} role="alert">
      {children}
    </div>
  );
};

// Corrected: Add prop validation
Message.propTypes = {
  variant: PropTypes.oneOf(['info', 'success', 'error']),
  children: PropTypes.node.isRequired,
};

Message.defaultProps = {
  variant: 'info',
};

export default Message;