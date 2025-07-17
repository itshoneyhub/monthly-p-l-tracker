import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn, login, logout } from './utils/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Liabilities from './pages/Liabilities';
import Settings from './pages/Settings.jsx';
import Navbar from './components/Navbar.jsx';
import { AlertProvider } from './context/AlertProvider.jsx';

// PrivateRoute component to protect routes
const PrivateRoute = () => {
  const auth = isLoggedIn();
  console.log('PrivateRoute: Checking auth status:', auth);
  return auth ? <Outlet /> : <Navigate to="/login" />;
};

const App = () => {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  useEffect(() => {
    console.log('App: useEffect triggered. Current loggedIn state:', loggedIn);
    const handleStorageChange = () => {
      const newLoggedInStatus = isLoggedIn();
      console.log('App: Storage change detected. New loggedIn status:', newLoggedInStatus);
      setLoggedIn(newLoggedInStatus);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogin = () => {
    login();
    setLoggedIn(true);
    console.log('App: handleLogin called. loggedIn state set to true.');
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    console.log('App: handleLogout called. loggedIn state set to false.');
  };

  console.log('App: Rendering. Current loggedIn state:', loggedIn);

  return (
    <AlertProvider>
      <Router>
        {loggedIn && <Navbar onLogout={handleLogout} />}
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/liabilities" element={<Liabilities />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch-all route for unauthenticated users or unknown paths */}
          <Route path="*" element={<Navigate to={loggedIn ? "/" : "/login"} />} />
        </Routes>
      </Router>
    </AlertProvider>
  );
};

export default App;
