"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   BEEHIVE PATTERN — tighter, more visible, with a golden fill tint
───────────────────────────────────────────────────────────────────────────── */
function HexPattern({ opacity = 0.045, id = "hex" }: { opacity?: number; id?: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={id} x="0" y="0" width="52" height="60" patternUnits="userSpaceOnUse">
          <polygon points="13,1 39,1 52,24 39,48 13,48 0,24" fill="rgba(251,191,36,0.06)" stroke="#D97706" strokeWidth="0.8" />
          <polygon points="13,31 39,31 52,54 39,78 13,78 0,54" fill="rgba(251,191,36,0.06)" stroke="#D97706" strokeWidth="0.8" />
          <polygon points="39,1 65,1 78,24 65,48 39,48 26,24" fill="rgba(251,191,36,0.06)" stroke="#D97706" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─────────────────────────────────────────────────────────────────────────────
   REVEAL WRAPPER
───────────────────────────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────────────────────────────────────────── */
function Label({ children, color = "amber" }: { children: React.ReactNode; color?: "amber" | "orange" }) {
  const cls = color === "orange" ? "text-orange-500 border-orange-200 bg-orange-50" : "text-amber-600 border-amber-200 bg-amber-50";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-bold px-3 py-1 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NAV
───────────────────────────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = ["Features", "How it works", "Testimonials", "FAQ"];
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#FDFAF4]/90 backdrop-blur-xl border-b border-amber-100/80 shadow-sm shadow-amber-100/40" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-[68px]">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-300/40 group-hover:scale-105 transition-transform">
            <span className="text-base leading-none select-none">🐝</span>
          </div>
          <span className="font-black text-xl tracking-tight text-stone-900">
            Tara<span className="text-amber-500">Hive</span>
          </span>
        </a>
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="text-[13px] font-medium text-stone-500 hover:text-amber-600 transition-colors relative group">
              {l}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-amber-400 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <a href="#" className="text-[13px] font-medium text-stone-500 hover:text-stone-900 transition-colors px-4 py-2">Log in</a>
          <a href="#" className="text-[13px] font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-amber-300/50 hover:-translate-y-px transition-all duration-200">
            Get started free
          </a>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-stone-600" aria-label="Menu">
          <div className="w-5 space-y-1.5">
            <span className={`block h-[1.5px] bg-current transition-all duration-300 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block h-[1.5px] bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-[1.5px] bg-current transition-all duration-300 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </div>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-[#FDFAF4]/98 backdrop-blur-xl border-b border-amber-100 px-5 pb-6 pt-2 space-y-1">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} onClick={() => setOpen(false)}
              className="block text-stone-600 py-2.5 text-sm font-medium border-b border-stone-100 last:border-0 hover:text-amber-600 transition-colors">
              {l}
            </a>
          ))}
          <a href="#" className="inline-flex mt-3 text-sm font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-2.5 rounded-full">
            Get started free
          </a>
        </div>
      )}
    </nav>
  );
}


/* ─────────────────────────────────────────────────────────────────────────────
   FEATURE CARD — glass morphism
───────────────────────────────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, gradient, delay = 0 }: {
  icon: string; title: string; desc: string; gradient: string; delay?: number;
}) {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
      className="group relative bg-white/60 backdrop-blur-sm rounded-3xl p-7 border border-white/80 hover:border-amber-200 shadow-sm hover:shadow-xl hover:shadow-amber-100/60 hover:-translate-y-1.5 transition-all duration-400 overflow-hidden cursor-default"
    >
      {/* corner glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl ${gradient}`} />
      {/* hex watermark */}
      <svg className="absolute bottom-4 right-4 w-20 h-20 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity" viewBox="0 0 52 60">
        <polygon points="13,1 39,1 52,24 39,48 13,48 0,24" fill="none" stroke="#92400E" strokeWidth="1.5" />
      </svg>
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5 text-2xl shadow-md ${gradient}`}>
        {icon}
      </div>
      <h3 className="font-bold text-stone-800 text-[17px] mb-2.5 leading-snug">{title}</h3>
      <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function TaraHivePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    { icon: "🗺️", title: "Smart Itinerary Builder", desc: "Drag-and-drop day planning with maps, time windows, and live sync across your whole travel group.", gradient: "bg-gradient-to-br from-amber-100 to-amber-200", delay: 0 },
    { icon: "🤖", title: "AI Travel Assistant", desc: "Ask anything — hidden gems, local customs, budget hacks — and get tailored answers in seconds.", gradient: "bg-gradient-to-br from-orange-100 to-orange-200", delay: 80 },
    { icon: "🌤️", title: "Live Weather Updates", desc: "Hyperlocal forecasts woven into your itinerary so every packed bag and plan makes sense.", gradient: "bg-gradient-to-br from-sky-100 to-blue-100", delay: 160 },
    { icon: "🆘", title: "Emergency SOS", desc: "One tap sends your GPS and a distress message to emergency contacts. Safety that never clocks out.", gradient: "bg-gradient-to-br from-red-100 to-rose-100", delay: 240 },
    { icon: "👥", title: "Group Trip Sync", desc: "Vote on places, split costs, and keep every travel mate on the same page — no more group chats.", gradient: "bg-gradient-to-br from-violet-100 to-purple-100", delay: 320 },
    { icon: "📦", title: "Smart Packing Lists", desc: "Checklists that auto-adapt to your destination, trip length, and activities. Nothing gets left behind.", gradient: "bg-gradient-to-br from-emerald-100 to-teal-100", delay: 400 },
  ];

  const steps = [
    { num: "01", emoji: "✈️", title: "Create your trip", desc: "Name your destination, set your dates, and invite travel companions in seconds." },
    { num: "02", emoji: "📍", title: "Build your itinerary", desc: "Add places, set times, and let the AI fill the gaps with smart suggestions." },
    { num: "03", emoji: "🧭", title: "Travel with confidence", desc: "Real-time weather, smart alerts, and SOS backup — right where you need them." },
  ];

  const testimonials = [
    { quote: "TaraHive turned our chaotic group chat into one clean itinerary. The real-time sync alone is worth it.", name: "Mika Santos", role: "Solo & group traveler", init: "MS", color: "from-amber-300 to-orange-400" },
    { quote: "The AI suggested a tiny café in Kyoto that genuinely made my whole trip. I never would've found it myself.", name: "David Lim", role: "Frequent flyer", init: "DL", color: "from-orange-300 to-red-400" },
    { quote: "The SOS feature gave my parents peace of mind while I backpacked alone across Southeast Asia. Non-negotiable.", name: "Rina Cruz", role: "Adventure traveler", init: "RC", color: "from-amber-400 to-yellow-400" },
  ];

  const faqs = [
    { q: "Is TaraHive free to use?", a: "Yes. Core features — itinerary creation, weather, and SOS — are free forever. Premium unlocks unlimited trips and advanced AI features." },
    { q: "Does it work offline?", a: "Saved itineraries are fully accessible offline. AI assistance and live weather require an internet connection." },
    { q: "Can I share my itinerary with people who don't have TaraHive?", a: "Absolutely. Export a shareable link or PDF that anyone can view without an account." },
    { q: "How does the SOS feature work?", a: "A single tap fires your GPS coordinates and a distress message to pre-set emergency contacts via SMS — no app needed on their end." },
    { q: "Can I use it for group trips?", a: "Yes — invite travel mates to collaborate live on a shared itinerary. Everyone sees updates in real time." },
  ];

  return (
    <div className="min-h-screen bg-[#FDFAF4] text-stone-800 overflow-x-hidden">
      <Nav />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-5 pt-24 pb-10 overflow-hidden">
        <HexPattern opacity={0.07} id="hex-hero" />

        {/* Ambient blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-gradient-radial from-amber-200/30 via-orange-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 -left-20 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute top-48 -right-20 w-56 h-56 bg-orange-300/20 rounded-full blur-3xl pointer-events-none animate-[pulse_8s_ease-in-out_infinite_1s]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-amber-200 rounded-full px-4 py-1.5 text-[12px] font-semibold text-amber-700 mb-8 shadow-sm shadow-amber-100"
            style={{ animation: "fadeSlideDown 0.7s ease both" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Smart travel planning — now with AI
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-[76px] font-black tracking-tight leading-[1.05] mb-7"
            style={{ animation: "fadeSlideDown 0.7s ease 100ms both" }}>
            Your whole trip,
            <br />
            <span className="relative inline-block mt-1">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                in one hive.
              </span>
              {/* Underline scribble */}
              <svg className="absolute -bottom-2 left-0 w-full overflow-visible" viewBox="0 0 400 14" fill="none">
                <path d="M4 9 Q100 3 200 9 Q300 15 396 8" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
                <path d="M4 11 Q100 6 200 11 Q300 17 396 10" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
              </svg>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-500 max-w-xl mx-auto leading-relaxed mb-10"
            style={{ animation: "fadeSlideDown 0.7s ease 200ms both" }}>
            Itinerary management, AI travel advice, live weather, and emergency SOS —
            all in one beautifully organized place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
            style={{ animation: "fadeSlideDown 0.7s ease 300ms both" }}>
            <a href="#" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-amber-300/50 hover:shadow-xl hover:shadow-amber-300/60 hover:-translate-y-0.5 transition-all duration-200 text-base">
              Start planning for free
              <span className="text-lg">→</span>
            </a>
            <a href="#how-it-works" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-stone-600 border border-stone-200/80 bg-white/70 backdrop-blur-sm px-8 py-4 rounded-2xl hover:border-amber-300 hover:text-amber-700 hover:bg-white transition-all duration-200 text-base font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
              </svg>
              See how it works
            </a>
          </div>

          {/* Social proof strip */}
          <div className="flex items-center justify-center gap-4 text-sm text-stone-400"
            style={{ animation: "fadeSlideDown 0.7s ease 400ms both" }}>
            <div className="flex -space-x-2">
              {["🧑‍🦱","👩","🧔","👩‍🦰","🧑"].map((e, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#FDFAF4] bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-xs shadow-sm">
                  {e}
                </div>
              ))}
            </div>
            <span><span className="font-semibold text-stone-600">12,000+</span> trips planned this month</span>
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideDown { from { opacity:0; transform:translateY(-16px) } to { opacity:1; transform:translateY(0) } }
          @keyframes fadeSlideUp   { from { opacity:0; transform:translateY(16px)  } to { opacity:1; transform:translateY(0) } }
        `}</style>
      </section>
      
      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="relative py-28 px-5 overflow-hidden">
        <HexPattern opacity={0.045} id="hex-feat" />
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal className="text-center mb-16">
            <Label>Everything you need</Label>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mt-4 mb-3 text-stone-900 leading-tight">
              Built for real travelers
            </h2>
            <p className="text-stone-500 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
              From first spark of inspiration to the moment you land back home.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative py-28 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-transparent" />
        <HexPattern opacity={0.06} id="hex-how" />

        <div className="max-w-5xl mx-auto relative z-10">
          <Reveal className="text-center mb-20">
            <Label color="orange">Simple by design</Label>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mt-4 text-stone-900 leading-tight">
              From blank page to<br className="hidden sm:block" /> booked trip
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 md:gap-10 relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-[52px] left-[calc(16.7%+2rem)] right-[calc(16.7%+2rem)] h-px bg-gradient-to-r from-amber-300 via-orange-300 to-amber-300 opacity-50" />

            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 120}>
                <div className="relative bg-white/70 backdrop-blur border border-amber-100 rounded-3xl p-8 text-center group hover:shadow-xl hover:shadow-amber-100/60 hover:-translate-y-1 transition-all duration-300">
                  {/* hex bg watermark */}
                  <svg className="absolute top-3 right-3 w-12 h-12 opacity-[0.06]" viewBox="0 0 52 60">
                    <polygon points="13,1 39,1 52,24 39,48 13,48 0,24" fill="none" stroke="#92400E" strokeWidth="2" />
                  </svg>
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-lg shadow-amber-300/40 mb-6 group-hover:scale-105 transition-transform">
                    {s.emoji}
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-amber-200 text-[10px] font-black text-amber-600 flex items-center justify-center leading-none">
                      {s.num}
                    </span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section id="testimonials" className="relative py-28 px-5 overflow-hidden">
        <HexPattern opacity={0.04} id="hex-testi" />
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal className="text-center mb-16">
            <Label>Traveler stories</Label>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mt-4 text-stone-900 leading-tight">
              Loved by wanderers
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="relative bg-white/70 backdrop-blur rounded-3xl p-7 border border-amber-100/80 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/50 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  {/* quote mark */}
                  <div className="text-5xl font-black text-amber-200 leading-none mb-3 select-none">"</div>
                  <p className="text-stone-600 text-sm leading-relaxed flex-1 mb-6">{t.quote}</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-md`}>
                      {t.init}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">{t.name}</p>
                      <p className="text-xs text-stone-400">{t.role}</p>
                    </div>
                    <div className="ml-auto text-amber-400 text-[11px] tracking-widest">★★★★★</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="relative py-28 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/40 to-amber-50/30" />
        <HexPattern opacity={0.04} id="hex-faq" />
        <div className="max-w-2xl mx-auto relative z-10">
          <Reveal className="text-center mb-14">
            <Label color="orange">FAQ</Label>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mt-4 text-stone-900">
              Common questions
            </h2>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <div className={`bg-white/70 backdrop-blur border rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === i ? "border-amber-300 shadow-md shadow-amber-100/50" : "border-amber-100 hover:border-amber-200"}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left group"
                  >
                    <span className={`font-semibold text-sm sm:text-base transition-colors ${openFaq === i ? "text-amber-600" : "text-stone-800 group-hover:text-amber-600"}`}>
                      {f.q}
                    </span>
                    <span className={`ml-4 flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-sm font-bold transition-all duration-300 ${openFaq === i ? "bg-amber-400 border-amber-400 text-white rotate-45" : "border-stone-200 text-stone-400"}`}>
                      +
                    </span>
                  </button>
                  <div style={{ maxHeight: openFaq === i ? "200px" : "0", overflow: "hidden", transition: "max-height 0.35s ease" }}>
                    <p className="px-6 pb-5 text-stone-500 text-sm leading-relaxed border-t border-amber-50 pt-4">{f.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-5 overflow-hidden">
        {/* Rich layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/15 via-orange-300/10 to-amber-500/10" />
        <HexPattern opacity={0.1} id="hex-cta" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-amber-300/25 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        <Reveal className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Floating bee */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-4xl shadow-2xl shadow-amber-400/40 mb-8"
            style={{ animation: "float 3s ease-in-out infinite" }}>
            🐝
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 mb-5 leading-tight">
            Your next adventure<br className="hidden sm:block" /> is waiting.
          </h2>
          <p className="text-stone-500 mb-10 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
            Join thousands of travelers who plan smarter with TaraHive. Free to start, no credit card needed.
          </p>
          <a href="#"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold px-10 py-5 rounded-2xl shadow-2xl shadow-amber-400/40 hover:shadow-amber-400/60 hover:-translate-y-1 transition-all duration-200 text-lg mb-5"
          >
            Create your first trip free
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <p className="text-stone-400 text-xs">No account needed to explore · Takes 30 seconds</p>
        </Reveal>
        <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-amber-100 py-10 px-5 bg-[#FDFAF4]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <a href="#" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm shadow-sm">🐝</div>
              <span className="font-black text-lg tracking-tight text-stone-900">Tara<span className="text-amber-500">Hive</span></span>
            </a>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-stone-400">
              {["Features","How it works","FAQ","Privacy","Terms","Contact"].map((l) => (
                <a key={l} href="#" className="hover:text-amber-600 transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="border-t border-amber-100/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
            <p>© 2025 TaraHive. All rights reserved.</p>
            <p className="flex items-center gap-1">Made with <span className="text-amber-400">♥</span> for explorers everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  );
}