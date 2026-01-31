// import React, { createContext, useState, useEffect } from 'react';

// // Create Auth context
// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem('freelanceflow-user');
//     return savedUser ? JSON.parse(savedUser) : null;
//   });

//   useEffect(() => {
//     if (user) localStorage.setItem('freelanceflow-user', JSON.stringify(user));
//     else localStorage.removeItem('freelanceflow-user');
//   }, [user]);

//   const login = (userData) => setUser(userData);
//   const logout = () => setUser(null);

//   return (
//     <AuthContext.Provider value={{ user, setUser, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
// AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

// Create Auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('freelanceflow-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('freelanceflow-user', JSON.stringify(user));
    else localStorage.removeItem('freelanceflow-user');
  }, [user]);

  const login = (userData) => setUser(userData);  // used by Mongo & Clerk flows
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
