# AuthForm Component

## Overview
The AuthForm component provides a flexible authentication interface that supports both traditional (email/password) and blockchain wallet (MetaMask) authentication methods.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| mode | string | 'login' | Authentication mode: 'login' or 'register' |

## Usage

### Login Form
```jsx
import AuthForm from '../components/AuthForm';

const LoginPage = () => {
  return <AuthForm mode="login" />;
};
```

### Registration Form
```jsx
import AuthForm from '../components/AuthForm';

const RegisterPage = () => {
  return <AuthForm mode="register" />;
};
```

## Features
- Dual authentication methods (email/password and wallet)
- Form validation
- Error handling
- Responsive design
- Wallet detection
- Onboarding guide for users without wallets

## Component Structure
- Tab navigation between auth methods
- Email/password form with validation
- Wallet connection button
- Error message display
- Loading states
- Onboarding modal

## Dependencies
- React Router for navigation
- AuthContext for authentication logic
- WalletHelpers for wallet detection
- OnboardingGuide component for wallet setup instructions