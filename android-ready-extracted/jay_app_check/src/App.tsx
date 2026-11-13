import React, { useState } from 'react';
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
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <Dashboard
            onSelectCategory={handleSelectCategoryFromDashboard}
            onNavigateTab={setActiveTab}
            onOpenExport={() => setActiveTab('export')}
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
              if (cat === 'RETAIL_SHOP') setActiveTab('retail_shops');
              if (cat === 'MECHANIC') setActiveTab('mechanics');
              if (cat === 'REBORER') setActiveTab('reborers');
              if (cat === 'ID_DATA') setActiveTab('id_data');
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
        <div className="fixed bottom-16 sm:bottom-4 left-4 z-40 bg-amber-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in">
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
