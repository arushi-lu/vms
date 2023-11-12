// client/src/components/MaintenancePage.js

import React from 'react';

const MaintenancePage = ({ user }) => {
  return (
    <div>
      <h2>Welcome, Maintenance Personnel with user name {user.name}!</h2>
      {/* Add maintenance-specific content and functionality here */}
    </div>
  );
};

export default MaintenancePage;
