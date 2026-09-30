import React from 'react';

export const StatCard = ({ title, value, unit = '', subtitle, icon: Icon, color = 'eco', trend }) => {
  const colorMap = {
    eco: 'bg-eco-50 text-eco-700 border-eco-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const iconBgMap = {
    eco: 'bg-eco-500 text-white shadow-eco-200 shadow-md',
    blue: 'bg-blue-600 text-white shadow-blue-200 shadow-md',
    amber: 'bg-amber-500 text-white shadow-amber-200 shadow-md',
    rose: 'bg-rose-500 text-white shadow-rose-200 shadow-md',
    indigo: 'bg-indigo-600 text-white shadow-indigo-200 shadow-md',
    slate: 'bg-slate-700 text-white',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
            {unit && <span className="text-sm font-semibold text-slate-500">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl flex items-center justify-center ${iconBgMap[color] || iconBgMap.eco}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && (
            <span className="font-semibold text-eco-600 bg-eco-50 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
