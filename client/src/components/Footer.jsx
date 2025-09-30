import { FaBook, FaEnvelope, FaPhone, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetSettingsQuery } from '../slices/settingsApiSlice';
import { useGetFooterLinksQuery } from '../slices/footerLinksApiSlice';
import { USER_ROLES } from '../constants'; // Corrected: Import constants

const Footer = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: settings } = useGetSettingsQuery();
  const { data: links, isLoading: isLoadingLinks } = useGetFooterLinksQuery();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto text-white bg-gray-800">
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:text-left">
          {/* Logo & About */}
          <div>
            <Link to={userInfo && userInfo.role === USER_ROLES.SUPER_ADMIN ? '/admin/dashboard' : '/'}> {/* Corrected: Use constant */}
              <h3 className="flex items-center justify-center mb-4 text-lg font-bold md:justify-start">
                <img
                  src={settings?.logoUrl || '/logo.png'}
                  alt="Site Logo"
                  className="w-auto h-8 mr-2"
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
            <h3 className="mb-4 text-lg font-bold">Quick Links</h3>
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
            <h3 className="mb-4 text-lg font-bold">Contact Us</h3>
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
            <div className="flex justify-center mt-4 space-x-4 text-gray-400 md:justify-start">
              <a href={settings?.facebookUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Facebook"> {/* Corrected */}
                <FaFacebook />
              </a>
              <a href={settings?.twitterUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Twitter"> {/* Corrected */}
                <FaTwitter />
              </a>
              <a href={settings?.linkedinUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="LinkedIn"> {/* Corrected */}
                <FaLinkedin />
              </a>
              <a href={settings?.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Instagram"> {/* Corrected */}
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 mt-8 text-center text-gray-500 border-t border-gray-700">
          <p>&copy; {currentYear} {settings?.siteName || ''}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;