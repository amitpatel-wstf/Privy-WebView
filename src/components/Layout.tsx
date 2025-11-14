import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { authenticated, user } = usePrivy();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      {/* Navigation */}
      <nav className='bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-8'>
              <Link to='/' className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600'>
                Wallet Dashboard
              </Link>
              <div className='flex gap-2'>
                <Link
                  to='/'
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/')
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to='/login'
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/login')
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to='/wallets'
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/wallets')
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Wallets
                </Link>
                <Link
                  to='/sign-message'
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/sign-message')
                      ? 'bg-yellow-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Sign Message
                </Link>
                <Link
                  to='/sign-transaction'
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/sign-transaction')
                      ? 'bg-red-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Transactions
                </Link>
              </div>
            </div>
            {authenticated && user && (
              <div className='text-green-400 font-semibold bg-gray-800 px-4 py-2 rounded-lg border border-green-500/30'>
                ✓ {user.id.slice(0, 10)}...
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto p-8'>{children}</main>
    </div>
  );
};

export default Layout;
