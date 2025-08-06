import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Loader from './Loader';
import { FaEnvelope, FaPhone } from 'react-icons/fa';

// --- THIS IS THE DEFINITIVE FIX ---
// This new syntax correctly tells Vite how to find and serve the worker file
// directly from node_modules, eliminating all previous errors.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PdfViewer = ({ fileUrl, publicPages, contactEmail, contactPhone }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
  }

  const totalVisiblePages = Math.min(numPages || publicPages, publicPages);
  const showContactMessage = currentPage >= totalVisiblePages;

  return (
    <div className="pdf-container border rounded-lg overflow-hidden">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div className="flex justify-center items-center p-8"><Loader /></div>}
        error={<div className="p-4 text-center text-red-500">Failed to load PDF. Please ensure the URL is correct.</div>}
      >
        <Page
          pageNumber={currentPage}
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