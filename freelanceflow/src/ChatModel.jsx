
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { FaPaperPlane, FaTimes, FaPhone, FaPalette } from "react-icons/fa";
import Vapi from "@vapi-ai/web";
import Whiteboard from "./components/Whiteboard";
import "./ChatModel.css";

const socket = io(`${import.meta.env.VITE_API_URL}`);
const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

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
  const [vapiActive, setVapiActive] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
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

    // VAPI LISTENERS
    vapi.on('call-start', () => setVapiActive(true));
    vapi.on('call-end', () => setVapiActive(false));
    vapi.on('error', (e) => {
      console.error(e);
      setVapiActive(false);
    });

    // 5. Cleanup
    return () => {
      console.log("💬 Leaving chat:", projectId);
      socket.off("chat-history", handleChatHistory);
      socket.off("new-chat-message", handleNewMessage);
      socket.off("chat-error", handleChatError);
    };
  }, [isOpen, projectId, currentUserName]); // ✅ Perfect dependencies

  const handleVoiceCall = async () => {
    if (vapiActive) {
      vapi.stop();
      return;
    }

    try {
      await vapi.start({
        name: "FreelanceFlow Sync",
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `You are an AI assistant facilitating a sync for the project: ${projectTitle}. Help the freelancer and client communicate.` }
          ]
        },
        voice: { provider: "openai", voiceId: "alloy" },
        transcriber: { provider: "deepgram", model: "nova-2", language: "en" },
        firstMessage: `I'm joining the "${projectTitle}" sync. How can I assist?`
      });
    } catch (e) {
      console.error("Vapi call failed", e);
      alert("Voice Sync failed. Try text chat!");
    }
  };

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
              {vapiActive && <span className="vapi-live-tag">🔴 LIVE CALL</span>}
            </span>
          </div>
          <div className="chat-header-actions">
            <button
              className={`chat-action-btn ${vapiActive ? 'vapi-active' : ''}`}
              onClick={handleVoiceCall}
              title="Voice Call"
            >
              <FaPhone />
            </button>
            <button
              className="chat-action-btn"
              onClick={() => setShowWhiteboard(true)}
              title="Whiteboard"
            >
              <FaPalette />
            </button>
            <button className="chat-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
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
                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

      {showWhiteboard && (
        <Whiteboard
          projectId={projectId}
          onClose={() => setShowWhiteboard(false)}
        />
      )}
    </div>
  );
};

export default ChatModel;
