import { useGetSettingsQuery } from '../slices/settingsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta'; // Corrected: Added Meta for SEO

const AboutScreen = () => {
  const { data: settings, isLoading, error } = useGetSettingsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="error">{error?.data?.message || 'Could not load page content.'}</Message>;
  }

  return (
    <>
      {/* Corrected: Added dynamic title and description for the page */}
      <Meta 
        title={settings?.aboutUsTitle || 'About Us | Lectern'} 
        description={settings?.aboutUsText || ''} 
      />
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        <div className="md:flex">
          {/* Image Section */}
          <div className="md:w-1/2">
            <img
              src={settings?.aboutUsImageUrl}
              // Corrected: Fallback and more descriptive alt text
              alt={settings?.aboutUsTitle || 'About our platform'}
              className="object-cover w-full h-64 md:h-full"
            />
          </div>

          {/* Text Content Section */}
          <div className="flex flex-col justify-center p-8 md:w-1/2 md:p-12">
            <h1 className="mb-4 text-4xl font-bold text-gray-800">
              {settings?.aboutUsTitle}
            </h1>
            {/* Use whitespace-pre-wrap to respect newlines from the textarea */}
            <p className="text-lg leading-relaxed text-gray-600 whitespace-pre-wrap">
              {settings?.aboutUsText}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutScreen;