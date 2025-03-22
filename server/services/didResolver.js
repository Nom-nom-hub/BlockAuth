const { Resolver } = require('did-resolver');
const { getResolver } = require('ethr-did-resolver');

// Configure Ethereum DID resolver
const providerConfig = {
  networks: [
    { name: 'mainnet', rpcUrl: process.env.ETHEREUM_RPC_URL },
    { name: 'rinkeby', rpcUrl: process.env.RINKEBY_RPC_URL }
  ]
};

const ethrDidResolver = getResolver(providerConfig);
const resolver = new Resolver(ethrDidResolver);

async function getPublicKeyFromDID(did) {
  try {
    const resolution = await resolver.resolve(did);
    // Extract public key from DID Document
    const publicKey = resolution.didDocument.verificationMethod[0].publicKeyHex;
    return publicKey;
  } catch (error) {
    console.error('DID resolution error:', error);
    throw new Error('Failed to resolve DID');
  }
}

module.exports = { getPublicKeyFromDID };