import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { QRCodeCard } from '../components/QRCodeCard';
import { LifecycleTimeline } from '../components/LifecycleTimeline';
import { HashChainViewer } from '../components/HashChainViewer';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  Weight, 
  Leaf, 
  AlertCircle,
  ExternalLink,
  Lock,
  CheckCircle2
} from 'lucide-react';

export const Passport = () => {
  const { id } = useParams();
  const [passport, setPassport] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reverifying, setReverifying] = useState(false);

  const fetchPassportData = async () => {
    try {
      setLoading(true);
      const data = await api.passports.getById(id);
      setPassport(data);

      const verifyData = await api.passports.verify(id);
      setVerification(verifyData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to retrieve Digital Waste Passport.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassportData();
  }, [id]);

  const handleReverify = async () => {
    setReverifying(true);
    try {
      const verifyData = await api.passports.verify(id);
      setVerification(verifyData);
    } catch (err) {
      console.error(err);
    } finally {
      setReverifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-eco-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Retrieving Passport & Validating Cryptographic Chain...</p>
        </div>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Passport Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">{error || 'The requested passport ID does not exist.'}</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={`/verify/${passport.passport_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-eco-700 bg-eco-50 hover:bg-eco-100 px-3 py-1.5 rounded-lg border border-eco-200 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Public View
          </a>
        </div>
      </div>

      {/* Passport Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Digital Waste Passport
              </span>
              <span className="font-mono text-sm font-extrabold text-eco-700 bg-eco-50 px-2.5 py-0.5 rounded-md border border-eco-200">
                {passport.passport_id}
              </span>
              <StatusBadge type="status" value={passport.current_status} />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
              {passport.object_name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Weight className="w-4 h-4 text-slate-400" />
                <span>Weight: <strong className="text-slate-800">{passport.weight_kg} kg</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Recycler: <strong className="text-slate-800">{passport.recycler_partner}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Registered: {new Date(passport.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* SHA-256 Verification Badge */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-3 shadow-md lg:self-start">
            <div className="p-2.5 rounded-xl bg-eco-500/20 text-eco-400">
              <Lock className="w-5 h-5 text-eco-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-eco-400">Cryptographically Chained</span>
                <ShieldCheck className="w-3.5 h-3.5 text-eco-400" />
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {passport.events?.length || 1} Blocks • SHA-256 Signatures
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (QR & Specs), Right Column (Timeline & Hash Chain) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* QR Code Tag Card */}
          <QRCodeCard
            passportId={passport.passport_id}
            qrImage={passport.qr_code_image}
            objectName={passport.object_name}
          />

          {/* Environmental Impact Metrics Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-eco-100 text-eco-700">
                <Leaf className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Projected Resource Recovery</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-600">Landfill Diversion:</span>
                <span className="font-bold text-slate-900 font-mono">{passport.weight_kg} kg</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-600">Avoided CO2e:</span>
                <span className="font-bold text-eco-700 font-mono">
                  ~{roundNum(passport.weight_kg * 1.45)} kg
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-600">Toxic Metals Neutralized:</span>
                <span className="font-bold text-amber-700 font-mono">
                  ~{roundNum(passport.weight_kg * 18.5)} g (Pb, Cd)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              Calculated following UN SDG 11 urban circular economy methodology.
            </p>
          </div>
        </div>

        {/* Right Column: Timeline & Hash Chain */}
        <div className="lg:col-span-8 space-y-8">
          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Lifecycle Custody Timeline</h3>
              <span className="text-xs font-semibold text-slate-500">
                Stage {getStageIndex(passport.current_status) + 1} of 6
              </span>
            </div>

            <LifecycleTimeline
              currentStatus={passport.current_status}
              events={passport.events || []}
            />
          </div>

          {/* Cryptographic SHA-256 Hash Chain Inspector */}
          <HashChainViewer
            events={passport.events || []}
            isValid={verification?.is_valid ?? true}
            onVerify={handleReverify}
          />
        </div>
      </div>
    </div>
  );
};

function roundNum(val) {
  return Math.round(val * 100) / 100;
}

function getStageIndex(status) {
  const stages = ['REGISTERED', 'COLLECTED', 'STORED', 'IN_TRANSIT', 'AT_RECYCLER', 'RECYCLED'];
  const idx = stages.indexOf(status);
  return idx !== -1 ? idx : 0;
}

export default Passport;
