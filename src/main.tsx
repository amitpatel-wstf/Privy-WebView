import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {PrivyProvider} from '@privy-io/react-auth';
import { Buffer } from 'buffer';
import { mainnet, base, optimism, polygon, arbitrum, bsc, baseSepolia } from 'viem/chains';

// Polyfill Buffer for browser environment
window.Buffer = Buffer;

// Unichain configuration
const unichain = {
  id: 1301,
  name: 'Unichain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.unichain.org'] },
    public: { http: ['https://sepolia.unichain.org'] },
  },
  blockExplorers: {
    default: { name: 'Uniscan', url: 'https://sepolia.uniscan.xyz' },
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <PrivyProvider
      appId={import.meta.env.VITE_APP_ID}
      config={{
        defaultChain: mainnet,
        supportedChains: [mainnet, base, optimism, polygon, arbitrum, bsc, unichain,baseSepolia],
        appearance:{
          // logo:"https://unsplash.com/photos/red-apple-on-white-background-rxN2MRdFJVg"
          theme:"dark",
          //login message
          // loginMessage:"Hello,User"
        }
      }}
      
    >
    <App />
    </PrivyProvider>
  </StrictMode>
)
