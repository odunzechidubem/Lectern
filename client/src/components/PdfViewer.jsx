import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Loader from './Loader';

// This configuration points to the worker file that vite-plugin-static-copy
// places in your public directory during the build process.
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

const PdfViewer = ({ fileUrl, publicPages }) => {
  // --- THIS IS THE FIX ---
  // The missing '=' has been added to both useState declarations.
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
  }

  const totalVisiblePages = Math.min(numPages || publicPages, publicPages);
  
  // Create a new, proxied URL for the PDF to avoid CORS issues.
  const proxiedFileUrl = fileUrl.replace('https://res.cloudinary.com', '/pdf-proxy');

  return (
    <div className="pdf-container border rounded-lg overflow-hidden">
      <Document
        file={proxiedFileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div className="flex justify-center items-center p-8"><Loader /></div>}
        error={<div className="p-4 text-center text-red-500">Failed to load PDF. Check the file URL.</div>}
      >
        <Page pageNumber={currentPage} />
      </Document>
      
      {numPages && (
        <div className="flex justify-center items-center p-2 bg-gray-100">
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
      )}
    </div>
  );
};

export default PdfViewer;