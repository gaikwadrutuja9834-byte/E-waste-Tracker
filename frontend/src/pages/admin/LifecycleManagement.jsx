import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  ExternalLink, 
  Lock, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

const STAGES = [
  'REGISTERED',
  'COLLECTED',
  'STORED',
  'IN_TRANSIT',
  'AT_RECYCLER',
  'RECYCLED',
];

export const LifecycleManagement = () => {
  const [passports, setPassports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancingId, setAdvancingId] = useState(null);
  const [notification, setNotification] = useState('');

  const loadPassports = async () => {
    try {
      setLoading(true);
      const data = await api.passports.getAll();
      setPassports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPassports();
  }, []);

  const handleAdvance = async (passportId, currentStatus) => {
    setAdvancingId(passportId);
    setNotification('');
    try {
      const updated = await api.admin.advancePassportStage(passportId);
      setNotification(
        `✓ Passport ${passportId} advanced to "${updated.current_status}". New SHA-256 block linked!`
      );
      await loadPassports();
    } catch (err) {
      console.error(err);
    } finally {
      setAdvancingId(null);
    }
  };

  const getNextStage = (curr) => {
    const idx = STAGES.indexOf(curr);
    if (idx === -1 || idx >= STAGES.length - 1) return null;
    return STAGES[idx + 1];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Custody Operations & SHA-256 Chaining Engine</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          E-Waste Lifecycle Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Move assets through verified custody stages: <strong>REGISTERED &rarr; COLLECTED &rarr; STORED &rarr; IN TRANSIT &rarr; AT RECYCLER &rarr; RECYCLED</strong>. 
          Each transition triggers cryptographic SHA-256 hash chaining to ensure tamper-evident provenance.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-eco-50 border border-eco-200 text-eco-800 text-xs font-bold flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-eco-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Passports List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Active E-Waste Registry ({passports.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">1-Click Live Stage Advancer</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading registry...</div>
        ) : passports.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No passports found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {passports.map((p) => {
              const nextStage = getNextStage(p.current_status);
              const isRecycled = p.current_status === 'RECYCLED';
              const isBusy = advancingId === p.passport_id;

              return (
                <div
                  key={p.id}
                  className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-eco-700">
                        {p.passport_id}
                      </span>
                      <StatusBadge type="status" value={p.current_status} size="sm" />
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{p.object_name}</h3>
                    <p className="text-xs text-slate-500">
                      Weight: <strong>{p.weight_kg} kg</strong> • Recycler: {p.recycler_partner}
                    </p>
                  </div>

                  {/* Stage Advancement Action Box */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {!isRecycled && nextStage ? (
                      <button
                        onClick={() => handleAdvance(p.passport_id, p.current_status)}
                        disabled={isBusy}
                        className="py-2.5 px-4 bg-eco-600 hover:bg-eco-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>
                          {isBusy ? 'Hashing & Chaining...' : `Advance to "${nextStage.replace('_', ' ')}"`}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="py-2 px-3 rounded-xl bg-eco-50 border border-eco-200 text-eco-800 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-eco-600" />
                        <span>Recycling Complete (+50 Pts Credited)</span>
                      </div>
                    )}

                    <Link
                      to={`/passport/${p.passport_id}`}
                      className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>View Passport & Ledger</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LifecycleManagement;
