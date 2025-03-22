# Getting Started

## Overview
This guide will help you set up and run the application locally for development purposes.

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or remote instance)
- MetaMask or another Ethereum wallet (for wallet authentication features)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

### 2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Server Environment
Create a `.env` file in the server directory with the following variables:
```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/your-database

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM_NAME=Your App Name
EMAIL_FROM_ADDRESS=noreply@yourapp.com

# Ethereum Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-infura-key
```

#### Client Environment
Create a `.env` file in the client directory with the following variables:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ETHEREUM_NETWORK=mainnet
```

### 4. Start the Application

#### Development Mode
```bash
# Start the server
cd server
npm run dev

# Start the client (in a new terminal)
cd client
npm start
```

The client will be available at http://localhost:3000 and the server at http://localhost:5000.

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── docs/           # Documentation
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main application component
│   └── package.json        # Dependencies and scripts
│
├── server/                 # Backend Node.js application
│   ├── controllers/        # Route controllers
│   ├── docs/               # Documentation
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── utils/              # Utility functions
│   ├── index.js            # Entry point
│   └── package.json        # Dependencies and scripts
│
└── README.md               # Project overview
```

## Next Steps
- Check out the [Authentication Flow](../auth/AuthenticationFlow.md) documentation
- Learn about [Wallet Authentication](../auth/WalletAuthentication.md)
- Review the [API Reference](../../../server/docs/api.md)