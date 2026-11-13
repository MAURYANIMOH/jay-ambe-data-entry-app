import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  Plus,
  Edit3,
  Trash2,
  Phone,
  MessageCircle,
  Wrench,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { RetailShop, Mechanic, CategoryType } from '../types';
import { dbService } from '../services/db';
import { ConfirmationModal } from './ConfirmationModal';
import { ConnectedMechanicsModal } from './ConnectedMechanicsModal';

interface RetailShopListProps {
  onEditShop: (shopId: string) => void;
  onAddNew: () => void;
}

export const RetailShopList: React.FC<RetailShopListProps> = ({ onEditShop, onAddNew }) => {
  const [shops, setShops] = useState<RetailShop[]>([]);
  const [mechanicsMap, setMechanicsMap] = useState<Map<string, Mechanic>>(new Map());
  const [shopLinksMap, setShopLinksMap] = useState<Map<string, string[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [availableSegments, setAvailableSegments] = useState<string[]>([]);
  const [expandedShopId, setExpandedShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Manage mechanics modal from list
  const [activeShopForModal, setActiveShopForModal] = useState<RetailShop | null>(null);

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    shopId: string;
    shopName: string;
  }>({
    isOpen: false,
    shopId: '',
    shopName: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allShops, allMechanics, allLinks, segments] = await Promise.all([
        dbService.getRetailShops(),
        dbService.getMechanics(),
        dbService.getAllShopMechanicLinks(),
        dbService.getSegments(),
      ]);

      setShops(allShops);
      setAvailableSegments(segments);

      const mMap = new Map<string, Mechanic>();
      allMechanics.forEach((m) => mMap.set(m.id, m));
      setMechanicsMap(mMap);

      const linksMap = new Map<string, string[]>();
      allLinks.forEach((link) => {
        const current = linksMap.get(link.shopId) || [];
        current.push(link.mechanicId);
        linksMap.set(link.shopId, current);
      });
      setShopLinksMap(linksMap);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.shopId) return;
    await dbService.deleteRetailShop(deleteConfirm.shopId);
    setDeleteConfirm({ isOpen: false, shopId: '', shopName: '' });
    loadData();
  };

  const filteredShops = shops.filter((s) => {
    const matchesSegment = selectedSegment === 'ALL' || s.segment === selectedSegment;
    if (!matchesSegment) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const digits = searchQuery.replace(/\D/g, '');
    const matchName = s.shopName?.toLowerCase().includes(q) || s.ownerName?.toLowerCase().includes(q);
    const matchAddress = s.address?.toLowerCase().includes(q);
    const matchPhone = digits && s.mobileNumber?.includes(digits);

    return matchName || matchAddress || matchPhone;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-950/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-700" />
            Retail Shop Directory ({filteredShops.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            View store profiles and connected mechanic networks
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Retail Shop
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Shop Name, Owner, Phone, or Address..."
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

      {/* Shop Cards List */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading Retail Shops...</div>
      ) : filteredShops.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
          No retail shops found matching your search.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredShops.map((shop) => {
            const linkedIds = shopLinksMap.get(shop.id) || [];
            const linkedMechanics = linkedIds
              .map((id) => mechanicsMap.get(id))
              .filter(Boolean) as Mechanic[];
            const isExpanded = expandedShopId === shop.id;

            return (
              <div
                key={shop.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition shadow-xs overflow-hidden"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-gray-900">{shop.shopName}</h3>
                        {shop.segment && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                            {shop.segment}
                          </span>
                        )}
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                          ID: {shop.id}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 text-xs text-gray-600">
                        <div>
                          <span className="font-semibold text-gray-700">Owner: </span>
                          <span>{shop.ownerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="font-semibold text-gray-900">{shop.mobileNumber}</span>
                        </div>
                        {shop.dateOfBirth && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>DOB: {shop.dateOfBirth}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-gray-500 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span>{shop.address}</span>
                      </div>
                    </div>

                    {/* Quick Call / Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
                      <a
                        href={`tel:${shop.mobileNumber}`}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition"
                        title="Call Shop"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/91${shop.mobileNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => onEditShop(shop.id)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-semibold text-xs transition flex items-center gap-1"
                        title="Edit Shop"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            shopId: shop.id,
                            shopName: shop.shopName,
                          })
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Delete Shop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Connected Mechanics Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() =>
                        setExpandedShopId(isExpanded ? null : shop.id)
                      }
                      className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        {linkedMechanics.length === 0
                          ? '0 Connected Mechanics'
                          : `${linkedMechanics.length} Connected Mechanic(s)`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => setActiveShopForModal(shop)}
                      className="text-xs text-emerald-700 font-semibold hover:underline"
                    >
                      Manage Links
                    </button>
                  </div>
                </div>

                {/* Expanded Connected Mechanics List */}
                {isExpanded && (
                  <div className="bg-emerald-50/50 p-4 border-t border-emerald-100 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
                      Connected Mechanics for {shop.shopName}:
                    </h4>

                    {linkedMechanics.length === 0 ? (
                      <div className="text-xs text-gray-500 py-2">
                        No mechanics connected to this shop yet.{' '}
                        <button
                          onClick={() => setActiveShopForModal(shop)}
                          className="text-emerald-800 font-bold underline"
                        >
                          Click here to connect mechanics.
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {linkedMechanics.map((mech) => (
                          <div
                            key={mech.id}
                            className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-gray-900 block truncate">
                                {mech.garageName}
                              </span>
                              <span className="text-gray-500 text-[11px] flex items-center gap-2 mt-0.5">
                                <span>{mech.ownerName}</span>
                                <span>•</span>
                                <span className="font-mono text-emerald-800 font-semibold">
                                  {mech.ownerMobileNumber}
                                </span>
                              </span>
                            </div>
                            <a
                              href={`tel:${mech.ownerMobileNumber}`}
                              className="p-1.5 text-emerald-800 hover:bg-emerald-50 rounded-lg shrink-0"
                              title="Call Mechanic"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="DELETE RETAIL SHOP"
        message={`Are you sure you want to delete "${deleteConfirm.shopName}"?`}
        subMessage="Linked mechanics will not be deleted; only the connection to this shop will be unlinked safely."
        type="danger"
        confirmText="Delete Shop"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, shopId: '', shopName: '' })}
      />

      {/* Connected Mechanics Modal for Active Shop */}
      {activeShopForModal && (
        <ConnectedMechanicsModal
          isOpen={!!activeShopForModal}
          shopId={activeShopForModal.id}
          shopName={activeShopForModal.shopName}
          linkedMechanicIds={shopLinksMap.get(activeShopForModal.id) || []}
          onUpdateLinkedIds={(ids) => {
            const nextMap = new Map(shopLinksMap);
            nextMap.set(activeShopForModal.id, ids);
            setShopLinksMap(nextMap);
          }}
          onClose={() => {
            setActiveShopForModal(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
