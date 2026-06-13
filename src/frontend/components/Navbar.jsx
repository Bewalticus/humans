// Navbar Component
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="logo">🤖</span> Humans
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/conversations" className="nav-link">Conversations</Link>
          <Link to="/humans" className="nav-link">Humans</Link>
          <Link to="/discovery" className="nav-link">Discovery</Link>
        </div>

        <div className="navbar-auth">
          {user ? (
            <>
              <span className="user-greeting">Hello, {user.username}</span>
              <button onClick={logout} className="logout-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/register" className="register-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;