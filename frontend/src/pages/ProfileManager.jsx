import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Sparkles, User, FileText, Compass, Briefcase, Layers, BarChart2, LogOut,
  Save, Plus, Trash2, ArrowLeft, GraduationCap, Code, ClipboardList, Lightbulb
} from 'lucide-react';
import { profileAPI, aiAPI } from '../services/api.js';

export default function ProfileManager() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // States
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form Fields
  const [profile, setProfile] = useState({
    phone: '',
    address: '',
    portfolioUrl: '',
    githubUsername: '',
    linkedinUrl: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    achievements: []
  });

  const [skillInput, setSkillInput] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [suggestedCerts, setSuggestedCerts] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfile = async () => {
    try {
      const res = await profileAPI.get();
      if (res.data.profile) {
        setProfile({
          ...profile,
          ...res.data.profile
        });
      }
    } catch (err) {
      showToast('error', 'Could not load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.update(profile);
      showToast('success', 'Master profile saved successfully!');
    } catch (err) {
      showToast('error', 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  // Skill handles
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (profile.skills.includes(skillInput.trim())) {
      setSkillInput('');
      return;
    }
    setProfile({
      ...profile,
      skills: [...profile.skills, skillInput.trim()]
    });
    setSkillInput('');
  };

  const handleRemoveSkill = (skill) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skill)
    });
  };

  // Add Item templates
  const handleAddExperience = () => {
    const newExp = {
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ['']
    };
    setProfile({
      ...profile,
      experience: [...profile.experience, newExp]
    });
  };

  const handleAddProject = () => {
    const newProj = {
      title: '',
      description: '',
      technologies: [],
      githubUrl: '',
      liveUrl: '',
      achievements: ['']
    };
    setProfile({
      ...profile,
      projects: [...profile.projects, newProj]
    });
  };

  const handleAddEducation = () => {
    const newEdu = {
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      cgpa: '',
      current: false
    };
    setProfile({
      ...profile,
      education: [...profile.education, newEdu]
    });
  };

  const handleAISuggestSkills = async () => {
    setAiLoading(true);
    try {
      const res = await aiAPI.suggestSkills({ profileData: profile });
      setSuggestedSkills(res.data.skills || []);
      showToast('success', 'AI suggested skills successfully.');
    } catch (err) {
      showToast('error', 'AI suggestion failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISuggestCerts = async () => {
    setAiLoading(true);
    try {
      const res = await aiAPI.suggestCertifications({ profileData: profile });
      setSuggestedCerts(res.data.certifications || []);
      showToast('success', 'AI suggested certifications successfully.');
    } catch (err) {
      showToast('error', 'AI suggestion failed.');
    } finally {
      setAiLoading(false);
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
            <Link to="/profile" className="flex items-center gap-3 px-4 py-2 bg-violet-600/10 text-violet-400 font-semibold rounded-lg text-sm transition-all border border-violet-500/10">
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
          </nav>
        </div>

        {/* User profile identifier bottom */}
        <div className="flex items-center gap-3 border-t border-white/5 pt-4">
          <div className="h-9 w-9 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white uppercase text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-sm">{user?.name || 'User'}</span>
            <span className="text-[10px] text-slate-500">{user?.email}</span>
          </div>
        </div>
      </aside>

      {/* Main Form content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="text-left flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold font-outfit">Master Profile</h1>
              <p className="text-slate-400 text-xs mt-1">This feeds raw candidate specifications into custom resume edits.</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold text-sm transition-all shadow flex items-center gap-2">
            <Save className="w-4.5 h-4.5" /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </header>

        {/* Profile Tabs */}
        <div className="flex border-b border-white/5 mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <button onClick={() => setActiveTab('personal')} className={`px-6 py-3 border-b-2 transition-all ${activeTab === 'personal' ? 'border-violet-500 text-white' : 'border-transparent hover:text-white'}`}>
            Personal Details
          </button>
          <button onClick={() => setActiveTab('experience')} className={`px-6 py-3 border-b-2 transition-all ${activeTab === 'experience' ? 'border-violet-500 text-white' : 'border-transparent hover:text-white'}`}>
            Experience
          </button>
          <button onClick={() => setActiveTab('projects')} className={`px-6 py-3 border-b-2 transition-all ${activeTab === 'projects' ? 'border-violet-500 text-white' : 'border-transparent hover:text-white'}`}>
            Projects
          </button>
          <button onClick={() => setActiveTab('education')} className={`px-6 py-3 border-b-2 transition-all ${activeTab === 'education' ? 'border-violet-500 text-white' : 'border-transparent hover:text-white'}`}>
            Education & Skills
          </button>
        </div>

        {/* Tab contents */}
        {loading ? (
          <div className="flex items-center justify-center h-64 mt-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="mt-8 text-left max-w-4xl">
            {/* 1. Personal Info */}
            {activeTab === 'personal' && (
              <div className="grid grid-cols-2 gap-6 bg-slate-900/10 border border-white/5 p-6 rounded-xl">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Contact Phone</label>
                  <input
                    type="text"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2 mt-1.5 rounded-lg bg-slate-950 border border-white/10 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Location Address</label>
                  <input
                    type="text"
                    value={profile.address || ''}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="New York, NY"
                    className="w-full px-4 py-2 mt-1.5 rounded-lg bg-slate-950 border border-white/10 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Portfolio URL</label>
                  <input
                    type="text"
                    value={profile.portfolioUrl || ''}
                    onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                    placeholder="https://myportfolio.com"
                    className="w-full px-4 py-2 mt-1.5 rounded-lg bg-slate-950 border border-white/10 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium">GitHub Username</label>
                  <input
                    type="text"
                    value={profile.githubUsername || ''}
                    onChange={(e) => setProfile({ ...profile, githubUsername: e.target.value })}
                    placeholder="username"
                    className="w-full px-4 py-2 mt-1.5 rounded-lg bg-slate-950 border border-white/10 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 font-medium">LinkedIn URL</label>
                  <input
                    type="text"
                    value={profile.linkedinUrl || ''}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-2 mt-1.5 rounded-lg bg-slate-950 border border-white/10 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            )}

            {/* 2. Experience */}
            {activeTab === 'experience' && (
              <div className="flex flex-col gap-6">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="bg-slate-900/10 border border-white/5 p-6 rounded-xl flex flex-col gap-4 relative">
                    <button
                      onClick={() => setProfile({
                        ...profile,
                        experience: profile.experience.filter((_, i) => i !== idx)
                      })}
                      className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400">Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...profile.experience];
                            newExp[idx].company = e.target.value;
                            setProfile({ ...profile, experience: newExp });
                          }}
                          className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Role / Designation</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const newExp = [...profile.experience];
                            newExp[idx].role = e.target.value;
                            setProfile({ ...profile, experience: newExp });
                          }}
                          className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Start Date (YYYY-MM)</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const newExp = [...profile.experience];
                            newExp[idx].startDate = e.target.value;
                            setProfile({ ...profile, experience: newExp });
                          }}
                          placeholder="2023-01"
                          className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">End Date (YYYY-MM)</label>
                        <input
                          type="text"
                          value={exp.current ? 'Present' : exp.endDate || ''}
                          disabled={exp.current}
                          onChange={(e) => {
                            const newExp = [...profile.experience];
                            newExp[idx].endDate = e.target.value;
                            setProfile({ ...profile, experience: newExp });
                          }}
                          placeholder="2024-05"
                          className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10 text-xs disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 flex items-center justify-between">
                        <span>STAR Bullet Points (1 per line)</span>
                      </label>
                      <textarea
                        value={exp.description ? exp.description.join('\n') : ''}
                        onChange={(e) => {
                          const newExp = [...profile.experience];
                          newExp[idx].description = e.target.value.split('\n');
                          setProfile({ ...profile, experience: newExp });
                        }}
                        rows={3}
                        placeholder="Spearheaded checkout latency optimization..."
                        className="w-full px-3 py-2 mt-1.5 rounded bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-violet-500 font-sans"
                      />
                    </div>
                  </div>
                ))}
                <button onClick={handleAddExperience} className="py-3 border border-dashed border-white/10 hover:border-violet-500/30 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-violet-400 transition-all bg-white/[0.01]">
                  <Plus className="w-4 h-4" /> Add Experience Block
                </button>
              </div>
            )}

            {/* 3. Projects */}
            {activeTab === 'projects' && (
              <div className="flex flex-col gap-6">
                {profile.projects.map((proj, idx) => (
                  <div key={idx} className="bg-slate-900/10 border border-white/5 p-6 rounded-xl flex flex-col gap-4 relative">
                    <button
                      onClick={() => setProfile({
                        ...profile,
                        projects: profile.projects.filter((_, i) => i !== idx)
                      })}
                      className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs text-slate-400">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const newProj = [...profile.projects];
                            newProj[idx].title = e.target.value;
                            setProfile({ ...profile, projects: newProj });
                          }}
                          className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">GitHub Link</label>
                        <input
                          type="text"
                          value={proj.githubUrl || ''}
                          onChange={(e) => {
                            const newProj = [...profile.projects];
                            newProj[idx].githubUrl = e.target.value;
                            setProfile({ ...profile, projects: newProj });
                          }}
                          className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Live Demo URL</label>
                        <input
                          type="text"
                          value={proj.liveUrl || ''}
                          onChange={(e) => {
                            const newProj = [...profile.projects];
                            newProj[idx].liveUrl = e.target.value;
                            setProfile({ ...profile, projects: newProj });
                          }}
                          className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400">Project Summary</label>
                      <textarea
                        value={proj.description}
                        onChange={(e) => {
                          const newProj = [...profile.projects];
                          newProj[idx].description = e.target.value;
                          setProfile({ ...profile, projects: newProj });
                        }}
                        rows={2}
                        className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                      />
                    </div>
                  </div>
                ))}
                <button onClick={handleAddProject} className="py-3 border border-dashed border-white/10 hover:border-violet-500/30 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-violet-400 transition-all bg-white/[0.01]">
                  <Plus className="w-4 h-4" /> Add Project Block
                </button>
              </div>
            )}

            {/* 4. Education & Skills */}
            {activeTab === 'education' && (
              <div className="grid grid-cols-3 gap-8">
                {/* Left col: Education list */}
                <div className="col-span-2 flex flex-col gap-6">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-slate-300">
                    <GraduationCap className="w-4 h-4 text-violet-400" /> Academic Details
                  </h3>
                  {profile.education.map((edu, idx) => (
                    <div key={idx} className="bg-slate-900/10 border border-white/5 p-4 rounded-xl flex flex-col gap-3 relative">
                      <button
                        onClick={() => setProfile({
                          ...profile,
                          education: profile.education.filter((_, i) => i !== idx)
                        })}
                        className="absolute top-2 right-2 text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-400">School / University</label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => {
                              const newEdu = [...profile.education];
                              newEdu[idx].school = e.target.value;
                              setProfile({ ...profile, education: newEdu });
                            }}
                            className="w-full px-2 py-1 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Degree & Stream</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const newEdu = [...profile.education];
                              newEdu[idx].degree = e.target.value;
                              setProfile({ ...profile, education: newEdu });
                            }}
                            placeholder="B.S. in CS"
                            className="w-full px-2 py-1 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Graduation Year</label>
                          <input
                            type="text"
                            value={edu.endDate}
                            onChange={(e) => {
                              const newEdu = [...profile.education];
                              newEdu[idx].endDate = e.target.value;
                              setProfile({ ...profile, education: newEdu });
                            }}
                            placeholder="2022"
                            className="w-full px-2 py-1 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">CGPA / GPA</label>
                          <input
                            type="text"
                            value={edu.cgpa}
                            onChange={(e) => {
                              const newEdu = [...profile.education];
                              newEdu[idx].cgpa = e.target.value;
                              setProfile({ ...profile, education: newEdu });
                            }}
                            placeholder="3.85"
                            className="w-full px-2 py-1 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={handleAddEducation} className="py-2 border border-dashed border-white/10 hover:border-violet-500/20 rounded-xl flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-violet-400 transition-all bg-white/[0.01]">
                    <Plus className="w-3.5 h-3.5" /> Add School
                  </button>
                </div>

                {/* Right col: Skills tags */}
                <div className="col-span-1 flex flex-col gap-6">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-slate-300">
                    <Code className="w-4 h-4 text-violet-400" /> Core Skills Tagging
                  </h3>

                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="React"
                      className="flex-grow px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-violet-500"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                    />
                    <button type="submit" className="px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold">
                      Add
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2 min-h-24 p-3 rounded-lg bg-slate-900/30 border border-white/5">
                    {profile.skills.length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic">No skills added yet.</span>
                    ) : (
                      profile.skills.map((skill, idx) => (
                        <span key={idx} className="bg-slate-950 border border-white/10 text-slate-300 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-slate-500 hover:text-red-400 font-bold">&times;</button>
                        </span>
                      ))
                    )}
                  </div>

                  <button 
                    onClick={handleAISuggestSkills} 
                    disabled={aiLoading}
                    className="w-full py-2 bg-slate-900 border border-white/10 hover:border-violet-500/20 text-slate-400 hover:text-violet-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> Suggest Tech Stack
                  </button>

                  {suggestedSkills.length > 0 && (
                    <div className="p-3 rounded-lg bg-violet-950/15 border border-violet-500/20 text-xs text-left">
                      <p className="font-semibold text-violet-400 mb-2">Recommended Skills:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedSkills.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (!profile.skills.includes(s)) {
                                setProfile({ ...profile, skills: [...profile.skills, s] });
                              }
                            }}
                            className="bg-violet-950/40 border border-violet-500/10 hover:border-violet-500/40 px-2 py-0.5 rounded text-[10px]"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
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
