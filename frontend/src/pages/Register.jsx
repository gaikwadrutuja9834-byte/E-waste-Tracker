import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, ArrowRight, AlertCircle, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const extractErrorMessage = (err, fallback) => {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
    }
    if (err.message && !err.response) {
      return 'Cannot reach backend server. Please make sure the backend is running on http://localhost:8000';
    }
    return fallback;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err, 'Registration failed. Try another email.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoRole) => {
    setError('');
    setSubmitting(true);
    try {
      await demoLogin(demoRole);
      navigate(demoRole === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError('Cannot connect to backend server. Make sure it is running on http://localhost:8000');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-eco-600 text-white shadow-md shadow-eco-500/30 mb-3">
            <Recycle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create EcoTrace Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join the campus circular economy network & earn green points
          </p>
        </div>

        {/* 1-Click Demo Buttons for Fast Evaluation */}
        <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">
            ⚡ Quick 1-Click Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleQuickDemo('student')}
              className="py-1.5 px-2.5 bg-eco-600 hover:bg-eco-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Student Demo
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-eco-400" />
              Admin Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-eco-500 focus:ring-2 focus:ring-eco-200 outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Campus Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@campus.edu"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-eco-500 focus:ring-2 focus:ring-eco-200 outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-eco-500 focus:ring-2 focus:ring-eco-200 outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <label
                className={`flex items-center justify-center p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                  role === 'USER'
                    ? 'border-eco-500 bg-eco-50 text-eco-800 ring-2 ring-eco-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="USER"
                  checked={role === 'USER'}
                  onChange={() => setRole('USER')}
                  className="sr-only"
                />
                <span>Student / Citizen</span>
              </label>

              <label
                className={`flex items-center justify-center p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                  role === 'ADMIN'
                    ? 'border-purple-500 bg-purple-50 text-purple-800 ring-2 ring-purple-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={role === 'ADMIN'}
                  onChange={() => setRole('ADMIN')}
                  className="sr-only"
                />
                <span>Sustainability Admin</span>
              </label>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-eco-50 border border-eco-200 text-eco-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-eco-600 shrink-0" />
            <span>Welcome bonus: <strong>+50 Green Points</strong> awarded on registration!</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-eco-600 hover:bg-eco-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-eco-600 hover:text-eco-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
