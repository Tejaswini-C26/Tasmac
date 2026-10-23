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
  RotateCw,
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
  Landmark,
  CreditCard,
  Search,
  Maximize2,
  Minimize2,
  Bell,
  BadgePercent,
  Beer,
  Wine,
  Boxes,
  PlusCircle,
  X
} from 'lucide-react';

import { LoginPage } from './pages/LoginPage';
import { RetailCatalog } from './pages/RetailCatalog';
import { ShopOrders } from './pages/ShopOrders';
import { DepotStock } from './pages/DepotStock';
import { ShopInventory } from './pages/ShopInventory';
import { AddBottle } from './pages/AddBottle';
import { SupplierManagement } from './pages/SupplierManagement';
import { AdminOverview } from './pages/AdminOverview';
import { DEPOT_CONFIGS, getEffectiveDepotConfigs } from './services/depotConfigs';
import { PublicLandingPage } from './pages/PublicLandingPage';
import { OrderDrawer } from './components/OrderDrawer';
import { ShopSearchSelector } from './components/ShopSearchSelector';
import { ShopMapModal } from './components/ShopMapModal';
import { UserProfileDropdown } from './components/UserProfileDropdown';
import { fetchShops, fetchDepots, fetchMetrics, fetchCurrentUser, fetchSystemAlerts, triggerReplenishment, dismissAlert } from './services/api';

const ALL_PAGE_IDS = [
  'overview',
  'suppliers',
  'consignments',
  'directory',
  'scorecard',
  'depots',
  'inventory',
  'catalog',
  'orders',
  'add-bottle',
  'login'
];

const ADMIN_STAGES = [
  { 
    id: 'overview', 
    step: 1, 
    badge: '00', 
    label: 'Master Overview', 
    shortLabel: 'Overview', 
    title: 'Statewide Master Overview', 
    icon: ShieldCheck, 
    desc: 'Executive statewide telemetry, 3-tier supply chain KPIs & real-time governance.' 
  },
  { 
    id: 'consignments', 
    step: 2, 
    badge: '01', 
    label: 'Inward Consignments', 
    shortLabel: 'Consignments', 
    title: 'Stage 1: Inward Consignments', 
    icon: Truck, 
    desc: 'Distilleries dispatch bulk cases & generate automated GRN to stock wholesale depots.' 
  },
  { 
    id: 'directory', 
    step: 3, 
    badge: '02', 
    label: 'Distilleries Directory', 
    shortLabel: 'Directory', 
    title: 'Stage 2: Distilleries Directory', 
    icon: Factory, 
    desc: 'State-wide registered distilleries, licensed capacities & contact directory.' 
  },
  { 
    id: 'scorecard', 
    step: 4, 
    badge: '03', 
    label: 'Supplier Scorecard', 
    shortLabel: 'Scorecard', 
    title: 'Stage 3: Supplier Scorecard', 
    icon: BadgePercent, 
    desc: 'Supplier delivery SLAs, performance metrics, compliance & dispatch ratings.' 
  },
  { 
    id: 'depots', 
    step: 5, 
    badge: '04', 
    label: 'Wholesale Depots', 
    shortLabel: 'Depots', 
    title: 'Stage 4: Wholesale Depots', 
    icon: Warehouse, 
    desc: 'Regional state buffer warehouse capacity, available cases & inward arrivals.' 
  },
  { 
    id: 'inventory', 
    step: 6, 
    badge: '05', 
    label: 'Store Stockroom', 
    shortLabel: 'Store Stock', 
    title: 'Stage 5: Store Stockroom', 
    icon: Store, 
    desc: 'Retail store shelf inventory, daily sales velocity & replenishment alerts.' 
  },
  { 
    id: 'catalog', 
    step: 7, 
    badge: '06', 
    label: 'Wholesale Catalog', 
    shortLabel: 'Catalog', 
    title: 'Stage 6: Wholesale Catalog', 
    icon: LayoutGrid, 
    desc: 'Browse approved brands, check MRP & submit retail store replenishment indents.' 
  },
  { 
    id: 'orders', 
    step: 8, 
    badge: '07', 
    label: 'Orders & Transit', 
    shortLabel: 'Orders', 
    title: 'Stage 7: Orders & Transit', 
    icon: Truck, 
    desc: 'Sequential delivery tracking, dispatch timeline, animated truck & official transit e-Pass.' 
  },
];

const MANUFACTURING_STAGES = [
  { 
    id: 'consignments', 
    step: 1, 
    badge: '01', 
    label: 'Inward Consignments', 
    shortLabel: 'Consignments', 
    title: 'Stage 1: Inward Consignments', 
    icon: Truck, 
    desc: 'Distilleries dispatch bulk cases & generate automated GRN to stock wholesale depots.' 
  },
  { 
    id: 'directory', 
    step: 2, 
    badge: '02', 
    label: 'Distilleries Directory', 
    shortLabel: 'Directory', 
    title: 'Stage 2: Distilleries Directory', 
    icon: Factory, 
    desc: 'State-wide registered distilleries, licensed capacities & contact directory.' 
  },
  { 
    id: 'scorecard', 
    step: 3, 
    badge: '03', 
    label: 'Supplier Scorecard', 
    shortLabel: 'Scorecard', 
    title: 'Stage 3: Supplier Scorecard', 
    icon: BadgePercent, 
    desc: 'Supplier delivery SLAs, performance metrics, compliance & dispatch ratings.' 
  },
];

const DEPOT_STAGES = [
  { 
    id: 'depots', 
    step: 1, 
    badge: '01', 
    label: 'Wholesale Depots', 
    shortLabel: 'Depots', 
    title: 'Stage 1: Wholesale Depots', 
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
    shortLabel: 'Store Stock', 
    title: 'Stage 1: Store Stockroom', 
    icon: Store, 
    desc: 'Retail store shelf inventory, daily sales velocity & replenishment alerts.' 
  },
  { 
    id: 'catalog', 
    step: 2, 
    badge: '02', 
    label: 'Wholesale Catalog', 
    shortLabel: 'Catalog', 
    title: 'Stage 2: Wholesale Catalog', 
    icon: LayoutGrid, 
    desc: 'Browse approved brands, check MRP & submit retail store replenishment indents.' 
  },
  { 
    id: 'orders', 
    step: 3, 
    badge: '03', 
    label: 'Orders & Transit', 
    shortLabel: 'Orders', 
    title: 'Stage 3: Orders & Transit', 
    icon: Truck, 
    desc: 'Sequential delivery tracking, dispatch timeline, animated truck & official transit e-Pass.' 
  },
];

export function App() {
  const [portalMode, setPortalMode] = useState(() => {
    return localStorage.getItem('tasmac_portal_mode') || 'admin';
  });
  const [currentTab, setCurrentTab] = useState(() => {
    const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
    if (ALL_PAGE_IDS.includes(rawHash)) {
      return rawHash;
    }
    const savedMode = localStorage.getItem('tasmac_portal_mode') || 'admin';
    if (savedMode === 'admin') return 'overview';
    if (savedMode === 'depot') return 'depots';
    return savedMode === 'manufacturing' ? 'consignments' : 'inventory';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [showHeaderAlerts, setShowHeaderAlerts] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [replenishing, setReplenishing] = useState(false);
  const [selectedDepotId, setSelectedDepotId] = useState(1);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [expandedDepotId, setExpandedDepotId] = useState(1);

  const loadAlerts = async () => {
    try {
      const data = await fetchSystemAlerts();
      setAlerts(data || []);
    } catch (e) {
      console.error('Failed to load system alerts:', e);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerReplenishment = async () => {
    try {
      setReplenishing(true);
      await triggerReplenishment();
      await loadAlerts();
    } catch (e) {
      console.error('Auto replenishment failed:', e);
    } finally {
      setReplenishing(false);
    }
  };

  const handleDismissAlert = async (id) => {
    try {
      await dismissAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error('Dismiss failed:', e);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const getPageHeading = () => {
    switch (currentTab) {
      case 'overview':
        return 'Executive Command Center';
      case 'suppliers':
      case 'consignments':
        return 'Inward Consignments';
      case 'directory':
        return 'Distilleries Directory';
      case 'scorecard':
        return 'Supplier Scorecard';
      case 'depots': {
        const effectiveDepots = getEffectiveDepotConfigs(depots);
        const dObj = effectiveDepots.find(d => d.id === selectedDepotId);
        const whObj = dObj?.warehouses?.find(w => w.id === selectedWarehouseId);
        if (whObj) {
          return `${dObj?.shortName || 'Depot'} • ${whObj.shortName}`;
        }
        return dObj ? `${dObj.shortName} Wholesale Depot` : 'Wholesale Depots';
      }
      case 'inventory':
        return 'Store Stockroom';
      case 'catalog':
        return 'Wholesale Catalog';
      case 'orders':
        return 'Orders & Transit';
      case 'add-bottle':
        return 'Add New Bottle';
      case 'login':
        return 'Portal Access';
      default:
        return 'TASMAC Supply Chain';
    }
  };

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
    if (mode === 'admin') {
      setCurrentTab('overview');
      window.location.hash = '#overview';
    } else if (mode === 'manufacturing') {
      setCurrentTab('consignments');
      window.location.hash = '#consignments';
    } else if (mode === 'depot') {
      setCurrentTab('depots');
      window.location.hash = '#depots';
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
      } else if (rawHash === 'overview') {
        setViewMode('portal');
        setPortalMode('admin');
        localStorage.setItem('tasmac_portal_mode', 'admin');
        setCurrentTab('overview');
      } else if (rawHash === 'login' || rawHash === 'mfg-login' || rawHash === 'retail-login' || rawHash === 'depot-login' || rawHash === 'admin-login') {
        setViewMode('portal');
        setCurrentTab('login');
        if (rawHash === 'admin-login') {
          setPortalMode('admin');
          localStorage.setItem('tasmac_portal_mode', 'admin');
        } else if (rawHash === 'mfg-login') {
          setPortalMode('manufacturing');
          localStorage.setItem('tasmac_portal_mode', 'manufacturing');
        } else if (rawHash === 'retail-login') {
          setPortalMode('retail');
          localStorage.setItem('tasmac_portal_mode', 'retail');
        } else if (rawHash === 'depot-login') {
          setPortalMode('depot');
          localStorage.setItem('tasmac_portal_mode', 'depot');
        }
      } else if (rawHash === 'suppliers' || rawHash === 'consignments' || rawHash === 'directory' || rawHash === 'scorecard') {
        setViewMode('portal');
        if (portalMode !== 'admin') {
          setPortalMode('manufacturing');
          localStorage.setItem('tasmac_portal_mode', 'manufacturing');
        }
        setCurrentTab(rawHash === 'suppliers' ? 'consignments' : rawHash);
      } else if (rawHash === 'add-depot') {
        setViewMode('portal');
        setCurrentTab('depots');
        window.location.hash = '#depots';
      } else if (rawHash.startsWith('depot')) {
        setViewMode('portal');
        if (portalMode !== 'admin') {
          setPortalMode('depot');
          localStorage.setItem('tasmac_portal_mode', 'depot');
        }
        setCurrentTab('depots');
        const parts = rawHash.split('-');
        if (parts.length >= 2 && !isNaN(parseInt(parts[1]))) {
          const dId = parseInt(parts[1]);
          setSelectedDepotId(dId);
          setExpandedDepotId(dId);
          if (parts.length >= 4) {
            const whId = parts.slice(2).join('-');
            setSelectedWarehouseId(whId);
          } else {
            setSelectedWarehouseId(null);
          }
        }
      } else if (rawHash === 'inventory' || rawHash === 'catalog' || rawHash === 'orders' || rawHash === 'add-bottle') {
        setViewMode('portal');
        if (portalMode !== 'admin') {
          setPortalMode('retail');
          localStorage.setItem('tasmac_portal_mode', 'retail');
        }
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

  const navigateToPortal = (tabId = 'consignments') => {
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
    const targetMode = preferredPortal || (
      user?.role?.toUpperCase().includes('ADMIN') || user?.username === 'admin' ? 'admin' :
      user?.role?.toUpperCase().includes('DEPOT') ? 'depot' :
      user?.role?.includes('Distillery') || user?.role?.toUpperCase().includes('MANUFACTURING') ? 'manufacturing' : 
      'retail'
    );
    setPortalMode(targetMode);
    localStorage.setItem('tasmac_portal_mode', targetMode);
    if (user?.default_stage) {
      navigateToPortal(user.default_stage);
    } else {
      navigateToPortal(
        targetMode === 'admin' ? 'overview' : 
        targetMode === 'manufacturing' ? 'consignments' : 
        targetMode === 'depot' ? 'depots' : 
        'inventory'
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tasmac_auth_token');
    localStorage.removeItem('tasmac_auth_user');
    setCurrentUser(null);
    navigateToLogin();
  };

  const handleSwitchRole = (roleConfig) => {
    const switchedUser = {
      id: currentUser?.id || 1,
      username: roleConfig.roleKey.toLowerCase(),
      email: roleConfig.email,
      full_name: roleConfig.full_name,
      role: roleConfig.roleKey,
      organization: roleConfig.organization,
      code: roleConfig.code,
      default_stage: roleConfig.default_stage,
      allowed_stages: [roleConfig.default_stage],
      is_active: true
    };
    setCurrentUser(switchedUser);
    localStorage.setItem('tasmac_auth_user', JSON.stringify(switchedUser));
    setPortalMode(roleConfig.portalMode);
    localStorage.setItem('tasmac_portal_mode', roleConfig.portalMode);
    navigateToPortal(roleConfig.default_stage);
  };

  const handleTogglePortalMode = () => {
    const newMode = portalMode === 'manufacturing' ? 'retail' : 'manufacturing';
    handleSelectPortal(newMode);
  };

  const isAdmin = currentUser?.role?.toUpperCase().includes('ADMIN') || currentUser?.username === 'admin';

  const getRolePages = () => {
    if (portalMode === 'admin') {
      return [
        { id: 'overview', label: 'Master Overview', icon: ShieldCheck, mode: 'admin' },
        { id: 'consignments', label: 'Inward Consignments', icon: Truck, mode: 'admin' },
        { id: 'directory', label: 'Distilleries Directory', icon: Factory, mode: 'admin' },
        { id: 'scorecard', label: 'Supplier Scorecard', icon: BadgePercent, mode: 'admin' },
        { id: 'depots', label: 'Wholesale Depots', icon: Warehouse, mode: 'admin' },
        { id: 'inventory', label: 'Store Stockroom', icon: Store, mode: 'admin' },
        { id: 'catalog', label: 'Wholesale Catalog', icon: LayoutGrid, mode: 'admin' },
        { id: 'orders', label: 'Orders & Transit', icon: Truck, mode: 'admin' },
      ];
    }
    if (portalMode === 'manufacturing') {
      return [
        { id: 'consignments', label: 'Inward Consignments', icon: Truck, mode: 'manufacturing' },
        { id: 'directory', label: 'Distilleries Directory', icon: Factory, mode: 'manufacturing' },
        { id: 'scorecard', label: 'Supplier Scorecard', icon: BadgePercent, mode: 'manufacturing' },
      ];
    }
    if (portalMode === 'depot') {
      return [
        { id: 'depots', label: 'Wholesale Depots', icon: Warehouse, mode: 'depot' },
      ];
    }
    if (portalMode === 'retail') {
      return [
        { id: 'inventory', label: 'Store Stockroom', icon: Store, mode: 'retail' },
        { id: 'catalog', label: 'Wholesale Catalog', icon: LayoutGrid, mode: 'retail' },
        { id: 'orders', label: 'Orders & Transit', icon: Truck, mode: 'retail' },
      ];
    }
    return [
      { id: 'overview', label: 'Master Overview', icon: ShieldCheck, mode: 'admin' },
      { id: 'consignments', label: 'Inward Consignments', icon: Truck, mode: 'admin' },
      { id: 'directory', label: 'Distilleries Directory', icon: Factory, mode: 'admin' },
      { id: 'scorecard', label: 'Supplier Scorecard', icon: BadgePercent, mode: 'admin' },
      { id: 'depots', label: 'Wholesale Depots', icon: Warehouse, mode: 'admin' },
      { id: 'inventory', label: 'Store Stockroom', icon: Store, mode: 'admin' },
      { id: 'catalog', label: 'Wholesale Catalog', icon: LayoutGrid, mode: 'admin' },
      { id: 'orders', label: 'Orders & Transit', icon: Truck, mode: 'admin' },
    ];
  };

  const activePages = getRolePages();
  const activeStages = portalMode === 'admin'
    ? ADMIN_STAGES
    : portalMode === 'manufacturing' 
      ? MANUFACTURING_STAGES 
      : portalMode === 'depot' 
        ? DEPOT_STAGES 
        : RETAIL_STAGES;
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
        onEnterPortal={() => navigateToPortal(portalMode === 'manufacturing' ? 'consignments' : portalMode === 'depot' ? 'depots' : 'inventory')}
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
          <nav className="flex-1 py-3 px-1 space-y-1 font-mono overflow-y-auto">
            {portalMode === 'depot' ? (
              <div className="space-y-1.5">

                {getEffectiveDepotConfigs(depots).map((depot) => {
                  const isDepotActive = currentTab === 'depots' && selectedDepotId === depot.id;
                  const isExpanded = expandedDepotId === depot.id;

                  return (
                    <div key={depot.id} className="space-y-0.5">
                      {/* Depot Parent Tile */}
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentTab('depots');
                          setSelectedDepotId(depot.id);
                          setSelectedWarehouseId(null);
                          setExpandedDepotId(expandedDepotId === depot.id ? null : depot.id);
                          window.location.hash = `#depot-${depot.id}`;
                        }}
                        className={`w-full h-10 rounded-lg flex items-center transition-colors duration-150 cursor-pointer font-mono text-xs uppercase font-bold tracking-wider relative group ${
                          isDepotActive && !selectedWarehouseId
                            ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/40 shadow-xs'
                            : isDepotActive
                            ? 'bg-orange-500/5 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="w-10 h-10 flex items-center justify-center shrink-0 relative">
                          <Warehouse size={16} strokeWidth={1.75} className={`w-4 h-4 shrink-0 transition-colors ${isDepotActive ? 'text-orange-500' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white'}`} />
                          <span className="absolute -bottom-0.5 right-1 text-[8px] font-mono font-bold text-zinc-400 dark:text-zinc-500">
                            {depot.initials}
                          </span>
                        </div>

                        <span
                          className={`whitespace-nowrap overflow-hidden transition-opacity duration-200 truncate flex-1 text-left ${
                            isSidebarExpanded ? 'opacity-100 pr-1' : 'opacity-0 max-w-0 pointer-events-none'
                          } ${isDepotActive ? 'text-orange-600 dark:text-orange-400 font-bold' : ''}`}
                        >
                          {depot.shortName}
                        </span>

                        {isSidebarExpanded && (
                          <ChevronDown 
                            size={14} 
                            className={`mr-2 shrink-0 text-zinc-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-orange-500' : ''}`} 
                          />
                        )}

                        {!isSidebarExpanded && (
                          <div className="absolute left-full ml-2.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#101010] border border-orange-500/30 dark:border-orange-500/40 text-orange-600 dark:text-orange-400 font-mono text-xs font-bold shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.8)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            <span>{depot.name} (5 Warehouses)</span>
                          </div>
                        )}
                      </button>

                      {/* 3 Warehouses nested under this Depot */}
                      {isSidebarExpanded && isExpanded && (
                        <div className="pl-3.5 pr-1 space-y-1 py-1 border-l-2 border-orange-500/30 ml-4.5 animate-fade-in">
                          {depot.warehouses.map((wh) => {
                            const isWhActive = isDepotActive && selectedWarehouseId === wh.id;
                            const WhIcon = wh.categories.includes('BEER') ? Beer : wh.categories.includes('WINE') ? Wine : wh.categories.includes('VODKA') ? Sparkles : wh.categories.includes('RUM') ? Flame : Boxes;

                            return (
                              <button
                                key={wh.id}
                                type="button"
                                onClick={() => {
                                  setCurrentTab('depots');
                                  setSelectedDepotId(depot.id);
                                  setSelectedWarehouseId(wh.id);
                                  window.location.hash = `#depot-${depot.id}-${wh.id}`;
                                }}
                                className={`w-full py-1.5 px-2 rounded-md flex items-center gap-2 text-left transition-colors cursor-pointer text-[10px] font-mono ${
                                  isWhActive
                                    ? 'bg-orange-500 text-white font-bold shadow-xs'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/5'
                                }`}
                              >
                                <WhIcon size={12} className={`shrink-0 ${isWhActive ? 'text-white' : 'text-orange-400'}`} />
                                <span className="truncate">{wh.shortName}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              activePages.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || (item.id === 'consignments' && currentTab === 'suppliers');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.mode && item.mode !== portalMode) {
                      setPortalMode(item.mode);
                      localStorage.setItem('tasmac_portal_mode', item.mode);
                    }
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
            })
            )}
          </nav>
        </aside>
      )}

      {/* 2. Main Viewport Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:h-auto print:overflow-visible print:w-full">
        {/* Top Header - Matching Reference Screenshot */}
        <header className="shrink-0 z-40 bg-white dark:bg-[#000000] border-b border-zinc-200 dark:border-white/10 print:hidden transition-colors">
          <div className={`w-full px-4 sm:px-6 lg:px-8 ${currentTab === 'login' ? 'h-11' : 'h-14'} flex items-center justify-between gap-4 font-sans`}>
            {/* Left: Heading matching screenshot */}
            <div className="flex items-center gap-3 min-w-0">
              {currentTab !== 'login' ? (
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white truncate">
                  {getPageHeading()}
                </h1>
              ) : (
                <div />
              )}
            </div>

            {/* Right: Actions suite + Search Bar (Moved to right, matching reference width & clear styling) */}
            <div className="flex items-center justify-end gap-2 sm:gap-2.5 shrink-0">
              {/* Clean search bar matching user reference image */}
              {currentTab !== 'login' && (
                <div className="relative w-44 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={(currentTab === 'suppliers' || currentTab === 'consignments' || currentTab === 'directory' || currentTab === 'scorecard') ? 'Search consignments, distilleries...' : currentTab === 'depots' ? 'Search depots & inventory...' : 'Search...'}
                    value={headerSearchQuery}
                    onChange={(e) => setHeaderSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  {headerSearchQuery && (
                    <button
                      onClick={() => setHeaderSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* 2. Fullscreen / Maximize Toggle */}
              {currentTab !== 'login' && (
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition cursor-pointer"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* 3. Notification Bell with Orange Dot & Popover */}
              {currentTab !== 'login' && (
                <div className="relative">
                  <button
                    onClick={() => setShowHeaderAlerts(!showHeaderAlerts)}
                    title="Active Alerts & Notifications"
                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition cursor-pointer relative"
                  >
                    <Bell className="w-4 h-4" />
                    {alerts.length > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-orange-600 text-white text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-white dark:ring-black">
                        {alerts.length > 9 ? '9+' : alerts.length}
                      </span>
                    )}
                  </button>

                  {/* Alerts Popover Dropdown */}
                  {showHeaderAlerts && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 p-3 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl z-50 animate-slideDown font-sans">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">Supply Chain Alerts</span>
                          <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase font-mono px-1.5 py-0.5 rounded bg-orange-500/10">
                            {alerts.length} Active
                          </span>
                        </div>
                        <button
                          onClick={handleTriggerReplenishment}
                          disabled={replenishing}
                          className="px-2 py-0.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Generate indents for shops and consignments for depots"
                        >
                          <RotateCw className={`w-2.5 h-2.5 ${replenishing ? 'animate-spin' : ''}`} />
                          <span>{replenishing ? 'Dispatching...' : 'Auto-Replenish'}</span>
                        </button>
                      </div>

                      <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-1">
                        {alerts.length === 0 ? (
                          <div className="py-6 text-center text-zinc-400 text-xs font-mono">
                            ✓ All state supply chain nodes stocked within thresholds.
                          </div>
                        ) : (
                          alerts.map((al) => {
                            const isShopAlert = al.alert_type === 'RETAIL_REPLENISHMENT';
                            const isDepotAlert = al.alert_type === 'DEPOT_REQUISITION';

                            return (
                              <div 
                                key={al.id}
                                className={`p-2.5 rounded-xl border transition-all text-xs relative group ${
                                  isShopAlert
                                    ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-500/20'
                                    : isDepotAlert
                                    ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-500/20'
                                    : 'bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/5'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 ${
                                      isShopAlert
                                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                        : isDepotAlert
                                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400'
                                        : 'bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-300'
                                    }`}>
                                      {isShopAlert ? '🏪 Vend → Depot' : isDepotAlert ? '🏢 Depot → Distillery' : 'System'}
                                    </span>
                                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-[11px] truncate">
                                      {al.title}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleDismissAlert(al.id)}
                                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer p-0.5 shrink-0"
                                    title="Dismiss alert"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                                  {al.message}
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Dark / Light Mode Toggle Button (Moon / Sun) */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'White' : 'Dark'} Mode`}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-zinc-700" />
                )}
              </button>

              {/* 5. Replenishment Indent Cart (Only in Retail Shops Portal and not on login page) */}
              {portalMode === 'retail' && currentTab !== 'login' && (
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="font-mono text-xs uppercase font-bold tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0 cursor-pointer group"
                >
                  <ShoppingCart className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Cart</span>
                  {totalCartCases > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-orange-600 text-white font-mono font-bold text-[10px] min-w-[16px] h-[16px] flex items-center justify-center shadow-sm">
                      {totalCartCases}
                    </span>
                  )}
                </button>
              )}

              {/* 6. User Profile Avatar Dropdown with Active Role Switcher */}
              <UserProfileDropdown 
                currentUser={currentUser}
                portalMode={portalMode}
                onSwitchRole={handleSwitchRole}
                onTogglePortalMode={handleTogglePortalMode}
                onLogout={handleLogout}
                onOpenLogin={() => navigateToLogin()}
              />
            </div>
          </div>
        </header>

        {/* Web App Viewport (Zero outer scroll across all pages) */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden print:h-auto print:overflow-visible">
          {/* Main Content Area */}
          <main className={`w-full ${currentTab === 'login' ? 'flex-1 h-full flex items-center justify-center p-1 sm:p-2' : 'flex-1 min-h-0 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 py-3.5'} print:p-0 print:m-0`}>
            {currentTab === 'overview' && (
              <AdminOverview 
                onNavigateToPage={(pageId) => {
                  setCurrentTab(pageId);
                  window.location.hash = `#${pageId}`;
                }}
                externalSearchQuery={headerSearchQuery}
              />
            )}
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
                externalSearchQuery={headerSearchQuery}
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
              <DepotStock 
                externalSearchQuery={headerSearchQuery}
                selectedDepotId={selectedDepotId}
                selectedWarehouseId={selectedWarehouseId}
                onSelectDepot={(depotId) => {
                  setSelectedDepotId(depotId);
                  setExpandedDepotId(depotId);
                  setSelectedWarehouseId(null);
                  window.location.hash = `#depot-${depotId}`;
                }}
                onSelectWarehouse={(whId) => {
                  setSelectedWarehouseId(whId);
                  if (whId) {
                    window.location.hash = `#depot-${selectedDepotId}-${whId}`;
                  } else {
                    window.location.hash = `#depot-${selectedDepotId}`;
                  }
                }}
              />
            )}
            {currentTab === 'inventory' && (
              <ShopInventory
                selectedShop={selectedShop}
                onSelectShop={setSelectedShop}
                shops={shops}
                onOpenMap={() => setIsMapModalOpen(true)}
                onQuickIndent={handleQuickIndentFromInventory}
                externalSearchQuery={headerSearchQuery}
              />
            )}
            {(currentTab === 'suppliers' || currentTab === 'consignments' || currentTab === 'directory' || currentTab === 'scorecard') && (
              <SupplierManagement 
                externalSearchQuery={headerSearchQuery} 
                activeTab={currentTab === 'directory' ? 'directory' : currentTab === 'scorecard' ? 'scorecard' : 'consignments'}
                onTabChange={(tabKey) => {
                  setCurrentTab(tabKey);
                  window.location.hash = `#${tabKey}`;
                }}
              />
            )}
            {currentTab === 'add-bottle' && (
              <AddBottle onBottleAdded={() => {
                setCurrentTab('catalog');
                window.location.hash = '#catalog';
              }} />
            )}
          </main>

          {/* Compact Enterprise Status Bar Footer - Fixed at bottom */}
          <footer className="shrink-0 h-8 border-t border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#000000] px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[11px] text-zinc-500 font-sans select-none print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-zinc-700 dark:text-zinc-300">State Wholesale Dispatch Network Online</span>
              <span className="text-zinc-400">&bull;</span>
              <span className="hidden sm:inline text-zinc-500">Tamil Nadu State Marketing Corporation (TASMAC)</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <button 
                onClick={navigateToLanding}
                className="hover:text-orange-500 transition cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <span>Public Landing</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
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

