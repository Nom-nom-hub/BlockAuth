# Wallet Authentication

## Overview
This application supports authentication using blockchain wallets like MetaMask, allowing users to sign in without traditional credentials.

## How It Works

1. **Wallet Detection**: The application detects if the user has a compatible wallet installed
2. **Connection Request**: When the user clicks "Login with Wallet", the application requests connection to the wallet
3. **Signature Request**: The wallet prompts the user to sign a message to verify ownership
4. **Authentication**: The signature is verified on the server, and the user is authenticated

## Supported Wallets

- MetaMask
- Other Ethereum-compatible wallets (WalletConnect, etc.)

## Implementation Details

### Client-Side
The wallet authentication flow is implemented in the `AuthForm` component and uses the following utilities:

- `detectWallet()`: Detects installed wallets and their types
- `login(null, null, true)`: Initiates wallet authentication flow

### Server-Side
The server verifies wallet signatures using:

- Ethereum cryptography libraries
- Address verification
- Nonce-based challenge-response

## User Experience

- Users without wallets are shown an onboarding guide
- Wallet type is detected and displayed
- Clear error messages for connection issues
- Seamless redirection after successful authentication

## Security Considerations

- Signatures are time-limited
- Each signature request uses a unique nonce
- Server validates the signature against the expected message
- No private keys are ever transmitted