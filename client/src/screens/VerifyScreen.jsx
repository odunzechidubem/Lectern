// /src/screens/VerifyScreen.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';

const VerifyScreen = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // This effect runs only once when the component mounts.
    const verifyUserEmail = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Verification token not found.');
        return;
      }

      try {
        // We are using axios here to make a direct call to the backend API.
        // This will either succeed and redirect, or throw an error.
        // We don't need to handle the success data, as the backend handles the redirect.
        await axios.get(`/api/users/verify/${token}`);
        
        // If the backend redirect works, the user's browser will be sent to the login page.
        // If it fails for some reason (e.g., network issue after backend responds),
        // we can manually navigate them after a short delay.
        setStatus('success');
        setTimeout(() => {
            navigate('/login?verified=true');
        }, 3000); // 3-second delay before manual redirect

      } catch (err) {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verifyUserEmail();
  }, [token, navigate]);

  return (
    <>
      <Meta title="Verifying Email..." />
      <div className="container mx-auto text-center py-20">
        {status === 'verifying' && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Verifying Your Account...</h1>
            <Loader />
          </div>
        )}

        {status === 'success' && (
          <Message variant="success">
            <h1 className="font-bold text-xl mb-2">Verification Successful!</h1>
            <p>Redirecting you to the login page...</p>
          </Message>
        )}

        {status === 'error' && (
          <Message variant="error">
            <h1 className="font-bold text-xl mb-2">Verification Failed</h1>
            <p>{errorMessage}</p>
          </Message>
        )}
      </div>
    </>
  );
};

export default VerifyScreen;