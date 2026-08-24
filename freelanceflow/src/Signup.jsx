import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from './AuthContext';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa6';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'freelancer',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name required';
    if (!formData.email.trim()) newErrors.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password required';
    else if (formData.password.length < 8) newErrors.password = 'Minimum 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.user);
        navigate("/home");
      } else {
        setErrors({ general: data.message || 'Signup failed' });
      }
    } catch {
      setErrors({ general: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

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
          Sign Up
        </motion.h1>

        <motion.p className="auth-subtitle" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          Create your FreelanceFlow account
        </motion.p>

        <motion.form onSubmit={handleSubmit} className="auth-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {errors.general && (
            <motion.div className="error-toast" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              {errors.general}
            </motion.div>
          )}

          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder=" "
              className={errors.name ? 'error' : ''}
            />
            <label>Full Name</label>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

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

          <div className="role-selection">
            <label className="role-label">I am a:</label>
            <div className="role-options">
              <label className={`role-card ${formData.role === 'freelancer' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="freelancer"
                  checked={formData.role === 'freelancer'}
                  onChange={handleChange}
                />
                <div className="role-icon">👨‍💻</div>
                <span>Freelancer</span>
              </label>
              <label className={`role-card ${formData.role === 'client' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={formData.role === 'client'}
                  onChange={handleChange}
                />
                <div className="role-icon">💼</div>
                <span>Client</span>
              </label>
            </div>
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

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder=" "
              className={errors.confirmPassword ? 'error' : ''}
            />
            <label>Confirm Password</label>
            <button type="button" className="password-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <motion.button
            type="submit"
            className="submit-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Join FreelanceFlow'}
          </motion.button>
        </motion.form>

        <p className="auth-footer">
          Already have an account? <span onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>
    </motion.div>
  );
};

export default Signup;
