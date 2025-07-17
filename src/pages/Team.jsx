import React from "react";

const Team = () => {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "100%",
    margin: "0 auto",
    maxHeight: "400px", // Adjust height as needed
    overflowY: "auto",
    border: "0px solid black",
        }}
      >
        <div
          className="team-container"
          style={{
            padding: "40px",
            maxWidth: "1000px",
            margin: "auto",
            fontFamily: "Arial",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              marginBottom: "20px",
              textAlign: "center",
              color: "#9b6201ff",
            }}
          >
            Our Team
          </h1>

          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: "1.8",
              color: "#f4f6f8ff",
              marginBottom: "30px",
            }}
          >
            Adnya Technologies is led by experienced developer{" "}
            <strong>Jitendra Patil</strong> and supported by a trusted network
            of skilled freelancers and collaborators in software development,
            UI/UX design, and data engineering. We work as a team to bring your
            ideas to life.
          </p>

          <div
            className="team-grid"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            {/* Team Member - Jitendra */}
            <div
              style={{
                backgroundColor: "#1e293b",
                padding: "20px",
                borderRadius: "12px",
                width: "250px",
                color: "#fff",
                boxShadow: "0 4px 10px rgba(255, 204, 0, 0.2)",
              }}
            >
              <img
                src="/your-photo.jpg" // Replace with your actual image path
                alt="Jitendra Patil"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  marginBottom: "10px",
                  objectFit: "cover",
                }}
              />
              <h3 style={{ color: "#facc15" }}>Jitendra Patil</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                Founder & Full Stack Developer<br />
                18+ years of experience in IT<br />
                Specialist in Java, Spring Boot, React Native
              </p>
            </div>

            {/* Freelancer Placeholder */}
            <div
              style={{
                backgroundColor: "#1e293b",
                padding: "20px",
                borderRadius: "12px",
                width: "250px",
                color: "#fff",
                boxShadow: "0 4px 10px rgba(255, 204, 0, 0.2)",
              }}
            >
              <img
                src="/freelancer1.jpg" // Add a real image or use a placeholder
                alt="Team Member"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  marginBottom: "10px",
                  objectFit: "cover",
                }}
              />
              <h3 style={{ color: "#facc15" }}>UI/UX Designer</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                Expert in Figma, Web Design, App Layouts
              </p>
            </div>

            {/* Another Placeholder */}
            <div
              style={{
                backgroundColor: "#1e293b",
                padding: "20px",
                borderRadius: "12px",
                width: "250px",
                color: "#fff",
                boxShadow: "0 4px 10px rgba(255, 204, 0, 0.2)",
              }}
            >
              <img
                src="/freelancer2.jpg"
                alt="Backend Developer"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  marginBottom: "10px",
                  objectFit: "cover",
                }}
              />
              <h3 style={{ color: "#facc15" }}>Backend Developer</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                Java Spring Boot, PostgreSQL, API integration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
