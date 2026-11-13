import React from 'react';
import { Store, Wrench, RefreshCw, KeyRound, ArrowRight } from 'lucide-react';
import { CategoryType } from '../types';

interface DashboardProps {
  onSelectCategory: (category: CategoryType) => void;
  onNavigateTab: (tabId: string) => void;
  onOpenExport: () => void;
  onOpenSearch: () => void;
}

const sections = [
  { title: 'Retail Shop', description: 'Retailer Details', icon: Store, tab: 'retail_shops', category: 'RETAIL_SHOP' as CategoryType },
  { title: 'Mechanic', description: 'Mechanic Details', icon: Wrench, tab: 'mechanics', category: 'MECHANIC' as CategoryType },
  { title: 'REBORER', description: 'Reborer Details', icon: RefreshCw, tab: 'reborers', category: 'REBORER' as CategoryType },
  { title: 'ID Data', description: 'ID Details', icon: KeyRound, tab: 'id_data', category: 'ID_DATA' as CategoryType },
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => (
  <div className="space-y-6">
    <div className="p-0 text-white">
      <div className="flex items-center gap-3">
        <img src="/jay-ambe-dashboard-logo.png" alt="JAY AMBE logo" className="h-24 w-24 shrink-0 object-contain" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold leading-tight text-amber-500">JAY AMBE<br />DATA ENTRY APP</h1>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {sections.map(({ title, description, icon: Icon, tab }) => (
        <button
          key={tab}
          type="button"
          onClick={() => onNavigateTab(tab)}
          className="group flex min-h-32 items-center justify-between rounded-2xl border border-emerald-900/10 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-600 hover:shadow-md"
        >
          <span className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              <Icon className="h-7 w-7" />
            </span>
            <span>
              <span className="block text-lg font-bold text-gray-900">{title}</span>
              <span className="mt-1 block text-sm text-gray-500">{description}</span>
            </span>
          </span>
          <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-700" />
        </button>
      ))}
    </div>
  </div>
);
