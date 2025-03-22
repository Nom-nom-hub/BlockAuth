import React from 'react';

const OnboardingGuide = ({ onClose }) => {
  return (
    <div className="onboarding-modal">
      <h2>Getting Started with Blockchain Login</h2>
      <div className="steps">
        <div className="step">
          <h3>Step 1: Install MetaMask</h3>
          <p>Download the MetaMask extension for your browser if you don't have it already.</p>
          <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="button">
            Get MetaMask
          </a>
        </div>
        <div className="step">
          <h3>Step 2: Create or Import a Wallet</h3>
          <p>Follow MetaMask's instructions to set up your wallet.</p>
        </div>
        <div className="step">
          <h3>Step 3: Connect and Login</h3>
          <p>Return to our site and click "Login with MetaMask" to connect your wallet.</p>
        </div>
      </div>
      <button onClick={onClose} className="close-button">Got it!</button>
    </div>
  );
};

export default OnboardingGuide;