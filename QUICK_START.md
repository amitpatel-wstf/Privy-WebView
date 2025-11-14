# Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to `http://localhost:5173`

## 📱 Application Flow

### First Time User Journey

1. **Home Page** (`/`)
   - Click "Authentication" card

2. **Login Page** (`/login`)
   - Click "Login" or "Sign up with Passkey"
   - Complete authentication

3. **Wallets Page** (`/wallets`)
   - Click "Create New Wallet"
   - Your wallet is now ready!

4. **Sign Message** (`/sign-message`)
   - Select your wallet
   - Click "Sign EVM Message" or "Sign Solana Message"

5. **Transactions** (`/sign-transaction`)
   - Select your wallet
   - Sign or send transactions

## 🎯 Key Features by Page

### 🏠 Home (`/`)
- Navigation hub
- Quick access cards
- Authentication status

### 🔐 Login (`/login`)
- Email/Social login
- Passkey authentication
- Account management

### 👛 Wallets (`/wallets`)
- Create wallets
- Import/Export
- Network switching
- Multi-chain support

### ✍️ Sign Message (`/sign-message`)
- EVM message signing
- Solana message signing
- Signature verification

### 📝 Transactions (`/sign-transaction`)
- Sign transactions
- Send transactions
- Typed data signing
- Raw hash signing

## 🌐 Supported Networks

- 🔷 Ethereum Mainnet
- 🔵 Base
- 🔴 Optimism
- 🟣 Polygon
- 🔵 Arbitrum
- 🟡 BNB Smart Chain
- 🦄 Unichain

## 💡 Tips

1. **Always login first** before accessing wallet features
2. **Select a wallet** before signing or sending transactions
3. **Network switching** only works with Ethereum wallets
4. **Passkeys** provide the most secure authentication
5. **Export wallets** to backup your private keys

## 🔧 Troubleshooting

### No wallets available?
- Make sure you're logged in
- Create a new wallet from the Wallets page

### Can't switch networks?
- Ensure you've selected an Ethereum wallet
- Solana wallets don't support network switching

### Transaction failed?
- Check you have sufficient balance
- Verify the network is correct
- Ensure wallet is connected

## 📚 Documentation

- [Privy Integration Guide](./PRIVY_INTEGRATION_GUIDE.md)
- [Network Switching Feature](./NETWORK_SWITCHING_FEATURE.md)
- [Routing Structure](./ROUTING_STRUCTURE.md)
