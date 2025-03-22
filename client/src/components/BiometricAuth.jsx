import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BiometricAuth = () => {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    // Check if Web Authentication API is available
    if (window.PublicKeyCredential) {
      // Check if platform authenticator is available
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => {
          setBiometricAvailable(available);
        })
        .catch(err => {
          console.error('Error checking authenticator:', err);
          setBiometricAvailable(false);
        });
    }
  }, []);

  const handleBiometricLogin = async () => {
    try {
      // Request biometric authentication from server
      const response = await fetch('/api/auth/biometric-challenge');
      const challengeData = await response.json();
      
      // Convert challenge to proper format
      const publicKey = {
        challenge: base64ToArrayBuffer(challengeData.challenge),
        rpId: window.location.hostname,
        allowCredentials: challengeData.allowCredentials.map(cred => ({
          id: base64ToArrayBuffer(cred.id),
          type: 'public-key'
        })),
        timeout: 60000,
        userVerification: 'required'
      };
      
      // Request biometric verification
      const credential = await navigator.credentials.get({ publicKey });
      
      // Send verification to server
      const result = await login(null, null, false, credential);
      
      if (result.success) {
        // Handle successful login
      }
    } catch (err) {
      setError('Biometric authentication failed');
      console.error(err);
    }
  };

  if (!biometricAvailable) {
    return null;
  }

  return (
    <div className="biometric-auth">
      <button 
        onClick={handleBiometricLogin}
        className="auth-button biometric"
      >
        Login with Biometrics
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default BiometricAuth;