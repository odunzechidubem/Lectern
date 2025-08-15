import Loader from './Loader'; // <-- import existing Loader

const FullScreenLoader = ({ message = 'Loading Platform...' }) => {
  return (
    // This div covers the entire screen with a dark background
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-gray-800">
      
      {/* Reusing Loader component */}
      <Loader />
      
      <p className="mt-4 text-lg text-white">{message}</p>
    </div>
  );
};

export default FullScreenLoader;