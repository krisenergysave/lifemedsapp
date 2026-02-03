import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

/**
 * AuthGuard: Redirects authenticated users away from landing pages to Dashboard
 * Ensures session persistence - if user is logged in and refreshes a landing page,
 * they are immediately redirected to Dashboard
 */
export default function AuthGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const landingPages = ['/', '/Home', '/Features', '/Contact', '/Onboarding', '/Privacy', '/Terms', '/FAQs'];

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        
        // If user is authenticated and on a landing page, redirect to Dashboard
        if (isAuth && landingPages.some(page => location.pathname.includes(page))) {
          navigate(createPageUrl('Dashboard'), { replace: true });
        }
      } catch (error) {
        console.error('Auth guard check failed:', error);
      }
    };

    checkAuthAndRedirect();
  }, [location.pathname, navigate]);

  return <>{children}</>;
}