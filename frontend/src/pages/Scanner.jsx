import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ScanLine, 
  UploadCloud, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  FileCheck2, 
  HelpCircle,
  Cpu,
  Recycle,
  Leaf
} from 'lucide-react';

const PRESETS = [
  { id: 'laptop', label: '💻 Laptop Computer', category: 'E_WASTE', desc: 'Circuitry & battery' },
  { id: 'battery', label: '🔋 Lithium Battery', category: 'E_WASTE', desc: 'Hazardous chemicals' },
  { id: 'bottle', label: '🥤 Plastic Water Bottle', category: 'DRY_RECYCLABLE', desc: 'Clean polymer' },
  { id: 'apple', label: '🍎 Apple Core', category: 'BIODEGRADABLE', desc: 'Compostable biomass' },
  { id: 'cardboard', label: '📦 Cardboard Packaging', category: 'DRY_RECYCLABLE', desc: 'Paper pulp' },
];

export const Scanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [disposalConfirmed, setDisposalConfirmed] = useState(false);
  const [creatingPassport, setCreatingPassport] = useState(false);

  const fileInputRef = useRef(null);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, or WEBP)');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
      processImage(file, null, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (presetId) => {
    setError('');
    setSelectedFile(null);
    setPreviewUrl(null);
    processImage(null, presetId, null);
  };

  const processImage = async (file, presetId, localPreview) => {
    setIsAnalyzing(true);
    setError('');
    setResult(null);
    setDisposalConfirmed(false);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('image', file);
      }
      if (presetId) {
        formData.append('item_preset', presetId);
      }

      // Small simulated delay for laser scan effect realism
      const [res] = await Promise.all([
        api.scanner.predict(formData),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);

      if (localPreview && !res.preview_url) {
        res.preview_url = localPreview;
      }
      setResult(res);
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis service temporarily unavailable.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreatePassport = async () => {
    if (!result) return;
    setCreatingPassport(true);
    try {
      const payload = {
        object_name: result.object_name,
        waste_type: result.predicted_category,
        weight_kg: result.estimated_weight_kg || 1.5,
        recycler_partner: 'EcoCycle Certified Urban Recyclers Ltd',
      };
      const passport = await api.passports.create(payload);
      await refreshUser();
      navigate(`/passport/${passport.passport_id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate Digital Waste Passport.');
      setCreatingPassport(false);
    }
  };

  const handleConfirmDisposal = async () => {
    if (!result) return;
    try {
      await api.scanner.confirmDisposal(
        result.object_name,
        result.predicted_category,
        result.estimated_weight_kg
      );
      setDisposalConfirmed(true);
      await refreshUser();
    } catch (err) {
      setError('Could not verify disposal.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError('');
    setDisposalConfirmed(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco-100 text-eco-800 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-eco-600" />
          <span>Multimodal SDG 11 Vision Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          AI Waste Classifier & Scanner
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Upload or photograph any campus waste item. Our AI instantly classifies it into Biodegradable,
          Dry Recyclable, or Hazardous E-Waste with disposal protocols.
        </p>
      </div>

      {error && (
        <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Scanner Container */}
      {!result ? (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-10">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`scanner-grid relative rounded-2xl border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[260px] overflow-hidden ${
              isAnalyzing
                ? 'border-eco-500 bg-eco-50/40'
                : 'border-slate-300 hover:border-eco-500 hover:bg-slate-50/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isAnalyzing}
            />

            {/* Radar Laser Scan Animation */}
            {isAnalyzing && (
              <div className="absolute inset-x-0 h-16 radar-beam animate-scan-line pointer-events-none" />
            )}

            {isAnalyzing ? (
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="w-14 h-14 rounded-full bg-eco-100 flex items-center justify-center text-eco-600 animate-spin">
                  <RefreshCw className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Analyzing Spectral Properties...</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Extracting materials, determining toxicity risk level, and generating disposal recommendations...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-eco-50 text-eco-600 flex items-center justify-center shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Click to Upload or Drag Image Here
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPG, PNG, WEBP • Max 10 MB • Live camera upload
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Select Image / Snap Photo
                </button>
              </div>
            )}
          </div>

          {/* Quick Demo Presets */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quick Test Items (Instant Simulation)
              </span>
              <span className="text-[11px] text-eco-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Ready for live demo
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  disabled={isAnalyzing}
                  onClick={() => handlePresetSelect(p.id)}
                  className="p-3 text-left rounded-xl border border-slate-200 hover:border-eco-500 hover:bg-eco-50/40 transition-all group disabled:opacity-50"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-eco-700">
                    {p.label}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Result Page / Analysis Card */
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-eco-500 text-slate-950 uppercase tracking-wider">
                  AI Analysis Complete
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Confidence: {Math.round(result.confidence * 100)}%
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-2 text-white flex items-center gap-2">
                {result.object_name}
              </h2>
            </div>

            <button
              onClick={handleReset}
              className="self-start sm:self-auto text-xs px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Scan Another Item
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Classification & Risk Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Classification</p>
                <div className="mt-2">
                  <StatusBadge type="category" value={result.predicted_category} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Risk Level</p>
                <div className="mt-2">
                  <StatusBadge type="risk" value={result.risk_level} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated Weight</p>
                <p className="text-lg font-black text-slate-800 mt-1">
                  {result.estimated_weight_kg} <span className="text-xs font-normal text-slate-500">kg</span>
                </p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>Model Diagnostic Confidence</span>
                <span className="font-mono text-eco-700 font-bold">{Math.round(result.confidence * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-eco-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.round(result.confidence * 100)}%` }}
                />
              </div>
            </div>

            {/* Recommended Bin Directive Box */}
            <div
              className={`p-5 rounded-2xl border ${
                result.predicted_category === 'E_WASTE'
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                  : result.predicted_category === 'DRY_RECYCLABLE'
                  ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                  : 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Recommended Disposal Bin:</span>
                <span className="underline decoration-2">{result.recommended_bin}</span>
              </div>
              <p className="text-xs mt-2 leading-relaxed opacity-90">
                {result.disposal_instructions}
              </p>
            </div>

            {/* Special handling alert if E-Waste */}
            {result.special_handling && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Special Handling & Environmental Hazard Warning</p>
                  <p className="mt-0.5 text-rose-700">
                    {result.hazard_level}. Improper disposal can lead to groundwater contamination and heavy metal toxicity.
                    A Digital Waste Passport is mandatory for custody tracking.
                  </p>
                </div>
              </div>
            )}

            {/* Points notification */}
            <div className="p-3 rounded-xl bg-eco-50 border border-eco-200 flex items-center justify-between text-xs text-eco-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-eco-600" />
                <span>Scan reward applied: <strong>+5 Green Points</strong></span>
              </div>
              <span className="font-bold font-mono">Current: {user?.green_points} pts</span>
            </div>

            {/* Action buttons based on Category */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              {result.predicted_category === 'E_WASTE' ? (
                <button
                  onClick={handleCreatePassport}
                  disabled={creatingPassport}
                  className="w-full py-4 px-6 bg-eco-600 hover:bg-eco-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <FileCheck2 className="w-5 h-5 text-eco-200 group-hover:scale-110 transition-transform" />
                  <span>
                    {creatingPassport ? 'Generating Cryptographic Passport...' : 'Create Digital Waste Passport'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-full space-y-3">
                  {!disposalConfirmed ? (
                    <button
                      onClick={handleConfirmDisposal}
                      className="w-full py-3.5 px-6 bg-eco-600 hover:bg-eco-700 text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Bin Disposal (+10 Green Points)</span>
                    </button>
                  ) : (
                    <div className="p-4 rounded-2xl bg-eco-100 text-eco-900 font-bold text-center text-sm flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-eco-600" />
                      <span>Disposal verified! +10 points credited to your eco balance.</span>
                    </div>
                  )}

                  <button
                    onClick={handleCreatePassport}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Optional: Generate Digital Passport for this item</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
