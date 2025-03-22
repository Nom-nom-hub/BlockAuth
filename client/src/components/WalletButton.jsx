import React, { useState, useEffect } from 'react';
import { detectWallet, simplifyAddress } from '../utils/walletHelpers';

const WalletButton = ({ onConnect, connected, address }) => {
  const [walletStatus, setWalletStatus] = useState({ installed: false });
  
  useEffect(() => {
    setWalletStatus(detectWallet());
  }, []);
  
  if (connected && address) {
    return (
      <div className="wallet-button connected">
        <span className="wallet-icon">🔒</span>
        <span className="wallet-address">{simplifyAddress(address)}</span>
      </div>
    );
  }
  
  if (!walletStatus.installed) {
    return (
      <a 
        href="https://metamask.io/download/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="wallet-button install"
      >
        Install MetaMask
      </a>
    );
  }
  
  return (
    <button onClick={onConnect} className="wallet-button connect">
      Connect Wallet
    </button>
  );
};

export default WalletButton;