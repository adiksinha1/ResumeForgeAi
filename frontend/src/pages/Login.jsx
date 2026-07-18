import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, Github, Chrome, Linkedin } from 'lucide-react';
import { loginUser, demoLoginUser } from '../store/authSlice.js';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const res = await dispatch(loginUser(data));
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const handleDemoBypass = async () => {
    const res = await dispatch(demoLoginUser());
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-6 relative">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-teal-700/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-700/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl relative text-left">
        <div className="flex flex-col items-center mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/25 mb-4">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-outfit text-white">Sign In to ResumeForge</h2>
          <p className="text-slate-400 text-xs mt-1">Access your professional dashboard</p>
        </div>

        <div className="mt-6 p-4 rounded-xl border border-teal-500/20 bg-teal-950/20 text-center flex flex-col gap-2">
          <p className="text-xs text-teal-300 font-medium">Want to inspect the application features instantly?</p>
          <button onClick={handleDemoBypass} disabled={loading} className="w-full py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 text-white font-semibold rounded-lg text-xs transition-all shadow flex items-center justify-center gap-1">
            ⚡ Instant Demo Login Bypass
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4 text-left">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 font-medium">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-white/10 focus:border-teal-500 text-sm focus:outline-none transition-colors"
                {...register('email', { required: 'Email address is required' })}
              />
            </div>
            {errors.email && <span className="text-[10px] text-red-400 mt-1">{errors.email.message}</span>}
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" style={{ display: 'none' }} className="text-[10px] text-teal-400 hover:underline">Forgot?</Link>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-white/10 focus:border-teal-500 text-sm focus:outline-none transition-colors"
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && <span className="text-[10px] text-red-400 mt-1">{errors.password.message}</span>}
          </div>

          <button type="submit" disabled={loading} className="w-full mt-2 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-widest">Or login with</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* OAuth provider mocks */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={handleDemoBypass} className="py-2 rounded-lg bg-slate-950 border border-white/5 hover:bg-slate-900 hover:border-white/10 transition-all flex items-center justify-center text-slate-400 hover:text-white">
            <Chrome className="w-4 h-4" />
          </button>
          <button onClick={handleDemoBypass} className="py-2 rounded-lg bg-slate-950 border border-white/5 hover:bg-slate-900 hover:border-white/10 transition-all flex items-center justify-center text-slate-400 hover:text-white">
            <Github className="w-4 h-4" />
          </button>
          <button onClick={handleDemoBypass} className="py-2 rounded-lg bg-slate-950 border border-white/5 hover:bg-slate-900 hover:border-white/10 transition-all flex items-center justify-center text-slate-400 hover:text-white">
            <Linkedin className="w-4 h-4" />
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-400 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
