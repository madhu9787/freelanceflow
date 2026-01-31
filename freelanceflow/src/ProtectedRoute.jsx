// // import React, { useContext } from 'react';
// // import { Navigate } from 'react-router-dom';
// // import { AuthContext } from './AuthContext';

// // const ProtectedRoute = ({ children }) => {
// //   const { user } = useContext(AuthContext);
// //   if (!user) {
// //     return <Navigate to="/login" replace />;
// //   }
// //   return children;
// // };

// // export default ProtectedRoute;
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useUser } from "@clerk/clerk-react";

const ProtectedRoute = ({ children }) => {
  const { user: mongoUser } = useContext(AuthContext);
  const { isSignedIn } = useUser();

  // ✅ Allow if MongoDB user OR Clerk user is logged in
  if (!mongoUser && !isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
