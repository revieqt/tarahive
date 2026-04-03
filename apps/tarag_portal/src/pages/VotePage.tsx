// pages/VotePage.tsx - Redesigned Modern Version
import React from 'react';
import { Link } from 'react-router-dom';

const steps = [
  {
    num: '01',
    title: 'Register to Vote',
    desc: 'Make sure you\'re registered in your barangay. Bring a valid ID and proof of residency to your local COMELEC office before the registration deadline.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Know Your Candidates',
    desc: 'Research candidates running for IT Congress. Look into their platforms, tech literacy, track record, and vision for Cebu\'s digital future.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Mark Your Calendar',
    desc: 'Note all election dates — local and national. Set reminders so you never miss the window. Early voting options may be available in your area.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Bring Valid ID',
    desc: 'On election day, bring your Voter\'s ID or any government-issued ID. Check the COMELEC website for the full list of accepted identification documents.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
      </svg>
    ),
  },
  {
    num: '05',
    title: 'Vote for IT Advocates',
    desc: 'Prioritize candidates who support digital literacy, tech infrastructure, and innovation in Cebu. Think long-term — your vote shapes the city\'s future.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    num: '06',
    title: 'Spread the Word',
    desc: 'Share voting info with friends and family. Use social media and the TaraG app to raise awareness — every voice matters in shaping Cebu\'s tech future.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
      </svg>
    ),
  },
];

const reasons = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 0 0 .284 2.253" />
      </svg>
    ),
    title: 'Digital Infrastructure',
    desc: 'Candidates who invest in fiber networks, smart city tech, and reliable connectivity for all Cebuanos.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-1.342m-7.482 0c.009.05.018.1.027.15" />
      </svg>
    ),
    title: 'Tech Education',
    desc: 'Representatives who fund coding bootcamps, digital literacy programs, and STEM scholarships.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Innovation Hub',
    desc: 'Leaders who position Cebu as a tech capital — attracting startups, investors, and IT talent.'
  },
];

const VotePage: React.FC = () => {
  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--background-color)', fontFamily: "'DM Sans', 'Outfit', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700;9..40,900&family=Space+Grotesk:wght@400;500;700&display=swap');
        .vp-gradient-text { background: linear-gradient(135deg, var(--secondary-color), var(--accent-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .vp-card { background: var(--card-bg); border: 1px solid var(--card-border); backdrop-filter: blur(16px); transition: all 0.35s ease; }
        .vp-card:hover { border-color: rgba(0,101,248,0.35); box-shadow: 0 16px 50px rgba(0,101,248,0.12); transform: translateY(-3px); }
        .vp-icon { background: linear-gradient(135deg, rgba(0,101,248,0.18), rgba(0,202,255,0.18)); border: 1px solid rgba(0,202,255,0.2); color: var(--accent-color); }
        .vp-badge { background: linear-gradient(135deg, rgba(0,101,248,0.15), rgba(0,202,255,0.15)); border: 1px solid rgba(0,202,255,0.25); color: var(--accent-color); }
        .vp-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(0,202,255,0.3), transparent); }
        .vp-step-num { background: linear-gradient(135deg, var(--secondary-color), var(--accent-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .vp-step-line { background: linear-gradient(180deg, rgba(0,101,248,0.5), transparent); }
        .vp-btn-primary { background: linear-gradient(135deg, var(--secondary-color), var(--accent-color)); color: white; box-shadow: 0 0 30px rgba(0,101,248,0.3); transition: all 0.3s ease; }
        .vp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(0,101,248,0.5); }
        .vp-btn-ghost { background: rgba(255,255,255,0.06); border: 1px solid var(--card-border); color: var(--text-color); transition: all 0.3s ease; }
        .vp-btn-ghost:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }
        .vp-bg-grid { background-image: linear-gradient(rgba(0,101,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,101,248,0.04) 1px, transparent 1px); background-size: 50px 50px; }
        @keyframes vp-glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .vp-glow { animation: vp-glow 3s ease-in-out infinite; }
      `}</style>

      <div className="fixed inset-0 vp-bg-grid pointer-events-none opacity-60" style={{ width: '100vw' }}></div>
      <div className="fixed inset-0 pointer-events-none" style={{ overflow: 'hidden', width: '100vw' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl vp-glow"
          style={{ width: '60vw', maxWidth: '700px', height: '350px', background: 'radial-gradient(ellipse, rgba(0,101,248,0.1) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 right-0 rounded-full blur-3xl vp-glow"
          style={{ width: '35vw', maxWidth: '400px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,202,255,0.07) 0%, transparent 70%)', animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* ─── HEADER ─── */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full vp-badge text-xs font-bold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 vp-glow"></span>
            Election 2025
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-color)' }}>
            Vote for
            <br /><span className="vp-gradient-text">IT Congress.</span>
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
            Help shape the future of technology in Cebu. The candidates you choose today will define the city's digital landscape for the next generation.
          </p>
        </div>

        <div className="vp-divider mb-20"></div>

        {/* ─── WHY IT MATTERS ─── */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px" style={{ background: 'var(--secondary-color)' }}></div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--secondary-color)' }}>Why it matters</span>
          </div>
          <h2 className="text-4xl font-black mb-12" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Your vote shapes<br />Cebu's digital future.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reasons.map((r, i) => (
              <div key={i} className="vp-card rounded-2xl p-7">
                <div className="vp-icon w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  {r.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>{r.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)', opacity: 0.58 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HOW TO VOTE STEPS ─── */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px" style={{ background: 'var(--accent-color)' }}></div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--accent-color)' }}>Step-by-step</span>
          </div>
          <h2 className="text-4xl font-black mb-4" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
            How to vote for IT Congress.
          </h2>
          <p className="text-base mb-14" style={{ color: 'var(--text-color)', opacity: 0.55 }}>
            Follow these steps to make your vote count.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {steps.map((s, i) => (
              <div key={i} className="vp-card rounded-2xl p-7 flex items-start gap-5">
                {/* Step number */}
                <div className="flex-shrink-0">
                  <div className="text-3xl font-black vp-step-num leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.num}</div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="vp-icon w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                      {s.icon}
                    </div>
                    <h3 className="font-bold" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>{s.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)', opacity: 0.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CONNECT WITH APP ─── */}
        <section className="mb-20">
          <div className="vp-card rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl"
              style={{ background: 'rgba(0,101,248,0.12)' }}></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 vp-badge px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
                  Connected to TaraG App
                </div>
                <h2 className="text-3xl font-black mb-4" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Stay updated via the app.
                </h2>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
                  TaraG's election feature gives you candidate profiles, voting reminders, and real-time polling updates — all in the same app you use to commute.
                </p>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link to="/download" className="vp-btn-primary px-8 py-4 rounded-2xl text-base font-bold no-underline flex items-center gap-2 whitespace-nowrap justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download TaraG
                </Link>
                <button className="vp-btn-ghost px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-2 justify-center">
                  Learn about candidates
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── STAY INFORMED ─── */}
        <section>
          <div className="rounded-3xl p-10 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(0,101,248,0.12), rgba(0,202,255,0.08))', border: '1px solid rgba(0,202,255,0.18)' }}>
            <div className="absolute inset-0 vp-bg-grid opacity-30"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-4" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
                Stay <span className="vp-gradient-text">informed.</span>
              </h2>
              <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
                Follow local news, attend candidate forums, and engage with your community to vote with confidence.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="vp-btn-primary px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                  </svg>
                  Subscribe to Updates
                </button>
                <button className="vp-btn-ghost px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                  Join Voter Education
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default VotePage;