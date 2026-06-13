// Frontend App Component
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConversationProvider } from './context/ConversationContext';
import { HumanProvider } from './context/HumanContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConversationPage from './pages/ConversationPage';
import HumansPage from './pages/HumansPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import './styles/global.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ConversationProvider>
          <HumanProvider>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                  <Route path="/conversations/:id" element={<PrivateRoute><ConversationPage /></PrivateRoute>} />
                  <Route path="/humans" element={<PrivateRoute><HumansPage /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                </Routes>
              </main>
            </div>
          </HumanProvider>
        </ConversationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;