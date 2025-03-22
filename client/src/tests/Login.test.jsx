import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../components/Login';
import { AuthProvider } from '../context/AuthContext';
import api from '../services/api';

// Mock dependencies
jest.mock('../services/api');
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn().mockImplementation(() => ({
        send: jest.fn().mockResolvedValue([]),
        getSigner: jest.fn().mockImplementation(() => ({
          getAddress: jest.fn().mockResolvedValue('0x123456789abcdef'),
          signMessage: jest.fn().mockResolvedValue('0xsignature')
        }))
      }))
    }
  }
}));

describe('Login Component', () => {
  beforeEach(() => {
    // Mock window.ethereum
    global.window.ethereum = { isMetaMask: true };
    
    // Mock API responses
    api.post.mockImplementation((url, data) => {
      if (url === '/auth/challenge') {
        return Promise.resolve({ data: { challenge: 'random-challenge' } });
      } else if (url === '/auth/verify') {
        return Promise.resolve({ data: { token: 'jwt-token' } });
      }
    });
  });

  test('Login with MetaMask', async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    
    // Click login button
    fireEvent.click(screen.getByText('Login with MetaMask'));
    
    // Wait for login process to complete
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/challenge', { did: 'did:ethr:0x123456789abcdef' });
      expect(api.post).toHaveBeenCalledWith('/auth/verify', { 
        did: 'did:ethr:0x123456789abcdef', 
        signature: '0xsignature' 
      });
    });
  });
});