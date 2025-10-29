import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';

const VerifyEmailChangeScreen = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    // This check prevents the effect from running twice in development due to Strict Mode
    if (hasVerified.current) {
      return;
    } 
    hasVerified.current = true;

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/users/verify-email-change/${token}`);
        const data = await res.text(); // Read as text first to check content

        if (!res.ok) {
          // Try to parse error as JSON, but have a fallback
          try {
            const errorData = JSON.parse(data);
            throw new Error(errorData.message || 'Verification failed');
          } catch {
            throw new Error('An unknown error occurred during verification.');
          }
        }
        // If successful, the response is plain HTML (a redirect), so we don't need to parse it
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(err.message);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="container py-12 mx-auto text-center">
      {status === 'verifying' && (
        <>
          <h1 className="mb-4 text-2xl font-bold">Verifying Your New Email...</h1>
          <Loader />
        </>
      )}
      {status === 'success' && (
        <div className="relative px-4 py-3 text-green-700 bg-green-100 border border-green-400 rounded">
          <h1 className="mb-2 text-2xl font-bold">Success!</h1>
          <p>Your email address has been updated. Your previous session has been logged out.</p>
          <Link to="/login" className="inline-block mt-4 font-bold underline">
            Please log in again with your new email.
          </Link>
        </div>
      )}
      {status === 'error' && (
        <Message variant="error">
          <h1 className="mb-2 text-xl font-bold">Verification Failed</h1>
          <p>{message}</p>
        </Message>
      )}
    </div>
  );
};

export default VerifyEmailChangeScreen;