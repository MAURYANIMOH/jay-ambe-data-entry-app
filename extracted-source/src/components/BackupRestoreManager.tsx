import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Store,
  Wrench,
  Users,
  KeyRound,
  FileCheck,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import { dbService } from '../services/db';
import { BackupValidationResult, RestoreResult } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface BackupRestoreManagerProps {
  onDataChanged?: () => void;
}

export const BackupRestoreManager: React.FC<BackupRestoreManagerProps> = ({ onDataChanged }) => {
  const [dbStats, setDbStats] = useState({
    totalShops: 0,
    totalMechanics: 0,
    totalReborers: 0,
    totalEmployees: 0,
    totalIdRecords: 0,
    totalConnectedMechanics: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pretty' | 'compact'>('pretty');
  const [lastExportTime, setLastExportTime] = useState<string | null>(null);

  // Import / Inspection state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<BackupValidationResult | null>(null);
  const [parsedBackupData, setParsedBackupData] = useState<any | null>(null);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccessResult, setRestoreSuccessResult] = useState<RestoreResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clear confirmation modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    setLoadingStats(true);
    try {
      const stats = await dbService.getDashboardStats();
      setDbStats(stats);
    } finally {
      setLoadingStats(false);
    }
  };

  // 1. Manual Backup / Export
  const handleExportBackup = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const backupObj = await dbService.exportDatabaseBackup();
      const jsonString =
        exportFormat === 'pretty'
          ? JSON.stringify(backupObj, null, 2)
          : JSON.stringify(backupObj);

      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `JAY_AMBE_DATABASE_BACKUP_${dateStr}_${timeStr}.json`;

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setLastExportTime(now.toLocaleTimeString());
    } catch (err: any) {
      setErrorMessage(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Select & Inspect File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMessage(null);
    setRestoreSuccessResult(null);
    setInspecting(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        setParsedBackupData(parsed);

        const validation = dbService.validateBackupFile(parsed);
        setInspectionResult(validation);

        if (!validation.isValid) {
          setErrorMessage(validation.error || 'The file does not contain recognizable Jay Ambe database records.');
        }
      } catch (err: any) {
        setErrorMessage('Failed to parse file: Invalid JSON syntax.');
        setInspectionResult(null);
        setParsedBackupData(null);
      } finally {
        setInspecting(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Could not read the selected file.');
      setInspecting(false);
    };

    reader.readAsText(file);
  };

  // 3. Execute Restore
  const handleExecuteRestore = async () => {
    if (!parsedBackupData) return;
    setIsRestoring(true);
    setErrorMessage(null);
    setShowRestoreConfirm(false);

    try {
      const result = await dbService.restoreDatabaseBackup(parsedBackupData, restoreMode);
      setRestoreSuccessResult(result);
      await loadDatabaseStats();
      if (onDataChanged) onDataChanged();

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedFile(null);
      setParsedBackupData(null);
      setInspectionResult(null);
    } catch (err: any) {
      setErrorMessage(`Restore failed: ${err.message || 'Unknown error occurred.'}`);
    } finally {
      setIsRestoring(false);
    }
  };

  // 4. Wipe / Clear Database
  const handleClearDatabase = async () => {
    try {
      await dbService.clearAllDatabaseData();
      await loadDatabaseStats();
      if (onDataChanged) onDataChanged();
      setShowClearConfirm(false);
    } catch (err: any) {
      setErrorMessage(`Clear failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Status Cards */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-950/10 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-800 border border-emerald-200">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">IndexedDB Database Snapshot & Migration</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Local-first portable backup system. Safely export and restore all data tables.
              </p>
            </div>
          </div>
          <button
            onClick={loadDatabaseStats}
            className="p-2 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition self-start sm:self-auto"
            title="Refresh database counts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Live Counts Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Retail Shops</span>
            <span className="text-xl font-extrabold text-emerald-900 mt-0.5 block">
              {loadingStats ? '...' : dbStats.totalShops}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Mechanics</span>
            <span className="text-xl font-extrabold text-emerald-900 mt-0.5 block">
              {loadingStats ? '...' : dbStats.totalMechanics}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Reborers</span>
            <span className="text-xl font-extrabold text-emerald-900 mt-0.5 block">
              {loadingStats ? '...' : dbStats.totalReborers}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Employees</span>
            <span className="text-xl font-extrabold text-emerald-900 mt-0.5 block">
              {loadingStats ? '...' : dbStats.totalEmployees}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">ID Records</span>
            <span className="text-xl font-extrabold text-emerald-900 mt-0.5 block">
              {loadingStats ? '...' : dbStats.totalIdRecords}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Shop-Mechanic Links</span>
            <span className="text-xl font-extrabold text-emerald-900 mt-0.5 block">
              {loadingStats ? '...' : dbStats.totalConnectedMechanics}
            </span>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold">Error Processing Backup:</strong>
            <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* SUCCESS ALERT */}
      {restoreSuccessResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold text-emerald-950">
              Database Successfully Restored ({restoreSuccessResult.mode === 'replace' ? 'Full Overwrite' : 'Merged'})!
            </strong>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                Shops: <strong>{restoreSuccessResult.restoredCounts.retailShops}</strong>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                Mechanics: <strong>{restoreSuccessResult.restoredCounts.mechanics}</strong>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                Reborers: <strong>{restoreSuccessResult.restoredCounts.reborers}</strong>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                Staff: <strong>{restoreSuccessResult.restoredCounts.employees}</strong>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                ID Records: <strong>{restoreSuccessResult.restoredCounts.idData}</strong>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                Shop Links: <strong>{restoreSuccessResult.restoredCounts.shopMechanicLinks}</strong>
              </div>
            </div>
          </div>
          <button
            onClick={() => setRestoreSuccessResult(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================
            SECTION 1: EXPORT / BACKUP PANEL
            ======================================================== */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-950/10 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Download className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-base text-gray-900">Create JSON Backup</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Export an exact snapshot of your local database to a standalone JSON file. You can save this file securely to Google Drive, USB drives, or email it to transfer your network data to another computer or phone.
            </p>

            {/* Export Format Selector */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-700 block">File Formatting</span>
                <span className="text-[11px] text-gray-400">
                  {exportFormat === 'pretty' ? 'Readable formatted JSON' : 'Compact minified JSON'}
                </span>
              </div>
              <div className="flex gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setExportFormat('pretty')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    exportFormat === 'pretty'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Formatted
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('compact')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    exportFormat === 'compact'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Minified
                </button>
              </div>
            </div>

            {/* Content summary */}
            <div className="mt-4 space-y-1.5 text-xs text-gray-600 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Includes:</strong> Retail Shops, Mechanics, Reborers, Staff, Links, and Config.
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Encrypted credentials are saved with secure cryptographic keys.</span>
              </div>
            </div>

            {lastExportTime && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Last backup downloaded today at {lastExportTime}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            {isExporting ? 'Generating JSON Backup...' : 'Download Full JSON Backup'}
          </button>
        </div>

        {/* ========================================================
            SECTION 2: IMPORT / RESTORE PANEL
            ======================================================== */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-950/10 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Upload className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-base text-gray-900">Restore from JSON Backup</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Upload a previously downloaded JSON file to restore your database. The file will be inspected and validated before any data is updated.
            </p>

            {/* File Dropzone / Picker */}
            <div className="mt-4">
              <label className="border-2 border-dashed border-emerald-200 hover:border-emerald-600 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-emerald-50/20 hover:bg-emerald-50/50 transition">
                <FileJson className="w-8 h-8 text-emerald-700 mb-2" />
                <span className="text-xs font-bold text-gray-800">
                  {selectedFile ? selectedFile.name : 'Select or Drop Backup JSON File'}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5">Accepts .json files</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Inspection Pre-Restore Preview Card */}
            {inspecting && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                Inspecting backup file contents...
              </div>
            )}

            {inspectionResult && inspectionResult.isValid && (
              <div className="mt-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-700" />
                    Valid Backup Verified
                  </span>
                  {inspectionResult.exportedAt && (
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(inspectionResult.exportedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[11px] text-gray-700 pt-1">
                  <div>Shops: <strong>{inspectionResult.counts.retailShops}</strong></div>
                  <div>Mechanics: <strong>{inspectionResult.counts.mechanics}</strong></div>
                  <div>Reborers: <strong>{inspectionResult.counts.reborers}</strong></div>
                  <div>Staff: <strong>{inspectionResult.counts.employees}</strong></div>
                  <div>ID Data: <strong>{inspectionResult.counts.idData}</strong></div>
                  <div>Links: <strong>{inspectionResult.counts.shopMechanicLinks}</strong></div>
                </div>

                {/* Mode Selector */}
                <div className="pt-2 border-t border-emerald-200">
                  <span className="block font-semibold text-emerald-950 mb-1.5">Select Restore Mode:</span>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                      <input
                        type="radio"
                        name="restoreMode"
                        value="merge"
                        checked={restoreMode === 'merge'}
                        onChange={() => setRestoreMode('merge')}
                        className="text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>Merge & Update (Safe: keeps unmatching records intact)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-900">
                      <input
                        type="radio"
                        name="restoreMode"
                        value="replace"
                        checked={restoreMode === 'replace'}
                        onChange={() => setRestoreMode('replace')}
                        className="text-amber-700 focus:ring-amber-600"
                      />
                      <span>Full Replace (Wipe existing data and load exact snapshot)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowRestoreConfirm(true)}
            disabled={!inspectionResult || !inspectionResult.isValid || isRestoring}
            className={`w-full py-3 px-4 font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 ${
              inspectionResult && inspectionResult.isValid && !isRestoring
                ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Upload className="w-4 h-4" />
            {isRestoring ? 'Restoring Database...' : 'Restore Database Now'}
          </button>
        </div>
      </div>

      {/* DANGER ZONE: WIPE LOCAL DATABASE */}
      <div className="bg-red-50/50 rounded-2xl p-5 sm:p-6 border border-red-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-red-950 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-700" />
              Reset Local IndexedDB
            </h4>
            <p className="text-xs text-red-800 mt-1">
              Need to clear test data? Download a JSON backup first, then clear all stores.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-700 font-semibold text-xs rounded-xl transition shadow-xs self-start sm:self-auto shrink-0"
          >
            Wipe All Local Data
          </button>
        </div>
      </div>

      {/* CONFIRMATION 1: RESTORE CONFIRM */}
      <ConfirmationModal
        isOpen={showRestoreConfirm}
        title="CONFIRM DATABASE RESTORE"
        message={
          restoreMode === 'replace'
            ? 'Warning: Full Replace mode will overwrite your entire existing database with the records from this file.'
            : 'Merge mode will add new records and update any existing matching records from the backup file.'
        }
        subMessage="Are you sure you want to proceed with this restoration?"
        type={restoreMode === 'replace' ? 'danger' : 'warning'}
        confirmText="Yes, Restore Now"
        onConfirm={handleExecuteRestore}
        onCancel={() => setShowRestoreConfirm(false)}
      />

      {/* CONFIRMATION 2: CLEAR CONFIRM */}
      <ConfirmationModal
        isOpen={showClearConfirm}
        title="WIPE LOCAL DATABASE"
        message="Are you sure you want to delete all Retail Shops, Mechanics, Reborers, Staff, and ID records from this device?"
        subMessage="This action is irreversible unless you have previously downloaded a JSON backup."
        type="danger"
        confirmText="Confirm Wipe"
        onConfirm={handleClearDatabase}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
