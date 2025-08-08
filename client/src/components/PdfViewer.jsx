import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Loader from './Loader';
import { FaEnvelope, FaPhone } from 'react-icons/fa';

// This modern syntax correctly tells Vite how to find the worker file
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PdfViewer = ({ fileUrl, publicPages, contactEmail, contactPhone }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // --- THIS IS THE RESPONSIVENESS FIX ---
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    // Check size on initial mount and on window resize
    checkSize();
    window.addEventListener('resize', checkSize);
    
    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('resize', checkSize);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount
  // --- END OF FIX ---

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
  }

  const totalVisiblePages = Math.min(numPages || publicPages, publicPages);
  const showContactMessage = currentPage >= totalVisiblePages;

  return (
    // We attach the ref to this container so we can measure its width
    <div ref={containerRef} className="pdf-container border rounded-lg overflow-hidden">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div className="flex justify-center items-center p-8"><Loader /></div>}
        error={<div className="p-4 text-center text-red-500">Failed to load PDF. Please ensure the URL is correct.</div>}
        // This option disables the default toolbar which includes print/download
        className="flex justify-center"
      >
        <Page
          pageNumber={currentPage}
          // The width prop makes the page responsive
          width={containerWidth}
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      </Document>
      
      {numPages && (
        <div className="p-2 bg-gray-100">
          <div className="flex justify-center items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <p className="mx-4 text-sm">
              Page {currentPage} of {totalVisiblePages}
            </p>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalVisiblePages, p + 1))}
              disabled={currentPage >= totalVisiblePages}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          
          {showContactMessage && (
            <div className="mt-4 p-4 bg-blue-100 border-t-4 border-blue-500 rounded-b text-blue-900">
              <h4 className="font-bold">End of Preview</h4>
              <p className="text-sm mb-2">Please contact the owner of the article for the full version.</p>
              <div className="text-sm">
                <p className="flex items-center"><FaEnvelope className="mr-2" /> {contactEmail}</p>
                <p className="flex items-center"><FaPhone className="mr-2" /> {contactPhone}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfViewer;