import React, { useState } from 'react';
import axios from 'axios';
import './Home.css';
import GuestPage from './GuestPage';

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

const HomePage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/login', { username, password });
      // Handle successful login, e.g., store user session/token or redirect
    } catch (error) {
      // Handle login error, e.g., display error message
    }
  };

  return (
    <Router>
      <div>
        <div className="title-bar">
          <h1 className="title">
            <span className="logo"></span>
            <Link to="/Home" className="title-button">myMessage</Link>
          </h1>
          <div className="button-container">
            <Link to="/guestPage" className="button">Try as Guest</Link>
            <button className="button">Features</button>
            <button className="button">About</button>
            <button className="button">Help</button>
          </div>
          <div className="login-container">
            <form onSubmit={handleFormSubmit} className="login-form">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Email" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
              <button type="submit" className="button">Login</button>
            </form>
          </div>
        </div>
        <div>
          {/* Content for the new div */}
        </div>
        <Switch>
          <Route path="/guestPage" component={GuestPage} />
        </Switch>
      </div>
    </Router>
  );
};

export default HomePage;
