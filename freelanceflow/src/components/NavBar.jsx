

import React, { useContext, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { useClerk, useUser } from "@clerk/clerk-react";
import "./NavBar.css";

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const { signOut } = useClerk();
  const { isSignedIn, user: clerkUser } = useUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (isSignedIn) await signOut();
      logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.addEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSignedIn && clerkUser && !user) {
      navigate("/home");
    }
  }, [isSignedIn, clerkUser]);

  const displayName =
    user?.name ||
    clerkUser?.firstName ||
    clerkUser?.emailAddresses?.[0]?.emailAddress;

  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : "U";

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-brand" onClick={() => navigate("/home")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="#4B0082"
          viewBox="0 0 24 24"
          className="logo-icon"
        >
          <circle cx="12" cy="12" r="10" stroke="#4B0082" strokeWidth="2" fill="none" />
          <path d="M8 12l2 2 4-4" stroke="#4B0082" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        <span className="app-name">FreelanceFlow</span>
      </div>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen((m) => !m)}
        aria-label="Toggle menu"
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
        <NavLink to="/home" className="nav-link" onClick={() => setMenuOpen(false)}>Home</NavLink>
        <NavLink to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</NavLink>
        <NavLink to="/services" className="nav-link" onClick={() => setMenuOpen(false)}>Services</NavLink>
        <NavLink to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</NavLink> {/* ✅ NEW */}
        <NavLink to="/chat" className="nav-link" onClick={() => setMenuOpen(false)}>💬 AI Chatbot</NavLink>

        {(user || isSignedIn) && (
          <>
            <span className="nav-user">
              <div className="avatar">{avatarLetter}</div>
              {displayName}
            </span>
            <button className="nav-link logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
