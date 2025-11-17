import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import WalletsPage from './pages/WalletsPage';
import SignMessagePage from './pages/SignMessagePage';
import SignTransactionPage from './pages/SignTransactionPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppRoutes() {
  const { authenticated, ready } = usePrivy();

  if (!ready) {
    return (
      <div className='min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center'>
        <div className='text-white text-xl'>Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path='/' 
        element={authenticated ? <Navigate to='/wallets' replace /> : <Navigate to='/login' replace />} 
      />
      <Route 
        path='/login' 
        element={authenticated ? <Navigate to='/wallets' replace /> : <LoginPage />} 
      />
      <Route 
        path='/wallets' 
        element={
          <ProtectedRoute>
            <WalletsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path='/sign-message' 
        element={
          <ProtectedRoute>
            <SignMessagePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path='/sign-transaction' 
        element={
          <ProtectedRoute>
            <SignTransactionPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  );
}

export default App;
