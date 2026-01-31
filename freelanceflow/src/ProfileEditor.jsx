import React, { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';

const ProfileEditor = () => {
  const { user, setUser } = useContext(AuthContext);

  // Initialize form state with user data or empty strings
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    skills: user?.skills || '',
    bio: user?.bio || '',
  });

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submit / save
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally save this data to backend
    setUser(prevUser => ({ ...prevUser, ...formData }));
    alert('Profile updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: 'auto' }}>
      <h3>Edit Profile</h3>

      <label>Name</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />

      <label>Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />

      <label>Skills (comma separated)</label>
      <input
        type="text"
        name="skills"
        value={formData.skills}
        onChange={handleChange}
        placeholder="e.g. JavaScript, React, Node.js"
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />

      <label>Bio</label>
      <textarea
        name="bio"
        value={formData.bio}
        onChange={handleChange}
        rows={4}
        placeholder="Tell us about yourself"
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />

      <button
        type="submit"
        style={{
          backgroundColor: '#4B0082',
          color: 'white',
          padding: '10px 18px',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: '700',
          width: '100%',
        }}
      >
        Save Profile
      </button>
    </form>
  );
};

export default ProfileEditor;
