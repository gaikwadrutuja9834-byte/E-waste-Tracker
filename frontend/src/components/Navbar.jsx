import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Recycle, 
  ScanLine, 
  FileText, 
  Award, 
  BarChart3, 
  ShieldAlert, 
  LogOut, 
  User, 
  Trash2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eco-500 to-eco-700 flex items-center justify-center text-white shadow-md shadow-eco-500/20 group-hover:scale-105 transition-transform">
            <Recycle className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900">ECOTRACE</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-eco-100 text-eco-800">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium -mt-0.5 hidden sm:block">
              Detection to Verified Recycling
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/scanner"
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                isActive('/scanner')
                  ? 'bg-eco-50 text-eco-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ScanLine className="w-4 h-4 text-eco-600" />
              <span>AI Scanner</span>
            </Link>

            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                isActive('/dashboard')
                  ? 'bg-eco-50 text-eco-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Passports</span>
            </Link>

            <Link
              to="/impact"
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                isActive('/impact')
                  ? 'bg-eco-50 text-eco-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Impact</span>
            </Link>

            <Link
              to="/leaderboard"
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                isActive('/leaderboard')
                  ? 'bg-eco-50 text-eco-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4 text-indigo-500" />
              <span>Leaderboard</span>
            </Link>

            {/* Admin Links */}
            {isAdmin && (
              <div className="flex items-center pl-2 ml-2 border-l border-slate-200 gap-1">
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                    isActive('/admin/dashboard')
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-eco-400" />
                  <span>Admin Hub</span>
                </Link>

                <Link
                  to="/admin/bins"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                    isActive('/admin/bins')
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Trash2 className="w-4 h-4 text-blue-400" />
                  <span>Smart Bins</span>
                </Link>

                <Link
                  to="/admin/lifecycle"
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                    isActive('/admin/lifecycle')
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Lifecycle Advancer</span>
                </Link>
              </div>
            )}
          </nav>
        )}

        {/* User Account / Points / Auth Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Green Points Pill */}
              <Link
                to="/impact"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-eco-50 border border-eco-200 text-eco-800 text-xs font-bold hover:bg-eco-100 transition-colors shadow-2xs"
                title="Your Green Points balance"
              >
                <span>🌱</span>
                <span>{user?.green_points || 0}</span>
                <span className="hidden sm:inline text-eco-600 font-semibold">pts</span>
              </Link>

              {/* Role & User Badge */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
                <span
                  className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {isAdmin ? 'ADMIN' : 'STUDENT'}
                </span>
                <span className="font-semibold text-slate-800 max-w-[120px] truncate">{user?.name}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold text-white bg-eco-600 hover:bg-eco-700 px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
