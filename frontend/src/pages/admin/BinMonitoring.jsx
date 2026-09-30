import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BinGauge } from '../../components/BinGauge';
import { Trash2, AlertTriangle, Clock, RefreshCw, Zap, Truck, CheckCircle2 } from 'lucide-react';

export const BinMonitoring = () => {
  const [bins, setBins] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [binsData, predData] = await Promise.all([
        api.bins.getAll(),
        api.bins.getPredictions(),
      ]);
      setBins(binsData);
      setPredictions(predData);
    } catch (err) {
      console.error(err);
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
      setNotification(`Smart Bin #${binId} successfully emptied by collection sweep.`);
      setTimeout(() => setNotification(''), 4000);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <Trash2 className="w-3.5 h-3.5" />
            <span>IoT Smart-Bin Software Simulator & Predictive Dispatch</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Smart-Bin Capacity Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill rate monitoring, linear velocity forecasting, and predictive collection dispatch alerts.
          </p>
        </div>

        <button
          onClick={loadData}
          className="text-xs px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Sensors
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-eco-50 border border-eco-200 text-eco-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-eco-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Predictive Alerts Alert Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Predictive Collection Schedule Alerts</span>
        </h2>

        <div className="space-y-3">
          {predictions.map((p) => {
            const isUrgent = p.priority === 'CRITICAL' || p.priority === 'HIGH';

            return (
              <div
                key={p.bin_id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                  isUrgent
                    ? 'bg-rose-50/70 border-rose-300 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      isUrgent ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm">{p.name}</span>
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-[10px]">
                        {p.capacity_percent}% Full
                      </span>
                    </div>
                    <p className="mt-1 font-medium">{p.collection_recommendation}</p>
                    <p className="text-[11px] opacity-75 mt-0.5">📍 {p.location}</p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <button
                    onClick={() => handleEmptyBin(p.bin_id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 sm:ml-auto ${
                      isUrgent
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Dispatch Collection</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Bins with Interactive Sliders */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Active Station Telemetry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bins.map((bin) => (
            <div key={bin.id} className="flex flex-col">
              <BinGauge
                bin={bin}
                onEmpty={handleEmptyBin}
                onAdjustCapacity={handleAdjustCapacity}
                showAdminControls={true}
              />
              {/* Interactive slider for hackathon demonstration */}
              <div className="mt-2 bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>Simulate Sensor Reading:</span>
                  <span className="font-mono text-eco-700">{bin.capacity_percent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bin.capacity_percent}
                  onChange={(e) => handleAdjustCapacity(bin.id, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-eco-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BinMonitoring;
