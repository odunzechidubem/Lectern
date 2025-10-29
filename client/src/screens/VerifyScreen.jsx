// /client/src/screens/VerifyScreen.jsx

import { useEffect, useState, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
        setErrorMessage('Verification token not found in the URL.');
        return;
      }

      try {
        // This is the crucial API call to your backend's verification endpoint.
        const response = await axios.get(`/api/users/verify/${token}`);
        
        // On success, update the UI and prepare to redirect.
        setStatus('success');
        toast.success(response.data.message || 'Email verified successfully!');
        
        // After 3 seconds, redirect the user to the login page with the verified flag.
        setTimeout(() => {
            navigate('/login?verified=true');
        }, 3000);

      } catch (err) {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verifyUserEmail();
  }, [token, navigate]);

  return (
    <Fragment>
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
            <p>You will be redirected to the login page shortly.</p>
          </Message>
        )}

        {status === 'error' && (
          <Message variant="error">
            <h1 className="font-bold text-xl mb-2">Verification Failed</h1>
            <p className="mb-4">{errorMessage}</p>
            <Link to="/login" className="font-bold underline">Go to Login</Link>
          </Message>
        )}
      </div>
    </Fragment>
  );
};

export default VerifyScreen;