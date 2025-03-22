import React, { useState } from 'react';
import { ethers } from 'ethers';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState('traditional'); // or 'wallet'

  const loginWithMetaMask = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      // Create DID from address
      const did = `did:ethr:${address}`;
      
      // Request challenge from server
      const { data: { challenge } } = await api.post('/auth/challenge', { did });
      
      // Sign challenge
      const signature = await signer.signMessage(challenge);
      
      // Verify signature on server
      const { data: { token } } = await api.post('/auth/verify', { 
        did, 
        signature 
      });
      
      // Set auth token
      login(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const traditionalLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const { data: { token } } = await api.post('/auth/login', { 
        email, 
        password 
      });
      
      login(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-tabs">
        <button 
          className={loginMethod === 'traditional' ? 'active' : ''} 
          onClick={() => setLoginMethod('traditional')}
        >
          Email & Password
        </button>
        <button 
          className={loginMethod === 'wallet' ? 'active' : ''} 
          onClick={() => setLoginMethod('wallet')}
        >
          Wallet
        </button>
      </div>
      
      {loginMethod === 'traditional' ? (
        <form onSubmit={traditionalLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Login'}
          </button>
        </form>
      ) : (
        <button onClick={loginWithMetaMask} disabled={loading}>
          {loading ? 'Processing...' : 'Login with MetaMask'}
        </button>
      )}
      
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;
