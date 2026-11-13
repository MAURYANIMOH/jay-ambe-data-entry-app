import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Lock,
  Store,
  Wrench,
  RefreshCw,
  Users,
  KeyRound,
  Database,
} from 'lucide-react';
import { exportAllDataToExcel } from '../utils/excelExport';
import { BackupRestoreManager } from './BackupRestoreManager';

interface ExportModalProps {
  initialTab?: 'excel' | 'json';
  onDataImported?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ initialTab = 'json', onDataImported }) => {
  const [activeSubTab, setActiveSubTab] = useState<'excel' | 'json'>(initialTab);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportExcel = async () => {
    setExporting(true);
    setExportSuccess(false);
    try {
      await exportAllDataToExcel();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Tab Switcher: JSON Backup/Restore vs Excel Spreadsheet */}
      <div className="bg-white rounded-2xl p-2 border border-emerald-950/10 shadow-xs flex gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('json')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
            activeSubTab === 'json'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>JSON Database Backup & Restore</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('excel')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
            activeSubTab === 'excel'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excel Multi-Sheet Export (.xlsx)</span>
        </button>
      </div>

      {/* SUBTAB 1: JSON BACKUP & RESTORE */}
      {activeSubTab === 'json' && (
        <BackupRestoreManager onDataChanged={onDataImported} />
      )}

      {/* SUBTAB 2: EXCEL WORKBOOK EXPORT */}
      {activeSubTab === 'excel' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-800 border border-emerald-200">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Excel Multi-Sheet Workbook (.xlsx)</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Export high-visibility spreadsheet reports for management and inventory review
                  </p>
                </div>
              </div>
            </div>

            {/* 5-Sheet Breakdown Cards */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-3">
                5 Dedicated Worksheets Included:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-950 mb-1">
                    <Store className="w-4 h-4 text-emerald-700" />
                    Sheet 1: Retail Shop
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Shop name, owner, mobile, address, segment, and multi-line connected mechanics list.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-950 mb-1">
                    <Wrench className="w-4 h-4 text-emerald-700" />
                    Sheet 2: Mechanic
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Garage name, owner phone, foreman details, deal-in segments, purchase name, and remark.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-950 mb-1">
                    <RefreshCw className="w-4 h-4 text-emerald-700" />
                    Sheet 3: Reborer
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Repowering unit, owner mobile, address, and structured list of work-in employees.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-950 mb-1">
                    <Users className="w-4 h-4 text-emerald-700" />
                    Sheet 4: Employees
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Employee names, phone numbers, birth dates, and affiliated reborer workshop links.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-950 mb-1">
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                    Sheet 5: ID Data (Secured)
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Firm & ID name with masked Aadhaar/PAN. <strong>Passwords are never exported</strong> per zero-trust standards.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Rule callout */}
            <div className="mt-5 p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Security Guard:</strong> Aadhaar numbers are masked by default (•••• •••• 1234), PAN numbers are masked (••••••123A), and passwords remain safely encrypted in the vault and are omitted from all spreadsheet exports.
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center gap-2"
              >
                <Download className="w-5 h-5 text-emerald-300" />
                {exporting ? 'Generating Excel Workbook...' : 'Download Full Network Excel (.xlsx)'}
              </button>

              {exportSuccess && (
                <div className="text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  Excel workbook generated and downloaded!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
