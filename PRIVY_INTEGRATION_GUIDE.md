# Deep Dive into Privy Integration in React and React Native

## Table of Contents
1. [Introduction](#introduction)
2. [What is Privy?](#what-is-privy)
3. [Setup and Installation](#setup-and-installation)
4. [Core Concepts](#core-concepts)
5. [Authentication Methods](#authentication-methods)
6. [Wallet Management](#wallet-management)
7. [Advanced Features](#advanced-features)
8. [React Native Integration](#react-native-integration)
9. [Best Practices](#best-practices)
10. [Common Pitfalls](#common-pitfalls)

---

## Introduction

Privy is a powerful authentication and wallet management solution designed specifically for Web3 applications. It bridges the gap between traditional Web2 authentication methods and Web3 wallet functionality, making it easier to onboard mainstream users into decentralized applications.

This guide provides a comprehensive walkthrough of integrating Privy into React and React Native applications, with practical code examples and real-world use cases.

## What is Privy?

Privy offers:
- **Multiple Authentication Methods**: Email, SMS, social logins, passkeys, and wallet connections
- **Embedded Wallets**: Automatically created wallets for users without crypto experience
- **Cross-Chain Support**: Ethereum, Solana, and other blockchain networks
- **Secure Key Management**: MPC (Multi-Party Computation) for enhanced security
- **Seamless UX**: No seed phrases or complex wallet setup for end users

---

## Setup and Installation

### Prerequisites

```bash
node >= 16.x
npm or yarn or pnpm
```

### Installation


#### For React Web Applications

```bash
npm install @privy-io/react-auth
# or
yarn add @privy-io/react-auth
# or
pnpm add @privy-io/react-auth
```

#### For Solana Support

```bash
npm install @privy-io/react-auth @privy-io/react-auth/solana
```

#### Additional Dependencies

```bash
# For Solana transactions
npm install @solana/kit @solana-program/system bs58

# For styling (optional)
npm install tailwindcss
```

### Environment Setup

Create a `.env` file in your project root:

```env
VITE_PRIVY_APP_ID=your_privy_app_id_here
```

Get your App ID from [Privy Dashboard](https://dashboard.privy.io/)

---

## Core Concepts

### 1. PrivyProvider Setup

The `PrivyProvider` wraps your application and provides authentication context.


**main.tsx / index.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        // Appearance customization
        appearance: {
          theme: 'dark',
          accentColor: '#6366f1',
          logo: 'https://your-logo-url.com/logo.png',
        },
        // Login methods
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord', 'passkey'],
        // Embedded wallet configuration
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        // Supported chains
        supportedChains: [
          { id: 1, name: 'Ethereum' },
          { id: 137, name: 'Polygon' },
          { id: 8453, name: 'Base' },
        ],
        // Solana support
        solana: {
          cluster: 'devnet', // or 'mainnet-beta'
        },
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
```

### 2. Key Hooks Overview


| Hook | Purpose |
|------|---------|
| `usePrivy()` | Core authentication state and methods |
| `useWallets()` | Access EVM wallets |
| `useWallets()` (Solana) | Access Solana wallets |
| `useLoginWithPasskey()` | Passkey authentication |
| `useCreateWallet()` | Create new embedded wallets |
| `useSignMessage()` | Sign messages |
| `useSendTransaction()` | Send blockchain transactions |

---

## Authentication Methods

### Basic Login/Logout

```typescript
import { usePrivy } from '@privy-io/react-auth';

function AuthComponent() {
  const { login, logout, authenticated, user } = usePrivy();

  return (
    <div>
      {!authenticated ? (
        <button onClick={login}>Login</button>
      ) : (
        <>
          <p>Welcome, {user?.id}</p>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </div>
  );
}
```

### Passkey Authentication

Passkeys provide passwordless, phishing-resistant authentication using WebAuthn.


#### Signup with Passkey

```typescript
import { useSignupWithPasskey } from '@privy-io/react-auth';

function PasskeySignup() {
  const { signupWithPasskey } = useSignupWithPasskey({
    onComplete: (user) => {
      console.log('User signed up:', user);
      // Automatically create wallet after signup
      createWallet();
    },
    onError: (error) => {
      console.error('Signup failed:', error);
      alert('Failed to sign up with passkey');
    }
  });

  return (
    <button onClick={() => signupWithPasskey()}>
      Sign Up with Passkey
    </button>
  );
}
```

#### Login with Passkey

```typescript
import { useLoginWithPasskey } from '@privy-io/react-auth';

function PasskeyLogin() {
  const { loginWithPasskey } = useLoginWithPasskey({
    onComplete: (user) => {
      console.log('User logged in:', user);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });

  return (
    <button onClick={() => loginWithPasskey()}>
      Login with Passkey
    </button>
  );
}
```


#### Link Additional Passkey

```typescript
import { useLinkWithPasskey } from '@privy-io/react-auth';

function LinkPasskey() {
  const { linkWithPasskey } = useLinkWithPasskey({
    onSuccess: (user) => {
      console.log('Passkey linked:', user);
      alert('Passkey linked successfully!');
    },
    onError: (error) => {
      console.error('Failed to link passkey:', error);
    }
  });

  return (
    <button onClick={() => linkWithPasskey()}>
      Link New Passkey
    </button>
  );
}
```

#### Unlink Passkey

```typescript
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';

function UnlinkPasskey() {
  const { user, unlinkPasskey } = usePrivy();
  const [selectedPasskeyId, setSelectedPasskeyId] = useState('');

  // Get all passkey accounts
  const passkeyAccounts = user?.linkedAccounts.filter(
    (account) => account.type === 'passkey'
  ) || [];

  const handleUnlink = async () => {
    if (!selectedPasskeyId) {
      alert('Please select a passkey');
      return;
    }

    try {
      await unlinkPasskey(selectedPasskeyId);
      alert('Passkey unlinked successfully!');
      setSelectedPasskeyId('');
    } catch (error) {
      console.error('Failed to unlink:', error);
    }
  };

  return (
    <div>
      <select 
        value={selectedPasskeyId}
        onChange={(e) => setSelectedPasskeyId(e.target.value)}
      >
        <option value="">Select a passkey</option>
        {passkeyAccounts.map((account, index) => (
          <option key={account.credentialId} value={account.credentialId}>
            Passkey {index + 1}: {account.credentialId.slice(0, 20)}...
          </option>
        ))}
      </select>
      <button onClick={handleUnlink} disabled={!selectedPasskeyId}>
        Unlink Passkey
      </button>
    </div>
  );
}
```


### Social Login

```typescript
import { useLinkAccount } from '@privy-io/react-auth';

function SocialLogin() {
  const { linkEmail, linkGoogle, linkTwitter, linkDiscord } = useLinkAccount();

  return (
    <div>
      <button onClick={() => linkEmail()}>Link Email</button>
      <button onClick={() => linkGoogle()}>Link Google</button>
      <button onClick={() => linkTwitter()}>Link Twitter</button>
      <button onClick={() => linkDiscord()}>Link Discord</button>
    </div>
  );
}
```

---

## Wallet Management

### Creating Wallets

```typescript
import { useCreateWallet } from '@privy-io/react-auth';

function CreateWallet() {
  const { createWallet } = useCreateWallet({
    onSuccess: ({ wallet }) => {
      console.log('Wallet created:', wallet.address);
      alert(`Wallet created: ${wallet.address}`);
    },
    onError: (error) => {
      console.error('Failed to create wallet:', error);
      alert('Failed to create wallet');
    }
  });

  return (
    <button onClick={() => createWallet()}>
      Create New Wallet
    </button>
  );
}
```


### Accessing Wallets

#### EVM Wallets

```typescript
import { useWallets } from '@privy-io/react-auth';
import { useMemo } from 'react';

function WalletList() {
  const { wallets } = useWallets();

  const walletInfo = useMemo(() => {
    return wallets.map((wallet) => ({
      address: wallet.address,
      chainId: wallet.chainId,
      walletClientType: wallet.walletClientType, // 'privy', 'metamask', etc.
    }));
  }, [wallets]);

  return (
    <div>
      <h3>Your Wallets</h3>
      {walletInfo.map((wallet) => (
        <div key={wallet.address}>
          <p>Address: {wallet.address}</p>
          <p>Chain ID: {wallet.chainId}</p>
          <p>Type: {wallet.walletClientType}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Solana Wallets

```typescript
import { useWallets } from '@privy-io/react-auth/solana';

function SolanaWalletList() {
  const { wallets } = useWallets();

  return (
    <div>
      <h3>Solana Wallets</h3>
      {wallets.map((wallet) => (
        <div key={wallet.address}>
          <p>Address: {wallet.address}</p>
          <p>Name: {wallet.standardWallet.name}</p>
        </div>
      ))}
    </div>
  );
}
```


### Import/Export Wallets

#### Import EVM Wallet

```typescript
import { useImportWallet } from '@privy-io/react-auth';
import { useState } from 'react';

function ImportEvmWallet() {
  const [privateKey, setPrivateKey] = useState('');
  const { importWallet } = useImportWallet();

  const handleImport = async () => {
    if (!privateKey.trim()) {
      alert('Please enter a private key');
      return;
    }

    try {
      await importWallet({ privateKey });
      alert('Wallet imported successfully!');
      setPrivateKey('');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import wallet');
    }
  };

  return (
    <div>
      <input
        type="password"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        placeholder="Enter private key (0x...)"
      />
      <button onClick={handleImport}>Import EVM Wallet</button>
    </div>
  );
}
```

#### Import Solana Wallet

```typescript
import { useImportWallet } from '@privy-io/react-auth/solana';
import { useState } from 'react';

function ImportSolanaWallet() {
  const [privateKey, setPrivateKey] = useState('');
  const { importWallet } = useImportWallet();

  const handleImport = async () => {
    try {
      await importWallet({ privateKey }); // Base58 encoded
      alert('Solana wallet imported successfully!');
      setPrivateKey('');
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <div>
      <input
        type="password"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        placeholder="Enter private key (base58)"
      />
      <button onClick={handleImport}>Import Solana Wallet</button>
    </div>
  );
}
```


#### Export Wallet

```typescript
import { usePrivy, useWallets } from '@privy-io/react-auth';

function ExportWallet() {
  const { exportWallet } = usePrivy();
  const { wallets } = useWallets();

  const handleExport = async () => {
    const privyWallet = wallets.find(w => w.walletClientType === 'privy');
    
    if (!privyWallet) {
      alert('No Privy wallet found');
      return;
    }

    try {
      // This will show Privy's export UI
      await exportWallet({ address: privyWallet.address });
      console.log('Wallet exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <button onClick={handleExport}>
      Export Wallet
    </button>
  );
}
```

---

## Advanced Features

### Signing Messages

#### EVM Message Signing

```typescript
import { useSignMessage } from '@privy-io/react-auth';

function SignEvmMessage() {
  const { signMessage } = useSignMessage();

  const handleSign = async (walletAddress: string) => {
    try {
      const message = 'Hello, Web3!';
      const uiOptions = {
        title: 'Sign this message',
        description: 'Please sign to verify your wallet ownership',
        buttonText: 'Sign Message'
      };

      const { signature } = await signMessage(
        { message },
        { 
          uiOptions,
          address: walletAddress 
        }
      );

      console.log('Signature:', signature);
      alert(`Message signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };

  return (
    <button onClick={() => handleSign('0x...')}>
      Sign Message
    </button>
  );
}
```


#### Solana Message Signing

```typescript
import { useSignMessage } from '@privy-io/react-auth/solana';
import { useWallets } from '@privy-io/react-auth/solana';
import bs58 from 'bs58';

function SignSolanaMessage() {
  const { signMessage } = useSignMessage();
  const { wallets } = useWallets();

  const handleSign = async () => {
    const wallet = wallets[0];
    if (!wallet) return;

    try {
      const message = 'Hello, Solana!';
      const signatureUint8Array = await signMessage({
        message: new TextEncoder().encode(message),
        wallet,
        options: {
          uiOptions: {
            title: 'Sign this message',
          },
        },
      });

      const signature = bs58.encode(signatureUint8Array.signature);
      console.log('Signature:', signature);
      alert(`Message signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };

  return (
    <button onClick={handleSign}>
      Sign Solana Message
    </button>
  );
}
```


### Sending Transactions

#### EVM Transaction

```typescript
import { useSendTransaction } from '@privy-io/react-auth';

function SendEvmTransaction() {
  const { sendTransaction } = useSendTransaction();

  const handleSend = async (walletAddress: string) => {
    try {
      const transaction = await sendTransaction(
        {
          to: '0xRecipientAddress',
          value: 10000, // in wei
          // Optional: data, gasLimit, etc.
        },
        { address: walletAddress }
      );

      console.log('Transaction:', transaction);
      alert('Transaction sent successfully!');
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <button onClick={() => handleSend('0x...')}>
      Send Transaction
    </button>
  );
}
```

#### Solana Transaction

```typescript
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana';
import { useWallets } from '@privy-io/react-auth/solana';
import {
  address,
  appendTransactionMessageInstruction,
  compileTransaction,
  createNoopSigner,
  createSolanaRpc,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit';
import { getTransferSolInstruction } from '@solana-program/system';

function SendSolanaTransaction() {
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { wallets } = useWallets();

  const handleSend = async () => {
    const wallet = wallets[0];
    if (!wallet) return;

    try {
      const client = createSolanaRpc('https://api.devnet.solana.com');
      const { value: blockhash } = await client.getLatestBlockhash().send();

      const transferInstruction = getTransferSolInstruction({
        amount: 1000000, // lamports
        destination: address('RecipientPublicKey'),
        source: createNoopSigner(address(wallet.address)),
      });

      const transaction = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayer(address(wallet.address), tx),
        (tx) => appendTransactionMessageInstruction(transferInstruction, tx),
        (tx) => setTransactionMessageLifetimeUsingBlockhash(blockhash, tx),
        (tx) => compileTransaction(tx),
        (tx) => getBase64EncodedWireTransaction(tx)
      );

      const receipt = await signAndSendTransaction({
        transaction: Buffer.from(transaction, 'base64'),
        wallet,
      });

      console.log('Transaction receipt:', receipt);
      alert('Transaction sent successfully!');
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <button onClick={handleSend}>
      Send Solana Transaction
    </button>
  );
}
```


### Sign Typed Data (EIP-712)

```typescript
import { useSignTypedData } from '@privy-io/react-auth';

function SignTypedData() {
  const { signTypedData } = useSignTypedData();

  const handleSign = async (walletAddress: string) => {
    try {
      const typedData = {
        domain: {
          name: 'My DApp',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        types: {
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Alice',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: 'Hello, Bob!',
        },
      };

      const { signature } = await signTypedData(typedData, {
        address: walletAddress,
      });

      console.log('Typed data signature:', signature);
      alert(`Typed data signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };

  return (
    <button onClick={() => handleSign('0x...')}>
      Sign Typed Data
    </button>
  );
}
```


### Sign Raw Hash (Advanced)

```typescript
import { useWallets } from '@privy-io/react-auth';

function SignRawHash() {
  const { wallets } = useWallets();

  const handleSign = async () => {
    const embeddedWallet = wallets.find(
      (wallet) => wallet.walletClientType === 'privy'
    );

    if (!embeddedWallet) {
      alert('No embedded wallet found');
      return;
    }

    try {
      const provider = await (embeddedWallet as any).getProvider();
      const rawHash = '0x6503b027a625549f7be691646404f275f149d17a119a6804b855bac3030037aa';
      
      const signature = await provider.request({
        method: 'secp256k1_sign',
        params: [rawHash],
      });

      console.log('Raw hash signature:', signature);
      alert(`Raw hash signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };

  return (
    <button onClick={handleSign}>
      Sign Raw Hash
    </button>
  );
}
```

---

## React Native Integration

### Setup for React Native

```bash
npm install @privy-io/expo react-native-webview
```

### Configuration


**App.tsx (React Native)**

```typescript
import React from 'react';
import { PrivyProvider } from '@privy-io/expo';
import { View, Text, Button } from 'react-native';
import { usePrivy } from '@privy-io/expo';

function AuthScreen() {
  const { login, logout, isReady, authenticated, user } = usePrivy();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {!authenticated ? (
        <Button title="Login" onPress={login} />
      ) : (
        <>
          <Text>Welcome, {user?.id}</Text>
          <Button title="Logout" onPress={logout} />
        </>
      )}
    </View>
  );
}

export default function App() {
  return (
    <PrivyProvider
      appId="your-privy-app-id"
      config={{
        appearance: {
          theme: 'dark',
        },
        loginMethods: ['email', 'wallet', 'google'],
      }}
    >
      <AuthScreen />
    </PrivyProvider>
  );
}
```

### WebView Integration (React Native CLI)

For React Native CLI projects without Expo, you can use WebView:

```typescript
import React, { useRef, useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

function PrivyWebViewAuth() {
  const webViewRef = useRef<WebView>(null);
  const [authenticated, setAuthenticated] = useState(false);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.privy.io/sdk/v1.0.0/privy.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: system-ui;
            background: #1a1a1a;
            color: white;
          }
          button {
            padding: 12px 24px;
            background: #6366f1;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div id="app"></div>
        <script>
          const privy = new Privy({
            appId: 'your-privy-app-id',
          });

          privy.on('authenticated', (user) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'authenticated',
              user: user
            }));
          });

          function login() {
            privy.login();
          }

          function logout() {
            privy.logout();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'logout'
            }));
          }

          document.getElementById('app').innerHTML = \`
            <button onclick="login()">Login with Privy</button>
            <button onclick="logout()">Logout</button>
          \`;
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    
    if (data.type === 'authenticated') {
      setAuthenticated(true);
      console.log('User authenticated:', data.user);
    } else if (data.type === 'logout') {
      setAuthenticated(false);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default PrivyWebViewAuth;
```


---

## Best Practices

### 1. Error Handling

Always wrap Privy operations in try-catch blocks:

```typescript
const handleOperation = async () => {
  try {
    await somePrivyOperation();
  } catch (error) {
    if (error instanceof Error) {
      console.error('Operation failed:', error.message);
      // Show user-friendly error message
      alert(`Failed: ${error.message}`);
    }
  }
};
```

### 2. Loading States

Manage loading states for better UX:

```typescript
function WalletComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const { createWallet } = useCreateWallet();

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await createWallet();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleCreate} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create Wallet'}
    </button>
  );
}
```

### 3. User Object Management

Check user state before operations:

```typescript
function SecureComponent() {
  const { user, authenticated } = usePrivy();

  if (!authenticated || !user) {
    return <div>Please login first</div>;
  }

  return <div>Welcome, {user.id}</div>;
}
```


### 4. Wallet Selection

Implement proper wallet selection for multi-wallet scenarios:

```typescript
function WalletSelector() {
  const { wallets } = useWallets();
  const [selectedWallet, setSelectedWallet] = useState<string>('');

  useEffect(() => {
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0].address);
    }
  }, [wallets, selectedWallet]);

  return (
    <select 
      value={selectedWallet}
      onChange={(e) => setSelectedWallet(e.target.value)}
    >
      {wallets.map((wallet) => (
        <option key={wallet.address} value={wallet.address}>
          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
        </option>
      ))}
    </select>
  );
}
```

### 5. Environment Variables

Never hardcode sensitive data:

```typescript
// ✅ Good
const appId = import.meta.env.VITE_PRIVY_APP_ID;

// ❌ Bad
const appId = 'clxxx...';
```

### 6. Callback Optimization

Use callbacks for better user feedback:

```typescript
const { createWallet } = useCreateWallet({
  onSuccess: ({ wallet }) => {
    // Show success message
    toast.success(`Wallet created: ${wallet.address}`);
    // Navigate to dashboard
    navigate('/dashboard');
  },
  onError: (error) => {
    // Show error message
    toast.error('Failed to create wallet');
    // Log for debugging
    console.error(error);
  }
});
```


### 7. Type Safety

Use TypeScript for better type safety:

```typescript
import type { User, ConnectedWallet } from '@privy-io/react-auth';

interface WalletComponentProps {
  wallet: ConnectedWallet;
  user: User;
}

function WalletComponent({ wallet, user }: WalletComponentProps) {
  return (
    <div>
      <p>User: {user.id}</p>
      <p>Wallet: {wallet.address}</p>
    </div>
  );
}
```

### 8. Memoization

Optimize performance with useMemo and useCallback:

```typescript
function OptimizedComponent() {
  const { wallets } = useWallets();

  const walletAddresses = useMemo(() => {
    return wallets.map(w => w.address);
  }, [wallets]);

  const handleWalletAction = useCallback(async (address: string) => {
    // Perform action
  }, []);

  return (
    <div>
      {walletAddresses.map(address => (
        <button key={address} onClick={() => handleWalletAction(address)}>
          {address}
        </button>
      ))}
    </div>
  );
}
```

---

## Common Pitfalls

### 1. Not Checking Authentication State

```typescript
// ❌ Bad - May cause errors
function BadComponent() {
  const { user } = usePrivy();
  return <div>{user.id}</div>; // user might be null
}

// ✅ Good
function GoodComponent() {
  const { user, authenticated } = usePrivy();
  
  if (!authenticated || !user) {
    return <div>Please login</div>;
  }
  
  return <div>{user.id}</div>;
}
```


### 2. Incorrect Hook Usage

```typescript
// ❌ Bad - Hooks must be at top level
function BadComponent() {
  const handleClick = () => {
    const { login } = usePrivy(); // Wrong!
    login();
  };
}

// ✅ Good
function GoodComponent() {
  const { login } = usePrivy();
  
  const handleClick = () => {
    login();
  };
}
```

### 3. Missing Provider

```typescript
// ❌ Bad - Using hooks outside PrivyProvider
function App() {
  return <MyComponent />; // Will fail if MyComponent uses Privy hooks
}

// ✅ Good
function App() {
  return (
    <PrivyProvider appId="...">
      <MyComponent />
    </PrivyProvider>
  );
}
```

### 4. Ignoring Async Operations

```typescript
// ❌ Bad - Not awaiting async operations
function BadComponent() {
  const { createWallet } = useCreateWallet();
  
  const handleCreate = () => {
    createWallet(); // Missing await
    console.log('Wallet created'); // Runs before wallet is created
  };
}

// ✅ Good
function GoodComponent() {
  const { createWallet } = useCreateWallet();
  
  const handleCreate = async () => {
    await createWallet();
    console.log('Wallet created'); // Runs after wallet is created
  };
}
```


### 5. Not Handling Multiple Wallets

```typescript
// ❌ Bad - Assuming single wallet
function BadComponent() {
  const { wallets } = useWallets();
  const wallet = wallets[0]; // Might be undefined
  return <div>{wallet.address}</div>;
}

// ✅ Good
function GoodComponent() {
  const { wallets } = useWallets();
  
  if (wallets.length === 0) {
    return <div>No wallets found</div>;
  }
  
  return (
    <div>
      {wallets.map(wallet => (
        <div key={wallet.address}>{wallet.address}</div>
      ))}
    </div>
  );
}
```

### 6. Hardcoding Chain IDs

```typescript
// ❌ Bad
const chainId = 1; // Hardcoded

// ✅ Good
const SUPPORTED_CHAINS = {
  ETHEREUM: 1,
  POLYGON: 137,
  BASE: 8453,
} as const;

const chainId = SUPPORTED_CHAINS.ETHEREUM;
```

---

## Complete Example: Full-Featured Wallet Dashboard

Here's a comprehensive example combining all concepts:

```typescript
import React, { useState, useMemo, useEffect } from 'react';
import {
  usePrivy,
  useWallets,
  useCreateWallet,
  useSignMessage,
  useSendTransaction,
  useLoginWithPasskey,
  useSignupWithPasskey,
  useLinkWithPasskey,
} from '@privy-io/react-auth';

type WalletInfo = {
  address: string;
  chainId: string;
  type: string;
};

function WalletDashboard() {
  const { 
    login, 
    logout, 
    authenticated, 
    user,
    unlinkPasskey 
  } = usePrivy();
  
  const { wallets } = useWallets();
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [selectedPasskeyId, setSelectedPasskeyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Wallet creation
  const { createWallet } = useCreateWallet({
    onSuccess: ({ wallet }) => {
      alert(`Wallet created: ${wallet.address}`);
    },
    onError: (error) => {
      console.error('Failed to create wallet:', error);
    }
  });

  // Passkey authentication
  const { loginWithPasskey } = useLoginWithPasskey({
    onComplete: (user) => {
      console.log('Logged in with passkey:', user);
    }
  });

  const { signupWithPasskey } = useSignupWithPasskey({
    onComplete: async (user) => {
      console.log('Signed up:', user);
      await createWallet();
    }
  });

  const { linkWithPasskey } = useLinkWithPasskey({
    onSuccess: () => {
      alert('Passkey linked successfully!');
    }
  });

  // Message signing
  const { signMessage } = useSignMessage();

  // Transaction sending
  const { sendTransaction } = useSendTransaction();

  // Wallet list
  const walletList = useMemo((): WalletInfo[] => {
    return wallets.map((wallet) => ({
      address: wallet.address,
      chainId: wallet.chainId?.toString() || 'unknown',
      type: wallet.walletClientType,
    }));
  }, [wallets]);

  // Auto-select first wallet
  useEffect(() => {
    if (walletList.length > 0 && !selectedWallet) {
      setSelectedWallet(walletList[0].address);
    }
  }, [walletList, selectedWallet]);

  // Passkey accounts
  const passkeyAccounts = user?.linkedAccounts.filter(
    (account) => account.type === 'passkey'
  ) || [];

  // Handlers
  const handleSignMessage = async () => {
    if (!selectedWallet) {
      alert('Please select a wallet');
      return;
    }

    setIsLoading(true);
    try {
      const { signature } = await signMessage(
        { message: 'Hello, Web3!' },
        { address: selectedWallet }
      );
      alert(`Message signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.error('Signing failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!selectedWallet) {
      alert('Please select a wallet');
      return;
    }

    setIsLoading(true);
    try {
      const tx = await sendTransaction(
        {
          to: '0xRecipientAddress',
          value: 10000,
        },
        { address: selectedWallet }
      );
      alert('Transaction sent successfully!');
      console.log('Transaction:', tx);
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkPasskey = async () => {
    if (!selectedPasskeyId) {
      alert('Please select a passkey');
      return;
    }

    try {
      await unlinkPasskey(selectedPasskeyId);
      alert('Passkey unlinked successfully!');
      setSelectedPasskeyId('');
    } catch (error) {
      console.error('Failed to unlink:', error);
    }
  };

  // Render
  if (!authenticated) {
    return (
      <div className="auth-container">
        <h1>Welcome to Wallet Dashboard</h1>
        <div className="auth-buttons">
          <button onClick={login}>Login</button>
          <button onClick={() => loginWithPasskey()}>
            Login with Passkey
          </button>
          <button onClick={() => signupWithPasskey()}>
            Sign Up with Passkey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header>
        <h1>Wallet Dashboard</h1>
        <div>
          <span>User: {user?.id.slice(0, 10)}...</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {/* Passkey Management */}
      <section className="passkey-section">
        <h2>Passkey Management</h2>
        <p>Linked Passkeys: {passkeyAccounts.length}</p>
        
        {passkeyAccounts.length > 0 && (
          <div>
            <select
              value={selectedPasskeyId}
              onChange={(e) => setSelectedPasskeyId(e.target.value)}
            >
              <option value="">Select a passkey</option>
              {passkeyAccounts.map((account, index) => (
                <option key={account.credentialId} value={account.credentialId}>
                  Passkey {index + 1}
                </option>
              ))}
            </select>
            <button 
              onClick={handleUnlinkPasskey}
              disabled={!selectedPasskeyId}
            >
              Unlink Passkey
            </button>
          </div>
        )}
        
        <button onClick={() => linkWithPasskey()}>
          Link New Passkey
        </button>
      </section>

      {/* Wallet Management */}
      <section className="wallet-section">
        <h2>Wallets</h2>
        <button onClick={() => createWallet()}>
          Create New Wallet
        </button>

        {walletList.length > 0 && (
          <div>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
            >
              {walletList.map((wallet) => (
                <option key={wallet.address} value={wallet.address}>
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)} 
                  ({wallet.type})
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Wallet Actions */}
      <section className="actions-section">
        <h2>Wallet Actions</h2>
        <button 
          onClick={handleSignMessage}
          disabled={!selectedWallet || isLoading}
        >
          {isLoading ? 'Signing...' : 'Sign Message'}
        </button>
        <button 
          onClick={handleSendTransaction}
          disabled={!selectedWallet || isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Transaction'}
        </button>
      </section>
    </div>
  );
}

export default WalletDashboard;
```


---

## Security Considerations

### 1. Private Key Handling

```typescript
// ✅ Always use password input type for private keys
<input 
  type="password" 
  value={privateKey}
  onChange={(e) => setPrivateKey(e.target.value)}
  placeholder="Enter private key"
/>

// ✅ Clear sensitive data after use
const handleImport = async () => {
  try {
    await importWallet({ privateKey });
    setPrivateKey(''); // Clear immediately
  } catch (error) {
    console.error(error);
  }
};
```

### 2. Environment Variables

```typescript
// ✅ Use environment variables
const config = {
  appId: import.meta.env.VITE_PRIVY_APP_ID,
  // Never commit .env files to version control
};

// Add to .gitignore
// .env
// .env.local
```

### 3. User Verification

```typescript
// ✅ Always verify user before sensitive operations
const handleSensitiveOperation = async () => {
  if (!authenticated || !user) {
    alert('Please login first');
    return;
  }

  // Proceed with operation
};
```

### 4. Transaction Validation

```typescript
// ✅ Validate transaction parameters
const handleSendTransaction = async (to: string, value: number) => {
  // Validate address
  if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
    alert('Invalid address');
    return;
  }

  // Validate amount
  if (value <= 0) {
    alert('Invalid amount');
    return;
  }

  // Proceed with transaction
  await sendTransaction({ to, value });
};
```


---

## Performance Optimization

### 1. Code Splitting

```typescript
// Lazy load components
import { lazy, Suspense } from 'react';

const WalletDashboard = lazy(() => import('./components/WalletDashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletDashboard />
    </Suspense>
  );
}
```

### 2. Memoization

```typescript
import { useMemo, useCallback } from 'react';

function OptimizedWalletList() {
  const { wallets } = useWallets();

  // Memoize expensive computations
  const sortedWallets = useMemo(() => {
    return [...wallets].sort((a, b) => 
      a.address.localeCompare(b.address)
    );
  }, [wallets]);

  // Memoize callbacks
  const handleWalletClick = useCallback((address: string) => {
    console.log('Selected wallet:', address);
  }, []);

  return (
    <div>
      {sortedWallets.map(wallet => (
        <button 
          key={wallet.address}
          onClick={() => handleWalletClick(wallet.address)}
        >
          {wallet.address}
        </button>
      ))}
    </div>
  );
}
```

### 3. Debouncing

```typescript
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchWallets() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Perform search
      console.log('Searching for:', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search wallets..."
    />
  );
}
```


---

## Testing

### Unit Testing with Jest

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { PrivyProvider } from '@privy-io/react-auth';
import WalletComponent from './WalletComponent';

// Mock Privy hooks
jest.mock('@privy-io/react-auth', () => ({
  ...jest.requireActual('@privy-io/react-auth'),
  usePrivy: () => ({
    authenticated: true,
    user: { id: 'test-user-id' },
    login: jest.fn(),
    logout: jest.fn(),
  }),
  useWallets: () => ({
    wallets: [
      {
        address: '0x1234567890123456789012345678901234567890',
        chainId: '1',
        walletClientType: 'privy',
      },
    ],
  }),
}));

describe('WalletComponent', () => {
  it('renders wallet address', async () => {
    render(
      <PrivyProvider appId="test-app-id">
        <WalletComponent />
      </PrivyProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/0x1234/)).toBeInTheDocument();
    });
  });
});
```

### Integration Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Integration Tests', () => {
  it('allows user to login and create wallet', async () => {
    render(<App />);

    // Click login button
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    // Wait for authentication
    await waitFor(() => {
      expect(screen.getByText(/Welcome/)).toBeInTheDocument();
    });

    // Click create wallet button
    const createWalletButton = screen.getByText('Create Wallet');
    fireEvent.click(createWalletButton);

    // Verify wallet was created
    await waitFor(() => {
      expect(screen.getByText(/Wallet created/)).toBeInTheDocument();
    });
  });
});
```


---

## Troubleshooting

### Common Issues and Solutions

#### 1. "PrivyProvider not found" Error

**Problem:** Using Privy hooks outside of PrivyProvider

**Solution:**
```typescript
// ✅ Wrap your app with PrivyProvider
function App() {
  return (
    <PrivyProvider appId="your-app-id">
      <YourComponent />
    </PrivyProvider>
  );
}
```

#### 2. Wallet Not Created After Signup

**Problem:** Wallet creation not triggered automatically

**Solution:**
```typescript
const { signupWithPasskey } = useSignupWithPasskey({
  onComplete: async (user) => {
    // Manually trigger wallet creation
    await createWallet();
  }
});
```

#### 3. Transaction Fails Silently

**Problem:** Not handling errors properly

**Solution:**
```typescript
try {
  await sendTransaction({ to, value });
} catch (error) {
  console.error('Transaction error:', error);
  if (error instanceof Error) {
    alert(`Transaction failed: ${error.message}`);
  }
}
```

#### 4. Passkey Not Working on Some Devices

**Problem:** Browser/device doesn't support WebAuthn

**Solution:**
```typescript
// Check for WebAuthn support
const isPasskeySupported = () => {
  return window.PublicKeyCredential !== undefined;
};

function AuthComponent() {
  const supportsPasskey = isPasskeySupported();

  return (
    <div>
      {supportsPasskey ? (
        <button onClick={() => signupWithPasskey()}>
          Sign Up with Passkey
        </button>
      ) : (
        <p>Passkeys not supported on this device</p>
      )}
    </div>
  );
}
```

#### 5. CORS Errors

**Problem:** CORS issues when making requests

**Solution:**
- Add your domain to Privy Dashboard allowed origins
- Ensure you're using the correct App ID
- Check that your domain matches exactly (including protocol)


---

## Advanced Use Cases

### 1. Multi-Chain Wallet Management

```typescript
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';

function MultiChainWallet() {
  const { switchChain } = usePrivy();
  const { wallets } = useWallets();
  const [selectedChain, setSelectedChain] = useState(1);

  const chains = [
    { id: 1, name: 'Ethereum' },
    { id: 137, name: 'Polygon' },
    { id: 8453, name: 'Base' },
  ];

  const handleSwitchChain = async (chainId: number) => {
    try {
      await switchChain(chainId);
      setSelectedChain(chainId);
      alert(`Switched to chain ${chainId}`);
    } catch (error) {
      console.error('Failed to switch chain:', error);
    }
  };

  return (
    <div>
      <h3>Select Network</h3>
      {chains.map((chain) => (
        <button
          key={chain.id}
          onClick={() => handleSwitchChain(chain.id)}
          disabled={selectedChain === chain.id}
        >
          {chain.name}
        </button>
      ))}
    </div>
  );
}
```

### 2. Custom Authentication Flow

```typescript
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';

function CustomAuthFlow() {
  const { login, authenticated } = usePrivy();
  const [step, setStep] = useState<'welcome' | 'auth' | 'complete'>('welcome');

  const handleStartAuth = () => {
    setStep('auth');
    login();
  };

  if (authenticated) {
    return <div>Welcome! You're authenticated.</div>;
  }

  return (
    <div>
      {step === 'welcome' && (
        <div>
          <h1>Welcome to Our DApp</h1>
          <p>Get started by connecting your wallet</p>
          <button onClick={handleStartAuth}>Get Started</button>
        </div>
      )}
      {step === 'auth' && (
        <div>
          <p>Authenticating...</p>
        </div>
      )}
    </div>
  );
}
```

### 3. Wallet Balance Display

```typescript
import { useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function WalletBalance() {
  const { wallets } = useWallets();
  const [balances, setBalances] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBalances = async () => {
      const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
      
      const balancePromises = wallets.map(async (wallet) => {
        const balance = await provider.getBalance(wallet.address);
        return {
          address: wallet.address,
          balance: ethers.formatEther(balance),
        };
      });

      const results = await Promise.all(balancePromises);
      const balanceMap = results.reduce((acc, { address, balance }) => {
        acc[address] = balance;
        return acc;
      }, {} as Record<string, string>);

      setBalances(balanceMap);
    };

    if (wallets.length > 0) {
      fetchBalances();
    }
  }, [wallets]);

  return (
    <div>
      <h3>Wallet Balances</h3>
      {wallets.map((wallet) => (
        <div key={wallet.address}>
          <p>{wallet.address}</p>
          <p>Balance: {balances[wallet.address] || 'Loading...'} ETH</p>
        </div>
      ))}
    </div>
  );
}
```


### 4. Session Management

```typescript
import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';

function SessionManager() {
  const { authenticated, user, logout } = usePrivy();

  useEffect(() => {
    if (!authenticated) return;

    // Set session timeout (30 minutes)
    const SESSION_TIMEOUT = 30 * 60 * 1000;
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        alert('Session expired. Please login again.');
        logout();
      }, SESSION_TIMEOUT);
    };

    // Reset timeout on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      document.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [authenticated, logout]);

  return null; // This is a utility component
}
```

### 5. Transaction History

```typescript
import { useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

function TransactionHistory() {
  const { wallets } = useWallets();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (wallets.length === 0) return;

      setLoading(true);
      try {
        const wallet = wallets[0];
        // Use Etherscan API or similar
        const response = await fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${wallet.address}&sort=desc`
        );
        const data = await response.json();
        
        if (data.status === '1') {
          const txs = data.result.slice(0, 10).map((tx: any) => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: (parseInt(tx.value) / 1e18).toFixed(4),
            timestamp: parseInt(tx.timeStamp),
          }));
          setTransactions(txs);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [wallets]);

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div>
      <h3>Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <ul>
          {transactions.map((tx) => (
            <li key={tx.hash}>
              <p>Hash: {tx.hash.slice(0, 10)}...</p>
              <p>Value: {tx.value} ETH</p>
              <p>Date: {new Date(tx.timestamp * 1000).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```


---

## Resources

### Official Documentation
- [Privy Documentation](https://docs.privy.io/)
- [Privy Dashboard](https://dashboard.privy.io/)
- [Privy GitHub](https://github.com/privy-io)

### Community
- [Privy Discord](https://discord.gg/privy)
- [Privy Twitter](https://twitter.com/privy_io)

### Related Technologies
- [WebAuthn Guide](https://webauthn.guide/)
- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)
- [Solana Documentation](https://docs.solana.com/)

### Tools
- [Etherscan](https://etherscan.io/) - Ethereum blockchain explorer
- [Solscan](https://solscan.io/) - Solana blockchain explorer
- [MetaMask](https://metamask.io/) - Browser wallet
- [Phantom](https://phantom.app/) - Solana wallet

---

## Conclusion

Privy provides a powerful, developer-friendly solution for integrating Web3 authentication and wallet management into your applications. By following this guide, you should be able to:

✅ Set up Privy in React and React Native applications
✅ Implement multiple authentication methods including passkeys
✅ Manage EVM and Solana wallets
✅ Sign messages and send transactions
✅ Handle advanced use cases like multi-chain support
✅ Follow best practices for security and performance

### Key Takeaways

1. **Start Simple**: Begin with basic authentication and gradually add features
2. **Error Handling**: Always implement proper error handling and user feedback
3. **Security First**: Never expose private keys or sensitive data
4. **User Experience**: Provide clear loading states and helpful error messages
5. **Testing**: Test across different browsers and devices
6. **Documentation**: Keep your implementation well-documented

### Next Steps

1. Explore the [Privy Dashboard](https://dashboard.privy.io/) for advanced configuration
2. Join the [Privy Discord](https://discord.gg/privy) community for support
3. Check out example projects on [GitHub](https://github.com/privy-io)
4. Experiment with different authentication flows
5. Implement custom UI components for better branding

---

## Appendix: Quick Reference

### Essential Hooks

```typescript
// Authentication
const { login, logout, authenticated, user } = usePrivy();

// Wallets
const { wallets } = useWallets();
const { createWallet } = useCreateWallet();

// Signing
const { signMessage } = useSignMessage();
const { signTypedData } = useSignTypedData();

// Transactions
const { sendTransaction } = useSendTransaction();

// Passkeys
const { loginWithPasskey } = useLoginWithPasskey();
const { signupWithPasskey } = useSignupWithPasskey();
const { linkWithPasskey } = useLinkWithPasskey();
```

### Common Patterns

```typescript
// Check authentication
if (!authenticated || !user) {
  return <LoginScreen />;
}

// Handle async operations
const handleOperation = async () => {
  try {
    await operation();
  } catch (error) {
    console.error(error);
  }
};

// Memoize expensive computations
const data = useMemo(() => computeData(), [dependencies]);

// Callback optimization
const callback = useCallback(() => {
  // Do something
}, [dependencies]);
```

---

`**Author:** Technical Documentation Team  
**Last Updated:** 2024  
**Version:** 1.0.0

For questions or feedback, please open an issue on GitHub or reach out on Discord.

Happy buildin`