import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import { FlaskConical, Mail, Phone, MapPin, Twitter, Linkedin, Github } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="lims-footer">
      <div className="footer-container">
        {/* Logo & Tagline */}
        <div className="footer-brand">
          <div className="brand-logo">
            <FlaskConical size={28} className="logo-icon" />
            <span className="logo-text">LIMS</span>
          </div>
          <p className="brand-tagline">
            Streamline your laboratory workflow with confidence.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Product</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#about">About</a></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Documentation</a></li>
            <li><a href="#">Support</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">API</a></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div className="footer-contact">
          <h4>Connect</h4>
          <ul className="contact-info">
            <li>
              <Mail size={16} />
              <a href="mailto:Niftalemawe@gmail.com">Niftalemawe@gmail.com</a>
            </li>
            <li>
              <Phone size={16} />
              <a href="tel:+251939193603">+251 939 193 603</a>
            </li>
            <li>
              <MapPin size={16} />
              <span>Addis Ababa, Ethiopia</span>
            </li>
          </ul>
          <div className="social-icons">
            <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={18} /></a>
            <a href="#" aria-label="GitHub"><Github size={18} /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} LIMS. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;