import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Search,
  Plus,
  Edit3,
  Trash2,
  Phone,
  MessageCircle,
  Users,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Reborer, Employee } from '../types';
import { dbService } from '../services/db';
import { ConfirmationModal } from './ConfirmationModal';
import { WorkInEmployeeModal } from './WorkInEmployeeModal';

interface ReborerListProps {
  onEditReborer: (reborerId: string) => void;
  onAddNew: () => void;
}

export const ReborerList: React.FC<ReborerListProps> = ({ onEditReborer, onAddNew }) => {
  const [reborers, setReborers] = useState<Reborer[]>([]);
  const [employeesMap, setEmployeesMap] = useState<Map<string, Employee>>(new Map());
  const [reborerLinksMap, setReborerLinksMap] = useState<Map<string, string[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [availableSegments, setAvailableSegments] = useState<string[]>([]);
  const [expandedReborerId, setExpandedReborerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Manage employee modal for specific reborer
  const [activeReborerForModal, setActiveReborerForModal] = useState<Reborer | null>(null);

  // Delete modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    reborerId: string;
    repoweringName: string;
  }>({
    isOpen: false,
    reborerId: '',
    repoweringName: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allReborers, allEmployees, allLinks, segments] = await Promise.all([
        dbService.getReborers(),
        dbService.getEmployees(),
        dbService.getAllReborerEmployeeLinks(),
        dbService.getSegments(),
      ]);

      setReborers(allReborers);
      setAvailableSegments(segments);

      const eMap = new Map<string, Employee>();
      allEmployees.forEach((e) => eMap.set(e.id, e));
      setEmployeesMap(eMap);

      const rLinks = new Map<string, string[]>();
      allLinks.forEach((link) => {
        const cur = rLinks.get(link.reborerId) || [];
        cur.push(link.employeeId);
        rLinks.set(link.reborerId, cur);
      });
      setReborerLinksMap(rLinks);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.reborerId) return;
    await dbService.deleteReborer(deleteConfirm.reborerId);
    setDeleteConfirm({ isOpen: false, reborerId: '', repoweringName: '' });
    loadData();
  };

  const filteredReborers = reborers.filter((r) => {
    if (selectedSegment !== 'ALL' && r.segment !== selectedSegment) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const digits = searchQuery.replace(/\D/g, '');
    const matchName = r.repoweringName?.toLowerCase().includes(q);
    const matchAddress = r.address?.toLowerCase().includes(q);
    const matchPhone = digits && r.ownerMobileNumber?.includes(digits);

    return matchName || matchAddress || matchPhone;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-950/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-700" />
            Reborer & Repowering Directory ({filteredReborers.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Engine boring workshops and affiliated technical staff
          </p>
        </div>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Reborer
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Repowering Name, Mobile, or Address..."
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

      {/* Reborer Cards */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading Reborers...</div>
      ) : filteredReborers.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
          No reborers found matching your search.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReborers.map((reb) => {
            const employeeIds = reborerLinksMap.get(reb.id) || [];
            const linkedEmployees = employeeIds
              .map((id) => employeesMap.get(id))
              .filter(Boolean) as Employee[];
            const isExpanded = expandedReborerId === reb.id;

            return (
              <div
                key={reb.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition shadow-xs overflow-hidden"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-gray-900">{reb.repoweringName}</h3>
                        {reb.segment && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                            {reb.segment}
                          </span>
                        )}
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                          ID: {reb.id}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="font-semibold text-gray-900">{reb.ownerMobileNumber}</span>
                        </div>
                        {reb.dateOfBirth && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>DOB: {reb.dateOfBirth}</span>
                          </div>
                        )}
                        {reb.remark && (
                          <div className="text-gray-500 truncate">
                            <span className="font-semibold text-gray-700">Remark: </span>
                            {reb.remark}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-gray-500 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span>{reb.address}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
                      <a
                        href={`tel:${reb.ownerMobileNumber}`}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition"
                        title="Call Reborer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/91${reb.ownerMobileNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => onEditReborer(reb.id)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-semibold text-xs transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            reborerId: reb.id,
                            repoweringName: reb.repoweringName,
                          })
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Work in Employee Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() =>
                        setExpandedReborerId(isExpanded ? null : reb.id)
                      }
                      className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        {linkedEmployees.length === 0
                          ? '0 Employees Assigned'
                          : `${linkedEmployees.length} Employee(s) Working`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => setActiveReborerForModal(reb)}
                      className="text-xs text-emerald-700 font-semibold hover:underline"
                    >
                      Manage Staff Link
                    </button>
                  </div>
                </div>

                {/* Expanded Employees List */}
                {isExpanded && (
                  <div className="bg-emerald-50/50 p-4 border-t border-emerald-100 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
                      Work In Employees for {reb.repoweringName}:
                    </h4>

                    {linkedEmployees.length === 0 ? (
                      <div className="text-xs text-gray-500 py-2">
                        No employees currently assigned.{' '}
                        <button
                          onClick={() => setActiveReborerForModal(reb)}
                          className="text-emerald-800 font-bold underline"
                        >
                          Click here to link employees.
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {linkedEmployees.map((emp) => (
                          <div
                            key={emp.id}
                            className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-gray-900 block truncate">
                                {emp.employeeName}
                              </span>
                              <div className="text-gray-500 text-[11px] flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-emerald-800 font-semibold">
                                  {emp.mobileNumber}
                                </span>
                                {emp.dateOfBirth && <span>DOB: {emp.dateOfBirth}</span>}
                              </div>
                            </div>
                            <a
                              href={`tel:${emp.mobileNumber}`}
                              className="p-1.5 text-emerald-800 hover:bg-emerald-50 rounded-lg shrink-0"
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
        title="DELETE REBORER"
        message={`Are you sure you want to delete "${deleteConfirm.repoweringName}"?`}
        subMessage="Assigned employees will not be deleted from the database; only their relationship to this reborer will be cleanly removed."
        type="danger"
        confirmText="Delete Reborer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, reborerId: '', repoweringName: '' })}
      />

      {/* Work In Employee Modal */}
      {activeReborerForModal && (
        <WorkInEmployeeModal
          isOpen={!!activeReborerForModal}
          reborerId={activeReborerForModal.id}
          repoweringName={activeReborerForModal.repoweringName}
          linkedEmployeeIds={reborerLinksMap.get(activeReborerForModal.id) || []}
          onUpdateLinkedIds={(ids) => {
            const nextMap = new Map(reborerLinksMap);
            nextMap.set(activeReborerForModal.id, ids);
            setReborerLinksMap(nextMap);
          }}
          onClose={() => {
            setActiveReborerForModal(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
