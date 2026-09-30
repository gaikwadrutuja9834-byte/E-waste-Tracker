import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Truck, 
  Archive, 
  Building2, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

const STAGES = [
  { key: 'REGISTERED', label: 'Registered', icon: FileText, desc: 'Digital Waste Passport created' },
  { key: 'COLLECTED', label: 'Collected', icon: Truck, desc: 'Picked up from campus station' },
  { key: 'STORED', label: 'Stored Securely', icon: Archive, desc: 'Safe hazardous material vault' },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: Truck, desc: 'Certified logistics to recycler' },
  { key: 'AT_RECYCLER', label: 'At Recycler', icon: Building2, desc: 'Material inbound & verified' },
  { key: 'RECYCLED', label: 'Recycled & Recovered', icon: ShieldCheck, desc: 'Circular raw metals reclaimed' },
];

export const LifecycleTimeline = ({ currentStatus, events = [] }) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);
  const safeCurrentIndex = currentIndex !== -1 ? currentIndex : 0;

  // Map events by stage status for fast lookup
  const eventMap = {};
  events.forEach((evt) => {
    eventMap[evt.status] = evt;
  });

  return (
    <div className="w-full py-4">
      {/* Horizontal Stepper for medium/large screens */}
      <div className="hidden md:grid grid-cols-6 gap-2 relative">
        {/* Connecting Progress Line */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-eco-600 transition-all duration-700"
            style={{ width: `${(safeCurrentIndex / (STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {STAGES.map((stage, idx) => {
          const isCompleted = idx <= safeCurrentIndex;
          const isCurrent = idx === safeCurrentIndex;
          const evt = eventMap[stage.key];
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-eco-600 text-white shadow-md shadow-eco-200'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                } ${isCurrent ? 'ring-4 ring-eco-100 scale-110' : ''}`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>

              <span
                className={`mt-2.5 text-xs font-bold ${
                  isCurrent ? 'text-eco-700' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {stage.label}
              </span>

              {evt ? (
                <span className="text-[10px] text-slate-500 mt-1 font-mono">
                  {new Date(evt.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 mt-1 italic">Pending</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Vertical List with Actor & Location */}
      <div className="mt-8 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Chain Of Custody Log</h4>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
          {STAGES.map((stage, idx) => {
            const evt = eventMap[stage.key];
            const isCompleted = !!evt;
            const isCurrent = stage.key === currentStatus;

            return (
              <div
                key={stage.key}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isCurrent ? 'bg-eco-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted
                        ? 'bg-eco-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{stage.label}</span>
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-bold bg-eco-100 text-eco-800 px-2 py-0.5 rounded-full animate-pulse">
                          Current Stage
                        </span>
                      )}
                    </div>
                    {evt ? (
                      <p className="text-xs text-slate-600 mt-0.5">
                        <span className="font-semibold text-slate-700">Handler:</span> {evt.actor} •{' '}
                        <span className="font-semibold text-slate-700">Location:</span> {evt.location}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5 italic">{stage.desc}</p>
                    )}
                  </div>
                </div>

                <div className="sm:text-right text-xs">
                  {evt ? (
                    <div>
                      <span className="font-mono text-slate-600 font-medium">
                        {new Date(evt.timestamp).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                      <div className="text-[10px] text-eco-600 font-mono flex items-center sm:justify-end gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        <span>SHA-256 Signed</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Awaiting dispatch</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LifecycleTimeline;
