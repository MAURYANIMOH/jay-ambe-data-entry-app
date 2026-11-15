import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Search,
  Plus,
  Edit3,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building,
  User,
  CreditCard,
} from 'lucide-react';
import { IdData } from '../types';
import { dbService } from '../services/db';
import { maskAadhaar, maskPAN } from '../utils/validation';
import { PasswordRevealModal } from './PasswordRevealModal';
import { ConfirmationModal } from './ConfirmationModal';

interface IdDataListProps {
  onEditIdData: (idRecordId: string) => void;
  onAddNew: () => void;
}

export const IdDataList: React.FC<IdDataListProps> = ({ onEditIdData, onAddNew }) => {
  const [records, setRecords] = useState<IdData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Unmask toggles per record ID for Aadhaar and PAN
  const [unmaskedAadhaarIds, setUnmaskedAadhaarIds] = useState<Set<string>>(new Set());
  const [unmaskedPanIds, setUnmaskedPanIds] = useState<Set<string>>(new Set());

  // Password Reveal Modal state
  const [activeRecordForPassword, setActiveRecordForPassword] = useState<IdData | null>(null);

  // Delete modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    recordId: string;
    firmName: string;
  }>({
    isOpen: false,
    recordId: '',
    firmName: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await dbService.getIdDataList();
      setRecords(list);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.recordId) return;
    await dbService.deleteIdData(deleteConfirm.recordId);
    setDeleteConfirm({ isOpen: false, recordId: '', firmName: '' });
    loadData();
  };

  const toggleAadhaarMask = (id: string) => {
    const next = new Set(unmaskedAadhaarIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setUnmaskedAadhaarIds(next);
  };

  const togglePanMask = (id: string) => {
    const next = new Set(unmaskedPanIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setUnmaskedPanIds(next);
  };

  const filteredRecords = records.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const digits = searchQuery.replace(/\D/g, '');
    const matchFirm = r.firmName?.toLowerCase().includes(q);
    const matchName = r.name?.toLowerCase().includes(q);
    const matchIdName = r.idName?.toLowerCase().includes(q);
    const matchPan = r.panNumber?.toLowerCase().includes(q);
    const matchAadhaar = digits && r.aadhaarNumber?.includes(digits);

    return matchFirm || matchName || matchIdName || matchPan || matchAadhaar;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-950/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-700" />
            ID & Firm Credentials Directory ({filteredRecords.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Encrypted portal logins, masked Aadhaar (Verhoeff) and PAN records
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add ID Record
        </button>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Zero-Knowledge Storage:</strong> Passwords are encrypted with AES-256-GCM. Aadhaar & PAN are masked by default and excluded from raw logs.
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Firm Name, Person Name, ID Name, or PAN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 outline-hidden"
        />
      </div>

      {/* Record Cards */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading ID Data...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
          No ID records found matching your query.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((item) => {
            const isAadhaarUnmasked = unmaskedAadhaarIds.has(item.id);
            const isPanUnmasked = unmaskedPanIds.has(item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition shadow-xs p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-emerald-800" />
                        {item.firmName}
                      </h3>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono">
                        Portal ID: {item.idName}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 text-xs">
                      <div>
                        <span className="text-gray-500">Authorized Person: </span>
                        <strong className="text-gray-800">{item.name}</strong>
                      </div>

                      {/* Aadhaar with Mask Toggle */}
                      <div className="flex items-center gap-1.5 font-mono">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-500 font-sans">Aadhaar:</span>
                        <span className="font-semibold text-gray-900">
                          {isAadhaarUnmasked ? item.aadhaarNumber : maskAadhaar(item.aadhaarNumber)}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleAadhaarMask(item.id)}
                          className="text-gray-400 hover:text-emerald-700 p-1"
                          title={isAadhaarUnmasked ? 'Mask Aadhaar' : 'Unmask Aadhaar'}
                        >
                          {isAadhaarUnmasked ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* PAN with Mask Toggle */}
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-gray-500 font-sans">PAN:</span>
                        <span className="font-semibold text-gray-900 tracking-wider">
                          {isPanUnmasked ? item.panNumber : maskPAN(item.panNumber)}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePanMask(item.id)}
                          className="text-gray-400 hover:text-emerald-700 p-1"
                          title={isPanUnmasked ? 'Mask PAN' : 'Unmask PAN'}
                        >
                          {isPanUnmasked ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Status Banner */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-mono">
                        <Lock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Password: ••••••••</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveRecordForPassword(item)}
                        className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Reveal Password
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
                    <button
                      onClick={() => onEditIdData(item.id)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-semibold text-xs transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          isOpen: true,
                          recordId: item.id,
                          firmName: item.firmName,
                        })
                      }
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Password Decryption & Reveal Modal */}
      <PasswordRevealModal
        isOpen={!!activeRecordForPassword}
        record={activeRecordForPassword}
        onClose={() => setActiveRecordForPassword(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="DELETE ID RECORD"
        message={`Are you sure you want to delete credentials for "${deleteConfirm.firmName}"?`}
        subMessage="This will permanently delete this ID entry and its encrypted credentials from local storage."
        type="danger"
        confirmText="Delete Record"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, recordId: '', firmName: '' })}
      />
    </div>
  );
};
