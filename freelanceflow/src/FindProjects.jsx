

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FaComment, FaUpload, FaFileUpload, FaDownload, FaEye, FaStar, FaCreditCard, FaCheckCircle } from "react-icons/fa";

const socket = io(`${import.meta.env.VITE_API_URL}`);

const FreelancerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showBidForm, setShowBidForm] = useState(null);
  const [myBids, setMyBids] = useState([]);
  const [acceptedProjects, setAcceptedProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [showChat, setShowChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [filters, setFilters] = useState({
    search: '', skills: '', budget: '', location: '', sort: 'newest'
  });
  const [progressValues, setProgressValues] = useState({});
  const [updatingProgress, setUpdatingProgress] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const messagesEndRef = useRef(null);

  // 🔥 COMPLETE SOCKET SETUP WITH PAYMENT FIX
  useEffect(() => {
    console.log("🔥 Freelancer: Connecting socket...");

    socket.emit("join", { role: "freelancer" });

    socket.on("projects", (projectsData) => {
      console.log("📡 Socket projects:", projectsData.length);
      setProjects(projectsData);
    });

    socket.on("new-project", (project) => {
      console.log("🆕 New project via socket:", project.title);
      setProjects(prev => [project, ...prev]);
    });

    socket.on("chat-history", (messages) => {
      console.log("📜 Chat history:", messages.length);
      setChatMessages(prev => ({ ...prev, [messages[0]?.projectId]: messages }));
    });

    socket.on("new-chat-message", (message) => {
      console.log("💬 LIVE MESSAGE:", message.senderName, ":", message.message);
      setChatMessages(prev => ({
        ...prev,
        [message.projectId]: [...(prev[message.projectId] || []), message]
      }));
    });

    // 🔥 PAYMENT & RATING SOCKETS
    socket.on("project-funded", (project) => {
      console.log("💰 PROJECT FUNDED:", project.title);
      alert(`🎉 "${project.title}" FUNDED! 💰 ₹${project.escrowAmount} in escrow`);
      fetchProjects();
    });

    socket.on("project-reviewed", (project) => {
      console.log("⭐ RATING RECEIVED:", project.rating);
      alert(`⭐ Client rated "${project.title}": ${project.rating}/5`);
      fetchProjects();
    });

    socket.on("payment-released", (project) => {
      console.log("💸 PAYMENT RELEASED:", project.title);
      alert(`💰 ₹${project.freelancerPayout} payout received for "${project.title}"!`);
      fetchProjects();
    });

    socket.on("file-upload-progress", ({ projectId, progress }) => {
      setUploadingFiles(prev => ({ ...prev, [projectId]: progress }));
    });

    socket.on("file-upload-complete", ({ projectId, fileName, fileUrl }) => {
      console.log("✅ File uploaded:", fileName);
      setUploadingFiles(prev => ({ ...prev, [projectId]: 100 }));
      setSelectedFiles(prev => ({ ...prev, [projectId]: [] }));
      alert(`✅ ${fileName} uploaded successfully!`);
      fetchProjects();
    });

    return () => {
      socket.off("projects");
      socket.off("new-project");
      socket.off("chat-history");
      socket.off("new-chat-message");
      socket.off("project-funded");
      socket.off("project-reviewed");
      socket.off("payment-released");
      socket.off("file-upload-progress");
      socket.off("file-upload-complete");
    };
  }, []);

  // Handle deletions in real-time
  useEffect(() => {
    socket.on("project-deleted", (deletedId) => {
      console.log("🔥 Delete notification received:", deletedId);
      setProjects(prev => prev.filter(p => p._id !== deletedId));
      setFilteredProjects(prev => prev.filter(p => p._id !== deletedId));
      setAcceptedProjects(prev => prev.filter(p => p._id !== deletedId));
      setMyBids(prev => prev.filter(b => b.projectId !== deletedId));
    });

    return () => socket.off("project-deleted");
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`);
      const allProjects = res.data || [];

      setProjects(allProjects);

      // ✅ Available projects
      const available = allProjects.filter(project =>
        project.status === "open"
      );
      setFilteredProjects(available);

      // ✅ My Projects
      const myProjects = allProjects.filter(project =>
        project.freelancerId === "tempFreelancer"
      );
      setAcceptedProjects(myProjects);

    } catch (error) {
      console.error("Error fetching projects:", error.response?.data || error.message);
    }
  };

  const fetchMyBids = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bids/my-bids/tempFreelancer`);
      const acceptedBids = (res.data || []).filter(bid =>
        bid.status === "accepted" || bid.status === "hired" || bid.status === "won"
      );
      setMyBids(acceptedBids);
    } catch (error) {
      console.error("Error fetching bids:", error.response?.data || error.message);
      setMyBids([]);
    }
  };

  // ✅ FIXED releaseFunds with API call
  const releaseFunds = async (project) => {
    if (window.confirm(`Release ₹${project.freelancerPayout || 0} payout for "${project.title}"?`)) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/payments/release-payment`, {
          projectId: project._id,
          freelancerId: "tempFreelancer"
        });

        alert(`✅ Funds released! ₹${project.freelancerPayout || 0} transferred\nTXN-${Date.now()}`);

        // Force refresh
        setTimeout(() => {
          fetchProjects();
          fetchMyBids();
        }, 1000);

      } catch (error) {
        console.error("Payment release failed:", error);
        alert("❌ Payment release failed. Try again.");
      }
    }
  };

  const handleFileSelect = (projectId, event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => ({ ...prev, [projectId]: files }));
    console.log(`📁 Selected ${files.length} files for project ${projectId}`);
  };

  const uploadFiles = async (projectId) => {
    if (!selectedFiles[projectId] || selectedFiles[projectId].length === 0) {
      alert("❌ Please select files first!");
      return;
    }

    setUploadingFiles(prev => ({ ...prev, [projectId]: 0 }));

    const formData = new FormData();
    selectedFiles[projectId].forEach((file) => {
      formData.append(`files`, file);
    });
    formData.append('projectId', projectId);
    formData.append('freelancerId', 'tempFreelancer');
    formData.append('freelancerName', 'John Doe');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadingFiles(prev => ({ ...prev, [projectId]: progress }));
        }
      });

      console.log("✅ Upload complete:", res.data);
      setUploadingFiles(prev => ({ ...prev, [projectId]: 100 }));

    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("❌ File upload failed. Please try again.");
      setUploadingFiles(prev => ({ ...prev, [projectId]: 0 }));
    }
  };

  const downloadFile = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = `${import.meta.env.VITE_API_URL}${fileUrl}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openChat = (projectId) => {
    console.log("💬 Opening chat for:", projectId);
    socket.emit("join-chat", { projectId, senderName: "John Doe (Freelancer)" });
    setShowChat(projectId);
    scrollToBottom();
  };

  const sendChatMessage = () => {
    if (chatInput.trim() && showChat) {
      socket.emit("chat-message", {
        projectId: showChat,
        message: chatInput,
        senderName: "John Doe (Freelancer)"
      });
      setChatInput('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const updateProgress = async (projectId, newProgress) => {
    try {
      setUpdatingProgress(prev => ({ ...prev, [projectId]: true }));
      socket.emit("update-progress", { projectId, progress: parseInt(newProgress) });
      console.log("✅ Progress updated:", newProgress + "%");
      fetchProjects();
    } catch (error) {
      console.error("❌ Progress update failed:", error);
    } finally {
      setUpdatingProgress(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleSubmitBid = async (projectId) => {
    try {
      const amountInput = document.getElementById(`amount-${projectId}`);
      const deadlineInput = document.getElementById(`deadline-${projectId}`);
      const messageInput = document.getElementById(`message-${projectId}`);

      const bidData = {
        projectId, freelancerId: "tempFreelancer", freelancerName: "John Doe",
        amount: parseInt(amountInput.value), deadline: deadlineInput.value,
        message: messageInput.value
      };

      socket.emit("new-bid", bidData);
      alert("✅ Bid submitted successfully!");
      setShowBidForm(null);
      fetchProjects();
      fetchMyBids();
    } catch (error) {
      alert("❌ Failed to submit bid");
    }
  };

  useEffect(() => {
    const refreshAllData = async () => {
      await fetchProjects();
      await fetchMyBids();
    };
    refreshAllData();
    const interval = setInterval(refreshAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = projects.filter(project => project.status !== "accepted");
    if (filters.search) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.skills) {
      filtered = filtered.filter(project =>
        project.skills?.toLowerCase().includes(filters.skills.toLowerCase())
      );
    }
    if (filters.budget) {
      const budgetNum = parseInt(filters.budget);
      filtered = filtered.filter(project => {
        const projectBudget = parseInt((project.budget || 0).toString().replace(/[^\d]/g, ''));
        return projectBudget >= budgetNum;
      });
    }
    if (filters.sort === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sort === 'budget-high') {
      filtered.sort((a, b) =>
        parseInt((b.budget || 0).toString().replace(/[^\d]/g, '')) -
        parseInt((a.budget || 0).toString().replace(/[^\d]/g, ''))
      );
    }
    setFilteredProjects(filtered);
  }, [projects, filters]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': case 'hired': case 'won': case 'completed': case 'released': case 'paid': return '#10b981';
      case 'pending': case 'funded': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          style={{
            color: i <= rating ? '#fbbf24' : '#d1d5db',
            marginRight: '2px'
          }}
        />
      );
    }
    return (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {stars} <span style={{ marginLeft: '4px', fontSize: '12px' }}>{rating}/5</span>
      </span>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🎯 Freelancer Dashboard</h1>

      <div style={styles.tabNav}>
        <button style={{ ...styles.tabButton, ...(activeTab === 'projects' && styles.activeTab) }}
          onClick={() => setActiveTab('projects')}>
          📋 Available ({filteredProjects.length})
        </button>
        <button style={{ ...styles.tabButton, ...(activeTab === 'bids' && styles.activeTab) }}
          onClick={() => setActiveTab('bids')}>
          💰 My Bids ({myBids.length})
        </button>
        <button style={{ ...styles.tabButton, ...(activeTab === 'accepted' && styles.activeTab) }}
          onClick={() => setActiveTab('accepted')}>
          ✅ My Projects ({acceptedProjects.length})
        </button>

        <button
          style={{ ...styles.tabButton, background: '#4b5563', color: 'white', marginLeft: 'auto' }}
          onClick={() => window.location.href = '/post-project'}
        >
          Switch to Client Mode 🔄
        </button>
      </div>

      {/* TAB 1: PROJECTS */}
      {activeTab === 'projects' && (
        <>
          <div style={styles.filterPanel}>
            <input style={styles.filterInput} placeholder="🔍 Search projects..."
              value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <select style={styles.filterSelect} value={filters.skills}
              onChange={(e) => setFilters({ ...filters, skills: e.target.value })}>
              <option value="">All Skills</option>
              <option value="react">React</option>
              <option value="node">Node.js</option>
              <option value="mongo">MongoDB</option>
              <option value="java">Java</option>
            </select>
            <select style={styles.filterSelect} value={filters.budget}
              onChange={(e) => setFilters({ ...filters, budget: e.target.value })}>
              <option value="">All Budgets</option>
              <option value="5000">₹5,000+</option>
              <option value="10000">₹10,000+</option>
            </select>
            <select style={styles.filterSelect} value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
              <option value="newest">Newest First</option>
              <option value="budget-high">Highest Budget</option>
            </select>
          </div>

          {filteredProjects.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No available projects match your filters.</p>
            </div>
          ) : (
            <div style={styles.cardContainer}>
              {filteredProjects.map((project) => (
                <div key={project._id} style={styles.card}>
                  {/* Header */}
                  <div style={styles.cardHeader}>
                    <h2 style={styles.cardTitle}>{project.title}</h2>
                    <span style={{ ...styles.statusBadge, backgroundColor: getStatusColor(project.status) }}>{project.status || 'OPEN'}</span>
                  </div>

                  <p style={{ color: '#4b5563', fontSize: '14px', margin: '14px 0', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description}
                  </p>

                  {/* Metrics */}
                  <div style={styles.metricsGrid}>
                    <div style={styles.metricItem}>
                      <small>Budget</small>
                      <strong>₹{project.budget}</strong>
                    </div>
                    <div style={styles.metricItem}>
                      <small>Duration</small>
                      <strong>{project.duration || "N/A"}</strong>
                    </div>
                    <div style={styles.metricItem}>
                      <small>Bids</small>
                      <strong>{project.bidsCount || 0}</strong>
                    </div>
                  </div>

                  {/* Footer info */}
                  <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                    <div style={{ marginBottom: '8px', fontSize: '13px', color: '#374151' }}>
                      <strong>⚡ Skills:</strong> <span style={{ color: '#6b7280' }}>{project.skills || "General"}</span>
                    </div>
                    <div style={styles.clientBadge}>👤 {project.clientName || "Client"}</div>
                  </div>

                  {/* Action */}
                  {showBidForm === project._id ? (
                    <div style={styles.bidForm}>
                      <input id={`amount-${project._id}`} placeholder="Your bid amount (₹)" style={styles.input} type="number" />
                      <input id={`deadline-${project._id}`} placeholder="Deadline" style={styles.input} type="date" />
                      <textarea id={`message-${project._id}`} placeholder="Pitch yourself..." style={styles.textarea} rows="2" />
                      <div style={styles.buttonGroup}>
                        <button style={styles.submitButton} onClick={() => handleSubmitBid(project._id)}>
                          Submit 🚀
                        </button>
                        <button style={styles.cancelButton} onClick={() => setShowBidForm(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button style={styles.bidButton} onClick={() => setShowBidForm(project._id)}>
                      Place a Bid
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: MY BIDS */}
      {activeTab === 'bids' && (
        <div style={styles.bidsSection}>
          <h2 style={styles.sectionTitle}>📋 My Bids ({myBids.length})</h2>
          {myBids.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No active bids.</p>
              <small>Place bids on available projects to see them here.</small>
            </div>
          ) : (
            <div style={styles.bidsGrid}>
              {myBids.map((bid) => (
                <div key={bid._id} style={styles.bidCard}>
                  <div style={styles.bidHeader}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827' }}>{bid.projectTitle}</h3>
                    <span style={{ ...styles.statusBadge, backgroundColor: getStatusColor(bid.status) }}>{bid.status}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '12px 0' }}>
                    <div style={{ background: '#f9fafb', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <small style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }}>Your Bid</small>
                      <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '15px' }}>₹{bid.amount}</div>
                    </div>
                    <div style={{ background: '#f9fafb', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <small style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }}>Deadline</small>
                      <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px' }}>{bid.deadline ? new Date(bid.deadline).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>

                  <div style={styles.clientBadge}>
                    👤 Client: {bid.clientName || 'Unknown'}
                  </div>

                  {bid.message && (
                    <div style={{ marginTop: '12px', padding: '10px', background: '#eff6ff', borderRadius: '6px', fontSize: '13px', color: '#1e40af', fontStyle: 'italic' }}>
                      "{bid.message}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACCEPTED PROJECTS */}
      {activeTab === 'accepted' && (
        <div style={styles.acceptedSection}>
          {/* EARNINGS SUMMARY */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <small>Total Earnings</small>
              <strong>₹{acceptedProjects.reduce((sum, p) => sum + (p.paymentStatus === 'released' || p.paymentStatus === 'paid' ? (p.freelancerPayout || 0) : 0), 0)}</strong>
            </div>
            <div style={styles.statCard}>
              <small>Active Projects</small>
              <strong>{acceptedProjects.filter(p => p.status !== 'completed' && p.paymentStatus !== 'released' && p.paymentStatus !== 'paid').length}</strong>
            </div>
            <div style={styles.statCard}>
              <small>Completed</small>
              <strong>{acceptedProjects.filter(p => p.status === 'completed' || p.paymentStatus === 'released' || p.paymentStatus === 'paid').length}</strong>
            </div>
          </div>

          {/* ACTIVE PROJECTS */}
          <h3 style={styles.subSectionTitle}>🔥 Active Work</h3>
          {acceptedProjects.filter(p => p.status !== 'completed' && p.paymentStatus !== 'released' && p.paymentStatus !== 'paid').length === 0 ? (
            <div style={styles.miniEmptyState}>No active projects.</div>
          ) : (
            <div style={styles.cardContainer}>
              {acceptedProjects.filter(p => p.status !== 'completed' && p.paymentStatus !== 'released' && p.paymentStatus !== 'paid').map((project) => (
                <div key={project._id} style={styles.projectCard}>
                  {/* HEADER */}
                  <div style={styles.cardHeader}>
                    <div>
                      <h2 style={styles.cardTitle}>{project.title}</h2>
                      <div style={styles.clientBadge}>👤 {project.clientName}</div>
                    </div>
                    <span style={{ ...styles.statusBadge, backgroundColor: getStatusColor(project.status) }}>
                      {project.status?.toUpperCase()}
                    </span>
                  </div>

                  {/* METRICS */}
                  <div style={styles.metricsGrid}>
                    <div style={styles.metricItem}>
                      <small>Budget</small>
                      <strong>₹{project.budget}</strong>
                    </div>
                    <div style={styles.metricItem}>
                      <small>Escrow</small>
                      <strong style={{ color: project.paymentStatus === 'funded' ? '#10b981' : '#9ca3af' }}>
                        {project.paymentStatus === 'funded' ? `₹${project.escrowAmount}` : 'Pending'}
                      </strong>
                    </div>
                  </div>

                  <hr style={styles.divider} />

                  {/* PROGRESS CONTROL */}
                  <div style={styles.sectionBox}>
                    <div style={styles.flexRow}>
                      <small style={{ fontWeight: '600', color: '#4b5563' }}>Progress</small>
                      <small style={{ fontWeight: 'bold', color: '#10b981' }}>{project.progress || 0}%</small>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${project.progress || 0}%` }} />
                    </div>

                    <div style={styles.controlRow}>
                      <input
                        type="range" min="0" max="100"
                        value={progressValues[project._id] || project.progress || 0}
                        onChange={(e) => setProgressValues({ ...progressValues, [project._id]: parseInt(e.target.value) })}
                        style={styles.slimSlider}
                      />
                      <button
                        style={styles.updateBtn}
                        onClick={() => updateProgress(project._id, progressValues[project._id] || project.progress || 0)}
                        disabled={updatingProgress[project._id]}
                      >
                        {updatingProgress[project._id] ? 'Saving...' : 'Update'}
                      </button>
                    </div>
                  </div>

                  {/* FILES & CHAT */}
                  <div style={styles.cardFooter}>
                    <button
                      style={{
                        ...styles.chatBtn,
                        background: project.chatEnabled ? '#3b82f6' : '#e5e7eb',
                        color: project.chatEnabled ? 'white' : '#9ca3af',
                        cursor: project.chatEnabled ? 'pointer' : 'not-allowed'
                      }}
                      onClick={() => project.chatEnabled ? openChat(project._id) : alert('Chat unlocks at 25% progress')}
                    >
                      <FaComment style={{ marginRight: '6px' }} /> Chat
                    </button>

                    <label htmlFor={`file-upload-${project._id}`} style={styles.uploadLink}>
                      <FaUpload /> Upload File
                    </label>
                    <input
                      id={`file-upload-${project._id}`}
                      type="file" multiple hidden
                      onChange={(e) => { handleFileSelect(project._id, e); uploadFiles(project._id); }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* COMPLETED HISTORY */}
          <h3 style={{ ...styles.subSectionTitle, marginTop: '40px', color: '#6b7280' }}>✅ Completed History</h3>
          {acceptedProjects.filter(p => p.status === 'completed' || p.paymentStatus === 'released' || p.paymentStatus === 'paid').length === 0 ? (
            <div style={styles.miniEmptyState}>No completed projects yet.</div>
          ) : (
            <div style={styles.historyList}>
              {acceptedProjects.filter(p => p.status === 'completed' || p.paymentStatus === 'released' || p.paymentStatus === 'paid').map((project) => (
                <div key={project._id} style={styles.historyItem}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{project.title}</h4>
                    <small style={{ color: '#6b7280' }}>Client: {project.clientName} • Ended: {new Date().toLocaleDateString()}</small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#059669', fontSize: '16px' }}>₹{project.freelancerPayout || project.budget}</div>
                    {project.rating ? (
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>{renderStars(project.rating)}</div>
                    ) : (
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>COMPLETED</span>
                    )}
                  </div>

                  {project.paymentStatus === 'funded' && (
                    <button style={{ ...styles.releaseFundsButton, marginLeft: '15px', padding: '8px 12px', fontSize: '12px' }} onClick={() => releaseFunds(project)}>
                      Release Payout
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHAT MODAL */}
      {showChat && (
        <div style={{
          position: 'fixed', zIndex: 9999, top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowChat(null)}>
          <div style={{
            background: 'white', width: '90%', maxWidth: '600px', height: '80vh',
            borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '24px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', position: 'relative'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px' }}>💬 Project Chat</h2>
              <button onClick={() => setShowChat(null)} style={{
                position: 'absolute', top: '20px', right: '20px', background: 'none',
                border: 'none', color: 'white', fontSize: '28px', cursor: 'pointer'
              }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f8fafc' }}>
              {chatMessages[showChat]?.length > 0 ? (
                chatMessages[showChat].map((msg, index) => (
                  <div key={index} style={{
                    marginBottom: '15px',
                    textAlign: msg.senderName.includes('Freelancer') ? 'right' : 'left'
                  }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '10px 15px',
                      background: msg.senderName.includes('Freelancer') ? '#10b981' : '#3b82f6',
                      color: 'white',
                      borderRadius: '18px',
                      maxWidth: '70%'
                    }}>
                      {msg.message}
                    </div>
                    <small style={{ opacity: 0.7, fontSize: '12px' }}>
                      {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString()}
                    </small>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px' }}>
                  💭 Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  style={{ flex: 1, padding: '14px 20px', border: '2px solid #e2e8f0', borderRadius: '25px' }}
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <button style={{
                  width: '52px', height: '52px', border: 'none',
                  background: '#10b981', color: 'white', borderRadius: '50%', cursor: 'pointer'
                }} onClick={sendChatMessage}>➤</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ COMPLETE STYLES WITH FULL FILE MANAGEMENT
const styles = {
  container: { padding: "30px", background: "#f3f4f6", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  heading: { color: "#111827", textAlign: "center", fontSize: "28px", fontWeight: "800", marginBottom: "30px", letterSpacing: '-0.5px' },

  // Tabs
  tabNav: { display: "flex", background: "white", borderRadius: "12px", padding: '4px', boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "30px", maxWidth: "800px", margin: "0 auto 30px" },
  tabButton: { flex: 1, padding: "12px 20px", background: "transparent", border: "none", borderRadius: '8px', fontSize: "14px", fontWeight: "600", color: "#6b7280", cursor: "pointer", transition: "all 0.2s ease" },
  activeTab: { background: "#eff6ff", color: "#1d4ed8" },

  // Filters
  filterPanel: { background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "25px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", maxWidth: "1200px", margin: "0 auto 25px" },
  filterInput: { padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", background: "#f9fafb", outline: 'none' },
  filterSelect: { padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "white", fontSize: "14px", cursor: "pointer", outline: 'none' },

  // Cards Container
  cardContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", maxWidth: "1200px", margin: "0 auto" },

  // Standard Card (Available Projects)
  card: { background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", border: "1px solid #f3f4f6", transition: 'transform 0.2s' },
  title: { color: "#111827", marginBottom: "12px", fontSize: "18px", fontWeight: '700' },
  bidButton: { marginTop: "16px", padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", width: "100%" },

  // Clean Project Card (Accepted)
  projectCard: { background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827', lineHeight: '1.4' },
  clientBadge: { fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' },
  statusBadge: { padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: 'white', letterSpacing: '0.5px' },
  ratingBadge: { background: '#fef3c7', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center' },

  // Metrics
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: '#f9fafb', padding: '12px', borderRadius: '10px' },
  metricItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },

  // Sections
  divider: { border: 'none', borderTop: '1px solid #f3f4f6', margin: '0' },
  sectionBox: { display: 'flex', flexDirection: 'column', gap: '12px' },
  flexRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },

  // Progress
  progressBar: { width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" },
  progressFill: { height: "100%", background: "#10b981", transition: "width 0.5s ease" },
  controlRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  slimSlider: { flex: 1, height: '6px', borderRadius: '3px', accentColor: '#10b981', cursor: 'pointer' },
  updateBtn: { padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },

  // Files
  uploadLink: { cursor: 'pointer', color: '#2563eb', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
  uploadPreview: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', padding: '8px 12px', borderRadius: '6px' },
  miniUploadBtn: { padding: '4px 8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' },
  fileListCompact: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', background: '#f9fafb', padding: '8px', borderRadius: '6px' },
  fileName: { maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151' },

  // Action / Footer
  actionBox: { textAlign: 'center', padding: '16px', background: '#ecfdf5', borderRadius: '10px', border: '1px dashed #10b981' },
  releaseFundsButton: { width: '100%', padding: '12px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' },
  chatBtn: { flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '10px', transition: 'all 0.2s' },
  statusPill: { padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },

  // Bids Tab
  bidsSection: { maxWidth: "1000px", margin: "0 auto" },
  bidsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" },
  bidCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #f3f4f6" },
  bidHeader: { display: "flex", justifyContent: 'space-between', marginBottom: '12px' },
  bidStatus: { padding: "4px 8px", borderRadius: "4px", color: "white", fontSize: "11px", fontWeight: "bold" },
  bidDetails: { fontSize: '14px', color: '#4b5563', lineHeight: '1.6' },

  // Stats Row
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' },
  statCard: { background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  subSectionTitle: { fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },

  // History
  historyList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  miniEmptyState: { padding: '40px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #e5e7eb' },

  // Empty States
  emptyState: { textAlign: "center", padding: "60px", background: "white", borderRadius: "16px", border: "2px dashed #e5e7eb", color: "#6b7280", maxWidth: "500px", margin: "40px auto" },
  noProjects: { textAlign: "center", color: "#6b7280", padding: "40px" },

  // Bid Form
  bidForm: { marginTop: "15px", padding: "16px", background: "#f9fafb", borderRadius: "10px", border: "1px solid #e5e7eb" },
  input: { width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box", outline: 'none' },
  textarea: { width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", resize: "vertical", boxSizing: "border-box", outline: 'none' },
  buttonGroup: { display: "flex", gap: "10px" },
  submitButton: { flex: 1, padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
  cancelButton: { flex: 1, padding: "10px", background: "#9ca3af", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
};

export default FreelancerDashboard;
