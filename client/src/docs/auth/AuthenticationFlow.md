# Authentication Flow

## Overview

This document describes the authentication flows supported by the application, including both traditional email/password authentication and wallet-based authentication.

## Traditional Authentication Flow

1. **User Input**: User enters email and password in the login form
2. **Validation**: Client validates input format (email format, password length)
3. **API Request**: Client sends credentials to `/auth/login` endpoint
4. **Server Validation**: Server validates credentials against database
5. **Rate Limiting**: Server checks for too many failed attempts
6. **Token Generation**: On success, server generates JWT token
7. **Response**: Server returns token and user information
8. **Client Storage**: Client stores token in localStorage/sessionStorage
9. **Redirection**: User is redirected to dashboard

### Security Measures

- Passwords are hashed using bcrypt
- Rate limiting prevents brute force attacks
- JWT tokens expire after 24 hours
- HTTPS is required for all API calls

## Wallet Authentication Flow

1. **Initiation**: User clicks "Login with Wallet" button
2. **Wallet Detection**: Application detects installed wallet (MetaMask, etc.)
3. **Connection Request**: Application requests connection to wallet
4. **Address Retrieval**: Application gets user's Ethereum address
5. **Challenge Request**: Client requests challenge from server
6. **Signature Request**: User is prompted to sign challenge message
7. **Signature Verification**: Server verifies signature against challenge
8. **User Lookup/Creation**: Server finds or creates user account
9. **Token Generation**: Server generates JWT token
10. **Authentication Complete**: User is authenticated and redirected

### Security Considerations

- Each challenge is unique and expires after 5 minutes
- Signatures are verified using Ethereum cryptography
- Public keys are stored, never private keys
- Connection between DID and user account is verified

## Diagrams

### Traditional Authentication Sequence

```
┌──────┐                  ┌──────────┐                  ┌──────────┐
│Client│                  │API Server│                  │ Database │
└──┬───┘                  └────┬─────┘                  └────┬─────┘
   │                           │                             │
   │ Login Request             │                             │
   │ (email, password)         │                             │
   │ ─────────────────────────>                              │ 
   │                           │                             │
   │                           │ Query User                  │
   │                           │ ─────────────────────────────>
   │                           │                             │
   │                           │ User Data                   │
   │                           │ <─────────────────────────────
   │                           │                             │
   │                           │ Verify Password             │
   │                           │ Generate Token              │
   │                           │                             │
   │ Response                  │                             │
   │ (token, user data)        │                             │
   │ <─────────────────────────                              │
   │                           │                             │
   │ Store Token               │                             │
   │                           │                             │
```

### Wallet Authentication Sequence

```
┌──────┐        ┌──────┐        ┌──────────┐        ┌──────────┐
│Client│        │Wallet│        │API Server│        │ Database │
└──┬───┘        └──┬───┘        └────┬─────┘        └────┬─────┘
   │                │                 │                   │
   │ Connect Request│                 │                   │
   │ ───────────────>                 │                   │
   │                │                 │                   │
   │ Address        │                 │                   │
   │ <───────────────                 │                   │
   │                │                 │                   │
   │ Challenge Request (DID)          │                   │
   │ ─────────────────────────────────>                   │
   │                │                 │                   │
   │ Challenge      │                 │                   │
   │ <─────────────────────────────────                   │
   │                │                 │                   │
   │ Sign Request   │                 │                   │
   │ ───────────────>                 │                   │
   │                │                 │                   │
   │ Signature      │                 │                   │
   │ <───────────────                 │                   │
   │                │                 │                   │
   │ Verify Request (DID, Signature)  │                   │
   │ ─────────────────────────────────>                   │
   │                │                 │                   │
   │                │                 │ Query/Create User │
   │                │                 │ ──────────────────>
   │                │                 │ User Data         │
   │                │                 │ <──────────────────
   │                │                 │                   │
   │ Token, User Data                 │                   │
   │ <─────────────────────────────────                   │
   │                │                 │                   │
```

## Error Handling

| Error Scenario | HTTP Status | Response |
|----------------|------------|----------|
| Invalid credentials | 401 | `{ "error": "Invalid credentials" }` |
| Rate limited | 429 | `{ "error": "Too many failed login attempts" }` |
| Missing parameters | 400 | `{ "error": "Email and password are required" }` |
| Invalid signature | 401 | `{ "error": "Invalid signature" }` |
| Challenge expired | 400 | `{ "error": "Challenge expired" }` |
| Server error | 500 | `{ "error": "Authentication failed" }` |

## Implementation References

- Traditional Authentication: `server/routes/auth.js`
- Wallet Authentication: `server/auth.js`
- Frontend Implementation: `client/src/components/Login.jsx`
- Middleware: `server/middleware/auth.js`