// client/src/components/FuelingPage.js

import React from 'react';

const FuelingPage = ({ user }) => {
  return (
    <div>
      <h2>Welcome, Fueling Person with user name = {user.name}!</h2>
      {/* Add fueling-specific content and functionality here */}
    </div>
  );
};

export default FuelingPage;
