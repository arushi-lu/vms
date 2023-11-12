// client/src/components/AdminPage.js

// client/src/components/DriverPage.js

import React from 'react';

const DriverPage = ({ user }) => {
  return (
    <div>
      <h2>Welcome, Driver, whoese user name = {user.name}!</h2>
      {/* Add driver-specific content and functionality here */}
    </div>
  );
};

export default DriverPage;
