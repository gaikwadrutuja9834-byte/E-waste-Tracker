import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ShieldCheck, 
  Recycle, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Lock, 
  Building2, 
  Leaf, 
  Calendar,
  ExternalLink,
  Award
} from 'lucide-react';

export const PublicVerify = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        // Call public verification endpoint
        const verifyRes = await api.passports.publicVerify(id);
        setData(verifyRes);

        // Also fetch passport specs
        const passRes = await api.passports.getById(id);
        setPassport(passRes);
      } catch (err) {
        setError(err.response?.data?.detail || 'Asset verification failed or ID invalid.');
      } finally {
        setLoading(false);
      }
    };
    fetchVerification();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-eco-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-mono text-slate-300">Checking Cryptographic Custody Ledger for {id}...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Verification Failure</h2>
          <p className="text-xs text-slate-500 mt-2">{error || 'This asset code could not be verified in the EcoTrace Ledger.'}</p>
          <Link
            to="/"
            className="mt-6 inline-block py-2.5 px-4 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            Visit EcoTrace AI
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Top Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-eco-950 border border-eco-500/40 text-eco-400 text-xs font-black shadow-lg mb-3">
            <ShieldCheck className="w-4 h-4 text-eco-400" />
            <span>OFFICIAL ECOTRACE SDG 11 VERIFICATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Verified Digital Waste Passport
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Asset ID: <span className="text-eco-400 font-bold">{id}</span>
          </p>
        </div>

        {/* Verification Certificate Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle watermark */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-eco-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Authenticity Stamp */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-eco-950/60 border border-eco-500/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-eco-500 flex items-center justify-center text-slate-950">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">Authentic Waste Passport</p>
                <p className="text-xs text-eco-400 font-mono">SHA-256 Ledger Chain Verified • Tamper Proof</p>
              </div>
            </div>
            <StatusBadge type="status" value={data.current_status} />
          </div>

          {/* Item Specs */}
          {passport && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-850 border border-slate-800 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Object Tracked</p>
                <p className="text-sm font-extrabold text-white mt-0.5">{passport.object_name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Classification</p>
                <p className="text-sm font-extrabold text-eco-400 mt-0.5">{passport.waste_type}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Certified Weight</p>
                <p className="text-sm font-extrabold text-white mt-0.5 font-mono">{passport.weight_kg} kg</p>
              </div>
            </div>
          )}

          {/* Custody Audit Trail */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-eco-400" />
              <span>Cryptographic Custody Milestones</span>
            </h3>

            <div className="space-y-2.5">
              {data.events.map((evt, idx) => (
                <div
                  key={evt.id || idx}
                  className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-eco-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white uppercase text-[11px]">{evt.status}</span>
                      <p className="text-[11px] text-slate-400">
                        {evt.actor} • <span className="text-slate-300">{evt.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right font-mono text-[10px] text-slate-400">
                    <div>{new Date(evt.timestamp).toLocaleString()}</div>
                    <div className="text-eco-400 truncate max-w-[200px]" title={evt.event_hash}>
                      hash: {evt.event_hash.substring(0, 16)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Impact Summary */}
          {passport && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-eco-950/70 to-slate-850 border border-eco-500/30">
              <div className="flex items-center gap-2 text-eco-400 text-xs font-bold mb-2">
                <Leaf className="w-4 h-4" />
                <span>Certified Circular Economy Impact</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs mt-3">
                <div>
                  <p className="text-slate-400">Landfill Diversion</p>
                  <p className="text-lg font-black text-white font-mono">{passport.weight_kg} kg</p>
                </div>
                <div>
                  <p className="text-slate-400">CO2 Emissions Prevented</p>
                  <p className="text-lg font-black text-eco-400 font-mono">
                    ~{Math.round(passport.weight_kg * 1.45 * 10) / 10} kg
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
            <span>Verified by <strong>EcoTrace AI Protocol</strong></span>
            <Link to="/" className="text-eco-400 hover:text-eco-300 font-semibold flex items-center gap-1">
              <span>Learn more about EcoTrace AI</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicVerify;
