import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
      <Link to="/" className="text-blue-500 underline">Return to Home</Link>
    </div>
  );
};

export default Unauthorized;
