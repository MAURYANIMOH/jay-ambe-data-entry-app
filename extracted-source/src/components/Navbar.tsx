import React, { useState } from 'react';
import {
  Store,
  Wrench,
  RefreshCw,
  KeyRound,
  Users,
  LayoutDashboard,
  FileSpreadsheet,
  Settings,
  PlusCircle,
  Download,
  Wifi,
  WifiOff,
  Menu,
  X,
  Search,
  Database,
  Share2,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'entry_form', label: 'Data Entry', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'retail_shops', label: 'Retail Shops', icon: <Store className="w-4 h-4" /> },
    { id: 'mechanics', label: 'Mechanics', icon: <Wrench className="w-4 h-4" /> },
    { id: 'reborers', label: 'Reborers', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'id_data', label: 'ID Data', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'employees', label: 'Employees', icon: <Users className="w-4 h-4" /> },
    { id: 'export', label: 'Backup & Export', icon: <Database className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-emerald-950 text-white shadow-md border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-md p-1 border border-emerald-300/30 group-hover:scale-105 transition">
              <img src="/icon.svg" alt="Jay Ambe App Logo" className="w-8 h-8 drop-shadow-sm" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-wide text-white leading-tight flex items-center gap-1.5">
                <span>JAY AMBE</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-800 text-emerald-200 uppercase tracking-widest">
                  SALES
                </span>
              </div>
              <div className="text-[10px] font-medium text-emerald-300 tracking-wider uppercase">
                DATA ENTRY APP
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-900/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={async () => {
                const url = 'https://github.com/MAURYANIMOH/jay-ambe-data-entry-app/releases/latest/download/JAY-AMBE-ANDROID-APK.apk';
                const shareData = { title: 'JAY AMBE DATA ENTRY APP', text: 'Download JAY AMBE DATA ENTRY APP', url };
                try {
                  if (navigator.share) await navigator.share(shareData);
                  else if (navigator.clipboard) {
                    await navigator.clipboard.writeText(url);
                    window.alert('App download link copied. You can share it on WhatsApp.');
                  } else window.prompt('Copy app download link', url);
                } catch (error) {
                  if ((error as Error).name !== 'AbortError') window.prompt('Copy app download link', url);
                }
              }}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-900/80 rounded-xl transition"
              title="Share App"
              aria-label="Share App"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.open('https://github.com/MAURYANIMOH/jay-ambe-data-entry-app/actions/runs/43451444987', '_blank', 'noopener,noreferrer')}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-900/80 rounded-xl transition"
              title="Download App"
              aria-label="Download App"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Quick Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-900/80 rounded-xl transition"
              title="Search Across System"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Online / Offline Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                isOnline
                  ? 'bg-emerald-900/80 text-emerald-300 border-emerald-700/60'
                  : 'bg-amber-950/80 text-amber-300 border-amber-700/60 animate-pulse'
              }`}
              title={isOnline ? 'Online - Local & Cloud Ready' : 'Offline - Storing in IndexedDB'}
            >
              {isOnline ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* PWA Install Button */}
            {!isInstalled && isInstallable && (
              <button
                onClick={install}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {!isInstalled && isIOS && (
              <button
                onClick={() => setShowIOSModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-emerald-600 text-emerald-200 hover:bg-emerald-900 font-semibold text-xs rounded-xl transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install iOS</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-emerald-200 hover:text-white rounded-xl hover:bg-emerald-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-emerald-900/95 border-t border-emerald-800/80 px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2.5 transition text-left ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            {!isInstalled && (isInstallable || isIOS) && (
              <div className="pt-2 border-t border-emerald-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isInstallable) install();
                    else if (isIOS) setShowIOSModal(true);
                  }}
                  className="w-full py-2.5 px-3.5 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Install App to Home Screen
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* iOS Safari PWA Installation Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-gray-900">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-700" />
              Install on iPhone / iPad
            </h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              1. Tap the <strong>Share</strong> button <span className="text-emerald-800 font-bold">[⎋]</span> in your Safari bottom toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong> <span className="text-emerald-800 font-bold">[+]</span>.<br />
              3. Tap <strong>Add</strong> at top right to launch full-screen like a native mobile app!
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2 bg-emerald-800 text-white text-xs font-semibold rounded-xl hover:bg-emerald-900 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
