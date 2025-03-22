import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { detectWallet } from '../utils/walletHelpers';
import OnboardingGuide from './OnboardingGuide';

/**
 * AuthForm Component
 * 
 * A flexible authentication form that supports both traditional (email/password)
 * and blockchain wallet (MetaMask) authentication methods.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.mode='login'] - Authentication mode: 'login' or 'register'
 * @returns {JSX.Element} The rendered authentication form
 * 
 * @example
 * // Login form
 * <AuthForm mode="login" />
 * 
 * @example
 * // Registration form
 * <AuthForm mode="register" />
 */
const AuthForm = ({ mode = 'login' }) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMethod, setAuthMethod] = useState('traditional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletStatus, setWalletStatus] = useState({ installed: false });
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  // Detect wallet on component mount
  useEffect(() => {
    setWalletStatus(detectWallet());
  }, []);
  
  /**
   * Handles traditional email/password authentication
   * Validates inputs and calls the appropriate auth function
   * 
   * @param {Event} e - Form submission event
   */
  const handleTraditionalAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await register(email, password);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        alert('Registration successful! You can now log in.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handles wallet-based authentication
   * Checks for MetaMask installation and calls login with wallet flag
   */
  const handleWalletAuth = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }
      
      await login(null, null, true); // true indicates wallet login
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <h2>{mode === 'login' ? 'Login' : 'Create Account'}</h2>
      
      <div className="auth-tabs">
        <button 
          className={authMethod === 'traditional' ? 'active' : ''} 
          onClick={() => setAuthMethod('traditional')}
        >
          Email & Password
        </button>
        <button 
          className={authMethod === 'wallet' ? 'active' : ''} 
          onClick={() => setAuthMethod('wallet')}
        >
          Wallet
        </button>
      </div>
      
      {authMethod === 'traditional' ? (
        <form onSubmit={handleTraditionalAuth} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
          
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required
              />
            </div>
          )}
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      ) : (
        <div className="wallet-auth">
          {!walletStatus.installed ? (
            <div className="wallet-not-installed">
              <p>You need a wallet to continue with this method.</p>
              <button 
                onClick={() => setShowOnboarding(true)}
                className="auth-button secondary"
              >
                Learn How
              </button>
            </div>
          ) : (
            <button 
              onClick={handleWalletAuth} 
              disabled={loading}
              className="auth-button wallet"
            >
              {loading ? 'Processing...' : `Login with ${walletStatus.type === 'metamask' ? 'MetaMask' : 'Wallet'}`}
            </button>
          )}
          
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
      
      {showOnboarding && (
        <OnboardingGuide onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
};

export default AuthForm;
