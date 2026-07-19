import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Sparkles, User, Mail, Lock, AlertCircle, ArrowRight, Github, Chrome, Linkedin } from 'lucide-react';
import { registerUser, demoLoginUser } from '../store/authSlice.js';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const res = await dispatch(registerUser(data));
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
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-700/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl relative">
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/25 mb-4">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="font-outfit text-2xl font-bold">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1">Start building premium ATS-Optimized resumes</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4 text-left">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 font-medium">Full Name</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-white/10 focus:border-teal-500 text-sm focus:outline-none transition-colors"
                {...register('name', { 
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
              />
            </div>
            {errors.name && <span className="text-[10px] text-red-400 mt-1">{errors.name.message}</span>}
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">Email Address</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-white/10 focus:border-teal-500 text-sm focus:outline-none transition-colors"
                {...register('email', { required: 'Email is required' })}
              />
            </div>
            {errors.email && <span className="text-[10px] text-red-400 mt-1">{errors.email.message}</span>}
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">Password</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-white/10 focus:border-teal-500 text-sm focus:outline-none transition-colors"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />
            </div>
            {errors.password && <span className="text-[10px] text-red-400 mt-1">{errors.password.message}</span>}
          </div>

          <button type="submit" disabled={loading} className="w-full mt-2 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
            {loading ? 'Registering...' : 'Register'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-widest">Or register with</span>
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
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
