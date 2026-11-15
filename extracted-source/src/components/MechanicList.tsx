import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Edit3,
  Trash2,
  Phone,
  MessageCircle,
  Store,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { Mechanic, RetailShop } from '../types';
import { dbService } from '../services/db';
import { ConfirmationModal } from './ConfirmationModal';

interface MechanicListProps {
  onEditMechanic: (mechanicId: string) => void;
  onAddNew: () => void;
}

export const MechanicList: React.FC<MechanicListProps> = ({ onEditMechanic, onAddNew }) => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [shopsMap, setShopsMap] = useState<Map<string, RetailShop>>(new Map());
  const [mechShopsMap, setMechShopsMap] = useState<Map<string, string[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [availableSegments, setAvailableSegments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    mechId: string;
    garageName: string;
  }>({
    isOpen: false,
    mechId: '',
    garageName: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allMechanics, allShops, allLinks, segments] = await Promise.all([
        dbService.getMechanics(),
        dbService.getRetailShops(),
        dbService.getAllShopMechanicLinks(),
        dbService.getSegments(),
      ]);

      setMechanics(allMechanics);
      setAvailableSegments(segments);

      const sMap = new Map<string, RetailShop>();
      allShops.forEach((s) => sMap.set(s.id, s));
      setShopsMap(sMap);

      const msMap = new Map<string, string[]>();
      allLinks.forEach((link) => {
        const cur = msMap.get(link.mechanicId) || [];
        cur.push(link.shopId);
        msMap.set(link.mechanicId, cur);
      });
      setMechShopsMap(msMap);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.mechId) return;
    await dbService.deleteMechanic(deleteConfirm.mechId);
    setDeleteConfirm({ isOpen: false, mechId: '', garageName: '' });
    loadData();
  };

  const filteredMechanics = mechanics.filter((m) => {
    if (selectedSegment !== 'ALL') {
      if (!m.dealInSegments || !m.dealInSegments.includes(selectedSegment)) {
        return false;
      }
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const digits = searchQuery.replace(/\D/g, '');
    const matchName = m.garageName?.toLowerCase().includes(q) || m.ownerName?.toLowerCase().includes(q);
    const matchForeman = m.foremanName?.toLowerCase().includes(q);
    const matchAddress = m.address?.toLowerCase().includes(q);
    const matchPhone = digits && (m.ownerMobileNumber?.includes(digits) || m.foremanMobileNumber?.includes(digits));

    return matchName || matchForeman || matchAddress || matchPhone;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-950/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-700" />
            Mechanics Directory ({filteredMechanics.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Auto service specialists, workshop owners, and segment capabilities
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Mechanic
        </button>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Garage Name, Owner, Foreman, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 outline-hidden"
          >
            <option value="ALL">All Segments</option>
            {availableSegments.map((seg) => (
              <option key={seg} value={seg}>
                {seg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mechanic Cards */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading Mechanics...</div>
      ) : filteredMechanics.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
          No mechanics found matching your criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMechanics.map((mech) => {
            const connectedShopIds = mechShopsMap.get(mech.id) || [];
            const connectedShops = connectedShopIds
              .map((id) => shopsMap.get(id))
              .filter(Boolean) as RetailShop[];

            return (
              <div
                key={mech.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition shadow-xs p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-gray-900">{mech.garageName}</h3>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                        ID: {mech.id}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 text-xs text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-700">Owner: </span>
                        <span>{mech.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="font-semibold text-gray-900">{mech.ownerMobileNumber}</span>
                      </div>
                      {mech.foremanName && (
                        <div>
                          <span className="font-semibold text-gray-700">Foreman: </span>
                          <span>
                            {mech.foremanName} {mech.foremanMobileNumber ? `(${mech.foremanMobileNumber})` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-gray-500 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>{mech.address}</span>
                    </div>

                    {/* Segments & Purchase Name */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {mech.dealInSegments && mech.dealInSegments.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Layers className="w-3.5 h-3.5 text-gray-400" />
                          {mech.dealInSegments.map((s) => (
                            <span
                              key={s}
                              className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {mech.purchaseName && (
                        <span className="text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                          Bill Name: <strong>{mech.purchaseName}</strong>
                        </span>
                      )}
                    </div>

                    {/* Connected Retail Shops info */}
                    {connectedShops.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600">
                        <Store className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Connected to:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {connectedShops.map((s) => (
                            <span
                              key={s.id}
                              className="bg-emerald-100 text-emerald-900 font-medium px-2 py-0.5 rounded-md text-[11px]"
                            >
                              {s.shopName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
                    <a
                      href={`tel:${mech.ownerMobileNumber}`}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition"
                      title="Call Owner"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://wa.me/91${mech.ownerMobileNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onEditMechanic(mech.id)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-semibold text-xs transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          isOpen: true,
                          mechId: mech.id,
                          garageName: mech.garageName,
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="DELETE MECHANIC"
        message={`Are you sure you want to delete "${deleteConfirm.garageName}"?`}
        subMessage="Connected retail shop associations will be cleanly unlinked without deleting the retail shops."
        type="danger"
        confirmText="Delete Mechanic"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, mechId: '', garageName: '' })}
      />
    </div>
  );
};
