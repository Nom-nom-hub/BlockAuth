const { Web3 } = require('web3');
const axios = require('axios');

async function testWithGanache() {
  // Connect to local Ganache
  const web3 = new Web3('http://localhost:8545');
  
  // Get test account
  const accounts = await web3.eth.getAccounts();
  const testAccount = accounts[0];
  
  console.log('Using test account:', testAccount);
  
  // Create DID
  const did = `did:ethr:${testAccount}`;
  
  try {
    // Register user
    await axios.post('http://localhost:3001/users/register', {
      did,
      publicKey: testAccount
    });
    console.log('Registration successful');
    
    // Get challenge
    const challengeRes = await axios.post('http://localhost:3001/auth/challenge', { did });
    const challenge = challengeRes.data.challenge;
    console.log('Challenge received:', challenge);
    
    // Sign challenge
    const signature = await web3.eth.sign(challenge, testAccount);
    console.log('Signature:', signature);
    
    // Verify signature
    const verifyRes = await axios.post('http://localhost:3001/auth/verify', { did, signature });
    console.log('Verification successful, token:', verifyRes.data.token);
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testWithGanache();