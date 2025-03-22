export const detectWallet = () => {
  if (window.ethereum) {
    return {
      installed: true,
      type: window.ethereum.isMetaMask ? 'metamask' : 'other'
    };
  }
  
  return { installed: false };
};

export const getWalletDownloadLink = () => {
  // Detect browser and return appropriate link
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    return 'https://metamask.app.link/';
  }
  
  return 'https://metamask.io/download/';
};

export const simplifyAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};