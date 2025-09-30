// src/components/LanguageSelector.jsx

import { useEffect } from 'react';

const LanguageSelector = () => {
  // This effect runs after the component mounts to find the Google widget
  // and apply our custom styles to it.
  useEffect(() => {
    // We use a timer to ensure the Google script has had time to initialize and render the widget.
    const timer = setTimeout(() => {
      const googleTranslateFrame = document.querySelector('.goog-te-gadget-simple');
      
      // Corrected: Add null check before accessing properties
      if (googleTranslateFrame) {
        googleTranslateFrame.style.backgroundColor = 'transparent';
        googleTranslateFrame.style.border = 'none';

        const googleTranslateText = googleTranslateFrame.querySelector('.goog-te-menu-value span');
        
        // Corrected: Add null check for the inner span as well
        if (googleTranslateText) {
          googleTranslateText.style.color = 'white'; // Make the dropdown text white
          googleTranslateText.style.fontWeight = '500';
        }
      }
    }, 1500); // Wait 1.5 seconds to be safe

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs only once on mount

  // This component doesn't render anything itself. It's a placeholder for logic.
  // The actual widget is moved into the Header component via DOM manipulation.
  return null;
};

export default LanguageSelector;