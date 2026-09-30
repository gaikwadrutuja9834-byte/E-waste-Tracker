import React, { useState } from 'react';
import { QrCode, ExternalLink, Copy, Check, Download, ShieldCheck } from 'lucide-react';

export const QRCodeCard = ({ passportId, qrImage, objectName }) => {
  const [copied, setCopied] = useState(false);
  const verifyUrl = `${window.location.origin}/verify/${passportId}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `EcoTrace-${passportId}.png`;
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
      <div className="flex items-center gap-2 text-xs font-bold text-eco-700 bg-eco-50 px-3 py-1 rounded-full border border-eco-200">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Physical Asset Verification Tag</span>
      </div>

      {/* QR Code Container */}
      <div className="mt-5 p-4 bg-white rounded-xl border-2 border-slate-900 shadow-md relative group">
        {qrImage ? (
          <img
            src={qrImage}
            alt={`QR Code for ${passportId}`}
            className="w-48 h-48 object-contain rounded"
          />
        ) : (
          <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded">
            <QrCode className="w-16 h-16 text-slate-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Passport ID badge */}
      <div className="mt-4">
        <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Passport Identifier</p>
        <span className="font-mono text-lg font-black text-slate-900 tracking-widest bg-slate-100 px-3 py-1 rounded-md border border-slate-200 mt-1 inline-block">
          {passportId}
        </span>
      </div>

      <p className="text-xs text-slate-500 mt-2 max-w-xs">
        Affix this tag to <strong>{objectName || 'item'}</strong>. Scanning verifies custody and certifies recycling compliance.
      </p>

      {/* Action Buttons */}
      <div className="mt-5 w-full space-y-2">
        <a
          href={`/verify/${passportId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 bg-eco-600 hover:bg-eco-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
        >
          <ExternalLink className="w-4 h-4" />
          Open Public Verification Page
        </a>

        <div className="flex items-center gap-2">
          <button
            onClick={copyUrl}
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-eco-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={handleDownload}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
            title="Download QR code image"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeCard;
