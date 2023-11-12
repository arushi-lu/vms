// client/src/components/AdminPage.js

import React from 'react';

const AdminPage = ({ user }) => {
  if (!user) {
    return <div>You must be logged in to view this page.</div>;
  }
  return (
    <div>
      <h2>Welcome, Admin, whose user name = {user.name}!</h2>
      
      {/* Add admin-specific content and functionality here */}
    </div>
  );
};

export default AdminPage;

