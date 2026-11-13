import React, { useEffect, useState } from 'react';
import {
  Store,
  Wrench,
  RefreshCw,
  KeyRound,
  Users,
  Link as LinkIcon,
  PlusCircle,
  FileSpreadsheet,
  Search,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  Database,
} from 'lucide-react';
import { dbService } from '../services/db';
import { CategoryType, RetailShop, Mechanic, Reborer, IdData } from '../types';

interface DashboardProps {
  onSelectCategory: (category: CategoryType) => void;
  onNavigateTab: (tabId: string) => void;
  onOpenExport: () => void;
  onOpenSearch: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectCategory,
  onNavigateTab,
  onOpenExport,
  onOpenSearch,
}) => {
  const [stats, setStats] = useState({
    totalShops: 0,
    totalMechanics: 0,
    totalReborers: 0,
    totalIdRecords: 0,
    totalEmployees: 0,
    totalConnectedMechanics: 0,
  });

  const [recentShops, setRecentShops] = useState<RetailShop[]>([]);
  const [recentMechanics, setRecentMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await dbService.getDashboardStats();
      setStats(data);

      const shops = await dbService.getRetailShops();
      setRecentShops(shops.slice(-5).reverse());

      const mechs = await dbService.getMechanics();
      setRecentMechanics(mechs.slice(-5).reverse());
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Retail Shops',
      count: stats.totalShops,
      icon: <Store className="w-6 h-6 text-emerald-700" />,
      color: 'bg-emerald-50 text-emerald-950 border-emerald-100',
      tabId: 'retail_shops',
      category: 'RETAIL_SHOP' as CategoryType,
    },
    {
      label: 'Total Mechanics',
      count: stats.totalMechanics,
      icon: <Wrench className="w-6 h-6 text-emerald-700" />,
      color: 'bg-emerald-50 text-emerald-950 border-emerald-100',
      tabId: 'mechanics',
      category: 'MECHANIC' as CategoryType,
    },
    {
      label: 'Total Reborers',
      count: stats.totalReborers,
      icon: <RefreshCw className="w-6 h-6 text-emerald-700" />,
      color: 'bg-emerald-50 text-emerald-950 border-emerald-100',
      tabId: 'reborers',
      category: 'REBORER' as CategoryType,
    },
    {
      label: 'Total ID Records',
      count: stats.totalIdRecords,
      icon: <KeyRound className="w-6 h-6 text-emerald-700" />,
      color: 'bg-emerald-50 text-emerald-950 border-emerald-100',
      tabId: 'id_data',
      category: 'ID_DATA' as CategoryType,
    },
    {
      label: 'Total Employees',
      count: stats.totalEmployees,
      icon: <Users className="w-6 h-6 text-emerald-700" />,
      color: 'bg-emerald-50 text-emerald-950 border-emerald-100',
      tabId: 'employees',
    },
    {
      label: 'Connected Mechanics',
      count: stats.totalConnectedMechanics,
      icon: <LinkIcon className="w-6 h-6 text-emerald-700" />,
      color: 'bg-emerald-50 text-emerald-950 border-emerald-100',
      tabId: 'retail_shops',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Store className="w-96 h-96 -mr-20 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-600/40">
            <ShieldCheck className="w-3.5 h-3.5" /> JAY AMBE SALES NETWORK MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sales & Field Network Dashboard
          </h1>
          <p className="mt-2 text-sm text-emerald-100 leading-relaxed">
            Manage your entire distribution chain: Retail Shops, Garages & Mechanics, Engine Reborers, and Secured Firm Identity Data with offline-ready local persistence.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('entry_form')}
              className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold rounded-xl text-sm transition shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              New Data Entry
            </button>
            <button
              onClick={onOpenExport}
              className="px-5 py-2.5 bg-emerald-950/70 hover:bg-emerald-950 text-white font-semibold rounded-xl text-sm transition border border-emerald-700/60 flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-emerald-300" />
              Backup & Restore (JSON)
            </button>
            <button
              onClick={onOpenExport}
              className="px-5 py-2.5 bg-emerald-950/70 hover:bg-emerald-950 text-white font-semibold rounded-xl text-sm transition border border-emerald-700/60 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              Export Excel (5 Sheets)
            </button>
            <button
              onClick={onOpenSearch}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition border border-white/20 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Quick Search
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD STATS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            Network Performance & Metrics
          </h2>
          <span className="text-xs text-gray-500 font-medium">Real-time counts</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (card.tabId) onNavigateTab(card.tabId);
                if (card.category) onSelectCategory(card.category);
              }}
              className="bg-white p-4 rounded-2xl border border-emerald-950/10 shadow-xs hover:shadow-md hover:border-emerald-600 transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 group-hover:scale-110 transition">
                  {card.icon}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition" />
              </div>
              <div className="mt-4">
                <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {loading ? '...' : card.count}
                </div>
                <div className="text-xs font-semibold text-gray-600 mt-0.5 line-clamp-1">
                  {card.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ENTRY CATEGORY SHORTCUTS */}
      <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs text-emerald-900">
          Fast Category Entry
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => {
              onSelectCategory('RETAIL_SHOP');
              onNavigateTab('entry_form');
            }}
            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 transition text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-800 text-white rounded-lg">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-emerald-950 block">1. Retail Shop</span>
                <span className="text-[11px] text-gray-500">Store, Owner & Mechanics</span>
              </div>
            </div>
            <PlusCircle className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition" />
          </button>

          <button
            onClick={() => {
              onSelectCategory('MECHANIC');
              onNavigateTab('entry_form');
            }}
            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 transition text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-800 text-white rounded-lg">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-emerald-950 block">2. Mechanic</span>
                <span className="text-[11px] text-gray-500">Garage, Foreman & Segments</span>
              </div>
            </div>
            <PlusCircle className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition" />
          </button>

          <button
            onClick={() => {
              onSelectCategory('REBORER');
              onNavigateTab('entry_form');
            }}
            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 transition text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-800 text-white rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-emerald-950 block">3. Reborer</span>
                <span className="text-[11px] text-gray-500">Repowering & Staff Links</span>
              </div>
            </div>
            <PlusCircle className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition" />
          </button>

          <button
            onClick={() => {
              onSelectCategory('ID_DATA');
              onNavigateTab('entry_form');
            }}
            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 transition text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-800 text-white rounded-lg">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-emerald-950 block">4. ID Data</span>
                <span className="text-[11px] text-gray-500">Aadhaar, PAN & Credentials</span>
              </div>
            </div>
            <PlusCircle className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition" />
          </button>
        </div>
      </div>

      {/* RECENT NETWORK ENTRIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Retail Shops */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-700" />
              Recent Retail Shops
            </h3>
            <button
              onClick={() => onNavigateTab('retail_shops')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              View All ({stats.totalShops}) &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {recentShops.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                No retail shops registered yet. Click "New Data Entry" to add.
              </div>
            ) : (
              recentShops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => onNavigateTab('retail_shops')}
                  className="p-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-gray-900 block truncate">
                      {shop.shopName}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <span>{shop.ownerName}</span>
                      <span>•</span>
                      <span className="font-mono text-gray-700">{shop.mobileNumber}</span>
                    </span>
                  </div>
                  {shop.segment && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full shrink-0">
                      {shop.segment}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Mechanics */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-700" />
              Recent Mechanics & Garages
            </h3>
            <button
              onClick={() => onNavigateTab('mechanics')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              View All ({stats.totalMechanics}) &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {recentMechanics.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                No mechanics registered yet. Click "New Data Entry" to add.
              </div>
            ) : (
              recentMechanics.map((mech) => (
                <div
                  key={mech.id}
                  onClick={() => onNavigateTab('mechanics')}
                  className="p-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-gray-900 block truncate">
                      {mech.garageName}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <span>{mech.ownerName}</span>
                      <span>•</span>
                      <span className="font-mono text-gray-700">{mech.ownerMobileNumber}</span>
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 truncate max-w-[120px]">
                    {mech.address}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
