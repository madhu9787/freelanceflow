
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

