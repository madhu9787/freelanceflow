

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Vapi from "@vapi-ai/web";
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Mic, Phone, Send } from 'lucide-react';
import "./ChatUI.css";

const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

console.log('🔑 Vapi Key:', import.meta.env.VITE_VAPI_PUBLIC_KEY ? '✅ Loaded' : '❌ MISSING');

const ChatUI = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: "ai", text: "👋 Hey, I'm Ribit from FreelanceFlow!", timestamp: Date.now() },
    { id: 2, sender: "ai", text: "🤝 I can help with gigs, proposals, payments.", timestamp: Date.now() },
    { id: 3, sender: "ai", text: "✨ Try: 'Suggest React gig ideas'", timestamp: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [vapiActive, setVapiActive] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [aiPreview, setAiPreview] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const chatBoxRef = useRef(null);

  // ✅ FIXED VAPI EVENT LISTENERS - SAFE NULL CHECKS
  useEffect(() => {
    const handleCallStart = () => {
      console.log('✅ Vapi call STARTED');
      setVapiActive(true);
    };

    const handleCallEnd = (metadata) => {
      console.log('🔚 Vapi call ENDED:', metadata);
      setVapiActive(false);
      
      // ✅ SAFE NULL CHECK - FIXES CRASH
      const reason = metadata?.endedReason || 'Completed';
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          sender: "ai", 
          text: `📞 Call ended: ${reason}`, 
          timestamp: Date.now()
        }]);
      }, 500);
    };

    const handleError = (error) => {
      console.error('💥 Vapi ERROR:', error);
      setVapiActive(false);
      
      // ✅ SAFE ERROR HANDLING
      const errorMsg = error?.message || error?.error?.message || 'Call failed';
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: "ai", 
        text: `❌ ${errorMsg}`, 
        timestamp: Date.now()
      }]);
    };

    vapi.on('call-start', handleCallStart);
    vapi.on('call-end', handleCallEnd);
    vapi.on('error', handleError);

    return () => {
      vapi.off('call-start', handleCallStart);
      vapi.off('call-end', handleCallEnd);
      vapi.off('error', handleError);
    };
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
    }
  }, []);

  // Smart suggestions
  useEffect(() => {
    if (input.length > 2) {
      const matches = [
        "Suggest gig ideas for React",
        "Write project proposal", 
        "Explain payments"
      ].filter(s => s.toLowerCase().includes(input.toLowerCase()));
      setSuggestions(matches.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  }, [input]);

  // AI Preview
  useEffect(() => {
    if (input.length > 3) {
      setAiPreview("🤔 Ribit is thinking...");
    } else {
      setAiPreview("");
    }
  }, [input]);

  // Scroll to bottom
  useEffect(() => {
    chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
  }, [messages]);

  // Simple voice recognition
  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.onresult = (e) => setInput(e.results[0][0].transcript);
      recognition.onend = () => setListening(false);
      recognition.start();
      setListening(true);
    }
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || vapiActive) return;
    
    const userMsg = { 
      id: Date.now(), 
      sender: "user", 
      text: input, 
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput(""); 
    setSuggestions([]);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/ai", { message: userInput });
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: "ai", 
        text: res.data.reply, 
        timestamp: Date.now()
      }]);
    } catch {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: "ai", 
        text: "❌ Sorry, connection error!", 
        timestamp: Date.now()
      }]);
    }
    setLoading(false);
  };

  // VAPI CALL
  const handleVapi = async () => {
    console.log('🎯 Call button clicked!');
    
    if (!import.meta.env.VITE_VAPI_PUBLIC_KEY) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: "ai", 
        text: "❌ Add VITE_VAPI_PUBLIC_KEY to .env file!", 
        timestamp: Date.now()
      }]);
      return;
    }
    
    if (vapiActive) return;

    const userMsg = { 
      id: Date.now(), 
      sender: "user", 
      text: `📞 Calling Ribit... "${input || 'Hello'}"`, 
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      console.log('🚀 Starting Vapi...');
      
      await vapi.start({
        model: { 
          provider: "openai", 
          model: "gpt-4o-mini" 
        },
        voice: { 
          provider: "openai", 
          voiceId: "alloy"
        },
        transcriber: { 
          provider: "deepgram", 
          model: "nova-2",
          language: "en"
        }
      });
      
      console.log('✅ Vapi call launched!');
      
    } catch (e) {
      console.error('💥 Vapi ERROR:', e);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: "ai", 
        text: `❌ ${e.error?.message || e.message || 'Check F12 console'}`, 
        timestamp: Date.now()
      }]);
    }
  };

  // SIMPLIFIED END CALL
  const endVapi = () => {
    console.log('🛑 Ending call');
    vapi.stop(); // Events handle state changes safely
  };

  return (
    <div className={`chatbot-container ${isDark ? 'dark' : ''}`}>
      {/* ROBOT AVATAR */}
      <div className="robot-avatar">
        <motion.div 
          className="robot-head"
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
        <div className="robot-eyes">
          <div className={`eye ${listening || vapiActive ? 'active' : ''}`} />
          <div className={`eye ${listening || vapiActive ? 'active' : ''}`} />
        </div>
        <div className="robot-mouth" />
        </motion.div>
        <div className="robot-body">
          <div className={`status-dot ${vapiActive ? 'live' : ''}`} />
        </div>
        <div className="robot-name">Ribit</div>
      </div>

      {/* CHAT WINDOW */}
      <div className="chat-window">
        {/* HEADER */}
        <div className="chat-header">
          <div>
            <div className={`status-badge ${vapiActive ? 'live' : ''}`}>
              {vapiActive ? "🔴 Live Call" : "🟢 Online"}
            </div>
            <h3>Ribit Assistant</h3>
          </div>
          <motion.button 
            onClick={toggleTheme} 
            className="theme-btn" 
            whileHover={{ scale: 1.1 }}
            style={{
              background: isDark ? '#fff' : '#333',
              color: isDark ? '#333' : '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer'
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </motion.button>
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions">
          <motion.button 
            className="quick-btn" 
            whileHover={{ scale: 1.05 }} 
            onClick={() => setInput("Suggest gig ideas")}
            style={{ padding: '8px 16px', margin: '2px' }}
          >
            💡 Gigs
          </motion.button>
          <motion.button 
            className="quick-btn" 
            whileHover={{ scale: 1.05 }} 
            onClick={() => setInput("Write proposal")}
            style={{ padding: '8px 16px', margin: '2px' }}
          >
            ✍️ Proposals
          </motion.button>
          <motion.button 
            className="quick-btn" 
            whileHover={{ scale: 1.05 }} 
            onClick={() => setInput("Payments")}
            style={{ padding: '8px 16px', margin: '2px' }}
          >
            💳 Payments
          </motion.button>
        </div>

        {aiPreview && !vapiActive && (
          <motion.div 
            className="ai-preview" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            {aiPreview}
          </motion.div>
        )}

        {/* MESSAGES - REACTIONS REMOVED */}
        <div className="messages-container" ref={chatBoxRef}>
          {messages.map((msg, i) => (
            <motion.div 
              key={msg.id}
              className={`message ${msg.sender}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="message-bubble">
                <span>{msg.text}</span>
              </div>
            </motion.div>
          ))}
          
          {loading && !vapiActive && (
            <div className="message ai">
              <div className="message-bubble typing">
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CLEAN INPUT */}
        <div className="input-container" style={{ minHeight: '80px' }}>
          <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <motion.button 
              className={`voice-btn ${listening ? 'active' : ''}`}
              onClick={startVoice}
              whileHover={{ scale: 1.1 }}
              animate={listening ? { scale: [1, 1.2, 1] } : {}}
              disabled={vapiActive}
              style={{
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                background: vapiActive ? '#ccc' : '#007bff',
                color: 'white',
                marginRight: '8px'
              }}
            >
              <Mic size={18} />
            </motion.button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={vapiActive ? "🗣️ On live call..." : "Ask anything about freelancing..."}
              className="chat-input"
              disabled={vapiActive}
              style={{ flex: 1, padding: '12px', borderRadius: '8px' }}
            />
            
            <AnimatePresence>
              {suggestions.length > 0 && !vapiActive && (
                <motion.div 
                  className="suggestions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ 
                    position: 'absolute', 
                    bottom: '60px', 
                    left: 0, 
                    right: 0, 
                    background: 'white', 
                    borderRadius: '8px',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {suggestions.map((sug, i) => (
                    <div key={i} className="suggestion" onClick={() => setInput(sug)} style={{ padding: '12px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid #eee' : 'none' }}>
                      {sug}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              className="send-btn" 
              onClick={handleSend} 
              whileHover={{ scale: 1.05 }}
              disabled={!input.trim() || vapiActive}
              style={{
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                background: (!input.trim() || vapiActive) ? '#ccc' : '#28a745',
                color: 'white',
                marginLeft: '8px'
              }}
            >
              <Send size={18} />
            </motion.button>
          </div>

          {/* ✅ INLINE CSS VAPI BUTTONS - 100% SAFE */}
          <div style={{ marginTop: '12px' }}>
            {vapiActive ? (
              <motion.button 
                className="end-btn" 
                onClick={endVapi} 
                whileHover={{ scale: 1.05 }}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220,53,69,0.3)',
                  minWidth: '120px'
                }}
              >
                ⛔ End Call
              </motion.button>
            ) : (
              <motion.button 
                className="phone-btn" 
                onClick={handleVapi} 
                whileHover={{ scale: 1.1 }}
                style={{
                  background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255,107,107,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '120px'
                }}
              >
                <Phone size={20} />
                Call Ribit
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;
