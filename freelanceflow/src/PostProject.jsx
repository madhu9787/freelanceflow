
// import React, { useState, useContext, useEffect } from "react";
// import { AuthContext } from "./AuthContext";
// import io from "socket.io-client";
// import axios from "axios";
// import ChatModel from "./ChatModel";
// import { FaPlus, FaPaperPlane, FaEye, FaCheck, FaTimes, FaChartBar, FaBell, FaComments, FaClock, FaComment, FaDownload, FaFolderOpen, FaFileAlt, FaStar } from "react-icons/fa";
// import "./PostProject.css";

// const socket = io(`${import.meta.env.VITE_API_URL}");

// const messages = [
//   "✨ Post your project and hire top freelancers",
//   "✨ Share your project and get expert help",
//   "✨ Find the perfect freelancer for your project"
// ];

// const PostProject = () => {
//   const { user } = useContext(AuthContext);
//   const [typedText, setTypedText] = useState("");
//   const [project, setProject] = useState({
//     title: "", description: "", budget: "", duration: "",
//     skills: "", type: "", experience: "", category: "", clientType: ""
//   });
//   const [postedProjects, setPostedProjects] = useState([]);
//   const [showNewCard, setShowNewCard] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [selectedBids, setSelectedBids] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const [showChat, setShowChat] = useState(null);
//   const [showFiles, setShowFiles] = useState(null);
//   // 🔥 NEW RATING STATES
//   const [showRatingModal, setShowRatingModal] = useState(null);
//   const [tempRating, setTempRating] = useState(5);
//   const [tempReview, setTempReview] = useState("");

//   /* Typing effect */
//   useEffect(() => {
//     let i = 0, j = 0, t;
//     const type = () => {
//       if (j < messages[i].length) {
//         setTypedText(messages[i].slice(0, j + 1));
//         j++;
//         t = setTimeout(type, 100);
//       } else {
//         setTimeout(() => {
//          j = 0;
//          i = (i + 1) % messages.length;
//          type();
//         }, 2000);
//       }
//     };
//     type();
//     return () => clearTimeout(t);
//   }, []);

//   /* 🔥 SOCKET.IO SETUP */
//   useEffect(() => {
//     console.log("🔥 Client: Joining as 'client'...");
    
//     socket.emit("join", { role: "client" });
    
//     socket.on("projects", (projects) => {
//       console.log("📡 Socket projects:", projects.length);
//       setPostedProjects(projects);
//     });
    
//     socket.on("new-project", (project) => {
//       console.log("🆕 New project via socket:", project.title);
//       setPostedProjects(prev => [project, ...prev]);
//     });
    
//     socket.on("new-bid", (bid) => {
//       console.log("💰 New bid:", bid.freelancerName);
//       setNotifications(prev => [...prev.slice(-4), {
//         id: Date.now(),
//         message: `💰 New bid from ${bid.freelancerName}`
//       }]);
//     });

//     socket.on("project-progress", (updatedProject) => {
//       console.log("🔥 LIVE PROGRESS:", updatedProject.title, `${updatedProject.progress}%`);
//       setPostedProjects(prev => 
//         prev.map(p => p._id === updatedProject._id ? updatedProject : p)
//       );
//       setNotifications(prev => [
//         ...prev.slice(-4),
//         {
//          id: Date.now(),
//          message: `🎯 ${updatedProject.freelancerName || "Freelancer"} updated "${updatedProject.title}" to ${updatedProject.progress}%`
//         }
//       ]);
//     });

//     // 🔥 NEW: File upload notifications
//     socket.on("file-upload-complete", ({ projectId, fileName }) => {
//       setNotifications(prev => [
//         ...prev.slice(-4),
//         {
//           id: Date.now(),
//           message: `📁 New file uploaded to project: ${fileName}`
//         }
//       ]);
//     });

//     // 🔥 NEW: Rating notifications
//     socket.on("project-completed", (project) => {
//       setNotifications(prev => [
//         ...prev.slice(-4),
//         {
//           id: Date.now(),
//           message: `✅ "${project.title}" marked complete! Please rate.`
//         }
//       ]);
//     });

//     return () => {
//       socket.off("projects");
//       socket.off("new-project");
//       socket.off("new-bid");
//       socket.off("project-progress");
//       socket.off("file-upload-complete");
//       socket.off("project-completed");
//     };
//   }, []);

//   /* 🔥 DATABASE REFRESH */
//   useEffect(() => {
//     console.log("🔄 Starting 5s refresh...");
    
//     const fetchPostedProjects = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects");
//         console.log("📊 DB projects:", res.data.length);
//         setPostedProjects(res.data);
//       } catch (error) {
//         console.error("❌ API Error:", error.message);
//       }
//     };

//     fetchPostedProjects();
//     const interval = setInterval(fetchPostedProjects, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   // 🔥 NEW RATING FUNCTIONS
//   const markComplete = async (projectId) => {
//     try {
//       await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/complete", { projectId });
//       alert("✅ Project marked complete! Please rate the freelancer.");
//     } catch (error) {
//       alert("Error marking complete");
//     }
//   };

//   const openRatingModal = (projectId) => {
//     setShowRatingModal(projectId);
//     setTempRating(5);
//     setTempReview("");
//   };

//   const submitRating = async () => {
//     try {
//       await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/rate", {
//         projectId: showRatingModal,
//         rating: tempRating,
//         review: tempReview
//       });
      
//       setShowRatingModal(null);
//       setTempRating(5);
//       setTempReview("");
//       alert("⭐ Thank you for your review!");
//     } catch (error) {
//       alert("Error submitting review");
//     }
//   };

//   const fetchBids = async (projectId) => {
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bids/project/${projectId}`);
//       setSelectedBids({ projectId, bids: res.data });
//     } catch (error) {
//       console.error("Error fetching bids:", error);
//       setSelectedBids({ 
//         projectId, 
//         bids: [{
//           _id: "demo1",
//           freelancerName: "John Doe",
//           amount: 6000,
//           deadline: "2025-12-29",
//           message: "I will deliver high quality work!"
//         }]
//       });
//     }
//   };

//   const acceptBid = async (bidId) => {
//     try {
//       alert("✅ Freelancer hired! Project assigned.");
//       setSelectedBids(null);
//     } catch (error) {
//       alert("✅ Demo: Freelancer hired!");
//       setSelectedBids(null);
//     }
//   };

//   // 🔥 NEW: Download file function
//   const downloadFile = (fileUrl, fileName) => {
//     const link = document.createElement('a');
//     link.href = `${import.meta.env.VITE_API_URL}${fileUrl}`;
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleChange = e => setProject({ ...project, [e.target.name]: e.target.value });

//   const handleSubmit = async e => {
//     e.preventDefault();
//     if (!project.title || !project.description || !project.budget) {
//       return alert("Fill required fields");
//     }

//     if (editId) {
//       setPostedProjects(prev => prev.map(p => (p._id === editId ? { ...p, ...project } : p)));
//       setEditId(null);
//       alert("Project updated!");
//     } else {
//       const newProject = {
//         title: project.title,
//         description: project.description,
//         budget: project.budget,
//         duration: project.duration || "Not specified",
//         skills: project.skills,
//         clientName: user?.name || "Client",
//         status: "open",
//         bidsCount: 0,
//         progress: 0,
//         chatEnabled: true,
//         files: [],
//         messagesCount: 0
//       };
      
//       console.log("📤 Posting project:", newProject.title);
//       socket.emit("post-project", newProject);
//     }

//     setProject({
//       title: "", description: "", budget: "", duration: "",
//       skills: "", type: "", experience: "", category: "", clientType: ""
//     });
//     setShowNewCard(false);
//   };

//   const handleEdit = p => {
//     setProject(p);
//     setEditId(p._id);
//     setShowNewCard(true);
//   };

//   const handleDelete = id => {
//     if (!window.confirm("Delete this project?")) return;
//     socket.emit("delete-project", id);
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'accepted': return '#10b981';
//       case 'in-progress': return '#f59e0b';
//       case 'completed': return '#059669';
//       case 'reviewed': return '#8b5cf6';
//       default: return '#6b7280';
//     }
//   };

//   const openChat = (projectId) => {
//     console.log("💬 Opening chat for project:", projectId);
//     socket.emit("join-chat", { projectId, senderName: user?.name || "Client" });
//     setShowChat(projectId);
//   };

//   // 🔥 NEW: Toggle file viewer
//   const toggleFiles = (projectId) => {
//     setShowFiles(showFiles === projectId ? null : projectId);
//   };

//   return (
//     <div className="dashboard-container">
//       <h1 className="animated-header">
//         {typedText}<span className="cursor">|</span>
//       </h1>

//       <div className="stats-grid">
//         <div className="stat-card">
//           <FaChartBar /> {postedProjects.length}<br/>
//           <small>Total Projects</small>
//         </div>
//         <div className="stat-card">
//           <FaEye /> {postedProjects.reduce((sum, p) => sum + (p.bidsCount || 0), 0)}<br/>
//           <small>Total Bids</small>
//         </div>
//       </div>

//       {notifications.length > 0 && (
//         <div className="notification-bell" style={{background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white'}}>
//           <FaBell /> {notifications.length} Updates
//           <button 
//             onClick={() => setNotifications([])}
//             style={{marginLeft: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}
//           >
//             ×
//           </button>
//         </div>
//       )}

//       <button
//         className="btn new-project-btn"
//         onClick={() => {
//           setShowNewCard(true);
//           setEditId(null);
//           setProject({
//             title: "", description: "", budget: "", duration: "",
//             skills: "", type: "", experience: "", category: "", clientType: ""
//           });
//         }}
//       >
//         <FaPlus /> New Project
//       </button>

//       <div className="projects-grid">
//         {showNewCard && (
//           <div className="project-card new-card">
//             <h3>{editId ? "Edit Project" : "New Project"}</h3>
//             <form className="project-form" onSubmit={handleSubmit}>
//               {Object.keys(project).map((f, i) => (
//                 <div className="form-group" key={i}>
//                   {f === "description" ? (
//                     <textarea
//                       name={f}
//                       value={project[f]}
//                       onChange={handleChange}
//                       required={["title", "description", "budget"].includes(f)}
//                     />
//                   ) : (
//                     <input
//                       type={f === "budget" ? "number" : "text"}
//                       name={f}
//                       value={project[f]}
//                       onChange={handleChange}
//                       required={["title", "description", "budget"].includes(f)}
//                     />
//                   )}
//                   <label>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
//                 </div>
//               ))}
//               <button type="submit" className="btn post-btn">
//                 <FaPaperPlane /> {editId ? "Update" : "Post"} Project
//               </button>
//             </form>
//           </div>
//         )}

//         {postedProjects.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
//             <h3>📭 No projects yet</h3>
//             <p>Click "New Project" to get started!</p>
//           </div>
//         ) : (
//           postedProjects.map(p => {
//             const progress = p.progress || 0;
//             const messagesCount = p.messagesCount || 0;
//             const deadline = p.deadline ? new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "N/A";
//             const hiredFreelancer = p.freelancerName || p.hiredFreelancer || "Open";

//             return (
//               <div 
//                 key={p._id} 
//                 className={`project-card ${p.status === 'accepted' ? 'accepted' : p.status === 'completed' ? 'completed' : 'open'}`}
//               >
//                 <div className="project-header">
//                   <h3>{p.title}</h3>
//                   <div className="enhanced-info">
//                     <span>💰 ₹{p.budget}</span>
//                     <span style={{color: progress >= 100 ? '#059669' : progress >= 50 ? '#f59e0b' : '#10b981'}}>
//                       📊 {progress}%
//                     </span>
//                     <span><FaComments /> {messagesCount}</span>
//                     <span><FaClock /> {deadline}</span>
//                   </div>
//                 </div>

//                 <div className="project-details">
//                   <p><strong>👨‍💼 Freelancer:</strong> <span style={{color: getStatusColor(p.status)}}>{hiredFreelancer}</span></p>
//                   <p><strong>Chat:</strong> ✅ Enabled</p>
//                   <p><strong>Description:</strong> {p.description}</p>
//                   <p><strong>Duration:</strong> {p.duration || "N/A"}</p>
//                   <p><strong>Skills:</strong> {p.skills || "N/A"}</p>

//                   <div className="progress-container">
//                     <div className="progress-bar">
//                       <div 
//                         className="progress-fill" 
//                         style={{ 
//                           width: `${progress}%`, 
//                           background: progress >= 100 ? '#059669' : progress >= 75 ? '#10b981' : progress >= 50 ? '#f59e0b' : '#3b82f6'
//                         }}
//                       />
//                     </div>
//                     <small style={{fontWeight: 'bold', color: progress > 0 ? '#10b981' : '#6b7280'}}>
//                       {progress}% Complete {progress > 0 && '(Live from Database)'}
//                     </small>
//                   </div>

//                   {/* 🔥 NEW: FILES SECTION */}
//                   {p.files && p.files.length > 0 && (
//                     <div className="files-section">
//                       <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
//                         <h4 style={{margin: 0, color: '#059669'}}>
//                           <FaFolderOpen style={{marginRight: '8px'}} /> 
//                           Files ({p.files.length})
//                         </h4>
//                         <button 
//                           className="btn" 
//                           style={{padding: '8px 16px', fontSize: '14px'}}
//                           onClick={() => toggleFiles(p._id)}
//                         >
//                           {showFiles === p._id ? 'Hide' : 'View'} Files
//                         </button>
//                       </div>
                      
//                       {showFiles === p._id && (
//                         <div className="files-grid">
//                           {p.files.map((file, index) => (
//                             <div key={index} className="file-item">
//                               <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
//                                 <FaFileAlt style={{color: '#3b82f6'}} />
//                                 <div>
//                                   <div style={{fontWeight: '500'}}>{file.name}</div>
//                                   <small style={{color: '#6b7280'}}>
//                                     {Math.round(file.size / 1024)} KB • {file.uploadedBy}
//                                   </small>
//                                 </div>
//                               </div>
//                               <button 
//                                 className="btn download-btn"
//                                 onClick={() => downloadFile(file.url, file.name)}
//                                 title="Download"
//                               >
//                                 <FaDownload />
//                               </button>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   <p className="bid-count">
//                     📊 Bids: {p.bidsCount || 0} | 
//                     <span className="status-badge" style={{backgroundColor: getStatusColor(p.status)}}>
//                       {p.status || 'open'}
//                     </span>
//                   </p>
//                 </div>

//                 {/* 🔥 UPDATED: CARD BUTTONS WITH RATING */}
//                 <div className="card-buttons">
//                   {p.bidsCount > 0 && (
//                     <button 
//                       className="btn view-bids-btn"
//                       onClick={() => fetchBids(p._id)}
//                     >
//                       <FaEye /> View Bids ({p.bidsCount})
//                     </button>
//                   )}
                  
//                   <button 
//                     className="btn chat-btn active"
//                     onClick={() => openChat(p._id)}
//                   >
//                     <FaComment /> Chat
//                   </button>

//                   {/* 🔥 NEW: COMPLETE & RATING BUTTONS */}
//                   {p.status === 'accepted' && p.progress >= 100 && !p.rating && (
//                     <button 
//                       className="btn complete-btn"
//                       onClick={() => markComplete(p._id)}
//                     >
//                       ✅ Mark Complete
//                     </button>
//                   )}
                  
//                   {p.status === 'completed' && !p.rating && (
//                     <button 
//                       className="btn rate-btn"
//                       onClick={() => openRatingModal(p._id)}
//                     >
//                       ⭐ Rate & Review
//                     </button>
//                   )}
                  
//                   {p.rating && (
//                     <span className="rating-display">
//                       <FaStar style={{color: '#fbbf24', marginRight: '4px'}} /> 
//                       {p.rating}/5
//                     </span>
//                   )}

//                   <button 
//                     className="btn edit-btn"
//                     onClick={() => handleEdit(p)}
//                   >
//                     Edit
//                   </button>
//                   <button 
//                     className="btn delete-btn"
//                     onClick={() => handleDelete(p._id)}
//                   >
//                     Delete
//                   </button>
//                 </div>

//                 {selectedBids && selectedBids.projectId === p._id && (
//                   <div className="bids-modal">
//                     <div className="bids-overlay" onClick={() => setSelectedBids(null)}></div>
//                     <div className="bids-content">
//                       <h4>💰 Bids for "{p.title}"</h4>
//                       {selectedBids.bids.map(bid => (
//                         <div key={bid._id} className="bid-item">
//                           <div className="bid-info">
//                             <strong>{bid.freelancerName}</strong><br/>
//                             💰 ₹{bid.amount} | ⏰ {new Date(bid.deadline).toLocaleDateString()}<br/>
//                             <small>{bid.message}</small>
//                           </div>
//                           <div className="bid-actions">
//                             <button 
//                               className="btn accept-btn"
//                               onClick={() => acceptBid(bid._id)}
//                             >
//                               <FaCheck /> Hire
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                       <button 
//                         className="btn close-btn"
//                         onClick={() => setSelectedBids(null)}
//                       >
//                         Close
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })
//         )}
//       </div>

//       {showChat && (
//         <ChatModel
//           projectId={showChat}
//           projectTitle={postedProjects.find(p => p._id === showChat)?.title}
//           clientName={user?.name || "Client"}
//           freelancerName={postedProjects.find(p => p._id === showChat)?.freelancerName}
//           isOpen={!!showChat}
//           onClose={() => setShowChat(null)}
//           userRole="client"
//           userName={user?.name || "Client"}
//         />
//       )}

//       {/* 🔥 NEW: RATING MODAL */}
//       {showRatingModal && (
//         <div className="modal-overlay" onClick={() => setShowRatingModal(null)}>
//           <div className="modal-content" onClick={e => e.stopPropagation()}>
//             <h3>⭐ Rate Your Freelancer</h3>
            
//             <div className="rating-stars">
//               {[5,4,3,2,1].map((star) => (
//                 <span
//                   key={star}
//                   className={`star ${tempRating >= star ? 'active' : ''}`}
//                   onClick={() => setTempRating(star)}
//                 >
//                   ⭐
//                 </span>
//               ))}
//               <span style={{marginLeft: '12px', color: '#6b7280'}}>{tempRating}/5</span>
//             </div>
            
//             <textarea
//               value={tempReview}
//               onChange={(e) => setTempReview(e.target.value)}
//               placeholder="Write your review (optional)..."
//               rows={4}
//               maxLength={500}
//               style={{width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginTop: '16px'}}
//             />
            
//             <div className="modal-buttons">
//               <button 
//                 className="btn cancel-btn" 
//                 onClick={() => setShowRatingModal(null)}
//                 style={{background: '#6b7280', color: 'white'}}
//               >
//                 Cancel
//               </button>
//               <button 
//                 className="btn submit-review-btn"
//                 onClick={submitRating}
//               >
//                 Submit Review
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PostProject;



import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import io from "socket.io-client";
import axios from "axios";
import ChatModel from "./ChatModel";
import { FaPlus, FaPaperPlane, FaEye, FaCheck, FaTimes, FaChartBar, FaBell, FaComments, FaClock, FaComment, FaDownload, FaFolderOpen, FaFileAlt, FaStar, FaCreditCard } from "react-icons/fa";
import "./PostProject.css";

const socket = io(`${import.meta.env.VITE_API_URL}`);

const messages = [
  "✨ Post your project and hire top freelancers",
  "✨ Share your project and get expert help",
  "✨ Find the perfect freelancer for your project"
];

const PostProject = () => {
  const { user } = useContext(AuthContext);
  const [typedText, setTypedText] = useState("");
  const [project, setProject] = useState({
    title: "", description: "", budget: "", duration: "",
    skills: "", type: "", experience: "", category: "", clientType: ""
  });
  const [postedProjects, setPostedProjects] = useState([]);
  const [showNewCard, setShowNewCard] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedBids, setSelectedBids] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showChat, setShowChat] = useState(null);
  const [showFiles, setShowFiles] = useState(null);
  // 🔥 NEW RATING STATES
  const [showRatingModal, setShowRatingModal] = useState(null);
  const [tempRating, setTempRating] = useState(5);
  const [tempReview, setTempReview] = useState("");
  // 🔥 NEW PAYMENT STATE
  const [paymentLoading, setPaymentLoading] = useState(null);

  /* Typing effect */
  useEffect(() => {
    let i = 0, j = 0, t;
    const type = () => {
      if (j < messages[i].length) {
        setTypedText(messages[i].slice(0, j + 1));
        j++;
        t = setTimeout(type, 100);
      } else {
        setTimeout(() => {
         j = 0;
         i = (i + 1) % messages.length;
         type();
        }, 2000);
      }
    };
    type();
    return () => clearTimeout(t);
  }, []);

  /* 🔥 SOCKET.IO SETUP */
  useEffect(() => {
    console.log("🔥 Client: Joining as 'client'...");
    
    socket.emit("join", { role: "client" });
    
    socket.on("projects", (projects) => {
      console.log("📡 Socket projects:", projects.length);
      setPostedProjects(projects);
    });
    
    socket.on("new-project", (project) => {
      console.log("🆕 New project via socket:", project.title);
      setPostedProjects(prev => [project, ...prev]);
    });
    
    socket.on("new-bid", (bid) => {
      console.log("💰 New bid:", bid.freelancerName);
      setNotifications(prev => [...prev.slice(-4), {
        id: Date.now(),
        message: `💰 New bid from ${bid.freelancerName}`
      }]);
    });

    socket.on("project-progress", (updatedProject) => {
      console.log("🔥 LIVE PROGRESS:", updatedProject.title, `${updatedProject.progress}%`);
      setPostedProjects(prev => 
        prev.map(p => p._id === updatedProject._id ? updatedProject : p)
      );
      setNotifications(prev => [
        ...prev.slice(-4),
        {
         id: Date.now(),
         message: `🎯 ${updatedProject.freelancerName || "Freelancer"} updated "${updatedProject.title}" to ${updatedProject.progress}%`
        }
      ]);
    });

    // 🔥 NEW: File upload notifications
    socket.on("file-upload-complete", ({ projectId, fileName }) => {
      setNotifications(prev => [
        ...prev.slice(-4),
        {
          id: Date.now(),
          message: `📁 New file uploaded to project: ${fileName}`
        }
      ]);
    });

    // 🔥 NEW: Payment notifications
    socket.on("project-funded", (project) => {
      setNotifications(prev => [
        ...prev.slice(-4),
        {
          id: Date.now(),
          message: `💳 "${project.title}" funded! Funds in escrow (₹${project.escrowAmount})`
        }
      ]);
      setPostedProjects(prev => 
        prev.map(p => p._id === project._id ? project : p)
      );
    });

    // 🔥 NEW: Rating notifications
    socket.on("project-completed", (project) => {
      setNotifications(prev => [
        ...prev.slice(-4),
        {
          id: Date.now(),
          message: `✅ "${project.title}" marked complete! Please rate.`
        }
      ]);
    });

    return () => {
      socket.off("projects");
      socket.off("new-project");
      socket.off("new-bid");
      socket.off("project-progress");
      socket.off("file-upload-complete");
      socket.off("project-funded");
      socket.off("project-completed");
    };
  }, []);

  /* 🔥 DATABASE REFRESH */
  useEffect(() => {
    console.log("🔄 Starting 5s refresh...");
    
    const fetchPostedProjects = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`);
        console.log("📊 DB projects:", res.data.length);
        setPostedProjects(res.data);
      } catch (error) {
        console.error("❌ API Error:", error.message);
      }
    };

    fetchPostedProjects();
    const interval = setInterval(fetchPostedProjects, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 NEW PAYMENT FUNCTION
  const handlePayment = async (project) => {
    if (paymentLoading === project._id) return;
    
    setPaymentLoading(project._id);
    
    try {
      console.log(`💳 Paying project: ${project.title}`);
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/payments/pay-project`, {
        projectId: project._id,
        amount: project.budget,
        freelancerId: project.freelancerId || "tempFreelancer"
      });
      
      alert(`✅ ${response.data.message}\n💰 Funds locked: ₹${project.budget}`);
      setPaymentLoading(null);
      
    } catch (error) {
      console.error("❌ Payment failed:", error);
      alert("❌ Payment failed. Please try again.");
      setPaymentLoading(null);
    }
  };

  // 🔥 NEW RATING FUNCTIONS
  const markComplete = async (projectId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/complete`, { projectId });
      alert("✅ Project marked complete! Please rate the freelancer.");
    } catch (error) {
      alert("Error marking complete");
    }
  };

  const openRatingModal = (projectId) => {
    setShowRatingModal(projectId);
    setTempRating(5);
    setTempReview("");
  };

  const submitRating = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/rate`, {
        projectId: showRatingModal,
        rating: tempRating,
        review: tempReview
      });
      
      setShowRatingModal(null);
      setTempRating(5);
      setTempReview("");
      alert("⭐ Thank you for your review!");
    } catch (error) {
      alert("Error submitting review");
    }
  };

  const fetchBids = async (projectId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bids/project/${projectId}`);
      setSelectedBids({ projectId, bids: res.data });
    } catch (error) {
      console.error("Error fetching bids:", error);
      setSelectedBids({ 
        projectId, 
        bids: [{
          _id: "demo1",
          freelancerName: "John Doe",
          amount: 6000,
          deadline: "2025-12-29",
          message: "I will deliver high quality work!"
        }]
      });
    }
  };

  const acceptBid = async (bidId) => {
    try {
      alert("✅ Freelancer hired! Project assigned.");
      setSelectedBids(null);
    } catch (error) {
      alert("✅ Demo: Freelancer hired!");
      setSelectedBids(null);
    }
  };

  // 🔥 NEW: Download file function
  const downloadFile = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = `${import.meta.env.VITE_API_URL}${fileUrl}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChange = e => setProject({ ...project, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!project.title || !project.description || !project.budget) {
      return alert("Fill required fields");
    }

    if (editId) {
      setPostedProjects(prev => prev.map(p => (p._id === editId ? { ...p, ...project } : p)));
      setEditId(null);
      alert("Project updated!");
    } else {
      const newProject = {
        title: project.title,
        description: project.description,
        budget: project.budget,
        duration: project.duration || "Not specified",
        skills: project.skills,
        clientName: user?.name || "Client",
        status: "open",
        bidsCount: 0,
        progress: 0,
        chatEnabled: true,
        files: [],
        messagesCount: 0
      };
      
      console.log("📤 Posting project:", newProject.title);
      socket.emit("post-project", newProject);
    }

    setProject({
      title: "", description: "", budget: "", duration: "",
      skills: "", type: "", experience: "", category: "", clientType: ""
    });
    setShowNewCard(false);
  };

  const handleEdit = p => {
    setProject(p);
    setEditId(p._id);
    setShowNewCard(true);
  };

  const handleDelete = id => {
    if (!window.confirm("Delete this project?")) return;
    socket.emit("delete-project", id);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'completed': return '#059669';
      case 'reviewed': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const openChat = (projectId) => {
    console.log("💬 Opening chat for project:", projectId);
    socket.emit("join-chat", { projectId, senderName: user?.name || "Client" });
    setShowChat(projectId);
  };

  // 🔥 NEW: Toggle file viewer
  const toggleFiles = (projectId) => {
    setShowFiles(showFiles === projectId ? null : projectId);
  };

  return (
    <div className="dashboard-container">
      <h1 className="animated-header">
        {typedText}<span className="cursor">|</span>
      </h1>

      <div className="stats-grid">
        <div className="stat-card">
          <FaChartBar /> {postedProjects.length}<br/>
          <small>Total Projects</small>
        </div>
        <div className="stat-card">
          <FaEye /> {postedProjects.reduce((sum, p) => sum + (p.bidsCount || 0), 0)}<br/>
          <small>Total Bids</small>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="notification-bell" style={{background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white'}}>
          <FaBell /> {notifications.length} Updates
          <button 
            onClick={() => setNotifications([])}
            style={{marginLeft: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}
          >
            ×
          </button>
        </div>
      )}

      <button
        className="btn new-project-btn"
        onClick={() => {
          setShowNewCard(true);
          setEditId(null);
          setProject({
            title: "", description: "", budget: "", duration: "",
            skills: "", type: "", experience: "", category: "", clientType: ""
          });
        }}
      >
        <FaPlus /> New Project
      </button>

      <div className="projects-grid">
        {showNewCard && (
          <div className="project-card new-card">
            <h3>{editId ? "Edit Project" : "New Project"}</h3>
            <form className="project-form" onSubmit={handleSubmit}>
              {Object.keys(project).map((f, i) => (
                <div className="form-group" key={i}>
                  {f === "description" ? (
                    <textarea
                      name={f}
                      value={project[f]}
                      onChange={handleChange}
                      required={["title", "description", "budget"].includes(f)}
                    />
                  ) : (
                    <input
                      type={f === "budget" ? "number" : "text"}
                      name={f}
                      value={project[f]}
                      onChange={handleChange}
                      required={["title", "description", "budget"].includes(f)}
                    />
                  )}
                  <label>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                </div>
              ))}
              <button type="submit" className="btn post-btn">
                <FaPaperPlane /> {editId ? "Update" : "Post"} Project
              </button>
            </form>
          </div>
        )}

        {postedProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <h3>📭 No projects yet</h3>
            <p>Click "New Project" to get started!</p>
          </div>
        ) : (
          postedProjects.map(p => {
            const progress = p.progress || 0;
            const messagesCount = p.messagesCount || 0;
            const deadline = p.deadline ? new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "N/A";
            const hiredFreelancer = p.freelancerName || p.hiredFreelancer || "Open";
            // 🔥 PAYMENT BUTTON CONDITION
            const canPay = p.status === 'accepted' && 
                          progress === 100 && 
                          p.files && p.files.length > 0 && 
                          p.paymentStatus !== 'funded';

            return (
              <div 
                key={p._id} 
                className={`project-card ${p.status === 'accepted' ? 'accepted' : p.status === 'completed' ? 'completed' : 'open'}`}
              >
                <div className="project-header">
                  <h3>{p.title}</h3>
                  <div className="enhanced-info">
                    <span>💰 ₹{p.budget}</span>
                    <span style={{color: progress >= 100 ? '#059669' : progress >= 50 ? '#f59e0b' : '#10b981'}}>
                      📊 {progress}%
                    </span>
                    <span><FaComments /> {messagesCount}</span>
                    <span><FaClock /> {deadline}</span>
                  </div>
                </div>

                <div className="project-details">
                  <p><strong>👨‍💼 Freelancer:</strong> <span style={{color: getStatusColor(p.status)}}>{hiredFreelancer}</span></p>
                  <p><strong>Chat:</strong> ✅ Enabled</p>
                  <p><strong>Description:</strong> {p.description}</p>
                  <p><strong>Duration:</strong> {p.duration || "N/A"}</p>
                  <p><strong>Skills:</strong> {p.skills || "N/A"}</p>

                  {/* 🔥 PAYMENT STATUS DISPLAY */}
                  {p.paymentStatus === 'funded' && (
                    <div style={{background: '#dcfce7', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #10b981', margin: '12px 0'}}>
                      <strong>💳 FUNDED</strong> | Escrow: ₹{p.escrowAmount} | 
                      Payout ready: ₹{p.freelancerPayout || (p.budget * 0.9)}
                    </div>
                  )}

                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${progress}%`, 
                          background: progress >= 100 ? '#059669' : progress >= 75 ? '#10b981' : progress >= 50 ? '#f59e0b' : '#3b82f6'
                        }}
                      />
                    </div>
                    <small style={{fontWeight: 'bold', color: progress > 0 ? '#10b981' : '#6b7280'}}>
                      {progress}% Complete {progress > 0 && '(Live from Database)'}
                    </small>
                  </div>

                  {/* 🔥 NEW: FILES SECTION */}
                  {p.files && p.files.length > 0 && (
                    <div className="files-section">
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                        <h4 style={{margin: 0, color: '#059669'}}>
                          <FaFolderOpen style={{marginRight: '8px'}} /> 
                          Files ({p.files.length})
                        </h4>
                        <button 
                          className="btn" 
                          style={{padding: '8px 16px', fontSize: '14px'}}
                          onClick={() => toggleFiles(p._id)}
                        >
                          {showFiles === p._id ? 'Hide' : 'View'} Files
                        </button>
                      </div>
                      
                      {showFiles === p._id && (
                        <div className="files-grid">
                          {p.files.map((file, index) => (
                            <div key={index} className="file-item">
                              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <FaFileAlt style={{color: '#3b82f6'}} />
                                <div>
                                  <div style={{fontWeight: '500'}}>{file.name}</div>
                                  <small style={{color: '#6b7280'}}>
                                    {Math.round(file.size / 1024)} KB • {file.uploadedBy}
                                  </small>
                                </div>
                              </div>
                              <button 
                                className="btn download-btn"
                                onClick={() => downloadFile(file.url, file.name)}
                                title="Download"
                              >
                                <FaDownload />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="bid-count">
                    📊 Bids: {p.bidsCount || 0} | 
                    <span className="status-badge" style={{backgroundColor: getStatusColor(p.status)}}>
                      {p.status || 'open'}
                    </span>
                  </p>
                </div>

                {/* 🔥 UPDATED: CARD BUTTONS WITH PAYMENT + RATING */}
                <div className="card-buttons">
                  {p.bidsCount > 0 && (
                    <button 
                      className="btn view-bids-btn"
                      onClick={() => fetchBids(p._id)}
                    >
                      <FaEye /> View Bids ({p.bidsCount})
                    </button>
                  )}
                  
                  <button 
                    className="btn chat-btn active"
                    onClick={() => openChat(p._id)}
                  >
                    <FaComment /> Chat
                  </button>

                  {/* 🔥 NEW: PAYMENT BUTTON - 100% + FILES ONLY */}
                  {canPay && (
                    <button 
                      className="btn pay-btn"
                      onClick={() => handlePayment(p)}
                      disabled={paymentLoading === p._id}
                      style={{
                        background: paymentLoading === p._id ? '#9ca3af' : '#7c3aed',
                        color: 'white'
                      }}
                    >
                      {paymentLoading === p._id ? '⏳ Paying...' : <><FaCreditCard /> PAY ₹{p.budget} NOW</>}
                    </button>
                  )}

                  {/* 🔥 NEW: COMPLETE & RATING BUTTONS */}
                  {p.status === 'accepted' && p.progress >= 100 && !p.rating && (
                    <button 
                      className="btn complete-btn"
                      onClick={() => markComplete(p._id)}
                    >
                      ✅ Mark Complete
                    </button>
                  )}
                  
                  {p.status === 'completed' && !p.rating && (
                    <button 
                      className="btn rate-btn"
                      onClick={() => openRatingModal(p._id)}
                    >
                      ⭐ Rate & Review
                    </button>
                  )}
                  
                  {p.rating && (
                    <span className="rating-display">
                      <FaStar style={{color: '#fbbf24', marginRight: '4px'}} /> 
                      {p.rating}/5
                    </span>
                  )}

                  <button 
                    className="btn edit-btn"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn delete-btn"
                    onClick={() => handleDelete(p._id)}
                  >
                    Delete
                  </button>
                </div>

                {selectedBids && selectedBids.projectId === p._id && (
                  <div className="bids-modal">
                    <div className="bids-overlay" onClick={() => setSelectedBids(null)}></div>
                    <div className="bids-content">
                      <h4>💰 Bids for "{p.title}"</h4>
                      {selectedBids.bids.map(bid => (
                        <div key={bid._id} className="bid-item">
                          <div className="bid-info">
                            <strong>{bid.freelancerName}</strong><br/>
                            💰 ₹{bid.amount} | ⏰ {new Date(bid.deadline).toLocaleDateString()}<br/>
                            <small>{bid.message}</small>
                          </div>
                          <div className="bid-actions">
                            <button 
                              className="btn accept-btn"
                              onClick={() => acceptBid(bid._id)}
                            >
                              <FaCheck /> Hire
                            </button>
                          </div>
                        </div>
                      ))}
                      <button 
                        className="btn close-btn"
                        onClick={() => setSelectedBids(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showChat && (
        <ChatModel
          projectId={showChat}
          projectTitle={postedProjects.find(p => p._id === showChat)?.title}
          clientName={user?.name || "Client"}
          freelancerName={postedProjects.find(p => p._id === showChat)?.freelancerName}
          isOpen={!!showChat}
          onClose={() => setShowChat(null)}
          userRole="client"
          userName={user?.name || "Client"}
        />
      )}

      {/* 🔥 NEW: RATING MODAL */}
      {showRatingModal && (
        <div className="modal-overlay" onClick={() => setShowRatingModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>⭐ Rate Your Freelancer</h3>
            
            <div className="rating-stars">
              {[5,4,3,2,1].map((star) => (
                <span
                  key={star}
                  className={`star ${tempRating >= star ? 'active' : ''}`}
                  onClick={() => setTempRating(star)}
                >
                  ⭐
                </span>
              ))}
              <span style={{marginLeft: '12px', color: '#6b7280'}}>{tempRating}/5</span>
            </div>
            
            <textarea
              value={tempReview}
              onChange={(e) => setTempReview(e.target.value)}
              placeholder="Write your review (optional)..."
              rows={4}
              maxLength={500}
              style={{width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginTop: '16px'}}
            />
            
            <div className="modal-buttons">
              <button 
                className="btn cancel-btn" 
                onClick={() => setShowRatingModal(null)}
                style={{background: '#6b7280', color: 'white'}}
              >
                Cancel
              </button>
              <button 
                className="btn submit-review-btn"
                onClick={submitRating}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostProject;
