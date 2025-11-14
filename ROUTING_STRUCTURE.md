# Application Routing Structure

## Overview
The application has been refactored into a clean, multi-route structure with separate pages for different functionalities while preserving all existing logic.

## Routes

### 1. Home Page (`/`)
**File:** `src/pages/HomePage.tsx`
- Landing page with navigation cards
- Shows authentication status
- Quick access to all features

### 2. Login Page (`/login`)
**File:** `src/pages/LoginPage.tsx`
**Features:**
- Standard login/logout
- Passkey authentication (login, signup)
- Passkey management (link, unlink)
- Account linking (Gmail, etc.)

### 3. Wallets Page (`/wallets`)
**File:** `src/pages/WalletsPage.tsx`
**Features:**
- Wallet selection (EVM & Solana)
- Create new wallets
- Network switching (7 mainnets)
- Import wallets (EVM & Solana)
- Export wallets (EVM & Solana)

### 4. Sign Message Page (`/sign-message`)
**File:** `src/pages/SignMessagePage.tsx`
**Features:**
- Wallet selection
- Sign EVM messages
- Sign Solana messages

### 5. Sign Transaction Page (`/sign-transaction`)
**File:** `src/pages/SignTransactionPage.tsx`
**Features:**
- Wallet selection
- Sign EVM transactions
- Sign Solana transactions
- Send EVM transactions
- Send Solana transactions
- Sign typed data (EIP-712)
- Sign raw hash

## Project Structure

```
src/
├── App.tsx                      # Main router configuration
├── main.tsx                     # App entry point with PrivyProvider
├── components/
│   └── Layout.tsx              # Navigation bar + layout wrapper
├── pages/
│   ├── HomePage.tsx            # Landing page
│   ├── LoginPage.tsx           # Authentication & passkeys
│   ├── WalletsPage.tsx         # Wallet management
│   ├── SignMessagePage.tsx     # Message signing
│   └── SignTransactionPage.tsx # Transaction operations
└── types/
    └── wallet.types.ts         # TypeScript type definitions
```

## Navigation

The application features a sticky navigation bar with:
- Active route highlighting
- User authentication status indicator
- Quick access to all pages

## Key Features Preserved

✅ All original logic maintained
✅ No functionality removed
✅ Clean separation of concerns
✅ Reusable components
✅ Type-safe with TypeScript
✅ Responsive design
✅ Consistent styling

## Technology Stack

- **React Router DOM**: Client-side routing
- **React 19**: UI framework
- **TypeScript**: Type safety
- **Privy**: Authentication & wallet management
- **Viem**: Chain configurations
- **Tailwind CSS**: Styling

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Routes Summary

| Route | Page | Primary Function |
|-------|------|------------------|
| `/` | Home | Navigation hub |
| `/login` | Login | Authentication |
| `/wallets` | Wallets | Wallet management |
| `/sign-message` | Sign Message | Message signing |
| `/sign-transaction` | Transactions | Transaction operations |
