import { useState, useMemo, useEffect } from 'react';
import {
  usePrivy,
  useWallets,
  useCreateWallet,
  useImportWallet as useImportWalletEvm,
} from '@privy-io/react-auth';
import {
  useImportWallet as useImportWalletSolana,
  useExportWallet as useExportWalletSolana,
  useWallets as useWalletsSolana,
} from '@privy-io/react-auth/solana';
import type { WalletInfo } from '../types/wallet.types';

const WalletsPage = () => {
  const [privateKey, setPrivateKey] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  const { user, exportWallet: exportWalletEvm } = usePrivy();
  const { wallets: walletsEvm } = useWallets();
  const { wallets: walletsSolana } = useWalletsSolana();
  const { importWallet: importWalletEvm } = useImportWalletEvm();
  const { exportWallet: exportWalletSolana } = useExportWalletSolana();
  const { importWallet: importWalletSolana } = useImportWalletSolana();

  const { createWallet } = useCreateWallet({
    onSuccess: ({ wallet }) => {
      console.log('Created wallet:', wallet);
      alert(`Wallet created successfully! Address: ${wallet.address}`);
    },
    onError: (error) => {
      console.error('Failed to create wallet with error:', error);
      alert('Failed to create wallet');
    },
  });

  const allWallets = useMemo((): WalletInfo[] => {
    const evmWallets: WalletInfo[] = walletsEvm.map((wallet) => ({
      address: wallet.address,
      type: 'ethereum' as const,
      name: wallet.address,
    }));
    const solanaWallets: WalletInfo[] = walletsSolana.map((wallet) => ({
      address: wallet.address,
      type: 'solana' as const,
      name: wallet.address,
    }));
    return [...evmWallets, ...solanaWallets];
  }, [walletsEvm, walletsSolana]);

  useEffect(() => {
    if (allWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(allWallets[0]);
    }
  }, [allWallets, selectedWallet]);

  const handleCreateWallet = async () => {
    try {
      await createWallet();
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

  const handleExportEvm = async () => {
    try {
      const privyWallet = walletsEvm.find((w) => w.walletClientType === 'privy');
      if (!privyWallet) {
        alert('No Privy EVM wallet found');
        return;
      }
      await exportWalletEvm({ address: privyWallet.address });
      console.log('EVM wallet exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export EVM wallet');
    }
  };

  const handleExportSolana = async () => {
    try {
      const privyWallet = walletsSolana.find((w) => w.standardWallet.name === 'privy');
      if (!privyWallet) {
        alert('No Privy Solana wallet found');
        return;
      }
      await exportWalletSolana({ address: privyWallet.address });
      console.log('Solana wallet exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export Solana wallet');
    }
  };

  const handleImportEvm = async () => {
    if (!privateKey.trim()) {
      alert('Please enter a private key');
      return;
    }
    try {
      await importWalletEvm({ privateKey });
      console.log('EVM wallet imported successfully');
      setPrivateKey('');
      alert('EVM wallet imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import EVM wallet');
    }
  };

  const handleImportSolana = async () => {
    if (!privateKey.trim()) {
      alert('Please enter a private key');
      return;
    }
    try {
      await importWalletSolana({ privateKey });
      console.log('Solana wallet imported successfully');
      setPrivateKey('');
      alert('Solana wallet imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import Solana wallet');
    }
  };

  const handleSwitchNetwork = async (chainId: number) => {
    if (!selectedWallet || selectedWallet.type !== 'ethereum') {
      alert('Please select an Ethereum wallet to switch networks');
      return;
    }

    const wallet = walletsEvm.find((w) => w.address === selectedWallet.address);
    if (!wallet) {
      alert('Wallet not found');
      return;
    }

    try {
      await wallet.switchChain(chainId);
      alert(`Switched to chain ${chainId} successfully!`);
    } catch (error) {
      console.error('Failed to switch network:', error);
      alert('Failed to switch network');
    }
  };

  return (
    <div className='space-y-8'>
      {/* Wallet Selector Section */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-2xl border border-gray-600'>
        <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
          <span className='text-purple-400'>👛</span> Wallet Selection
        </h2>
        <select
          value={selectedWallet?.address || ''}
          onChange={(e) => {
            const wallet = allWallets.find((w) => w.address === e.target.value);
            setSelectedWallet(wallet || null);
          }}
          className='w-full px-4 py-3 border-2 border-gray-600 rounded-lg bg-gray-900 text-white font-mono text-sm focus:border-purple-500 focus:outline-none transition-all'
        >
          {allWallets.length === 0 ? (
            <option value=''>No wallets available</option>
          ) : (
            <>
              <option value=''>Select a wallet</option>
              {allWallets.map((wallet) => (
                <option key={wallet.address} value={wallet.address}>
                  {wallet.address} [{wallet.type === 'ethereum' ? '⟠ Ethereum' : '◎ Solana'}]
                </option>
              ))}
            </>
          )}
        </select>
        {selectedWallet && (
          <div className='mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700'>
            <p className='text-sm text-gray-400'>
              Selected: <span className='text-white font-mono'>{selectedWallet.address}</span>
            </p>
            <p className='text-sm text-gray-400'>
              Type:{' '}
              <span className='text-purple-400 font-semibold'>
                {selectedWallet.type === 'ethereum' ? '⟠ Ethereum' : '◎ Solana'}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Wallet Creation & Network Switching */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-2xl border border-gray-600'>
        <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
          <span className='text-green-400'>🔗</span> Wallet Creation & Network
        </h2>
        <div className='flex flex-wrap gap-3'>
          <button
            onClick={handleCreateWallet}
            className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={!user}
          >
            ➕ Create New Wallet
          </button>
          <div className='relative group'>
            <button
              className='bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-amber-500/50'
              disabled={!selectedWallet || selectedWallet.type !== 'ethereum'}
            >
              Switch Network
            </button>
            {selectedWallet && selectedWallet.type === 'ethereum' && (
              <div className='absolute left-0 top-full mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10'>
                <div className='p-2 space-y-1'>
                  <button
                    onClick={() => handleSwitchNetwork(1)}
                    className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors'
                  >
                    🔷 Ethereum Mainnet
                  </button>
                  <button
                    onClick={() => handleSwitchNetwork(8453)}
                    className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors'
                  >
                    🔵 Base
                  </button>
                  <button
                    onClick={() => handleSwitchNetwork(10)}
                    className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors'
                  >
                    🔴 Optimism
                  </button>
                  <button
                    onClick={() => handleSwitchNetwork(137)}
                    className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors'
                  >
                    🟣 Polygon
                  </button>
                  <button
                    onClick={() => handleSwitchNetwork(42161)}
                    className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors'
                  >
                    🔵 Arbitrum
                  </button>
                  <button
                    onClick={() => handleSwitchNetwork(56)}
                    className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors'
                  >
                    🟡 BNB Smart Chain
                  </button>
                  <button
                    onClick={() => handleSwitchNetwork(1301)}
                    className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors'
                  >
                    🦄 Unichain
                  </button>
                  {/* add base sepolia */}
                  <button
                    onClick={() => handleSwitchNetwork(84532)}
                    className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors'
                  >
                    Base Sepolia
                  
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Export Wallet Section */}
        <div className='bg-gradient-to-br from-green-900/30 to-gray-800 p-6 rounded-xl shadow-2xl border border-green-500/30'>
          <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
            <span className='text-green-400'>📤</span> Export Wallet
          </h2>
          <p className='text-gray-400 text-sm mb-4'>Export your wallet private keys securely</p>
          <div className='flex flex-col gap-3'>
            <button
              onClick={handleExportEvm}
              className='bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!user}
            >
              ⟠ Export EVM Wallet
            </button>
            <button
              onClick={handleExportSolana}
              className='bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!user}
            >
              ◎ Export Solana Wallet
            </button>
          </div>
        </div>

        {/* Import Wallet Section */}
        <div className='bg-gradient-to-br from-purple-900/30 to-gray-800 p-6 rounded-xl shadow-2xl border border-purple-500/30'>
          <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
            <span className='text-purple-400'>📥</span> Import Wallet
          </h2>
          <p className='text-gray-400 text-sm mb-4'>Import existing wallets using private keys</p>
          <input
            type='password'
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder='Enter private key (0x... for EVM, base58 for Solana)'
            className='w-full px-4 py-3 border-2 border-gray-600 rounded-lg mb-3 bg-gray-900 text-white font-mono text-sm focus:border-purple-500 focus:outline-none transition-all'
          />
          <div className='flex flex-col gap-3'>
            <button
              onClick={handleImportEvm}
              className='bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!privateKey.trim()}
            >
              ⟠ Import EVM Wallet
            </button>
            <button
              onClick={handleImportSolana}
              className='bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!privateKey.trim()}
            >
              ◎ Import Solana Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletsPage;
