import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import WalletsPage from './pages/WalletsPage';
import SignMessagePage from './pages/SignMessagePage';
import SignTransactionPage from './pages/SignTransactionPage';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/wallets' element={<WalletsPage />} />
          <Route path='/sign-message' element={<SignMessagePage />} />
          <Route path='/sign-transaction' element={<SignTransactionPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
