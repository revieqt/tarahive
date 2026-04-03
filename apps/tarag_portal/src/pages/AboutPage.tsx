// pages/AboutPage.tsx - Redesigned Modern Version
import React from 'react';

const teamMembers = [
    {
    name: 'Mark Ken Purisima',
    role: 'Project Manager',
    avatar: 'CR',
    image: '/marken.jpg',
    bio: 'Coordinates the team and roadmap to deliver reliable updates and feature releases.',
    links: { github: '#', facebook: 'https://www.facebook.com/marken28' }
  },
  {
    name: 'Joshua D. Opsima',
    role: 'Developer',
    avatar: 'JD',
    image: '/joshua.png',
    bio: 'Builds TaraG’s core app and backend systems to keep transit data flowing smoothly.',
    links: { github: 'https://github.com/revieqt', facebook: 'https://www.facebook.com/jsh.ex3' }
  },
  {
    name: 'Iris Kamylle Rivera',
    role: 'Front End Developer',
    avatar: 'MS',
    image: '/iris.jpg',
    bio: 'Crafts smooth, accessible UI experiences that make TaraG easy for everyone to use.',
    links: { github: 'https://github.com/Riverairis', facebook: 'https://www.facebook.com/Kamylleeeeee/' }
  },
  {
    name: 'Ed Lorenz Villarasa',
    role: 'Documentor',
    avatar: 'MJ',
    image: '/ed.jpg',
    bio: 'Creates clear docs and resources so users can unlock TaraG’s full potential.',
    links: { github: 'https://github.com/edlorenz2018', facebook: 'https://www.facebook.com/edlorenz2018' }
  },
  {
    name: 'Shaira Mae C. Tolentino',
    role: 'Documentor',
    avatar: 'AL',
    image: '/shaira.png',
    bio: 'Creates clear documentation and guides that help users get the most from TaraG.',
    links: { github: '#', facebook: 'https://www.facebook.com/na.yesha.202148' }
  },
   {
    name: 'Joel Janzel Babon',
    role: 'System Analyst',
    avatar: 'EG',
    image: '/janzel.jpg',
    bio: 'Analyzes system performance and user behavior to keep TaraG fast and reliable.',
    links: { github: 'https://github.com/Janzel123', facebook: 'https://www.facebook.com/janzel.babon.1' }
  },
];

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
      </svg>
    ),
    title: 'Route Planning',
    desc: 'Plan journeys with accurate real-time data for efficient travel.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    ),
    title: 'Safety Alerts',
    desc: 'Instant push notifications for emergencies.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
    title: 'AI Assistant',
    desc: 'AI-powered route planning, itinerary creation, and answers to transit questions.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Itinerary',
    desc: 'Create and manage personalized itineraries for your trips.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: 'Authentication & Security',
    desc: 'Secure user authentication and data protection for safe travel planning.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.951-7.5 11.951S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
    title: 'Location-Based Services',
    desc: 'Find nearby attractions, routes, and services with location-aware features.'
  },
];

const AboutPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--background-color)', fontFamily: "'DM Sans', 'Outfit', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700;9..40,900&family=Space+Grotesk:wght@400;500;700&display=swap');
        .ab-gradient-text {
          background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ab-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          backdrop-filter: blur(16px);
          transition: all 0.35s ease;
        }
        .ab-card:hover { border-color: rgba(0,101,248,0.35); box-shadow: 0 16px 50px rgba(0,101,248,0.12); transform: translateY(-4px); }
        .ab-icon { background: linear-gradient(135deg, rgba(0,101,248,0.18), rgba(0,202,255,0.18)); border: 1px solid rgba(0,202,255,0.2); color: var(--accent-color); }
        .ab-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(0,202,255,0.3), transparent); }
        .ab-badge { background: linear-gradient(135deg, rgba(0,101,248,0.15), rgba(0,202,255,0.15)); border: 1px solid rgba(0,202,255,0.25); color: var(--accent-color); }
        .ab-team-card { background: var(--card-bg); border: 1px solid var(--card-border); transition: all 0.35s ease; }
        .ab-team-card:hover { border-color: rgba(0,202,255,0.3); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,101,248,0.1); }
        .ab-avatar { background: linear-gradient(135deg, var(--secondary-color), var(--accent-color)); }
        .ab-check { background: linear-gradient(135deg, var(--secondary-color), var(--accent-color)); }
        .ab-bg-grid {
          background-image: linear-gradient(rgba(0,101,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,101,248,0.04) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        @keyframes ab-glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .ab-glow { animation: ab-glow 3s ease-in-out infinite; }
      `}</style>

      <div className="fixed inset-0 ab-bg-grid pointer-events-none opacity-60" style={{ width: '100vw' }}></div>
      <div className="fixed pointer-events-none inset-0" style={{ overflow: 'hidden', width: '100vw' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl ab-glow"
          style={{ width: '60vw', maxWidth: '700px', height: '350px', background: 'radial-gradient(ellipse, rgba(0,101,248,0.1) 0%, transparent 70%)' }}></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* ─── HEADER ─── */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full ab-badge text-xs font-bold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ab-glow"></span>
            About TaraG
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-color)' }}>
            Built for every
            <br /><span className="ab-gradient-text">traveler.</span>
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
            TaraG is a student project combining real-time data, community intelligence, and AI to make travel better for everyone.
          </p>
        </div>

        <div className="ab-divider mb-20"></div>

        {/* ─── MISSION ─── */}
        <section className="mb-20">
          <div className="rounded-3xl p-10 md:p-14 ab-card relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-3xl"
              style={{ background: 'rgba(0,101,248,0.12)' }}></div>
            <div className="relative z-10 max-w-3xl">
              <span className="text-xs font-bold tracking-widest uppercase ab-badge px-3 py-1 rounded-full inline-block mb-6">Our Mission</span>
              <p className="text-2xl md:text-3xl font-semibold leading-snug" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
                We believe <span className="ab-gradient-text font-bold">better information</span> leads to better journeys — and better journeys build a better community.
              </p>
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px" style={{ background: 'var(--secondary-color)' }}></div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--secondary-color)' }}>Key Features</span>
          </div>
          <h2 className="text-4xl font-black mb-12" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Everything in one app.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="ab-card rounded-2xl p-7">
                <div className="ab-icon w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)', opacity: 0.58 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── WHY CHOOSE ─── */}
        <section className="mb-20">
          <div className="rounded-3xl p-10 md:p-14 ab-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px" style={{ background: 'var(--accent-color)' }}></div>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--accent-color)' }}>Why choose us</span>
            </div>
            <h2 className="text-3xl font-black mb-10" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>Why TaraG?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { title: 'Reliable Information', desc: 'Verified data from multiple sources with real-time cross-checks and community validation.' },
                { title: 'User-Friendly Design', desc: 'Intuitive interface designed for everyone — from students to senior citizens.' },
                { title: 'Privacy-Focused', desc: 'Your data is encrypted and never sold. You stay in full control of your information.' },
                { title: 'Freemium Features', desc: 'Freemium features offer access to advanced options and priority support.' },
                { title: 'Community-Powered', desc: 'TaraG improves every day thanks to reports and feedback from real commuters like you.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl hover:bg-white/5 transition-colors">
                  <div className="ab-check w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>{item.title}</h4>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)', opacity: 0.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TEAM ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px" style={{ background: 'var(--secondary-color)' }}></div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--secondary-color)' }}>The Team</span>
          </div>
          <h2 className="text-4xl font-black mb-4" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Faces behind TaraG.
          </h2>
          <p className="text-base mb-12" style={{ color: 'var(--text-color)', opacity: 0.55 }}>
            A passionate group of students building tech for everyone.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((m, i) => (
              <div key={i} className="ab-team-card rounded-3xl p-7 flex items-start gap-5">
                {/* Avatar */}
                <div className="ab-avatar w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>{m.name}</h3>
                      <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--accent-color)' }}>{m.role}</span>
                    </div>
                    {/* Social Links */}
                    <div className="flex gap-2 flex-shrink-0">
                      <a href={m.links.github} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ border: '1px solid var(--card-border)' }}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
                          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      </a>
                      <a href={m.links.facebook} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ border: '1px solid var(--card-border)' }}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--text-color)', opacity: 0.6 }}>{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutPage;