// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import './Home.css';

// const Home = () => {
//   const navigate = useNavigate();
//   const [showRoleChoice, setShowRoleChoice] = useState(false);

//   const handleStartJourney = () => setShowRoleChoice(true);

//   const handleRoleSelection = (role) => {
//     if (role === 'freelancer') {
//       navigate('/find-projects');
//     } else if (role === 'client') {
//       navigate('/post-project');
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 40 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.7 }}
//       className="home-container"
//     >
//       <motion.h1
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="home-title"
//       >
//         Elevate Your Freelance Journey with FreelanceFlow
//       </motion.h1>

//       <motion.p
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.3 }}
//         className="home-subtitle"
//       >
//         Real-time micro-gigs, limitless possibilities.
//       </motion.p>

//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ delay: 0.5 }}
//         className="home-illustration"
//       >
//         <svg width="200" height="200" viewBox="0 0 64 64" fill="none" stroke="#4B0082" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//           <circle cx="32" cy="32" r="30" />
//           <path d="M20 32l8 8 16-16" />
//         </svg>
//       </motion.div>

//       <motion.button
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.7 }}
//         className="home-cta-button"
//         onClick={handleStartJourney}
//       >
//         Start Your Journey
//       </motion.button>

//       {showRoleChoice && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0 }}
//           className="role-popup glass-popup"
//         >
//           <h2>🌟 Choose Your Role 🌟</h2>
//           <p className="popup-text">Select how you want to explore FreelanceFlow</p>
//           <div className="role-buttons">
//             <button className="role-button freelancer" onClick={() => handleRoleSelection('freelancer')}>
//               🧑‍💻 Freelancer
//             </button>
//             <button className="role-button client" onClick={() => handleRoleSelection('client')}>
//               🧑‍💼 Client
//             </button>
//           </div>
//         </motion.div>
//       )}
//     </motion.div>
//   );a
// };

// export default Home;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [showRoleChoice, setShowRoleChoice] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleStartJourney = () => setShowRoleChoice(true);

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    // Small delay for visual feedback
    setTimeout(() => {
      if (role === 'freelancer') {
        navigate('/find-projects');
      } else if (role === 'client') {
        navigate('/post-project');
      }
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="home-container"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="home-title"
      >
        Elevate Your Freelance Journey with FreelanceFlow
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="home-subtitle"
      >
        Real-time micro-gigs, limitless possibilities.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="home-illustration"
      >
        <svg width="200" height="200" viewBox="0 0 64 64" fill="none" stroke="#4B0082" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="32" r="30" />
          <path d="M20 32l8 8 16-16" />
        </svg>
      </motion.div>

      {!showRoleChoice ? (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="home-cta-button"
          onClick={handleStartJourney}
        >
          Start Your Journey
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 25 }}
          className="inline-role-selector"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="role-selector-header"
          >
            <h2>🌟 Choose Your Path</h2>
            <p>Discover FreelanceFlow as...</p>
          </motion.div>

          <motion.div
            className="inline-role-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              className="inline-role-button freelancer"
              onClick={() => handleRoleSelection('freelancer')}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span>🧑‍💻</span>
              <div>
                <strong>Freelancer</strong>
                <small>Find amazing projects</small>
              </div>
            </motion.button>

            <motion.button
              className="inline-role-button client"
              onClick={() => handleRoleSelection('client')}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span>🧑‍💼</span>
              <div>
                <strong>Client</strong>
                <small>Post your projects</small>
              </div>
            </motion.button>
          </motion.div>

          {selectedRole && (
            <motion.div
              className="role-selected-indicator"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span>🚀 Launching as {selectedRole}...</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Home;
