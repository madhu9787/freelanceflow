
// import React, { useContext } from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// import { AuthProvider, AuthContext } from './AuthContext';
// import ProtectedRoute from './ProtectedRoute';
// import ChatUI from './ChatUI';
// import Welcome from './Welcome';
// import Home from './Home';
// import About from './About';
// import Login from './Login';
// import Signup from './Signup';
// import Profile from './Profile';
// import FindProjects from './FindProjects';
// import PostProject from './PostProject';
// import NavBar from './components/NavBar';
// import Services from './Services';
// import Contact from './Contact';
// import './App.css'; // 👈 Make sure this CSS file is imported
// import FloatingChat from "./components/FloatingChat";

// const App = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   return (
//     <>
//       <NavBar />
//       <Routes>
//         <Route path="/" element={user ? <Navigate to="/home" replace /> : <Welcome />} />

//         {/* Protected Routes */}
//         <Route
//           path="/home"
//           element={
//             <ProtectedRoute>
//               <Home />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/about"
//           element={
//             <ProtectedRoute>
//               <About />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/services"
//           element={
//             <ProtectedRoute>
//               <Services />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/contact"
//           element={
//             <ProtectedRoute>
//               <Contact />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/profile"
//           element={
//             <ProtectedRoute>
//               <Profile />
//             </ProtectedRoute>
//           }
//         />

//         {/* Freelancer Page */}
//         <Route
//           path="/find-projects"
//           element={
//             <ProtectedRoute>
//               <FindProjects />
//             </ProtectedRoute>
//           }
//         />

//         {/* Client Page */}
//         <Route
//           path="/post-project"
//           element={
//             <ProtectedRoute>
//               <PostProject />
//             </ProtectedRoute>
//           }
//         />

//         {/* AI Chat Route */}
//         <Route
//           path="/chat"
//           element={
//             <ProtectedRoute>
//               <ChatUI />
//             </ProtectedRoute>
//           }
//         />

//         {/* Public Routes */}
//         <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
//         <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <Signup />} />

//         {/* Fallback Route */}
//         <Route path="*" element={<Navigate to={user ? '/home' : '/'} replace />} />
//       </Routes>
//       <FloatingChat />


//       {/* 💬 Floating Chat Button */}
//       <button
//         onClick={() => navigate('/chat')}
//         className="floating-chat-button"
//         title="Chat with AI Assistant"
//       >
//         💬
//       </button>
//     </>
//   );
// };

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <AuthProvider>
//       <BrowserRouter>
//         <App />
//       </BrowserRouter>
//     </AuthProvider>
//   </React.StrictMode>
// );

// import React, { useContext } from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// import { AuthProvider, AuthContext } from './AuthContext';
// import ProtectedRoute from './ProtectedRoute';
// import ChatUI from './ChatUI';
// import Welcome from './Welcome';
// import Home from './Home';
// import About from './About';
// import Login from './Login';
// import Signup from './Signup';

// import FindProjects from './FindProjects';
// import PostProject from './PostProject';
// import NavBar from './components/NavBar';
// import Services from './Services';
// import Contact from './Contact';
// import './App.css';
// import FloatingChat from "./components/FloatingChat"; // 🆕 imported stylish floating chat
// import MyGigs from "./MyGigs";
// const App = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   return (
//     <>
//       <NavBar />
//       <Routes>
//         <Route path="/" element={user ? <Navigate to="/home" replace /> : <Welcome />} />

//         {/* Protected Routes */}
//         <Route
//           path="/home"
//           element={
//             <ProtectedRoute>
//               <Home />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/about"
//           element={
//             <ProtectedRoute>
//               <About />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/services"
//           element={
//             <ProtectedRoute>
//               <Services />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/contact"
//           element={
//             <ProtectedRoute>
//               <Contact />
//             </ProtectedRoute>
//           }
//         />


//         {/* Freelancer Page */}
//         <Route
//           path="/find-projects"
//           element={
//             <ProtectedRoute>
//               <FindProjects />
//             </ProtectedRoute>
//           }
//         />

//         {/* Client Page */}
//         <Route
//           path="/post-project"
//           element={
//             <ProtectedRoute>
//               <PostProject />
//             </ProtectedRoute>
//           }
//         />

//         {/* AI Chat Route */}
//         <Route
//           path="/chat"
//           element={
//             <ProtectedRoute>
//               <ChatUI />
//             </ProtectedRoute>
//           }
//         />
//           <Route
//                     path="/my-gigs"
//                     element={
//                       <ProtectedRoute>
//                         <MyGigs />
//                       </ProtectedRoute>
//                     }
//                   />

//         {/* Public Routes */}
//         <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
//         <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <Signup />} />

//         {/* Fallback Route */}
//         <Route path="*" element={<Navigate to={user ? '/home' : '/'} replace />} />
//       </Routes>

//       {/* 🧩 Add the Ribit Animated Floating Chat Popup (appears on all pages) */}
//       <FloatingChat />

//     </>
//   );
// };

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <AuthProvider>
//       <BrowserRouter>
//         <App />
//       </BrowserRouter>
//     </AuthProvider>
//   </React.StrictMode>
// );
import React, { useContext } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { ClerkProvider } from "@clerk/clerk-react";
import ClerkLogin from "./ClerkLogin";

import { AuthProvider, AuthContext } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";

import NavBar from "./components/NavBar";
import FloatingChat from "./components/FloatingChat";

import Welcome from "./Welcome";
import Home from "./Home";
import About from "./About";
import Services from "./Services";
import Contact from "./Contact";
import ChatUI from "./ChatUI";

import Login from "./Login";
import Signup from "./Signup";

import FindProjects from "./FindProjects";
import PostProject from "./PostProject";
import MyGigs from "./MyGigs";
import "./App.css";

/* =========================
   APP ROUTES
========================= */
const App = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <>
      <NavBar />

      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/home" replace /> : <Welcome />}
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />

        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />

        <Route
          path="/find-projects"
          element={
            <ProtectedRoute>
              <FindProjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-project"
          element={
            <ProtectedRoute>
              <PostProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatUI />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-gigs"
          element={
            <ProtectedRoute>
              <MyGigs />
            </ProtectedRoute>
          }
        />


        {/* Public Routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route path="/clerk-login" element={<ClerkLogin />} />

        <Route
          path="/signup"
          element={user ? <Navigate to="/home" replace /> : <Signup />}
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={user ? "/home" : "/"} replace />}
        />
      </Routes>

      <FloatingChat />
    </>
  );
};

/* =========================
   ROOT RENDER
========================= */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ClerkProvider>
  </React.StrictMode>
);

