// import React, { useState, useEffect, useRef } from "react";
// import io from "socket.io-client";
// import axios from "axios";
// import { FaPaperPlane, FaTimes } from "react-icons/fa";
// import "./ChatModel.css";

// const socket = io("${import.meta.env.VITE_API_URL}");

// const ChatModel = ({ 
//   projectId, 
//   projectTitle, 
//   clientName, 
//   freelancerName, 
//   isOpen, 
//   onClose,
//   userRole = "client",
//   userName 
// }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const messagesEndRef = useRef(null);
//   const currentUserName = userName || clientName || "Client";

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     if (!isOpen || !projectId) return;

//     // Join chat room
//     socket.emit("join-chat", { 
//       projectId, 
//       senderName: currentUserName 
//     });

//     // Load existing messages
//     const fetchMessages = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/project/${projectId}`);
//         setMessages(res.data);
//       } catch (error) {
//         console.error("Chat load error:", error);
//       }
//     };

//     fetchMessages();
//     scrollToBottom();

//     // Listen for new messages
//     socket.on("new-chat-message", (message) => {
//       setMessages(prev => [...prev, message]);
//       scrollToBottom();
//     });

//     return () => {
//       socket.off("new-chat-message");
//     };
//   }, [isOpen, projectId, currentUserName]);

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (!newMessage.trim()) return;

//     socket.emit("chat-message", {
//       projectId,
//       message: newMessage.trim(),
//       senderName: currentUserName
//     });
    
//     setNewMessage("");
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="chat-modal-overlay" onClick={onClose}>
//       <div className="chat-modal" onClick={e => e.stopPropagation()}>
//         <div className="chat-header">
//           <div>
//             <h3>💬 {projectTitle}</h3>
//             <span className="chat-participants">
//               {clientName} ↔ {freelancerName || "Freelancer"}
//             </span>
//           </div>
//           <button className="chat-close-btn" onClick={onClose}>
//             <FaTimes />
//           </button>
//         </div>

//         <div className="chat-messages">
//           {messages.length === 0 ? (
//             <div className="no-messages">
//               💭 Say hello to start chatting!
//             </div>
//           ) : (
//             messages.map((msg) => (
//               <div 
//                 key={msg._id || msg.timestamp} 
//                 className={`chat-message ${msg.senderName === currentUserName ? 'sent' : 'received'}`}
//               >
//                 <div className="message-bubble">
//                   <strong>{msg.senderName}</strong>
//                   <p>{msg.message}</p>
//                   <span className="message-time">
//                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
//                   </span>
//                 </div>
//               </div>
//             ))
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         <form className="chat-input-form" onSubmit={sendMessage}>
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder={`Message ${freelancerName || "freelancer"}...`}
//             className="chat-input"
//           />
//           <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
//             <FaPaperPlane />
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ChatModel;
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import "./ChatModel.css";

const socket = io("${import.meta.env.VITE_API_URL}");

const ChatModel = ({ 
  projectId, 
  projectTitle, 
  clientName, 
  freelancerName, 
  isOpen, 
  onClose,
  userRole = "client",
  userName 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const currentUserName = userName || clientName || "Client";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* 🔥 FIXED: SINGLE CLEAN useEffect - NO DUPLICATES */
  useEffect(() => {
    if (!isOpen || !projectId) return;

    console.log("💬 Joining chat:", projectId, "as", currentUserName);
    
    // 1. Join chat room
    socket.emit("join-chat", { 
      projectId, 
      senderName: currentUserName 
    });

    // 2. Listen for chat HISTORY (server sends automatically)
    const handleChatHistory = (history) => {
      console.log("📜 Chat history loaded:", history.length, "messages");
      setMessages(history);
      scrollToBottom();
    };

    // 3. Listen for NEW messages
    const handleNewMessage = (message) => {
      console.log("💬 New message:", message.message);
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    // 4. Listen for errors
    const handleChatError = (error) => {
      console.error("💥 Chat error:", error.message);
    };

    socket.on("chat-history", handleChatHistory);
    socket.on("new-chat-message", handleNewMessage);
    socket.on("chat-error", handleChatError);

    // 5. Cleanup
    return () => {
      console.log("💬 Leaving chat:", projectId);
      socket.off("chat-history", handleChatHistory);
      socket.off("new-chat-message", handleNewMessage);
      socket.off("chat-error", handleChatError);
    };
  }, [isOpen, projectId, currentUserName]); // ✅ Perfect dependencies

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      projectId,
      message: newMessage.trim(),
      senderName: currentUserName
    };

    console.log("📤 Sending:", messageData.message);
    socket.emit("chat-message", messageData);
    setNewMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={e => e.stopPropagation()}>
        <div className="chat-header">
          <div>
            <h3>💬 {projectTitle}</h3>
            <span className="chat-participants">
              {clientName} ↔ {freelancerName || "Freelancer"}
            </span>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              💭 Say hello to start chatting!
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={msg._id || msg.timestamp || index}
                className={`chat-message ${msg.senderName === currentUserName ? 'sent' : 'received'}`}
              >
                <div className="message-bubble">
                  <strong>{msg.senderName}</strong>
                  <p>{msg.message}</p>
                  <span className="message-time">
                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${freelancerName || "freelancer"}...`}
            className="chat-input"
          />
          <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModel;
