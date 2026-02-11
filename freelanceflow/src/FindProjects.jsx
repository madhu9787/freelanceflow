
// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import io from "socket.io-client";         
// import { FaComment } from "react-icons/fa";  

// const socket = io("${import.meta.env.VITE_API_URL}");  

// const FreelancerDashboard = () => {
//   const [projects, setProjects] = useState([]);
//   const [filteredProjects, setFilteredProjects] = useState([]);
//   const [showBidForm, setShowBidForm] = useState(null);
//   const [myBids, setMyBids] = useState([]);
//   const [acceptedProjects, setAcceptedProjects] = useState([]);
//   const [activeTab, setActiveTab] = useState('projects');
//   const [showChat, setShowChat] = useState(null);
//   const [chatMessages, setChatMessages] = useState({});
//   const [chatInput, setChatInput] = useState('');
//   const [filters, setFilters] = useState({
//     search: '', skills: '', budget: '', location: '', sort: 'newest'
//   });
//   const [progressValues, setProgressValues] = useState({});
//   const [updatingProgress, setUpdatingProgress] = useState({});
//   const messagesEndRef = useRef(null);

//   // 🔥 COMPLETE SOCKET SETUP
//   useEffect(() => {
//     console.log("🔥 Freelancer: Connecting socket...");
    
//     socket.emit("join", { role: "freelancer" });
    
//     socket.on("projects", (projectsData) => {
//       console.log("📡 Socket projects:", projectsData.length);
//       setProjects(projectsData);
//     });
    
//     socket.on("new-project", (project) => {
//       console.log("🆕 New project via socket:", project.title);
//       setProjects(prev => [project, ...prev]);
//     });
    
//     socket.on("chat-history", (messages) => {
//       console.log("📜 Chat history:", messages.length);
//       setChatMessages(prev => ({...prev, [messages[0]?.projectId]: messages}));
//     });
    
//     socket.on("new-chat-message", (message) => {
//       console.log("💬 LIVE MESSAGE:", message.senderName, ":", message.message);
//       setChatMessages(prev => ({
//         ...prev,
//         [message.projectId]: [...(prev[message.projectId] || []), message]
//       }));
//     });

//     return () => {
//       socket.off("projects");
//       socket.off("new-project");
//       socket.off("chat-history");
//       socket.off("new-chat-message");
//     };
//   }, []);

//   // ✅ API CALLS
//   const fetchProjects = async () => {
//     try {
//       const res = await axios.get("${import.meta.env.VITE_API_URL}/api/projects");
//       const allProjects = res.data || [];
//       setProjects(allProjects);
      
//       const available = allProjects.filter(project => project.status !== "accepted");
//       setFilteredProjects(available);
      
//       const myAccepted = allProjects.filter(project => 
//         project.status === "accepted" && project.freelancerId === "tempFreelancer"
//       );
//       setAcceptedProjects(myAccepted);
//     } catch (error) {
//       console.error("Error fetching projects:", error.response?.data || error.message);
//     }
//   };

//   const fetchMyBids = async () => {
//     try {
//       const res = await axios.get("${import.meta.env.VITE_API_URL}/api/bids/my-bids");
//       const acceptedBids = (res.data || []).filter(bid => 
//         bid.status === "accepted" || bid.status === "hired" || bid.status === "won"
//       );
//       setMyBids(acceptedBids);
//     } catch (error) {
//       console.error("Error fetching bids:", error.response?.data || error.message);
//       setMyBids([]);
//     }
//   };

//   // 🔥 CHAT FUNCTIONS
//   const openChat = (projectId) => {
//     console.log("💬 Opening chat for:", projectId);
//     socket.emit("join-chat", { projectId, senderName: "John Doe (Freelancer)" });
//     setShowChat(projectId);
//     scrollToBottom();
//   };

//   const sendChatMessage = () => {
//     if (chatInput.trim() && showChat) {
//       socket.emit("chat-message", {
//         projectId: showChat,
//         message: chatInput,
//         senderName: "John Doe (Freelancer)"
//       });
//       setChatInput('');
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [chatMessages]);

//   // ✅ PROGRESS UPDATE
//   const updateProgress = async (projectId, newProgress) => {
//     try {
//       setUpdatingProgress(prev => ({...prev, [projectId]: true}));
//       socket.emit("update-progress", { projectId, progress: parseInt(newProgress) });
//       console.log("✅ Progress updated:", newProgress + "%");
//       fetchProjects();
//     } catch (error) {
//       console.error("❌ Progress update failed:", error);
//     } finally {
//       setUpdatingProgress(prev => ({...prev, [projectId]: false}));
//     }
//   };

//   // ✅ BID SUBMIT
//   const handleSubmitBid = async (projectId) => {
//     try {
//       const amountInput = document.getElementById(`amount-${projectId}`);
//       const deadlineInput = document.getElementById(`deadline-${projectId}`);
//       const messageInput = document.getElementById(`message-${projectId}`);
      
//       const bidData = {
//         projectId, freelancerId: "tempFreelancer", freelancerName: "John Doe",
//         amount: parseInt(amountInput.value), deadline: deadlineInput.value,
//         message: messageInput.value
//       };
      
//       socket.emit("new-bid", bidData);
//       alert("✅ Bid submitted successfully!");
//       setShowBidForm(null);
//       fetchProjects();
//       fetchMyBids();
//     } catch (error) {
//       alert("❌ Failed to submit bid");
//     }
//   };

//   // ✅ LOAD DATA
//   useEffect(() => {
//     const refreshAllData = async () => {
//       await fetchProjects();
//       await fetchMyBids();
//     };
//     refreshAllData();
//     const interval = setInterval(refreshAllData, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   // ✅ FILTERS
//   useEffect(() => {
//     let filtered = projects.filter(project => project.status !== "accepted");
//     if (filters.search) {
//       filtered = filtered.filter(project =>
//         project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
//         project.description.toLowerCase().includes(filters.search.toLowerCase())
//       );
//     }
//     if (filters.skills) {
//       filtered = filtered.filter(project =>
//         project.skills?.toLowerCase().includes(filters.skills.toLowerCase())
//       );
//     }
//     if (filters.budget) {
//       const budgetNum = parseInt(filters.budget);
//       filtered = filtered.filter(project => {
//         const projectBudget = parseInt((project.budget || 0).toString().replace(/[^\d]/g, ''));
//         return projectBudget >= budgetNum;
//       });
//     }
//     if (filters.sort === 'newest') {
//       filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     } else if (filters.sort === 'budget-high') {
//       filtered.sort((a, b) => 
//         parseInt((b.budget || 0).toString().replace(/[^\d]/g, '')) - 
//         parseInt((a.budget || 0).toString().replace(/[^\d]/g, ''))
//       );
//     }
//     setFilteredProjects(filtered);
//   }, [projects, filters]);

//   const getStatusColor = (status) => {
//     switch(status?.toLowerCase()) {
//       case 'accepted': case 'hired': case 'won': return '#10b981';
//       case 'pending': return '#f59e0b';
//       case 'rejected': return '#ef4444';
//       default: return '#6b7280';
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <h1 style={styles.heading}>🎯 Freelancer Dashboard</h1>

//       {/* ✅ 3-TAB NAVIGATION */}
//       <div style={styles.tabNav}>
//         <button style={{...styles.tabButton, ...(activeTab === 'projects' && styles.activeTab)}}
//           onClick={() => setActiveTab('projects')}>
//           📋 Available ({filteredProjects.length})
//         </button>
//         <button style={{...styles.tabButton, ...(activeTab === 'bids' && styles.activeTab)}}
//           onClick={() => setActiveTab('bids')}>
//           💰 My Bids ({myBids.length})
//         </button>
//         <button style={{...styles.tabButton, ...(activeTab === 'accepted' && styles.activeTab)}}
//           onClick={() => setActiveTab('accepted')}>
//           ✅ Accepted ({acceptedProjects.length})
//         </button>
//       </div>

//       {/* ✅ TAB 1: PROJECTS */}
//       {activeTab === 'projects' && (
//         <>
//           <div style={styles.filterPanel}>
//             <input style={styles.filterInput} placeholder="🔍 Search projects..."
//               value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} />
//             <select style={styles.filterSelect} value={filters.skills} 
//               onChange={(e) => setFilters({...filters, skills: e.target.value})}>
//               <option value="">All Skills</option>
//               <option value="react">React</option>
//               <option value="node">Node.js</option>
//               <option value="mongo">MongoDB</option>
//               <option value="java">Java</option>
//             </select>
//             <select style={styles.filterSelect} value={filters.budget} 
//               onChange={(e) => setFilters({...filters, budget: e.target.value})}>
//               <option value="">All Budgets</option>
//               <option value="5000">₹5,000+</option>
//               <option value="10000">₹10,000+</option>
//             </select>
//             <select style={styles.filterSelect} value={filters.sort} 
//               onChange={(e) => setFilters({...filters, sort: e.target.value})}>
//               <option value="newest">Newest First</option>
//               <option value="budget-high">Highest Budget</option>
//             </select>
//           </div>

//           {filteredProjects.length === 0 ? (
//             <p style={styles.noProjects}>No available projects match your filters.</p>
//           ) : (
//             <div style={styles.cardContainer}>
//               {filteredProjects.map((project) => (
//                 <div key={project._id} style={styles.card}>
//                   <h2 style={styles.title}>{project.title}</h2>
//                   <p><strong>Status:</strong> <span style={{color: getStatusColor(project.status)}}>{project.status || 'Open'}</span></p>
//                   <p><strong>Description:</strong> {project.description}</p>
//                   <p><strong>Budget:</strong> 💰 ₹{project.budget}</p>
//                   <p><strong>Duration:</strong> ⏱️ {project.duration || "Not specified"}</p>
//                   <p><strong>Skills:</strong> {project.skills || "Not specified"}</p>
//                   <p><strong>Client:</strong> 👤 {project.clientName || "Client"}</p>
//                   <p style={styles.bidCount}>📊 Bids: {project.bidsCount || 0}</p>

//                   {showBidForm === project._id ? (
//                     <div style={styles.bidForm}>
//                       <input id={`amount-${project._id}`} placeholder="Your bid amount (₹)" style={styles.input} type="number" />
//                       <input id={`deadline-${project._id}`} placeholder="Deadline" style={styles.input} type="date" />
//                       <textarea id={`message-${project._id}`} placeholder="Why you should be selected?" style={styles.textarea} rows="3" />
//                       <div style={styles.buttonGroup}>
//                         <button style={styles.submitButton} onClick={() => handleSubmitBid(project._id)}>
//                           Submit Bid 🚀
//                         </button>
//                         <button style={styles.cancelButton} onClick={() => setShowBidForm(null)}>
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <button style={styles.bidButton} onClick={() => setShowBidForm(project._id)}>
//                       💰 Bid Now ({project.bidsCount || 0} bids)
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       )}

//       {/* ✅ TAB 2: MY BIDS */}
//       {activeTab === 'bids' && (
//         <div style={styles.bidsSection}>
//           <h2 style={styles.sectionTitle}>💰 My Bids ({myBids.length})</h2>
//           {myBids.length === 0 ? (
//             <p style={styles.noBids}>No accepted/hired bids yet.</p>
//           ) : (
//             <div style={styles.bidsGrid}>
//               {myBids.map((bid) => (
//                 <div key={bid._id} style={styles.bidCard}>
//                   <div style={styles.bidHeader}>
//                     <h3>{bid.projectTitle}</h3>
//                     <span style={{...styles.bidStatus, backgroundColor: getStatusColor(bid.status)}}>
//                       {bid.status || 'pending'}
//                     </span>
//                   </div>
//                   <div style={styles.bidDetails}>
//                     <p><strong>💰 Your Bid:</strong> ₹{bid.amount}</p>
//                     <p><strong>⏰ Deadline:</strong> {bid.deadline ? new Date(bid.deadline).toLocaleDateString() : 'N/A'}</p>
//                     <p><strong>👤 Client:</strong> {bid.clientName}</p>
//                     {bid.message && <p style={styles.bidMessage}>{bid.message}</p>}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* ✅ TAB 3: ACCEPTED PROJECTS */}
//       {activeTab === 'accepted' && (
//         <div style={styles.acceptedSection}>
//           <h2 style={styles.sectionTitle}>✅ Accepted Projects ({acceptedProjects.length})</h2>
//           {acceptedProjects.length === 0 ? (
//             <div style={styles.emptyState}>
//               <p>No accepted projects yet.</p>
//               <small>Projects with <code>status="accepted"</code> and <code>freelancerId="tempFreelancer"</code></small>
//             </div>
//           ) : (
//             <div style={styles.cardContainer}>
//               {acceptedProjects.map((project) => (
//                 <div key={project._id} style={{...styles.card, borderLeft: '4px solid #10b981'}}>
//                   <h2 style={{...styles.title, color: '#10b981'}}>✅ {project.title}</h2>
//                   <p><strong>💰 Budget:</strong> ₹{project.budget}</p>
//                   <p><strong>👤 Client:</strong> {project.clientName}</p>
                  
//                   {/* PROGRESS BAR */}
//                   <div style={styles.progressContainer}>
//                     <div style={styles.progressBar}>
//                       <div style={{ 
//                         ...styles.progressFill, 
//                         width: `${project.progress || 0}%`,
//                         backgroundColor: project.progress >= 100 ? '#059669' : '#10b981'
//                       }} />
//                     </div>
//                     <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px'}}>
//                       <span>{project.progress || 0}% Complete</span>
//                       <span style={{color: '#6b7280'}}>{project.status}</span>
//                     </div>
//                   </div>

//                   {/* PROGRESS SLIDER */}
//                   <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
//                     <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
//                       <input 
//                         type="range" min="0" max="100" 
//                         value={progressValues[project._id] || project.progress || 0}
//                         onChange={(e) => setProgressValues({
//                           ...progressValues, [project._id]: parseInt(e.target.value)
//                         })}
//                         style={styles.progressSlider}
//                       />
//                       <span style={{minWidth: '50px', fontWeight: 'bold'}}>
//                         {progressValues[project._id] || project.progress || 0}%
//                       </span>
//                     </div>
//                     <button style={{
//                       ...styles.progressButton,
//                       opacity: updatingProgress[project._id] ? 0.7 : 1
//                     }} onClick={() => updateProgress(project._id, progressValues[project._id] || project.progress || 0)}
//                     disabled={updatingProgress[project._id]}>
//                       {updatingProgress[project._id] ? '⏳ Updating...' : '✅ Update Progress'}
//                     </button>
//                   </div>

//                   {/* CHAT BUTTON */}
//                   <div style={styles.projectButtons}>
//                     <button style={{
//                       ...styles.messageButton,
//                       opacity: project.chatEnabled ? 1 : 0.5,
//                       backgroundColor: project.chatEnabled ? '#10b981' : '#9ca3af'
//                     }} onClick={() => project.chatEnabled ? openChat(project._id) : alert('🔒 Chat unlocks at 25% progress!')}
//                     disabled={!project.chatEnabled}>
//                       <FaComment style={{marginRight: '8px'}} />
//                       {project.chatEnabled ? '💬 Message Client' : '🔒 Chat Locked'}
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* ✅ FULLSCREEN CHAT MODAL */}
//       {showChat && (
//         <div style={{
//           position: 'fixed', zIndex: 9999, top: 0, left: 0, right: 0, bottom: 0,
//           background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center'
//         }} onClick={() => setShowChat(null)}>
//           <div style={{ 
//             background: 'white', width: '90%', maxWidth: '600px', height: '80vh', 
//             borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column'
//           }} onClick={e => e.stopPropagation()}>
//             <div style={{ 
//               padding: '24px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
//               color: 'white', position: 'relative'
//             }}>
//               <h2 style={{margin: 0, fontSize: '24px'}}>💬 Project Chat</h2>
//               <button onClick={() => setShowChat(null)} style={{ 
//                 position: 'absolute', top: '20px', right: '20px', background: 'none', 
//                 border: 'none', color: 'white', fontSize: '28px', cursor: 'pointer'
//               }}>×</button>
//             </div>
            
//             <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f8fafc' }}>
//               {chatMessages[showChat]?.length > 0 ? (
//                 chatMessages[showChat].map((msg, index) => (
//                   <div key={index} style={{
//                     marginBottom: '15px',
//                     textAlign: msg.senderName.includes('Freelancer') ? 'right' : 'left'
//                   }}>
//                     <div style={{
//                       display: 'inline-block',
//                       padding: '10px 15px',
//                       background: msg.senderName.includes('Freelancer') ? '#10b981' : '#3b82f6',
//                       color: 'white',
//                       borderRadius: '18px',
//                       maxWidth: '70%'
//                     }}>
//                       {msg.message}
//                     </div>
//                     <small style={{opacity: 0.7, fontSize: '12px'}}>
//                       {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString()}
//                     </small>
//                   </div>
//                 ))
//               ) : (
//                 <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px' }}>
//                   💭 Start the conversation!
//                 </div>
//               )}
//               <div ref={messagesEndRef} />
//             </div>
            
//             <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
//               <div style={{display: 'flex', gap: '12px'}}>
//                 <input 
//                   style={{flex: 1, padding: '14px 20px', border: '2px solid #e2e8f0', borderRadius: '25px'}}
//                   placeholder="Type your message..."
//                   value={chatInput}
//                   onChange={(e) => setChatInput(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
//                 />
//                 <button style={{
//                   width: '52px', height: '52px', border: 'none', 
//                   background: '#10b981', color: 'white', borderRadius: '50%', cursor: 'pointer'
//                 }} onClick={sendChatMessage}>➤</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ✅ COMPLETE STYLES
// const styles = {
//   container: { padding: "30px", background: "#f3e8ff", minHeight: "100vh" },
//   heading: { color: "#6b21a8", textAlign: "center", fontSize: "30px", fontWeight: "700", marginBottom: "25px" },
//   tabNav: { display: "flex", background: "white", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", marginBottom: "25px", overflow: "hidden", maxWidth: "900px", margin: "0 auto 25px" },
//   tabButton: { flex: 1, padding: "15px 20px", background: "transparent", border: "none", fontSize: "16px", fontWeight: "500", color: "#6b7280", cursor: "pointer", transition: "all 0.3s ease" },
//   activeTab: { background: "#6b21a8", color: "white", fontWeight: "bold" },
//   filterPanel: { background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", marginBottom: "25px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "15px", maxWidth: "1200px", margin: "0 auto 25px" },
//   filterInput: { padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "16px", background: "#f9fafb" },
//   filterSelect: { padding: "12px 12px", border: "2px solid #e5e7eb", borderRadius: "8px", background: "white", fontSize: "14px", cursor: "pointer" },
//   cardContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", maxWidth: "1200px", margin: "0 auto" },
//   card: { background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderLeft: "4px solid #6b21a8" },
//   title: { color: "#4b0082", marginBottom: "15px", fontSize: "20px" },
//   bidCount: { color: "#10b981", fontWeight: "bold", margin: "15px 0" },
//   bidButton: { marginTop: "12px", padding: "14px", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", width: "100%" },
//   bidForm: { marginTop: "15px", padding: "20px", background: "#f0f9ff", borderRadius: "12px", border: "2px solid #3b82f6" },
//   input: { width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
//   textarea: { width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" },
//   buttonGroup: { display: "flex", gap: "10px" },
//   submitButton: { flex: 1, padding: "12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
//   cancelButton: { flex: 1, padding: "12px", background: "#6b7280", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
//   bidsSection: { maxWidth: "1200px", margin: "0 auto" },
//   bidsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" },
//   bidCard: { background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderLeft: "4px solid #f59e0b" },
//   bidHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
//   bidStatus: { padding: "6px 12px", borderRadius: "20px", color: "white", fontSize: "12px", fontWeight: "bold" },
//   bidDetails: { marginBottom: "15px" },
//   bidMessage: { background: "#f0f9ff", padding: "12px", borderRadius: "8px", fontSize: "14px", marginTop: "10px" },
//   acceptedSection: { maxWidth: "1200px", margin: "0 auto" },
//   sectionTitle: { color: "#6b21a8", marginBottom: "25px", fontSize: "24px" },
//   noProjects: { textAlign: "center", color: "#555", fontSize: "18px", padding: "40px" },
//   noBids: { textAlign: "center", color: "#555", fontSize: "18px", background: "#f0f9ff", padding: "40px", borderRadius: "12px", border: "2px dashed #3b82f6" },
//   emptyState: { textAlign: "center", padding: "60px 20px", background: "#f8fafc", borderRadius: "12px", border: "2px dashed #cbd5e1", color: "#475569", maxWidth: "600px", margin: "0 auto" },
//   progressContainer: { margin: "20px 0" },
//   progressBar: { width: "100%", height: "12px", background: "#e5e7eb", borderRadius: "6px", overflow: "hidden", marginBottom: "8px" },
//   progressFill: { height: "100%", borderRadius: "6px", transition: "width 0.5s ease" },
//   progressSlider: { flex: 1, height: '8px', borderRadius: '4px', background: '#e5e7eb', outline: 'none', WebkitAppearance: 'none', cursor: 'pointer' },
//   projectButtons: { display: "flex", gap: "10px", marginTop: "20px" },
//   progressButton: { flex: 1, padding: "14px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
//   messageButton: { flex: 1, padding: "14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }
// };

// export default FreelancerDashboard;



// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import io from "socket.io-client";         
// import { FaComment, FaUpload, FaFileUpload, FaDownload, FaEye } from "react-icons/fa";  

// const socket = io("${import.meta.env.VITE_API_URL}");  

// const FreelancerDashboard = () => {
//   const [projects, setProjects] = useState([]);
//   const [filteredProjects, setFilteredProjects] = useState([]);
//   const [showBidForm, setShowBidForm] = useState(null);
//   const [myBids, setMyBids] = useState([]);
//   const [acceptedProjects, setAcceptedProjects] = useState([]);
//   const [activeTab, setActiveTab] = useState('projects');
//   const [showChat, setShowChat] = useState(null);
//   const [chatMessages, setChatMessages] = useState({});
//   const [chatInput, setChatInput] = useState('');
//   const [filters, setFilters] = useState({
//     search: '', skills: '', budget: '', location: '', sort: 'newest'
//   });
//   const [progressValues, setProgressValues] = useState({});
//   const [updatingProgress, setUpdatingProgress] = useState({});
//   const [uploadingFiles, setUploadingFiles] = useState({});
//   const [selectedFiles, setSelectedFiles] = useState({});
//   const [fileInputRefs, setFileInputRefs] = useState({});
//   const [projectFiles, setProjectFiles] = useState({});
//   const messagesEndRef = useRef(null);

//   // 🔥 COMPLETE SOCKET SETUP
//   useEffect(() => {
//     console.log("🔥 Freelancer: Connecting socket...");
    
//     socket.emit("join", { role: "freelancer" });
    
//     socket.on("projects", (projectsData) => {
//       console.log("📡 Socket projects:", projectsData.length);
//       setProjects(projectsData);
//     });
    
//     socket.on("new-project", (project) => {
//       console.log("🆕 New project via socket:", project.title);
//       setProjects(prev => [project, ...prev]);
//     });
    
//     socket.on("chat-history", (messages) => {
//       console.log("📜 Chat history:", messages.length);
//       setChatMessages(prev => ({...prev, [messages[0]?.projectId]: messages}));
//     });
    
//     socket.on("new-chat-message", (message) => {
//       console.log("💬 LIVE MESSAGE:", message.senderName, ":", message.message);
//       setChatMessages(prev => ({
//         ...prev,
//         [message.projectId]: [...(prev[message.projectId] || []), message]
//       }));
//     });

//     // 🔥 NEW FILE UPLOAD SOCKETS
//     socket.on("file-upload-progress", ({projectId, progress}) => {
//       setUploadingFiles(prev => ({...prev, [projectId]: progress}));
//     });

//     socket.on("file-upload-complete", ({projectId, fileName, fileUrl}) => {
//       console.log("✅ File uploaded:", fileName);
//       setUploadingFiles(prev => ({...prev, [projectId]: 100}));
//       setSelectedFiles(prev => ({...prev, [projectId]: []}));
//       alert(`✅ ${fileName} uploaded successfully!`);
//       fetchProjects();
//     });

//     return () => {
//       socket.off("projects");
//       socket.off("new-project");
//       socket.off("chat-history");
//       socket.off("new-chat-message");
//       socket.off("file-upload-progress");
//       socket.off("file-upload-complete");
//     };
//   }, []);

//   // ✅ API CALLS
//   const fetchProjects = async () => {
//   try {
//     const res = await axios.get("${import.meta.env.VITE_API_URL}/api/projects");
//     const allProjects = res.data || [];
//     setProjects(allProjects);
    
//     // ✅ FIXED: Available projects (open + other freelancers' accepted)
//     const available = allProjects.filter(project => 
//       project.status === "open" || 
//       (project.status === "accepted" && project.freelancerId !== "tempFreelancer")
//     );
//     setFilteredProjects(available);
    
//     // ✅ FIXED: My projects (accepted + completed + paid + reviewed)
//     const myProjects = allProjects.filter(project => 
//       (project.freelancerId === "tempFreelancer" || project.freelancerName === "John Doe") &&
//       (project.status === "accepted" || 
//        project.status === "completed" || 
//        project.paymentStatus === "released" ||
//        project.rating)
//     );
//     setAcceptedProjects(myProjects);
//   } catch (error) {
//     console.error("Error fetching projects:", error.response?.data || error.message);
//   }
// };

//   const fetchMyBids = async () => {
//     try {
//       const res = await axios.get("${import.meta.env.VITE_API_URL}/api/bids/my-bids");
//       const acceptedBids = (res.data || []).filter(bid => 
//         bid.status === "accepted" || bid.status === "hired" || bid.status === "won"
//       );
//       setMyBids(acceptedBids);
//     } catch (error) {
//       console.error("Error fetching bids:", error.response?.data || error.message);
//       setMyBids([]);
//     }
//   };

//   // 🔥 NEW FILE UPLOAD FUNCTIONS
//   const handleFileSelect = (projectId, event) => {
//     const files = Array.from(event.target.files);
//     setSelectedFiles(prev => ({...prev, [projectId]: files}));
//     console.log(`📁 Selected ${files.length} files for project ${projectId}`);
//   };

//   const uploadFiles = async (projectId) => {
//     if (!selectedFiles[projectId] || selectedFiles[projectId].length === 0) {
//       alert("❌ Please select files first!");
//       return;
//     }

//     setUploadingFiles(prev => ({...prev, [projectId]: 0}));
    
//     const formData = new FormData();
//     selectedFiles[projectId].forEach((file, index) => {
//       formData.append(`files`, file);
//     });
//     formData.append('projectId', projectId);
//     formData.append('freelancerId', 'tempFreelancer');
//     formData.append('freelancerName', 'John Doe');

//     try {
//       const res = await axios.post("${import.meta.env.VITE_API_URL}/api/files/upload", formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//           const progress = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total
//           );
//           setUploadingFiles(prev => ({...prev, [projectId]: progress}));
//         }
//       });

//       console.log("✅ Upload complete:", res.data);
//       setUploadingFiles(prev => ({...prev, [projectId]: 100}));
      
//     } catch (error) {
//       console.error("❌ Upload failed:", error);
//       alert("❌ File upload failed. Please try again.");
//       setUploadingFiles(prev => ({...prev, [projectId]: 0}));
//     }
//   };

//   const downloadFile = (fileUrl, fileName) => {
//     const link = document.createElement('a');
//     link.href = fileUrl;
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // 🔥 CHAT FUNCTIONS
//   const openChat = (projectId) => {
//     console.log("💬 Opening chat for:", projectId);
//     socket.emit("join-chat", { projectId, senderName: "John Doe (Freelancer)" });
//     setShowChat(projectId);
//     scrollToBottom();
//   };

//   const sendChatMessage = () => {
//     if (chatInput.trim() && showChat) {
//       socket.emit("chat-message", {
//         projectId: showChat,
//         message: chatInput,
//         senderName: "John Doe (Freelancer)"
//       });
//       setChatInput('');
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [chatMessages]);

//   // ✅ PROGRESS UPDATE
//   const updateProgress = async (projectId, newProgress) => {
//     try {
//       setUpdatingProgress(prev => ({...prev, [projectId]: true}));
//       socket.emit("update-progress", { projectId, progress: parseInt(newProgress) });
//       console.log("✅ Progress updated:", newProgress + "%");
//       fetchProjects();
//     } catch (error) {
//       console.error("❌ Progress update failed:", error);
//     } finally {
//       setUpdatingProgress(prev => ({...prev, [projectId]: false}));
//     }
//   };

//   // ✅ BID SUBMIT
//   const handleSubmitBid = async (projectId) => {
//     try {
//       const amountInput = document.getElementById(`amount-${projectId}`);
//       const deadlineInput = document.getElementById(`deadline-${projectId}`);
//       const messageInput = document.getElementById(`message-${projectId}`);
      
//       const bidData = {
//         projectId, freelancerId: "tempFreelancer", freelancerName: "John Doe",
//         amount: parseInt(amountInput.value), deadline: deadlineInput.value,
//         message: messageInput.value
//       };
      
//       socket.emit("new-bid", bidData);
//       alert("✅ Bid submitted successfully!");
//       setShowBidForm(null);
//       fetchProjects();
//       fetchMyBids();
//     } catch (error) {
//       alert("❌ Failed to submit bid");
//     }
//   };

//   // ✅ LOAD DATA
//   useEffect(() => {
//     const refreshAllData = async () => {
//       await fetchProjects();
//       await fetchMyBids();
//     };
//     refreshAllData();
//     const interval = setInterval(refreshAllData, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   // ✅ FILTERS
//   useEffect(() => {
//     let filtered = projects.filter(project => project.status !== "accepted");
//     if (filters.search) {
//       filtered = filtered.filter(project =>
//         project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
//         project.description.toLowerCase().includes(filters.search.toLowerCase())
//       );
//     }
//     if (filters.skills) {
//       filtered = filtered.filter(project =>
//         project.skills?.toLowerCase().includes(filters.skills.toLowerCase())
//       );
//     }
//     if (filters.budget) {
//       const budgetNum = parseInt(filters.budget);
//       filtered = filtered.filter(project => {
//         const projectBudget = parseInt((project.budget || 0).toString().replace(/[^\d]/g, ''));
//         return projectBudget >= budgetNum;
//       });
//     }
//     if (filters.sort === 'newest') {
//       filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     } else if (filters.sort === 'budget-high') {
//       filtered.sort((a, b) => 
//         parseInt((b.budget || 0).toString().replace(/[^\d]/g, '')) - 
//         parseInt((a.budget || 0).toString().replace(/[^\d]/g, ''))
//       );
//     }
//     setFilteredProjects(filtered);
//   }, [projects, filters]);

//   const getStatusColor = (status) => {
//     switch(status?.toLowerCase()) {
//       case 'accepted': case 'hired': case 'won': return '#10b981';
//       case 'pending': return '#f59e0b';
//       case 'rejected': return '#ef4444';
//       default: return '#6b7280';
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <h1 style={styles.heading}>🎯 Freelancer Dashboard</h1>

//       {/* ✅ 3-TAB NAVIGATION */}
//       <div style={styles.tabNav}>
//         <button style={{...styles.tabButton, ...(activeTab === 'projects' && styles.activeTab)}}
//           onClick={() => setActiveTab('projects')}>
//           📋 Available ({filteredProjects.length})
//         </button>
//         <button style={{...styles.tabButton, ...(activeTab === 'bids' && styles.activeTab)}}
//           onClick={() => setActiveTab('bids')}>
//           💰 My Bids ({myBids.length})
//         </button>
//         <button style={{...styles.tabButton, ...(activeTab === 'accepted' && styles.activeTab)}}
//           onClick={() => setActiveTab('accepted')}>
//           ✅ Accepted ({acceptedProjects.length})
//         </button>
//       </div>

//       {/* ✅ TAB 1: PROJECTS */}
//       {activeTab === 'projects' && (
//         <>
//           <div style={styles.filterPanel}>
//             <input style={styles.filterInput} placeholder="🔍 Search projects..."
//               value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} />
//             <select style={styles.filterSelect} value={filters.skills} 
//               onChange={(e) => setFilters({...filters, skills: e.target.value})}>
//               <option value="">All Skills</option>
//               <option value="react">React</option>
//               <option value="node">Node.js</option>
//               <option value="mongo">MongoDB</option>
//               <option value="java">Java</option>
//             </select>
//             <select style={styles.filterSelect} value={filters.budget} 
//               onChange={(e) => setFilters({...filters, budget: e.target.value})}>
//               <option value="">All Budgets</option>
//               <option value="5000">₹5,000+</option>
//               <option value="10000">₹10,000+</option>
//             </select>
//             <select style={styles.filterSelect} value={filters.sort} 
//               onChange={(e) => setFilters({...filters, sort: e.target.value})}>
//               <option value="newest">Newest First</option>
//               <option value="budget-high">Highest Budget</option>
//             </select>
//           </div>

//           {filteredProjects.length === 0 ? (
//             <p style={styles.noProjects}>No available projects match your filters.</p>
//           ) : (
//             <div style={styles.cardContainer}>
//               {filteredProjects.map((project) => (
//                 <div key={project._id} style={styles.card}>
//                   <h2 style={styles.title}>{project.title}</h2>
//                   <p><strong>Status:</strong> <span style={{color: getStatusColor(project.status)}}>{project.status || 'Open'}</span></p>
//                   <p><strong>Description:</strong> {project.description}</p>
//                   <p><strong>Budget:</strong> 💰 ₹{project.budget}</p>
//                   <p><strong>Duration:</strong> ⏱️ {project.duration || "Not specified"}</p>
//                   <p><strong>Skills:</strong> {project.skills || "Not specified"}</p>
//                   <p><strong>Client:</strong> 👤 {project.clientName || "Client"}</p>
//                   <p style={styles.bidCount}>📊 Bids: {project.bidsCount || 0}</p>

//                   {showBidForm === project._id ? (
//                     <div style={styles.bidForm}>
//                       <input id={`amount-${project._id}`} placeholder="Your bid amount (₹)" style={styles.input} type="number" />
//                       <input id={`deadline-${project._id}`} placeholder="Deadline" style={styles.input} type="date" />
//                       <textarea id={`message-${project._id}`} placeholder="Why you should be selected?" style={styles.textarea} rows="3" />
//                       <div style={styles.buttonGroup}>
//                         <button style={styles.submitButton} onClick={() => handleSubmitBid(project._id)}>
//                           Submit Bid 🚀
//                         </button>
//                         <button style={styles.cancelButton} onClick={() => setShowBidForm(null)}>
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <button style={styles.bidButton} onClick={() => setShowBidForm(project._id)}>
//                       💰 Bid Now ({project.bidsCount || 0} bids)
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       )}

//       {/* ✅ TAB 2: MY BIDS */}
//       {activeTab === 'bids' && (
//         <div style={styles.bidsSection}>
//           <h2 style={styles.sectionTitle}>💰 My Bids ({myBids.length})</h2>
//           {myBids.length === 0 ? (
//             <p style={styles.noBids}>No accepted/hired bids yet.</p>
//           ) : (
//             <div style={styles.bidsGrid}>
//               {myBids.map((bid) => (
//                 <div key={bid._id} style={styles.bidCard}>
//                   <div style={styles.bidHeader}>
//                     <h3>{bid.projectTitle}</h3>
//                     <span style={{...styles.bidStatus, backgroundColor: getStatusColor(bid.status)}}>
//                       {bid.status || 'pending'}
//                     </span>
//                   </div>
//                   <div style={styles.bidDetails}>
//                     <p><strong>💰 Your Bid:</strong> ₹{bid.amount}</p>
//                     <p><strong>⏰ Deadline:</strong> {bid.deadline ? new Date(bid.deadline).toLocaleDateString() : 'N/A'}</p>
//                     <p><strong>👤 Client:</strong> {bid.clientName}</p>
//                     {bid.message && <p style={styles.bidMessage}>{bid.message}</p>}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* ✅ TAB 3: ACCEPTED PROJECTS WITH FULL FILE MANAGEMENT */}
//       {activeTab === 'accepted' && (
//         <div style={styles.acceptedSection}>
//           <h2 style={styles.sectionTitle}>✅ Accepted Projects ({acceptedProjects.length})</h2>
//           {acceptedProjects.length === 0 ? (
//             <div style={styles.emptyState}>
//               <p>No accepted projects yet.</p>
//               <small>Projects with <code>status="accepted"</code> and <code>freelancerId="tempFreelancer"</code></small>
//             </div>
//           ) : (
//             <div style={styles.cardContainer}>
//               {acceptedProjects.map((project) => (
//                 <div key={project._id} style={{...styles.card, borderLeft: '4px solid #10b981'}}>
//                   <h2 style={{...styles.title, color: '#10b981'}}>✅ {project.title}</h2>
//                   <p><strong>💰 Budget:</strong> ₹{project.budget}</p>
//                   <p><strong>👤 Client:</strong> {project.clientName}</p>
                  
//                   {/* PROGRESS BAR */}
//                   <div style={styles.progressContainer}>
//                     <div style={styles.progressBar}>
//                       <div style={{ 
//                         ...styles.progressFill, 
//                         width: `${project.progress || 0}%`,
//                         backgroundColor: project.progress >= 100 ? '#059669' : '#10b981'
//                       }} />
//                     </div>
//                     <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px'}}>
//                       <span>{project.progress || 0}% Complete</span>
//                       <span style={{color: '#6b7280'}}>{project.status}</span>
//                     </div>
//                   </div>

//                   {/* PROGRESS SLIDER */}
//                   <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
//                     <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
//                       <input 
//                         type="range" min="0" max="100" 
//                         value={progressValues[project._id] || project.progress || 0}
//                         onChange={(e) => setProgressValues({
//                           ...progressValues, [project._id]: parseInt(e.target.value)
//                         })}
//                         style={styles.progressSlider}
//                       />
//                       <span style={{minWidth: '50px', fontWeight: 'bold'}}>
//                         {progressValues[project._id] || project.progress || 0}%
//                       </span>
//                     </div>
//                     <button style={{
//                       ...styles.progressButton,
//                       opacity: updatingProgress[project._id] ? 0.7 : 1
//                     }} onClick={() => updateProgress(project._id, progressValues[project._id] || project.progress || 0)}
//                     disabled={updatingProgress[project._id]}>
//                       {updatingProgress[project._id] ? '⏳ Updating...' : '✅ Update Progress'}
//                     </button>
//                   </div>

//                   {/* 🔥 COMPLETE FILE UPLOAD SECTION */}
//                   <div style={styles.fileUploadSection}>
//                     <h4 style={styles.fileSectionTitle}>
//                       <FaUpload style={{marginRight: '8px'}} /> 📁 File Management
//                     </h4>
                    
//                     {/* UPLOAD AREA */}
//                     <div style={styles.uploadArea}>
//                       <input
//                         id={`file-upload-${project._id}`}
//                         type="file"
//                         multiple
//                         accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.mp4"
//                         onChange={(e) => handleFileSelect(project._id, e)}
//                         style={styles.hiddenFileInput}
//                       />
//                       <label htmlFor={`file-upload-${project._id}`} style={styles.fileUploadLabel}>
//                         <FaFileUpload style={{fontSize: '24px', marginRight: '12px'}} />
//                         {selectedFiles[project._id]?.length > 0 
//                           ? `📁 ${selectedFiles[project._id].length} file(s) selected`
//                           : 'Choose Files (PDF, DOC, Images, ZIP, Video)'
//                         }
//                       </label>
                      
//                       {uploadingFiles[project._id] > 0 && (
//                         <div style={styles.uploadProgress}>
//                           <div style={styles.progressBarSmall}>
//                             <div style={{
//                               ...styles.progressFill,
//                               width: `${uploadingFiles[project._id]}%`,
//                               backgroundColor: '#059669'
//                             }} />
//                           </div>
//                           <small style={{color: '#059669'}}>
//                             {Math.round(uploadingFiles[project._id] || 0)}% uploaded
//                           </small>
//                         </div>
//                       )}
                      
//                       {selectedFiles[project._id]?.length > 0 && (
//                         <button 
//                           style={{
//                             ...styles.uploadButton,
//                             opacity: uploadingFiles[project._id] >= 100 ? 0.6 : 1
//                           }}
//                           onClick={() => uploadFiles(project._id)}
//                           disabled={uploadingFiles[project._id] >= 100}
//                         >
//                           {uploadingFiles[project._id] > 0 && uploadingFiles[project._id] < 100
//                             ? `⏳ Uploading... ${Math.round(uploadingFiles[project._id] || 0)}%`
//                             : '🚀 Upload Files Now'
//                           }
//                         </button>
//                       )}
//                     </div>

//                     {/* EXISTING FILES LIST */}
//                     {project.files && project.files.length > 0 && (
//                       <div style={styles.filesList}>
//                         <h5 style={{marginBottom: '12px', color: '#374151'}}>📋 Uploaded Files ({project.files.length})</h5>
//                         <div style={styles.filesGrid}>
//                           {project.files.map((file, index) => (
//                             <div key={index} style={styles.fileItem}>
//                               <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
//                                 <FaEye style={{color: '#3b82f6', fontSize: '16px'}} />
//                                 <span style={{fontWeight: '500'}}>{file.name}</span>
//                                 <small style={{color: '#6b7280'}}>({Math.round(file.size/1024)} KB)</small>
//                               </div>
//                               <div style={{display: 'flex', gap: '8px'}}>
//                                 <button 
//                                   style={styles.downloadButton}
//                                   onClick={() => downloadFile(file.url, file.name)}
//                                   title="Download"
//                                 >
//                                   <FaDownload />
//                                 </button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* CHAT BUTTON */}
//                   <div style={styles.projectButtons}>
//                     <button style={{
//                       ...styles.messageButton,
//                       opacity: project.chatEnabled ? 1 : 0.5,
//                       backgroundColor: project.chatEnabled ? '#10b981' : '#9ca3af'
//                     }} onClick={() => project.chatEnabled ? openChat(project._id) : alert('🔒 Chat unlocks at 25% progress!')}
//                     disabled={!project.chatEnabled}>
//                       <FaComment style={{marginRight: '8px'}} />
//                       {project.chatEnabled ? '💬 Message Client' : '🔒 Chat Locked'}
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* ✅ FULLSCREEN CHAT MODAL */}
//       {showChat && (
//         <div style={{
//           position: 'fixed', zIndex: 9999, top: 0, left: 0, right: 0, bottom: 0,
//           background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center'
//         }} onClick={() => setShowChat(null)}>
//           <div style={{ 
//             background: 'white', width: '90%', maxWidth: '600px', height: '80vh', 
//             borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column'
//           }} onClick={e => e.stopPropagation()}>
//             <div style={{ 
//               padding: '24px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
//               color: 'white', position: 'relative'
//             }}>
//               <h2 style={{margin: 0, fontSize: '24px'}}>💬 Project Chat</h2>
//               <button onClick={() => setShowChat(null)} style={{ 
//                 position: 'absolute', top: '20px', right: '20px', background: 'none', 
//                 border: 'none', color: 'white', fontSize: '28px', cursor: 'pointer'
//               }}>×</button>
//             </div>
            
//             <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f8fafc' }}>
//               {chatMessages[showChat]?.length > 0 ? (
//                 chatMessages[showChat].map((msg, index) => (
//                   <div key={index} style={{
//                     marginBottom: '15px',
//                     textAlign: msg.senderName.includes('Freelancer') ? 'right' : 'left'
//                   }}>
//                     <div style={{
//                       display: 'inline-block',
//                       padding: '10px 15px',
//                       background: msg.senderName.includes('Freelancer') ? '#10b981' : '#3b82f6',
//                       color: 'white',
//                       borderRadius: '18px',
//                       maxWidth: '70%'
//                     }}>
//                       {msg.message}
//                     </div>
//                     <small style={{opacity: 0.7, fontSize: '12px'}}>
//                       {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString()}
//                     </small>
//                   </div>
//                 ))
//               ) : (
//                 <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px' }}>
//                   💭 Start the conversation!
//                 </div>
//               )}
//               <div ref={messagesEndRef} />
//             </div>
            
//             <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
//               <div style={{display: 'flex', gap: '12px'}}>
//                 <input 
//                   style={{flex: 1, padding: '14px 20px', border: '2px solid #e2e8f0', borderRadius: '25px'}}
//                   placeholder="Type your message..."
//                   value={chatInput}
//                   onChange={(e) => setChatInput(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
//                 />
//                 <button style={{
//                   width: '52px', height: '52px', border: 'none', 
//                   background: '#10b981', color: 'white', borderRadius: '50%', cursor: 'pointer'
//                 }} onClick={sendChatMessage}>➤</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ✅ COMPLETE STYLES WITH FULL FILE MANAGEMENT
// const styles = {
//   container: { padding: "30px", background: "#f3e8ff", minHeight: "100vh" },
//   heading: { color: "#6b21a8", textAlign: "center", fontSize: "30px", fontWeight: "700", marginBottom: "25px" },
//   tabNav: { display: "flex", background: "white", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", marginBottom: "25px", overflow: "hidden", maxWidth: "900px", margin: "0 auto 25px" },
//   tabButton: { flex: 1, padding: "15px 20px", background: "transparent", border: "none", fontSize: "16px", fontWeight: "500", color: "#6b7280", cursor: "pointer", transition: "all 0.3s ease" },
//   activeTab: { background: "#6b21a8", color: "white", fontWeight: "bold" },
//   filterPanel: { background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", marginBottom: "25px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "15px", maxWidth: "1200px", margin: "0 auto 25px" },
//   filterInput: { padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "16px", background: "#f9fafb" },
//   filterSelect: { padding: "12px 12px", border: "2px solid #e5e7eb", borderRadius: "8px", background: "white", fontSize: "14px", cursor: "pointer" },
//   cardContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", maxWidth: "1200px", margin: "0 auto" },
//   card: { background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderLeft: "4px solid #6b21a8" },
//   title: { color: "#4b0082", marginBottom: "15px", fontSize: "20px" },
//   bidCount: { color: "#10b981", fontWeight: "bold", margin: "15px 0" },
//   bidButton: { marginTop: "12px", padding: "14px", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", width: "100%" },
//   bidForm: { marginTop: "15px", padding: "20px", background: "#f0f9ff", borderRadius: "12px", border: "2px solid #3b82f6" },
//   input: { width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
//   textarea: { width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" },
//   buttonGroup: { display: "flex", gap: "10px" },
//   submitButton: { flex: 1, padding: "12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
//   cancelButton: { flex: 1, padding: "12px", background: "#6b7280", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
//   bidsSection: { maxWidth: "1200px", margin: "0 auto" },
//   bidsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" },
//   bidCard: { background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderLeft: "4px solid #f59e0b" },
//   bidHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
//   bidStatus: { padding: "6px 12px", borderRadius: "20px", color: "white", fontSize: "12px", fontWeight: "bold" },
//   bidDetails: { marginBottom: "15px" },
//   bidMessage: { background: "#f0f9ff", padding: "12px", borderRadius: "8px", fontSize: "14px", marginTop: "10px" },
//   acceptedSection: { maxWidth: "1200px", margin: "0 auto" },
//   sectionTitle: { color: "#6b21a8", marginBottom: "25px", fontSize: "24px" },
//   noProjects: { textAlign: "center", color: "#555", fontSize: "18px", padding: "40px" },
//   noBids: { textAlign: "center", color: "#555", fontSize: "18px", background: "#f0f9ff", padding: "40px", borderRadius: "12px", border: "2px dashed #3b82f6" },
//   emptyState: { textAlign: "center", padding: "60px 20px", background: "#f8fafc", borderRadius: "12px", border: "2px dashed #cbd5e1", color: "#475569", maxWidth: "600px", margin: "0 auto" },
//   progressContainer: { margin: "20px 0" },
//   progressBar: { width: "100%", height: "12px", background: "#e5e7eb", borderRadius: "6px", overflow: "hidden", marginBottom: "8px" },
//   progressFill: { height: "100%", borderRadius: "6px", transition: "width 0.5s ease" },
//   progressSlider: { flex: 1, height: '8px', borderRadius: '4px', background: '#e5e7eb', outline: 'none', WebkitAppearance: 'none', cursor: 'pointer' },
//   projectButtons: { display: "flex", gap: "10px", marginTop: "20px" },
//   progressButton: { flex: 1, padding: "14px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
//   messageButton: { flex: 1, padding: "14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
  
//   // 🔥 NEW COMPLETE FILE MANAGEMENT STYLES
//   fileUploadSection: {
//     marginTop: '25px', 
//     padding: '24px', 
//     background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
//     borderRadius: '16px', 
//     border: '2px solid #bbf7d0'
//   },
//   fileSectionTitle: {
//     color: '#059669', 
//     margin: '0 0 20px 0', 
//     fontSize: '18px', 
//     fontWeight: '600'
//   },
//   uploadArea: { marginBottom: '20px' },
//   hiddenFileInput: { display: 'none' },
//   fileUploadLabel: { 
//     display: 'flex', 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     padding: '18px 24px', 
//     border: '3px dashed #10b981', 
//     borderRadius: '16px', 
//     background: 'white', 
//     color: '#059669', 
//     cursor: 'pointer', 
//     fontWeight: '600', 
//     fontSize: '16px', 
//     transition: 'all 0.3s ease',
//     textAlign: 'center',
//     width: '100%',
//     boxSizing: 'border-box'
//   },
//   'fileUploadLabel:hover': {
//     background: '#ecfdf5',
//     borderColor: '#059669',
//     transform: 'translateY(-2px)'
//   },
//   uploadProgress: { 
//     marginTop: '16px', 
//     padding: '12px 16px', 
//     background: 'white', 
//     borderRadius: '10px', 
//     border: '1px solid #d1d5db' 
//   },
//   progressBarSmall: { 
//     height: '8px', 
//     background: '#f3f4f6', 
//     borderRadius: '4px', 
//     overflow: 'hidden', 
//     marginBottom: '6px' 
//   },
//   uploadButton: { 
//     width: '100%', 
//     padding: '16px', 
//     background: '#10b981', 
//     color: 'white', 
//     border: 'none', 
//     borderRadius: '12px', 
//     cursor: 'pointer', 
//     fontWeight: 'bold', 
//     fontSize: '16px',
//     transition: 'all 0.3s ease'
//   },
//   'uploadButton:hover': {
//     background: '#059669'
//   },
//   filesList: { 
//     marginTop: '24px', 
//     paddingTop: '20px', 
//     borderTop: '2px solid #d1d5db' 
//   },
//   filesGrid: { 
//     display: 'grid', 
//     gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
//     gap: '12px' 
//   },
//   fileItem: { 
//     display: 'flex', 
//     justifyContent: 'space-between', 
//     alignItems: 'center', 
//     padding: '14px 16px', 
//     background: 'white', 
//     borderRadius: '10px', 
//     border: '1px solid #e5e7eb',
//     transition: 'all 0.2s ease'
//   },
//   'fileItem:hover': {
//     boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//     borderColor: '#10b981'
//   },
//   downloadButton: { 
//     padding: '8px 12px', 
//     background: '#3b82f6', 
//     color: 'white', 
//     border: 'none', 
//     borderRadius: '8px', 
//     cursor: 'pointer', 
//     display: 'flex', 
//     alignItems: 'center', 
//     fontSize: '14px',
//     transition: 'all 0.2s ease'
//   },
//   'downloadButton:hover': {
//     background: '#2563eb'
//   }
// };

// export default FreelancerDashboard;


import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";         
import { FaComment, FaUpload, FaFileUpload, FaDownload, FaEye, FaStar, FaCreditCard, FaCheckCircle } from "react-icons/fa";  

const socket = io("${import.meta.env.VITE_API_URL}");  

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
      setChatMessages(prev => ({...prev, [messages[0]?.projectId]: messages}));
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

    socket.on("file-upload-progress", ({projectId, progress}) => {
      setUploadingFiles(prev => ({...prev, [projectId]: progress}));
    });

    socket.on("file-upload-complete", ({projectId, fileName, fileUrl}) => {
      console.log("✅ File uploaded:", fileName);
      setUploadingFiles(prev => ({...prev, [projectId]: 100}));
      setSelectedFiles(prev => ({...prev, [projectId]: []}));
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

  // ✅ FIXED fetchProjects - SHOWS PAID PROJECTS
  const fetchProjects = async () => {
    try {
      const res = await axios.get("${import.meta.env.VITE_API_URL}/api/projects");
      const allProjects = res.data || [];
      setProjects(allProjects);
      
      // Available projects
      const available = allProjects.filter(project => 
        project.status === "open" || 
        (project.status === "accepted" && project.freelancerId !== "tempFreelancer")
      );
      setFilteredProjects(available);
      
      // ✅ FIXED: My projects (accepted + completed + paid + reviewed)
      const myProjects = allProjects.filter(project => 
        (project.freelancerId === "tempFreelancer" || project.freelancerName === "John Doe") &&
        (project.status === "accepted" || 
         project.status === "completed" || 
         project.paymentStatus === "released" ||
         project.paymentStatus === "paid" ||
         project.rating)
      );
      setAcceptedProjects(myProjects);
    } catch (error) {
      console.error("Error fetching projects:", error.response?.data || error.message);
    }
  };

  const fetchMyBids = async () => {
    try {
      const res = await axios.get("${import.meta.env.VITE_API_URL}/api/bids/my-bids");
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
        await axios.post("${import.meta.env.VITE_API_URL}/api/projects/release-funds", {
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
    setSelectedFiles(prev => ({...prev, [projectId]: files}));
    console.log(`📁 Selected ${files.length} files for project ${projectId}`);
  };

  const uploadFiles = async (projectId) => {
    if (!selectedFiles[projectId] || selectedFiles[projectId].length === 0) {
      alert("❌ Please select files first!");
      return;
    }

    setUploadingFiles(prev => ({...prev, [projectId]: 0}));
    
    const formData = new FormData();
    selectedFiles[projectId].forEach((file) => {
      formData.append(`files`, file);
    });
    formData.append('projectId', projectId);
    formData.append('freelancerId', 'tempFreelancer');
    formData.append('freelancerName', 'John Doe');

    try {
      const res = await axios.post("${import.meta.env.VITE_API_URL}/api/files/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadingFiles(prev => ({...prev, [projectId]: progress}));
        }
      });

      console.log("✅ Upload complete:", res.data);
      setUploadingFiles(prev => ({...prev, [projectId]: 100}));
      
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("❌ File upload failed. Please try again.");
      setUploadingFiles(prev => ({...prev, [projectId]: 0}));
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
      setUpdatingProgress(prev => ({...prev, [projectId]: true}));
      socket.emit("update-progress", { projectId, progress: parseInt(newProgress) });
      console.log("✅ Progress updated:", newProgress + "%");
      fetchProjects();
    } catch (error) {
      console.error("❌ Progress update failed:", error);
    } finally {
      setUpdatingProgress(prev => ({...prev, [projectId]: false}));
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
    switch(status?.toLowerCase()) {
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
        <button style={{...styles.tabButton, ...(activeTab === 'projects' && styles.activeTab)}}
          onClick={() => setActiveTab('projects')}>
          📋 Available ({filteredProjects.length})
        </button>
        <button style={{...styles.tabButton, ...(activeTab === 'bids' && styles.activeTab)}}
          onClick={() => setActiveTab('bids')}>
          💰 My Bids ({myBids.length})
        </button>
        <button style={{...styles.tabButton, ...(activeTab === 'accepted' && styles.activeTab)}}
          onClick={() => setActiveTab('accepted')}>
          ✅ My Projects ({acceptedProjects.length})
        </button>
      </div>

      {/* TAB 1: PROJECTS */}
      {activeTab === 'projects' && (
        <>
          <div style={styles.filterPanel}>
            <input style={styles.filterInput} placeholder="🔍 Search projects..."
              value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} />
            <select style={styles.filterSelect} value={filters.skills} 
              onChange={(e) => setFilters({...filters, skills: e.target.value})}>
              <option value="">All Skills</option>
              <option value="react">React</option>
              <option value="node">Node.js</option>
              <option value="mongo">MongoDB</option>
              <option value="java">Java</option>
            </select>
            <select style={styles.filterSelect} value={filters.budget} 
              onChange={(e) => setFilters({...filters, budget: e.target.value})}>
              <option value="">All Budgets</option>
              <option value="5000">₹5,000+</option>
              <option value="10000">₹10,000+</option>
            </select>
            <select style={styles.filterSelect} value={filters.sort} 
              onChange={(e) => setFilters({...filters, sort: e.target.value})}>
              <option value="newest">Newest First</option>
              <option value="budget-high">Highest Budget</option>
            </select>
          </div>

          {filteredProjects.length === 0 ? (
            <p style={styles.noProjects}>No available projects match your filters.</p>
          ) : (
            <div style={styles.cardContainer}>
              {filteredProjects.map((project) => (
                <div key={project._id} style={styles.card}>
                  <h2 style={styles.title}>{project.title}</h2>
                  <p><strong>Status:</strong> <span style={{color: getStatusColor(project.status)}}>{project.status || 'Open'}</span></p>
                  <p><strong>Description:</strong> {project.description}</p>
                  <p><strong>Budget:</strong> 💰 ₹{project.budget}</p>
                  <p><strong>Duration:</strong> ⏱️ {project.duration || "Not specified"}</p>
                  <p><strong>Skills:</strong> {project.skills || "Not specified"}</p>
                  <p><strong>Client:</strong> 👤 {project.clientName || "Client"}</p>
                  <p style={styles.bidCount}>📊 Bids: {project.bidsCount || 0}</p>

                  {showBidForm === project._id ? (
                    <div style={styles.bidForm}>
                      <input id={`amount-${project._id}`} placeholder="Your bid amount (₹)" style={styles.input} type="number" />
                      <input id={`deadline-${project._id}`} placeholder="Deadline" style={styles.input} type="date" />
                      <textarea id={`message-${project._id}`} placeholder="Why you should be selected?" style={styles.textarea} rows="3" />
                      <div style={styles.buttonGroup}>
                        <button style={styles.submitButton} onClick={() => handleSubmitBid(project._id)}>
                          Submit Bid 🚀
                        </button>
                        <button style={styles.cancelButton} onClick={() => setShowBidForm(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button style={styles.bidButton} onClick={() => setShowBidForm(project._id)}>
                      💰 Bid Now ({project.bidsCount || 0} bids)
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
          <h2 style={styles.sectionTitle}>💰 My Bids ({myBids.length})</h2>
          {myBids.length === 0 ? (
            <p style={styles.noBids}>No accepted/hired bids yet.</p>
          ) : (
            <div style={styles.bidsGrid}>
              {myBids.map((bid) => (
                <div key={bid._id} style={styles.bidCard}>
                  <div style={styles.bidHeader}>
                    <h3>{bid.projectTitle}</h3>
                    <span style={{...styles.bidStatus, backgroundColor: getStatusColor(bid.status)}}>
                      {bid.status || 'pending'}
                    </span>
                  </div>
                  <div style={styles.bidDetails}>
                    <p><strong>💰 Your Bid:</strong> ₹{bid.amount}</p>
                    <p><strong>⏰ Deadline:</strong> {bid.deadline ? new Date(bid.deadline).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>👤 Client:</strong> {bid.clientName}</p>
                    {bid.message && <p style={styles.bidMessage}>{bid.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACCEPTED PROJECTS */}
      {activeTab === 'accepted' && (
        <div style={styles.acceptedSection}>
          <h2 style={styles.sectionTitle}>✅ My Projects ({acceptedProjects.length})</h2>
          {acceptedProjects.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No accepted projects yet.</p>
              <small>Projects with status="accepted", "completed", "paid", or ratings</small>
            </div>
          ) : (
            <div style={styles.cardContainer}>
              {acceptedProjects.map((project) => (
                <div key={project._id} style={{...styles.card, borderLeft: `4px solid ${project.paymentStatus === 'released' || project.paymentStatus === 'paid' ? '#059669' : '#10b981'}`}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                    <h2 style={{...styles.title, color: project.paymentStatus === 'released' || project.paymentStatus === 'paid' ? '#059669' : '#10b981', margin: 0}}>
                      {project.paymentStatus === 'released' || project.paymentStatus === 'paid' ? '💰 PAID' : 
                       project.status === 'completed' ? '🎉 COMPLETED' : '✅'} {project.title}
                    </h2>
                    
                    {project.rating && (
                      <div style={{display: 'flex', alignItems: 'center', background: '#fef3c7', padding: '8px 12px', borderRadius: '20px'}}>
                        {renderStars(project.rating)}
                      </div>
                    )}
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                    <p><strong>💰 Budget:</strong> ₹{project.budget}</p>
                    <p><strong>👤 Client:</strong> {project.clientName}</p>
                  </div>

                  {/* PAYMENT STATUS */}
                  <div style={styles.paymentSection}>
                    <h4 style={styles.paymentTitle}>
                      <FaCreditCard style={{marginRight: '8px', color: '#3b82f6'}} /> Payment Status
                    </h4>
                    <div style={styles.paymentStatusRow}>
                      <span style={styles.paymentLabel}>Escrow:</span>
                      <span style={{...styles.paymentValue, color: project.paymentStatus === 'funded' ? '#10b981' : '#6b7280'}}>
                        ₹{project.escrowAmount || 0}
                      </span>
                      
                      <span style={styles.paymentLabel}>Payout:</span>
                      <span style={{...styles.paymentValue, fontWeight: 'bold'}}>
                        ₹{project.freelancerPayout || 0}
                      </span>
                      
                      <span style={styles.paymentLabel}>Status:</span>
                      <span style={{
                        ...styles.paymentStatusBadge,
                        backgroundColor: {
                          'unfunded': '#fee2e2',
                          'funded': '#dcfce7', 
                          'released': '#dbeafe',
                          'paid': '#dbeafe',
                          'disputed': '#fed7aa'
                        }[project.paymentStatus || 'unfunded'] || '#f3f4f6',
                        color: {
                          'unfunded': '#dc2626',
                          'funded': '#059669',
                          'released': '#2563eb',
                          'paid': '#2563eb',
                          'disputed': '#d97706'
                        }[project.paymentStatus || 'unfunded'] || '#6b7280'
                      }}>
                        {project.paymentStatus?.toUpperCase() || 'UNFUNDED'}
                      </span>
                    </div>

                    {project.paymentStatus === 'funded' && project.status === 'completed' && (
                      <button 
                        style={styles.releaseFundsButton}
                        onClick={() => releaseFunds(project)}
                      >
                        <FaCheckCircle style={{marginRight: '8px'}} /> Release ₹{project.freelancerPayout || 0} Payout
                      </button>
                    )}
                  </div>

                  {/* PROGRESS */}
                  {project.status !== 'completed' && (
                    <>
                      <div style={styles.progressContainer}>
                        <div style={styles.progressBar}>
                          <div style={{ 
                            ...styles.progressFill, 
                            width: `${project.progress || 0}%`,
                            backgroundColor: project.progress >= 100 ? '#059669' : '#10b981'
                          }} />
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px'}}>
                          <span>{project.progress || 0}% Complete</span>
                          <span style={{color: getStatusColor(project.status)}}>{project.status}</span>
                        </div>
                      </div>

                      <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                          <input 
                            type="range" min="0" max="100" 
                            value={progressValues[project._id] || project.progress || 0}
                            onChange={(e) => setProgressValues({
                              ...progressValues, [project._id]: parseInt(e.target.value)
                            })}
                            style={styles.progressSlider}
                          />
                          <span style={{minWidth: '50px', fontWeight: 'bold'}}>
                            {progressValues[project._id] || project.progress || 0}%
                          </span>
                        </div>
                        <button style={{
                          ...styles.progressButton,
                          opacity: updatingProgress[project._id] ? 0.7 : 1
                        }} onClick={() => updateProgress(project._id, progressValues[project._id] || project.progress || 0)}
                        disabled={updatingProgress[project._id]}>
                          {updatingProgress[project._id] ? '⏳ Updating...' : '✅ Update Progress'}
                        </button>
                      </div>
                    </>
                  )}

                  {/* FILE UPLOAD */}
                  <div style={styles.fileUploadSection}>
                    <h4 style={styles.fileSectionTitle}>
                      <FaUpload style={{marginRight: '8px'}} /> 📁 File Management
                    </h4>
                    
                    <div style={styles.uploadArea}>
                      <input
                        id={`file-upload-${project._id}`}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip,.mp4"
                        onChange={(e) => handleFileSelect(project._id, e)}
                        style={styles.hiddenFileInput}
                      />
                      <label htmlFor={`file-upload-${project._id}`} style={styles.fileUploadLabel}>
                        <FaFileUpload style={{fontSize: '24px', marginRight: '12px'}} />
                        {selectedFiles[project._id]?.length > 0 
                          ? `📁 ${selectedFiles[project._id].length} file(s) selected`
                          : 'Choose Files (PDF, DOC, Images, ZIP, Video)'
                        }
                      </label>
                      
                      {uploadingFiles[project._id] > 0 && (
                        <div style={styles.uploadProgress}>
                          <div style={styles.progressBarSmall}>
                            <div style={{
                              ...styles.progressFill,
                              width: `${uploadingFiles[project._id]}%`,
                              backgroundColor: '#059669'
                            }} />
                          </div>
                          <small style={{color: '#059669'}}>
                            {Math.round(uploadingFiles[project._id] || 0)}% uploaded
                          </small>
                        </div>
                      )}
                      
                      {selectedFiles[project._id]?.length > 0 && (
                        <button 
                          style={{
                            ...styles.uploadButton,
                            opacity: uploadingFiles[project._id] >= 100 ? 0.6 : 1
                          }}
                          onClick={() => uploadFiles(project._id)}
                          disabled={uploadingFiles[project._id] >= 100}
                        >
                          {uploadingFiles[project._id] > 0 && uploadingFiles[project._id] < 100
                            ? `⏳ Uploading... ${Math.round(uploadingFiles[project._id] || 0)}%`
                            : '🚀 Upload Files Now'
                          }
                        </button>
                      )}
                    </div>

                    {project.files && project.files.length > 0 && (
                      <div style={styles.filesList}>
                        <h5 style={{marginBottom: '12px', color: '#374151'}}>📋 Uploaded Files ({project.files.length})</h5>
                        <div style={styles.filesGrid}>
                          {project.files.map((file, index) => (
                            <div key={index} style={styles.fileItem}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <FaEye style={{color: '#3b82f6', fontSize: '16px'}} />
                                <span style={{fontWeight: '500'}}>{file.name}</span>
                                <small style={{color: '#6b7280'}}>({Math.round(file.size/1024)} KB)</small>
                              </div>
                              <button 
                                style={styles.downloadButton}
                                onClick={() => downloadFile(file.url, file.name)}
                                title="Download"
                              >
                                <FaDownload />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={styles.projectButtons}>
                    <button style={{
                      ...styles.messageButton,
                      opacity: project.chatEnabled ? 1 : 0.5,
                      backgroundColor: project.chatEnabled ? '#10b981' : '#9ca3af'
                    }} onClick={() => project.chatEnabled ? openChat(project._id) : alert('🔒 Chat unlocks at 25% progress!')}
                    disabled={!project.chatEnabled}>
                      <FaComment style={{marginRight: '8px'}} />
                      {project.chatEnabled ? '💬 Message Client' : '🔒 Chat Locked'}
                    </button>
                  </div>
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
              <h2 style={{margin: 0, fontSize: '24px'}}>💬 Project Chat</h2>
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
                    <small style={{opacity: 0.7, fontSize: '12px'}}>
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
              <div style={{display: 'flex', gap: '12px'}}>
                <input 
                  style={{flex: 1, padding: '14px 20px', border: '2px solid #e2e8f0', borderRadius: '25px'}}
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
  container: { padding: "30px", background: "#f3e8ff", minHeight: "100vh" },
  heading: { color: "#6b21a8", textAlign: "center", fontSize: "30px", fontWeight: "700", marginBottom: "25px" },
  tabNav: { display: "flex", background: "white", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", marginBottom: "25px", overflow: "hidden", maxWidth: "900px", margin: "0 auto 25px" },
  tabButton: { flex: 1, padding: "15px 20px", background: "transparent", border: "none", fontSize: "16px", fontWeight: "500", color: "#6b7280", cursor: "pointer", transition: "all 0.3s ease" },
  activeTab: { background: "#6b21a8", color: "white", fontWeight: "bold" },
  filterPanel: { background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", marginBottom: "25px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "15px", maxWidth: "1200px", margin: "0 auto 25px" },
  filterInput: { padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "16px", background: "#f9fafb" },
  filterSelect: { padding: "12px 12px", border: "2px solid #e5e7eb", borderRadius: "8px", background: "white", fontSize: "14px", cursor: "pointer" },
  cardContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", maxWidth: "1200px", margin: "0 auto" },
  card: { background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderLeft: "4px solid #6b21a8" },
  title: { color: "#4b0082", marginBottom: "15px", fontSize: "20px" },
  bidCount: { color: "#10b981", fontWeight: "bold", margin: "15px 0" },
  bidButton: { marginTop: "12px", padding: "14px", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", width: "100%" },
  bidForm: { marginTop: "15px", padding: "20px", background: "#f0f9ff", borderRadius: "12px", border: "2px solid #3b82f6" },
  input: { width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" },
  buttonGroup: { display: "flex", gap: "10px" },
  submitButton: { flex: 1, padding: "12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  cancelButton: { flex: 1, padding: "12px", background: "#6b7280", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
  bidsSection: { maxWidth: "1200px", margin: "0 auto" },
  bidsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" },
  bidCard: { background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderLeft: "4px solid #f59e0b" },
  bidHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  bidStatus: { padding: "6px 12px", borderRadius: "20px", color: "white", fontSize: "12px", fontWeight: "bold" },
  bidDetails: { marginBottom: "15px" },
  bidMessage: { background: "#f0f9ff", padding: "12px", borderRadius: "8px", fontSize: "14px", marginTop: "10px" },
  acceptedSection: { maxWidth: "1200px", margin: "0 auto" },
  sectionTitle: { color: "#6b21a8", marginBottom: "25px", fontSize: "24px" },
  noProjects: { textAlign: "center", color: "#555", fontSize: "18px", padding: "40px" },
  noBids: { textAlign: "center", color: "#555", fontSize: "18px", background: "#f0f9ff", padding: "40px", borderRadius: "12px", border: "2px dashed #3b82f6" },
  emptyState: { textAlign: "center", padding: "60px 20px", background: "#f8fafc", borderRadius: "12px", border: "2px dashed #cbd5e1", color: "#475569", maxWidth: "600px", margin: "0 auto" },
  progressContainer: { margin: "20px 0" },
  progressBar: { width: "100%", height: "12px", background: "#e5e7eb", borderRadius: "6px", overflow: "hidden", marginBottom: "8px" },
  progressFill: { height: "100%", borderRadius: "6px", transition: "width 0.5s ease" },
  progressSlider: { flex: 1, height: '8px', borderRadius: '4px', background: '#e5e7eb', outline: 'none', WebkitAppearance: 'none', cursor: 'pointer' },
  projectButtons: { display: "flex", gap: "10px", marginTop: "20px" },
  progressButton: { flex: 1, padding: "14px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
  messageButton: { flex: 1, padding: "14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
  
  // 🔥 NEW COMPLETE FILE MANAGEMENT STYLES
  fileUploadSection: {
    marginTop: '25px', 
    padding: '24px', 
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
    borderRadius: '16px', 
    border: '2px solid #bbf7d0'
  },
  fileSectionTitle: {
    color: '#059669', 
    margin: '0 0 20px 0', 
    fontSize: '18px', 
    fontWeight: '600'
  },
  uploadArea: { marginBottom: '20px' },
  hiddenFileInput: { display: 'none' },
  fileUploadLabel: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '18px 24px', 
    border: '3px dashed #10b981', 
    borderRadius: '16px', 
    background: 'white', 
    color: '#059669', 
    cursor: 'pointer', 
    fontWeight: '600', 
    fontSize: '16px', 
    transition: 'all 0.3s ease',
    textAlign: 'center',
    width: '100%',
    boxSizing: 'border-box'
  },
  'fileUploadLabel:hover': {
    background: '#ecfdf5',
    borderColor: '#059669',
    transform: 'translateY(-2px)'
  },
  uploadProgress: { 
    marginTop: '16px', 
    padding: '12px 16px', 
    background: 'white', 
    borderRadius: '10px', 
    border: '1px solid #d1d5db' 
  },
  progressBarSmall: { 
    height: '8px', 
    background: '#f3f4f6', 
    borderRadius: '4px', 
    overflow: 'hidden', 
    marginBottom: '6px' 
  },
  uploadButton: { 
    width: '100%', 
    padding: '16px', 
    background: '#10b981', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    fontSize: '16px',
    transition: 'all 0.3s ease'
  },
  'uploadButton:hover': {
    background: '#059669'
  },
  filesList: { 
    marginTop: '24px', 
    paddingTop: '20px', 
    borderTop: '2px solid #d1d5db' 
  },
  filesGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
    gap: '12px' 
  },
  fileItem: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '14px 16px', 
    background: 'white', 
    borderRadius: '10px', 
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s ease'
  },
  'fileItem:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderColor: '#10b981'
  },
  downloadButton: { 
    padding: '8px 12px', 
    background: '#3b82f6', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  'downloadButton:hover': {
    background: '#2563eb'
  }
};

export default FreelancerDashboard;
