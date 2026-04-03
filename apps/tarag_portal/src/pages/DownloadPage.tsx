import React from 'react';

const whatsNew = [
  { text: 'Enhanced AI assistant with smarter route recommendations' },
  { text: 'Improved offline map functionality for low-connectivity areas' },
  { text: 'New emergency contact integration for safety features' },
  { text: 'Bug fixes and performance improvements across the board' },
  { text: 'Refreshed UI with better accessibility and readability' },
  { text: 'Real-time traffic updates with smart alternative routes' },
];

const DownloadPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--background-color)', fontFamily: "'DM Sans', 'Outfit', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700;9..40,900&family=Space+Grotesk:wght@400;500;700&display=swap');
        .dl-gradient-text { background: linear-gradient(135deg, var(--secondary-color), var(--accent-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .dl-card { background: var(--card-bg); border: 1px solid var(--card-border); backdrop-filter: blur(16px); }
        .dl-card-hover { transition: all 0.35s ease; }
        .dl-card-hover:hover { transform: translateY(-5px); box-shadow: 0 20px 60px rgba(0,101,248,0.14); }
        .dl-android-card:hover { border-color: rgba(34,197,94,0.4) !important; }
        .dl-ios-card:hover { border-color: rgba(59,130,246,0.4) !important; }
        .dl-badge { background: linear-gradient(135deg, rgba(0,101,248,0.15), rgba(0,202,255,0.15)); border: 1px solid rgba(0,202,255,0.25); color: var(--accent-color); }
        .dl-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(0,202,255,0.3), transparent); }
        .dl-btn-android { background: linear-gradient(135deg, #16a34a, #22c55e); color: white; transition: all 0.3s ease; box-shadow: 0 0 20px rgba(34,197,94,0.25); }
        .dl-btn-android:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(34,197,94,0.4); }
        .dl-btn-ios { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; transition: all 0.3s ease; box-shadow: 0 0 20px rgba(59,130,246,0.25); }
        .dl-btn-ios:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(59,130,246,0.4); }
        .dl-check { background: linear-gradient(135deg, var(--secondary-color), var(--accent-color)); }
        .dl-req-card { background: var(--card-bg); border: 1px solid var(--card-border); transition: all 0.35s ease; }
        .dl-req-card:hover { border-color: rgba(0,101,248,0.3); transform: translateY(-3px); }
        .dl-bg-grid { background-image: linear-gradient(rgba(0,101,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,101,248,0.04) 1px, transparent 1px); background-size: 50px 50px; }
        @keyframes dl-glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .dl-glow { animation: dl-glow 3s ease-in-out infinite; }
        .dl-btn-ghost { background: rgba(255,255,255,0.06); border: 1px solid var(--card-border); color: var(--text-color); transition: all 0.3s ease; }
        .dl-btn-ghost:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }
      `}</style>

      <div className="fixed inset-0 dl-bg-grid pointer-events-none opacity-60" style={{ width: '100vw' }}></div>
      <div className="fixed inset-0 pointer-events-none" style={{ overflow: 'hidden', width: '100vw' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl dl-glow"
          style={{ width: '60vw', maxWidth: '700px', height: '350px', background: 'radial-gradient(ellipse, rgba(0,101,248,0.1) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 left-0 rounded-full blur-3xl dl-glow"
          style={{ width: '35vw', maxWidth: '400px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,202,255,0.06) 0%, transparent 70%)', animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* ─── HEADER ─── */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full dl-badge text-xs font-bold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 dl-glow"></span>
            Version 2.1.0 · Latest Release
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-color)' }}>
            Get TaraG
            <br /><span className="dl-gradient-text">on your device.</span>
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
            Download the app and start commuting smarter today. Available on Android now iOS.
          </p>
        </div>

        <div className="dl-divider mb-20"></div>

        {/* ─── DOWNLOAD CARDS ─── */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px" style={{ background: 'var(--secondary-color)' }}></div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--secondary-color)' }}>Download</span>
          </div>
          <h2 className="text-4xl font-black mb-12" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Choose your platform.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Android */}
            <div className="dl-card dl-card-hover dl-android-card rounded-3xl p-8 flex flex-col">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                    <path d="M17.523 15.341a.5.5 0 0 0 0-1 .5.5 0 0 0 0 1M6.477 15.341a.5.5 0 0 0 0-1 .5.5 0 0 0 0 1M.91 8.64C.41 8.64 0 9.05 0 9.548v5.914C0 16.01.41 16.42.91 16.42c.5 0 .91-.41.91-.958V9.548C1.82 9.05 1.41 8.64.91 8.64M23.09 8.64c-.5 0-.91.41-.91.908v5.914c0 .548.41.958.91.958s.91-.41.91-.958V9.548c0-.498-.41-.908-.91-.908M16.36 1.09l1.13-1.13a.34.34 0 0 0 0-.478.34.34 0 0 0-.478 0l-1.24 1.24A7.54 7.54 0 0 0 12 .09a7.54 7.54 0 0 0-3.772.632L6.988-.518a.34.34 0 0 0-.478 0 .34.34 0 0 0 0 .478l1.13 1.13C5.878 2.2 4.91 3.72 4.91 5.46v.636h14.18V5.46c0-1.74-.968-3.26-2.73-4.37M9.09 4.37a.545.545 0 1 1 0-1.09.545.545 0 0 1 0 1.09m5.82 0a.545.545 0 1 1 0-1.09.545.545 0 0 1 0 1.09M4.91 6.55v10.3c0 .71.578 1.286 1.296 1.286H7.27v3.22c0 .6.482 1.08 1.079 1.08.597 0 1.08-.48 1.08-1.08v-3.22h1.142v3.22c0 .6.482 1.08 1.079 1.08.597 0 1.08-.48 1.08-1.08v-3.22h1.063c.718 0 1.296-.576 1.296-1.286V6.55z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-1" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>Android</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Available Now</span>
                </div>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-color)', opacity: 0.6 }}>Download APK for Android 8.0+. Optimized for all screen sizes.</p>
              <button className="dl-btn-android w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 mt-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download APK
              </button>
              <p className="text-xs text-center mt-3" style={{ color: 'var(--text-color)', opacity: 0.4 }}>Requires 8.0+ · 500MB free space</p>
            </div>

            {/* iOS */}
            <div className="dl-card dl-card-hover dl-ios-card rounded-3xl p-8 flex flex-col">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
                  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-1" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>iOS</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>Coming Soon</span>
                </div>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-color)', opacity: 0.6 }}>Download for iPhone and iPad running iOS 12.0+.</p>
              <button className="dl-btn-ios w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 mt-auto opacity-80">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                Download APK
              </button>
              <p className="text-xs text-center mt-3" style={{ color: 'var(--text-color)', opacity: 0.4 }}>Requires iOS 12.0+ · iPhone 6s or newer</p>
            </div>
          </div>
        </section>

        {/* ─── WHAT'S NEW ─── */}
        <section className="mb-20">
          <div className="dl-card rounded-3xl p-10 md:p-12">
            <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-8 h-px" style={{ background: 'var(--accent-color)' }}></div>
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--accent-color)' }}>Changelog</span>
                </div>
                <h2 className="text-3xl font-black" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  What's new in v2.1.0
                </h2>
              </div>
              <span className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, rgba(0,101,248,0.2), rgba(0,202,255,0.2))', border: '1px solid rgba(0,202,255,0.3)', color: 'var(--accent-color)' }}>
                ✦ Latest Release
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {whatsNew.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="dl-check w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-color)', opacity: 0.7 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SYSTEM REQUIREMENTS ─── */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px" style={{ background: 'var(--secondary-color)' }}></div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--secondary-color)' }}>Requirements</span>
          </div>
          <h2 className="text-4xl font-black mb-12" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
            System requirements.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                os: 'Android', icon: '🤖', color: '#22c55e',
                reqs: ['Android 8.0 or higher', '2GB RAM minimum', '500MB free storage', 'Internet for full features', 'GPS for location services']
              },
              {
                os: 'iOS', icon: '🍎', color: '#3b82f6',
                reqs: ['iOS 12.0 or higher', 'iPhone 6s or newer', 'iPad 5th generation or newer', '500MB free storage', 'Internet for full features']
              },
            ].map((p, i) => (
              <div key={i} className="dl-req-card rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${p.color}20`, border: `1px solid ${p.color}30` }}>
                    {p.icon}
                  </div>
                  <h3 className="text-xl font-black" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>{p.os}</h3>
                </div>
                <ul className="space-y-3">
                  {p.reqs.map((r, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }}></span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HELP ─── */}
        <section>
          <div className="rounded-3xl p-10 md:p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(0,101,248,0.1), rgba(0,202,255,0.07))', border: '1px solid rgba(0,202,255,0.18)' }}>
            <div className="absolute inset-0 dl-bg-grid opacity-30"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-4" style={{ color: 'var(--text-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
                Need <span className="dl-gradient-text">help?</span>
              </h2>
              <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
                Issues during install? Check our troubleshooting guide or reach out to our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="dl-check px-7 py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, var(--secondary-color), var(--accent-color))' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                  </svg>
                  Troubleshooting Guide
                </button>
                <button className="dl-btn-ghost px-7 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                  </svg>
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default DownloadPage;