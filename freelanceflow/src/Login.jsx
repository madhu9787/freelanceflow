
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from './AuthContext';
import { useClerk } from '@clerk/clerk-react';
import { FaEnvelope, FaLock } from 'react-icons/fa6';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { openSignIn } = useClerk();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email required';
    if (!formData.password) newErrors.password = 'Password required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.user); // data.user includes name, email, and role
        navigate("/home");
      } else {
        setErrors({ general: data.message || 'Invalid credentials' });
      }
    } catch {
      setErrors({ general: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClerkLogin = () => openSignIn({ redirectUrl: '/home' });

  return (
    <motion.div
      className="auth-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated background */}
      <div className="auth-background">
        <div className="floating-shapes">
          <motion.div className="shape shape-1" animate={{ y: [-20, 20, -20] }} transition={{ duration: 6, repeat: Infinity }} />
          <motion.div className="shape shape-2" animate={{ y: [-30, 30, -30] }} transition={{ duration: 8, repeat: Infinity }} />
          <motion.div className="shape shape-3" animate={{ y: [-15, 15, -15] }} transition={{ duration: 10, repeat: Infinity }} />
        </div>
      </div>

      <div className="auth-content">
        <motion.h1 className="auth-title">
          Sign In
        </motion.h1>

        <motion.p className="auth-subtitle" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          Access your FreelanceFlow account
        </motion.p>

        <motion.form onSubmit={handleSubmit} className="auth-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {errors.general && (
            <motion.div className="error-toast" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              {errors.general}
            </motion.div>
          )}

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              className={errors.email ? 'error' : ''}
            />
            <label>Email</label>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              className={errors.password ? 'error' : ''}
            />
            <label>Password</label>
            <button type="button" className="password-eye" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '🙈' : '👁️'}
            </button>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <motion.button
            type="submit"
            className="submit-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </motion.form>

        <div className="divider">
          <span>or</span>
        </div>

        <motion.button
          className="clerk-btn"
          onClick={handleClerkLogin}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue with Clerk
        </motion.button>

        <p className="auth-footer">
          Don't have an account? <span onClick={() => navigate('/signup')}>Sign up</span>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
