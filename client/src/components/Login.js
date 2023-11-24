// client/src/components/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { name: username, password });

      if (!response || !response.data) {
        console.error('Login response is missing data.');
        return;
      }

      const user = response.data.user;

      setUser(user);

      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'driver':
          navigate('/driver');
          break;
        case 'maintenance':
          navigate('/maintenance');
          break;
        case 'fueling':
          navigate('/fueling');
          break;
        default:
          console.error('Unknown role:', user.role);
      }
    } catch (error) {
      console.error('Error logging in:', error.response?.data?.error || 'Unknown error');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;




