import { useGetSettingsQuery } from '../slices/settingsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const AboutScreen = () => {
  const { data: settings, isLoading, error } = useGetSettingsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="error">Could not load page content.</Message>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="md:flex">
        {/* Image Section */}
        <div className="md:w-1/2">
          <img
            src={settings?.aboutUsImageUrl}
            alt="About Us"
            className="w-full h-64 md:h-full object-cover"
          />
        </div>

        {/* Text Content Section */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {settings?.aboutUsTitle}
          </h1>
          {/* Use whitespace-pre-wrap to respect newlines from the textarea */}
          <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
            {settings?.aboutUsText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;