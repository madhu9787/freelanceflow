
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="welcome-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ✅ ENHANCED: Animated gradient background */}
      <div className="welcome-background">
        <div className="floating-shapes">
          <motion.div className="shape shape-1" animate={{ y: [-20, 20, -20] }} transition={{ duration: 6, repeat: Infinity }} />
          <motion.div className="shape shape-2" animate={{ y: [-30, 30, -30], rotate: 180 }} transition={{ duration: 8, repeat: Infinity }} />
          <motion.div className="shape shape-3" animate={{ y: [-15, 15, -15] }} transition={{ duration: 10, repeat: Infinity }} />
        </div>
      </div>

      {/* ✅ ENHANCED: Content with glassmorphism */}
      <div className="welcome-content">
        <motion.div
          className="welcome-logo"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          🚀
        </motion.div>

        <motion.h1
          className="welcome-title"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Welcome to <span className="gradient-text">FreelanceFlow</span>
        </motion.h1>

        <motion.p
          className="welcome-subtitle"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Connect clients & freelancers with real-time bidding, payments & chat.
          <span className="highlight"> Start your journey!</span>
        </motion.p>

        {/* ✅ ENHANCED: Staggered buttons */}
        <motion.div
          className="welcome-buttons"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.05, boxShadow: "0 15px 35px rgba(75, 0, 130, 0.6)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/signup')}
          >
            🚀 Sign Up - Start Now
          </motion.button>

          <motion.button
            className="btn btn-secondary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
          >
            👤 Login - Get Started
          </motion.button>
        </motion.div>

        {/* ✅ NEW: Feature highlights */}
        <motion.div
          className="features-preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="feature-item">
            <span className="feature-icon">⚡</span> Real-time Bidding
          </div>
          <div className="feature-item">
            <span className="feature-icon">🛡️</span> Secure Escrow
          </div>
          <div className="feature-item">
            <span className="feature-icon">💬</span> Live Chat
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Welcome;
