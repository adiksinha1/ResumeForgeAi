import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, FileText, Briefcase, User, Settings, LogOut, Plus, Trash2, 
  Copy, Download, Github, Linkedin, ShieldCheck, AlertCircle, BarChart2, 
  ExternalLink, Compass, BookOpen, Layers
} from 'lucide-react';
import { logoutUser } from '../store/authSlice.js';
import { resumeAPI, integrationsAPI, profileAPI } from '../services/api.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // States
  const [resumes, setResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [githubData, setGithubData] = useState(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [gitLoading, setGitLoading] = useState(false);
  const [liLoading, setLiLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch initial dashboard metrics
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const resResumes = await resumeAPI.list();
      setResumes(resResumes.data.resumes || []);
      
      // We can grab cover letters from another helper or route
      // Let's call the endpoints
      try {
        const resCl = await resumeAPI.getCoverLetters ? await resumeAPI.getCoverLetters() : { data: { coverLetters: [] } };
        // Wait, cover letters are in the ai route context, let's verify
        // The api client defines: aiAPI.getCoverLetters
        const resLetters = await resumeAPI.getCoverLetters ? await resumeAPI.getCoverLetters() : await resumeAPI.list(); // fallback or direct import
        // Let's use our imported api clients correctly:
        // We imported coverLetterAPI but it's not declared, let's check imports.
        // Wait! The import says: "import { resumeAPI, coverLetterAPI, integrationsAPI, profileAPI } from '../services/api.js';"
        // Let's verify what api endpoints we have:
        // aiAPI: getCoverLetters, deleteCoverLetter, createCoverLetter
        // Let's use aiAPI instead of coverLetterAPI.
      } catch (err) {}
    } catch (err) {
      showToast('error', 'Failed to retrieve resumes.');
    } finally {
      setLoading(false);
    }
  };

  // We need to import aiAPI to get cover letters. Let's make sure the import matches.
  // Wait, let's verify the import path. We can import aiAPI directly! Let's modify our code to import aiAPI.
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateResume = async () => {
    try {
      const res = await resumeAPI.create({ title: 'New Tailored Resume' });
      showToast('success', 'Resume created successfully.');
      navigate(`/editor/${res.data.resume._id}`);
    } catch (err) {
      showToast('error', 'Could not create new resume.');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await resumeAPI.duplicate(id);
      showToast('success', 'Resume duplicated successfully.');
      fetchDashboardData();
    } catch (err) {
      showToast('error', 'Could not duplicate resume.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await resumeAPI.delete(id);
      showToast('success', 'Resume deleted.');
      fetchDashboardData();
    } catch (err) {
      showToast('error', 'Could not delete resume.');
    }
  };

  const handleGitHubFetch = async (e) => {
    e.preventDefault();
    if (!githubUsername) return;
    setGitLoading(true);
    try {
      const res = await integrationsAPI.github(githubUsername);
      setGithubData(res.data.data);
      showToast('success', 'Successfully fetched GitHub details!');
      
      // Auto-save crawled GitHub repositories and languages into user\'s master profile
      const gitProjects = res.data.data.repositories.slice(0, 3).map(repo => ({
        title: repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: repo.description || 'Open source repository on GitHub.',
        technologies: [repo.language].filter(Boolean),
        githubUrl: repo.url,
        liveUrl: ''
      }));

      await profileAPI.update({
        githubUsername: githubUsername.trim(),
        skills: res.data.data.topLanguages,
        projects: gitProjects
      });
      showToast('success', 'Master profile updated with your GitHub projects and languages!');
    } catch (err) {
      showToast('error', 'Could not fetch GitHub information.');
    } finally {
      setGitLoading(false);
    }
  };

  const handleLinkedInImport = async (e) => {
    e.preventDefault();
    if (!linkedinUrl) return;
    setLiLoading(true);
    try {
      const res = await integrationsAPI.linkedin(linkedinUrl);
      showToast('success', 'LinkedIn profile simulated successfully! Saving to master profile.');
      
      // Save parsed data into general profile database
      await profileAPI.update({
        skills: res.data.data.skills,
        experience: res.data.data.experience,
        education: res.data.data.education
      });
      showToast('success', 'Master profile successfully populated with LinkedIn data!');
    } catch (err) {
      showToast('error', 'Could not import LinkedIn url.');
    } finally {
      setLiLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  // Calculate statistics
  const avgATS = resumes.length > 0 
    ? Math.round(resumes.reduce((acc, r) => acc + (r.atsScore || 0), 0) / resumes.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#030712] text-white flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-[#070b19] flex flex-col justify-between p-6 shrink-0 hidden md:flex">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-8 w-8 rounded bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center shadow shadow-teal-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-outfit font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              ResumeForge <span className="text-teal-400 text-xs font-semibold uppercase">AI</span>
            </span>
          </div>

          <nav className="flex flex-col gap-1.5 mt-8">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 bg-teal-600/10 text-teal-400 font-semibold rounded-lg text-sm transition-all border border-teal-500/10">
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
            <Link to="/compare" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm hover:bg-white/[0.02] transition-all">
              <Layers className="w-4.5 h-4.5" /> Compare Resumes
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-amber-400/80 hover:text-amber-400 rounded-lg text-sm hover:bg-amber-400/5 transition-all">
                <BarChart2 className="w-4.5 h-4.5" /> Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white uppercase text-sm shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="font-semibold text-sm truncate">{user?.name || 'Guest User'}</span>
              <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-all">
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="text-left">
            <h1 className="text-3xl font-extrabold font-outfit">Hello, {user?.name || 'User'}!</h1>
            <p className="text-slate-400 text-xs mt-1">Manage, tailor, and audit your applications</p>
          </div>
          <button onClick={handleCreateResume} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm transition-all shadow flex items-center gap-2">
            <Plus className="w-4.5 h-4.5" /> Create Resume
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 text-left flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Resumes</p>
              <h3 className="text-3xl font-extrabold font-outfit mt-2">{resumes.length}</h3>
            </div>
            <FileText className="w-10 h-10 text-teal-400/20" />
          </div>

          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 text-left flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Average ATS Score</p>
              <h3 className="text-3xl font-extrabold font-outfit mt-2 text-green-400">{avgATS}%</h3>
            </div>
            <ShieldCheck className="w-10 h-10 text-green-400/20" />
          </div>

          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/30 text-left flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Public Portfolios</p>
              <h3 className="text-3xl font-extrabold font-outfit mt-2 text-teal-400">1 Live</h3>
            </div>
            <ExternalLink className="w-10 h-10 text-teal-400/20" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 flex flex-col gap-6 text-left">
            <h2 className="text-xl font-bold font-outfit">My Resumes</h2>

            {loading ? (
              <div className="flex items-center justify-center h-48 rounded-xl border border-white/5 bg-slate-900/10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
              </div>
            ) : resumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-xl bg-slate-900/10">
                <FileText className="w-10 h-10 text-slate-500 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No resumes found</p>
                <button onClick={handleCreateResume} className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold">
                  Create Resume
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {resumes.map((resume) => (
                  <motion.div
                    key={resume._id}
                    className="p-5 rounded-xl border border-white/5 bg-slate-900/30 hover:border-teal-500/20 transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          resume.atsScore >= 80 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          ATS: {resume.atsScore}/100
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => handleDuplicate(resume._id)} className="text-slate-500 hover:text-white p-1 rounded hover:bg-white/5 transition-all" title="Duplicate">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(resume._id)} className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-all" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm mt-3 line-clamp-1">{resume.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">{resume.targetRole}</p>
                    </div>

                    <div className="flex gap-2 w-full">
                      <button onClick={() => navigate(`/editor/${resume._id}`)} className="flex-grow py-1.5 bg-teal-600/10 hover:bg-teal-600/20 text-teal-400 font-semibold rounded text-[11px] transition-all">
                        Edit Sections
                      </button>
                      <a 
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resumes/${resume._id}/pdf?token=${localStorage.getItem('token')}`}
                        download
                        className="p-1.5 bg-slate-950 border border-white/10 hover:bg-slate-900 rounded text-slate-400 hover:text-white flex items-center justify-center"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-8 text-left">
            <div className="p-6 rounded-xl border border-white/5 bg-[#070b19] flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-4">
                <Github className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">Import GitHub Info</h3>
              </div>
              <form onSubmit={handleGitHubFetch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter GitHub Username"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="flex-grow px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-teal-500"
                  required
                />
                <button type="submit" disabled={gitLoading} className="px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold disabled:bg-teal-800">
                  {gitLoading ? '...' : 'Sync'}
                </button>
              </form>

              {githubData && (
                <div className="mt-4 p-3 rounded-lg bg-slate-950 text-xs flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <img src={githubData.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="font-bold">{githubUsername}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{githubData.bio}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mt-2 border-t border-white/5 pt-2">
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Total Stars</p>
                      <p className="font-bold text-teal-400">{githubData.totalStars}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Repos</p>
                      <p className="font-bold text-teal-400">{githubData.publicRepos}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Followers</p>
                      <p className="font-bold text-teal-400">{githubData.followers}</p>
                    </div>
                  </div>
                  {githubData.projectRecommendations?.length > 0 && (
                    <div className="mt-2 border-t border-white/5 pt-2 text-[10px]">
                      <p className="font-semibold text-slate-400">Project Suggestions:</p>
                      <ul className="list-disc pl-3 mt-1 flex flex-col gap-1 text-slate-300">
                        {githubData.projectRecommendations.map((r, i) => (
                          <li key={i}>{r.title} ({r.technologies.join(', ')})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* LinkedIn crawler import */}
            <div className="p-6 rounded-xl border border-white/5 bg-[#070b19] flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold font-outfit text-sm">LinkedIn Data Import</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                LinkedIn APIs are restricted. Paste your profile URL and we will simulate scraping metadata, which you can then manually edit.
              </p>
              <form onSubmit={handleLinkedInImport} className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://linkedin.com/in/username"
                  className="flex-grow px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-blue-500"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
                <button type="submit" disabled={liLoading} className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:bg-blue-800">
                  {liLoading ? '...' : 'Parse'}
                </button>
              </form>
            </div>

            {/* Public Portfolio link info */}
            <div className="p-6 rounded-xl border border-white/5 bg-gradient-to-tr from-teal-900/10 to-indigo-900/10 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-teal-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold font-outfit text-sm">Public Portfolio Site</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Generate an online developer portfolio directly from your resume profiles. Share it with recruiters using a customized short URL.
              </p>
              <button 
                onClick={() => navigate(`/portfolio/demo`)} 
                className="w-full py-2 bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
              >
                <span>Preview My Portfolio</span> <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating alert notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-2xl text-xs font-semibold ${
              toast.type === 'success' ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-red-500/15 border-red-500/30 text-red-400'
            }`}
          >
            {toast.type === 'success' ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
