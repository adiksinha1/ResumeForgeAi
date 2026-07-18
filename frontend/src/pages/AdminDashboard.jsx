import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, FileText, User, Compass, Briefcase, Layers, BarChart2,
  ArrowLeft, RefreshCw, Trash2, Database, Zap, Cpu, Activity, ShieldCheck
} from 'lucide-react';
import { adminAPI } from '../services/api.js';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // States
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAdminDetails();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAdminDetails = async () => {
    setLoading(true);
    try {
      const resStats = await adminAPI.stats();
      setStats(resStats.data.stats);
      
      const resUsers = await adminAPI.users();
      setUsers(resUsers.data.users || []);

      const resUsage = await adminAPI.apiUsage();
      setUsage(resUsage.data.usage);
    } catch (err) {
      showToast('error', 'Failed to retrieve administrative details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user profile? This cleans up all resumes and cover letters.')) return;
    setActionLoading(true);
    try {
      await adminAPI.deleteUser(id);
      showToast('success', 'User profile deleted.');
      fetchAdminDetails();
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Could not delete user profile.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <p className="text-slate-400">Loading admin console...</p>
        </div>
      </div>
    );
  }

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
            <Link to="/compare" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm hover:bg-white/[0.02] transition-all">
              <Layers className="w-4.5 h-4.5" /> Compare Resumes
            </Link>
            <Link to="/admin" className="flex items-center gap-3 px-4 py-2 bg-violet-600/10 text-violet-400 font-semibold rounded-lg text-sm transition-all border border-violet-500/10">
              <BarChart2 className="w-4.5 h-4.5" /> Admin Dashboard
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Administrative console */}
      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="text-left flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold font-outfit">Admin Panel</h1>
              <p className="text-slate-400 text-xs mt-1">Audit SaaS platform registrations, databases, and Gemini AI tokens usage.</p>
            </div>
          </div>
          <button onClick={fetchAdminDetails} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </header>

        {/* Admin metrics tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-8 text-left">
          <div className="p-5 rounded-xl border border-white/5 bg-slate-900/30">
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Platform Users</p>
            <h3 className="text-2xl font-extrabold font-outfit mt-2">{stats?.users || 0}</h3>
          </div>
          <div className="p-5 rounded-xl border border-white/5 bg-slate-900/30">
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Resumes Drafts</p>
            <h3 className="text-2xl font-extrabold font-outfit mt-2">{stats?.resumes || 0}</h3>
          </div>
          <div className="p-5 rounded-xl border border-white/5 bg-slate-900/30">
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Cover Letters</p>
            <h3 className="text-2xl font-extrabold font-outfit mt-2">{stats?.coverLetters || 0}</h3>
          </div>
          <div className="p-5 rounded-xl border border-white/5 bg-slate-900/30">
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Avg ATS score</p>
            <h3 className="text-2xl font-extrabold text-green-400 font-outfit mt-2">{stats?.averageATS || 0}%</h3>
          </div>
        </div>

        {/* Database & API health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 text-left">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-lg font-bold font-outfit">Platform Accounts</h2>

            <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-900/10">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#070b19] text-slate-400 font-semibold text-[10px] uppercase border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Email Address</th>
                    <th className="px-5 py-3">Privilege</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-300">{u.name}</td>
                      <td className="px-5 py-3.5 text-slate-400">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          u.role === 'admin' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-slate-950 border border-white/5 text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u._id)} 
                          disabled={u.role === 'admin' || actionLoading}
                          className="text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-500"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Tokens usage audit right */}
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold font-outfit">System Operations</h2>

            {/* DB status card */}
            <div className="p-5 rounded-xl border border-white/5 bg-[#070b19] flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-violet-400" />
                <h3 className="font-bold text-xs">Infrastructure Status</h3>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">MongoDB database:</span>
                  <span className="text-green-400 font-bold flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Healthy</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">Redis cache Status:</span>
                  <span className="text-slate-400 font-semibold">{stats?.redisStatus}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Node environment:</span>
                  <span className="text-violet-400 font-semibold uppercase">Development</span>
                </div>
              </div>
            </div>

            {/* Token details */}
            <div className="p-5 rounded-xl border border-white/5 bg-[#070b19] flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-xs">Gemini Tokens usage</h3>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-extrabold text-amber-400">{usage?.geminiTokensUsed.toLocaleString() || 0}</span>
                <span className="text-[10px] text-slate-500">Tokens consumed</span>
              </div>
              
              {/* Requests metrics */}
              {usage && (
                <div className="mt-2 text-xs flex flex-col gap-2">
                  <p className="font-semibold text-slate-400 border-b border-white/5 pb-2">Category distribution:</p>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Summaries:</span>
                    <span className="font-bold text-slate-300">{usage.requestsCount.summaries}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>ATS analysis:</span>
                    <span className="font-bold text-slate-300">{usage.requestsCount.atsScans}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Chatbot prompts:</span>
                    <span className="font-bold text-slate-300">{usage.requestsCount.chatbot}</span>
                  </div>
                </div>
              )}
            </div>
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
