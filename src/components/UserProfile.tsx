import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';

const UserProfile = () => {
  const { user, linkEmail, linkPhone, linkWallet, unlinkEmail, unlinkPhone, unlinkWallet } = usePrivy();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  if (!user) return null;

  const handleLinkEmail = async () => {
    try {
      await linkEmail(email);
      setEmail('');
      alert('✅ Email linked successfully');
    } catch (error) {
      console.error(error);
      alert('❌ Failed to link email');
    }
  };

  const handleLinkPhone = async () => {
    try {
      await linkPhone(phone);
      setPhone('');
      alert('✅ Phone linked successfully');
    } catch (error) {
      console.error(error);
      alert('❌ Failed to link phone');
    }
  };

  const handleLinkWallet = async () => {
    try {
      await linkWallet();
      alert('✅ Wallet linked successfully');
    } catch (error) {
      console.error(error);
      alert('❌ Failed to link wallet');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">User Profile</h2>
      
      <div className="space-y-3 mb-6">
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-gray-400 text-sm">User ID</p>
          <p className="text-white font-mono text-sm break-all">{user.id}</p>
        </div>

        {user.email && (
          <div className="bg-gray-700 p-4 rounded flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-white">{user.email.address}</p>
            </div>
            <button
              onClick={() => unlinkEmail(user.email!.address)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Unlink
            </button>
          </div>
        )}

        {user.phone && (
          <div className="bg-gray-700 p-4 rounded flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Phone</p>
              <p className="text-white">{user.phone.number}</p>
            </div>
            <button
              onClick={() => unlinkPhone(user.phone!.number)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Unlink
            </button>
          </div>
        )}

        {user.wallet && (
          <div className="bg-gray-700 p-4 rounded flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Wallet</p>
              <p className="text-white font-mono text-sm break-all">{user.wallet.address}</p>
            </div>
            <button
              onClick={() => unlinkWallet(user.wallet!.address)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Unlink
            </button>
          </div>
        )}

        {user.linkedAccounts && user.linkedAccounts.length > 0 && (
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-gray-400 text-sm mb-2">Linked Accounts</p>
            <div className="space-y-2">
              {user.linkedAccounts.map((account, idx) => (
                <div key={idx} className="text-white text-sm">
                  <span className="text-blue-400">{account.type}</span>
                  {account.address && `: ${account.address.slice(0, 10)}...`}
                  {account.email && `: ${account.email}`}
                  {account.phone && `: ${account.phone}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-semibold mb-2">Link Email</h3>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleLinkEmail}
              disabled={!email}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded"
            >
              Link
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2">Link Phone</h3>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleLinkPhone}
              disabled={!phone}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded"
            >
              Link
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-2">Link External Wallet</h3>
          <button
            onClick={handleLinkWallet}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded w-full"
          >
            Connect External Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
