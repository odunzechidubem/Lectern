import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCheckAuthStatusQuery } from '../slices/usersApiSlice';
import { clearCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const AuthValidator = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const { isError } = useCheckAuthStatusQuery(undefined, {
    skip: !userInfo,
  });

  useEffect(() => {
    if (isError) {
      toast.error('Your session has expired. Please log in again.');
      dispatch(clearCredentials());
    }
  }, [isError, dispatch]);

  return null;
};

export default AuthValidator;