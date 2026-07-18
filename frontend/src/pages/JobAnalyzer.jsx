import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Sparkles, FileText, User, Compass, Briefcase, Layers, BarChart2,
  ArrowLeft, RefreshCw, ShieldCheck, AlertTriangle, Eye, ArrowRight
} from 'lucide-react';
import { resumeAPI, atsAPI } from '../services/api.js';

export default function JobAnalyzer() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // States
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
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
      if (res.data.resumes?.length > 0) {
        setSelectedResumeId(res.data.resumes[0]._id);
      }
    } catch (e) {
      showToast('error', 'Could not load resumes.');
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !jobDescription) return;
    setLoading(true);
    try {
      const res = await atsAPI.scan(selectedResumeId, { jobDescriptionText: jobDescription });
      setReport(res.data.report);
      showToast('success', 'Job description analyzed successfully!');
    } catch (err) {
      showToast('error', 'Analysis failed.');
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
            <Link to="/job-analyzer" className="flex items-center gap-3 px-4 py-2 bg-violet-600/10 text-violet-400 font-semibold rounded-lg text-sm transition-all border border-violet-500/10">
              <Briefcase className="w-4.5 h-4.5" /> Job Description Matcher
            </Link>
            <Link to="/compare" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm hover:bg-white/[0.02] transition-all">
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
              <h1 className="text-3xl font-extrabold font-outfit">Job Description Matcher</h1>
              <p className="text-slate-400 text-xs mt-1">Audit, score, and optimize your resume against actual vacancy announcements.</p>
            </div>
          </div>
        </header>

        {/* Dynamic split view */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8 text-left">
          {/* Paste panel left */}
          <form onSubmit={handleAnalyze} className="lg:col-span-2 p-6 rounded-xl border border-white/5 bg-[#070b19] flex flex-col gap-4 self-start">
            <h3 className="font-bold text-sm text-violet-400">Match Auditor Input</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Select Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-slate-950 border border-white/10 text-xs focus:outline-none"
              >
                {resumes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Target Vacancy Description</label>
              <textarea
                placeholder="Paste the full job post details, key technologies, and minimum requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                className="w-full p-3 rounded bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-violet-500 font-sans"
                required
              />
            </div>

            <button type="submit" disabled={loading || !selectedResumeId} className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 disabled:bg-violet-800 shadow">
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Run ATS Match Auditor'}
            </button>
          </form>

          {/* Results panel right */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <h3 className="font-bold text-sm text-slate-300">Auditing Reports</h3>

            {!report ? (
              <div className="p-12 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-500 bg-white/[0.01]">
                Complete the left forms to compute ATS keyword alignment scores.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Score gauge card */}
                <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base text-slate-300">Overall Alignment Score</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Estimated ATS compatibility index based on keyword matching</p>
                  </div>
                  <div className={`h-16 w-16 rounded-full border-4 border-t-transparent flex items-center justify-center text-lg font-bold ${
                    report.overallScore >= 80 ? 'border-green-500 text-green-400' : 'border-yellow-500 text-yellow-400'
                  }`}>
                    {report.overallScore}%
                  </div>
                </div>

                {/* Subsections: Keywords */}
                <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 flex flex-col gap-3">
                  <h4 className="font-bold text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Missing Core Keywords</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Automated resume screenings will immediately flag profiles lacking these specific technologies and skill descriptors.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {report.missingKeywords?.length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic">No missing keywords found! Excellent density.</span>
                    ) : (
                      report.missingKeywords?.map((k, i) => (
                        <span key={i} className="bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded text-[10px] text-red-400">{k}</span>
                      ))
                    )}
                  </div>
                </div>

                {/* Weak bullet audits */}
                <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 flex flex-col gap-3">
                  <h4 className="font-bold text-xs text-yellow-400 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Action Metric Suggestions</h4>
                  <div className="flex flex-col gap-3">
                    {report.weakBulletPoints?.map((wb, i) => (
                      <div key={i} className="border-t border-white/5 pt-2 first:border-none first:pt-0 text-[11px] flex flex-col gap-1">
                        <p className="text-slate-500 italic">"{wb.original}"</p>
                        <p className="text-slate-200 font-medium flex items-center gap-1">
                          <ArrowRight className="w-3.5 h-3.5 text-violet-400 shrink-0" /> {wb.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formatting */}
                <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 flex flex-col gap-3">
                  <h4 className="font-bold text-xs text-blue-400">Layout Formatting Flags</h4>
                  <ul className="list-disc pl-4 text-xs text-slate-400 flex flex-col gap-1">
                    {report.formattingIssues?.map((fi, i) => <li key={i}>{fi}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
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
