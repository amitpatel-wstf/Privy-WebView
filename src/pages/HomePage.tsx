import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { authenticated, user } = usePrivy();
  const navigate = useNavigate();

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 flex items-center justify-center'>
      <div className='max-w-4xl w-full'>
        <div className='text-center mb-12'>
          <h1 className='text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600'>
            Wallet Management Dashboard
          </h1>
          <p className='text-gray-400 text-xl mb-8'>
            Manage your EVM and Solana wallets with ease
          </p>
          {authenticated && user && (
            <div className='bg-gray-800 p-4 rounded-lg border border-green-500/30 inline-block'>
              <p className='text-green-400 font-semibold'>
                ✓ Logged in as: {user.id.slice(0, 20)}...
              </p>
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <button
            onClick={() => navigate('/login')}
            className='bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-xl font-semibold text-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/50 flex flex-col items-center gap-4'
          >
            <span className='text-5xl'>🔐</span>
            <span>Authentication</span>
            <span className='text-sm text-blue-200'>Login, Logout & Passkeys</span>
          </button>

          <button
            onClick={() => navigate('/wallets')}
            className='bg-gradient-to-r from-purple-500 to-purple-600 text-white p-8 rounded-xl font-semibold text-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-purple-500/50 flex flex-col items-center gap-4'
          >
            <span className='text-5xl'>👛</span>
            <span>Wallet Management</span>
            <span className='text-sm text-purple-200'>Create, Import & Export</span>
          </button>

          <button
            onClick={() => navigate('/sign-message')}
            className='bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-8 rounded-xl font-semibold text-xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-yellow-500/50 flex flex-col items-center gap-4'
          >
            <span className='text-5xl'>✍️</span>
            <span>Sign Messages</span>
            <span className='text-sm text-yellow-200'>EVM & Solana Signing</span>
          </button>

          <button
            onClick={() => navigate('/sign-transaction')}
            className='bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-xl font-semibold text-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-red-500/50 flex flex-col items-center gap-4'
          >
            <span className='text-5xl'>📝</span>
            <span>Transactions</span>
            <span className='text-sm text-red-200'>Sign & Send Transactions</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
