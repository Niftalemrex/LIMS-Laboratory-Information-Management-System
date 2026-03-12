import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logoImage from "../assets/logo.png"; // Replace with a proper logo if available

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="lims-header">
      <div className="header-container">

        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src={logoImage} alt="LIMS" className="logo-image" />
          <span className="logo-text">LIMS</span>
        </Link>

        {/* Burger Button */}
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
          <span className={`bar ${menuOpen ? "open" : ""}`}></span>
        </button>

        {/* Navigation */}
        <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
          <a href="#top" onClick={closeMenu}>Home</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>

          <Link to="/TenantAccessAuth" className="login-btn" onClick={closeMenu}>
            Login
          </Link>
        </nav>

      </div>
    </header>
  );
};

export default Header;