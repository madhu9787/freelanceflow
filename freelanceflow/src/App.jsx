
// import React, { useContext } from 'react';
// import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// import { AuthContext } from './AuthContext';
// import ProtectedRoute from './ProtectedRoute';

// import Welcome from './Welcome';
// import Home from './Home';
// import About from './About';
// import Login from './Login';
// import Signup from './Signup';
// import PostProject from './PostProject';
// import FindProjects from './FindProjects';
// import Contact from "./components/Contact";
// import NavBar from './components/NavBar';
// import Services from './Services';
// import ChatUI from './ChatUI';
// import './App.css'; // Make sure we can add button styles here



// const App = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   return (
//     <div>
//       <NavBar />

//       <Routes>
//         <Route path="/" element={user ? <Navigate to="/home" replace /> : <Welcome />} />

//         {/* Protected routes */}
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
//           path="/contact"
//           element={
//             <ProtectedRoute>
//               <About />
//             </ProtectedRoute>
//           }
//         />
        
//         {/* Freelancer route */}
//         <Route
//           path="/find-projects"
//           element={
//             <ProtectedRoute>
//               <FindProjects />
//             </ProtectedRoute>
//           }
//         />

//         {/* Client route */}
//         <Route
//           path="/post-project"
//           element={
//             <ProtectedRoute>
//               <PostProject />
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
//           path="/chat"
//           element={
//             <ProtectedRoute>
//               <ChatUI />
//             </ProtectedRoute>
//           }
//         />
        


//         {/* Auth routes */}
//         <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
//         <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <Signup />} />

//         {/* Catch-all */}
//         <Route path="*" element={<Navigate to={user ? '/home' : '/'} replace />} />
//       </Routes>

//       {/* 💬 Floating Chat Button */}
//       <button
//         onClick={() => navigate('/chat')}
//         className="floating-chat-button"
//         title="Chat with AI Assistant"
//       >
//         💬
//       </button>
//     </div>
//   );
// };

// export default App;
import React, { useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

import Welcome from './Welcome';
import Home from './Home';
import About from './About';
import Login from './Login';
import Signup from './Signup';
import PostProject from './PostProject';
import FindProjects from './FindProjects';

import Contact from "./components/Contact";
import NavBar from './components/NavBar';
import Services from './Services';
import ChatUI from './ChatUI';
import './App.css'; // Make sure we can add button styles here
import MyGigs from "./pages/MyGigs";

const App = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div>
      <NavBar />

      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Welcome />} />

        {/* Protected routes */}
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
          path="/contact"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        
        {/* Freelancer routes */}
        <Route
          path="/find-projects"
          element={
            <ProtectedRoute>
              <FindProjects />
            </ProtectedRoute>
          }
        />

        {/* ✅ My Gigs route added
        <Route
          path="/my-gigs"
          element={
            <ProtectedRoute>
              <MyGigs />
            </ProtectedRoute>
          }
        /> */}

     
        {/* Client route */}
        <Route
          path="/post-project"
          element={
            <ProtectedRoute>
              <PostProject />
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
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatUI />
            </ProtectedRoute>
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <Signup />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={user ? '/home' : '/'} replace />} />
      </Routes>

      {/* 💬 Floating Chat Button */}
      <button
        onClick={() => navigate('/chat')}
        className="floating-chat-button"
        title="Chat with AI Assistant"
      >
        💬
      </button>
    </div>
  );
};

export default App;
