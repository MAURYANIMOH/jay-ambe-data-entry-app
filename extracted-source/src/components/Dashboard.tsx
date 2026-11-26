import React from 'react';
import { Store, Wrench, RefreshCw, KeyRound } from 'lucide-react';
import { CategoryType } from '../types';

interface DashboardProps {
  onSelectCategory: (category: CategoryType) => void;
  onNavigateTab: (tabId: string) => void;
  onOpenExport: () => void;
  onOpenSearch: () => void;
}

const sections = [
  { title: 'Retail Shop', description: 'Retailer Details', tab: 'retail_shops', category: 'RETAIL_SHOP' as CategoryType, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&auto=format&fit=crop&q=85', theme: 'from-lime-500/95 via-green-600/90 to-green-900/95' },
  { title: 'Mechanic', description: 'Garage & Mechanic Details', tab: 'mechanics', category: 'MECHANIC' as CategoryType, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&auto=format&fit=crop&q=85', theme: 'from-sky-500/95 via-blue-700/90 to-blue-950/95' },
  { title: 'REBORER', description: 'Engine Reboring Details', tab: 'reborers', category: 'REBORER' as CategoryType, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&auto=format&fit=crop&q=85', theme: 'from-amber-500/95 via-orange-600/90 to-red-800/95' },
  { title: 'ID Data', description: 'ID & Login Details', tab: 'id_data', category: 'ID_DATA' as CategoryType, image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&auto=format&fit=crop&q=85', theme: 'from-fuchsia-600/95 via-purple-700/90 to-violet-950/95' },
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
      {sections.map(({ title, description, category, image, theme }) => (
        <button key={category} type="button" onClick={() => onSelectCategory(category)}
          className={`group relative flex min-h-48 flex-col items-center justify-end overflow-hidden rounded-3xl border-[3px] border-white/95 bg-gradient-to-br ${theme} p-3 text-center text-white shadow-[0_7px_0_rgba(15,23,42,.25)] transition duration-200 active:translate-y-1 active:shadow-md hover:brightness-105`}>
          <img src={image} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
          <span className="relative mb-1 rounded-2xl border border-white/60 bg-white/15 p-2 backdrop-blur-sm">
            {category === 'RETAIL_SHOP' ? <Store className="h-10 w-10 drop-shadow-lg" /> : category === 'MECHANIC' ? <Wrench className="h-10 w-10 drop-shadow-lg" /> : category === 'REBORER' ? <RefreshCw className="h-10 w-10 drop-shadow-lg" /> : <KeyRound className="h-10 w-10 drop-shadow-lg" />}
          </span>
          <span className="relative text-base font-black leading-tight drop-shadow sm:text-xl">{title}</span>
          <span className="relative mt-1 text-[11px] font-semibold text-white/95 sm:text-xs">{description}</span>
          <span className="relative mt-2 rounded-full border border-white/60 bg-white/20 px-3 py-1 text-[10px] font-extrabold tracking-wider backdrop-blur-sm">OPEN FORM</span>
        </button>
      ))}
    </div>
    <div className="relative mt-5 rounded-2xl border-2 border-yellow-300 bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-800 px-3 py-3 text-center shadow-lg">
      <p className="font-serif text-lg font-bold italic text-yellow-300">Welcome to</p>
      <p className="text-base font-black text-white sm:text-xl">Jay Ambe Data Entry App</p>
    </div>
  </div>
);
