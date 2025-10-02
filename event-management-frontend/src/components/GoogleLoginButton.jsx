import React from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleLoginButton = ({ onSuccess, onFailure }) => {
  const handleGoogleLogin = () => {
    /* global google */
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response.credential) {
          onSuccess(response.credential);
        } else {
          onFailure('Google login failed');
        }
      },
    });
    window.google.accounts.id.prompt();
  };

  return (
    <button type="button" className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2" onClick={handleGoogleLogin}>
      <span>Sign in with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
