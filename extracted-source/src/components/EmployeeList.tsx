import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  Phone,
  MessageCircle,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { Employee, Reborer } from '../types';
import { dbService } from '../services/db';
import { ConfirmationModal } from './ConfirmationModal';
import { validateMobileNumber } from '../utils/validation';

export const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reborersMap, setReborersMap] = useState<Map<string, Reborer>>(new Map());
  const [empReborerLinks, setEmpReborerLinks] = useState<Map<string, string[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [formError, setFormError] = useState('');

  // Delete modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    empId: string;
    empName: string;
  }>({
    isOpen: false,
    empId: '',
    empName: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allEmps, allReborers, allLinks] = await Promise.all([
        dbService.getEmployees(),
        dbService.getReborers(),
        dbService.getAllReborerEmployeeLinks(),
      ]);

      setEmployees(allEmps);

      const rMap = new Map<string, Reborer>();
      allReborers.forEach((r) => rMap.set(r.id, r));
      setReborersMap(rMap);

      const lMap = new Map<string, string[]>();
      allLinks.forEach((l) => {
        const cur = lMap.get(l.employeeId) || [];
        cur.push(l.reborerId);
        lMap.set(l.employeeId, cur);
      });
      setEmpReborerLinks(lMap);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nameInput.trim()) {
      setFormError('Employee Name is required.');
      return;
    }
    if (!validateMobileNumber(phoneInput)) {
      setFormError('Mobile number must be exactly 10 digits.');
      return;
    }

    const cleanPhone = phoneInput.trim();
    // Duplicate check if adding new
    if (!editingEmployee) {
      const existing = employees.find((e) => e.mobileNumber === cleanPhone);
      if (existing) {
        setFormError(`An employee with mobile ${cleanPhone} already exists (${existing.employeeName}).`);
        return;
      }
    }

    const empId = editingEmployee?.id || `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const empRecord: Employee = {
      id: empId,
      employeeName: nameInput.trim(),
      mobileNumber: cleanPhone,
      dateOfBirth: dobInput || undefined,
      createdAt: editingEmployee ? editingEmployee.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    await dbService.saveEmployee(empRecord);
    setIsAddModalOpen(false);
    setEditingEmployee(null);
    setNameInput('');
    setPhoneInput('');
    setDobInput('');
    loadData();
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setNameInput(emp.employeeName);
    setPhoneInput(emp.mobileNumber);
    setDobInput(emp.dateOfBirth || '');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.empId) return;
    await dbService.deleteEmployee(deleteConfirm.empId);
    setDeleteConfirm({ isOpen: false, empId: '', empName: '' });
    loadData();
  };

  const filteredEmployees = employees.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const digits = searchQuery.replace(/\D/g, '');
    const matchName = e.employeeName?.toLowerCase().includes(q);
    const matchPhone = digits && e.mobileNumber?.includes(digits);
    return matchName || matchPhone;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-950/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            Employees Directory ({filteredEmployees.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Technical and lathe personnel linked across Reborer workshops
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setNameInput('');
            setPhoneInput('');
            setDobInput('');
            setFormError('');
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Employee Name or 10-digit Mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 outline-hidden"
        />
      </div>

      {/* List Cards */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading Employees...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
          No employees registered in the system yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((emp) => {
            const reborerIds = empReborerLinks.get(emp.id) || [];
            const linkedReborers = reborerIds
              .map((id) => reborersMap.get(id))
              .filter(Boolean) as Reborer[];

            return (
              <div
                key={emp.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 transition shadow-xs p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-gray-900">{emp.employeeName}</h3>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                        ID: {emp.id}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="font-semibold text-gray-900">{emp.mobileNumber}</span>
                      </div>
                      {emp.dateOfBirth && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>DOB: {emp.dateOfBirth}</span>
                        </div>
                      )}
                    </div>

                    {/* Linked Reborers */}
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600">
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Assigned to:</span>
                      {linkedReborers.length === 0 ? (
                        <span className="text-gray-400 italic">None currently</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {linkedReborers.map((r) => (
                            <span
                              key={r.id}
                              className="bg-emerald-100 text-emerald-900 font-medium px-2 py-0.5 rounded-md text-[11px]"
                            >
                              {r.repoweringName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
                    <a
                      href={`tel:${emp.mobileNumber}`}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://wa.me/91${emp.mobileNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-semibold text-xs transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          isOpen: true,
                          empId: emp.id,
                          empName: emp.employeeName,
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

      {/* Add / Edit Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-bold text-gray-900 text-base mb-4">
              {editingEmployee ? 'Edit Employee' : 'Register New Employee'}
            </h3>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-3">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Employee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number (10 Digits) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  required
                  placeholder="9876543210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={dobInput}
                  onChange={(e) => setDobInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-800 text-white rounded-xl hover:bg-emerald-900"
                >
                  {editingEmployee ? 'Update Employee' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="DELETE EMPLOYEE"
        message={`Are you sure you want to delete employee "${deleteConfirm.empName}"?`}
        subMessage="Reborer link associations will be unlinked safely without deleting the Reborer records."
        type="danger"
        confirmText="Delete Employee"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, empId: '', empName: '' })}
      />
    </div>
  );
};
