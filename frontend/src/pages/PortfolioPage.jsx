import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Github, Linkedin, Mail, ExternalLink, Download, Code, 
  Briefcase, GraduationCap, Award, Sparkles, MapPin
} from 'lucide-react';
import { profileAPI, resumeAPI } from '../services/api.js';

export default function PortfolioPage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileDetails();
  }, [username]);

  const fetchProfileDetails = async () => {
    try {
      // If it is the demo path, load structured details immediately
      if (username === 'demo') {
        setProfile({
          name: 'Alex Mercer',
          phone: '+1 (555) 019-2834',
          address: 'San Francisco, CA',
          portfolioUrl: 'https://alexmercer.dev',
          githubUsername: 'alexmercer',
          linkedinUrl: 'https://linkedin.com/in/alex-mercer',
          summary: 'Highly motivated and results-driven software engineer with 4+ years of experience building scalable microservices and developer platforms. Specialized in React, Node.js, and cloud native system architectures.',
          skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Redis', 'TypeScript', 'Docker', 'AWS', 'Jest', 'Tailwind CSS'],
          experience: [
            {
              company: 'Stripe',
              role: 'Software Engineer II',
              location: 'San Francisco, CA',
              startDate: '2024-03',
              endDate: 'Present',
              current: true,
              description: [
                'Developed and optimized developer dashboard components using React and TypeScript, increasing user interaction speed by 35%.',
                'Refactored checkout API endpoints, reducing median latency by 120ms through intelligent Redis caching strategies.',
                'Collaborated with product designers to implement responsive, pixel-perfect layouts matching Vercel/Stripe aesthetics.'
              ]
            },
            {
              company: 'Vercel',
              role: 'Junior Frontend Developer',
              location: 'Remote',
              startDate: '2022-06',
              endDate: '2024-02',
              current: false,
              description: [
                'Shipped modular dashboard cards and components integrated with Next.js router configurations.',
                'Wrote over 40+ unit and integration tests with Jest and Testing Library, increasing test coverage from 72% to 94%.',
                'Implemented smooth layout transition animations utilizing Framer Motion, enhancing user satisfaction ratings.'
              ]
            }
          ],
          education: [
            {
              school: 'Stanford University',
              degree: 'Bachelor of Science',
              fieldOfStudy: 'Computer Science',
              startDate: '2018-09',
              endDate: '2022-06',
              cgpa: '3.92',
              current: false
            }
          ],
          projects: [
            {
              title: 'ResumeForge AI Builder',
              description: 'A full-stack, state-of-the-art resume builder platform that analyzes and scores ATS optimization levels in real time.',
              technologies: ['React', 'Redux', 'Tailwind CSS', 'Node.js', 'MongoDB', 'Gemini API'],
              githubUrl: 'https://github.com/alexmercer/resumeforge',
              liveUrl: 'https://resumeforge.ai'
            }
          ]
        });
        setLoading(false);
        return;
      }

      // Query database profile if logged in
      const res = await profileAPI.get();
      setProfile({
        name: 'Professional Developer',
        ...res.data.profile
      });
      
      const resResumes = await resumeAPI.list();
      setResumes(resResumes.data.resumes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <h2 className="text-xl font-bold">Portfolio not initialized</h2>
        <p className="text-xs text-slate-500 mt-2">The requested developer profile does not contain portfolio metadata.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-violet-600/30 pb-20">
      {/* Visual background lights */}
      <div className="absolute top-0 left-1/3 w-[450px] h-[450px] bg-violet-700/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Navbar header */}
      <header className="sticky top-0 z-40 glass bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5">
        <span className="font-outfit font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          {profile.name.toUpperCase()}
        </span>
        <div className="flex gap-4">
          {profile.githubUsername && (
            <a href={`https://github.com/${profile.githubUsername}`} className="text-slate-400 hover:text-white transition-colors">
              <Github className="w-4.5 h-4.5" />
            </a>
          )}
          {profile.linkedinUrl && (
            <a href={profile.linkedinUrl} className="text-slate-400 hover:text-white transition-colors">
              <Linkedin className="w-4.5 h-4.5" />
            </a>
          )}
        </div>
      </header>

      {/* Main showcase canvas */}
      <main className="max-w-4xl mx-auto px-6 mt-16 text-left flex flex-col gap-16">
        {/* Intro Hero Section */}
        <section className="flex flex-col gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-950/20 text-violet-400 text-[10px] font-bold uppercase tracking-wider w-max"
          >
            <Sparkles className="w-3 h-3" /> Available for opportunities
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight font-outfit"
          >
            Hi, I'm <span className="text-gradient">{profile.name}</span>.
          </motion.h1>

          {profile.address && (
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xs text-slate-500 flex items-center gap-1 font-medium"
            >
              <MapPin className="w-3.5 h-3.5" /> {profile.address}
            </motion.p>
          )}

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl font-light mt-4"
          >
            {profile.summary || 'A passionate developer building high-quality, scalable applications using clean code and modern stacks.'}
          </motion.p>
        </section>

        {/* Core skills tagging */}
        {profile.skills?.length > 0 && (
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Code className="w-4 h-4 text-violet-400" /> Technologies & Tooling
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s, idx) => (
                <span key={idx} className="bg-slate-900 border border-white/5 text-slate-300 px-3 py-1 rounded text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Work experience timeline */}
        {profile.experience?.length > 0 && (
          <section className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-400" /> Professional Timeline
            </h3>
            <div className="flex flex-col gap-6 pl-4 border-l border-white/5">
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span className="text-sm">{exp.role} &bull; {exp.company}</span>
                    <span className="font-normal text-slate-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <ul className="list-disc pl-4 text-slate-400 flex flex-col gap-1 mt-1 leading-relaxed">
                    {exp.description?.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects grid */}
        {profile.projects?.length > 0 && (
          <section className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-400" /> Selected Projects
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {profile.projects.map((proj, idx) => (
                <div key={idx} className="p-6 rounded-xl border border-white/5 bg-slate-900/30 flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{proj.title}</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed font-light">{proj.description}</p>
                  </div>

                  <div className="flex gap-4 items-center mt-2 pt-3 border-t border-white/5 text-[10px] text-slate-400 font-semibold">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} className="hover:text-white flex items-center gap-1">
                        <Github className="w-3.5 h-3.5" /> Source
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} className="hover:text-white flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Academic backgrounds */}
        {profile.education?.length > 0 && (
          <section className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-violet-400" /> Academic credentials
            </h3>
            <div className="flex flex-col gap-4">
              {profile.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs border-b border-white/5 pb-4 last:border-none">
                  <div>
                    <h4 className="font-bold text-slate-200">{edu.school}</h4>
                    <p className="text-slate-400 mt-1">{edu.degree} in {edu.fieldOfStudy}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">{edu.startDate} - {edu.endDate}</span>
                    {edu.cgpa && <p className="text-violet-400 mt-1 font-semibold">GPA: {edu.cgpa}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact details footer */}
        <section className="flex flex-col gap-4 border-t border-white/5 pt-12 text-center items-center">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Get In Touch</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Let's collaborate on building developer tools or full-stack software products.
          </p>
          <div className="flex gap-3 mt-4 text-xs font-semibold">
            <a href="mailto:alex@resumeforge.ai" className="px-4 py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 rounded-lg flex items-center gap-2 text-slate-300 hover:text-white">
              <Mail className="w-4 h-4" /> Email Me
            </a>
            {resumes[0] && (
              <a 
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resumes/${resumes[0]._id}/pdf?token=${localStorage.getItem('token')}`}
                download
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center gap-2 shadow"
              >
                <Download className="w-4 h-4" /> Download Resume
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
