import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const sgFont = { fontFamily: "'Space Grotesk', sans-serif" };

const RegisterPage = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const res = await api.post('/auth/register', { name: data.name, email: data.email, password: data.password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const inputStyle = {
    background: 'var(--surface-panel)',
    border: '1px solid var(--border-default)',
    color: 'var(--content-primary)',
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <Link to="/"
        className="mb-8 text-2xl font-bold tracking-tighter uppercase"
        style={{ ...sgFont, color: 'var(--content-primary)' }}>
        NetSim
      </Link>

      <div className="w-full max-w-md glass-panel rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-1" style={{ ...sgFont, color: 'var(--content-primary)' }}>Create an Account</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--content-secondary)' }}>Start designing your network topologies</p>

        {apiError && (
          <div className="mb-5 p-3 rounded-lg text-sm text-center border"
            style={{ background: 'rgba(255,180,171,0.08)', borderColor: 'rgba(255,180,171,0.25)', color: '#ffb4ab' }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--accent-primary)', ...sgFont }}>
              Full Name
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 18, color: 'var(--content-muted)' }}>person</span>
              <input {...register('name')} type="text" placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg" style={inputStyle} />
            </div>
            {errors.name && <p className="mt-1.5 text-xs" style={{ color: '#ffb4ab' }}>{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--accent-primary)', ...sgFont }}>
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 18, color: 'var(--content-muted)' }}>mail</span>
              <input {...register('email')} type="email" placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg" style={inputStyle} />
            </div>
            {errors.email && <p className="mt-1.5 text-xs" style={{ color: '#ffb4ab' }}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--accent-primary)', ...sgFont }}>
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 18, color: 'var(--content-muted)' }}>lock</span>
              <input {...register('password')} type="password" placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg" style={inputStyle} />
            </div>
            {errors.password && <p className="mt-1.5 text-xs" style={{ color: '#ffb4ab' }}>{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 btn-primary-gradient rounded-lg text-white text-sm flex justify-center items-center disabled:opacity-60"
            style={sgFont}>
            {isSubmitting
              ? <span className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              : 'Create Account'
            }
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--content-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--accent-primary)'}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
