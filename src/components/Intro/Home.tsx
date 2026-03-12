import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./Home.css";
import { 
  Activity, AlertTriangle, Calendar, CheckCircle, Clock, 
  FlaskConical, Package, TrendingUp, Users, 
  FileText, Thermometer, Award, Zap
} from "lucide-react";

// Local images (place your images in src/assets/)
import heroImage from "../assets/hero.jpg";      // For hero section
import aboutImage from "../assets/about.jpg";    // For about section (use a different image if you prefer)

// Mock stats data (replace with real data)
const stats = [
  { label: "Samples Processed", value: "2.4M", icon: <FlaskConical size={24} />, trend: "+18%" },
  { label: "Active Labs", value: "520", icon: <Award size={24} />, trend: "+12%" },
  { label: "Tests / Day", value: "8.2K", icon: <Activity size={24} />, trend: "+7%" },
  { label: "Avg. Turnaround", value: "4.2h", icon: <Clock size={24} />, trend: "-0.3h" },
  { label: "Equipment Uptime", value: "99.9%", icon: <Zap size={24} />, trend: "stable" },
  { label: "Active Users", value: "1.8K", icon: <Users size={24} />, trend: "+22%" },
];

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-badge">
              <span className="badge-dot"></span>
              Next‑Gen Laboratory Information System
            </span>
            <h1>
              Streamline your lab with <span className="gradient-text">LIMS</span>
            </h1>
            <p className="hero-description">
              From sample tracking to result reporting – one platform to manage your entire laboratory workflow with confidence.
            </p>
            <div className="hero-cta">
              <a href="#features" className="btn btn-primary">Explore Features</a>
              <a href="#about" className="btn btn-outline">Learn More</a>
            </div>
          </div>
          <div className="hero-visual">
            <img src={heroImage} alt="Modern laboratory" className="hero-image" />
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-details">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
                <span className={`stat-trend ${stat.trend.startsWith('+') ? 'positive' : stat.trend.startsWith('-') ? 'negative' : 'neutral'}`}>
                  {stat.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="container about-container">
          <div className="about-text">
            <span className="section-badge">Why LIMS?</span>
            <h2>Built by scientists, for scientists</h2>
            <p className="about-paragraph">
              We know that accuracy and efficiency are non‑negotiable. That's why LIMS combines powerful automation with an intuitive interface – so you can focus on the science, not the paperwork.
            </p>
            <div className="about-highlights">
              <div className="highlight-item">
                <CheckCircle size={20} className="highlight-icon" />
                <span>ISO 15189 compliant</span>
              </div>
              <div className="highlight-item">
                <CheckCircle size={20} className="highlight-icon" />
                <span>Real‑time QC alerts</span>
              </div>
              <div className="highlight-item">
                <CheckCircle size={20} className="highlight-icon" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
          <div className="about-visual">
            <div className="image-frame">
              <img src={aboutImage} alt="Laboratory" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2>Everything your lab needs</h2>
          </div>
          <div className="features-grid">
            {[
              { icon: <FlaskConical size={32} />, title: "Sample Tracking", desc: "Barcode‑based tracking from collection to disposal." },
              { icon: <FileText size={32} />, title: "Result Management", desc: "Automated validation and reporting with EMR integration." },
              { icon: <Thermometer size={32} />, title: "Equipment Monitoring", desc: "Real‑time temperature and calibration alerts." },
              { icon: <Package size={32} />, title: "Inventory Control", desc: "Smart reordering and low‑stock notifications." },
              { icon: <Users size={32} />, title: "User Management", desc: "Role‑based access and audit trails." },
              { icon: <Activity size={32} />, title: "Analytics", desc: "Custom dashboards and compliance reports." },
            ].map((feat, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon-wrapper">{feat.icon}</div>
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;