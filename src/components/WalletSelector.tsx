import type { WalletInfo } from '../types/wallet.types';

interface WalletSelectorProps {
  wallets: WalletInfo[];
  selectedWallet: WalletInfo | null;
  onSelectWallet: (wallet: WalletInfo | null) => void;
}

const WalletSelector = ({ wallets, selectedWallet, onSelectWallet }: WalletSelectorProps) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Select Wallet</h2>
      <select
        value={selectedWallet?.address || ''}
        onChange={(e) => {
          const wallet = wallets.find((w) => w.address === e.target.value);
          onSelectWallet(wallet || null);
        }}
        className="w-full px-4 py-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
      >
        {wallets.length === 0 ? (
          <option value="">No wallets available</option>
        ) : (
          <>
            <option value="">Select a wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.address} value={wallet.address}>
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)} [{wallet.type}]
              </option>
            ))}
          </>
        )}
      </select>
      
      {selectedWallet && (
        <div className="mt-4 bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">Selected Wallet</p>
          <p className="text-white font-mono text-sm break-all">{selectedWallet.address}</p>
          <p className="text-blue-400 text-sm mt-1">Type: {selectedWallet.type}</p>
        </div>
      )}
    </div>
  );
};

export default WalletSelector;
