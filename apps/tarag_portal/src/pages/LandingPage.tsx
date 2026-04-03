// pages/LandingPage.tsx - Redesigned Modern Version
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
        </svg>
      ),
      title: 'Route Guidance',
      desc: 'Live route data for public transportation — know exactly when your ride arrives.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
      title: 'Safety First',
      desc: 'Emergency alerts, and one-tap SOS — your safety, always covered.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Itinerary',
      desc: 'Plan your routes with personalized itineraries — get the best paths for your journey.',
    },
  ];

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--background-color)', fontFamily: "'DM Sans', 'Outfit', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,300&family=Space+Grotesk:wght@400;500;700&display=swap');
        
        .tg-hero-bg {
          background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,101,248,0.18) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,202,255,0.1) 0%, transparent 60%),
                      var(--background-color);
        }
        .tg-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .tg-gradient-text {
          background: linear-gradient(135deg, var(--secondary-color) 0%, var(--accent-color) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tg-badge {
          background: linear-gradient(135deg, rgba(0,101,248,0.15), rgba(0,202,255,0.15));
          border: 1px solid rgba(0,202,255,0.25);
          color: var(--accent-color);
        }
        .tg-btn-primary {
          background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 0 30px rgba(0,101,248,0.3);
        }
        .tg-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 50px rgba(0,101,248,0.5);
        }
        .tg-btn-ghost {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--card-border);
          color: var(--text-color);
          transition: all 0.3s ease;
        }
        .tg-btn-ghost:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }
        .tg-feature-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          transition: all 0.4s ease;
        }
        .tg-feature-card:hover {
          border-color: rgba(0,101,248,0.4);
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(0,101,248,0.15);
        }
        .tg-icon-wrap {
          background: linear-gradient(135deg, rgba(0,101,248,0.2), rgba(0,202,255,0.2));
          border: 1px solid rgba(0,202,255,0.2);
          color: var(--accent-color);
        }
        .tg-stat-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          transition: all 0.3s ease;
        }
        .tg-stat-card:hover {
          border-color: rgba(0,101,248,0.3);
          transform: scale(1.03);
        }
        .tg-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,202,255,0.3), transparent);
        }
        .tg-grid-line {
          background-image: 
            linear-gradient(rgba(0,101,248,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,101,248,0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .tg-float { animation: float 4s ease-in-out infinite; }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .tg-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      {/* Background Grid */}
      <div className="fixed inset-0 tg-grid-line pointer-events-none opacity-50" style={{ width: '100vw' }}></div>

      {/* Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none" style={{ overflow: 'hidden', width: '100vw' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl tg-glow"
          style={{ width: '60vw', maxWidth: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,101,248,0.12) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 right-0 rounded-full blur-3xl tg-glow"
          style={{ width: '40vw', maxWidth: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(0,202,255,0.08) 0%, transparent 70%)', animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── HERO ─── */}
        <section className="pt-24 pb-20 flex flex-col items-center text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full tg-badge text-xs font-semibold tracking-widest uppercase mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 tg-glow"></span>
            Now available in Cebu
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span style={{ color: 'var(--text-color)' }}>Move smarter</span>
            <br />
            <span className="tg-gradient-text">through Cebu.</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: 'var(--text-color)', opacity: 0.65 }}>
            TaraG gives you real-time transit data, community safety alerts, and itinerary guidance — all in one app built for Travelers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-20">
            <Link to="/download" className="md:hidden tg-btn-primary px-8 py-4 rounded-2xl text-base font-bold flex items-center gap-3 no-underline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download the APK
            </Link>
            <Link to="/about" className="tg-btn-ghost px-8 py-4 rounded-2xl text-base font-semibold no-underline flex items-center gap-2">
              Learn more
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="w-full tg-divider mb-12"></div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="py-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px" style={{ background: 'var(--secondary-color)' }}></div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--secondary-color)' }}>Why TaraG</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Everything you need<br />
            <span className="tg-gradient-text">to travel confidently.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="tg-feature-card rounded-3xl p-8">
                <div className="tg-icon-wrap w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)', opacity: 0.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA BANNER ─── */}
        <section className="py-10 mb-20">
          <div className="rounded-3xl p-10 md:p-16 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(0,101,248,0.15) 0%, rgba(0,202,255,0.1) 100%)', border: '1px solid rgba(0,202,255,0.2)' }}>
            {/* Decorative */}
            <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full blur-3xl"
              style={{ background: 'rgba(0,101,248,0.2)' }}></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Ready? TaraG<span className="tg-gradient-text">!</span>
                </h3>
                <p style={{ color: 'var(--text-color)', opacity: 0.65 }} className="max-w-md">
                  Join thousands of Travelers already commuting smarter with TaraG.
                </p>
              </div>
              <Link to="/download" className="tg-btn-primary px-10 py-4 rounded-2xl text-base font-bold whitespace-nowrap no-underline flex items-center gap-2">
                Get TaraG APK
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LandingPage;