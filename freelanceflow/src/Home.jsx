import React, { useEffect, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { FaRocket, FaBriefcase, FaUserGraduate, FaChartLine, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/welcome');
    } else if (!user.role) {
      setShowRoleSelector(true);
    }
  }, [user, navigate]);

  const handleRoleSelection = (role) => {
    const updatedUser = { ...user, role };
    setUser(updatedUser);
    setShowRoleSelector(false);

    // 🔥 AUTO-REDIRECT TO DASHBOARD AFTER ROLE SELECTION
    setTimeout(() => {
      navigate(role === 'client' ? '/post-project' : '/find-projects');
    }, 300);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (showRoleSelector) {
    return (
      <div className="super-home-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="role-selection-card glass-morphism"
        >
          <div className="premium-badge">NEW MEMBER</div>
          <h1>Define Your Path</h1>
          <p>Choose how you want to experience FreelanceFlow's professional ecosystem.</p>

          <div className="role-grid">
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="role-option freelancer-theme"
              onClick={() => handleRoleSelection('freelancer')}
            >
              <div className="role-icon-box">👨‍💻</div>
              <h3>Freelancer</h3>
              <p>Monetize your skills, bid on premium projects, and grow your professional portfolio.</p>
              <ul className="role-features">
                <li>Direct Bidding</li>
                <li>Escrow Security</li>
                <li>Live Chat</li>
              </ul>
              <button className="role-select-btn">Select Freelancer</button>
            </motion.div>

            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="role-option client-theme"
              onClick={() => handleRoleSelection('client')}
            >
              <div className="role-icon-box">💼</div>
              <h3>Client</h3>
              <p>Access top-tier talent, manage complex projects, and secure delivery with escrow.</p>
              <ul className="role-features">
                <li>Talent Sourcing</li>
                <li>Milestone Tracking</li>
                <li>Secured Payouts</li>
              </ul>
              <button className="role-select-btn">Select Client</button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="super-home-container">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="dashboard-overview"
      >
        <motion.header variants={itemVariants} className="dashboard-header">
          <div className="user-welcome">
            <div className="welcome-avatar">{user?.name?.charAt(0)}</div>
            <div>
              <h1>Welcome back, {user?.name}</h1>
              <p>System status: <span className="status-online">Operational 🟢</span></p>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="launch-btn"
              onClick={() => navigate(user?.role === 'client' ? '/post-project' : '/find-projects')}
            >
              Launch Workspace <FaArrowRight />
            </button>
          </div>
        </motion.header>

        <div className="stats-marquee">
          <motion.div variants={itemVariants} className="overview-card glass-morphism">
            <div className="card-icon"><FaChartLine /></div>
            <div className="card-data">
              <h3>Professional Level</h3>
              <p>Top Rated {user?.role}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="overview-card glass-morphism">
            <div className="card-icon"><FaShieldAlt /></div>
            <div className="card-data">
              <h3>Escrow Protection</h3>
              <p>100% Secured Payouts</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="overview-card glass-morphism">
            <div className="card-icon"><FaRocket /></div>
            <div className="card-data">
              <h3>Global Ecosystem</h3>
              <p>Connected to 50k+ Pros</p>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="hero-section glass-morphism">
          <div className="hero-content">
            <span className="platform-tag">ECOSYSTEM OVERVIEW</span>
            <h2>Your Professional Workspace is Ready</h2>
            <p>
              You are currently logged in as a <strong>{user?.role}</strong>.
              Manage your projects, track milestones, and communicate with your collaborators in your dedicated workspace.
            </p>
            <div className="quick-links">
              <button onClick={() => navigate(user?.role === 'client' ? '/post-project' : '/find-projects')}>
                {user?.role === 'client' ? 'Manage My Projects' : 'Find Available Work'}
              </button>
              <button className="secondary" onClick={() => navigate('/chat')}>AI Assistant</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="abstract-shape"></div>
            <div className="floating-ui-element">
              <FaBriefcase />
              <span>Project Assigned</span>
            </div>
          </div>
        </motion.div>

        <motion.footer variants={itemVariants} className="dashboard-footer">
          <p>© 2026 FreelanceFlow Professional Ecosystem. All Encrypted & Secured.</p>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default Home;
