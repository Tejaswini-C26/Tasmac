import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Warehouse, 
  Store, 
  Package, 
  Menu, 
  X, 
  Factory, 
  BadgePercent, 
  LayoutGrid, 
  PlusCircle, 
  Sun, 
  Moon, 
  LogOut, 
  ExternalLink,
  UserCheck,
  ChevronRight
} from 'lucide-react';

export function MobileBottomNav({
  currentTab,
  onNavigate,
  portalMode,
  onSelectPortal,
  currentUser,
  theme,
  onToggleTheme,
  onOpenLogin,
  onLogout,
  onOpenLanding,
  cartCount = 0
}) {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Core 5 primary quick tabs for bottom bar
  const primaryTabs = [
    { id: 'overview', label: 'Overview', icon: ShieldCheck, badge: null },
    { id: 'consignments', label: 'Inward', icon: Truck, badge: null },
    { id: 'depots', label: 'Depots', icon: Warehouse, badge: null },
    { id: 'inventory', label: 'Store', icon: Store, badge: null },
    { id: 'orders', label: 'Orders', icon: Package, badge: cartCount > 0 ? cartCount : null },
  ];

  // Secondary stages accessible via "More" bottom sheet
  const secondaryStages = [
    { id: 'directory', label: 'Distilleries Directory', icon: Factory, desc: 'Licensed distilleries & capacities' },
    { id: 'scorecard', label: 'Supplier Scorecard', icon: BadgePercent, desc: 'OTIF, compliance & delivery SLAs' },
    { id: 'catalog', label: 'Wholesale Catalog', icon: LayoutGrid, desc: 'Browse brands, MRP & stock indents' },
    { id: 'add-bottle', label: 'Add New Bottle', icon: PlusCircle, desc: 'Register new brand SKU to catalog' },
  ];

  const handleTabClick = (tabId) => {
    setIsMoreMenuOpen(false);
    onNavigate(tabId);
  };

  return (
    <>
      {/* 1. Fixed Mobile Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-[#090a0d]/95 backdrop-blur-xl border-t border-zinc-200 dark:border-white/10 select-none px-2 py-1 print:hidden"
        style={{ paddingBottom: 'calc(0.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {primaryTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'consignments' && currentTab === 'suppliers');

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-orange-600 dark:text-orange-400 font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                    }`} 
                  />
                  {item.badge != null && (
                    <span className="absolute -top-1 -right-2 px-1 rounded-full bg-orange-600 text-white font-mono text-[9px] font-bold min-w-[14px] h-[14px] flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight font-sans ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-orange-500 mt-0.5" />
                )}
              </button>
            );
          })}

          {/* More / Menu Button */}
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
              isMoreMenuOpen
                ? 'text-orange-600 dark:text-orange-400 font-bold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Menu className={`w-5 h-5 stroke-[1.75] transition-transform ${isMoreMenuOpen ? 'rotate-90' : ''}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium font-sans">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* 2. Slide-up Mobile "More" Drawer Sheet */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fade-in print:hidden"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            className="w-full max-w-lg mx-auto bg-white dark:bg-[#111216] border-t border-zinc-200 dark:border-white/10 rounded-t-3xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-slide-up text-zinc-900 dark:text-zinc-100"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* Grab handle bar */}
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-white/20 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-white/10">
              <div>
                <span className="text-[10px] font-mono text-orange-500 uppercase font-bold tracking-wider">
                  Mobile Quick Navigation
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Statewide Supply Chain
                </h3>
              </div>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Additional Stage Links */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block px-1">
                Stages &amp; Services
              </span>
              <div className="grid grid-cols-1 gap-2">
                {secondaryStages.map((stage) => {
                  const StageIcon = stage.icon;
                  const isCurrent = currentTab === stage.id;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => handleTabClick(stage.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400'
                          : 'bg-zinc-50 dark:bg-white/[0.03] border-zinc-200 dark:border-white/5 hover:border-orange-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isCurrent ? 'bg-orange-500 text-white' : 'bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300'}`}>
                          <StageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white">
                            {stage.label}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {stage.desc}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role & Portal Switcher */}
            <div className="pt-2 border-t border-zinc-200 dark:border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block px-1">
                Active Portal: <span className="text-orange-500 uppercase">{portalMode}</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { mode: 'admin', label: 'Admin (HQ)' },
                  { mode: 'manufacturing', label: 'Distillery (Mfg)' },
                  { mode: 'depot', label: 'Depot Manager' },
                  { mode: 'retail', label: 'Retail Vend' },
                ].map((p) => (
                  <button
                    key={p.mode}
                    type="button"
                    onClick={() => {
                      if (onSelectPortal) onSelectPortal(p.mode);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition text-center cursor-pointer ${
                      portalMode === p.mode
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions (Theme, Landing, Auth) */}
            <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-2 p-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-700" />}
                <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  if (onOpenLanding) onOpenLanding();
                }}
                className="flex items-center gap-1.5 p-2 rounded-xl hover:text-orange-500 transition cursor-pointer text-zinc-600 dark:text-zinc-400"
              >
                <span>Landing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="flex items-center gap-1.5 p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    if (onOpenLogin) onOpenLogin();
                  }}
                  className="flex items-center gap-1.5 p-2 rounded-xl text-orange-500 font-bold hover:bg-orange-500/10 transition cursor-pointer"
                >
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

