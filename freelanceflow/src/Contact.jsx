import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import emailjs from "@emailjs/browser";
import "./Contact.css";

const Contact = () => {
  const [text, setText] = useState("");
  const [subText, setSubText] = useState("");
  const [status, setStatus] = useState("");
  const form = useRef();

  const fullText = "    Let's Connect & Collaborate 💜    ";
  const secondaryText =
    "    Empowering creators and clients to build the future of work-one message away from innovation 💜    ";

  useEffect(() => {
    let i = 0;
    const typeMain = setInterval(() => {
      if (i < fullText.length) {
        setText((prev) => prev + fullText.charAt(i));
        i++;
      } else {
        clearInterval(typeMain);
        let j = 0;
        const typeSub = setInterval(() => {
          if (j < secondaryText.length) {
            setSubText((prev) => prev + secondaryText.charAt(j));
            j++;
          } else clearInterval(typeSub);
        }, 50);
      }
    }, 80);
    return () => clearInterval(typeMain);
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("Sending...");

    emailjs
      .sendForm(
        "service_cdqwgbl", // ✅ Your Service ID
        "template_nhvixkq", // ✅ Your Template ID
        form.current,
        "hVoE8qiPdv_1ydv9F" // ✅ Your Public Key
      )
      .then(
        () => {
          setStatus("Message sent successfully! ✅");
          e.target.reset();
          setTimeout(() => setStatus(""), 3000);
        },
        (error) => {
          console.error("FAILED...", error.text);
          setStatus("Failed to send message ❌");
        }
      );
  };

  return (
    <motion.div
      className="contact-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="floating-bg"></div>

      <h1 className="contact-title">{text}</h1>
      <p className="contact-subtitle">{subText}</p>

      <motion.div
        className="contact-form"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <form ref={form} onSubmit={sendEmail}>
          <div className="form-group">
            <input type="text" name="user_name" placeholder="Full Name" required />
          </div>
          <div className="form-group">
            <input type="email" name="user_email" placeholder="Email Address" required />
          </div>
          <div className="form-group">
            <textarea name="message" rows="4" placeholder="Your Message..." required></textarea>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(75, 0, 130, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            type="submit"
          >
            Send Message 🚀
          </motion.button>
        </form>
        {status && <p className="status">{status}</p>}
      </motion.div>

      <motion.div
        className="contact-links"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
       
        
      </motion.div>
    </motion.div>
  );
};

export default Contact;