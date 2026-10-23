import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Landmark, 
  MapPin, 
  Warehouse, 
  Factory, 
  Store, 
  Truck, 
  Check, 
  Settings, 
  ArrowLeftRight, 
  LogOut, 
  User, 
  KeyRound,
  X,
  Building,
  CheckCircle2
} from 'lucide-react';

export const APP_ROLES = [
  {
    roleKey: 'ADMIN',
    label: 'Admin (Master Control)',
    email: 'admin@tasmac.tn.gov',
    full_name: 'TASMAC Master Admin',
    organization: 'TASMAC Managing Directorate (CMDA)',
    code: 'HQ-ADMIN-001',
    default_stage: 'suppliers',
    portalMode: 'manufacturing',
    icon: ShieldCheck,
    initials: 'AD'
  },
  {
    roleKey: 'MANUFACTURING',
    label: 'Manufacturing View',
    email: 'supplier@tasmac.tn.gov',
    full_name: 'Manufacturing Supplier',
    organization: 'United Breweries & Mohan Distilleries Consortium',
    code: 'SUP-1001',
    default_stage: 'suppliers',
    portalMode: 'manufacturing',
    icon: Factory,
    initials: 'MF'
  },
  {
    roleKey: 'RETAIL',
    label: 'Retail View',
    email: 'shop@tasmac.tn.gov',
    full_name: 'Retail Shops Supplier',
    organization: 'TASMAC Retail Vend #1042 (T. Nagar Central)',
    code: 'SHOP-1042',
    default_stage: 'inventory',
    portalMode: 'retail',
    icon: Store,
    initials: 'RT'
  }
];

export function UserProfileDropdown({
  currentUser,
  portalMode,
  onSwitchRole,
  onTogglePortalMode,
  onLogout,
  onOpenLogin
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine current active role config
  const activeRoleObj = APP_ROLES.find((r) => 
    currentUser?.email === r.email || 
    currentUser?.role === r.roleKey ||
    currentUser?.role?.toUpperCase() === r.roleKey
  ) || APP_ROLES[0];

  // Compute initials
  const initials = activeRoleObj?.initials || (currentUser?.full_name ? (
    currentUser.full_name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('')
  ) : 'PS');

  if (!currentUser) {
    return (
      <button
        onClick={onOpenLogin}
        title="Official Department Login"
        className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20 font-bold"
      >
        <KeyRound className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Department Login</span>
        <span className="md:hidden">Login</span>
      </button>
    );
  }

  return (
    <div className="relative font-sans z-50" ref={dropdownRef}>
      {/* Avatar Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={`${currentUser.full_name || currentUser.email} (${activeRoleObj.label})`}
        className="relative w-8 h-8 rounded-full bg-zinc-100 dark:bg-[#18181b] hover:bg-zinc-200 dark:hover:bg-[#222226] border border-zinc-200 dark:border-white/15 flex items-center justify-center text-xs font-bold text-zinc-900 dark:text-white transition cursor-pointer shrink-0 focus:outline-none select-none shadow-sm"
      >
        <span>{initials}</span>
        {/* Active Online Indicator */}
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#101010]" />
      </button>

      {/* Dropdown Menu Modal Container */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-64 sm:w-72 rounded-lg bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 shadow-2xl p-2 z-[60] animate-fade-in text-left select-none"
          style={{ borderRadius: '8px' }}
        >
          
          {/* Header: Signed in as */}
          <div className="px-2.5 py-2">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
              Signed in as
            </div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white truncate mt-0.5">
              {currentUser.email || activeRoleObj.email}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
              {currentUser.organization || activeRoleObj.organization}
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-white/10 my-1" />

          {/* Active View Section Header */}
          <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-2.5 pt-1.5 pb-1">
            Active view
          </div>

          {/* List of Web App Roles */}
          <div className="space-y-0.5 max-h-56 overflow-y-auto pr-0.5">
            {APP_ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = activeRoleObj.roleKey === role.roleKey;

              return (
                <button
                  key={role.roleKey}
                  type="button"
                  onClick={() => {
                    if (onSwitchRole) onSwitchRole(role);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between text-left text-xs transition cursor-pointer ${
                    isActive
                      ? 'font-semibold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-white/10'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-orange-500' : 'text-zinc-400'}`} />
                    <span className="truncate">{role.label}</span>
                  </div>
                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-zinc-200 dark:border-white/10 my-1.5" />

          {/* Account & Settings Link */}
          <button
            type="button"
            onClick={() => {
              setIsSettingsModalOpen(true);
              setIsOpen(false);
            }}
            className="w-full px-2.5 py-1.5 rounded-md flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Account & settings</span>
          </button>

          {/* Switch to Alternate View */}
          <button
            type="button"
            onClick={() => {
              if (onTogglePortalMode) onTogglePortalMode();
              setIsOpen(false);
            }}
            className="w-full px-2.5 py-1.5 rounded-md flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Switch to {portalMode === 'manufacturing' ? 'Retail view' : 'Manufacturing view'}</span>
          </button>

          <div className="border-t border-zinc-200 dark:border-white/10 my-1.5" />

          {/* Log Out */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (onLogout) onLogout();
            }}
            className="w-full px-2.5 py-1.5 rounded-md flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      )}

      {/* Account & Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="w-full max-w-sm rounded-lg bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 shadow-2xl p-5 space-y-4 animate-fade-in text-left"
            style={{ borderRadius: '8px' }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Account & Settings</h3>
              </div>
              <button 
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-md bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-zinc-900 dark:text-white truncate">{currentUser.full_name || activeRoleObj.full_name}</div>
                  <div className="text-[11px] text-zinc-500 truncate">{currentUser.email || activeRoleObj.email}</div>
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-white/[0.03]">
                  <span className="text-zinc-500">Department Token:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">{currentUser.code || activeRoleObj.code}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-white/[0.03]">
                  <span className="text-zinc-500">Designation:</span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{activeRoleObj.label}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-white/[0.03]">
                  <span className="text-zinc-500">Organization:</span>
                  <span className="text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">{currentUser.organization || activeRoleObj.organization}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Security Clearance:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> State Excise Verified
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="w-full py-2 rounded-md bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

