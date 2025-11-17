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
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy address');
    }
  };

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
    if (walletsEvm.length === 0) {
      alert('No Ethereum wallets found');
      return;
    }

    // Use the first EVM wallet for network switching
    const wallet = walletsEvm[0];
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
    <div className='space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto'>
      {/* Wallet Dashboard Header */}
      <div className='bg-gradient-to-r from-purple-800 to-gray-700 p-4 sm:p-6 rounded-xl shadow-2xl border border-purple-600'>
        <h1 className='text-2xl sm:text-3xl font-bold mb-2 text-white flex items-center gap-2'>
          <span className='text-purple-400'>👛</span> Wallet Dashboard
        </h1>
        <p className='text-gray-300 text-sm sm:text-base'>Manage your wallet addresses and keys</p>
      </div>

      {/* Wallet Addresses Section */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-700 p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-600'>
        <h2 className='text-xl sm:text-2xl font-bold mb-4 text-white flex items-center gap-2'>
          <span className='text-blue-400'>📍</span> Your Wallet Addresses
        </h2>
        {allWallets.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-gray-400 text-sm sm:text-base mb-4'>No wallets found. Create your first wallet!</p>
            <button
              onClick={handleCreateWallet}
              className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/50'
            >
              ➕ Create New Wallet
            </button>
          </div>
        ) : (
          <div className='space-y-3'>
            {allWallets.map((wallet) => (
              <div
                key={wallet.address}
                className='bg-gray-900 p-3 sm:p-4 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all'
              >
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-purple-400 font-semibold text-sm sm:text-base'>
                        {wallet.type === 'ethereum' ? '⟠ Ethereum' : '◎ Solana'}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <p className='text-white font-mono text-xs sm:text-sm break-all'>
                        {wallet.address}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(wallet.address)}
                    className='flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-purple-500/50 text-sm sm:text-base min-w-[100px] sm:min-w-[120px]'
                  >
                    {copiedAddress === wallet.address ? (
                      <>
                        <span>✓</span>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 sm:h-5 sm:w-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                          />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet Creation & Network Switching */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-700 p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-600'>
        <h2 className='text-xl sm:text-2xl font-bold mb-4 text-white flex items-center gap-2'>
          <span className='text-green-400'>🔗</span> Wallet Creation & Network
        </h2>
        <div className='flex flex-col sm:flex-row flex-wrap gap-3'>
          <button
            onClick={handleCreateWallet}
            className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
            disabled={!user}
          >
            ➕ Create New Wallet
          </button>
          {allWallets.length > 0 && (
            <div className='relative group'>
              <button
                className='bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto'
                disabled={!allWallets.some((w) => w.type === 'ethereum')}
              >
                Switch Network
              </button>
              {allWallets.some((w) => w.type === 'ethereum') && (
                <div className='absolute left-0 top-full mt-2 w-full sm:w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10'>
                  <div className='p-2 space-y-1'>
                    <button
                      onClick={() => handleSwitchNetwork(1)}
                      className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors text-sm'
                    >
                      🔷 Ethereum Mainnet
                    </button>
                    <button
                      onClick={() => handleSwitchNetwork(8453)}
                      className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors text-sm'
                    >
                      🔵 Base
                    </button>
                    <button
                      onClick={() => handleSwitchNetwork(10)}
                      className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors text-sm'
                    >
                      🔴 Optimism
                    </button>
                    <button
                      onClick={() => handleSwitchNetwork(137)}
                      className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors text-sm'
                    >
                      🟣 Polygon
                    </button>
                    <button
                      onClick={() => handleSwitchNetwork(42161)}
                      className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors text-sm'
                    >
                      🔵 Arbitrum
                    </button>
                    <button
                      onClick={() => handleSwitchNetwork(56)}
                      className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors text-sm'
                    >
                      🟡 BNB Smart Chain
                    </button>
                    <button
                      onClick={() => handleSwitchNetwork(1301)}
                      className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors text-sm'
                    >
                      🦄 Unichain
                    </button>
                    <button
                      onClick={() => handleSwitchNetwork(84532)}
                      className='w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors text-sm'
                    >
                      Base Sepolia
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8'>
        {/* Export Wallet Section */}
        <div className='bg-gradient-to-br from-green-900/30 to-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl border border-green-500/30'>
          <h2 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white flex items-center gap-2'>
            <span className='text-green-400'>📤</span> Export Wallet
          </h2>
          <p className='text-gray-400 text-xs sm:text-sm mb-4'>Export your wallet private keys securely</p>
          <div className='flex flex-col gap-3'>
            <button
              onClick={handleExportEvm}
              className='bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
              disabled={!user}
            >
              ⟠ Export EVM Wallet
            </button>
            <button
              onClick={handleExportSolana}
              className='bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
              disabled={!user}
            >
              ◎ Export Solana Wallet
            </button>
          </div>
        </div>

        {/* Import Wallet Section */}
        <div className='bg-gradient-to-br from-purple-900/30 to-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl border border-purple-500/30'>
          <h2 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white flex items-center gap-2'>
            <span className='text-purple-400'>📥</span> Import Wallet
          </h2>
          <p className='text-gray-400 text-xs sm:text-sm mb-4'>Import existing wallets using private keys</p>
          <input
            type='password'
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder='Enter private key (0x... for EVM, base58 for Solana)'
            className='w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-600 rounded-lg mb-3 bg-gray-900 text-white font-mono text-xs sm:text-sm focus:border-purple-500 focus:outline-none transition-all'
          />
          <div className='flex flex-col gap-3'>
            <button
              onClick={handleImportEvm}
              className='bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
              disabled={!privateKey.trim()}
            >
              ⟠ Import EVM Wallet
            </button>
            <button
              onClick={handleImportSolana}
              className='bg-gradient-to-r from-violet-500 to-violet-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
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
