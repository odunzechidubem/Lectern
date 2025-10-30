// /client/src/components/AuthManager.jsx

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useCheckAuthStatusQuery } from '../slices/usersApiSlice';
import { clearCredentials, selectUserInfo } from '../slices/authSlice';

/**
 * A logical component that passively manages authentication state.
 * It automatically logs the user out if their session becomes invalid,
 * especially after regaining network connectivity.
 */
const AuthManager = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector(selectUserInfo);

  // This query will run on initial load if a user exists.
  // Crucially, `refetchOnReconnect: true` will automatically re-run it
  // whenever the browser detects it has come back online.
  const { isError, error } = useCheckAuthStatusQuery(undefined, {
    skip: !userInfo, // Don't run this query if there's no user in Redux
    refetchOnReconnect: true,
  });

  useEffect(() => {
    // This effect triggers ONLY if the check-auth query results in an error.
    if (isError) {
      // We only want to auto-logout on authentication errors.
      // We check the status code to avoid logging out for server errors (5xx).
      if (error?.status === 401 || error?.status === 403) {
        toast.error('Your session has expired. Please log in again.');
        dispatch(clearCredentials());
      }
    }
  }, [isError, error, dispatch]);

  // This component renders nothing.
  return null;
};

export default AuthManager;