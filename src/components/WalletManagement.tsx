import { useState } from 'react';

interface WalletManagementProps {
  onExportEvm: () => void;
  onExportSolana: () => void;
  onImportEvm: (privateKey: string) => void;
  onImportSolana: (privateKey: string) => void;
  isLoggedIn: boolean;
}

const WalletManagement = ({
  onExportEvm,
  onExportSolana,
  onImportEvm,
  onImportSolana,
  isLoggedIn,
}: WalletManagementProps) => {
  const [privateKey, setPrivateKey] = useState('');
  const [importType, setImportType] = useState<'evm' | 'solana'>('evm');

  const handleImport = () => {
    if (!privateKey.trim()) {
      alert('Please enter a private key');
      return;
    }
    if (importType === 'evm') {
      onImportEvm(privateKey);
    } else {
      onImportSolana(privateKey);
    }
    setPrivateKey('');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Wallet Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Export Wallet</h3>
          <div className="space-y-2">
            <button
              onClick={onExportEvm}
              disabled={!isLoggedIn}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded font-medium"
            >
              Export EVM Wallet
            </button>
            <button
              onClick={onExportSolana}
              disabled={!isLoggedIn}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded font-medium"
            >
              Export Solana Wallet
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Import Wallet</h3>
          <div className="space-y-2">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setImportType('evm')}
                className={`flex-1 px-3 py-2 rounded ${
                  importType === 'evm'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                EVM
              </button>
              <button
                onClick={() => setImportType('solana')}
                className={`flex-1 px-3 py-2 rounded ${
                  importType === 'solana'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                Solana
              </button>
            </div>
            <input
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder={`Enter ${importType === 'evm' ? '0x...' : 'base58'} private key`}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-purple-500 outline-none"
            />
            <button
              onClick={handleImport}
              disabled={!privateKey.trim()}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded font-medium"
            >
              Import {importType === 'evm' ? 'EVM' : 'Solana'} Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletManagement;
