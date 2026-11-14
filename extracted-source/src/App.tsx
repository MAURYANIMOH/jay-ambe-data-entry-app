import React, { useEffect, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { CategoryType } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CategoryForm } from './components/CategoryForm';
import { RetailShopList } from './components/RetailShopList';
import { MechanicList } from './components/MechanicList';
import { ReborerList } from './components/ReborerList';
import { IdDataList } from './components/IdDataList';
import { EmployeeList } from './components/EmployeeList';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { SearchModal } from './components/SearchModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import {
  PlusCircle,
  LayoutDashboard,
  Store,
  Wrench,
  RefreshCw,
  KeyRound,
  FileSpreadsheet,
  Settings as SettingsIcon,
  Database,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showSplash, setShowSplash] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) { setAuthReady(true); setIsAuthenticated(true); return; }
    let listeners: Array<{ remove: () => Promise<void> }> = [];
    let mounted = true;
    (async () => {
      try {
        const current = await FirebaseAuthentication.getCurrentUser();
        if (mounted && current.user) setIsAuthenticated(true);
        const sent = await FirebaseAuthentication.addListener('phoneCodeSent', (event) => {
          if (!mounted) return;
          setVerificationId(event.verificationId);
          setOtpSent(true);
          setAuthBusy(false);
          setAuthError('');
        });
        const completed = await FirebaseAuthentication.addListener('phoneVerificationCompleted', (event) => {
          if (mounted && event.result.user) { setIsAuthenticated(true); setAuthBusy(false); }
        });
        const failed = await FirebaseAuthentication.addListener('phoneVerificationFailed', (event) => {
          if (mounted) { setAuthError(event.message || 'OTP verify nahi ho paya. Dobara koshish karein.'); setAuthBusy(false); }
        });
        listeners = [sent, completed, failed];
      } catch (error) {
        if (mounted) setAuthError(error instanceof Error ? error.message : 'Firebase login initialize nahi hua.');
      } finally { if (mounted) setAuthReady(true); }
    })();
    return () => { mounted = false; listeners.forEach((listener) => { void listener.remove(); }); };
  }, []);

  const sendPhoneOtp = async () => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (!/^[6-9]\\d{9}$/.test(digits)) { setAuthError('Sahi 10 digit mobile number dalein.'); return; }
    setAuthBusy(true); setAuthError('');
    try { await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber: '+91' + digits, timeout: 60 }); }
    catch (error) { setAuthError(error instanceof Error ? error.message : 'OTP bhejne mein dikkat hui.'); setAuthBusy(false); }
  };

  const verifyPhoneOtp = async () => {
    if (!verificationId || !/^\\d{6}$/.test(otpCode)) { setAuthError('6 digit OTP dalein.'); return; }
    setAuthBusy(true); setAuthError('');
    try {
      const result = await FirebaseAuthentication.confirmVerificationCode({ verificationId, verificationCode: otpCode });
      if (result.user) setIsAuthenticated(true);
    } catch (error) { setAuthError(error instanceof Error ? error.message : 'OTP galat hai ya expire ho gaya.'); }
    finally { setAuthBusy(false); }
  };

  useEffect(() => {
    const splashTimer = window.setTimeout(() => setShowSplash(false), 2500);
    let backListener: { remove: () => Promise<void> } | undefined;
    CapacitorApp.addListener('backButton', () => {
      const current = activeTabRef.current;
      if (current !== 'dashboard') {
        setNavigationHistory((history) => {
          const previous = history[history.length - 1] || 'dashboard';
          setActiveTab(previous);
          return history.slice(0, -1);
        });
      } else {
        void CapacitorApp.exitApp();
      }
    }).then((listener) => { backListener = listener; });
    return () => {
      window.clearTimeout(splashTimer);
      backListener?.remove();
    };
  }, []);

  const navigateTo = (tabId: string) => {
    setNavigationHistory((history) => [...history, activeTabRef.current]);
    setActiveTab(tabId);
  };
  const [selectedFormCategory, setSelectedFormCategory] = useState<CategoryType>('RETAIL_SHOP');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isOnline = useOnlineStatus();

  // Navigation handlers
  const handleSelectCategoryFromDashboard = (cat: CategoryType) => {
    setSelectedFormCategory(cat);
    setEditingRecordId(null);
    setActiveTab('entry_form');
  };

  const handleEditRecord = (cat: CategoryType, id: string) => {
    setSelectedFormCategory(cat);
    setEditingRecordId(id);
    setActiveTab('entry_form');
  };

  const handleAddNewRecord = (cat: CategoryType) => {
    setSelectedFormCategory(cat);
    setEditingRecordId(null);
    setActiveTab('entry_form');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {Capacitor.isNativePlatform() && (!authReady || !isAuthenticated) && (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center p-5">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-2xl font-extrabold text-emerald-900">JAY AMBE</div>
              <div className="text-sm font-semibold text-slate-600">DATA ENTRY APP</div>
              <p className="mt-3 text-sm text-slate-500">Continue karne ke liye mobile OTP se login karein.</p>
            </div>
            {!authReady ? <p className="text-center text-sm text-slate-600">Login taiyar ho raha hai...</p> : (
              <>
                {!otpSent ? (
                  <>
                    <label className="block text-sm font-semibold mb-2">Mobile Number</label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-3">
                      <span className="font-semibold text-slate-600">+91</span>
                      <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0,10))} inputMode="numeric" maxLength={10} placeholder="10 digit mobile number" className="w-full outline-none" />
                    </div>
                    <button onClick={sendPhoneOtp} disabled={authBusy} className="mt-4 w-full rounded-xl bg-emerald-800 py-3 font-bold text-white disabled:opacity-50">{authBusy ? 'OTP bhej rahe hain...' : 'Send OTP'}</button>
                  </>
                ) : (
                  <>
                    <p className="mb-3 text-sm text-slate-600">+91 {phoneNumber} par bheja gaya 6 digit OTP dalein.</p>
                    <input value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0,6))} inputMode="numeric" maxLength={6} placeholder="6 digit OTP" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.4em]" />
                    <button onClick={verifyPhoneOtp} disabled={authBusy} className="mt-4 w-full rounded-xl bg-emerald-800 py-3 font-bold text-white disabled:opacity-50">{authBusy ? 'Verify ho raha hai...' : 'Verify OTP'}</button>
                    <button onClick={() => { setOtpSent(false); setOtpCode(''); setVerificationId(''); setAuthError(''); }} className="mt-3 w-full py-2 text-sm font-semibold text-emerald-800">Change mobile number</button>
                  </>
                )}
                {authError && <p className="mt-3 text-sm text-red-600">{authError}</p>}
              </>
            )}
          </div>
        </div>
      )}

      {showSplash && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <img src="/jay-ambe-splash.gif" alt="JAY AMBE DATA ENTRY APP" className="w-full h-full object-contain" />
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          navigateTo(tabId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <Dashboard
            onSelectCategory={handleSelectCategoryFromDashboard}
            onNavigateTab={navigateTo}
            onOpenExport={() => navigateTo('export')}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeTab === 'entry_form' && (
          <CategoryForm
            initialCategory={selectedFormCategory}
            editingRecordId={editingRecordId}
            onFormSubmitted={() => {
              setEditingRecordId(null);
            }}
            onNavigateToList={(cat) => {
              if (cat === 'RETAIL_SHOP') navigateTo('retail_shops');
              if (cat === 'MECHANIC') navigateTo('mechanics');
              if (cat === 'REBORER') navigateTo('reborers');
              if (cat === 'ID_DATA') navigateTo('id_data');
            }}
          />
        )}

        {activeTab === 'retail_shops' && (
          <RetailShopList
            onEditShop={(id) => handleEditRecord('RETAIL_SHOP', id)}
            onAddNew={() => handleAddNewRecord('RETAIL_SHOP')}
          />
        )}

        {activeTab === 'mechanics' && (
          <MechanicList
            onEditMechanic={(id) => handleEditRecord('MECHANIC', id)}
            onAddNew={() => handleAddNewRecord('MECHANIC')}
          />
        )}

        {activeTab === 'reborers' && (
          <ReborerList
            onEditReborer={(id) => handleEditRecord('REBORER', id)}
            onAddNew={() => handleAddNewRecord('REBORER')}
          />
        )}

        {activeTab === 'id_data' && (
          <IdDataList
            onEditIdData={(id) => handleEditRecord('ID_DATA', id)}
            onAddNew={() => handleAddNewRecord('ID_DATA')}
          />
        )}

        {activeTab === 'employees' && <EmployeeList />}

        {activeTab === 'export' && (
          <ExportModal
            onDataImported={() => {
              // Trigger reload / re-render
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'settings' && <SettingsModal />}
      </main>

      {/* Mobile Bottom Quick Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-emerald-950/10 px-2 py-1.5 flex items-center justify-around z-30 lg:hidden shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            activeTab === 'dashboard' ? 'text-emerald-800 font-bold' : 'text-gray-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => {
            setEditingRecordId(null);
            setActiveTab('entry_form');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            activeTab === 'entry_form' ? 'text-emerald-800 font-bold' : 'text-gray-500'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center -mt-3 shadow-md">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Entry</span>
        </button>

        <button
          onClick={() => setActiveTab('retail_shops')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            activeTab === 'retail_shops' ? 'text-emerald-800 font-bold' : 'text-gray-500'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px]">Shops</span>
        </button>

        <button
          onClick={() => setActiveTab('mechanics')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            activeTab === 'mechanics' ? 'text-emerald-800 font-bold' : 'text-gray-500'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px]">Mechanics</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            activeTab === 'export' ? 'text-emerald-800 font-bold' : 'text-gray-500'
          }`}
        >
          <Database className="w-5 h-5" />
          <span className="text-[10px]">Backup</span>
        </button>
      </nav>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectRecordToEdit={(cat, recId) => {
          handleEditRecord(cat, recId);
        }}
      />

      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="fixed bottom-[60px] sm:bottom-3 left-4 z-40 bg-amber-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          <span>Offline Mode Active — Data saved safely in IndexedDB</span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-emerald-900">
            JAY AMBE DATA ENTRY APP &bull; Sales Network Management System
          </span>
          <span className="text-gray-400">
            Single-User &bull; Android PWA & Desktop &bull; Offline-First IndexedDB
          </span>
        </div>
      </footer>
    </div>
  );
}
