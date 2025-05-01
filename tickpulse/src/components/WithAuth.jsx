'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        // 可选：验证Token有效性
        const isValid = await fetch('/api/verify-token', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.ok);
        
        if (!isValid) {
          localStorage.removeItem('accessToken');
          router.push('/login');
        }
      };

      checkAuth();
    }, []);

    return <Component {...props} />;
  };
}