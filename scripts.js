document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (navToggle) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Close mobile nav if open
        if (navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
        }
      }
    });
  });
  
  // Code snippet copy functionality
  document.querySelectorAll('.code-block').forEach(block => {
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';
    
    block.appendChild(copyButton);
    
    copyButton.addEventListener('click', function() {
      const code = block.querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      });
    });
  });
  
  // Wallet detection demo
  const walletDemoButton = document.querySelector('#wallet-demo-button');
  if (walletDemoButton) {
    walletDemoButton.addEventListener('click', async function() {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          walletDemoButton.textContent = 'Wallet Connected!';
          walletDemoButton.classList.add('connected');
        } catch (error) {
          console.error(error);
        }
      } else {
        alert('Please install MetaMask or another Ethereum wallet to use this feature.');
      }
    });
  }
});