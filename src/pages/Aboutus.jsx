import React, {  } from "react";


const Aboutus = () => {

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
 
  <div className="about-us-container" style={{ padding: '40px', maxWidth: '900px', margin: 'auto', fontFamily: 'Arial' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', textAlign: 'center', color: '#9b6201ff' }}>
        About Us
      </h1>
      
      <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#f4f6f8ff' }}>
        <strong>Adnya Technologies</strong> is a passionate technology firm founded by <strong>Jitendra Patil</strong>, a seasoned software developer with over 18 years of experience in the IT industry, including 12+ years in software development and data engineering.
        <br /><br />
        We specialize in delivering customized, scalable, and secure software solutions tailored to meet the unique needs of small businesses, clinics, educational institutions, housing societies, and local enterprises.
      </p>

      <h2 style={{ fontSize: '1.8rem', marginTop: '30px', color: '#9b6201ff' }}>What We Do</h2>
      <ul style={{ fontSize: '1.1rem', color: '#ffffffff', paddingLeft: '20px', lineHeight: '1.8' }}>
        <li>Custom mobile app development (Android/iOS) using React Native</li>
        <li>Backend systems using Java Spring Boot and PostgreSQL</li>
        <li>Medical and OPD clinic management solutions (e.g., <strong>Doctor Plus</strong>)</li>
        <li>Society management and school ERP systems</li>
        <li>Cloud hosting, deployment, and ongoing support</li>
        <li>Data migration, reconciliation, and reporting for banks and corporates</li>
      </ul>

      <h2 style={{ fontSize: '1.8rem', marginTop: '30px', color: '#9b6201ff' }}>Why Choose Us?</h2>
      <ul style={{ fontSize: '1.1rem', color: '#ffffffff', paddingLeft: '20px', lineHeight: '1.8' }}>
        <li>18+ years of professional experience</li>
        <li>Personalized attention and fast communication</li>
        <li>Trusted by clients in healthcare, education, housing, and utilities</li>
        <li>Affordable pricing with long-term support</li>
        <li>End-to-end service from design to deployment</li>
      </ul>

      <h2 style={{ fontSize: '1.8rem', marginTop: '30px', color: '#9b6201ff' }}>Let’s Build Together</h2>
      <p style={{ fontSize: '1.1rem', color: '#ffffffff', lineHeight: '1.8' }}>
        Whether you're a doctor, school administrator, business owner, or society manager, we’re here to turn your ideas into reality with modern, reliable software solutions. Reach out today to discuss how we can help your digital journey.
      </p>
    </div>

</div>
      
    </div>
  );
};

export default Aboutus;
