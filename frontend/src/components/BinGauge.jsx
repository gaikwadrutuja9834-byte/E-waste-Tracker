import React from 'react';
import { Trash2, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export const BinGauge = ({ bin, onEmpty, onAdjustCapacity, showAdminControls = false }) => {
  const cap = bin.capacity_percent;

  // Determine color status
  let barColor = 'bg-eco-500';
  let badgeText = 'Normal';
  let badgeClass = 'bg-eco-50 text-eco-700 border-eco-200';

  if (cap >= 85) {
    barColor = 'bg-rose-500';
    badgeText = 'Collection Urgent';
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulse';
  } else if (cap >= 70) {
    barColor = 'bg-amber-500';
    badgeText = 'Near Capacity';
    badgeClass = 'bg-amber-50 text-amber-700 border-amber-300';
  }

  // Bin type tag
  const typeLabels = {
    BIODEGRADABLE: { label: 'Organic Compost', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    DRY_RECYCLABLE: { label: 'Dry Recyclables', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    E_WASTE: { label: 'E-Waste Vault', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  };
  const typeInfo = typeLabels[bin.bin_type] || { label: bin.bin_type, color: 'text-slate-700 bg-slate-50' };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${badgeClass}`}>
              {badgeText}
            </span>
          </div>
          <h4 className="mt-2 text-base font-bold text-slate-800">{bin.name}</h4>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <span>📍</span> {bin.location}
          </p>
        </div>

        {/* Capacity Percentage Pill */}
        <div className="text-right">
          <span className="text-2xl font-black text-slate-900">{cap}%</span>
          <p className="text-[11px] text-slate-400 font-medium">Capacity</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(100, Math.max(4, cap))}%` }}
          />
        </div>
      </div>

      {/* Velocity and Telemetry info */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Fill velocity: ~{bin.hourly_fill_rate || 4.5}% / hr</span>
        </div>
        {cap >= 85 && (
          <span className="text-rose-600 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Threshold exceeded
          </span>
        )}
      </div>

      {/* Admin Quick Simulation Actions */}
      {showAdminControls && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onEmpty && onEmpty(bin.id)}
            className="flex-1 text-xs py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            Dispatch & Empty
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAdjustCapacity && onAdjustCapacity(bin.id, Math.min(100, cap + 15))}
              className="text-xs px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-md border border-amber-200"
              title="Simulate Deposit +15%"
            >
              +15%
            </button>
            <button
              onClick={() => onAdjustCapacity && onAdjustCapacity(bin.id, 92)}
              className="text-xs px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-md border border-rose-200"
              title="Simulate Critical Fill 92%"
            >
              92%
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BinGauge;
