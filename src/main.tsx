import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {PrivyProvider} from '@privy-io/react-auth';
import { Buffer } from 'buffer';

// Polyfill Buffer for browser environment
window.Buffer = Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <PrivyProvider
      appId="app-id"

      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        }
      }}
    >
    <App />
    </PrivyProvider>
  </StrictMode>,
)
