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
  { title: 'Retail Shop', description: 'Retailer Details', icon: Store, tab: 'retail_shops', category: 'RETAIL_SHOP' as CategoryType, card: 'from-emerald-500 to-teal-700', soft: 'bg-emerald-50', ink: 'text-emerald-800', ring: 'hover:border-emerald-400' },
  { title: 'Mechanic', description: 'Mechanic Details', icon: Wrench, tab: 'mechanics', category: 'MECHANIC' as CategoryType, card: 'from-blue-500 to-indigo-700', soft: 'bg-blue-50', ink: 'text-blue-800', ring: 'hover:border-blue-400' },
  { title: 'REBORER', description: 'Reborer Details', icon: RefreshCw, tab: 'reborers', category: 'REBORER' as CategoryType, card: 'from-orange-500 to-rose-600', soft: 'bg-orange-50', ink: 'text-orange-800', ring: 'hover:border-orange-400' },
  { title: 'ID Data', description: 'ID Details', icon: KeyRound, tab: 'id_data', category: 'ID_DATA' as CategoryType, card: 'from-violet-500 to-purple-700', soft: 'bg-violet-50', ink: 'text-violet-800', ring: 'hover:border-violet-400' },
];

export const Dashboard: React.FC<DashboardProps> = ({ onSelectCategory }) => (
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
      {sections.map(({ title, description, icon: Icon, tab, category, card, soft, ink, ring }) => (
        <button
          key={tab}
          type="button"
          onClick={() => onSelectCategory(category)}
          className={`group relative flex min-h-36 items-center justify-between overflow-hidden rounded-2xl border border-white bg-white p-5 text-left shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl ${ring}`}
        >
          <span className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${card}`} />
          <span className="flex items-center gap-4">
            <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${soft} ${ink} shadow-inner`}>
              <Icon className="h-8 w-8" />
            </span>
            <span>
              <span className={`block text-lg font-extrabold ${ink}`}>{title}</span>
              <span className="mt-1 block text-sm text-gray-500">{description}</span>
              <span className={`mt-3 inline-flex rounded-full bg-gradient-to-r ${card} px-3 py-1 text-xs font-bold text-white shadow-sm`}>OPEN FORM</span>
            </span>
          </span>
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${soft} ${ink}`}><ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" /></span>
        </button>
      ))}
    </div>
  </div>
);
