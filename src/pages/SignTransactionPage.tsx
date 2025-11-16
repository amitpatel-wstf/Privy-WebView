import { useState, useMemo, useEffect } from 'react';
import {
  useWallets,
  useSendTransaction as useSendTransactionEvm,
  useSignTransaction as useSignTransactionEvm,
  useSignTypedData,
} from '@privy-io/react-auth';
import {
  useWallets as useWalletsSolana,
  useSignAndSendTransaction as useSendTransactionSolana,
  useSignTransaction as useSignTransactionSolana,
} from '@privy-io/react-auth/solana';
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
import type { WalletInfo } from '../types/wallet.types';

const SignTransactionPage = () => {
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  const { wallets: walletsEvm } = useWallets();
  const { wallets: walletsSolana } = useWalletsSolana();
  const { signTransaction: signTransactionEvm } = useSignTransactionEvm();
  const { sendTransaction: sendTransactionEvm } = useSendTransactionEvm();
  const { signTypedData } = useSignTypedData();
  const { signTransaction: signTransactionSolana } = useSignTransactionSolana();
  const { signAndSendTransaction: sendTransactionSolana } = useSendTransactionSolana();

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

  const handleSignTransactionEvm = async () => {
    if (!isEvmWallet || !selectedWallet) {
      alert('Please select an Ethereum wallet');
      return;
    }
    try {
      const transaction = await signTransactionEvm(
        { to: '0xE3070d3e4309afA3bC9a6b057685743CF42da77C', value: 10000 },
        { address: selectedWallet.address }
      );
      const result = typeof transaction === 'string' ? transaction : JSON.stringify(transaction);
      alert(`EVM Transaction signed: ${result.slice(0, 20)}...`);
      console.log('Full transaction:', transaction);
    } catch (error) {
      console.error(error);
      alert('Failed to sign EVM transaction');
    }
  };

  const handleSignTransactionSolana = async () => {
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
      const client = createSolanaRpc('https://api.devnet.solana.com');
      const { value: blockhash } = await client.getLatestBlockhash().send();
      const solTransferInstruction = getTransferSolInstruction({
        amount: 1000000,
        destination: address(selectedWallet.address),
        source: createNoopSigner(address(selectedWallet.address)),
      });
      const transaction = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayer(address(selectedWallet.address), tx),
        (tx) => appendTransactionMessageInstruction(solTransferInstruction, tx),
        (tx) => setTransactionMessageLifetimeUsingBlockhash(blockhash, tx),
        (tx) => compileTransaction(tx),
        (tx) => getBase64EncodedWireTransaction(tx)
      );
      const signedTransaction = await signTransactionSolana({
        transaction: Buffer.from(transaction, 'base64'),
        wallet,
      });
      console.log(signedTransaction);
      alert('Solana Transaction signed successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to sign Solana transaction');
    }
  };

  const handleSendTransactionEvm = async () => {
    if (!isEvmWallet || !selectedWallet) {
      alert('Please select an Ethereum wallet');
      return;
    }
    try {
      const transaction = await sendTransactionEvm(
        { to: '0xE3070d3e4309afA3bC9a6b057685743CF42da77C', value: 10000 },
        { address: selectedWallet.address }
      );
      const result = typeof transaction === 'string' ? transaction : JSON.stringify(transaction);
      alert(`EVM Transaction sent: ${result.slice(0, 20)}...`);
      console.log('Transaction result:', transaction);
    } catch (error) {
      console.error(error);
      alert('Failed to send EVM transaction');
    }
  };

  const handleSendTransactionSolana = async () => {
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
      const client = createSolanaRpc('https://api.devnet.solana.com');
      const { value: blockhash } = await client.getLatestBlockhash().send();
      const solTransferInstruction = getTransferSolInstruction({
        amount: 1000000,
        destination: address(selectedWallet.address),
        source: createNoopSigner(address(selectedWallet.address)),
      });
      const transaction = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayer(address(selectedWallet.address), tx),
        (tx) => appendTransactionMessageInstruction(solTransferInstruction, tx),
        (tx) => setTransactionMessageLifetimeUsingBlockhash(blockhash, tx),
        (tx) => compileTransaction(tx),
        (tx) => getBase64EncodedWireTransaction(tx)
      );
      const receipt = await sendTransactionSolana({
        transaction: Buffer.from(transaction, 'base64'),
        wallet,
      });
      console.log(receipt);
      alert('Solana Transaction sent successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to send Solana transaction');
    }
  };

  const handleSignTypedData = async () => {
    if (!isEvmWallet || !selectedWallet) {
      alert('Please select an Ethereum wallet');
      return;
    }
    try {
      const typedData = {
        domain: {
          name: 'Example App',
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
            name: 'Cow',
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
        address: selectedWallet?.address,
      });
      alert(`Typed Data signed: ${signature.slice(0, 10)}...`);
      console.log('Full signature:', signature);
    } catch (error) {
      console.error(error);
      alert('Failed to sign typed data');
    }
  };

  const handleSignRawHash = async () => {
    if (!isEvmWallet || !selectedWallet) {
      alert('Please select an Ethereum wallet');
      return;
    }
    try {
      const embeddedWallet = walletsEvm.find(
        (wallet) =>
          wallet.walletClientType === 'privy' && wallet.address === selectedWallet.address
      );
      if (!embeddedWallet) {
        alert('Selected wallet must be an embedded Privy wallet for raw hash signing');
        return;
      }
      const provider = await (embeddedWallet as any).getProvider();
      const rawHash = '0x6503b027a625549f7be691646404f275f149d17a119a6804b855bac3030037aa';
      const signature = await provider.request({
        method: 'secp256k1_sign',
        params: [rawHash],
      });
      alert(`Raw Hash signed: ${signature.slice(0, 10)}...`);
      console.log('Full signature:', signature);
    } catch (error) {
      console.error(error);
      alert('Failed to sign raw hash');
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

      {/* Signing Operations */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Sign Transactions Section */}
        <div className='bg-gradient-to-br from-orange-900/30 to-gray-800 p-6 rounded-xl shadow-2xl border border-orange-500/30'>
          <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
            <span className='text-orange-400'>📝</span> Sign Transactions
          </h2>
          <p className='text-gray-400 text-sm mb-4'>Sign transactions without sending</p>
          <div className='flex flex-col gap-3'>
            <button
              onClick={handleSignTransactionEvm}
              className='bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!isEvmWallet}
            >
              ⟠ EVM
            </button>
            <button
              onClick={handleSignTransactionSolana}
              className='bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!isSolanaWallet}
            >
              ◎ Solana
            </button>
          </div>
        </div>

        {/* Send Transactions Section */}
        <div className='bg-gradient-to-br from-red-900/30 to-gray-800 p-6 rounded-xl shadow-2xl border border-red-500/30'>
          <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
            <span className='text-red-400'>🚀</span> Send Transactions
          </h2>
          <p className='text-gray-400 text-sm mb-4'>Sign and broadcast to network</p>
          <div className='flex flex-col gap-3'>
            <button
              onClick={handleSendTransactionEvm}
              className='bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!isEvmWallet}
            >
              ⟠ EVM
            </button>
            <button
              onClick={handleSendTransactionSolana}
              className='bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!isSolanaWallet}
            >
              ◎ Solana
            </button>
          </div>
        </div>

        {/* Advanced Signing Section */}
        <div className='bg-gradient-to-br from-indigo-900/30 to-gray-800 p-6 rounded-xl shadow-2xl border border-indigo-500/30'>
          <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
            <span className='text-indigo-400'>⚡</span> Advanced
          </h2>
          <p className='text-gray-400 text-sm mb-4'>EVM-specific signing methods</p>
          <div className='flex flex-col gap-3'>
            <button
              onClick={handleSignTypedData}
              className='bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!isEvmWallet}
            >
              Sign Typed Data
            </button>
            <button
              onClick={handleSignRawHash}
              className='bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!isEvmWallet}
            >
              Sign Raw Hash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignTransactionPage;
