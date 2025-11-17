import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  usePrivy,
  useLoginWithPasskey,
  useSignupWithPasskey,
  useLinkWithPasskey,
  useLinkAccount,
} from '@privy-io/react-auth';

const LoginPage = () => {
  const { login, logout, user, authenticated, unlinkPasskey } = usePrivy();
  const navigate = useNavigate();
  const [selectedPasskeyId, setSelectedPasskeyId] = useState<string>('');
  const { linkEmail } = useLinkAccount();

  // Redirect to wallet page if already authenticated
  useEffect(() => {
    if (authenticated) {
      navigate('/wallets', { replace: true });
    }
  }, [authenticated, navigate]);

  const { linkWithPasskey } = useLinkWithPasskey({
    onSuccess: (user) => {
      console.log('Passkey linked successfully:', user);
      alert('Passkey linked successfully!');
    },
    onError: (error) => {
      console.error('Failed to link passkey:', error);
      alert('Failed to link passkey');
    },
  });

  const { loginWithPasskey } = useLoginWithPasskey({
    onComplete: (user) => {
      console.log('Logged in with passkey:', user);
      navigate('/wallets', { replace: true });
    },
    onError: (error) => {
      console.error('Passkey login error:', error);
    },
  });

  const { signupWithPasskey } = useSignupWithPasskey({
    onComplete: (user) => {
      console.log('Signed up with passkey:', user);
      navigate('/wallets', { replace: true });
    },
    onError: (error) => {
      console.error('Passkey signup error:', error);
    },
  });

  const handleLogin = async () => {
    try {
      await login();
      // Navigation will happen automatically via useEffect when authenticated changes
    } catch (error) {
      console.error('Login error:', error);
    }
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

    if (!selectedPasskeyId) {
      alert('Please select a passkey to unlink');
      return;
    }

    try {
      await unlinkPasskey(selectedPasskeyId);
      alert('Passkey unlinked successfully!');
      console.log('Unlinked passkey:', selectedPasskeyId);
      setSelectedPasskeyId('');
    } catch (error) {
      console.error('Error unlinking passkey:', error);
      alert('Failed to unlink passkey');
    }
  };

  const passkeyAccounts =
    user?.linkedAccounts.filter((account) => account.type === 'passkey') || [];

  return (
    <div className='space-y-4 sm:space-y-6 md:space-y-8'>
      {/* Authentication Section */}
      <div className='bg-gradient-to-r from-gray-800 to-gray-700 p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-600'>
        <h2 className='text-xl sm:text-2xl font-bold mb-4 text-white flex items-center gap-2'>
          <span className='text-blue-400'>🔐</span> Authentication
        </h2>
        <div className='flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center'>
          <button
            onClick={handleLogin}
            className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/50 text-sm sm:text-base'
          >
            Login
          </button>
          <button
            onClick={() => loginWithPasskey()}
            className='bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-cyan-500/50 text-sm sm:text-base'
          >
            Login with Passkey
          </button>
          <button
            onClick={() => signupWithPasskey()}
            className='bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-teal-500/50 text-sm sm:text-base'
          >
            Sign up with Passkey
          </button>
          {user && (
            <>
              <button
                onClick={logout}
                className='bg-gradient-to-r from-red-500 to-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-red-500/50 text-sm sm:text-base'
              >
                Logout
              </button>
              <span className='text-green-400 font-semibold bg-gray-800 px-3 sm:px-4 py-2 rounded-lg border border-green-500/30 text-xs sm:text-sm text-center'>
                ✓ Logged in as: {user.id.slice(0, 20)}...
              </span>
            </>
          )}
        </div>
      </div>

      {/* Passkey Management Section */}
      {user && (
        <div className='bg-gradient-to-r from-purple-800 to-gray-700 p-4 sm:p-6 rounded-xl shadow-2xl border border-purple-600'>
          <h2 className='text-xl sm:text-2xl font-bold mb-4 text-white flex items-center gap-2'>
            <span className='text-purple-400'>🔑</span> Passkey Management
          </h2>
          <div className='mb-4'>
            <p className='text-gray-300 mb-3'>
              Linked Passkeys:{' '}
              <span className='text-white font-semibold'>{passkeyAccounts.length}</span>
            </p>
            {passkeyAccounts.length > 0 && (
              <div className='mb-4'>
                <label className='block text-gray-300 mb-2 font-semibold'>
                  Select Passkey to Remove:
                </label>
                <select
                  value={selectedPasskeyId}
                  onChange={(e) => setSelectedPasskeyId(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-gray-600 rounded-lg bg-gray-900 text-white font-mono text-sm focus:border-purple-500 focus:outline-none transition-all'
                >
                  <option value=''>-- Select a passkey --</option>
                  {passkeyAccounts.map((account, index) => (
                    <option key={account.credentialId} value={account.credentialId}>
                      Passkey {index + 1}: {account.credentialId.slice(0, 40)}...
                    </option>
                  ))}
                </select>
                {selectedPasskeyId && (
                  <div className='mt-3 p-3 bg-gray-900 rounded-lg border border-red-500/30'>
                    <p className='text-sm text-gray-400'>
                      Selected:{' '}
                      <span className='text-red-400 font-mono text-xs break-all'>
                        {selectedPasskeyId}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className='flex flex-col sm:flex-row flex-wrap gap-3'>
            <button
              onClick={handleLinkPasskey}
              className='bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-purple-500/50 text-sm sm:text-base'
            >
              ➕ Link New Passkey
            </button>
            <button
              onClick={handleUnlinkPasskey}
              className='bg-gradient-to-r from-red-500 to-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
              disabled={!selectedPasskeyId}
            >
              ❌ Unlink Selected Passkey
            </button>
          </div>
        </div>
      )}

      {/* Account Linking Section */}
      {user && (
        <div className='bg-gradient-to-r from-gray-800 to-gray-700 p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-600'>
          <h2 className='text-xl sm:text-2xl font-bold mb-4 text-white flex items-center gap-2'>
            <span className='text-green-400'>🔗</span> Link Accounts
          </h2>
          <div className='flex flex-wrap gap-3'>
            <button
              onClick={() => linkEmail()}
              className='bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-green-500/50 text-sm sm:text-base'
            >
              Link Gmail
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
