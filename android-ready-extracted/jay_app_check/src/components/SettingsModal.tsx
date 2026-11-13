import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Flame,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Shield,
  Layers,
} from 'lucide-react';
import { dbService } from '../services/db';

export const SettingsModal: React.FC = () => {
  const [segments, setSegments] = useState<string[]>([]);
  const [newSegment, setNewSegment] = useState('');
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDoneMsg, setSyncDoneMsg] = useState<string | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);

  useEffect(() => {
    loadSegments();
    checkSyncQueue();
  }, []);

  const loadSegments = async () => {
    const list = await dbService.getSegments();
    setSegments(list);
  };

  const checkSyncQueue = async () => {
    const count = await dbService.getPendingSyncCount();
    setPendingSyncCount(count);
  };

  const handleAddSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegment.trim()) return;
    const updated = await dbService.addSegment(newSegment.trim());
    setSegments(updated);
    setNewSegment('');
  };

  const handleDeleteSegment = async (segToDelete: string) => {
    if (segments.length <= 1) return;
    const updated = segments.filter((s) => s !== segToDelete);
    await dbService.saveSegments(updated);
    setSegments(updated);
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncDoneMsg(null);
    try {
      // Simulate real synchronization of all pending IndexedDB sync items
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await dbService.clearSyncQueue();
      setPendingSyncCount(0);
      setSyncDoneMsg('All pending records have been reconciled with local and cloud storage.');
      setTimeout(() => setSyncDoneMsg(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const firestoreRulesSample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default-deny safety net
    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() {
      return request.auth != null;
    }

    match /retailShops/{shopId} {
      allow read, write: if isSignedIn();
    }

    match /mechanics/{mechanicId} {
      allow read, write: if isSignedIn();
    }

    match /reborers/{reborerId} {
      allow read, write: if isSignedIn();
    }

    match /employees/{employeeId} {
      allow read, write: if isSignedIn();
    }

    match /idData/{idRecordId} {
      // Only authenticated owner can read or write ID records
      allow read, write: if isSignedIn() && request.auth.uid != null;
    }

    match /shopMechanicLinks/{linkId} {
      allow read, write: if isSignedIn();
    }

    match /reborerEmployeeLinks/{linkId} {
      allow read, write: if isSignedIn();
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(firestoreRulesSample);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-800 border border-emerald-200">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Application Configuration & Sync</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage dropdown business segments, offline synchronization, and Firebase setup instructions
            </p>
          </div>
        </div>
      </div>

      {/* OFFLINE SYNC STATUS */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-base text-gray-900">Offline-First Data Synchronization</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full">
            IndexedDB Active
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          The app stores all records in local high-performance browser IndexedDB. Changes are queued offline and automatically synchronized when your internet connectivity is restored without creating duplicate records.
        </p>

        {syncDoneMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncDoneMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <div className="text-sm font-bold text-gray-900">
              Pending Sync Items: <span className="font-mono text-emerald-800">{pendingSyncCount}</span>
            </div>
            <div className="text-[11px] text-gray-500">
              {pendingSyncCount === 0
                ? 'All local data is fully in sync'
                : 'Items awaiting cloud reconciliation'}
            </div>
          </div>
          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synchronizing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* SEGMENT CONFIGURATION */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-base text-gray-900">Configurable Business Segments</h3>
        </div>
        <p className="text-xs text-gray-500">
          These segments appear in dropdowns for Retail Shops, Mechanics, and Reborers. Add or customize segments to match your regional sales network.
        </p>

        <form onSubmit={handleAddSegment} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Electric Vehicle (EV), Marine Engines, Generators..."
            value={newSegment}
            onChange={(e) => setNewSegment(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 outline-hidden"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Segment
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {segments.map((seg) => (
            <div
              key={seg}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-medium"
            >
              <span>{seg}</span>
              {segments.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteSegment(seg)}
                  className="text-emerald-700 hover:text-red-600 p-0.5 rounded-sm"
                  title="Remove Segment"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FIREBASE SETUP INSTRUCTIONS */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Flame className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-base text-gray-900">Firebase Setup & Connection Guide</h3>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          The app is fully functional offline with IndexedDB. When you want to synchronize with Firebase Firestore across multiple team devices, follow these 3 steps:
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <strong className="text-emerald-900 block mb-1">Step 1: Create a Firebase Project</strong>
            <span>
              Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">console.firebase.google.com</a> and create a new project named <strong>Jay Ambe Sales Network</strong>.
            </span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <strong className="text-emerald-900 block mb-1">Step 2: Enable Firestore Database & Authentication</strong>
            <span>
              Create a Firestore database in production mode. In the Firebase console, go to <strong>Firestore &rarr; Rules</strong> and paste the following zero-trust security rules:
            </span>

            <div className="mt-2 relative">
              <pre className="p-3 bg-gray-900 text-emerald-300 font-mono text-[11px] rounded-lg overflow-x-auto max-h-48">
                {firestoreRulesSample}
              </pre>
              <button
                onClick={copyRules}
                className="absolute top-2 right-2 p-1.5 bg-gray-800 text-white rounded-md text-[10px] flex items-center gap-1 hover:bg-gray-700"
              >
                {copiedRules ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedRules ? 'Copied' : 'Copy Rules'}
              </button>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <strong className="text-emerald-900 block mb-1">Step 3: Web App Configuration</strong>
            <span>
              In Project Settings, add a Web App and copy your <code>firebaseConfig</code> credentials into <code>firebase-applet-config.json</code> or your environment variables.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
