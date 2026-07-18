import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowLeft, Save, Download, FileText, Settings, ShieldCheck, 
  ChevronUp, ChevronDown, Eye, EyeOff, LayoutTemplate, Palette, 
  HelpCircle, MessageSquare, Briefcase, RefreshCw, Send, Compass
} from 'lucide-react';
import { resumeAPI, atsAPI, aiAPI } from '../services/api.js';

export default function ResumeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core Resume State
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState('sections'); // sections, style, templates
  const [toast, setToast] = useState(null);
  const saveTimeoutRef = useRef(null);

  // ATS & AI Side Drawer State
  const [jobDescription, setJobDescription] = useState('');
  const [atsReport, setAtsReport] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [aiActionLoading, setAiActionLoading] = useState(false);
  
  // Chat chatbot state
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', content: 'Hi there! I am your ResumeForge career coach. Ask me questions like "How can I improve my project bullet points?"' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchResume();
  }, [id]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchResume = async () => {
    try {
      const res = await resumeAPI.get(id);
      setResume(res.data.resume);
      
      // Fire an initial quick ATS scan
      try {
        const atsRes = await atsAPI.scan(id, {});
        setAtsReport(atsRes.data.report);
      } catch (e) {}
    } catch (err) {
      showToast('error', 'Could not load resume data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResume = (updatedFields) => {
    const updated = { ...resume, ...updatedFields };
    setResume(updated);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await resumeAPI.update(id, updatedFields);
        
        // Update local ATS indicators
        const atsRes = await atsAPI.scan(id, jobDescription.trim() ? { jobDescriptionText: jobDescription } : {});
        setAtsReport(atsRes.data.report);
      } catch (err) {
        console.error('Autosave error:', err);
      } finally {
        setSaving(false);
      }
    }, 1000); // 1-second debounce delay
  };

  const handleReorder = (direction, idx) => {
    const order = [...resume.sectionOrder];
    if (direction === 'up' && idx > 0) {
      const temp = order[idx];
      order[idx] = order[idx - 1];
      order[idx - 1] = temp;
    } else if (direction === 'down' && idx < order.length - 1) {
      const temp = order[idx];
      order[idx] = order[idx + 1];
      order[idx + 1] = temp;
    }
    handleUpdateResume({ sectionOrder: order });
  };

  const handleToggleVisibility = (section) => {
    const vis = { ...resume.sectionVisibility, [section]: !resume.sectionVisibility[section] };
    handleUpdateResume({ sectionVisibility: vis });
  };

  const handleScanJob = async () => {
    if (!jobDescription.trim()) {
      showToast('error', 'Please enter a target job description to analyze.');
      return;
    }
    setScanning(true);
    try {
      const res = await atsAPI.scan(id, { jobDescriptionText: jobDescription });
      setAtsReport(res.data.report);
      showToast('success', 'ATS scan complete!');
    } catch (err) {
      showToast('error', 'Job analysis failed.');
    } finally {
      setScanning(false);
    }
  };

  // AI Helpers
  const handleAIGenerateSummary = async () => {
    setAiActionLoading(true);
    try {
      const res = await aiAPI.summary({ profileData: resume });
      handleUpdateResume({ summary: res.data.summary });
      showToast('success', 'AI summary updated!');
    } catch (err) {
      showToast('error', 'Summary rewrite failed.');
    } finally {
      setAiActionLoading(false);
    }
  };

  const handleAIImproveBullets = async (sectionIdx) => {
    setAiActionLoading(true);
    try {
      const exp = resume.experience[sectionIdx];
      const res = await aiAPI.improveBullets({ bullets: exp.description });
      const newExp = [...resume.experience];
      newExp[sectionIdx].description = res.data.bullets;
      handleUpdateResume({ experience: newExp });
      showToast('success', 'AI bullet points improved!');
    } catch (err) {
      showToast('error', 'Bullets optimization failed.');
    } finally {
      setAiActionLoading(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setChatLoading(true);

    try {
      const res = await aiAPI.chat({
        message: userMsg.content,
        history: chatHistory.map(h => ({ role: h.role, parts: [{ text: h.content }] }))
      });
      setChatHistory(prev => [...prev, { role: 'model', content: res.data.response }]);
    } catch (err) {
      showToast('error', 'Could not fetch chatbot response.');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <p className="text-slate-400">Loading editor...</p>
        </div>
      </div>
    );
  }

  // Pre-calculate design colors and classes for live preview mapping
  const styles = resume.styling || {};
  const fontClass = styles.fontFamily === 'Roboto' ? 'font-sans' : styles.fontFamily === 'Outfit' ? 'font-outfit' : styles.fontFamily === 'Fira Code' ? 'font-code' : 'font-sans';

  return (
    <div className="min-h-screen bg-[#02050e] text-white flex flex-col">
      {/* Editor top header */}
      <header className="h-[60px] border-b border-white/5 bg-[#070b19] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-left">
            <h2 className="font-bold text-sm leading-none flex items-center gap-2">
              {resume.title}
              {saving && <span className="text-[10px] bg-violet-600/20 text-violet-400 px-2 py-0.5 rounded animate-pulse">Saving...</span>}
            </h2>
            <p className="text-[10px] text-slate-500 mt-1">{resume.targetRole}</p>
          </div>
        </div>

        {/* Templates and Style tabs toggle */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-white/5 text-[11px] font-semibold">
          <button onClick={() => setActivePanel('sections')} className={`px-3 py-1 rounded ${activePanel === 'sections' ? 'bg-violet-600' : 'text-slate-400'}`}>Content</button>
          <button onClick={() => setActivePanel('style')} className={`px-3 py-1 rounded ${activePanel === 'style' ? 'bg-violet-600' : 'text-slate-400'}`}>Style</button>
        </div>

        <div className="flex gap-2">
          <a 
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resumes/${resume._id}/pdf?token=${localStorage.getItem('token')}`}
            download
            className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded text-xs transition-colors flex items-center gap-1.5 shadow shadow-violet-500/20"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </a>
          <a 
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resumes/${resume._id}/docx?token=${localStorage.getItem('token')}`}
            download
            className="px-3.5 py-1.5 bg-slate-900 border border-white/10 text-slate-300 hover:text-white rounded text-xs transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> Word
          </a>
        </div>
      </header>

      {/* Workspace split panels */}
      <div className="flex-grow flex overflow-hidden">
        {/* PANEL 1: Left Content & Style configuration */}
        <div className="w-[340px] border-r border-white/5 bg-[#050814] flex flex-col overflow-y-auto shrink-0 p-5 text-left">
          {activePanel === 'sections' ? (
            <div className="flex flex-col gap-6">
              <h3 className="font-outfit font-bold text-sm text-slate-300 border-b border-white/5 pb-2 uppercase tracking-wide">Resume Sections</h3>
              
              {/* Personal details editor */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-violet-400">Header info</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Name"
                    value={resume.personalInfo?.name || ''}
                    onChange={(e) => handleUpdateResume({ personalInfo: { ...resume.personalInfo, name: e.target.value } })}
                    className="col-span-2 px-3 py-1.5 rounded bg-slate-950 border border-white/10"
                  />
                  <input
                    type="text"
                    placeholder="Email"
                    value={resume.personalInfo?.email || ''}
                    onChange={(e) => handleUpdateResume({ personalInfo: { ...resume.personalInfo, email: e.target.value } })}
                    className="px-3 py-1.5 rounded bg-slate-950 border border-white/10"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={resume.personalInfo?.phone || ''}
                    onChange={(e) => handleUpdateResume({ personalInfo: { ...resume.personalInfo, phone: e.target.value } })}
                    className="px-3 py-1.5 rounded bg-slate-950 border border-white/10"
                  />
                </div>
              </div>

              {/* Section order and visibility reorder list */}
              <div className="flex flex-col gap-3 mt-2">
                <h4 className="text-xs font-semibold text-violet-400">Section Order & Visibility</h4>
                <div className="flex flex-col gap-1.5">
                  {resume.sectionOrder.map((section, idx) => {
                    const isVisible = resume.sectionVisibility[section] !== false;
                    return (
                      <div key={section} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-white/5 text-xs">
                        <span className="capitalize text-slate-300">{section}</span>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleToggleVisibility(section)} className="text-slate-500 hover:text-white p-0.5">
                            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-500" />}
                          </button>
                          <button onClick={() => handleReorder('up', idx)} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-30">
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleReorder('down', idx)} disabled={idx === resume.sectionOrder.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic professional summary edit with AI buttons */}
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-violet-400">Professional Summary</h4>
                  <button 
                    onClick={handleAIGenerateSummary} 
                    disabled={aiActionLoading}
                    className="text-[10px] text-violet-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" /> Rewrite
                  </button>
                </div>
                <textarea
                  value={resume.summary || ''}
                  onChange={(e) => handleUpdateResume({ summary: e.target.value })}
                  rows={4}
                  className="w-full p-2.5 rounded bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Experience blocks descriptions */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-violet-400">Experience Bullets AI Booster</h4>
                {resume.experience?.map((exp, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-950 border border-white/5 text-xs flex flex-col gap-2">
                    <div className="flex justify-between font-bold">
                      <span>{exp.company}</span>
                      <button 
                        onClick={() => handleAIImproveBullets(idx)} 
                        disabled={aiActionLoading}
                        className="text-[9px] text-violet-400 flex items-center gap-1 hover:underline"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> Boost Bullets
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">{exp.role}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Style controls panel
            <div className="flex flex-col gap-6">
              <h3 className="font-outfit font-bold text-sm text-slate-300 border-b border-white/5 pb-2 uppercase tracking-wide">Design Controls</h3>
              
              <div className="flex flex-col gap-3">
                <label className="text-xs text-slate-400 font-medium">Typography Font</label>
                <select
                  value={styles.fontFamily}
                  onChange={(e) => handleUpdateResume({ styling: { ...styles, fontFamily: e.target.value } })}
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-white/10 text-xs"
                >
                  <option value="Inter">Inter (Sans-Serif)</option>
                  <option value="Roboto">Roboto (Clean)</option>
                  <option value="Outfit">Outfit (Geometric)</option>
                  <option value="Fira Code">Fira Code (Monospace)</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs text-slate-400 font-medium font-bold">Primary Theme Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {['#0f172a', '#4f46e5', '#0284c7', '#0891b2', '#059669', '#dc2626', '#d97706', '#7c3aed'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleUpdateResume({ styling: { ...styles, primaryColor: color } })}
                      style={{ backgroundColor: color }}
                      className={`h-8 rounded border ${styles.primaryColor === color ? 'border-white' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Page Margins</label>
                  <select
                    value={styles.margin}
                    onChange={(e) => handleUpdateResume({ styling: { ...styles, margin: e.target.value } })}
                    className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                  >
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="loose">Loose</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Line Spacing</label>
                  <select
                    value={styles.spacing}
                    onChange={(e) => handleUpdateResume({ styling: { ...styles, spacing: e.target.value } })}
                    className="w-full px-3 py-1.5 mt-1 rounded bg-slate-950 border border-white/10 text-xs"
                  >
                    <option value="compact">Compact</option>
                    <option value="normal">Normal</option>
                    <option value="loose">Loose</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs text-slate-400">Page Format</label>
                <select
                  value={styles.pageSize}
                  onChange={(e) => handleUpdateResume({ styling: { ...styles, pageSize: e.target.value } })}
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-white/10 text-xs"
                >
                  <option value="A4">A4 Standard</option>
                  <option value="Letter">Letter Standard</option>
                </select>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <label className="text-xs text-slate-400 font-medium">Select Template Base</label>
                <div className="grid grid-cols-2 gap-2 text-left">
                  {[
                    { id: 'modern_minimal', name: 'Modern Minimal' },
                    { id: 'google_style', name: 'Google style' },
                    { id: 'stripe_style', name: 'Stripe design' },
                    { id: 'developer', name: 'Developer Mono' },
                    { id: 'academic_serif', name: 'Academic Serif (Reference)' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleUpdateResume({ templateId: t.id })}
                      className={`p-3 rounded border text-[10px] font-bold ${
                        resume.templateId === t.id ? 'border-violet-500 bg-violet-600/10' : 'border-white/5 bg-slate-950 hover:bg-slate-900'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PANEL 2: Middle Live HTML preview */}
        <div className="flex-grow bg-[#090d16] p-8 overflow-y-auto flex justify-center">
          {resume.templateId === 'academic_serif' ? (
            <div className="w-[210mm] min-h-[297mm] bg-white text-black p-12 shadow-2xl rounded text-left font-serif" style={{ fontSize: '11px', lineHeight: '1.35', fontFamily: 'Georgia, serif' }}>
              {/* Centered Academic Header */}
              <div className="text-center mb-4">
                <h1 className="text-2xl font-semibold font-serif text-black mb-2">
                  {resume.personalInfo?.name || 'Not Present'}
                </h1>
                <div className="flex justify-center flex-wrap gap-4 text-[10px] text-black">
                  <span>📍 {resume.personalInfo?.address || 'Not Present'}</span>
                  <span>✉ {resume.personalInfo?.email || 'Not Present'}</span>
                  <span>📞 {resume.personalInfo?.phone || 'Not Present'}</span>
                </div>
                <div className="flex justify-center text-[10px] text-black mt-1">
                  <span><b>in</b> {resume.personalInfo?.linkedinUrl ? resume.personalInfo.linkedinUrl.replace(/https?:\/\/(?:www\.)?/, '') : 'Not Present'}</span>
                </div>
              </div>

              {/* Sections loop */}
              <div className="flex flex-col gap-4">
                {resume.sectionOrder.map((sec) => {
                  if (resume.sectionVisibility[sec] === false) return null;

                  if (sec === 'summary') {
                    return (
                      <div key={sec} className="flex flex-col">
                        <h3 className="font-serif font-bold text-[12px] border-b border-gray-400 pb-0.5 mb-1.5 text-black">
                          Introduction
                        </h3>
                        <p className="text-[10.5px] leading-relaxed text-justify text-black">{resume.summary || 'Not Present'}</p>
                      </div>
                    );
                  }

                  if (sec === 'certifications') {
                    const hasCerts = resume.certifications?.length > 0;
                    return (
                      <div key={sec} className="flex flex-col">
                        <h3 className="font-serif font-bold text-[12px] border-b border-gray-400 pb-0.5 mb-1.5 text-black">
                          Certificates
                        </h3>
                        <ul className="list-none pl-0 text-[10.5px] text-black">
                          {hasCerts ? (
                            resume.certifications.map((c, i) => (
                              <li key={i} className="relative pl-3 mb-1 text-justify before:content-['◦'] before:absolute before:left-0 before:font-bold">
                                {c.name}{c.issuer ? ` organized by ${c.issuer}` : ''}
                              </li>
                            ))
                          ) : (
                            <li className="relative pl-3 italic text-gray-500 before:content-['◦'] before:absolute before:left-0">Not Present</li>
                          )}
                        </ul>
                      </div>
                    );
                  }

                  if (sec === 'education') {
                    const hasEdu = resume.education?.length > 0;
                    return (
                      <div key={sec} className="flex flex-col">
                        <h3 className="font-serif font-bold text-[12px] border-b border-gray-400 pb-0.5 mb-1.5 text-black">
                          Education
                        </h3>
                        {hasEdu ? (
                          resume.education.map((edu, i) => (
                            <div key={i} className="flex flex-col mb-2 text-[10.5px] text-black">
                              <div className="flex justify-between font-bold">
                                <span>{edu.school}</span>
                                <span className="font-normal italic">{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</span>
                              </div>
                              <div className="italic mb-1">{edu.degree} in {edu.fieldOfStudy || 'Not Present'}</div>
                              <ul className="list-none pl-0">
                                <li className="relative pl-3 before:content-['◦'] before:absolute before:left-0">CGPA: {edu.cgpa || 'Not Present'}</li>
                                <li className="relative pl-3 before:content-['◦'] before:absolute before:left-0">Coursework: {edu.coursework || 'Not Present'}</li>
                              </ul>
                            </div>
                          ))
                        ) : (
                          <ul className="list-none pl-0 text-[10.5px]">
                            <li className="relative pl-3 italic text-gray-500 before:content-['◦'] before:absolute before:left-0">Not Present</li>
                          </ul>
                        )}
                      </div>
                    );
                  }

                  if (sec === 'projects') {
                    const hasProj = resume.projects?.length > 0;
                    return (
                      <div key={sec} className="flex flex-col">
                        <h3 className="font-serif font-bold text-[12px] border-b border-gray-400 pb-0.5 mb-1.5 text-black">
                          Projects
                        </h3>
                        {hasProj ? (
                          resume.projects.map((proj, i) => (
                            <div key={i} className="flex flex-col mb-2 text-[10.5px] text-black">
                              <div className="font-bold mb-1">{proj.title}</div>
                              <ul className="list-none pl-0">
                                <li className="relative pl-3 mb-1 text-justify before:content-['◦'] before:absolute before:left-0">
                                  {proj.description || 'Not Present'}
                                </li>
                                <li className="relative pl-3 before:content-['◦'] before:absolute before:left-0">
                                  Tools Used: {proj.technologies?.length > 0 ? proj.technologies.join(', ') : 'Not Present'}
                                </li>
                              </ul>
                            </div>
                          ))
                        ) : (
                          <ul className="list-none pl-0 text-[10.5px]">
                            <li className="relative pl-3 italic text-gray-500 before:content-['◦'] before:absolute before:left-0">Not Present</li>
                          </ul>
                        )}
                      </div>
                    );
                  }

                  if (sec === 'skills') {
                    const skillsArray = resume.skills || [];
                    const langKeywords = ['c++', 'c', 'java', 'javascript', 'python', 'rust', 'go', 'ruby', 'php', 'swift', 'kotlin', 'typescript', 'sql', 'bash', 'shell'];
                    const webKeywords = ['html', 'css', 'react', 'node', 'express', 'angular', 'vue', 'tailwind', 'sass', 'bootstrap', 'mongodb', 'redis', 'postgres', 'django', 'flask', 'next.js'];
                    
                    const languages = [];
                    const web = [];
                    const tools = [];

                    skillsArray.forEach(skill => {
                      const sLower = skill.toLowerCase();
                      if (sLower.startsWith('languages:') || sLower.startsWith('language:')) {
                        languages.push(skill.replace(/^(?:languages|language):\s*/i, ''));
                      } else if (sLower.startsWith('web:') || sLower.startsWith('web technologies:') || sLower.startsWith('frameworks:')) {
                        web.push(skill.replace(/^(?:web|web technologies|frameworks):\s*/i, ''));
                      } else if (sLower.startsWith('developer tools:') || sLower.startsWith('tools:') || sLower.startsWith('dev tools:')) {
                        tools.push(skill.replace(/^(?:developer tools|tools|dev tools):\s*/i, ''));
                      } else {
                        if (langKeywords.some(kw => sLower.includes(kw))) {
                          languages.push(skill);
                        } else if (webKeywords.some(kw => sLower.includes(kw))) {
                          web.push(skill);
                        } else {
                          tools.push(skill);
                        }
                      }
                    });

                    return (
                      <div key={sec} className="flex flex-col">
                        <h3 className="font-serif font-bold text-[12px] border-b border-gray-400 pb-0.5 mb-1.5 text-black">
                          Technologies
                        </h3>
                        <div className="flex flex-col gap-1 text-[10.5px] text-black">
                          <div><b>Languages:</b> {languages.length > 0 ? languages.join(', ') : 'Not Present'}</div>
                          <div><b>Web:</b> {web.length > 0 ? web.join(', ') : 'Not Present'}</div>
                          <div><b>Developer Tools:</b> {tools.length > 0 ? tools.join(', ') : 'Not Present'}</div>
                        </div>
                      </div>
                    );
                  }

                  if (sec === 'experience') {
                    const hasExp = resume.experience?.length > 0;
                    return (
                      <div key={sec} className="flex flex-col">
                        <h3 className="font-serif font-bold text-[12px] border-b border-gray-400 pb-0.5 mb-1.5 text-black">
                          Work Experience
                        </h3>
                        {hasExp ? (
                          resume.experience.map((exp, i) => (
                            <div key={i} className="flex flex-col mb-2 text-[10.5px] text-black">
                              <div className="flex justify-between font-bold">
                                <span>{exp.role}</span>
                                <span className="font-normal italic">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                              </div>
                              <div className="italic mb-1">{exp.company} {exp.location ? `| ${exp.location}` : ''}</div>
                              <ul className="list-none pl-0">
                                {exp.description?.length > 0 ? (
                                  exp.description.map((bullet, idx) => (
                                    <li key={idx} className="relative pl-3 mb-1 text-justify before:content-['◦'] before:absolute before:left-0 before:font-bold">
                                      {bullet}
                                    </li>
                                  ))
                                ) : (
                                  <li className="relative pl-3 italic text-gray-500 before:content-['◦'] before:absolute before:left-0">Not Present</li>
                                )}
                              </ul>
                            </div>
                          ))
                        ) : (
                          <ul className="list-none pl-0 text-[10.5px]">
                            <li className="relative pl-3 italic text-gray-500 before:content-['◦'] before:absolute before:left-0">Not Present</li>
                          </ul>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ) : (
            <div className={`w-[210mm] min-h-[297mm] bg-white text-slate-800 p-12 shadow-2xl rounded text-left ${fontClass}`} style={{ color: styles.textColor }}>
              {/* Header snapshot */}
              <div className="border-b pb-4 mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase" style={{ color: styles.primaryColor }}>
                  {resume.personalInfo?.name || 'Your Name'}
                </h1>
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mt-2 font-medium">
                  {resume.personalInfo?.email && <span>{resume.personalInfo.email}</span>}
                  {resume.personalInfo?.phone && <span>&bull; {resume.personalInfo.phone}</span>}
                  {resume.personalInfo?.address && <span>&bull; {resume.personalInfo.address}</span>}
                  {resume.personalInfo?.githubUsername && <span>&bull; github.com/{resume.personalInfo.githubUsername}</span>}
                </div>
              </div>

              {/* Custom sections compiler based on reorder state */}
              <div className="flex flex-col gap-6">
                {resume.sectionOrder.map((sec) => {
                  if (resume.sectionVisibility[sec] === false) return null;

                  if (sec === 'summary') {
                    return (
                      <div key={sec} className="flex flex-col gap-1.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: styles.primaryColor, borderColor: styles.primaryColor }}>
                          Professional Summary
                        </h3>
                        <p className="text-[11px] leading-relaxed text-slate-700 text-justify">{resume.summary}</p>
                      </div>
                    );
                  }

                  if (sec === 'experience' && resume.experience?.length > 0) {
                    return (
                      <div key={sec} className="flex flex-col gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: styles.primaryColor, borderColor: styles.primaryColor }}>
                          Work Experience
                        </h3>
                        <div className="flex flex-col gap-4">
                          {resume.experience.map((exp, i) => (
                            <div key={i} className="flex flex-col text-[11px]">
                              <div className="flex justify-between font-bold text-slate-900">
                                <span>{exp.role} &bull; {exp.company}</span>
                                <span className="font-normal text-slate-400">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                              </div>
                              <ul className="list-disc pl-4 mt-1 flex flex-col gap-1 text-slate-700">
                                {exp.description?.map((bullet, idx) => (
                                  <li key={idx}>{bullet}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (sec === 'skills' && resume.skills?.length > 0) {
                    return (
                      <div key={sec} className="flex flex-col gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: styles.primaryColor, borderColor: styles.primaryColor }}>
                          Core Skills
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {resume.skills.map((s, i) => (
                            <span key={i} className="border border-slate-200 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-700">{s}</span>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (sec === 'projects' && resume.projects?.length > 0) {
                    return (
                      <div key={sec} className="flex flex-col gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: styles.primaryColor, borderColor: styles.primaryColor }}>
                          Projects
                        </h3>
                        <div className="flex flex-col gap-3">
                          {resume.projects.map((proj, i) => (
                            <div key={i} className="flex flex-col text-[11px] text-slate-700">
                              <div className="flex justify-between font-bold text-slate-900">
                                <span>{proj.title}</span>
                                <span className="font-normal text-slate-400">{proj.technologies?.join(', ')}</span>
                              </div>
                              <p className="mt-1 text-justify">{proj.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (sec === 'education' && resume.education?.length > 0) {
                    return (
                      <div key={sec} className="flex flex-col gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: styles.primaryColor, borderColor: styles.primaryColor }}>
                          Education
                        </h3>
                        <div className="flex flex-col gap-3">
                          {resume.education.map((edu, i) => (
                            <div key={i} className="flex flex-col text-[11px] text-slate-700">
                              <div className="flex justify-between font-bold text-slate-900">
                                <span>{edu.degree} in {edu.fieldOfStudy}</span>
                                <span className="font-normal text-slate-400">{edu.startDate} - {edu.endDate}</span>
                              </div>
                              <p className="italic">{edu.school} {edu.cgpa && `&bull; GPA: ${edu.cgpa}`}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (sec === 'certifications' && resume.certifications?.length > 0) {
                    return (
                      <div key={sec} className="flex flex-col gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: styles.primaryColor, borderColor: styles.primaryColor }}>
                          Certifications
                        </h3>
                        <div className="flex flex-col gap-2">
                          {resume.certifications.map((cert, i) => (
                            <div key={i} className="flex justify-between text-[11px] text-slate-700">
                              <span><b>{cert.name}</b> &bull; {cert.issuer}</span>
                              <span className="text-slate-400">{cert.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* PANEL 3: Right AI match panel */}
        <div className="w-[320px] border-l border-white/5 bg-[#050814] flex flex-col shrink-0">
          {/* Header score */}
          <div className="p-5 border-b border-white/5 text-left">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase">Live ATS Meter</span>
              <span className="text-xs bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded border border-green-500/20">
                Score: {atsReport?.overallScore || 0}%
              </span>
            </div>
            
            {/* Progress radial mockup or bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full mt-3 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-violet-500 to-green-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${atsReport?.overallScore || 0}%` }}
              />
            </div>
          </div>

          {/* Job Analyzer & Assistant chatbot Accordion Tabs */}
          <div className="flex-grow overflow-y-auto p-5 text-left flex flex-col gap-6">
            {/* Tailor to Job Description */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold flex items-center gap-1.5 text-slate-300">
                <Briefcase className="w-4 h-4 text-violet-400" /> Job matching Tailor
              </h4>
              <textarea
                placeholder="Paste Target Job Description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={3}
                className="w-full p-2 rounded bg-slate-950 border border-white/10 text-[10px] focus:outline-none focus:border-violet-500 font-sans"
              />
              <button 
                onClick={handleScanJob} 
                disabled={scanning}
                className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded text-[11px] flex items-center justify-center gap-1.5 shadow disabled:bg-violet-800"
              >
                {scanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Tailor & Audit Resume'}
              </button>
            </div>

            {/* ATS audit list suggestions */}
            {atsReport && (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-green-400" /> Match Audit Suggestions
                </h4>
                <div className="flex flex-col gap-2 text-[10px] text-slate-400 max-h-40 overflow-y-auto">
                  {atsReport.missingKeywords?.length > 0 && (
                    <div className="p-2.5 rounded bg-red-500/5 border border-red-500/10">
                      <p className="font-semibold text-red-400 mb-1">Missing Keywords:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {atsReport.missingKeywords.map((k, i) => (
                          <span key={i} className="bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded text-[9px] text-red-400">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {atsReport.weakBulletPoints?.length > 0 && (
                    <div className="p-2.5 rounded bg-yellow-500/5 border border-yellow-500/10 flex flex-col gap-1.5">
                      <p className="font-semibold text-yellow-400">Weak Bullets:</p>
                      {atsReport.weakBulletPoints.slice(0, 2).map((wb, i) => (
                        <div key={i} className="border-t border-white/5 pt-1 text-[9px]">
                          <p className="text-slate-500 line-clamp-1 italic">"{wb.original}"</p>
                          <p className="text-slate-300 mt-0.5">&bull; {wb.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {atsReport.formattingIssues?.length > 0 && (
                    <div className="p-2.5 rounded bg-blue-500/5 border border-blue-500/10 text-[9px]">
                      <p className="font-semibold text-blue-400">Format Checks:</p>
                      <ul className="list-disc pl-3 mt-1 flex flex-col gap-0.5">
                        {atsReport.formattingIssues.slice(0, 2).map((fi, i) => <li key={i}>{fi}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chatbot section */}
            <div className="flex-grow flex flex-col justify-between border-t border-white/5 pt-4">
              <h4 className="text-xs font-bold flex items-center gap-1.5 text-slate-300 mb-3">
                <MessageSquare className="w-4 h-4 text-violet-400" /> Career Coach
              </h4>
              
              {/* Chat bubbles container */}
              <div className="flex-grow max-h-48 overflow-y-auto flex flex-col gap-3 p-2 bg-slate-950 rounded-lg border border-white/5 mb-3 text-[10px]">
                {chatHistory.map((h, i) => (
                  <div key={i} className={`p-2 rounded-lg max-w-[85%] ${
                    h.role === 'user' ? 'bg-violet-600 ml-auto' : 'bg-slate-900 border border-white/5 mr-auto text-slate-300'
                  }`}>
                    {h.content}
                  </div>
                ))}
                {chatLoading && <div className="text-slate-500 italic mr-auto">Coach is typing...</div>}
              </div>

              {/* Chat inputs */}
              <form onSubmit={handleSendChatMessage} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Ask the coach..."
                  className="flex-grow px-2 py-1 bg-slate-950 border border-white/10 rounded text-[10px] focus:outline-none focus:border-violet-500"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button type="submit" className="p-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded shrink-0">
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Notifications */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-2.5 rounded-lg shadow-2xl text-xs font-semibold z-50 border transition-all duration-300 ${
          toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
