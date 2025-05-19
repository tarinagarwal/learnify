import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface User {
  id: string;
  email?: string;
  role?: string;
}

export const useAuth = (requiredRole?: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUser({ ...user, role: profile?.role || 'user' });
        if (requiredRole && profile?.role !== requiredRole) {
          navigate('/unauthorized');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate, requiredRole]);

  return { user, loading };
};
