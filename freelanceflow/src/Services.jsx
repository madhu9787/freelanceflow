import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Code,
  MessageCircle,
  Star,
  Users,
  Shield,
} from "lucide-react";
import "./Services.css";

const Services = () => {
  const serviceData = [
    {
      icon: <Briefcase size={40} color="#fff" />,
      title: "Project Posting",
      desc: "Clients can post new freelance projects instantly and manage them efficiently.",
    },
    {
      icon: <Code size={40} color="#fff" />,
      title: "Smart Matching",
      desc: "AI-powered suggestions connect the best freelancers with matching projects.",
    },
    {
      icon: <Users size={40} color="#fff" />,
      title: "Collaborative Workspace",
      desc: "Share updates, files, and progress in a secure, intuitive environment.",
    },
    {
      icon: <MessageCircle size={40} color="#fff" />,
      title: "Real-time Chat",
      desc: "Communicate instantly between clients and freelancers with end-to-end safety.",
    },
    {
      icon: <Shield size={40} color="#fff" />,
      title: "Secure Payments",
      desc: "Protected payment gateway ensures trust and smooth transactions for all.",
    },
    {
      icon: <Star size={40} color="#fff" />,
      title: "Ratings & Growth",
      desc: "Freelancers earn credibility through client feedback and ratings.",
    },
  ];

  return (
    <motion.div
      className="services-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="services-header">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ✨ Explore Our Services ✨
        </motion.h1>
        <p>
          Empowering <b>Clients</b> and <b>Freelancers</b> through innovation,
          collaboration, and creativity.
        </p>
      </div>

      <div className="wave-bg"></div>

      <div className="services-grid">
        {serviceData.map((service, index) => (
          <motion.div
            className="service-box"
            key={index}
            whileHover={{ scale: 1.07, rotate: 1 }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <div className="icon-circle">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="freelancer-client-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2>💼 For Clients & Freelancers 💻</h2>
        <p>
          Whether you’re a business owner looking for the right talent or a
          freelancer seeking the next big opportunity — FreelanceFlow bridges
          the gap with elegance and technology.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Services;
