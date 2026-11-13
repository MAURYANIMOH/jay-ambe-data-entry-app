import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Trash2, Check, Users, Phone, Calendar, AlertCircle } from 'lucide-react';
import { Employee } from '../types';
import { dbService } from '../services/db';
import { validateMobileNumber } from '../utils/validation';

interface WorkInEmployeeModalProps {
  isOpen: boolean;
  reborerId: string;
  repoweringName: string;
  linkedEmployeeIds: string[];
  onUpdateLinkedIds: (ids: string[]) => void;
  onClose: () => void;
}

export const WorkInEmployeeModal: React.FC<WorkInEmployeeModalProps> = ({
  isOpen,
  reborerId,
  repoweringName,
  linkedEmployeeIds,
  onUpdateLinkedIds,
  onClose,
}) => {
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'linked' | 'search' | 'add'>('linked');

  // New Employee Form State
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newDOB, setNewDOB] = useState('');
  const [newMobileNumber, setNewMobileNumber] = useState('');
  const [newErrorMessage, setNewErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      setSearchQuery('');
      setNewErrorMessage('');
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    const list = await dbService.getEmployees();
    setAllEmployees(list);
  };

  if (!isOpen) return null;

  // Filter linked employees
  const linkedEmployees = allEmployees.filter((e) => linkedEmployeeIds.includes(e.id));

  // Search results
  const searchResults = allEmployees.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const digits = searchQuery.replace(/\D/g, '');
    const matchName = e.employeeName?.toLowerCase().includes(q);
    const matchPhone = digits && e.mobileNumber?.includes(digits);
    return matchName || matchPhone;
  });

  const handleLinkEmployee = async (employeeId: string) => {
    if (!linkedEmployeeIds.includes(employeeId)) {
      const updated = [...linkedEmployeeIds, employeeId];
      onUpdateLinkedIds(updated);
      if (reborerId) {
        await dbService.linkEmployeeToReborer(reborerId, employeeId);
      }
    }
  };

  const handleUnlinkEmployee = async (employeeId: string) => {
    const updated = linkedEmployeeIds.filter((id) => id !== employeeId);
    onUpdateLinkedIds(updated);
    if (reborerId) {
      await dbService.unlinkEmployeeFromReborer(reborerId, employeeId);
    }
  };

  const handleCreateAndLinkNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewErrorMessage('');

    if (!newEmployeeName.trim()) {
      setNewErrorMessage('Employee Name is required.');
      return;
    }
    if (!validateMobileNumber(newMobileNumber)) {
      setNewErrorMessage('Mobile Number must be exactly 10 digits.');
      return;
    }

    // Check if employee already exists by mobile number to prevent duplicate employee creation
    const cleanPhone = newMobileNumber.trim();
    const existing = allEmployees.find((emp) => emp.mobileNumber === cleanPhone);
    if (existing) {
      // Link existing employee instead of creating duplicate
      await handleLinkEmployee(existing.id);
      setActiveTab('linked');
      setNewEmployeeName('');
      setNewDOB('');
      setNewMobileNumber('');
      return;
    }

    // Create new Employee in the separate employee database
    const newEmployee: Employee = {
      id: `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      employeeName: newEmployeeName.trim(),
      mobileNumber: cleanPhone,
      dateOfBirth: newDOB || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await dbService.saveEmployee(newEmployee);
    setAllEmployees((prev) => [newEmployee, ...prev]);

    // Link to this Reborer
    await handleLinkEmployee(newEmployee.id);

    // Reset Form
    setNewEmployeeName('');
    setNewDOB('');
    setNewMobileNumber('');
    setActiveTab('linked');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-emerald-900/10 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-800 text-emerald-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Work in Employee (Reborer Link)</h3>
              <p className="text-xs text-emerald-200">
                {repoweringName ? `Linking for: ${repoweringName}` : 'Assign or Register Employees for this Reborer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1.5 rounded-lg hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/80 px-4 pt-2 gap-2 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('linked')}
            className={`px-4 py-2.5 font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'linked'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Assigned Employees ({linkedEmployees.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2.5 font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'search'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="w-4 h-4" />
            Search Existing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2.5 font-semibold border-b-2 transition flex items-center gap-2 ml-auto ${
              activeTab === 'add'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-emerald-700 hover:text-emerald-800 font-medium'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add New Employee
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: CURRENT LINKED */}
          {activeTab === 'linked' && (
            <div className="space-y-3">
              {linkedEmployees.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-800">No Employees Assigned Yet</h4>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                    Select existing staff from the database or register a new employee.
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('search')}
                      className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
                    >
                      Search Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('add')}
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Employee
                    </button>
                  </div>
                </div>
              ) : (
                linkedEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 flex items-center justify-between gap-3 hover:shadow-xs transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 truncate">{emp.employeeName}</span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                          Assigned
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          {emp.mobileNumber}
                        </span>
                        {emp.dateOfBirth && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            DOB: {emp.dateOfBirth}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnlinkEmployee(emp.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition shrink-0"
                      title="Unlink Employee"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Employee Name or 10-digit Mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No employees found matching "{searchQuery}".
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewEmployeeName(searchQuery);
                          setActiveTab('add');
                        }}
                        className="text-emerald-700 hover:underline font-semibold text-xs"
                      >
                        Register "{searchQuery}" as a new employee
                      </button>
                    </div>
                  </div>
                ) : (
                  searchResults.map((emp) => {
                    const isLinked = linkedEmployeeIds.includes(emp.id);
                    return (
                      <div
                        key={emp.id}
                        className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                          isLinked
                            ? 'border-emerald-300 bg-emerald-50/50'
                            : 'border-gray-200 hover:border-emerald-300 bg-white'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{emp.employeeName}</h4>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                            <span className="font-mono text-gray-700">{emp.mobileNumber}</span>
                            {emp.dateOfBirth && <span>DOB: {emp.dateOfBirth}</span>}
                          </div>
                        </div>

                        {isLinked ? (
                          <button
                            type="button"
                            onClick={() => handleUnlinkEmployee(emp.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition shrink-0"
                          >
                            Unlink
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleLinkEmployee(emp.id)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition shrink-0 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Select & Link
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW EMPLOYEE */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateAndLinkNew} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
                This adds the employee to the dedicated employee database and links them to this Reborer. Duplicate mobile numbers are prevented and automatically linked.
              </div>

              {newErrorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{newErrorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Employee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mukesh Sharma"
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Number (10 digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    required
                    placeholder="9876543210"
                    value={newMobileNumber}
                    onChange={(e) => setNewMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    value={newDOB}
                    onChange={(e) => setNewDOB(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('linked')}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save and Link Employee
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>{linkedEmployeeIds.length} employee(s) assigned</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-800 text-white font-semibold rounded-xl hover:bg-emerald-900 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
