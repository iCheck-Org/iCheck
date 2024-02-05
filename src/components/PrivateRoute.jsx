import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/fire-base';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to the login page
      navigate('/');
    }
  }, [user, loading]);

  return loading ? null : children;
};

export default PrivateRoute;
