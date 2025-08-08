import { FaBook, FaEnvelope, FaPhone } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useGetSettingsQuery } from '../slices/settingsApiSlice';
import { useGetFooterLinksQuery } from '../slices/footerLinksApiSlice';

const Footer = () => {
  const { data: settings } = useGetSettingsQuery();
  const { data: links, isLoading: isLoadingLinks } = useGetFooterLinksQuery();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
          <Link to="/">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-center md:justify-start">
              <img src={settings?.logoUrl || '/logo.png'} alt="Site Logo" className="h-8 w-auto mr-2" />
              <span>{settings?.siteName || 'site name here'}</span>
            </h3>
          </Link>

            <p className="text-gray-400">{settings?.footerAboutText || 'Providing a seamless experience...'}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {/* --- THIS IS THE UPDATED LINK --- */}
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              
              {isLoadingLinks ? (
                <li>Loading...</li>
              ) : (
                links?.map(link => (
                  <li key={link._id}>
                    <Link to={link.url} className="text-gray-400 hover:text-white">{link.title}</Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center justify-center md:justify-start">
                <FaEnvelope className="mr-2" /> {settings?.footerContactEmail || 'contact@lms.com'}
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <FaPhone className="mr-2" /> {settings?.footerContactPhone || '(123) 456-7890'}
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-500">
          <p>© {currentYear} {settings?.siteName || 'site name here'}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;