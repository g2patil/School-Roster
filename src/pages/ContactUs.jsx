import React from "react";

const ContactUs = () => {
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
          className="contact-us-container"
          style={{
            padding: "100px",
            maxWidth: "900px",
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
            Contact Us
          </h1>

          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: "1.8",
              color: "#f4f6f8ff",
            }}
          >
            Have a project in mind or want to learn more about our services?
            We'd love to hear from you. Please use the contact details below to
            reach out. We're committed to providing prompt and professional
            responses.
          </p>

          <div
            style={{
              textAlign: "left",
              marginTop: "60px",
              color: "#ffffff",
              fontSize: "1.1rem",
              lineHeight: "2",
            }}
          >
            <p>
              <strong>👨‍💻 Name:</strong> Jitendra Patil
            </p>
            <p>
              <strong>🏢 Company:</strong> Adnya Technologies
            </p>
            <p>
              <strong>📍 Location:</strong> Thane, Maharashtra, India
            </p>
            <p>
              <strong>📞 Phone:</strong> +91-9960059223
            </p>
            <p>
              <strong>✉️ Email:</strong> jitu2patil@gmail.com
            </p>
            <p>
              <strong>🌐 Website:</strong>{" "}
              <a
                href="https://adnyatech.com"
                style={{ color: "#facc15", textDecoration: "none" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                www.adnyatech.com
              </a>
            </p>
          </div>

          <p
            style={{
              marginTop: "30px",
              fontSize: "1.1rem",
              color: "#ffffffff",
              lineHeight: "1.8",
            }}
          >
            We're always excited to collaborate on new ideas, support
            innovations, and solve real-world business problems with practical
            software solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
