import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Sparkles, FileText, User, Compass, Briefcase, Layers, BarChart2,
  ArrowLeft, RefreshCw, ShieldCheck, AlertCircle, TrendingUp, CheckCircle, XCircle
} from 'lucide-react';
import { resumeAPI, atsAPI } from '../services/api.js';

export default function CompareResumes() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // States
  const [resumes, setResumes] = useState([]);
  const [resumeIdA, setResumeIdA] = useState('');
  const [resumeIdB, setResumeIdB] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchResumes = async () => {
    try {
      const res = await resumeAPI.list();
      setResumes(res.data.resumes || []);
      if (res.data.resumes?.length > 1) {
        setResumeIdA(res.data.resumes[0]._id);
        setResumeIdB(res.data.resumes[1]._id);
      } else if (res.data.resumes?.length > 0) {
        setResumeIdA(res.data.resumes[0]._id);
        setResumeIdB(res.data.resumes[0]._id);
      }
    } catch (e) {
      showToast('error', 'Could not load resumes.');
    }
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!resumeIdA || !resumeIdB) return;
    if (resumeIdA === resumeIdB) {
      showToast('error', 'Please select two different resumes.');
      return;
    }
    setLoading(true);
    try {
      const res = await atsAPI.compare({ resumeIdA, resumeIdB });
      setResult(res.data.comparison);
      showToast('success', 'Comparison complete!');
    } catch (err) {
      showToast('error', 'Comparison analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-[#070b19] flex flex-col justify-between p-6 shrink-0 hidden md:flex">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="h-8 w-8 rounded bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow shadow-violet-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-outfit font-bold text-lg text-white">ResumeForge AI</span>
          </div>

          <nav className="flex flex-col gap-2">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm hover:bg-white/[0.02] transition-all">
              <FileText className="w-4.5 h-4.5" /> Resumes Dashboard
            </Link>
            <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm hover:bg-white/[0.02] transition-all">
              <User className="w-4.5 h-4.5" /> Master Profile
            </Link>
            <Link to="/ai-hub" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm hover:bg-white/[0.02] transition-all">
              <Compass className="w-4.5 h-4.5" /> AI Career Hub
            </Link>
            <Link to="/job-analyzer" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm hover:bg-white/[0.02] transition-all">
              <Briefcase className="w-4.5 h-4.5" /> Job Description Matcher
            </Link>
            <Link to="/compare" className="flex items-center gap-3 px-4 py-2 bg-violet-600/10 text-violet-400 font-semibold rounded-lg text-sm transition-all border border-violet-500/10">
              <Layers className="w-4.5 h-4.5" /> Compare Resumes
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Workspace content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="text-left flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold font-outfit">Compare Resumes</h1>
              <p className="text-slate-400 text-xs mt-1">Audit version differences, strengths, and keywords across draft configurations.</p>
            </div>
          </div>
        </header>

        {/* Compare selector top */}
        <div className="max-w-5xl mt-8">
          <form onSubmit={handleCompare} className="p-6 rounded-xl border border-white/5 bg-[#070b19] grid grid-cols-5 gap-4 items-end">
            <div className="col-span-2 text-left">
              <label className="text-xs text-slate-400">Resume Version A</label>
              <select
                value={resumeIdA}
                onChange={(e) => setResumeIdA(e.target.value)}
                className="w-full px-3 py-1.5 mt-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs focus:outline-none"
              >
                {resumes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
              </select>
            </div>
            
            <div className="col-span-2 text-left">
              <label className="text-xs text-slate-400">Resume Version B</label>
              <select
                value={resumeIdB}
                onChange={(e) => setResumeIdB(e.target.value)}
                className="w-full px-3 py-1.5 mt-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs focus:outline-none"
              >
                {resumes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
              </select>
            </div>

            <button type="submit" disabled={loading} className="col-span-1 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:bg-violet-800 shadow">
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Compare'}
            </button>
          </form>

          {/* Results grid output */}
          {!result ? (
            <div className="p-12 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-500 bg-white/[0.01] mt-8">
              Select two different resume configurations above to audit comparisons.
            </div>
          ) : (
            <div className="flex flex-col gap-6 mt-8">
              {/* Score differences panel */}
              <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 flex items-center justify-between text-left">
                <div>
                  <h3 className="font-bold text-sm text-slate-300">Analysis Verdict</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Resume: {result.resumeBName} compared against {result.resumeAName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="font-bold text-lg text-green-400">+{result.scoreDifference} ATS Points</span>
                </div>
              </div>

              {/* Side-by-side sheets details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* Version A */}
                <div className="p-6 rounded-xl border border-white/5 bg-[#050814] flex flex-col gap-4">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Version A: {result.resumeAName} ({result.resumeAScore} pts)</h4>
                  
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-green-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Strengths:</p>
                    <ul className="list-disc pl-4 text-[10px] text-slate-400 flex flex-col gap-1">
                      {result.strengthsA?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <p className="text-[10px] font-bold text-red-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Weaknesses / gaps:</p>
                    <ul className="list-disc pl-4 text-[10px] text-slate-400 flex flex-col gap-1">
                      {result.weaknessesA?.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Version B */}
                <div className="p-6 rounded-xl border-secondary bg-violet-950/10 border-2 flex flex-col gap-4">
                  <h4 className="font-bold text-xs text-violet-400 uppercase tracking-wider">Version B: {result.resumeBName} ({result.resumeBScore} pts)</h4>
                  
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-green-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Strengths:</p>
                    <ul className="list-disc pl-4 text-[10px] text-slate-400 flex flex-col gap-1">
                      {result.strengthsB?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <p className="text-[10px] font-bold text-red-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Weaknesses / gaps:</p>
                    <ul className="list-disc pl-4 text-[10px] text-slate-400 flex flex-col gap-1">
                      {result.weaknessesB?.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recommendation card bottom */}
              <div className="p-6 rounded-xl border border-violet-500/20 bg-violet-950/20 text-left flex flex-col gap-2">
                <h4 className="font-bold text-xs text-violet-400 flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Forge AI Recommendation</h4>
                <p className="text-xs text-violet-300 leading-relaxed font-light">{result.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Alert toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border shadow-xl text-xs font-semibold ${
          toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
