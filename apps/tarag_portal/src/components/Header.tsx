// components/Header.tsx - Redesigned Modern Version
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/vote', label: 'IT Congress' },
];

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setIsMenuOpen(false); }, [location]);

  return (
    <>
      <style>{`
        .hdr-root {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          transition: all 0.3s ease;
          background: var(--header-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--card-border);
        }
        .hdr-root.scrolled {
          box-shadow: 0 4px 30px rgba(0,0,0,0.08);
        }
        .hdr-inner {
          max-width: 1152px;
          margin: 0 auto;
          padding: 0 20px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .hdr-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 1.25rem;
          text-decoration: none;
          background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          flex-shrink: 0;
          letter-spacing: -0.02em;
        }
        .hdr-logo span {
          font-size: 0.6em;
          -webkit-text-fill-color: transparent;
          background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
          -webkit-background-clip: text;
          background-clip: text;
          vertical-align: super;
          font-weight: 500;
        }
        .hdr-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          justify-content: center;
        }
        .hdr-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 10px;
          font-size: 0.8125rem;
          font-weight: 500;
          text-decoration: none;
          color: var(--text-color);
          opacity: 0.65;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .hdr-link:hover {
          opacity: 1;
          background: var(--card-bg);
        }
        .hdr-link.active {
          opacity: 1;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          color: var(--secondary-color);
        }
        .hdr-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .hdr-theme-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid var(--card-border);
          background: var(--card-bg);
          color: var(--text-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .hdr-theme-btn:hover {
          border-color: rgba(0,101,248,0.3);
          color: var(--secondary-color);
        }
        .hdr-dl-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 10px;
          font-size: 0.8125rem;
          font-weight: 700;
          text-decoration: none;
          background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
          color: white !important;
          -webkit-text-fill-color: white !important;
          transition: all 0.2s ease;
          box-shadow: 0 0 16px rgba(0,101,248,0.25);
          white-space: nowrap;
        }
        .hdr-dl-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 28px rgba(0,101,248,0.4);
        }
        .hdr-menu-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid var(--card-border);
          background: var(--card-bg);
          color: var(--text-color);
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        /* Mobile drawer */
        .hdr-drawer {
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          background: var(--header-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--card-border);
          padding: 12px 20px 16px;
          transform: translateY(-110%);
          transition: transform 0.3s ease, opacity 0.3s ease;
          opacity: 0;
          z-index: 99;
        }
        .hdr-drawer.open {
          transform: translateY(0);
          opacity: 1;
        }
        .hdr-drawer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .hdr-drawer-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          color: var(--text-color);
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          transition: all 0.2s ease;
        }
        .hdr-drawer-link:hover,
        .hdr-drawer-link.active {
          border-color: rgba(0,101,248,0.3);
          color: var(--secondary-color);
        }
        .hdr-drawer-dl {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 700;
          text-decoration: none;
          background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
          color: white !important;
          -webkit-text-fill-color: white !important;
          margin-top: 4px;
          box-shadow: 0 4px 20px rgba(0,101,248,0.3);
        }
        /* Responsive breakpoints */
        @media (max-width: 768px) {
          .hdr-nav { display: none; }
          .hdr-menu-btn { display: flex; }
          .hdr-dl-btn { display: none; }
        }
        @media (max-width: 900px) {
          .hdr-link span { display: none; }
          .hdr-link { padding: 8px; }
          .hdr-dl-btn span { display: none; }
          .hdr-dl-btn { padding: 8px 10px; }
        }
        @media (min-width: 901px) {
          .hdr-link span { display: inline; }
          .hdr-dl-btn span { display: inline; }
        }
        /* Spacer so content doesn't hide under header */
        .hdr-spacer { height: 60px; }
      `}</style>

      <header className={`hdr-root${scrolled ? ' scrolled' : ''}`}>
        <div className="hdr-inner">
          {/* Logo */}
          <Link to="/" className="hdr-logo">
            TaraG
          </Link>

          {/* Desktop Nav */}
          <nav className="hdr-nav">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`hdr-link${isActive ? ' active' : ''}`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="hdr-right">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="hdr-theme-btn"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            {/* Download CTA — desktop */}
            <Link to="/download" className="hdr-dl-btn">
              <DownloadIcon />
              <span>Get App</span>
            </Link>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hdr-menu-btn"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`hdr-drawer${isMenuOpen ? ' open' : ''}`}>
        <div className="hdr-drawer-grid">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`hdr-drawer-link${isActive ? ' active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/download"
            className="hdr-drawer-link"
            onClick={() => setIsMenuOpen(false)}
            style={{ borderColor: 'rgba(0,101,248,0.3)', color: 'var(--secondary-color)' }}
          >
            <DownloadIcon />
            <span>Get App</span>
          </Link>
        </div>
      </div>

      {/* Spacer */}
      <div className="hdr-spacer" />
    </>
  );
};

export default Header;