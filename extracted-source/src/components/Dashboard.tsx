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
  <div className="relative isolate min-h-full overflow-hidden rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-sky-300 via-sky-100 to-yellow-50 p-3 shadow-xl sm:p-5">
    <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 15% 15%, white 0 2px, transparent 3px), radial-gradient(circle at 80% 25%, white 0 2px, transparent 3px)", backgroundSize: "38px 38px" }} />
    <div className="relative mb-5 overflow-hidden rounded-2xl border-2 border-yellow-300 bg-gradient-to-r from-blue-950 via-indigo-800 to-blue-700 p-4 text-center text-white shadow-xl">
      <div className="flex items-center justify-center gap-3">
        <img src="/pwa-512x512.png" alt="JAY AMBE" className="h-20 w-20 rounded-full border-2 border-yellow-300 bg-white object-contain p-1 shadow-lg" />
        <div className="text-left">
          <h1 className="text-2xl font-black leading-tight tracking-wide text-red-100 drop-shadow sm:text-3xl">JAY AMBE</h1>
          <p className="text-lg font-extrabold leading-tight text-white sm:text-xl">DATA ENTRY APP</p>
          <span className="mt-2 inline-block rounded-full bg-yellow-300 px-3 py-1 text-xs font-black text-blue-950">SIMPLE • FAST • RELIABLE</span>
        </div>
      </div>
    </div>
    <div className="relative grid grid-cols-2 gap-3 sm:gap-5">
      {sections.map(({ title, description, icon: Icon, tab, category }) => {
        const theme = {
          'RETAIL_SHOP': 'from-lime-400 via-green-500 to-green-800',
          'MECHANIC': 'from-sky-400 via-blue-600 to-blue-900',
          'REBORER': 'from-amber-400 via-orange-500 to-red-600',
          'ID_DATA': 'from-fuchsia-500 via-purple-600 to-violet-900',
        }[category] || 'from-blue-500 to-indigo-800';
        return (
          <button key={tab} type="button" onClick={() => onSelectCategory(category)}
            className={`group relative flex min-h-44 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-white/90 bg-gradient-to-br ${theme} p-3 text-center text-white shadow-[0_7px_0_rgba(15,23,42,.25)] transition duration-200 active:translate-y-1 active:shadow-md hover:brightness-105`}>
            <span className="absolute inset-1 rounded-[1.25rem] border border-white/30" />
            <Icon className="relative mb-2 h-12 w-12 drop-shadow-lg sm:h-14 sm:w-14" strokeWidth={2.5} />
            <span className="relative text-base font-black leading-tight drop-shadow sm:text-xl">{title}</span>
            <span className="relative mt-1 text-[11px] font-semibold text-white/90 sm:text-xs">{description}</span>
            <span className="relative mt-3 rounded-full border border-white/50 bg-white/20 px-3 py-1 text-[10px] font-extrabold tracking-wider">OPEN FORM</span>
          </button>
        );
      })}
    </div>
    <div className="relative mt-5 rounded-2xl border-2 border-yellow-300 bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-800 px-3 py-3 text-center shadow-lg">
      <p className="font-serif text-lg font-bold italic text-yellow-300">Welcome to</p>
      <p className="text-base font-black text-white sm:text-xl">Jay Ambe Data Entry App</p>
    </div>
  </div>
);
