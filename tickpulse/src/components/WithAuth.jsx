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

        // Removed the API call to /api/verify-token
        // For client-side routing, we'll assume the token is valid if it exists.
        // Actual token validation should occur on the server for API requests.
        
        // const isValid = await fetch('/api/verify-token', {
        //   headers: { Authorization: `Bearer ${token}` }
        // }).then(res => res.ok);
        
        // if (!isValid) {
        //   localStorage.removeItem('accessToken');
        //   router.push('/login');
        // }
      };

      checkAuth();
    }, [router]);

    return <Component {...props} />;
  };
}