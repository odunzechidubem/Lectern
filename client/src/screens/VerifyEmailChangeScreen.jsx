import { useEffect, useState, useRef } from 'react'; // <-- Import useRef
import { useParams, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';

const VerifyEmailChangeScreen = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  // --- THIS IS THE FIX ---
  // Create a ref to track if the verification has already been attempted.
  const hasVerified = useRef(false);

  useEffect(() => {
    // Only run the verification logic if it has NOT been run before.
    if (!hasVerified.current) {
      // Immediately set the ref to true to prevent re-runs.
      hasVerified.current = true;

      const verifyToken = async () => {
        try {
          const res = await fetch(`/api/users/verify-email-change/${token}`);
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Verification failed');
          }
          setStatus('success');
        } catch (err) {
          setStatus('error');
          setMessage(err.message);
        }
      };
      verifyToken();
    }
  }, [token]); // The dependency array is correct.

  return (
    <div className="container mx-auto text-center py-12">
      {status === 'verifying' && (<><h1 className="text-2xl font-bold mb-4">Verifying Your New Email...</h1><Loader /></>)}
      {status === 'success' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <h1 className="text-2xl font-bold mb-2">Success!</h1>
          <p>Your email address has been updated. Your previous session has been logged out.</p>
          <Link to="/login" className="font-bold underline mt-4 inline-block">Please log in again with your new email.</Link>
        </div>
      )}
      {status === 'error' && (
        <Message variant="error">
          <h1 className="text-xl font-bold mb-2">Verification Failed</h1>
          <p>{message}</p>
        </Message>
      )}
    </div>
  );
};

export default VerifyEmailChangeScreen;