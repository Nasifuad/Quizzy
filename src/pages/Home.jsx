import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCurrentUser } from "../api";

const categories = [
  "General Knowledge",
  "IQ & Aptitude",
  "Computer Science",
  "Medical Entrance",
  "English Grammar",
  "BCS / Govt Jobs",
];

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await fetchCurrentUser();
      if (mounted) setUser(u);
    })();
    return () => (mounted = false);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "Poppins, sans-serif",
        background: "linear-gradient(135deg, #f0fdfa, #f5f3ff)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <header
        style={{
          width: "100%",
          maxWidth: "960px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div style={{ fontSize: "26px", fontWeight: "bold", color: "#4f46e5" }}>
          QuizMaster
        </div>
        <div>
          <Link
            to="/login"
            style={{
              fontSize: "22px",
              textDecoration: "none",
              color: "#f97316",
              transition: "transform 0.2s",
            }}
          >
            👤
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div
        style={{
          textAlign: "center",
          maxWidth: "650px",
          marginBottom: "32px",
          padding: "24px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #4f46e5, #f97316)",
          color: "#fff",
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ fontSize: "36px", margin: 0, fontWeight: "700" }}>
          Welcome to QuizMaster
        </h2>
        <p style={{ marginTop: "12px", fontSize: "18px", fontWeight: "500" }}>
          The smartest way to practice MCQs for exams
        </p>
        {!user && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <Link
              to="/login"
              style={{
                padding: "12px 28px",
                backgroundColor: "#10b981",
                color: "#fff",
                borderRadius: "12px",
                fontWeight: "600",
                textDecoration: "none",
                boxShadow: "0 5px 15px rgba(16,185,129,0.4)",
                transition: "all 0.3s",
              }}
            >
              🔑 Login
            </Link>
            <Link
              to="/register"
              style={{
                padding: "12px 28px",
                backgroundColor: "#fff",
                color: "#4f46e5",
                borderRadius: "12px",
                fontWeight: "600",
                textDecoration: "none",
                boxShadow: "0 5px 15px rgba(79,70,229,0.3)",
                transition: "all 0.3s",
              }}
            >
              🧾 Register
            </Link>
          </div>
        )}
      </div>

      {/* Categories */}
      <section
        style={{ maxWidth: "960px", width: "100%", marginBottom: "32px" }}
      >
        <h3
          style={{
            fontSize: "22px",
            fontWeight: "600",
            marginBottom: "16px",
            color: "#4f46e5",
          }}
        >
          💡 Categories
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
          }}
        >
          {categories.map((c, index) => (
            <Link
              key={c}
              to={`/category/${encodeURIComponent(c)}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                borderRadius: "16px",
                textDecoration: "none",
                color: "#fff",
                background: `linear-gradient(135deg, #${Math.floor(
                  Math.random() * 16777215
                ).toString(16)}, #${Math.floor(
                  Math.random() * 16777215
                ).toString(16)})`,
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                transition: "transform 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>📚</div>
              <div style={{ fontWeight: "600", textAlign: "center" }}>{c}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Start Practicing */}
      <div>
        <Link
          to="/dashboard"
          style={{
            padding: "14px 32px",
            backgroundColor: "#4f46e5",
            color: "#fff",
            borderRadius: "14px",
            fontSize: "18px",
            fontWeight: "600",
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(79,70,229,0.3)",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Start Practicing
        </Link>
      </div>
    </div>
  );
}
