import React, { useState } from 'react';
import { ShieldCheck, Lock, Link as LinkIcon, Check, Copy, AlertTriangle } from 'lucide-react';

export const HashChainViewer = ({ events = [], isValid = true, onVerify }) => {
  const [copiedHash, setCopiedHash] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Background cryptographic grid styling */}
      <div className="absolute inset-0 opacity-5 pointer-events-none font-mono text-[9px] select-none break-all p-4 leading-relaxed overflow-hidden">
        {events.map((e) => e.event_hash).join('')}
      </div>

      <div className="relative z-10">
        {/* Header with Verification Stamp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-eco-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Tamper-Evident SHA-256 Hash Chain
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic cryptographic link verification for each custodial milestone.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isValid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-eco-950 border border-eco-500/40 text-eco-400 text-xs font-bold shadow-lg shadow-eco-950/50">
                <ShieldCheck className="w-4 h-4 text-eco-400" />
                INTEGRITY VERIFIED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950 border border-rose-500/40 text-rose-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                TAMPERING DETECTED
              </span>
            )}

            {onVerify && (
              <button
                onClick={onVerify}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition-colors"
              >
                Re-Verify Proof
              </button>
            )}
          </div>
        </div>

        {/* Chain Blocks */}
        <div className="mt-6 space-y-4">
          {events.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No hash events recorded yet.</p>
          ) : (
            events.map((event, idx) => {
              const isGenesis = idx === 0;

              return (
                <div key={event.id || idx} className="relative">
                  {/* Connecting Chain Indicator */}
                  {!isGenesis && (
                    <div className="flex items-center justify-center my-2 text-eco-500/70">
                      <div className="h-4 w-0.5 bg-gradient-to-b from-eco-500 to-eco-600"></div>
                    </div>
                  )}

                  <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700">
                    <div className="flex items-center justify-between gap-3 text-xs mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-eco-400 font-bold border border-slate-700 text-[11px]">
                          Block #{idx + 1}
                        </span>
                        <span className="font-bold text-white uppercase tracking-wider">{event.status}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(event.timestamp).toISOString()}
                      </span>
                    </div>

                    {/* Hashes Data Table */}
                    <div className="space-y-2 text-xs font-mono">
                      {/* Previous Hash */}
                      <div className="flex items-center justify-between gap-2 p-2 rounded bg-slate-900/80 border border-slate-800/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Prev Hash:</span>
                        <span className="text-[11px] text-slate-300 truncate font-mono">
                          {event.previous_hash || '0000000000000000000000000000000000000000000000000000000000000000 (GENESIS)'}
                        </span>
                        {event.previous_hash && (
                          <button
                            onClick={() => copyToClipboard(event.previous_hash, `prev-${event.id}`)}
                            className="p-1 hover:text-white text-slate-500"
                            title="Copy previous hash"
                          >
                            {copiedHash === `prev-${event.id}` ? <Check className="w-3 h-3 text-eco-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      {/* Event Hash (Current) */}
                      <div className="flex items-center justify-between gap-2 p-2 rounded bg-eco-950/40 border border-eco-500/30">
                        <span className="text-[10px] uppercase font-bold text-eco-400 shrink-0">Event Hash:</span>
                        <span className="text-[11px] text-eco-300 truncate font-mono font-bold">
                          {event.event_hash}
                        </span>
                        <button
                          onClick={() => copyToClipboard(event.event_hash, `curr-${event.id}`)}
                          className="p-1 hover:text-white text-eco-400"
                          title="Copy SHA-256 hash"
                        >
                          {copiedHash === `curr-${event.id}` ? <Check className="w-3 h-3 text-eco-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Signer: <strong className="text-slate-300">{event.actor}</strong></span>
                      <span>Location: <strong className="text-slate-300">{event.location}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default HashChainViewer;
