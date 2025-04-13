import React from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, useLocation } from 'react-router-dom';
import SenderPage from './SenderPage';
import ReceiverPage from './ReceiverPage';
import User1 from './pages/User1';
import User2 from './pages/User2';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <NavBar />
        <Routes>
          <Route path="/" element={<SenderPage />} />
          <Route path="/receiver" element={<ReceiverPage />} />
          <Route path="/user1" element={<User1 />} />
          <Route path="/user2" element={<User2 />} />
        </Routes>
      </div>
    </Router>
  );
}

function NavBar() {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink 
          to="/"
          className={location.pathname === "/" ? "nav-link active" : "nav-link"}
        >
          Sender
        </NavLink>
        <NavLink 
          to="/receiver" 
          className={location.pathname === "/receiver" ? "nav-link active" : "nav-link"}
        >
          Receiver
        </NavLink>
        <NavLink 
          to="/user1"
          target="_blank" 
          className={location.pathname === "/user1" ? "nav-link active" : "nav-link"}
        >
          User 1
        </NavLink>
        <NavLink 
          to="/user2"
          target="_blank" 
          className={location.pathname === "/user2" ? "nav-link active" : "nav-link"}
        >
          User 2
        </NavLink>
      </div>
    </nav>
  );
}

export default App;