import { useState, useMemo, useEffect } from 'react';
import { useWallets, useSignMessage as useSignMessageEvm } from '@privy-io/react-auth';
import {
  useWallets as useWalletsSolana,
  useSignMessage as useSignMessageSolana,
} from '@privy-io/react-auth/solana';
import bs58 from 'bs58';
import type { WalletInfo } from '../types/wallet.types';

const SignMessagePage = () => {
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  const { wallets: walletsEvm } = useWallets();
  const { wallets: walletsSolana } = useWalletsSolana();
  const { signMessage: signMessageEvm } = useSignMessageEvm();
  const { signMessage: signMessageSolana } = useSignMessageSolana();

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

  const isEvmWallet = selectedWallet?.type === 'ethereum';
  const isSolanaWallet = selectedWallet?.type === 'solana';

  const handleSignMessageEvm = async () => {
    if (!isEvmWallet || !selectedWallet) {
      alert('Please select an Ethereum wallet');
      return;
    }
    try {
      const message = 'Hello, world! I am signing this message.';
      const uiOptions = {
        title: 'Sign this message',
        description: 'Please sign to verify your wallet ownership',
        buttonText: 'Sign Message',
      };
      const { signature } = await signMessageEvm(
        { message },
        {
          uiOptions,
          address: selectedWallet.address,
        }
      );
      alert(`EVM Message signed: ${signature.slice(0, 10)}...`);
      console.log('Full signature:', signature);
    } catch (error) {
      console.error(error);
      alert('Failed to sign EVM message');
    }
  };

  const handleSignMessageSolana = async () => {
    if (!isSolanaWallet || !selectedWallet) {
      alert('Please select a Solana wallet');
      return;
    }
    const wallet = walletsSolana.find((v) => v.address === selectedWallet.address);
    if (!wallet) {
      alert('Could not find the selected Solana wallet');
      return;
    }
    try {
      const message = 'Hello world';
      const signatureUint8Array = await signMessageSolana({
        message: new TextEncoder().encode(message),
        wallet,
        options: {
          uiOptions: {
            title: 'Sign this message',
          },
        },
      });
      const signature = bs58.encode(signatureUint8Array.signature);
      alert(`Solana Message signed: ${signature.slice(0, 10)}...`);
      console.log('Full signature:', signature);
    } catch (error) {
      console.error(error);
      alert('Failed to sign Solana message');
    }
  };

  return (
    <div className='space-y-8'>
      {/* Wallet Selector */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-2xl border border-gray-600'>
        <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
          <span className='text-purple-400'>👛</span> Select Wallet
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

      {/* Sign Messages Section */}
      <div className='bg-gradient-to-br from-yellow-900/30 to-gray-800 p-6 rounded-xl shadow-2xl border border-yellow-500/30'>
        <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
          <span className='text-yellow-400'>✍️</span> Sign Messages
        </h2>
        <p className='text-gray-400 text-sm mb-4'>Sign messages to verify ownership</p>
        <div className='flex flex-col gap-3'>
          <button
            onClick={handleSignMessageEvm}
            className='bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={!isEvmWallet}
          >
            ⟠ Sign EVM Message
          </button>
          <button
            onClick={handleSignMessageSolana}
            className='bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={!isSolanaWallet}
          >
            ◎ Sign Solana Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignMessagePage;
