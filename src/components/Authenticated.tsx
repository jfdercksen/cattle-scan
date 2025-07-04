import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Authenticated = () => {
  const { profile, needsProfileCompletion, getRoleRedirectPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      if (needsProfileCompletion()) {
        navigate('/profile-completion');
      } else {
        navigate(getRoleRedirectPath());
      }
    }
  }, [profile, needsProfileCompletion, getRoleRedirectPath, navigate]);

  return null;
};

export default Authenticated;