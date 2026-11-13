import React, { useState, useEffect } from 'react';
import { X, Search, Store, Wrench, RefreshCw, KeyRound, User, Phone, MapPin, ArrowRight } from 'lucide-react';
import { dbService } from '../services/db';
import { RetailShop, Mechanic, Reborer, IdData, Employee, CategoryType } from '../types';
import { maskAadhaar, maskPAN } from '../utils/validation';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecordToEdit: (category: CategoryType, recordId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectRecordToEdit,
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | CategoryType>('ALL');
  const [loading, setLoading] = useState(false);

  const [shops, setShops] = useState<RetailShop[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [reborers, setReborers] = useState<Reborer[]>([]);
  const [idDataList, setIdDataList] = useState<IdData[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
      setQuery('');
    }
  }, [isOpen]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [s, m, r, i, e] = await Promise.all([
        dbService.getRetailShops(),
        dbService.getMechanics(),
        dbService.getReborers(),
        dbService.getIdDataList(),
        dbService.getEmployees(),
      ]);
      setShops(s);
      setMechanics(m);
      setReborers(r);
      setIdDataList(i);
      setEmployees(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const digits = query.replace(/\D/g, '');

  const filteredShops = shops.filter((s) => {
    if (!q) return true;
    return (
      s.shopName?.toLowerCase().includes(q) ||
      s.ownerName?.toLowerCase().includes(q) ||
      s.address?.toLowerCase().includes(q) ||
      (digits && s.mobileNumber?.includes(digits))
    );
  });

  const filteredMechanics = mechanics.filter((m) => {
    if (!q) return true;
    return (
      m.garageName?.toLowerCase().includes(q) ||
      m.ownerName?.toLowerCase().includes(q) ||
      m.foremanName?.toLowerCase().includes(q) ||
      m.address?.toLowerCase().includes(q) ||
      (digits && (m.ownerMobileNumber?.includes(digits) || m.foremanMobileNumber?.includes(digits)))
    );
  });

  const filteredReborers = reborers.filter((r) => {
    if (!q) return true;
    return (
      r.repoweringName?.toLowerCase().includes(q) ||
      r.address?.toLowerCase().includes(q) ||
      (digits && r.ownerMobileNumber?.includes(digits))
    );
  });

  const filteredIdData = idDataList.filter((item) => {
    if (!q) return true;
    return (
      item.firmName?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q) ||
      item.idName?.toLowerCase().includes(q) ||
      item.panNumber?.toLowerCase().includes(q) ||
      (digits && item.aadhaarNumber?.includes(digits))
    );
  });

  const totalResults =
    (selectedFilter === 'ALL' || selectedFilter === 'RETAIL_SHOP' ? filteredShops.length : 0) +
    (selectedFilter === 'ALL' || selectedFilter === 'MECHANIC' ? filteredMechanics.length : 0) +
    (selectedFilter === 'ALL' || selectedFilter === 'REBORER' ? filteredReborers.length : 0) +
    (selectedFilter === 'ALL' || selectedFilter === 'ID_DATA' ? filteredIdData.length : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-emerald-900/10 overflow-hidden">
        {/* Top search input */}
        <div className="p-4 bg-emerald-900 text-white flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-300 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search by name, mobile, shop, garage, repowering, firm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-emerald-800/80 border border-emerald-700 rounded-xl px-4 py-2.5 text-white placeholder-emerald-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-2 rounded-lg hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter categories tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4 py-2 gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              selectedFilter === 'ALL'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories ({totalResults})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('RETAIL_SHOP')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'RETAIL_SHOP'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Retail Shops ({filteredShops.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('MECHANIC')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'MECHANIC'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Mechanics ({filteredMechanics.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('REBORER')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'REBORER'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reborers ({filteredReborers.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('ID_DATA')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'ID_DATA'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            ID Records ({filteredIdData.length})
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {totalResults === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No matching records found.
            </div>
          ) : (
            <>
              {/* 1. Retail Shops */}
              {(selectedFilter === 'ALL' || selectedFilter === 'RETAIL_SHOP') &&
                filteredShops.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-emerald-600" />
                      Retail Shops ({filteredShops.length})
                    </h4>
                    {filteredShops.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectRecordToEdit('RETAIL_SHOP', s.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm group-hover:text-emerald-900 truncate">
                              {s.shopName}
                            </span>
                            {s.segment && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                                {s.segment}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                            <span>Owner: {s.ownerName}</span>
                            <span className="font-mono text-gray-800">{s.mobileNumber}</span>
                            <span className="truncate max-w-xs">{s.address}</span>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition shrink-0">
                          Edit <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              {/* 2. Mechanics */}
              {(selectedFilter === 'ALL' || selectedFilter === 'MECHANIC') &&
                filteredMechanics.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-emerald-600" />
                      Mechanics / Garages ({filteredMechanics.length})
                    </h4>
                    {filteredMechanics.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onSelectRecordToEdit('MECHANIC', m.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm group-hover:text-emerald-900 truncate">
                              {m.garageName}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                            <span>Owner: {m.ownerName}</span>
                            <span className="font-mono text-gray-800">{m.ownerMobileNumber}</span>
                            {m.foremanName && <span>Foreman: {m.foremanName}</span>}
                            <span className="truncate max-w-xs">{m.address}</span>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition shrink-0">
                          Edit <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              {/* 3. Reborers */}
              {(selectedFilter === 'ALL' || selectedFilter === 'REBORER') &&
                filteredReborers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-emerald-600" />
                      Reborers ({filteredReborers.length})
                    </h4>
                    {filteredReborers.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          onSelectRecordToEdit('REBORER', r.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm group-hover:text-emerald-900 truncate">
                              {r.repoweringName}
                            </span>
                            {r.segment && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                                {r.segment}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                            <span className="font-mono text-gray-800">Phone: {r.ownerMobileNumber}</span>
                            <span className="truncate max-w-xs">{r.address}</span>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition shrink-0">
                          Edit <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              {/* 4. ID Data */}
              {(selectedFilter === 'ALL' || selectedFilter === 'ID_DATA') &&
                filteredIdData.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                      ID Records ({filteredIdData.length})
                    </h4>
                    {filteredIdData.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectRecordToEdit('ID_DATA', item.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm group-hover:text-emerald-900 truncate">
                              {item.firmName}
                            </span>
                            <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-mono">
                              ID: {item.idName}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                            <span>User: {item.name}</span>
                            <span>Aadhaar: {maskAadhaar(item.aadhaarNumber)}</span>
                            <span>PAN: {maskPAN(item.panNumber)}</span>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition shrink-0">
                          Edit <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
          <span>Click on any result to load into the edit form</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
