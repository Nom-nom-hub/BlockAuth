# API Reference

## Overview
This document provides a comprehensive reference for all API endpoints in the application. The API follows RESTful principles and uses JWT for authentication.

## Authentication

### POST /api/auth/login
Authenticates a user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

### POST /api/auth/wallet-login
Authenticates a user with a blockchain wallet.

**Request Body:**
```json
{
  "address": "0x1234...5678",
  "signature": "0xabcd...efgh",
  "message": "Sign this message to authenticate: NONCE"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "walletAddress": "0x1234...5678"
  }
}
```

### POST /api/auth/register
Registers a new user.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "name": "New User"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user-id",
    "email": "newuser@example.com",
    "name": "New User"
  }
}
```

## User Management

### GET /api/users/me
Gets the current user's profile.

**Headers:**
- Authorization: Bearer {token}

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user",
  "walletAddress": "0x1234...5678"
}
```

### PUT /api/users/me
Updates the current user's profile.

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user-id",
    "email": "updated@example.com",
    "name": "Updated Name"
  }
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes:

- 200: Success
- 201: Resource created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

Error responses follow this format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```