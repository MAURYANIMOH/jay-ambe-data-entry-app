import React, { useState, useEffect } from 'react';
import {
  Store,
  Wrench,
  RefreshCw,
  KeyRound,
  Check,
  Edit3,
  Trash2,
  Search,
  RotateCcw,
  XCircle,
  Plus,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Phone,
  Lock,
} from 'lucide-react';
import {
  CategoryType,
  RetailShop,
  Mechanic,
  Reborer,
  IdData,
  Employee,
} from '../types';
import { dbService } from '../services/db';
import {
  validateAadhaarVerhoeff,
  validatePANFormat,
  validateMobileNumber,
  maskAadhaar,
  maskPAN,
} from '../utils/validation';
import { encryptCredential } from '../utils/crypto';
import { ConnectedMechanicsModal } from './ConnectedMechanicsModal';
import { WorkInEmployeeModal } from './WorkInEmployeeModal';
import { SearchModal } from './SearchModal';
import { ConfirmationModal } from './ConfirmationModal';

interface CategoryFormProps {
  initialCategory?: CategoryType;
  editingRecordId?: string | null;
  onFormSubmitted?: () => void;
  onNavigateToList?: (category: CategoryType) => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialCategory = 'RETAIL_SHOP',
  editingRecordId = null,
  onFormSubmitted,
  onNavigateToList,
}) => {
  // Main Category Selection: 1. RETAIL SHOP, 2. MECHANIC, 3. REBORER, 4. ID DATA
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [currentEditId, setCurrentEditId] = useState<string | null>(editingRecordId);

  // Configurable Segments
  const [availableSegments, setAvailableSegments] = useState<string[]>([]);
  const [newSegmentInput, setNewSegmentInput] = useState('');
  const [showAddSegmentModal, setShowAddSegmentModal] = useState(false);

  // UI Modals
  const [isMechanicsModalOpen, setIsMechanicsModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isRecordSelectModalOpen, setIsRecordSelectModalOpen] = useState(false);

  // Alert & Confirmation Modals
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    subMessage?: string;
    type?: 'danger' | 'warning' | 'success' | 'info';
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
  });

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // ----------------------------------------
  // Form States: CATEGORY 1: RETAIL SHOP
  // ----------------------------------------
  const [shopName, setShopName] = useState('');
  const [shopOwnerName, setShopOwnerName] = useState('');
  const [shopMobile, setShopMobile] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopDOB, setShopDOB] = useState('');
  const [shopSegment, setShopSegment] = useState('');
  const [shopLinkedMechanicIds, setShopLinkedMechanicIds] = useState<string[]>([]);

  // ----------------------------------------
  // Form States: CATEGORY 2: MECHANIC
  // ----------------------------------------
  const [mechGarageName, setMechGarageName] = useState('');
  const [mechOwnerName, setMechOwnerName] = useState('');
  const [mechOwnerMobile, setMechOwnerMobile] = useState('');
  const [mechForemanName, setMechForemanName] = useState('');
  const [mechForemanMobile, setMechForemanMobile] = useState('');
  const [mechAddress, setMechAddress] = useState('');
  const [mechDOB, setMechDOB] = useState('');
  const [mechDealSegments, setMechDealSegments] = useState<string[]>([]);
  const [mechPurchaseName, setMechPurchaseName] = useState('');
  const [mechRemark, setMechRemark] = useState('');

  // ----------------------------------------
  // Form States: CATEGORY 3: REBORER
  // ----------------------------------------
  const [reborerRepoweringName, setReborerRepoweringName] = useState('');
  const [reborerMobile, setReborerMobile] = useState('');
  const [reborerAddress, setReborerAddress] = useState('');
  const [reborerDOB, setReborerDOB] = useState('');
  const [reborerLinkedEmployeeIds, setReborerLinkedEmployeeIds] = useState<string[]>([]);
  const [reborerSegment, setReborerSegment] = useState('');
  const [reborerRemark, setReborerRemark] = useState('');

  // ----------------------------------------
  // Form States: CATEGORY 4: ID DATA
  // ----------------------------------------
  const [idFirmName, setIdFirmName] = useState('');
  const [idUserName, setIdUserName] = useState('');
  const [idLoginName, setIdLoginName] = useState('');
  const [idPassword, setIdPassword] = useState('');
  const [showPasswordRaw, setShowPasswordRaw] = useState(false);
  const [idAadhaar, setIdAadhaar] = useState('');
  const [maskAadhaarView, setMaskAadhaarView] = useState(true);
  const [idPan, setIdPan] = useState('');
  const [maskPanView, setMaskPanView] = useState(true);

  // Load configuration & segments on mount
  useEffect(() => {
    loadSegments();
  }, []);

  // When initialCategory or editingRecordId changes
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
    if (editingRecordId) {
      setCurrentEditId(editingRecordId);
      loadRecordForEdit(initialCategory || category, editingRecordId);
    }
  }, [initialCategory, editingRecordId]);

  const loadSegments = async () => {
    const list = await dbService.getSegments();
    setAvailableSegments(list);
    if (list.length > 0 && !shopSegment) {
      setShopSegment(list[0]);
    }
    if (list.length > 0 && !reborerSegment) {
      setReborerSegment(list[0]);
    }
  };

  const loadRecordForEdit = async (cat: CategoryType, id: string) => {
    try {
      if (cat === 'RETAIL_SHOP') {
        const record = await dbService.getRetailShopById(id);
        if (record) {
          setCategory('RETAIL_SHOP');
          setCurrentEditId(id);
          setShopName(record.shopName);
          setShopOwnerName(record.ownerName);
          setShopMobile(record.mobileNumber);
          setShopAddress(record.address);
          setShopDOB(record.dateOfBirth || '');
          setShopSegment(record.segment || '');
          const links = await dbService.getLinksForShop(id);
          setShopLinkedMechanicIds(links.map((l) => l.mechanicId));
        }
      } else if (cat === 'MECHANIC') {
        const record = await dbService.getMechanicById(id);
        if (record) {
          setCategory('MECHANIC');
          setCurrentEditId(id);
          setMechGarageName(record.garageName);
          setMechOwnerName(record.ownerName);
          setMechOwnerMobile(record.ownerMobileNumber);
          setMechForemanName(record.foremanName || '');
          setMechForemanMobile(record.foremanMobileNumber || '');
          setMechAddress(record.address);
          setMechDOB(record.dateOfBirth || '');
          setMechDealSegments(record.dealInSegments || []);
          setMechPurchaseName(record.purchaseName || '');
          setMechRemark(record.remark || '');
        }
      } else if (cat === 'REBORER') {
        const record = await dbService.getReborerById(id);
        if (record) {
          setCategory('REBORER');
          setCurrentEditId(id);
          setReborerRepoweringName(record.repoweringName);
          setReborerMobile(record.ownerMobileNumber);
          setReborerAddress(record.address);
          setReborerDOB(record.dateOfBirth || '');
          setReborerSegment(record.segment || '');
          setReborerRemark(record.remark || '');
          const links = await dbService.getLinksForReborer(id);
          setReborerLinkedEmployeeIds(links.map((l) => l.employeeId));
        }
      } else if (cat === 'ID_DATA') {
        const record = await dbService.getIdDataById(id);
        if (record) {
          setCategory('ID_DATA');
          setCurrentEditId(id);
          setIdFirmName(record.firmName);
          setIdUserName(record.name);
          setIdLoginName(record.idName);
          setIdAadhaar(record.aadhaarNumber);
          setIdPan(record.panNumber);
          setIdPassword('********'); // Encrypted placeholder; decrypted only upon reveal request
        }
      }
    } catch (e) {
      console.error('Failed to load record for edit:', e);
    }
  };

  const handleAddNewSegment = async () => {
    if (!newSegmentInput.trim()) return;
    const updated = await dbService.addSegment(newSegmentInput.trim());
    setAvailableSegments(updated);
    if (category === 'RETAIL_SHOP') setShopSegment(newSegmentInput.trim());
    if (category === 'REBORER') setReborerSegment(newSegmentInput.trim());
    setNewSegmentInput('');
    setShowAddSegmentModal(false);
  };

  // ========================================================
  // COMMON BUTTON ACTION 5: CLEAR
  // Clear only current form, never delete previously saved records
  // ========================================================
  const handleClear = () => {
    if (category === 'RETAIL_SHOP') {
      setShopName('');
      setShopOwnerName('');
      setShopMobile('');
      setShopAddress('');
      setShopDOB('');
      setShopLinkedMechanicIds([]);
    } else if (category === 'MECHANIC') {
      setMechGarageName('');
      setMechOwnerName('');
      setMechOwnerMobile('');
      setMechForemanName('');
      setMechForemanMobile('');
      setMechAddress('');
      setMechDOB('');
      setMechDealSegments([]);
      setMechPurchaseName('');
      setMechRemark('');
    } else if (category === 'REBORER') {
      setReborerRepoweringName('');
      setReborerMobile('');
      setReborerAddress('');
      setReborerDOB('');
      setReborerLinkedEmployeeIds([]);
      setReborerRemark('');
    } else if (category === 'ID_DATA') {
      setIdFirmName('');
      setIdUserName('');
      setIdLoginName('');
      setIdPassword('');
      setIdAadhaar('');
      setIdPan('');
    }
  };

  // ========================================================
  // COMMON BUTTON ACTION 6: CANCEL
  // Cancel current edit mode and reset
  // ========================================================
  const handleCancel = () => {
    setCurrentEditId(null);
    handleClear();
  };

  // ========================================================
  // COMMON BUTTON ACTION 1: SUBMIT
  // Validate, save to correct database, clear form, show success
  // ========================================================
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // ------------------- CATEGORY 1: RETAIL SHOP -------------------
    if (category === 'RETAIL_SHOP') {
      if (!shopName.trim()) {
        showAlert('MISSING FIELD', 'Please enter the Shop Name.', 'Shop Name is required.');
        return;
      }
      if (!shopOwnerName.trim()) {
        showAlert('MISSING FIELD', 'Please enter the Owner Name.', 'Owner Name is required.');
        return;
      }
      if (!validateMobileNumber(shopMobile)) {
        showAlert(
          'INVALID MOBILE NUMBER',
          'Please enter a valid 10-digit mobile number.',
          'Mobile number must contain exactly 10 digits without spaces or symbols.'
        );
        return;
      }
      if (!shopAddress.trim()) {
        showAlert('MISSING FIELD', 'Please enter the Shop Address.', 'Address is required.');
        return;
      }

      const shopId = currentEditId || `shop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const shopRecord: RetailShop = {
        id: shopId,
        shopName: shopName.trim(),
        ownerName: shopOwnerName.trim(),
        mobileNumber: shopMobile.trim(),
        address: shopAddress.trim(),
        dateOfBirth: shopDOB || undefined,
        segment: shopSegment || availableSegments[0] || 'General',
        createdAt: currentEditId ? (await dbService.getRetailShopById(shopId))?.createdAt || Date.now() : Date.now(),
        updatedAt: Date.now(),
      };

      await dbService.saveRetailShop(shopRecord);

      // Save mechanics links
      // Unlink any mechanics that were unselected
      const existingLinks = await dbService.getLinksForShop(shopId);
      for (const ex of existingLinks) {
        if (!shopLinkedMechanicIds.includes(ex.mechanicId)) {
          await dbService.unlinkMechanicFromShop(shopId, ex.mechanicId);
        }
      }
      // Link newly selected mechanics
      for (const mechId of shopLinkedMechanicIds) {
        await dbService.linkMechanicToShop(shopId, mechId);
      }

      triggerSuccess(
        currentEditId
          ? `Retail Shop "${shopRecord.shopName}" updated successfully!`
          : `Retail Shop "${shopRecord.shopName}" registered successfully with ${shopLinkedMechanicIds.length} connected mechanic(s)!`
      );
      handleCancel();
      if (onFormSubmitted) onFormSubmitted();
      return;
    }

    // ------------------- CATEGORY 2: MECHANIC -------------------
    if (category === 'MECHANIC') {
      if (!mechGarageName.trim()) {
        showAlert('MISSING FIELD', 'Please enter Garage Name.', 'Garage Name is required.');
        return;
      }
      if (!mechOwnerName.trim()) {
        showAlert('MISSING FIELD', 'Please enter Owner Name.', 'Owner Name is required.');
        return;
      }
      if (!validateMobileNumber(mechOwnerMobile)) {
        showAlert(
          'INVALID MOBILE NUMBER',
          'Please enter a valid 10-digit Owner Mobile Number.',
          'Owner mobile number must be exactly 10 digits.'
        );
        return;
      }
      if (mechForemanMobile && !validateMobileNumber(mechForemanMobile)) {
        showAlert(
          'INVALID FOREMAN MOBILE',
          'Foreman Mobile Number must be exactly 10 digits if entered.',
          'Please check the foreman mobile number or leave it blank.'
        );
        return;
      }
      if (!mechAddress.trim()) {
        showAlert('MISSING FIELD', 'Please enter Garage Address.', 'Address is required.');
        return;
      }

      const mechId = currentEditId || `mech_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const mechRecord: Mechanic = {
        id: mechId,
        garageName: mechGarageName.trim(),
        ownerName: mechOwnerName.trim(),
        ownerMobileNumber: mechOwnerMobile.trim(),
        foremanName: mechForemanName.trim() || undefined,
        foremanMobileNumber: mechForemanMobile.trim() || undefined,
        address: mechAddress.trim(),
        dateOfBirth: mechDOB || undefined,
        dealInSegments: mechDealSegments,
        purchaseName: mechPurchaseName.trim() || undefined,
        remark: mechRemark.trim() || undefined,
        createdAt: currentEditId ? (await dbService.getMechanicById(mechId))?.createdAt || Date.now() : Date.now(),
        updatedAt: Date.now(),
      };

      await dbService.saveMechanic(mechRecord);
      triggerSuccess(
        currentEditId
          ? `Mechanic "${mechRecord.garageName}" updated successfully!`
          : `Mechanic "${mechRecord.garageName}" registered successfully!`
      );
      handleCancel();
      if (onFormSubmitted) onFormSubmitted();
      return;
    }

    // ------------------- CATEGORY 3: REBORER -------------------
    if (category === 'REBORER') {
      if (!reborerRepoweringName.trim()) {
        showAlert('MISSING FIELD', 'Please enter Repowering Name.', 'Repowering Name is required.');
        return;
      }
      if (!validateMobileNumber(reborerMobile)) {
        showAlert(
          'INVALID MOBILE NUMBER',
          'Please enter a valid 10-digit Owner Mobile Number.',
          'Owner mobile number must be exactly 10 digits.'
        );
        return;
      }
      if (!reborerAddress.trim()) {
        showAlert('MISSING FIELD', 'Please enter Address.', 'Address is required.');
        return;
      }

      const rebId = currentEditId || `reb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const rebRecord: Reborer = {
        id: rebId,
        repoweringName: reborerRepoweringName.trim(),
        ownerMobileNumber: reborerMobile.trim(),
        address: reborerAddress.trim(),
        dateOfBirth: reborerDOB || undefined,
        segment: reborerSegment || availableSegments[0] || 'General',
        remark: reborerRemark.trim() || undefined,
        createdAt: currentEditId ? (await dbService.getReborerById(rebId))?.createdAt || Date.now() : Date.now(),
        updatedAt: Date.now(),
      };

      await dbService.saveReborer(rebRecord);

      // Manage employee links
      const existingLinks = await dbService.getLinksForReborer(rebId);
      for (const ex of existingLinks) {
        if (!reborerLinkedEmployeeIds.includes(ex.employeeId)) {
          await dbService.unlinkEmployeeFromReborer(rebId, ex.employeeId);
        }
      }
      for (const empId of reborerLinkedEmployeeIds) {
        await dbService.linkEmployeeToReborer(rebId, empId);
      }

      triggerSuccess(
        currentEditId
          ? `Reborer "${rebRecord.repoweringName}" updated successfully!`
          : `Reborer "${rebRecord.repoweringName}" saved with ${reborerLinkedEmployeeIds.length} employee(s) linked!`
      );
      handleCancel();
      if (onFormSubmitted) onFormSubmitted();
      return;
    }

    // ------------------- CATEGORY 4: ID DATA -------------------
    if (category === 'ID_DATA') {
      if (!idFirmName.trim()) {
        showAlert('MISSING FIELD', 'Please enter Firm Name.', 'Firm Name is required.');
        return;
      }
      if (!idUserName.trim()) {
        showAlert('MISSING FIELD', 'Please enter User Name.', 'Name is required.');
        return;
      }
      if (!idLoginName.trim()) {
        showAlert('MISSING FIELD', 'Please enter ID Name.', 'ID Name is required.');
        return;
      }
      if (!currentEditId && !idPassword.trim()) {
        showAlert('MISSING FIELD', 'Please enter Password.', 'Password is required.');
        return;
      }

      // AADHAAR VALIDATION: Verhoeff algorithm
      const cleanAadhaar = idAadhaar.replace(/[\s-]/g, '');
      if (!validateAadhaarVerhoeff(cleanAadhaar)) {
        // Display required popup: "CHECK AADHAAR NUMBER"
        showAlert(
          'CHECK AADHAAR NUMBER',
          'The entered Aadhaar Number is invalid based on the Verhoeff checksum algorithm.',
          'Please ensure the Aadhaar number has exactly 12 numeric digits and matches official checksum rules. Invalid Aadhaar numbers cannot be saved.',
          'danger'
        );
        return;
      }

      // PAN VALIDATION: Format validation [A-Z]{5}[0-9]{4}[A-Z]{1}
      const cleanPan = idPan.trim().toUpperCase();
      if (!validatePANFormat(cleanPan)) {
        // Display required popup: "CHECK PAN NUMBER"
        showAlert(
          'CHECK PAN NUMBER',
          'The entered PAN format is incorrect.',
          'Standard PAN format requires 5 uppercase letters, 4 digits, and 1 uppercase letter (e.g. ABCDE1234F). Note: This validates format structure only.',
          'danger'
        );
        return;
      }

      // Encrypt password using secure backend / crypto vault
      let encryptedPayload = {
        ciphertext: '',
        iv: '',
        tag: '',
      };

      if (idPassword && idPassword !== '********') {
        encryptedPayload = await encryptCredential(idPassword);
      } else if (currentEditId) {
        const existing = await dbService.getIdDataById(currentEditId);
        if (existing) {
          encryptedPayload = existing.encryptedPassword;
        }
      }

      const idRecordId = currentEditId || `id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const idRecord: IdData = {
        id: idRecordId,
        firmName: idFirmName.trim(),
        name: idUserName.trim(),
        idName: idLoginName.trim(),
        encryptedPassword: encryptedPayload,
        aadhaarNumber: cleanAadhaar,
        panNumber: cleanPan,
        createdAt: currentEditId ? (await dbService.getIdDataById(idRecordId))?.createdAt || Date.now() : Date.now(),
        updatedAt: Date.now(),
      };

      await dbService.saveIdData(idRecord);
      triggerSuccess(
        currentEditId
          ? `ID Record for "${idRecord.firmName}" updated successfully!`
          : `ID Record for "${idRecord.firmName}" encrypted and saved securely!`
      );
      handleCancel();
      if (onFormSubmitted) onFormSubmitted();
      return;
    }
  };

  // ========================================================
  // COMMON BUTTON ACTION 3: DELETE
  // Ask for confirmation before deleting. Manage related links safely
  // ========================================================
  const handleDelete = async () => {
    if (!currentEditId) {
      showAlert(
        'NO RECORD SELECTED',
        'Please select a record using Edit or Search first to delete it.',
        'Choose a record to load into the form before deleting.'
      );
      return;
    }

    setAlertModal({
      isOpen: true,
      title: 'CONFIRM RECORD DELETION',
      message: `Are you sure you want to permanently delete this ${category.replace('_', ' ')} record?`,
      subMessage:
        'All connected links will be safely unlinked without deleting the linked mechanics or employees.',
      type: 'danger',
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        if (category === 'RETAIL_SHOP') {
          await dbService.deleteRetailShop(currentEditId);
        } else if (category === 'MECHANIC') {
          await dbService.deleteMechanic(currentEditId);
        } else if (category === 'REBORER') {
          await dbService.deleteReborer(currentEditId);
        } else if (category === 'ID_DATA') {
          await dbService.deleteIdData(currentEditId);
        }
        setAlertModal((prev) => ({ ...prev, isOpen: false }));
        triggerSuccess(`Record deleted successfully.`);
        handleCancel();
        if (onFormSubmitted) onFormSubmitted();
      },
    });
  };

  // Helper for showing alert modals
  const showAlert = (
    title: string,
    message: string,
    subMessage?: string,
    type: 'danger' | 'warning' | 'success' | 'info' = 'warning'
  ) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      subMessage,
      type,
      confirmText: 'OK',
      onConfirm: () => setAlertModal((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const triggerSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* SUCCESS TOAST BANNER */}
      {successToast && (
        <div className="p-4 bg-emerald-700 text-white rounded-2xl shadow-lg border border-emerald-600 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-200 shrink-0" />
            <span className="font-semibold text-sm">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-200 hover:text-white text-xs font-semibold px-2 py-1 bg-emerald-800/80 rounded-lg"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* EDIT MODE INDICATOR */}
      {currentEditId && (
        <div className="px-4 py-3 bg-amber-500/10 border border-amber-300 rounded-2xl flex items-center justify-between text-amber-900 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-700" />
            <span>
              <strong>Editing Mode:</strong> Updating existing record (ID: {currentEditId})
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="text-amber-800 hover:text-amber-950 font-bold underline"
          >
            Cancel Edit
          </button>
        </div>
      )}

      {/* ========================================================
          DYNAMIC MAIN CATEGORY SELECTION SYSTEM
          1. RETAIL SHOP, 2. MECHANIC, 3. REBORER, 4. ID DATA
          ======================================================== */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-emerald-950/5">
        <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
          Select Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* OPTION 1: RETAIL SHOP */}
          <button
            type="button"
            onClick={() => {
              if (category !== 'RETAIL_SHOP') {
                setCategory('RETAIL_SHOP');
                setCurrentEditId(null);
                handleClear();
              }
            }}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-all shadow-xs ${
              category === 'RETAIL_SHOP'
                ? 'bg-emerald-800 text-white shadow-emerald-900/20 ring-2 ring-emerald-600 ring-offset-1'
                : 'bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/80 border border-emerald-100'
            }`}
          >
            <Store className="w-5 h-5" />
            <span>1. RETAIL SHOP</span>
          </button>

          {/* OPTION 2: MECHANIC */}
          <button
            type="button"
            onClick={() => {
              if (category !== 'MECHANIC') {
                setCategory('MECHANIC');
                setCurrentEditId(null);
                handleClear();
              }
            }}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-all shadow-xs ${
              category === 'MECHANIC'
                ? 'bg-emerald-800 text-white shadow-emerald-900/20 ring-2 ring-emerald-600 ring-offset-1'
                : 'bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/80 border border-emerald-100'
            }`}
          >
            <Wrench className="w-5 h-5" />
            <span>2. MECHANIC</span>
          </button>

          {/* OPTION 3: REBORER */}
          <button
            type="button"
            onClick={() => {
              if (category !== 'REBORER') {
                setCategory('REBORER');
                setCurrentEditId(null);
                handleClear();
              }
            }}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-all shadow-xs ${
              category === 'REBORER'
                ? 'bg-emerald-800 text-white shadow-emerald-900/20 ring-2 ring-emerald-600 ring-offset-1'
                : 'bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/80 border border-emerald-100'
            }`}
          >
            <RefreshCw className="w-5 h-5" />
            <span>3. REBORER</span>
          </button>

          {/* OPTION 4: ID DATA */}
          <button
            type="button"
            onClick={() => {
              if (category !== 'ID_DATA') {
                setCategory('ID_DATA');
                setCurrentEditId(null);
                handleClear();
              }
            }}
            className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-all shadow-xs ${
              category === 'ID_DATA'
                ? 'bg-emerald-800 text-white shadow-emerald-900/20 ring-2 ring-emerald-600 ring-offset-1'
                : 'bg-emerald-50/60 text-emerald-900 hover:bg-emerald-100/80 border border-emerald-100'
            }`}
          >
            <KeyRound className="w-5 h-5" />
            <span>4. ID DATA</span>
          </button>
        </div>
      </div>

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-emerald-950/5 p-4 sm:p-6 space-y-6">
        {/* ========================================================
            CATEGORY 1: RETAIL SHOP FIELDS
            ======================================================== */}
        {category === 'RETAIL_SHOP' && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-700" />
                  Retail Shop Details
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter shop information and link partner mechanics
                </p>
              </div>
              {onNavigateToList && (
                <button
                  type="button"
                  onClick={() => onNavigateToList('RETAIL_SHOP')}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  View All Shops &rarr;
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Shop Name (Required) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  1. Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jay Ambe Auto Spares"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>

              {/* Field 2: Owner Name (Required) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  2. Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rameshbhai Patel"
                  value={shopOwnerName}
                  onChange={(e) => setShopOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>

              {/* Field 3: Mobile Number (Required, exactly 10 digits) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  3. Mobile Number (10 Digits) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    required
                    placeholder="9876543210"
                    value={shopMobile}
                    onChange={(e) => setShopMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-mono tracking-wider outline-hidden"
                  />
                </div>
                {shopMobile && shopMobile.length !== 10 && (
                  <p className="text-[11px] text-amber-600 mt-1 font-medium">
                    Must be exactly 10 digits ({shopMobile.length}/10 entered)
                  </p>
                )}
              </div>

              {/* Field 5: Date of Birth (Date picker) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  5. Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={shopDOB}
                  onChange={(e) => setShopDOB(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>
            </div>

            {/* Field 4: Address (Required) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                4. Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Shop number, market, road, city..."
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
              />
            </div>

            {/* Field 6: Segment (Configurable dropdown) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    6. Segment (Configurable)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddSegmentModal(true)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Segment
                  </button>
                </div>
                <select
                  value={shopSegment}
                  onChange={(e) => setShopSegment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden bg-white"
                >
                  {availableSegments.map((seg) => (
                    <option key={seg} value={seg}>
                      {seg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 7: Connected Mechanics (Popup and multi-select linking) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  7. Connected Mechanics ({shopLinkedMechanicIds.length} Linked)
                </label>
                <button
                  type="button"
                  onClick={() => setIsMechanicsModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200 rounded-xl font-semibold text-sm transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-700" />
                    {shopLinkedMechanicIds.length === 0
                      ? 'Link Mechanics (Click to Select)'
                      : `${shopLinkedMechanicIds.length} Mechanic(s) Connected`}
                  </span>
                  <span className="text-xs bg-emerald-800 text-white px-2.5 py-1 rounded-lg">
                    Manage Links
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            CATEGORY 2: MECHANIC FIELDS
            ======================================================== */}
        {category === 'MECHANIC' && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-700" />
                  Mechanic & Garage Details
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Register automotive repair technicians and garages
                </p>
              </div>
              {onNavigateToList && (
                <button
                  type="button"
                  onClick={() => onNavigateToList('MECHANIC')}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  View All Mechanics &rarr;
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Garage Name (Required) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  1. Garage Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maruti Auto Clinic"
                  value={mechGarageName}
                  onChange={(e) => setMechGarageName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>

              {/* Field 2: Owner Name (Required) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  2. Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanjaybhai Mistry"
                  value={mechOwnerName}
                  onChange={(e) => setMechOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>

              {/* Field 3: Owner Mobile Number (Required, exactly 10 digits) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  3. Owner Mobile Number (10 Digits) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    required
                    placeholder="9876543210"
                    value={mechOwnerMobile}
                    onChange={(e) => setMechOwnerMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-mono tracking-wider outline-hidden"
                  />
                </div>
              </div>

              {/* Field 4 & 5: Foreman Name & Mobile */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  4. Foreman Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinesh Kumar"
                  value={mechForemanName}
                  onChange={(e) => setMechForemanName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  5. Foreman Mobile Number (Optional, 10 Digits)
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="9898989898"
                  value={mechForemanMobile}
                  onChange={(e) => setMechForemanMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-mono outline-hidden"
                />
              </div>

              {/* Field 7: Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  7. Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={mechDOB}
                  onChange={(e) => setMechDOB(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>
            </div>

            {/* Field 6: Address (Required) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                6. Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Garage address, industrial estate, landmark..."
                value={mechAddress}
                onChange={(e) => setMechAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
              />
            </div>

            {/* Field 8: Deal in Segment (Multi-select dropdown) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                8. Deal in Segment (Select multiple)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSegments.map((seg) => {
                  const isChecked = mechDealSegments.includes(seg);
                  return (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setMechDealSegments(mechDealSegments.filter((s) => s !== seg));
                        } else {
                          setMechDealSegments([...mechDealSegments, seg]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                        isChecked
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {seg} {isChecked && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 9: Purchase Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  9. Purchase Name
                </label>
                <input
                  type="text"
                  placeholder="Name used for bill purchase..."
                  value={mechPurchaseName}
                  onChange={(e) => setMechPurchaseName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>

              {/* Field 10: Remark */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  10. Remark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Special notes or observations..."
                  value={mechRemark}
                  onChange={(e) => setMechRemark(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            CATEGORY 3: REBORER FIELDS
            ======================================================== */}
        {category === 'REBORER' && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-700" />
                  Reborer / Repowering Details
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage engine boring, cylinder repowering, and machining personnel
                </p>
              </div>
              {onNavigateToList && (
                <button
                  type="button"
                  onClick={() => onNavigateToList('REBORER')}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  View All Reborers &rarr;
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Repowering Name (Required) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  1. Repowering Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gujarat Engine Reborers"
                  value={reborerRepoweringName}
                  onChange={(e) => setReborerRepoweringName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>

              {/* Field 2: Owner Mobile Number (Required, exactly 10 digits) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  2. Owner Mobile Number (10 Digits) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    required
                    placeholder="9876543210"
                    value={reborerMobile}
                    onChange={(e) => setReborerMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-mono tracking-wider outline-hidden"
                  />
                </div>
              </div>

              {/* Field 4: Date of Birth */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  4. Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={reborerDOB}
                  onChange={(e) => setReborerDOB(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>

              {/* Field 6: Segment (Configurable dropdown) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  6. Segment (Configurable)
                </label>
                <select
                  value={reborerSegment}
                  onChange={(e) => setReborerSegment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden bg-white"
                >
                  {availableSegments.map((seg) => (
                    <option key={seg} value={seg}>
                      {seg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field 3: Address (Required) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                3. Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="Workshop address, GIDC, plot number..."
                value={reborerAddress}
                onChange={(e) => setReborerAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
              />
            </div>

            {/* Field 5: Work in Employee (Popup selection) */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" />
                  5. Work in Employee ({reborerLinkedEmployeeIds.length} Assigned)
                </span>
                <p className="text-xs text-gray-600 mt-0.5">
                  Link employees working in this reborer workshop
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEmployeeModalOpen(true)}
                className="px-4 py-2 bg-emerald-800 text-white font-semibold rounded-xl text-xs hover:bg-emerald-900 transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Users className="w-4 h-4" />
                Manage Staff Link ({reborerLinkedEmployeeIds.length})
              </button>
            </div>

            {/* Field 7: Remark */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                7. Remark (Optional)
              </label>
              <input
                type="text"
                placeholder="Machining capabilities, lathe size, notes..."
                value={reborerRemark}
                onChange={(e) => setReborerRemark(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
              />
            </div>
          </div>
        )}

        {/* ========================================================
            CATEGORY 4: ID DATA FIELDS
            ======================================================== */}
        {category === 'ID_DATA' && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-700" />
                  ID & Official Identity Data
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Secure credentials with Aadhaar Verhoeff validation and uppercase PAN format checking
                </p>
              </div>
              {onNavigateToList && (
                <button
                  type="button"
                  onClick={() => onNavigateToList('ID_DATA')}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  View All ID Records &rarr;
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Firm Name (Required) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  1. Firm Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jay Ambe Enterprises"
                  value={idFirmName}
                  onChange={(e) => setIdFirmName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>

              {/* Field 2: Name (Required) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  2. Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full name as per official ID"
                  value={idUserName}
                  onChange={(e) => setIdUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden"
                />
              </div>

              {/* Field 3: ID Name (Required) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  3. ID Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. User Login / Portal ID"
                  value={idLoginName}
                  onChange={(e) => setIdLoginName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden font-mono"
                />
              </div>

              {/* Field 4: Password (Required, Never stored plain text) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    4. Password <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> AES-256 Backend Encrypted
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPasswordRaw ? 'text' : 'password'}
                    required={!currentEditId}
                    placeholder={currentEditId ? 'Leave blank to retain current password' : 'Enter secure password'}
                    value={idPassword}
                    onChange={(e) => setIdPassword(e.target.value)}
                    className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm outline-hidden font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordRaw(!showPasswordRaw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    title={showPasswordRaw ? 'Hide' : 'Show'}
                  >
                    {showPasswordRaw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 5: Aadhaar Number (12 digits, Verhoeff checksum) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    5. Aadhaar Number (12 Digits) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMaskAadhaarView(!maskAadhaarView)}
                    className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    {maskAadhaarView ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {maskAadhaarView ? 'Unmask' : 'Mask'}
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={12}
                  required
                  placeholder="12-digit Aadhaar number"
                  value={maskAadhaarView ? maskAadhaar(idAadhaar) : idAadhaar}
                  onFocus={() => setMaskAadhaarView(false)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setIdAadhaar(raw);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-mono tracking-wider outline-hidden"
                />
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">
                    {idAadhaar.length === 12
                      ? validateAadhaarVerhoeff(idAadhaar)
                        ? '✓ Valid Verhoeff checksum'
                        : '⚠ Checksum mismatch - CHECK AADHAAR NUMBER'
                      : `${idAadhaar.length}/12 digits`}
                  </span>
                  <span className="text-gray-400">Masked by default</span>
                </div>
              </div>

              {/* Field 6: PAN Number (10 characters, uppercase) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    6. PAN Number (10 Characters) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMaskPanView(!maskPanView)}
                    className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    {maskPanView ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {maskPanView ? 'Unmask' : 'Mask'}
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={10}
                  required
                  style={{ textTransform: 'uppercase' }}
                  placeholder="e.g. ABCDE1234F"
                  value={maskPanView ? maskPAN(idPan) : idPan}
                  onFocus={() => setMaskPanView(false)}
                  onChange={(e) => {
                    const upper = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    setIdPan(upper);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-mono tracking-widest outline-hidden"
                />
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">
                    {idPan.length === 10
                      ? validatePANFormat(idPan)
                        ? '✓ Valid format (5 letters, 4 digits, 1 letter)'
                        : '⚠ Invalid format - CHECK PAN NUMBER'
                      : `${idPan.length}/10 chars`}
                  </span>
                  <span className="text-gray-400 text-[10px]">Format check only</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            COMMON BUTTONS (EVERY CATEGORY MUST HAVE ALL 6):
            1. SUBMIT, 2. EDIT, 3. DELETE, 4. SEARCH, 5. CLEAR, 6. CANCEL
            ======================================================== */}
        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left action group: Submit and Edit */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. SUBMIT */}
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {currentEditId ? 'UPDATE RECORD' : 'SUBMIT'}
            </button>

            {/* 2. EDIT */}
            <button
              type="button"
              onClick={() => setIsRecordSelectModalOpen(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl transition shadow-xs flex items-center gap-1.5"
              title="Select a record to edit"
            >
              <Edit3 className="w-4 h-4" />
              EDIT
            </button>

            {/* 3. DELETE */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={!currentEditId}
              className={`px-4 py-2.5 font-semibold text-sm rounded-xl transition shadow-xs flex items-center gap-1.5 ${
                currentEditId
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title="Delete currently loaded record"
            >
              <Trash2 className="w-4 h-4" />
              DELETE
            </button>
          </div>

          {/* Right action group: Search, Clear, Cancel */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 4. SEARCH */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              SEARCH
            </button>

            {/* 5. CLEAR */}
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-semibold text-sm rounded-xl transition shadow-xs flex items-center gap-1.5"
              title="Clear only current form"
            >
              <RotateCcw className="w-4 h-4" />
              CLEAR
            </button>

            {/* 6. CANCEL */}
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              CANCEL
            </button>
          </div>
        </div>
      </form>

      {/* POPUP 1: CONNECTED MECHANICS MODAL */}
      <ConnectedMechanicsModal
        isOpen={isMechanicsModalOpen}
        shopId={currentEditId || ''}
        shopName={shopName}
        linkedMechanicIds={shopLinkedMechanicIds}
        onUpdateLinkedIds={setShopLinkedMechanicIds}
        onClose={() => setIsMechanicsModalOpen(false)}
      />

      {/* POPUP 2: WORK IN EMPLOYEE MODAL */}
      <WorkInEmployeeModal
        isOpen={isEmployeeModalOpen}
        reborerId={currentEditId || ''}
        repoweringName={reborerRepoweringName}
        linkedEmployeeIds={reborerLinkedEmployeeIds}
        onUpdateLinkedIds={setReborerLinkedEmployeeIds}
        onClose={() => setIsEmployeeModalOpen(false)}
      />

      {/* POPUP 3: SEARCH MODAL */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectRecordToEdit={(cat, recId) => {
          setCategory(cat);
          setCurrentEditId(recId);
          loadRecordForEdit(cat, recId);
        }}
      />

      {/* POPUP 4: RECORD SELECT MODAL FOR EDIT BUTTON */}
      {isRecordSelectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm">
                Select {category.replace('_', ' ')} Record to Edit
              </h4>
              <button
                onClick={() => setIsRecordSelectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="py-4 text-xs text-gray-600">
              You can search or view records in the list to select one for editing:
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsRecordSelectModalOpen(false);
                  setIsSearchModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-800 text-white font-semibold text-xs rounded-xl"
              >
                Open Search
              </button>
              {onNavigateToList && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRecordSelectModalOpen(false);
                    onNavigateToList(category);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl"
                >
                  Go to {category.replace('_', ' ')} List
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP 5: ADD NEW SEGMENT MODAL */}
      {showAddSegmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h4 className="font-bold text-gray-900 text-base">Add New Segment</h4>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Electric Vehicle (EV)"
              value={newSegmentInput}
              onChange={(e) => setNewSegmentInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSegmentModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewSegment}
                className="px-4 py-2 text-xs font-semibold bg-emerald-800 text-white rounded-xl hover:bg-emerald-900"
              >
                Add Segment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERT / CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        subMessage={alertModal.subMessage}
        type={alertModal.type}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.type === 'danger' ? 'Cancel' : undefined}
        onConfirm={alertModal.onConfirm}
        onCancel={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
