import React from "react";
import { Link } from "react-router-dom";
import { Translate } from "../components/Translate";

const Unauthorized: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">
        <Translate>Unauthorized</Translate>
      </h1>
      <p className="text-center">
        <Translate>You do not have permission to access this page.</Translate>
      </p>
      <Link to="/" className="text-primary hover:underline">
        <Translate>Return to Home</Translate>
      </Link>
    </div>
  );
};

export default Unauthorized;
