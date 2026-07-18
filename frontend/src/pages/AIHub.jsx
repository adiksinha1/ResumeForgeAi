import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Sparkles, User, FileText, Compass, Briefcase, Layers, BarChart2,
  HelpCircle, ChevronRight, Copy, Trash2, ArrowLeft, RefreshCw, Eye, BookOpen
} from 'lucide-react';
import { aiAPI, resumeAPI } from '../services/api.js';

export default function AIHub() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // States
  const [activeSubTab, setActiveSubTab] = useState('roadmap');
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // 1. Roadmap state
  const [targetRole, setTargetRole] = useState('DevOps Engineer');
  const [roadmapSteps, setRoadmapSteps] = useState([]);

  // 2. Mock Interview state
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [interviewPrep, setInterviewPrep] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  // 3. Cover Letters state
  const [coverLetters, setCoverLetters] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [clRoleName, setClRoleName] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [activeLetter, setActiveLetter] = useState(null); // letter view detail

  useEffect(() => {
    fetchResumesAndLetters();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchResumesAndLetters = async () => {
    try {
      const res = await resumeAPI.list();
      setResumes(res.data.resumes || []);
      if (res.data.resumes?.length > 0) {
        setSelectedResumeId(res.data.resumes[0]._id);
      }
      
      const resCl = await aiAPI.getCoverLetters();
      setCoverLetters(resCl.data.coverLetters || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await aiAPI.careerRoadmap({ role: targetRole, skills: ['React', 'Docker'] });
      setRoadmapSteps(res.data.roadmap || []);
      showToast('success', 'AI Roadmap compiled!');
    } catch (err) {
      showToast('error', 'Roadmap calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInterview = async () => {
    if (!selectedResumeId) return;
    setLoading(true);
    try {
      const res = await aiAPI.interviewPrep({ resumeId: selectedResumeId });
      setInterviewPrep(res.data.questions);
      setRevealedAnswers({});
      showToast('success', 'Mock questions generated!');
    } catch (err) {
      showToast('error', 'Could not generate interview prep questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !companyName || !clRoleName) return;
    setLoading(true);
    try {
      const res = await aiAPI.createCoverLetter({
        companyName,
        roleName: clRoleName,
        resumeId: selectedResumeId,
        jobDescription: jobDescriptionText
      });
      showToast('success', 'Cover letter generated and saved!');
      
      // Reset forms & fetch
      setCompanyName('');
      setClRoleName('');
      setJobDescriptionText('');
      fetchResumesAndLetters();
    } catch (err) {
      showToast('error', 'AI cover letter generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCl = async (id) => {
    if (!window.confirm('Delete this cover letter permanently?')) return;
    try {
      await aiAPI.deleteCoverLetter(id);
      showToast('success', 'Cover letter deleted.');
      fetchResumesAndLetters();
      if (activeLetter?._id === id) setActiveLetter(null);
    } catch (err) {
      showToast('error', 'Delete operation failed.');
    }
  };

  const toggleRevealAnswer = (key, idx) => {
    const idString = `${key}-${idx}`;
    setRevealedAnswers(prev => ({
      ...prev,
      [idString]: !prev[idString]
    }));
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
            <Link to="/ai-hub" className="flex items-center gap-3 px-4 py-2 bg-violet-600/10 text-violet-400 font-semibold rounded-lg text-sm transition-all border border-violet-500/10">
              <Compass className="w-4.5 h-4.5" /> AI Career Hub
            </Link>
            <Link to="/job-analyzer" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm hover:bg-white/[0.02] transition-all">
              <Briefcase className="w-4.5 h-4.5" /> Job Description Matcher
            </Link>
            <Link to="/compare" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm hover:bg-white/[0.02] transition-all">
              <Layers className="w-4.5 h-4.5" /> Compare Resumes
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Hub workspace */}
      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="text-left flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold font-outfit">AI Career Hub</h1>
              <p className="text-slate-400 text-xs mt-1">Unlock customized career roadmaps, mock questions, and cover letters.</p>
            </div>
          </div>
        </header>

        {/* Tab Subselectors */}
        <div className="flex gap-4 border-b border-white/5 mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <button onClick={() => setActiveSubTab('roadmap')} className={`pb-3 border-b-2 ${activeSubTab === 'roadmap' ? 'border-violet-500 text-white' : 'border-transparent hover:text-white'}`}>
            Career Roadmap
          </button>
          <button onClick={() => setActiveSubTab('interview')} className={`pb-3 border-b-2 ${activeSubTab === 'interview' ? 'border-violet-500 text-white' : 'border-transparent hover:text-white'}`}>
            Mock Interview
          </button>
          <button onClick={() => setActiveSubTab('coverletter')} className={`pb-3 border-b-2 ${activeSubTab === 'coverletter' ? 'border-violet-500 text-white' : 'border-transparent hover:text-white'}`}>
            Cover Letters
          </button>
        </div>

        {/* Contents */}
        <div className="mt-8 text-left">
          {/* TAB 1: ROADMAP */}
          {activeSubTab === 'roadmap' && (
            <div className="max-w-4xl flex flex-col gap-6">
              <form onSubmit={handleGenerateRoadmap} className="flex gap-3 bg-slate-900/10 border border-white/5 p-4 rounded-xl items-end">
                <div className="flex-grow">
                  <label className="text-xs text-slate-400 font-medium">Target Role Title</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-4 py-2 mt-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 disabled:bg-violet-800">
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Generate Career Steps'}
                </button>
              </form>

              {roadmapSteps.length > 0 && (
                <div className="flex flex-col gap-6 relative pl-6 border-l border-violet-500/30">
                  {roadmapSteps.map((step, idx) => (
                    <div key={idx} className="relative bg-slate-900/10 border border-white/5 p-5 rounded-xl flex flex-col gap-3">
                      <span className="absolute -left-9 top-5 h-6 w-6 rounded-full bg-violet-600 border border-[#030712] flex items-center justify-center text-xs font-bold font-code">
                        {step.step}
                      </span>
                      <h4 className="font-bold text-sm text-violet-400">{step.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {step.skillsToLearn?.map((s, i) => (
                          <span key={i} className="bg-slate-950 border border-white/5 px-2 py-0.5 rounded text-[10px] text-slate-300 font-medium">{s}</span>
                        ))}
                      </div>

                      {step.resources?.length > 0 && (
                        <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> Resources: {step.resources.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERVIEW */}
          {activeSubTab === 'interview' && (
            <div className="max-w-4xl flex flex-col gap-6">
              <div className="bg-slate-900/10 border border-white/5 p-5 rounded-xl flex items-end gap-3 justify-between">
                <div className="flex-grow max-w-sm">
                  <label className="text-xs text-slate-400 font-medium">Select Resume Context</label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-3 py-1.5 mt-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs focus:outline-none"
                  >
                    {resumes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
                  </select>
                </div>
                <button onClick={handleGenerateInterview} disabled={loading || !selectedResumeId} className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow disabled:bg-violet-800">
                  {loading ? 'Analyzing...' : 'Generate Mock Prep'}
                </button>
              </div>

              {interviewPrep && (
                <div className="flex flex-col gap-8">
                  {Object.keys(interviewPrep).map((category) => (
                    <div key={category} className="flex flex-col gap-4">
                      <h3 className="font-bold text-sm text-violet-400 capitalize border-b border-white/5 pb-1 tracking-wide">
                        {category === 'hr' ? 'HR / Behavioral Intro' : category === 'coding' ? 'DSA / Coding logic' : `${category} Scenarios`}
                      </h3>
                      <div className="flex flex-col gap-3">
                        {interviewPrep[category].map((item, idx) => {
                          const idString = `${category}-${idx}`;
                          const isRevealed = revealedAnswers[idString] === true;
                          return (
                            <div key={idx} className="bg-slate-900/10 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                              <p className="font-semibold text-xs leading-relaxed">Q: {item.question}</p>
                              
                              <button onClick={() => toggleRevealAnswer(category, idx)} className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 mr-auto font-medium">
                                <Eye className="w-3.5 h-3.5" /> {isRevealed ? 'Hide Answer' : 'Show Answer'}
                              </button>

                              {isRevealed && (
                                <p className="text-[10px] leading-relaxed text-slate-400 bg-slate-950 p-2.5 rounded border border-white/5 mt-1">
                                  {item.suggestedAnswer}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COVER LETTERS */}
          {activeSubTab === 'coverletter' && (
            <div className="max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Creator panel left */}
              <div className="md:col-span-1 p-6 rounded-xl border border-white/5 bg-[#070b19] flex flex-col gap-4 self-start">
                <h3 className="font-bold text-sm text-violet-400">Generate Cover Letter</h3>
                <form onSubmit={handleGenerateCoverLetter} className="flex flex-col gap-3 text-xs">
                  <div>
                    <label className="text-slate-400">Target Resume</label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10"
                    >
                      {resumes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400">Company Name</label>
                    <input
                      type="text"
                      placeholder="Stripe"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400">Job Role Title</label>
                    <input
                      type="text"
                      placeholder="Backend Engineer"
                      value={clRoleName}
                      onChange={(e) => setClRoleName(e.target.value)}
                      className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400">Job Description (Optional)</label>
                    <textarea
                      placeholder="Paste description requirements..."
                      value={jobDescriptionText}
                      onChange={(e) => setJobDescriptionText(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10 font-sans"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-2 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded flex items-center justify-center gap-1.5 disabled:bg-violet-800">
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Compile Letter'}
                  </button>
                </form>
              </div>

              {/* Lists and viewer right */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <h3 className="font-bold text-sm text-slate-300">Saved Cover Letters ({coverLetters.length})</h3>
                
                {coverLetters.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-500 bg-white/[0.01]">
                    No cover letters created yet. Complete the left panel to compile one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coverLetters.map((cl) => (
                      <div key={cl._id} className="p-4 rounded-xl border border-white/5 bg-slate-900/30 flex flex-col justify-between gap-3 text-xs">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-violet-400">{cl.companyName}</span>
                            <button onClick={() => handleDeleteCl(cl._id)} className="text-slate-500 hover:text-red-400 p-0.5" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <h4 className="font-bold mt-1 line-clamp-1">{cl.roleName}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{cl.subject}</p>
                        </div>
                        <button 
                          onClick={() => setActiveLetter(cl)}
                          className="w-full py-1 bg-slate-950 hover:bg-slate-900 border border-white/5 text-[10px] text-slate-300 rounded font-semibold transition-colors"
                        >
                          View Letter Content
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Cover Letter Viewer Modal */}
      {activeLetter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#070b19] border border-white/10 p-6 rounded-2xl flex flex-col gap-4 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="font-bold text-sm text-violet-400">{activeLetter.companyName} &bull; {activeLetter.roleName}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{activeLetter.subject}</p>
              </div>
              <button onClick={() => {
                navigator.clipboard.writeText(activeLetter.body);
                showToast('success', 'Cover letter copied to clipboard!');
              }} className="px-3 py-1 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/10 rounded text-[10px] font-semibold transition-colors flex items-center gap-1">
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <div className="max-h-[350px] overflow-y-auto bg-slate-950 p-4 rounded-lg border border-white/5 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {activeLetter.body}
            </div>
            <button onClick={() => setActiveLetter(null)} className="ml-auto px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

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
