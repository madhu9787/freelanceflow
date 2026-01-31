// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import "./FloatingChat.css";

// const FloatingChat = () => {
//   const [showPopup, setShowPopup] = useState(false);
//   const [showHoverText, setShowHoverText] = useState(false);
//   const navigate = useNavigate();

//   return (
//     <>
//       {/* 💬 Floating Chat Button */}
//       <motion.div
//         className="floating-ribit-btn"
//         onClick={() => {
//           setShowPopup(!showPopup);
//           if (!showPopup) {
//             setTimeout(() => navigate("/chat"), 1000);
//           }
//         }}
//         onMouseEnter={() => setShowHoverText(true)}
//         onMouseLeave={() => setShowHoverText(false)}
//         animate={{ y: [0, -10, 0] }}
//         transition={{
//           duration: 1.5,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//         whileHover={{ scale: 1.15 }}
//         whileTap={{ scale: 0.9 }}
//       >
//         💬
//       </motion.div>

//       {/* ✨ Hover Message */}
//       <AnimatePresence>
//         {showHoverText && (
//           <motion.div
//             className="hover-popup"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: -20 }}
//             exit={{ opacity: 0, y: 10 }}
//             transition={{ duration: 0.4 }}
//           >
//             <span>Hello there! 👋 I'm Revit — how can I help you?</span>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* 🐰 Popup Text on Click */}
//       <AnimatePresence>
//         {showPopup && (
//           <motion.div
//             className="ribit-popup"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.4 }}
//           >
//             <span>🐰 Revit says: Let's chat!</span>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default FloatingChat;
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Sparkles, Heart } from 'lucide-react';
import "./FloatingChat.css";

const FloatingChat = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [blink, setBlink] = useState(false);
  const [tailWag, setTailWag] = useState(0);
  const [earFlop, setEarFlop] = useState(0);
  const [hoverMessageIndex, setHoverMessageIndex] = useState(0);
  const navigate = useNavigate();

  const hoverMessages = [
    "Ask anything...",
    "Need gig help? ✨",
    "Proposal tips 💡", 
    "Payment info 💳",
    "Voice chat ready 🎤"
  ];

  // Cute fox animations
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
      setTailWag(prev => prev === 0 ? 15 : 0);
      setEarFlop(prev => prev === 0 ? 5 : 0);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Hover message cycling - every 5 seconds
  useEffect(() => {
    if (isHovered) {
      // Reset to first message on hover
      setHoverMessageIndex(0);
      const cycleInterval = setInterval(() => {
        setHoverMessageIndex((prev) => (prev + 1) % hoverMessages.length);
      }, 5000); // 5 seconds
      return () => clearInterval(cycleInterval);
    }
  }, [isHovered]);

  const handleClick = () => {
    setShowMessage(true);
    setTimeout(() => navigate("/chat", { replace: true }), 500);
  };

  return (
    <div className="fox-chat-container">
      {/* 🦊 Cute Fox Body */}
      <motion.div
        className="fox-body"
        animate={{ 
          y: [0, -3, 0],
          rotate: [0, 0.5, -0.5, 0]
        }}
        transition={{ 
          y: { duration: 2.5, repeat: Infinity },
          rotate: { duration: 3, repeat: Infinity }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Head */}
        <div className="fox-head">
          {/* Ears */}
          <motion.div 
            className="ear left"
            animate={{ rotate: earFlop === 5 ? -2 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div 
            className="ear right"
            animate={{ rotate: earFlop === 5 ? 2 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Eyes */}
          <div className="eyes">
            <motion.div 
              className="eye left"
              animate={{ scaleY: blink ? 0.2 : 1 }}
              transition={{ duration: 0.1 }}
            />
            <motion.div 
              className="eye right"
              animate={{ scaleY: blink ? 0.2 : 1 }}
              transition={{ duration: 0.1, delay: 0.05 }}
            />
          </div>

          {/* Nose */}
          <div className="nose" />
          
          {/* Snout */}
          <div className="snout" />
        </div>

        {/* Body */}
        <div className="fox-body-main">
          <div className="chest-fur" />
        </div>

        {/* Tail */}
        <motion.div 
          className="tail"
          animate={{ rotate: tailWag }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="tail-tip" />
        </motion.div>

        {/* Paws */}
        <div className="paws">
          <div className="paw front-left" />
          <div className="paw front-right" />
          <div className="paw back-left" />
          <div className="paw back-right" />
        </div>
      </motion.div>

      {/* 💬 Cycling Hover Messages - 5s loop */}
      <AnimatePresence mode="wait">
        {isHovered && (
          <motion.div
            key={hoverMessageIndex}
            className="hover-message"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles size={16} />
            <span>{hoverMessages[hoverMessageIndex]}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✨ Success Burst */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="success-burst"
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 2.5, 0],
              opacity: [1, 0.8, 0]
            }}
            transition={{ duration: 0.6 }}
          >
            <Heart size={28} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✨ Floating Particles */}
      <div className="particles">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            animate={{
              x: [0, 12, -12, 0],
              y: [0, -6, 6, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FloatingChat;
