import React, { useEffect, useState } from "react";
import axios from "axios";

const MyGigs = () => {
  const [gigs, setGigs] = useState([]);

  useEffect(() => {
    const fetchMyGigs = async () => {
      try {
        const freelancerId = "tempFreelancer";
        const res = await axios.get(
          `http://localhost:5000/api/projects/my-gigs/${freelancerId}`
        );
        setGigs(res.data);
      } catch (error) {
        console.error("Error fetching gigs:", error);
      }
    };
    fetchMyGigs();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🧾 My Gigs</h1>

      {gigs.length === 0 ? (
        <p style={styles.noGigs}>You haven’t accepted any projects yet.</p>
      ) : (
        <div style={styles.cardContainer}>
          {gigs.map((gig) => (
            <div key={gig._id} style={styles.card}>
              <h2 style={styles.title}>{gig.title}</h2>
              <p><strong>Description:</strong> {gig.description}</p>
              <p><strong>Budget:</strong> 💰 {gig.budget}</p>
              <p><strong>Duration:</strong> ⏱️ {gig.duration || "Not specified"}</p>
              <p><strong>Skills:</strong> {gig.skills || "Not specified"}</p>
              <p><strong>Status:</strong> ✅ {gig.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "40px 20px",
    backgroundColor: "#f3e8ff",
    minHeight: "100vh",
  },
  heading: {
    color: "#6b21a8",
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "28px",
    fontWeight: "700",
  },
  noGigs: {
    textAlign: "center",
    color: "#666",
    fontSize: "18px",
  },
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    border: "2px solid #d8b4fe",
  },
  title: {
    color: "#4b0082",
    marginBottom: "10px",
  },
};

export default MyGigs;
