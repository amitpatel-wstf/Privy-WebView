import { useState, useMemo, useEffect } from 'react'
import './App.css'
import {
  usePrivy,
  useWallets,
  useSendTransaction as useSendTransactionEvm,
  useSignMessage as useSignMessageEvm,
  useSignTransaction as useSignTransactionEvm,
  useSignTypedData,
  useCreateWallet,
  useLoginWithPasskey,
  useSignupWithPasskey,
  useLinkAccount,
  useLinkWithPasskey
} from '@privy-io/react-auth';
import { useImportWallet as useImportWalletEvm } from '@privy-io/react-auth';
import {
  useImportWallet as useImportWalletSolana,
  useExportWallet as useExportWalletSolana,
  useWallets as useWalletsSolana,
  useSignAndSendTransaction as useSendTransactionSolana,
  useSignMessage as useSignMessageSolana,
  useSignTransaction as useSignTransactionSolana
} from '@privy-io/react-auth/solana';
import bs58 from 'bs58';
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

type WalletInfo = {
  address: string;
  type: 'ethereum' | 'solana';
  name: string;
};

function App() {
  const [privateKey, setPrivateKey] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);


  const { login, logout, user, exportWallet: exportWalletEvm, unlinkPasskey } = usePrivy();
  const { wallets: walletsEvm } = useWallets();
  const { wallets: walletsSolana } = useWalletsSolana();
  const { importWallet: importWalletEvm } = useImportWalletEvm();
  const { exportWallet: exportWalletSolana } = useExportWalletSolana();
  const { importWallet: importWalletSolana } = useImportWalletSolana();

  // Wallet action hooks
  const { signMessage: signMessageEvm } = useSignMessageEvm();
  const { signTransaction: signTransactionEvm } = useSignTransactionEvm();
  const { sendTransaction: sendTransactionEvm } = useSendTransactionEvm();
  const { signTypedData } = useSignTypedData();
  const { signMessage: signMessageSolana } = useSignMessageSolana();
  const { signTransaction: signTransactionSolana } = useSignTransactionSolana();
  const { signAndSendTransaction: sendTransactionSolana } = useSendTransactionSolana();

  const { linkEmail } = useLinkAccount();
  
  const { linkWithPasskey } = useLinkWithPasskey({
    onSuccess: (user) => {
      console.log('Passkey linked successfully:', user);
      alert('Passkey linked successfully!');
    },
    onError: (error) => {
      console.error('Failed to link passkey:', error);
      alert('Failed to link passkey');
    }
  });

  const { loginWithPasskey } = useLoginWithPasskey({
    onComplete: (user) => {
      console.log('Logged in with passkey:', user);
    },
    onError: (error) => {
      console.error('Passkey login error:', error);
    }
  });

  const { signupWithPasskey } = useSignupWithPasskey({
    onComplete: (user) => {
      console.log('Signed up with passkey:', user);
      // Automatically create wallet after signup
      handleCreateWallet();
    },
    onError: (error) => {
      console.error('Passkey signup error:', error);
    }
  });

  const { createWallet } = useCreateWallet({
    onSuccess: ({ wallet }) => {
      console.log('Created wallet:', wallet);
      alert(`Wallet created successfully! Address: ${wallet.address}`);
    },
    onError: (error) => {
      console.error('Failed to create wallet with error:', error);
      alert('Failed to create wallet');
    }
  });

  const handleCreateWallet = async () => {
    try {
      await createWallet();
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

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

  if (user) {
    console.log("user==>", user);
  }

  const handleExportEvm = async () => {
    try {
      const privyWallet = walletsEvm.find(w => w.walletClientType === 'privy');
      if (!privyWallet) {
        alert('No Privy EVM wallet found');
        return;
      }
      await exportWalletEvm({ address: privyWallet.address });
      console.log("EVM wallet exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      alert('Failed to export EVM wallet');
    }
  }

  const handleExportSolana = async () => {
    try {
      const privyWallet = walletsSolana.find(w => w.standardWallet.name === 'privy');
      if (!privyWallet) {
        alert('No Privy Solana wallet found');
        return;
      }
      await exportWalletSolana({ address: privyWallet.address });
      console.log("Solana wallet exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      alert('Failed to export Solana wallet');
    }
  }

  const handleImportEvm = async () => {
    if (!privateKey.trim()) {
      alert('Please enter a private key');
      return;
    }
    try {
      await importWalletEvm({ privateKey });
      console.log("EVM wallet imported successfully");
      setPrivateKey('');
      alert('EVM wallet imported successfully');
    } catch (error) {
      console.error("Import error:", error);
      alert('Failed to import EVM wallet');
    }
  }

  const handleImportSolana = async () => {
    if (!privateKey.trim()) {
      alert('Please enter a private key');
      return;
    }
    try {
      await importWalletSolana({ privateKey });
      console.log("Solana wallet imported successfully");
      setPrivateKey('');
      alert('Solana wallet imported successfully');
    } catch (error) {
      console.error("Import error:", error);
      alert('Failed to import Solana wallet');
    }
  }

  // Wallet Actions
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
        buttonText: 'Sign Message'
      };
      const { signature } = await signMessageEvm(
        { message },
        {
          uiOptions,
          address: selectedWallet.address
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
          wallet.walletClientType === 'privy' &&
          wallet.address === selectedWallet.address
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

  const handleSwitch = async () => {
    // await swi
  };

  const handleLinkPasskey = async () => {
    try {
      await linkWithPasskey();
    } catch (error) {
      console.error('Error linking passkey:', error);
    }
  };

  const handleUnlinkPasskey = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    // Find passkey accounts
    const passkeyAccounts = user.linkedAccounts.filter(
      (account) => account.type === 'passkey'
    );

    if (passkeyAccounts.length === 0) {
      alert('No passkeys found to unlink');
      return;
    }

    // If multiple passkeys, show selection (for now, we'll unlink the first one)
    const passkeyToUnlink = passkeyAccounts[0];
    
    try {
      await unlinkPasskey(passkeyToUnlink.credentialId);
      alert('Passkey unlinked successfully!');
      console.log('Unlinked passkey:', passkeyToUnlink.credentialId);
    } catch (error) {
      console.error('Error unlinking passkey:', error);
      alert('Failed to unlink passkey');
    }
  };

  // Get passkey info for display
  const passkeyAccounts = user?.linkedAccounts.filter(
    (account) => account.type === 'passkey'
  ) || [];

  return (
    <>
      <div className='min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 overflow-auto'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-12'>
            <h1 className='text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600'>
              Wallet Management Dashboard
            </h1>
            <p className='text-gray-400 text-lg'>Manage your EVM and Solana wallets with ease</p>
          </div>

          {/* Passkey Management Section */}
          {user && (
            <div className='mb-8 bg-gradient-to-r from-purple-800 to-gray-700 p-6 rounded-xl shadow-2xl border border-purple-600'>
              <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
                <span className='text-purple-400'>🔑</span> Passkey Management
              </h2>
              <div className='mb-4'>
                <p className='text-gray-300 mb-2'>
                  Linked Passkeys: <span className='text-white font-semibold'>{passkeyAccounts.length}</span>
                </p>
                {passkeyAccounts.length > 0 && (
                  <div className='bg-gray-900 p-3 rounded-lg border border-gray-700 mb-3'>
                    {passkeyAccounts.map((account, index) => (
                      <div key={account.credentialId} className='text-sm text-gray-400 mb-1'>
                        <span className='text-purple-400'>Passkey {index + 1}:</span>{' '}
                        <span className='font-mono text-xs'>{account.credentialId.slice(0, 30)}...</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className='flex flex-wrap gap-3'>
                <button
                  onClick={handleLinkPasskey}
                  className='bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-purple-500/50'
                >
                  ➕ Link New Passkey
                </button>
                <button
                  onClick={handleUnlinkPasskey}
                  className='bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={passkeyAccounts.length === 0}
                >
                  ❌ Unlink Passkey
                </button>
              </div>
            </div>
          )}

          {/* Authentication Section */}
          <div className='mb-8 bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-2xl border border-gray-600'>
            <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
              <span className='text-blue-400'>🔐</span> Authentication
            </h2>
            <div className='flex flex-wrap gap-3 items-center'>
              <button
                onClick={login}
                className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/50'
              >
                Login
              </button>
              <button
                onClick={() => loginWithPasskey()}
                className='bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-cyan-500/50'
              >
                Login with Passkey
              </button>
              <button
                onClick={() => signupWithPasskey()}
                className='bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-teal-500/50'
              >
                Sign up with Passkey
              </button>
              {user && (
                <>
                  <button
                    onClick={logout}
                    className='bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-red-500/50'
                  >
                    Logout
                  </button>
                  <span className='text-green-400 font-semibold bg-gray-800 px-4 py-2 rounded-lg border border-green-500/30'>
                    ✓ Logged in as: {user.id.slice(0, 20)}...
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Wallet Selector Section */}
          <div className='mb-8 bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-2xl border border-gray-600'>
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
                <p className='text-sm text-gray-400'>Selected: <span className='text-white font-mono'>{selectedWallet.address}</span></p>
                <p className='text-sm text-gray-400'>Type: <span className='text-purple-400 font-semibold'>{selectedWallet.type === 'ethereum' ? '⟠ Ethereum' : '◎ Solana'}</span></p>
              </div>
            )}
          </div>

          {/* Wallet Creation & Account Management Section */}
          <div className='mb-8 bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-2xl border border-gray-600'>
            <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
              <span className='text-green-400'>🔗</span> Wallet Creation & Account Management
            </h2>
            <div className='flex flex-wrap gap-3'>
              <button
                onClick={handleCreateWallet}
                className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={!user}
              >
                ➕ Create New Wallet
              </button>
              <button
                onClick={() => linkEmail()}
                className='bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-green-500/50'
              >
                Link Gmail
              </button>
              <button
                onClick={handleSwitch}
                className='bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-amber-500/50'
              >
                Switch Network
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
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

          {/* Signing Operations */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8'>
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
                  ⟠ EVM
                </button>
                <button
                  onClick={handleSignMessageSolana}
                  className='bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={!isSolanaWallet}
                >
                  ◎ Solana
                </button>
              </div>
            </div>

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
                  className='bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
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
              <p className='text-gray-400 text-sm mb-4'>Sign and broadcast transactions</p>
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
                  className='bg-gradient-to-r from-rose-500 to-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-rose-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={!isSolanaWallet}
                >
                  ◎ Solana
                </button>
              </div>
            </div>
          </div>

          {/* Advanced EVM Actions Section */}
          <div className='bg-gradient-to-br from-indigo-900/30 to-gray-800 p-6 rounded-xl shadow-2xl border border-indigo-500/30'>
            <h2 className='text-2xl font-bold mb-4 text-white flex items-center gap-2'>
              <span className='text-indigo-400'>⚡</span> Advanced EVM Actions
            </h2>
            <p className='text-gray-400 text-sm mb-4'>Advanced signing operations for Ethereum</p>
            <div className='flex flex-wrap gap-3'>
              <button
                onClick={handleSignTypedData}
                className='bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={!isEvmWallet}
              >
                Sign Typed Data (EIP-712)
              </button>
              <button
                onClick={handleSignRawHash}
                className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={!isEvmWallet}
              >
                Sign Raw Hash
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
