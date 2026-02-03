import React from 'react'
import { GoogleLogin } from '@react-oauth/google'

export default function GoogleLoginButton({ redirectTo = '/dashboard' }) {
  const handleSuccess = async (response) => {
    const idToken = response?.credential;
    if (!idToken) {
      console.error('No credential returned from Google');
      return;
    }

    try {
      // POST the ID token to your server endpoint which should verify it
      // and create a session for the user.
      const res = await fetch('/api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = redirectTo;
      } else {
        console.error('Server rejected Google login', data);
        alert(data.message || 'Google sign-in failed');
      }
    } catch (err) {
      console.error('Google login error', err);
      alert('An unexpected error occurred during Google sign-in');
    }
  };

  const handleError = (err) => {
    console.error('Google login failed', err);
    alert('Google sign-in failed');
  };

  return (
    <div className="mt-4">
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}
