import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { 
  Leaf, 
  Award, 
  Cpu, 
  Recycle, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Sparkles,
  Zap,
  Globe2
} from 'lucide-react';

export const Impact = () => {
  const { user } = useAuth();
  const [impact, setImpact] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImpact = async () => {
      try {
        setLoading(true);
        const [impactData, historyData] = await Promise.all([
          api.points.getMyImpact(),
          api.points.getHistory(),
        ]);
        setImpact(impactData);
        setHistory(historyData);
      } catch (err) {
        console.error('Failed to load impact scorecard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadImpact();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-eco-100 text-eco-800 text-xs font-bold mb-2">
            <Globe2 className="w-3.5 h-3.5" />
            <span>UN SDG 11 Scorecard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Environmental Impact & Green Points
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quantifiable environmental metrics derived from your verified waste scans and e-waste recycling custody chains.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-eco-500 text-white shadow-md shadow-eco-200">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Total Eco Balance</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono">{user?.green_points || 0}</span>
              <span className="text-xs font-bold text-eco-600">Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Landfill Diversion"
          value={impact?.total_waste_diverted_kg || 0}
          unit="kg"
          subtitle="Tracked waste diverted"
          icon={Recycle}
          color="eco"
        />
        <StatCard
          title="CO2e Emissions Saved"
          value={impact?.co2_saved_kg || 0}
          unit="kg"
          subtitle="Avoided mineral extraction"
          icon={Leaf}
          color="blue"
        />
        <StatCard
          title="Toxic Metals Sealed"
          value={impact?.toxic_materials_prevented_g || 0}
          unit="g"
          subtitle="Lead & Cadmium neutralized"
          icon={Cpu}
          color="rose"
        />
        <StatCard
          title="Energy Conserved"
          value={Math.round((impact?.total_waste_diverted_kg || 0) * 2.8 * 10) / 10}
          unit="kWh"
          subtitle="Recycling energy offset"
          icon={Zap}
          color="amber"
        />
      </div>

      {/* How points are calculated explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Green Points Reward Rules</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            EcoTrace incentivizes every action along the circular journey:
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="font-medium text-slate-700">AI Waste Scan</span>
              <span className="font-bold text-eco-700 font-mono">+5 Pts</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="font-medium text-slate-700">Proper Bin Disposal Confirmed</span>
              <span className="font-bold text-eco-700 font-mono">+10 Pts</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="font-medium text-slate-700">E-Waste Passport Registered</span>
              <span className="font-bold text-eco-700 font-mono">+25 Pts</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-eco-50 border border-eco-200 text-xs">
              <span className="font-bold text-eco-900">Verified Recycling Milestone</span>
              <span className="font-black text-eco-700 font-mono">+50 Pts</span>
            </div>
          </div>
        </div>

        {/* Recent Points Ledger */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Points Activity Ledger</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Last 25 transactions</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading ledger...</div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No points transactions yet. Scan a waste item to earn points!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{log.reason}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(log.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <span className="font-black font-mono text-eco-700 bg-eco-50 px-2.5 py-1 rounded-md border border-eco-200 shrink-0">
                    +{log.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Impact;
