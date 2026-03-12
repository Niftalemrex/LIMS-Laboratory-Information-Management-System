import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash.css";
import labBackground from "./assets/splash.jpg";

interface FloatingParticle {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}

interface FloatingDNA {
  id: number;
  left: number;
  top: number;
  scale: number;
  delay: number;
  rotationSpeed: number;
}

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [floatingDNAs, setFloatingDNAs] = useState<FloatingDNA[]>([]);
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const fullText = "Empowering scientific discovery";

  // Typewriter effect
  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [typedText]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Create particles
  useEffect(() => {
    const newParticles: FloatingParticle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 4 + 1,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 12,
      });
    }
    setParticles(newParticles);

    // Create floating DNA helixes
    const newDNAs: FloatingDNA[] = [];
    for (let i = 0; i < 6; i++) {
      newDNAs.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        scale: 0.3 + Math.random() * 0.4,
        delay: Math.random() * 5,
        rotationSpeed: 10 + Math.random() * 15,
      });
    }
    setFloatingDNAs(newDNAs);
  }, []);

  return (
    <div className="splash">
      {/* Hero Image */}
      <div className="hero">
        <img src={labBackground} alt="Laboratory" className="hero-image" />
        <div className="hero-overlay" />
      </div>

      {/* Floating Particles */}
      <div className="particle-container">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Floating DNA Helixes */}
      <div className="floating-dna-container">
        {floatingDNAs.map((dna) => (
          <div
            key={dna.id}
            className="floating-dna"
            style={{
              left: `${dna.left}%`,
              top: `${dna.top}%`,
              transform: `scale(${dna.scale})`,
              animationDelay: `${dna.delay}s`,
              animationDuration: `${dna.rotationSpeed}s`,
            }}
          >
            {[...Array(8)].map((_, i) => {
              const yOffset = (i - 4) * 12;
              const rotation = i * 45;
              return (
                <div
                  key={i}
                  className="floating-base-pair"
                  style={{
                    transform: `translateY(${yOffset}px) rotateY(${rotation}deg)`,
                  }}
                >
                  <div className="floating-nucleotide left"></div>
                  <div className="floating-nucleotide right"></div>
                  <div className="floating-bond"></div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Centered Content */}
      <div className="content-center">
        {/* Main 3D DNA Helix */}
        <div className="dna-3d-container">
          <div className="dna-3d">
            {[...Array(16)].map((_, i) => {
              const yOffset = (i - 8) * 24;
              const rotation = i * 22.5;
              return (
                <div
                  key={i}
                  className="base-pair"
                  style={{
                    transform: `translateY(${yOffset}px) rotateY(${rotation}deg)`,
                  }}
                >
                  <div className="nucleotide left"></div>
                  <div className="nucleotide right"></div>
                  <div className="hydrogen-bond"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <h1 className="title">
          <span className="title-line">LABORATORY</span>
          <span className="title-line accent">INFORMATION SYSTEM</span>
        </h1>

        {/* Typewriter Subtitle */}
        <div className="subtitle-container">
          <p className="subtitle">
            {typedText}
            <span className="cursor" style={{ opacity: showCursor ? 1 : 0 }}>|</span>
          </p>
        </div>

        {/* Button */}
        <button className="button-primary" onClick={() => navigate("/home")}>
          Enter Laboratory
        </button>

        {/* Status */}
        <div className="status">
          <div className="status-dot"></div>
          <span className="status-text">System Operational</span>
          <span className="status-badge">v2.4.1</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;