// client/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Login from './components/Login';
import AdminPage from './components/AdminPage';
import DriverPage from './components/DriverPage';
import MaintenancePage from './components/MaintenancePage';
import FuelingPage from './components/FuelingPage';



const App = () => {
  const [user, setUser] = useState(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const handleLogout = () => {
    setUser(null);
    setIsLoggedOut(true);
  };


  return (
    <div>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedOut ? (
                <div>You need to log in again.</div>
              ) : (
                <Login setUser={setUser} />
              )
            }
            onNavigate={() => {
              handleLogout();
            }}
          />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminPage user={user} /> : <Navigate to="/" />} />
          <Route path="/driver" element={user?.role === 'driver' ? <DriverPage user={user} /> : <Navigate to="/" />} />
          <Route
            path="/maintenance"
            element={user?.role === 'maintenance' ? <MaintenancePage user={user} /> : <Navigate to="/" />}
          />
          <Route path="/fueling" element={user?.role === 'fueling' ? <FuelingPage user={user} /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
    
  );
};

export default App;
