import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Factory, 
  Warehouse, 
  Store, 
  LayoutGrid, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  KeyRound, 
  LogOut, 
  UserCheck, 
  ChevronLeft, 
  ChevronDown,
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import { loginUser } from '../services/api';

const PORTAL_OPTIONS = [
  {
    id: 'manufacturing',
    title: 'Manufacturing Supplier',
    subtitle: 'Distilleries, Breweries & Wholesale Depots',
    icon: Factory,
    defaultEmail: 'distillery@tasmac.tn.gov',
  },
  {
    id: 'retail',
    title: 'Retail Shops Supplier',
    subtitle: 'Retail Stores, Wholesale Catalog & Indents',
    icon: Store,
    defaultEmail: 'shop@tasmac.tn.gov',
  },
];

const ALL_DEMO_ACCOUNTS = [
  {
    portal: 'manufacturing',
    role: 'Distillery Operator',
    email: 'distillery@tasmac.tn.gov',
    username: 'distillery_admin',
    password: 'tasmac123',
    stage: 'suppliers',
    org: 'Empee Distilleries Ltd',
    icon: Factory,
  },
  {
    portal: 'manufacturing',
    role: 'Depot Superintendent',
    email: 'depot@tasmac.tn.gov',
    username: 'depot_manager',
    password: 'tasmac123',
    stage: 'depots',
    org: 'Ambattur Central Depot',
    icon: Warehouse,
  },
  {
    portal: 'retail',
    role: 'Retail Shop Supervisor',
    email: 'shop@tasmac.tn.gov',
    username: 'shop_supervisor',
    password: 'tasmac123',
    stage: 'inventory',
    org: 'Shop #4012 (Anna Nagar)',
    icon: Store,
  },
  {
    portal: 'retail',
    role: 'Wholesale Indent Manager',
    email: 'catalog@tasmac.tn.gov',
    username: 'catalog_manager',
    password: 'tasmac123',
    stage: 'catalog',
    org: 'Wholesale Catalog Wing',
    icon: LayoutGrid,
  },
  {
    portal: 'retail',
    role: 'Excise Transit Inspector',
    email: 'excise@tasmac.tn.gov',
    username: 'excise_inspector',
    password: 'tasmac123',
    stage: 'orders',
    org: 'State Excise Enforcement',
    icon: ShieldCheck,
  },
];

export function LoginPage({ 
  currentUser, 
  onLoginSuccess, 
  onLogout, 
  onNavigateToStage,
  portalMode = 'manufacturing',
  onSwitchPortal
}) {
  const [selectedOption, setSelectedOption] = useState(portalMode);
  const [identifier, setIdentifier] = useState(() => 
    portalMode === 'retail' ? 'shop@tasmac.tn.gov' : 'distillery@tasmac.tn.gov'
  );
  const [password, setPassword] = useState('tasmac123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');

  const portalDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (portalDropdownRef.current && !portalDropdownRef.current.contains(event.target)) {
        setIsPortalDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state if portalMode prop changes
  useEffect(() => {
    setSelectedOption(portalMode);
    if (!identifier || identifier === 'distillery@tasmac.tn.gov' || identifier === 'shop@tasmac.tn.gov') {
      setIdentifier(portalMode === 'retail' ? 'shop@tasmac.tn.gov' : 'distillery@tasmac.tn.gov');
    }
  }, [portalMode]);

  const handleSelectOption = (optionId) => {
    setSelectedOption(optionId);
    setErrorMessage('');
    if (optionId === 'manufacturing') {
      setIdentifier('distillery@tasmac.tn.gov');
    } else {
      setIdentifier('shop@tasmac.tn.gov');
    }
    if (onSwitchPortal) {
      onSwitchPortal(optionId);
    }
  };

  const handleApplyDemo = (demo) => {
    setSelectedOption(demo.portal);
    if (onSwitchPortal) onSwitchPortal(demo.portal);
    setIdentifier(demo.email);
    setPassword(demo.password);
    setErrorMessage('');
    setNoticeMessage(`Auto-filled: ${demo.role}`);
    setTimeout(() => setNoticeMessage(''), 2500);
  };

  const handleSocialClick = (provider) => {
    const defaultDemo = selectedOption === 'manufacturing' 
      ? ALL_DEMO_ACCOUNTS[0] 
      : ALL_DEMO_ACCOUNTS[2];
    handleApplyDemo(defaultDemo);
    setNoticeMessage(`Linked via ${provider} (${defaultDemo.role})`);
    setTimeout(() => setNoticeMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await loginUser({
        username_or_email: identifier.trim(),
        password: password,
      });

      localStorage.setItem('tasmac_auth_token', response.access_token);
      localStorage.setItem('tasmac_auth_user', JSON.stringify(response.user));
      localStorage.setItem('tasmac_portal_mode', selectedOption);
      
      onLoginSuccess(response.user, response.access_token, selectedOption);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated: show the active officer profile card
  if (currentUser) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-[380px] bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-xl p-6 shadow-2xl space-y-4 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-600 dark:text-orange-500 font-bold text-xl mx-auto shadow-sm">
            {currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}
          </div>

          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
              <UserCheck className="w-3 h-3" />
              <span>Active Session</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white truncate">
              {currentUser.full_name || currentUser.username}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {currentUser.email}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-white/5 space-y-1.5 text-xs text-left">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500">Department Token:</span>
              <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{currentUser.code}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500">Authorized Role:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{currentUser.role}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500">Workspace:</span>
              <span className="capitalize font-semibold text-zinc-800 dark:text-zinc-200">
                {selectedOption === 'manufacturing' ? 'Manufacturing' : 'Retail'}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {onNavigateToStage && (
              <button
                type="button"
                onClick={() => onNavigateToStage(currentUser.default_stage || (selectedOption === 'manufacturing' ? 'suppliers' : 'inventory'))}
                className="w-full py-2.5 px-4 rounded-full bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-xs tracking-wider uppercase transition shadow-md shadow-orange-600/30 dark:shadow-orange-950/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 px-4 rounded-full border border-zinc-200 dark:border-white/10 hover:border-rose-500/40 text-zinc-600 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedPortalObj = PORTAL_OPTIONS.find((p) => p.id === selectedOption) || PORTAL_OPTIONS[0];
  const SelectedIcon = selectedPortalObj.icon;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center select-none">
      {/* Centered Login Card - Compact single-viewport fit (zero scroll) */}
      <div className="w-full max-w-[390px] bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-xl p-5 sm:p-6 shadow-2xl space-y-3 transition-all relative">
        
        {/* Header: Title & Subtitle */}
        <div className="text-center space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Welcome to TASMAC
          </h1>
          
        </div>

        {/* Social / OAuth Sign In Buttons */}
        <div className="space-y-1.5 pt-0.5">
          {/* Sign in with Google */}
          <button
            type="button"
            onClick={() => handleSocialClick('Google')}
            className="w-full py-2 px-3 rounded-full border border-zinc-200 dark:border-white/15 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Sign in with Apple */}
          <button
            type="button"
            onClick={() => handleSocialClick('Apple')}
            className="w-full py-2 px-3 rounded-full border border-zinc-200 dark:border-white/15 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.94 1.07.08 2.14-.56 2.79-1.28z"/>
            </svg>
            <span>Sign in with Apple</span>
          </button>
        </div>

        {/* 'or' Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-white/10" />
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-white dark:bg-[#101010] px-2.5 text-zinc-400 font-mono">
              or
            </span>
          </div>
        </div>

        {/* Notification pill */}
        {noticeMessage && (
          <div className="py-1 px-2.5 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-400 text-[10px] font-mono text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="py-1 px-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] flex items-center gap-1.5 font-mono">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        {/* Main Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          
          {/* Target Portal Dropdown */}
          <div className="space-y-1 text-left relative" ref={portalDropdownRef}>
            <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Target Portal
            </label>
            <button
              type="button"
              onClick={() => setIsPortalDropdownOpen(!isPortalDropdownOpen)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 flex items-center justify-between text-left transition cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <SelectedIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                  {selectedPortalObj.title}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${isPortalDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isPortalDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-40 p-1 rounded-xl bg-white dark:bg-[#161616] border border-zinc-200 dark:border-white/10 shadow-2xl space-y-0.5 animate-fade-in">
                {PORTAL_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        handleSelectOption(opt.id);
                        setIsPortalDropdownOpen(false);
                      }}
                      className={`w-full p-2 rounded-lg flex items-center justify-between text-left transition cursor-pointer ${
                        isSelected 
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold' 
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="w-3.5 h-3.5 shrink-0 text-orange-500" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{opt.title}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{opt.subtitle}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-orange-500 shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Password with inline Forgot Password? */}
          <div className="space-y-1 text-left">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setPassword('tasmac123');
                  setNoticeMessage('Default password restored: tasmac123');
                  setTimeout(() => setNoticeMessage(''), 2500);
                }}
                className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full pl-3 pr-9 py-2 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Remember me Checkbox */}
          <div className="flex items-center text-left pt-0.5">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#161616] text-black dark:text-white focus:ring-0 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* High-Contrast Pill Primary Action Button (Sign In) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-full bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-orange-600/30 dark:shadow-orange-950/50 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer: Create an Account / Demo Accounts Trigger */}
        <div className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="font-semibold text-zinc-900 dark:text-white underline cursor-pointer hover:text-orange-500 transition"
          >
            Create an Account
          </button>
        </div>

        {/* Quick Demo Accounts Tray (Compact scrollable) */}
        {showDemoAccounts && (
          <div className="pt-2 border-t border-zinc-200 dark:border-white/10 space-y-1.5 text-left font-mono">
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span className="font-bold uppercase tracking-wider">Quick Fill Demo:</span>
              <span>pw: <code className="text-orange-500">tasmac123</code></span>
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto pr-1">
              {ALL_DEMO_ACCOUNTS.map((demo) => {
                const Icon = demo.icon;
                const isSelected = identifier === demo.email;
                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleApplyDemo(demo)}
                    className={`p-1.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold'
                        : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Icon className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="text-[10px] font-semibold truncate">{demo.role} ({demo.email})</span>
                    </div>
                    {isSelected && <Check className="w-3 h-3 text-orange-500 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
