import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { BinGauge } from '../components/BinGauge';
import { 
  ScanLine, 
  FileText, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Recycle, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Plus
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [passports, setPassports] = useState([]);
  const [bins, setBins] = useState([]);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [passportsData, binsData, impactData] = await Promise.all([
          api.passports.getAll(),
          api.bins.getAll(),
          api.points.getMyImpact(),
        ]);
        setPassports(passportsData);
        setBins(binsData);
        setImpact(impactData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-eco-500/20 text-eco-400 text-xs font-bold border border-eco-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UN SDG 11 Campus Sustainability Network</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Welcome, {user?.name}! 👋
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            &ldquo;Don&apos;t just throw it. Know it. Track it. Prove it.&rdquo; Use the AI Scanner to identify
            waste, register digital passports for e-waste, and track verified recycling milestones.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/scanner"
              className="px-5 py-3 bg-eco-600 hover:bg-eco-700 text-white text-xs font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
            >
              <ScanLine className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              <span>Scan Waste Item Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/leaderboard"
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Campus Rank #{impact?.rank || 1}</span>
            </Link>
          </div>
        </div>

        {/* Quick Highlights Badge in Hero */}
        <div className="relative z-10 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm self-start md:self-auto shrink-0 min-w-[200px]">
          <p className="text-xs uppercase font-bold text-slate-400">Green Points Balance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-eco-400 font-mono">
              {user?.green_points || 0}
            </span>
            <span className="text-xs text-slate-400 font-bold">Points</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-300 flex items-center justify-between">
            <span>Passports Tracked:</span>
            <strong className="text-white font-mono">{passports.length}</strong>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Green Points"
          value={user?.green_points || 0}
          unit="pts"
          subtitle="Earned from scans & recycling"
          icon={Award}
          color="eco"
          trend="+25 this week"
        />
        <StatCard
          title="E-Waste Diverted"
          value={impact?.ewaste_diverted_kg || 0}
          unit="kg"
          subtitle="Prevented from landfills"
          icon={Cpu}
          color="amber"
        />
        <StatCard
          title="CO2e Avoided"
          value={impact?.co2_saved_kg || 0}
          unit="kg"
          subtitle="Estimated greenhouse reduction"
          icon={Recycle}
          color="blue"
        />
        <StatCard
          title="Campus Rank"
          value={`#${impact?.rank || 7}`}
          subtitle="Top 10% eco-contributor"
          icon={Sparkles}
          color="indigo"
        />
      </div>

      {/* Active Digital Waste Passports Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-eco-600" />
              <span>Your Digital Waste Passports</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified digital custody chains created for your electronics and hazardous waste.
            </p>
          </div>

          <Link
            to="/scanner"
            className="text-xs font-bold text-eco-700 bg-eco-50 hover:bg-eco-100 px-3.5 py-2 rounded-xl border border-eco-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Register New Item
          </Link>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading your passports...</div>
          ) : passports.length === 0 ? (
            <div className="py-12 text-center max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Passports Created Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Scan your first e-waste item (laptop, charger, battery) to generate a traceable Digital Waste Passport.
              </p>
              <Link
                to="/scanner"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-eco-600 text-white text-xs font-bold rounded-xl"
              >
                <ScanLine className="w-4 h-4" />
                Scan Waste Now
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Passport ID</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Weight</th>
                    <th className="py-3 px-4">Lifecycle Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {passports.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-eco-700">
                        {p.passport_id}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{p.object_name}</td>
                      <td className="py-3 px-4">
                        <StatusBadge type="category" value={p.waste_type} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{p.weight_kg} kg</td>
                      <td className="py-3 px-4">
                        <StatusBadge type="status" value={p.current_status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/passport/${p.passport_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Campus Smart Bins Live Health */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-blue-600" />
              <span>Campus Smart-Bin Stations</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live capacity telemetry and predictive fill alerts across campus locations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {bins.map((bin) => (
            <BinGauge key={bin.id} bin={bin} showAdminControls={false} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
