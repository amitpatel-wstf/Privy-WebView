import { WalletInfo } from '../types/wallet.types';

interface WalletActionsProps {
  selectedWallet: WalletInfo | null;
  onSignMessage: () => void;
  onSignTransaction: () => void;
  onSendTransaction: () => void;
  onSignTypedData?: () => void;
  onSignRawHash?: () => void;
}

const WalletActions = ({
  selectedWallet,
  onSignMessage,
  onSignTransaction,
  onSendTransaction,
  onSignTypedData,
  onSignRawHash,
}: WalletActionsProps) => {
  const isEvmWallet = selectedWallet?.type === 'ethereum';
  const isSolanaWallet = selectedWallet?.type === 'solana';

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Wallet Actions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Sign Message</h3>
          <button
            onClick={onSignMessage}
            disabled={!selectedWallet}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded font-medium"
          >
            Sign Message
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Sign Transaction</h3>
          <button
            onClick={onSignTransaction}
            disabled={!selectedWallet}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded font-medium"
          >
            Sign Transaction
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Send Transaction</h3>
          <button
            onClick={onSendTransaction}
            disabled={!selectedWallet}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded font-medium"
          >
            Send Transaction
          </button>
        </div>

        {isEvmWallet && onSignTypedData && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Sign Typed Data</h3>
            <button
              onClick={onSignTypedData}
              disabled={!isEvmWallet}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded font-medium"
            >
              Sign Typed Data (EVM)
            </button>
          </div>
        )}

        {isEvmWallet && onSignRawHash && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Sign Raw Hash</h3>
            <button
              onClick={onSignRawHash}
              disabled={!isEvmWallet}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded font-medium"
            >
              Sign Raw Hash (EVM)
            </button>
          </div>
        )}
      </div>

      {!selectedWallet && (
        <p className="text-gray-400 text-center mt-4">Please select a wallet to perform actions</p>
      )}
    </div>
  );
};

export default WalletActions;
