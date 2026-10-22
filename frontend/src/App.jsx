import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { 
  Building2, 
  ShoppingCart, 
  Store, 
  Package, 
  Truck, 
  Layers, 
  Warehouse, 
  ChevronDown, 
  Check, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  Sun,
  Moon,
  PanelLeft,
  LayoutGrid,
  Factory,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  RotateCcw,
  LogOut,
  User,
  LogIn,
  KeyRound,
  UserCheck,
  PackagePlus,
  Navigation,
  MapPin,
  Compass,
  Download,
  Landmark
} from 'lucide-react';

import { LoginPage } from './pages/LoginPage';
import { RetailCatalog } from './pages/RetailCatalog';
import { ShopOrders } from './pages/ShopOrders';
import { DepotStock } from './pages/DepotStock';
import { ShopInventory } from './pages/ShopInventory';
import { AddBottle } from './pages/AddBottle';
import { SupplierManagement } from './pages/SupplierManagement';
import { PublicLandingPage } from './pages/PublicLandingPage';
import { HQSuperAdmin } from './pages/HQSuperAdmin';
import { RegionalManager } from './pages/RegionalManager';
import { DriverConsole } from './pages/DriverConsole';
import { ComplianceAudit } from './pages/ComplianceAudit';
import { OrderDrawer } from './components/OrderDrawer';
import { ShopSearchSelector } from './components/ShopSearchSelector';
import { ShopMapModal } from './components/ShopMapModal';
import { fetchShops, fetchDepots, fetchMetrics, fetchCurrentUser } from './services/api';

const ALL_PAGE_IDS = [
  'super-admin',
  'regional',
  'suppliers',
  'depots',
  'inventory',
  'catalog',
  'orders',
  'driver-console',
  'compliance',
  'add-bottle',
  'login'
];

const MANUFACTURING_STAGES = [
  { 
    id: 'suppliers', 
    step: 1, 
    badge: '01', 
    label: 'Supplier Inward', 
    shortLabel: '1. Inward', 
    title: 'Stage 1: Supplier Inward', 
    icon: Factory, 
    desc: 'Distilleries dispatch bulk cases & generate GRN to stock wholesale depots.' 
  },
  { 
    id: 'depots', 
    step: 2, 
    badge: '02', 
    label: 'Wholesale Depots', 
    shortLabel: '2. Depots', 
    title: 'Stage 2: Wholesale Depots', 
    icon: Warehouse, 
    desc: 'Regional state buffer warehouse capacity, available cases & inward arrivals.' 
  },
];

const RETAIL_STAGES = [
  { 
    id: 'inventory', 
    step: 1, 
    badge: '01', 
    label: 'Store Stockroom', 
    shortLabel: '1. Store Stock', 
    title: 'Stage 1: Store Stockroom', 
    icon: Store, 
    desc: 'Retail store shelf inventory, daily sales velocity & replenishment alerts.' 
  },
  { 
    id: 'catalog', 
    step: 2, 
    badge: '02', 
    label: 'Wholesale Catalog', 
    shortLabel: '2. Catalog', 
    title: 'Stage 2: Wholesale Catalog', 
    icon: LayoutGrid, 
    desc: 'Browse approved brands, check MRP & submit retail store replenishment indents.' 
  },
  { 
    id: 'orders', 
    step: 3, 
    badge: '03', 
    label: 'Orders & Transit', 
    shortLabel: '3. In Transit', 
    title: 'Stage 3: Orders & Transit', 
    icon: Truck, 
    desc: 'Sequential delivery tracking, dispatch timeline, animated truck & official transit e-Pass.' 
  },
];

export function App() {
  const [portalMode, setPortalMode] = useState(() => {
    return localStorage.getItem('tasmac_portal_mode') || 'manufacturing';
  });
  const [currentTab, setCurrentTab] = useState(() => {
    const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
    if (ALL_PAGE_IDS.includes(rawHash)) {
      return rawHash;
    }
    const savedMode = localStorage.getItem('tasmac_portal_mode') || 'manufacturing';
    return savedMode === 'manufacturing' ? 'suppliers' : 'inventory';
  });
  const [viewMode, setViewMode] = useState(() => {
    const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
    if (rawHash === 'landing') {
      return 'landing';
    }
    return 'portal';
  });
  const [installPrompt, setInstallPrompt] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tasmac_auth_user');
      const token = localStorage.getItem('tasmac_auth_token');
      return (token && saved) ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [cart, setCart] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShopSelectOpen, setIsShopSelectOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Progressive Web App Install prompt capture
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } catch {
      // Ignored
    }
  };

  const handleSelectPortal = (mode) => {
    setPortalMode(mode);
    localStorage.setItem('tasmac_portal_mode', mode);
    if (currentTab === 'login') {
      return;
    }
    if (mode === 'manufacturing') {
      setCurrentTab('suppliers');
      window.location.hash = '#suppliers';
    } else {
      setCurrentTab('inventory');
      window.location.hash = '#inventory';
    }
  };

  // Sync state with URL hash for browser back/forward buttons & direct bookmarking
  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
      if (rawHash === 'landing') {
        setViewMode('landing');
      } else if (rawHash === 'login' || rawHash === 'mfg-login' || rawHash === 'retail-login') {
        setViewMode('portal');
        setCurrentTab('login');
        if (rawHash === 'mfg-login') {
          setPortalMode('manufacturing');
          localStorage.setItem('tasmac_portal_mode', 'manufacturing');
        } else if (rawHash === 'retail-login') {
          setPortalMode('retail');
          localStorage.setItem('tasmac_portal_mode', 'retail');
        }
      } else if (rawHash === 'super-admin' || rawHash === 'regional' || rawHash === 'compliance') {
        setViewMode('portal');
        setCurrentTab(rawHash);
      } else if (rawHash === 'driver-console') {
        setViewMode('portal');
        setCurrentTab('driver-console');
      } else if (rawHash === 'suppliers' || rawHash === 'depots') {
        setViewMode('portal');
        setPortalMode('manufacturing');
        localStorage.setItem('tasmac_portal_mode', 'manufacturing');
        setCurrentTab(rawHash);
      } else if (rawHash === 'inventory' || rawHash === 'catalog' || rawHash === 'orders' || rawHash === 'add-bottle') {
        setViewMode('portal');
        setPortalMode('retail');
        localStorage.setItem('tasmac_portal_mode', 'retail');
        setCurrentTab(rawHash);
      } else {
        setViewMode('portal');
      }
    };

    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const navigateToLanding = () => {
    setViewMode('landing');
    window.location.hash = '#landing';
  };

  const navigateToPortal = (tabId = 'suppliers') => {
    setViewMode('portal');
    setCurrentTab(tabId);
    window.location.hash = `#${tabId}`;
  };

  const navigateToLogin = () => {
    setViewMode('portal');
    setCurrentTab('login');
    window.location.hash = '#login';
  };
useEffect(() => {
    const token = localStorage.getItem('tasmac_auth_token');
    if (token) {
      fetchCurrentUser()
        .then((user) => {
          setCurrentUser(user);
          localStorage.setItem('tasmac_auth_user', JSON.stringify(user));
        })
        .catch(() => {
          localStorage.removeItem('tasmac_auth_token');
          localStorage.removeItem('tasmac_auth_user');
          setCurrentUser(null);
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const handleLoginSuccess = (user, token, preferredPortal) => {
    setCurrentUser(user);
    const targetMode = preferredPortal || (user?.role?.includes('Distillery') || user?.role?.includes('Depot') ? 'manufacturing' : 'retail');
    setPortalMode(targetMode);
    localStorage.setItem('tasmac_portal_mode', targetMode);
    if (user?.default_stage) {
      navigateToPortal(user.default_stage);
    } else {
      navigateToPortal(targetMode === 'manufacturing' ? 'suppliers' : 'inventory');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tasmac_auth_token');
    localStorage.removeItem('tasmac_auth_user');
    setCurrentUser(null);
    navigateToLogin();
  };

  const getRolePages = () => {
    if (!currentUser) {
      return portalMode === 'manufacturing'
        ? [
            { id: 'suppliers', label: 'Supplier Inward', icon: Factory },
            { id: 'depots', label: 'Wholesale Depots', icon: Warehouse },
          ]
        : [
            { id: 'inventory', label: 'Store Stockroom', icon: Store },
            { id: 'catalog', label: 'Wholesale Catalog', icon: LayoutGrid },
            { id: 'orders', label: 'Orders & Transit', icon: Truck },
          ];
    }

    const role = (currentUser.role || '').toUpperCase();
    if (role.includes('SUPER_ADMIN') || role.includes('DIRECTOR')) {
      return [
        { id: 'super-admin', label: 'HQ Command', icon: Landmark },
        { id: 'regional', label: 'Territories', icon: MapPin },
        { id: 'suppliers', label: 'Suppliers', icon: Factory },
        { id: 'depots', label: 'Depots', icon: Warehouse },
        { id: 'inventory', label: 'Retail Vends', icon: Store },
        { id: 'catalog', label: 'Catalog', icon: LayoutGrid },
        { id: 'orders', label: 'Orders', icon: Truck },
        { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
      ];
    }
    if (role.includes('REGIONAL')) {
      return [
        { id: 'regional', label: 'Zonal Command', icon: MapPin },
        { id: 'depots', label: 'Depots', icon: Warehouse },
        { id: 'inventory', label: 'Retail Vends', icon: Store },
        { id: 'orders', label: 'Orders', icon: Truck },
        { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
      ];
    }
    if (role.includes('WAREHOUSE') || role.includes('DEPOT')) {
      return [
        { id: 'depots', label: 'Depot Stock', icon: Warehouse },
        { id: 'suppliers', label: 'Inward Consignments', icon: Factory },
        { id: 'orders', label: 'Dispatches', icon: Truck },
      ];
    }
    if (role.includes('SUPPLIER') || role.includes('DISTILLERY') || role.includes('BREWERY')) {
      return [
        { id: 'suppliers', label: 'Supplier Inward', icon: Factory },
        { id: 'catalog', label: 'Brand Catalog', icon: LayoutGrid },
      ];
    }
    if (role.includes('DRIVER')) {
      return [
        { id: 'driver-console', label: 'Route Manifest & POD', icon: Truck },
        { id: 'orders', label: 'Order History', icon: Package },
      ];
    }
    if (role.includes('AUDITOR') || role.includes('COMPLIANCE') || role.includes('EXCISE')) {
      return [
        { id: 'compliance', label: 'Excise & Audit', icon: ShieldCheck },
        { id: 'orders', label: 'Transit Pass Audit', icon: Truck },
        { id: 'catalog', label: 'Gazette Prices', icon: LayoutGrid },
      ];
    }
    // Default Retail Shop Owner
    return [
      { id: 'inventory', label: 'Store Stockroom', icon: Store },
      { id: 'catalog', label: 'Wholesale Catalog', icon: LayoutGrid },
      { id: 'orders', label: 'Store Indents', icon: Truck },
    ];
  };

  const activePages = getRolePages();
  const activeStages = portalMode === 'manufacturing' ? MANUFACTURING_STAGES : RETAIL_STAGES;
  const currentStageIndex = activeStages.findIndex((s) => s.id === currentTab);
  const currentStage = currentStageIndex >= 0 ? activeStages[currentStageIndex] : null;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (e) => {
    const isDark = theme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // Get exact button center coordinates
    const rect = e?.currentTarget?.getBoundingClientRect?.();
    const x = rect ? Math.round(rect.left + rect.width / 2) : Math.round(e?.clientX ?? window.innerWidth - 50);
    const y = rect ? Math.round(rect.top + rect.height / 2) : Math.round(e?.clientY ?? 28);

    // Calculate maximum distance to the furthest corner of the viewport + 50px buffer
    const maxDist = Math.max(
      Math.hypot(x, y),
      Math.hypot(window.innerWidth - x, y),
      Math.hypot(x, window.innerHeight - y),
      Math.hypot(window.innerWidth - x, window.innerHeight - y)
    );
    const endRadius = Math.ceil(maxDist + 50);

    // Set CSS properties on root for native CSS @keyframes theme-wave-reveal
    const root = document.documentElement;
    root.style.setProperty('--theme-wave-x', `${x}px`);
    root.style.setProperty('--theme-wave-y', `${y}px`);
    root.style.setProperty('--theme-wave-r', `${endRadius}px`);

    document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });
  };

  const loadInitialData = async () => {
    try {
      const [shopsResult, depotsResult, metricsResult] = await Promise.allSettled([
        fetchShops(),
        fetchDepots(),
        fetchMetrics()
      ]);
      
      if (shopsResult.status === 'fulfilled' && Array.isArray(shopsResult.value) && shopsResult.value.length > 0) {
        setShops(shopsResult.value);
        setSelectedShop((prev) => prev || shopsResult.value[0]);
      }
      if (depotsResult.status === 'fulfilled') {
        setDepots(depotsResult.value);
      }
      if (metricsResult.status === 'fulfilled') {
        setMetrics(metricsResult.value);
      }
    } catch (err) {
      console.error('Initial data load failed:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleAddToCart = (brand, packRate = null, quantity = 1) => {
    const selectedSize = packRate?.size || brand.pack_size || '750ml';
    const selectedLabel = selectedSize;
    const mrp = packRate ? packRate.mrp : (brand.current_price?.mrp_per_bottle || 0);
    const wsPrice = packRate ? packRate.wholesale_issue_price : (brand.current_price?.wholesale_issue_price || 0);
    const bottlesPerCase = packRate?.bottles_per_case || brand.bottles_per_case || 12;
    const cartKey = `${brand.id}-${selectedSize}`;

    const brandPayload = {
      ...brand,
      cartKey,
      selectedSize,
      selectedLabel,
      pack_size: selectedSize,
      bottles_per_case: bottlesPerCase,
      current_price: {
        ...(brand.current_price || {}),
        mrp_per_bottle: mrp,
        wholesale_issue_price: wsPrice,
      }
    };

    setCart((prev) => {
      const existing = prev.find((item) => (item.cartKey || `${item.id}-${item.pack_size}`) === cartKey);
      if (existing) {
        return prev.map((item) =>
          (item.cartKey || `${item.id}-${item.pack_size}`) === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...brandPayload, quantity }];
    });
    setIsDrawerOpen(true);
  };

  const handleQuickIndentFromInventory = (inventoryItem) => {
    // Create cart brand payload from inventory item
    const brandPayload = {
      id: inventoryItem.brand_id,
      name: inventoryItem.brand_name,
      brand_code: inventoryItem.brand_code,
      category: inventoryItem.category,
      pack_size: inventoryItem.pack_size,
      image_url: inventoryItem.image_url,
      current_price: {
        wholesale_issue_price: 2400.0,
        mrp_per_bottle: inventoryItem.mrp_per_bottle,
      }
    };
    handleAddToCart(brandPayload, 10);
  };

  const totalCartCases = cart.reduce((acc, i) => acc + i.quantity, 0);

  if (viewMode === 'landing') {
    return (
      <PublicLandingPage 
        onEnterPortal={() => navigateToPortal(portalMode === 'manufacturing' ? 'suppliers' : 'inventory')}
        onOpenLogin={(mode) => navigateToLogin(mode || portalMode)}
        onNavigateToStage={(stage) => navigateToPortal(stage)}
        installPrompt={installPrompt}
        onInstallApp={handleInstallApp}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="h-full w-full bg-[#f8f7f6] dark:bg-[#000000] text-zinc-900 dark:text-[#f1f5f9] flex overflow-hidden antialiased selection:bg-orange-500 selection:text-white print:h-auto print:overflow-visible print:bg-white print:text-black">
      {/* 1. Left Vertical Icon Sidebar (Activity Bar) - Hidden on Login page and Print */}
      {currentTab !== 'login' && (
        <aside
          className={`shrink-0 h-full bg-[#ffffff] dark:bg-[#000000] border-r border-black/10 dark:border-white/[0.08] flex flex-col transition-[width] duration-300 ease-in-out z-30 select-none print:hidden ${
            isSidebarExpanded ? 'w-56' : 'w-12'
          }`}
        >
          {/* Top: Expand Bar Icon (PanelLeft) - Rock-solid pinned in corner */}
          <div className="h-14 shrink-0 flex items-center px-1 border-b border-black/10 dark:border-white/[0.08]">
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-black/[0.04] dark:bg-white/5 hover:bg-black/[0.08] dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/5 transition-colors duration-150 cursor-pointer group"
              title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              aria-label={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <PanelLeft size={16} className="w-4 h-4 text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors stroke-[1.75]" />
            </button>
          </div>

          {/* Navigation Items (Icons always constant, text reveals on expand) */}
          <nav className="flex-1 py-3 px-1 space-y-1 font-mono">
            {activePages.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    window.location.hash = `#${item.id}`;
                  }}
                  className={`w-full h-10 rounded-lg flex items-center transition-colors duration-150 cursor-pointer font-mono text-xs uppercase font-bold tracking-wider relative group ${
                    isActive
                      ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/40 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {/* Fixed-width icon anchor: constant position, never shifts */}
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <Icon size={16} strokeWidth={1.75} className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white'}`} />
                  </div>

                  {/* Label smoothly fades in without ever displacing the icon */}
                  <span
                    className={`whitespace-nowrap overflow-hidden transition-opacity duration-200 ${
                      isSidebarExpanded ? 'opacity-100 pr-2.5' : 'opacity-0 max-w-0 pointer-events-none'
                    } ${isActive ? 'text-orange-600 dark:text-orange-400 font-bold' : ''}`}
                  >
                    {item.label}
                  </span>

                  {/* Sleek Theme-based Tooltip for sidebar icon */}
                  {!isSidebarExpanded && (
                    <div className="absolute left-full ml-2.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#101010] border border-orange-500/30 dark:border-orange-500/40 text-orange-600 dark:text-orange-400 font-mono text-xs font-bold shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.8)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      <span>{item.label}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>
      )}

      {/* 2. Main Viewport Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:h-auto print:overflow-visible print:w-full">
        {/* Top Header - Hidden in Print */}
        <header className="shrink-0 z-20 bg-transparent print:hidden">
          <div className={`w-full px-4 sm:px-6 lg:px-8 ${currentTab === 'login' ? 'h-11' : 'h-14'} flex items-center justify-between gap-4 font-mono`}>
            {/* Left Area (Spacer) */}
            <div />

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-5 sm:gap-6 font-mono">
              {/* Theme Toggle with Animated Icon (Icon only) */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'White' : 'Dark'} Mode`}
                className="relative p-1 bg-transparent hover:bg-transparent border-0 shadow-none flex items-center justify-center shrink-0 cursor-pointer group hover:scale-110 transition-transform focus:outline-none"
              >
                <div className="relative w-3.5 h-3.5 flex items-center justify-center pointer-events-none">
                  {/* Sun Icon */}
                  <Sun 
                    className={`w-3.5 h-3.5 text-amber-500 transition-all duration-700 ease-in-out absolute ${
                      theme === 'light'
                        ? 'rotate-0 scale-100 opacity-100 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                        : 'rotate-90 scale-0 opacity-0'
                    }`} 
                  />
                  {/* Moon Icon */}
                  <Moon 
                    className={`w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-all duration-700 ease-in-out absolute ${
                      theme === 'dark'
                        ? 'rotate-0 scale-100 opacity-100 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]'
                        : '-rotate-90 scale-0 opacity-0'
                    }`} 
                  />
                </div>
              </button>

              {/* Replenishment Indent Cart Action Link (Only in Retail Shops Portal and not on login page) */}
              {portalMode === 'retail' && currentTab !== 'login' && (
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="font-mono text-sm uppercase font-bold tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition flex items-center gap-2 shrink-0 cursor-pointer group"
                >
                  <ShoppingCart className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Indent Cart</span>
                  {totalCartCases > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-orange-600 text-white font-mono font-bold text-[10px] min-w-[18px] h-[18px] flex items-center justify-center shadow-sm">
                      {totalCartCases}
                    </span>
                  )}
                </button>
              )}

              {/* Sign Out / User Status Button (Hidden on login page if not logged in) */}
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  title="Sign out of portal"
                  className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer px-2.5 py-1 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              ) : currentTab !== 'login' ? (
                <button
                  onClick={() => navigateToLogin()}
                  title="Official Department Login (Choose Portal)"
                  className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition cursor-pointer px-2.5 py-1 rounded-lg hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20 font-bold"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Department Login</span>
                  <span className="md:hidden">Login</span>
                </button>
              ) : null}
            </div>
          </div>
        </header>

        {/* Scrollable Viewport (Zero scroll on login page) */}
        <div className={`flex-1 min-h-0 ${currentTab === 'login' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'} print:h-auto print:overflow-visible`}>
          {/* Main Content Area */}
          <main className={`w-full ${currentTab === 'login' ? 'flex-1 h-full flex items-center justify-center p-1 sm:p-2' : 'px-4 sm:px-6 lg:px-8 py-6'} print:p-0 print:m-0`}>
            {currentTab === 'login' && (
              <LoginPage 
                currentUser={currentUser}
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
                onNavigateToStage={(stage) => {
                  setCurrentTab(stage);
                  window.location.hash = `#${stage}`;
                }}
                portalMode={portalMode}
                onSwitchPortal={(mode) => handleSelectPortal(mode)}
              />
            )}
            {currentTab === 'catalog' && (
              <RetailCatalog 
                onAddToCart={handleAddToCart} 
                cart={cart} 
                onNavigateToAddBottle={() => setCurrentTab('add-bottle')}
              />
            )}
            {currentTab === 'orders' && (
              <ShopOrders 
                selectedShop={selectedShop} 
                onSelectShop={setSelectedShop}
                shops={shops}
                onOpenMap={() => setIsMapModalOpen(true)}
              />
            )}
            {currentTab === 'depots' && (
              <DepotStock />
            )}
            {currentTab === 'inventory' && (
              <ShopInventory
                selectedShop={selectedShop}
                onSelectShop={setSelectedShop}
                shops={shops}
                onOpenMap={() => setIsMapModalOpen(true)}
                onQuickIndent={handleQuickIndentFromInventory}
              />
            )}
            {currentTab === 'suppliers' && (
              <SupplierManagement />
            )}
            {currentTab === 'super-admin' && (
              <HQSuperAdmin />
            )}
            {currentTab === 'regional' && (
              <RegionalManager />
            )}
            {currentTab === 'driver-console' && (
              <DriverConsole />
            )}
            {currentTab === 'compliance' && (
              <ComplianceAudit />
            )}
            {currentTab === 'add-bottle' && (
              <AddBottle onBottleAdded={() => {
                setCurrentTab('catalog');
                window.location.hash = '#catalog';
              }} />
            )}

            {/* Flow Progression: Next Stage Button */}
            {currentStage && (
              <div className="mt-8 flex justify-end print:hidden">
                {currentStageIndex < activeStages.length - 1 ? (
                  <button
                    onClick={() => {
                      const nextStageId = activeStages[currentStageIndex + 1].id;
                      setCurrentTab(nextStageId);
                      window.location.hash = `#${nextStageId}`;
                    }}
                    className="px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs sm:text-sm font-bold tracking-wider transition-all shadow-md shadow-orange-600/20 flex items-center gap-2 cursor-pointer group"
                  >
                    <span>{activeStages[currentStageIndex + 1].label}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const firstStageId = activeStages[0].id;
                      setCurrentTab(firstStageId);
                      window.location.hash = `#${firstStageId}`;
                    }}
                    className="px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs sm:text-sm font-bold tracking-wider transition-all shadow-md shadow-orange-600/20 flex items-center gap-2 cursor-pointer group"
                  >
                    <span>{activeStages[0].label}</span>
                    <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                  </button>
                )}
              </div>
            )}
          </main>

          {/* Footer - Hidden in Print */}
          <footer className="border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-[#000000] py-6 text-xs text-zinc-500 print:hidden">
            <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>State Wholesale Dispatch Network Online</span>
                <span className="text-zinc-600">&bull;</span>
                <span>Tamil Nadu State Marketing Corporation (TASMAC)</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <button 
                  onClick={navigateToLanding}
                  className="hover:text-orange-400 transition cursor-pointer flex items-center gap-1"
                >
                  <span>Public Landing Page</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Floating Replenishment Drawer */}
      <OrderDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cart={cart}
        setCart={setCart}
        selectedShop={selectedShop}
        onSelectShop={setSelectedShop}
        shops={shops}
        depots={depots}
        onOrderSuccess={(createdOrder) => {
          // Switch to orders tab to see real-time dispatch tracking
          setCurrentTab('orders');
        }}
      />

      {/* Statewide Retail Vend & Region Map Modal */}
      <ShopMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        shops={shops}
        depots={depots}
        selectedShop={selectedShop}
        onSelectShop={(shop) => {
          setSelectedShop(shop);
          setIsMapModalOpen(false);
        }}
        onOrderForShop={(shop) => {
          setSelectedShop(shop);
          setIsMapModalOpen(false);
          setIsDrawerOpen(true);
        }}
      />
    </div>
  );
}

