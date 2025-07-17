import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';
import { useAlert } from '../hooks/useAlert.js';
import '../styles/Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Login: useEffect - checking isLoggedIn()', isLoggedIn());
    if (isLoggedIn()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login: handleSubmit called.');
    if (!username || !password) {
      showAlert('Both fields are required.', 'danger');
      return;
    }

    if (username === 'hanumant' && password === 'password') {
      onLogin();
      showAlert('Login successful!');
      console.log('Login: Successful login, navigating to /dashboard.');
      navigate('/dashboard');
    } else {
      showAlert('Invalid credentials.', 'danger');
      console.log('Login: Failed login.');
    }
  };

  return (
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54">
          <form className="login100-form validate-form" onSubmit={handleSubmit}>
            <span className="login100-form-title p-b-49">
              Login
            </span>

            <div className="wrap-input100 validate-input m-b-23" data-validate="Username is required">
              <span className="label-input100">Username</span>
              <input
                className="input100"
                type="text"
                name="username"
                placeholder="Type your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <span className="focus-input100" data-symbol="&#xf206;"></span>
            </div>

            <div className="wrap-input100 validate-input" data-validate="Password is required">
              <span className="label-input100">Password</span>
              <input
                className="input100"
                type="password"
                name="pass"
                placeholder="Type your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="focus-input100" data-symbol="&#xf190;"></span>
            </div>

            <div className="container-login100-form-btn">
              <div className="wrap-login100-form-btn">
                <div className="login100-form-bgbtn"></div>
                <button className="login100-form-btn" type="submit">
                  Login
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;