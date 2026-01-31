import React from 'react';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
  return (
    <>
      {/* --- Existing About Section --- */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="about-container"
      >
        <h1 className="about-title">About FreelanceFlow</h1>
        <p className="about-text">
          FreelanceFlow is a real-time micro-gig marketplace designed to connect freelancers
          and clients efficiently with milestone-based payments and advanced features.
        </p>
      </motion.div>

      {/* --- Extra Content Section --- */}
      <section className="about-extra">
        <motion.div
          className="about-divider"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
        />

        <motion.h2
          className="about-extra-title"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          💜 Our Mission & Vision 💫
        </motion.h2>

        <motion.p
          className="about-extra-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          At <strong>FreelanceFlow</strong>, we aim to create a space where freelancers and clients
          connect with confidence, creativity, and trust. Our mission is to empower individuals to
          transform their passion into opportunity — one project at a time.
        </motion.p>

        <motion.div
          className="about-cards"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="about-card">
            <h3>🌍 Vision</h3>
            <p>
              To build a global freelance ecosystem where skills meet success — seamlessly and securely.
            </p>
          </div>

          <div className="about-card">
            <h3>🤝 Commitment</h3>
            <p>
              We believe in fair collaboration, transparent payments, and nurturing genuine professional growth.
            </p>
          </div>

          <div className="about-card">
            <h3>🚀 Innovation</h3>
            <p>
              From AI-powered matching to smart dashboards, we continuously evolve to make freelancing effortless.
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default About;
