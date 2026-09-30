import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { BinGauge } from '../../components/BinGauge';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  ShieldAlert, 
  Cpu, 
  Recycle, 
  Trash2, 
  FileText, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

const CATEGORY_COLORS = {
  E_WASTE: '#F59E0B',
  DRY_RECYCLABLE: '#3B82F6',
  BIODEGRADABLE: '#10B981',
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bins, setBins] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, binsData, predData] = await Promise.all([
        api.admin.getStats(),
        api.bins.getAll(),
        api.bins.getPredictions(),
      ]);
      setStats(statsData);
      setBins(binsData);
      setPredictions(predData);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEmptyBin = async (binId) => {
    try {
      await api.bins.emptyBin(binId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustCapacity = async (binId, cap) => {
    try {
      await api.bins.updateCapacity(binId, cap);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Prepare chart data
  const categoryData = stats
    ? Object.entries(stats.category_distribution || {}).map(([key, val]) => ({
        name: key === 'E_WASTE' ? 'E-Waste' : key === 'DRY_RECYCLABLE' ? 'Dry Recyclable' : 'Biodegradable',
        rawKey: key,
        value: val || 1,
      }))
    : [];

  const lifecycleData = stats
    ? Object.entries(stats.status_distribution || {}).map(([key, val]) => ({
        stage: key.replace('_', ' '),
        count: val,
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title & Quick Links */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-eco-400 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Campus Sustainability Operations Command Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            EcoTrace Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry, automated lifecycle status progression, and predictive collection sweeps.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/lifecycle"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Advance Lifecycle Stages</span>
          </Link>
          <Link
            to="/admin/bins"
            className="px-4 py-2.5 bg-eco-600 hover:bg-eco-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Smart Bins Telemetry</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scans Logged"
          value={stats?.total_scans || 0}
          subtitle="AI waste detections"
          icon={Recycle}
          color="blue"
        />
        <StatCard
          title="Total Waste Diverted"
          value={stats?.total_diverted_kg || 0}
          unit="kg"
          subtitle="From campus landfills"
          icon={TrendingUp}
          color="eco"
        />
        <StatCard
          title="E-Waste Passports"
          value={stats?.total_passports || 0}
          subtitle="Cryptographically verified"
          icon={Cpu}
          color="amber"
        />
        <StatCard
          title="Bins Requiring Sweep"
          value={stats?.bins_needing_collection || 0}
          subtitle="Threshold ≥ 85% reached"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Waste Distribution Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Waste Stream Breakdown</h3>
            <p className="text-xs text-slate-500">Distribution across UN SDG 11 categories</p>
          </div>

          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={CATEGORY_COLORS[entry.rawKey] || '#94A3B8'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-xs">
            <div>
              <p className="text-slate-400 font-bold">Organic</p>
              <p className="font-mono font-bold text-emerald-600 mt-0.5">
                {stats?.category_distribution?.BIODEGRADABLE || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-bold">Dry Recyclable</p>
              <p className="font-mono font-bold text-blue-600 mt-0.5">
                {stats?.category_distribution?.DRY_RECYCLABLE || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-bold">E-Waste</p>
              <p className="font-mono font-bold text-amber-600 mt-0.5">
                {stats?.category_distribution?.E_WASTE || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Lifecycle Status Pipeline Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">E-Waste Custody Pipeline</h3>
            <p className="text-xs text-slate-500">
              Active items moving across verified stages from registration to recycling
            </p>
          </div>

          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lifecycleData}>
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Every transition is signed with tamper-evident SHA-256 hashes.</span>
            <Link to="/admin/lifecycle" className="font-bold text-eco-600 hover:text-eco-700">
              Manage Custody &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Smart Bins Telemetry & Predictive Collection Alerts */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-eco-600" />
              <span>Campus Smart-Bin Stations & Predictive Sweep Alerts</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live capacity and time-to-full (90%) calculations. Use simulation controls to test triggers.
            </p>
          </div>

          <Link
            to="/admin/bins"
            className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
          >
            Full Telemetry Station &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {bins.map((bin) => (
            <BinGauge
              key={bin.id}
              bin={bin}
              onEmpty={handleEmptyBin}
              onAdjustCapacity={handleAdjustCapacity}
              showAdminControls={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
