import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, KeyRound, Copy, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { IdData } from '../types';
import { decryptCredential } from '../utils/crypto';

interface PasswordRevealModalProps {
  isOpen: boolean;
  record: IdData | null;
  onClose: () => void;
}

export const PasswordRevealModal: React.FC<PasswordRevealModalProps> = ({
  isOpen,
  record,
  onClose,
}) => {
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPlain, setShowPlain] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (isOpen && record) {
      handleDecrypt();
      setCountdown(30);
      setCopied(false);
      setShowPlain(false);
    } else {
      setDecryptedPassword(null);
      setError(null);
    }
  }, [isOpen, record]);

  // Countdown timer to auto-close/hide for security
  useEffect(() => {
    if (!isOpen || !decryptedPassword) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, decryptedPassword, onClose]);

  const handleDecrypt = async () => {
    if (!record) return;
    setLoading(true);
    setError(null);
    try {
      const plaintext = await decryptCredential(record.encryptedPassword);
      setDecryptedPassword(plaintext);
    } catch (err: any) {
      setError(err.message || 'Failed to decrypt password.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!decryptedPassword) return;
    navigator.clipboard.writeText(decryptedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Secure Credential Vault</h3>
              <p className="text-xs text-gray-500">{record.firmName} ({record.idName})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Firm Name:</span>
              <span className="font-bold text-gray-800">{record.firmName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">User Name:</span>
              <span className="font-semibold text-gray-800">{record.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">ID Name:</span>
              <span className="font-mono text-emerald-800 font-semibold">{record.idName}</span>
            </div>
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
              <span>Decrypting with server vault key...</span>
            </div>
          ) : error ? (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Decrypted Password:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 border border-gray-300 rounded-xl px-3.5 py-2.5 font-mono text-sm tracking-wide text-gray-900 select-all overflow-x-auto">
                    {showPlain ? decryptedPassword : '••••••••••••••••'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPlain(!showPlain)}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition"
                    title={showPlain ? 'Hide' : 'Reveal'}
                  >
                    {showPlain ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition shadow-xs flex items-center gap-1.5"
                    title="Copy Password"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>Auto-clearing in <strong className="text-emerald-800">{countdown}s</strong></span>
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  AES-256 Encrypted
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
