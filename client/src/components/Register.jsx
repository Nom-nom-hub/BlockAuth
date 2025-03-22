import React, { useState } from 'react';
import { ethers } from 'ethers';
import api from '../services/api';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const registerWithMetaMask = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Request account access
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      // Register user with DID (using Ethereum address as simple DID)
      const did = `did:ethr:${address}`;
      await api.post('/users/register', { did, publicKey: address });
      
      alert('Registration successful! You can now log in.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="register-container">
      <h2>Register with Blockchain</h2>
      <button onClick={registerWithMetaMask} disabled={loading}>
        {loading ? 'Processing...' : 'Register with MetaMask'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Register;