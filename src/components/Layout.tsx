import { Link, useLocation } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { authenticated, user } = usePrivy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      {/* Navigation */}
      <nav className='bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-2 sm:gap-4 md:gap-8'>
              <Link to='/' className='text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 whitespace-nowrap'>
                Wallet Dashboard
              </Link>
              <div className='hidden md:flex gap-2'>
                <Link
                  to='/'
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    isActive('/')
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Home
                </Link>
                {!authenticated && (
                  <Link
                    to='/login'
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      isActive('/login')
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    Login
                  </Link>
                )}
                {authenticated && (
                  <>
                    <Link
                      to='/wallets'
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        isActive('/wallets')
                          ? 'bg-purple-500 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Wallets
                    </Link>
                    <Link
                      to='/sign-message'
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        isActive('/sign-message')
                          ? 'bg-yellow-500 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Sign Message
                    </Link>
                    <Link
                      to='/sign-transaction'
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        isActive('/sign-transaction')
                          ? 'bg-red-500 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Transactions
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className='flex items-center gap-2 sm:gap-4'>
              {authenticated && user && (
                <div className='hidden sm:block text-green-400 font-semibold bg-gray-800 px-2 sm:px-4 py-2 rounded-lg border border-green-500/30 text-xs sm:text-sm'>
                  ✓ {user.id.slice(0, 10)}...
                </div>
              )}
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className='md:hidden text-gray-300 hover:text-white p-2'
                aria-label='Toggle menu'
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  {mobileMenuOpen ? (
                    <path d='M6 18L18 6M6 6l12 12' />
                  ) : (
                    <path d='M4 6h16M4 12h16M4 18h16' />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className='md:hidden pb-4 space-y-2'>
              <Link
                to='/'
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive('/')
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Home
              </Link>
              {!authenticated && (
                <Link
                  to='/login'
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/login')
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Login
                </Link>
              )}
              {authenticated && (
                <>
                  <Link
                    to='/wallets'
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive('/wallets')
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    Wallets
                  </Link>
                  <Link
                    to='/sign-message'
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive('/sign-message')
                        ? 'bg-yellow-500 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    Sign Message
                  </Link>
                  <Link
                    to='/sign-transaction'
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive('/sign-transaction')
                        ? 'bg-red-500 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    Transactions
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto p-4 sm:p-6 md:p-8'>{children}</main>
    </div>
  );
};

export default Layout;
