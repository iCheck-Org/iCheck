import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, query, where } from 'firebase/firestore'; 
import { auth, db } from '../config/fire-base';
import { useNavigate } from 'react-router-dom';

const fetchUserType = async (db, userUid) => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "users"), where("id", "==", userUid))
    );

    if (!querySnapshot.empty) {
      const userType = querySnapshot.docs[0].data().type;
      return userType;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user type from Firestore:", error);
    return null;
  }
};

const PrivateRoute = ({ children, allowedTypes }) => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  useEffect(() => {
    const checkUserType = async () => {
      if (!loading) {
        if (user) {
          const userType = await fetchUserType(db, user.uid);
          if (!allowedTypes.includes(userType)) {
            navigate('/');
          }
        } else {
          navigate('/');
        }
        setIsLoadingComplete(true);
      }
    };

    checkUserType();
  }, [user, loading, allowedTypes, navigate]);

  return isLoadingComplete ? children : null;
};

export default PrivateRoute;
