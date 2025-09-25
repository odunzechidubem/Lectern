import { FaBook, FaEnvelope, FaPhone, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetSettingsQuery } from '../slices/settingsApiSlice';
import { useGetFooterLinksQuery } from '../slices/footerLinksApiSlice';

const Footer = () => {
  const { userInfo } = useSelector((state) => state.auth);  // ✅
  const { data: settings } = useGetSettingsQuery();
  const { data: links, isLoading: isLoadingLinks } = useGetFooterLinksQuery();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          {/* Logo & About */}
          <div>
            <Link to={userInfo && userInfo.role === 'superAdmin' ? '/admin/dashboard' : '/'}>
              <h3 className="text-lg font-bold mb-4 flex items-center justify-center md:justify-start">
                <img
                  src={settings?.logoUrl || '/logo.png'}
                  alt="Site Logo"
                  className="h-8 w-auto mr-2"
                />
                <span>{settings?.siteName || ''}</span>
              </h3>
            </Link>
            <p className="text-gray-400">
              {settings?.footerAboutText || 'Providing a seamless experience...'}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              {isLoadingLinks ? (
                <li>Loading...</li>
              ) : (
                links?.map((link) => (
                  <li key={link._id}>
                    <Link to={link.url} className="text-gray-400 hover:text-white">
                      {link.title}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center justify-center md:justify-start">
      <FaEnvelope className="mr-2" />
      <a
        href={`mailto:${settings?.footerContactEmail || 'contact@lms.com'}`}
        className="hover:text-white"
      >
        {settings?.footerContactEmail || 'contact@lms.com'}
      </a>
    </li>
              <li className="flex items-center justify-center md:justify-start">
                <FaPhone className="mr-2" />
      <a
        href={`tel:${settings?.footerContactPhone || '(123) 456-7890'}`}
        className="hover:text-white"
      >
        {settings?.footerContactPhone || '(123) 456-7890'}
      </a>
              </li>
            </ul>

            {/* Social Media Icons */}
            <div className="flex justify-center md:justify-start space-x-4 mt-4 text-gray-400">
              <a href={settings?.facebookUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <FaFacebook />
              </a>
              <a href={settings?.twitterUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <FaTwitter />
              </a>
              <a href={settings?.linkedinUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <FaLinkedin />
              </a>
              <a href={settings?.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <FaInstagram />
              </a>
            </div> 
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-500">
          <p>&copy; {currentYear} {settings?.siteName || ''}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
