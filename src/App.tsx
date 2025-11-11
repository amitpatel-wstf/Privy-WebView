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
  useLinkAccount
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

  const { login, logout, user, exportWallet: exportWalletEvm } = usePrivy();
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


  const { loginWithPasskey } = useLoginWithPasskey();

  const { signupWithPasskey } = useSignupWithPasskey();

  const {linkEmail} = useLinkAccount();



  const mainD = async () => {
    const { createWallet } = useCreateWallet({
      onSuccess: ({ wallet }) => {
        console.log('Created wallet ', wallet);
      },
      onError: (error) => {
        console.error('Failed to create wallet with error ', error)
      }
    });
  }
  console.log("Hello, word")
  mainD();

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
  }

  return (
    <>
      <div className='min-h-[100vh] w-[100vw] bg-gray-900 p-8 overflow-auto'>
        <h1 className='text-3xl font-bold mb-6 text-white'>Wallet Management & Actions</h1>

        <div className='mb-6'>
          <button
            onClick={login}
            className='bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600'
          >
            Login
          </button>
          {user && (
            <>
              <button
                onClick={logout}
                className='bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600'
              >
                Logout
              </button>
              <span className='text-white'>Logged in as: {user.id}</span>
            </>
          )}
        </div>

        <div>
          <button onClick={loginWithPasskey}>Log in with passkey</button>
        </div>
        <div>
          <button onClick={signupWithPasskey}>Sign up with passkey</button>
        </div>
        {/* Wallet Selector */}
        <div className='mb-6 bg-gray-800 p-4 rounded'>
          <h2 className='text-xl font-semibold mb-2 text-white'>Select Wallet</h2>
          <select
            value={selectedWallet?.address || ''}
            onChange={(e) => {
              const wallet = allWallets.find((w) => w.address === e.target.value);
              setSelectedWallet(wallet || null);
            }}
            className='w-full px-3 py-2 border rounded bg-white text-black'
          >
            {allWallets.length === 0 ? (
              <option value=''>No wallets available</option>
            ) : (
              <>
                <option value=''>Select a wallet</option>
                {allWallets.map((wallet) => (
                  <option key={wallet.address} value={wallet.address}>
                    {wallet.address} [{wallet.type === 'ethereum' ? 'ethereum' : 'solana'}]
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div>
          <button onClick={ async ()=>{
            await linkEmail()
          }}>Link Gmail</button>
        </div>

        {/* switch chain */}
        <div>
          <h2>Switch Network</h2>
          <button onClick={handleSwitch}>Switch</button>
        </div>

        {/* Export Wallet */}
        <div className='mb-6 bg-gray-800 p-4 rounded'>
          <h2 className='text-xl font-semibold mb-2 text-white'>Export Wallet</h2>
          <button
            onClick={handleExportEvm}
            className='bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600'
            disabled={!user}
          >
            Export EVM Wallet
          </button>
          <button
            onClick={handleExportSolana}
            className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
            disabled={!user}
          >
            Export Solana Wallet
          </button>
        </div>

        {/* Import Wallet */}
        <div className='mb-6 bg-gray-800 p-4 rounded'>
          <h2 className='text-xl font-semibold mb-2 text-white'>Import Wallet</h2>
          <input
            type='text'
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder='Enter private key (0x... for EVM, base58 for Solana)'
            className='w-full px-3 py-2 border rounded mb-2'
          />
          <button
            onClick={handleImportEvm}
            className='bg-purple-500 text-white px-4 py-2 rounded mr-2 hover:bg-purple-600'
            disabled={!privateKey.trim()}
          >
            Import EVM Wallet
          </button>
          <button
            onClick={handleImportSolana}
            className='bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700'
            disabled={!privateKey.trim()}
          >
            Import Solana Wallet
          </button>
        </div>

        {/* Sign Messages */}
        <div className='mb-6 bg-gray-800 p-4 rounded'>
          <h2 className='text-xl font-semibold mb-2 text-white'>Sign Messages</h2>
          <button
            onClick={handleSignMessageEvm}
            className='bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600'
            disabled={!isEvmWallet}
          >
            Sign Message (EVM)
          </button>
          <button
            onClick={handleSignMessageSolana}
            className='bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700'
            disabled={!isSolanaWallet}
          >
            Sign Message (Solana)
          </button>
        </div>

        {/* Sign Transactions */}
        <div className='mb-6 bg-gray-800 p-4 rounded'>
          <h2 className='text-xl font-semibold mb-2 text-white'>Sign Transactions</h2>
          <button
            onClick={handleSignTransactionEvm}
            className='bg-orange-500 text-white px-4 py-2 rounded mr-2 hover:bg-orange-600'
            disabled={!isEvmWallet}
          >
            Sign Transaction (EVM)
          </button>
          <button
            onClick={handleSignTransactionSolana}
            className='bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700'
            disabled={!isSolanaWallet}
          >
            Sign Transaction (Solana)
          </button>
        </div>

        {/* Send Transactions */}
        <div className='mb-6 bg-gray-800 p-4 rounded'>
          <h2 className='text-xl font-semibold mb-2 text-white'>Send Transactions</h2>
          <button
            onClick={handleSendTransactionEvm}
            className='bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600'
            disabled={!isEvmWallet}
          >
            Send Transaction (EVM)
          </button>
          <button
            onClick={handleSendTransactionSolana}
            className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
            disabled={!isSolanaWallet}
          >
            Send Transaction (Solana)
          </button>
        </div>

        {/* Advanced EVM Actions */}
        <div className='mb-6 bg-gray-800 p-4 rounded'>
          <h2 className='text-xl font-semibold mb-2 text-white'>Advanced EVM Actions</h2>
          <button
            onClick={handleSignTypedData}
            className='bg-indigo-500 text-white px-4 py-2 rounded mr-2 hover:bg-indigo-600'
            disabled={!isEvmWallet}
          >
            Sign Typed Data (EVM)
          </button>
          <button
            onClick={handleSignRawHash}
            className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700'
            disabled={!isEvmWallet}
          >
            Sign Raw Hash (EVM)
          </button>
        </div>
      </div>
    </>
  )
}

export default App
