import React from 'react';
import { 
  Cpu, 
  Recycle, 
  Leaf, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Archive, 
  Building2, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const StatusBadge = ({ type, value, size = 'md' }) => {
  const isSizeSmall = size === 'sm';
  const sizeClasses = isSizeSmall ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1 font-semibold';

  // Waste Categories
  if (type === 'category') {
    switch (value) {
      case 'E_WASTE':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 shadow-sm ${sizeClasses}`}>
            <Cpu className="w-3.5 h-3.5 text-amber-600" />
            E-Waste
          </span>
        );
      case 'DRY_RECYCLABLE':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 text-blue-800 shadow-sm ${sizeClasses}`}>
            <Recycle className="w-3.5 h-3.5 text-blue-600" />
            Dry Recyclable
          </span>
        );
      case 'BIODEGRADABLE':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm ${sizeClasses}`}>
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            Biodegradable
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 text-slate-700 ${sizeClasses}`}>
            {value}
          </span>
        );
    }
  }

  // Risk Level
  if (type === 'risk') {
    switch (value) {
      case 'HIGH':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 text-rose-700 font-bold ${sizeClasses}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700 ${sizeClasses}`}>
            MEDIUM RISK
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 ${sizeClasses}`}>
            LOW RISK
          </span>
        );
    }
  }

  // Lifecycle Status
  switch (value) {
    case 'REGISTERED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 text-sky-800 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          Registered
        </span>
      );
    case 'COLLECTED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-indigo-300 bg-indigo-50 text-indigo-800 ${sizeClasses}`}>
          <Truck className="w-3.5 h-3.5 text-indigo-600" />
          Collected
        </span>
      );
    case 'STORED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-purple-300 bg-purple-50 text-purple-800 ${sizeClasses}`}>
          <Archive className="w-3.5 h-3.5 text-purple-600" />
          Stored Securely
        </span>
      );
    case 'IN_TRANSIT':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 ${sizeClasses}`}>
          <Truck className="w-3.5 h-3.5 text-amber-600" />
          In Transit
        </span>
      );
    case 'AT_RECYCLER':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-cyan-300 bg-cyan-50 text-cyan-800 ${sizeClasses}`}>
          <Building2 className="w-3.5 h-3.5 text-cyan-600" />
          At Recycler
        </span>
      );
    case 'RECYCLED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-eco-500 bg-eco-50 text-eco-800 font-bold shadow-sm ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-eco-600" />
          Recycled & Verified
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {value}
        </span>
      );
  }
};

export default StatusBadge;
