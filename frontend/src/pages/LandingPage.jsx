import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, FileText, Cpu, Github, Linkedin, ArrowRight, ShieldCheck, Zap, HelpCircle, User, Star } from 'lucide-react';
import { demoLoginUser } from '../store/authSlice.js';
import LiveBackground from '../components/LiveBackground.jsx';

export default function LandingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activeFaq, setActiveFaq] = useState(null);

  const handleDemoAccess = async () => {
    const res = await dispatch(demoLoginUser());
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const faqItems = [
    { q: 'How does the ATS Scanner evaluate my resume?', a: 'Our engine uses Gemini model tokens to parse and rank your resume against real-world ATS filter criteria. It checks for grammar errors, formatting issues, skill duplicates, and compares keyword density with your target roles.' },
    { q: 'Can I import data from my LinkedIn or GitHub profile?', a: 'Yes! Simply enter your GitHub username to parse your top repositories, languages, stars, and contribution summaries. For LinkedIn, paste your profile URL to populate and edit your details in minutes.' },
    { q: 'What kind of resume templates do you provide?', a: 'We offer 10 curated, 100% ATS-compliant styles, ranging from professional standards like Google, Stripe, and Microsoft templates to minimal developers and startup designs.' },
    { q: 'Can I export my resume as PDF or Microsoft Word DOCX?', a: 'Absolutely. We support dual downloads: high-fidelity Puppeteer PDF sheets matching exact margins and standard XML-formatted DOCX documents.' }
  ];

  return (
    <div className="min-h-screen bg-[#060b13] text-white selection:bg-teal-600/30 overflow-x-hidden relative">
      {/* Live wallpaper background */}
      <LiveBackground />

      {/* Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 bg-[#080f1e]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            ResumeForge <span className="text-teal-400 text-sm font-semibold uppercase">AI</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#templates" className="hover:text-white transition-colors">Templates</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button onClick={() => navigate('/dashboard')} className="px-5 py-2 rounded-lg bg-white text-black font-semibold hover:bg-slate-200 transition-all shadow-md text-sm flex items-center gap-2">
              <User className="h-4 w-4" /> Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </button>
              <button onClick={handleDemoAccess} disabled={loading} className="hidden sm:flex px-4 py-2 rounded-lg border border-teal-500/30 hover:border-teal-500/80 text-teal-400 font-medium transition-all text-sm bg-teal-950/20">
                {loading ? 'Entering...' : 'Try Demo Mode'}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-8"
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Next-Gen AI Resume Architect
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-outfit text-5xl md:text-7xl font-extrabold max-w-4xl tracking-tight leading-tight"
        >
          Build resumes that pass the ATS. <br />
          <span className="text-gradient">Engineered by AI.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-slate-400 text-lg md:text-xl max-w-2xl font-light leading-relaxed"
        >
          Inject GitHub and LinkedIn data to compile tailored resumes, analyze missing keywords against job descriptions, and pass ATS filters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <button onClick={() => navigate('/register')} className="px-8 py-3.5 rounded-lg bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 font-semibold text-white shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
            Build My Resume <ArrowRight className="h-5 w-5" />
          </button>
          <button onClick={handleDemoAccess} disabled={loading} className="px-8 py-3.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 transition-all font-semibold flex items-center gap-2">
            Explore Demo Persona
          </button>
        </motion.div>

        {/* Animated Resume Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 w-full max-w-5xl rounded-xl border border-white/10 bg-slate-900/60 p-4 shadow-2xl relative"
        >
          {/* Editor Header Bar Mock */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 text-xs text-slate-500 mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/70"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/70"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/70"></span>
              <span className="ml-2 font-code bg-white/5 px-2 py-0.5 rounded text-[10px]">resumeforge-editor</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Live ATS: 92/100</span>
              <span className="text-cyan-400 flex items-center gap-1 font-semibold"><Sparkles className="w-3 h-3 animate-spin" /> Suggesting keywords...</span>
            </div>
          </div>
          
          {/* Graphic mockup details */}
          <div className="grid grid-cols-3 gap-4 h-[350px] overflow-hidden">
            {/* Left controls mockup */}
            <div className="col-span-1 border-r border-white/5 pr-4 flex flex-col gap-3 text-left">
              <div className="h-6 w-3/4 bg-white/10 rounded"></div>
              <div className="h-10 w-full bg-white/5 rounded border border-white/10 p-2 text-[10px] text-slate-400">Target Role: Software Engineer</div>
              <div className="h-24 w-full bg-teal-950/20 border border-teal-500/20 rounded p-2 text-[10px] text-teal-300">
                <p className="font-semibold mb-1">AI Recommendation:</p>
                Add "Redis caching" and "API Rate Limiter" to optimize profile for backend requirements.
              </div>
              <div className="h-16 w-full bg-white/5 rounded flex items-center justify-center text-[11px] text-slate-500 border border-dashed border-white/10">
                + Drag Experience Here
              </div>
            </div>
            
            {/* Right page preview mockup */}
            <div className="col-span-2 bg-white text-slate-800 p-8 rounded-lg shadow-inner text-left font-sans flex flex-col gap-4">
              <div className="border-b-2 border-slate-800 pb-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">ALEX MERCER</h3>
                <p className="text-[10px] text-slate-500">alex@resumeforge.ai | +1 (555) 019-2834 | San Francisco, CA</p>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-[10px] font-bold text-teal-600 tracking-wider uppercase">PROFESSIONAL EXPERIENCE</h4>
                <div className="h-1 bg-slate-200"></div>
                <div className="flex justify-between text-[11px] font-semibold mt-1">
                  <span>Software Engineer II &bull; Stripe</span>
                  <span className="text-[10px] font-normal text-slate-400">2024 – Present</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed font-light mt-1 pl-2 border-l border-teal-500">
                  &bull; Refactored dashboard Checkout components, cuttingmedian checkout latency by 120ms with Redis.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-center">
          Packed with production features. <br />
          <span className="text-slate-400">No mock buttons, everything works.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 hover:border-teal-500/30 hover:bg-slate-900/50 transition-all flex flex-col gap-4">
            <div className="h-10 w-10 rounded-lg bg-teal-600/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">ATS Optimization Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Computes formatting metrics, scans readability indices, flags skill duplicates, and scores keyword density matches.</p>
          </div>

          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 hover:border-cyan-500/30 hover:bg-slate-900/50 transition-all flex flex-col gap-4">
            <div className="h-10 w-10 rounded-lg bg-cyan-600/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">Gemini AI Assistant</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Instantly tailors bullet points, summarizes career objectives, compiles cover letters, and suggests salary bands.</p>
          </div>

          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 hover:border-rose-500/30 hover:bg-slate-900/50 transition-all flex flex-col gap-4">
            <div className="h-10 w-10 rounded-lg bg-rose-600/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
              <Github className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">GitHub Sync integration</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Parses repository languages, commits activity, stars, and recommends the best items to show on your resume.</p>
          </div>

          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 hover:border-amber-500/30 hover:bg-slate-900/50 transition-all flex flex-col gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-600/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Terminal className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">Portfolio Generator</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Creates a public shareable portfolio website featuring your bio, achievements, GitHub repositories, and resume download link.</p>
          </div>
        </div>
      </section>

      {/* Templates section */}
      <section id="templates" className="py-24 px-6 bg-slate-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6 text-left">
            <h2 className="font-outfit text-3xl md:text-4xl font-extrabold">10 Handcrafted ATS Templates</h2>
            <p className="text-slate-400 leading-relaxed">
              We offer multiple classic, elegant, or developer-focused formats. Set fonts, modify primary shades, configure margins, and change spacing settings with instant live updates on screen.
            </p>
            <div className="flex flex-col gap-3 font-semibold text-slate-300">
              <div className="flex items-center gap-2"><Zap className="text-teal-500 w-4 h-4" /> Google, Microsoft, and Stripe Styles</div>
              <div className="flex items-center gap-2"><Zap className="text-teal-500 w-4 h-4" /> Executive Serif and Elegant Layouts</div>
              <div className="flex items-center gap-2"><Zap className="text-teal-500 w-4 h-4" /> Developer Monospace and Minimal Formats</div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="p-4 rounded bg-white text-slate-800 text-[8px] flex flex-col gap-2 shadow-xl border border-white/10 hover:scale-105 transition-all">
              <div className="border-b pb-1 font-bold text-slate-900 uppercase">Google Style</div>
              <div className="h-4 bg-slate-200 w-full rounded"></div>
              <div className="h-2 bg-slate-100 w-3/4 rounded"></div>
              <div className="h-2 bg-slate-100 w-5/6 rounded"></div>
            </div>
            <div className="p-4 rounded bg-[#f8fafc] text-slate-800 text-[8px] flex flex-col gap-2 shadow-xl border border-white/10 hover:scale-105 transition-all">
              <div className="border-b pb-1 font-bold text-slate-900 uppercase font-code">Developer style</div>
              <div className="h-4 bg-slate-200 w-full rounded"></div>
              <div className="h-2 bg-slate-100 w-3/4 rounded"></div>
              <div className="h-2 bg-slate-100 w-5/6 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 max-w-6xl mx-auto border-t border-white/5 text-center">
        <h2 className="font-outfit text-3xl md:text-4xl font-extrabold">Predictable, transparent pricing</h2>
        <p className="text-slate-400 mt-4">Start designing for free, upgrade when you need to tailormake unlimited resumes.</p>
        
        <div className="flex justify-center items-center gap-4 mt-8">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
          <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className="w-12 h-6 rounded-full bg-teal-600 p-1 flex items-center transition-all">
            <span className={`w-4 h-4 rounded-full bg-white transition-all transform ${billingCycle === 'yearly' ? 'translate-x-6' : ''}`}></span>
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white font-semibold' : 'text-slate-500'}`}>Yearly <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded">Save 20%</span></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
          {/* Tier 1 */}
          <div className="p-8 rounded-2xl border border-white/5 bg-slate-900/25 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xl text-slate-300">Basic Tier</h3>
              <p className="text-xs text-slate-500 mt-1">Perfect for a single application</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
              <ul className="mt-8 flex flex-col gap-3 text-sm text-slate-400">
                <li className="flex items-center gap-2">&bull; 1 Active Resume Draft</li>
                <li className="flex items-center gap-2">&bull; Basic Heuristic ATS Scanner</li>
                <li className="flex items-center gap-2">&bull; Standard PDF Download</li>
              </ul>
            </div>
            <button onClick={() => navigate('/register')} className="mt-8 w-full py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all text-sm font-semibold">
              Get Started
            </button>
          </div>

          {/* Tier 2 (Pro) */}
          <div className="p-8 rounded-2xl border-2 border-teal-500 bg-slate-900/60 flex flex-col justify-between relative shadow-lg shadow-teal-500/10">
            <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Most Popular</span>
            <div>
              <h3 className="font-bold text-xl text-white">Forge Pro</h3>
              <p className="text-xs text-slate-400 mt-1">For active job hunters</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{billingCycle === 'monthly' ? '$9' : '$7'}</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <ul className="mt-8 flex flex-col gap-3 text-sm text-slate-300">
                <li className="flex items-center gap-2">&bull; Unlimited Resumes & Versions</li>
                <li className="flex items-center gap-2">&bull; Unlimited Gemini AI Generations</li>
                <li className="flex items-center gap-2">&bull; Complete ATS Scanner Report</li>
                <li className="flex items-center gap-2">&bull; GitHub & LinkedIn Sync</li>
                <li className="flex items-center gap-2">&bull; Live Portfolios Website</li>
              </ul>
            </div>
            <button onClick={() => navigate('/register')} className="mt-8 w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 transition-all text-sm font-semibold text-white shadow shadow-teal-500/20">
              Go Pro Now
            </button>
          </div>

          {/* Tier 3 */}
          <div className="p-8 rounded-2xl border border-white/5 bg-slate-900/25 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xl text-slate-300">Enterprise</h3>
              <p className="text-xs text-slate-500 mt-1">For placement teams & bootcamps</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$29</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <ul className="mt-8 flex flex-col gap-3 text-sm text-slate-400">
                <li className="flex items-center gap-2">&bull; Admin Console Controls</li>
                <li className="flex items-center gap-2">&bull; Bulk PDF Exporter</li>
                <li className="flex items-center gap-2">&bull; Dedicated API Endpoints</li>
                <li className="flex items-center gap-2">&bull; 24/7 SLA Support</li>
              </ul>
            </div>
            <button onClick={() => navigate('/register')} className="mt-8 w-full py-2.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all text-sm font-semibold">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto border-t border-white/5">
        <h2 className="font-outfit text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border border-white/5 bg-slate-900/20 rounded-xl overflow-hidden">
              <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full p-5 text-left font-semibold text-sm flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <span>{item.q}</span>
                <HelpCircle className={`h-4.5 w-4.5 text-slate-400 transform transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeFaq === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="p-5 pt-0 text-slate-400 text-xs leading-relaxed border-t border-white/5 bg-slate-950/20">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#02050e] py-12 px-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-teal-600 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold font-outfit text-white">ResumeForge AI</span>
          </div>
          <p>&copy; 2026 ResumeForge AI. All rights reserved. Built for modern software engineers.</p>
          <div className="flex gap-4 text-slate-400">
            <Github className="w-4 h-4 hover:text-white cursor-pointer" />
            <Linkedin className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}
