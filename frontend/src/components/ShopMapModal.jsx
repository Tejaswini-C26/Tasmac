import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Store, 
  Building2, 
  Search, 
  X, 
  Check, 
  ShoppingCart, 
  Truck, 
  Phone, 
  User, 
  Layers, 
  Navigation,
  Sparkles,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';

const REGIONS = [
  {
    id: 'Chennai',
    name: 'Chennai Metropolitan',
    shortName: 'Chennai',
    code: 'CHN',
    centroid: { x: 505, y: 115 },
    path: 'M 450,70 L 560,95 L 550,165 L 470,150 L 440,110 Z',
    depotName: 'Ambattur Wholesale Depot #1',
    depotPos: { x: 485, y: 125 },
    description: 'Capital Coastal Hub • High throughput retail & Elite mall vends',
  },
  {
    id: 'Vellore',
    name: 'Vellore & North Border',
    shortName: 'Vellore',
    code: 'VEL',
    centroid: { x: 395, y: 110 },
    path: 'M 330,75 L 450,70 L 440,110 L 470,150 L 415,185 L 340,145 Z',
    depotName: 'Ambattur Depot (North Feeder)',
    depotPos: { x: 420, y: 140 },
    description: 'Northern junction corridor connecting Katpadi & surrounding vends',
  },
  {
    id: 'Salem',
    name: 'Salem & North-Central',
    shortName: 'Salem',
    code: 'SLM',
    centroid: { x: 345, y: 230 },
    path: 'M 340,145 L 415,185 L 460,205 L 420,295 L 320,295 L 260,230 L 285,175 Z',
    depotName: 'Salem West Wholesale Depot #4',
    depotPos: { x: 350, y: 250 },
    description: 'Industrial manufacturing belt & Shevaroy hill ranges',
  },
  {
    id: 'Coimbatore',
    name: 'Coimbatore & Western Ghats',
    shortName: 'Coimbatore',
    code: 'CBE',
    centroid: { x: 200, y: 340 },
    path: 'M 150,290 L 260,230 L 320,295 L 290,380 L 225,410 L 155,395 L 135,340 Z',
    depotName: 'Coimbatore Central Wholesale Depot #2',
    depotPos: { x: 220, y: 355 },
    description: 'Western textile capital & high premium brand turnover',
  },
  {
    id: 'Trichy',
    name: 'Tiruchirappalli (Kaveri Delta)',
    shortName: 'Trichy',
    code: 'TRY',
    centroid: { x: 400, y: 360 },
    path: 'M 320,295 L 420,295 L 515,310 L 530,375 L 470,430 L 375,430 L 290,380 Z',
    depotName: 'Trichy Central Wholesale Depot #5',
    depotPos: { x: 410, y: 380 },
    description: 'Central distribution hub serving Kaveri delta retail vends',
  },
  {
    id: 'Madurai',
    name: 'Madurai & South-Central',
    shortName: 'Madurai',
    code: 'MDU',
    centroid: { x: 320, y: 490 },
    path: 'M 225,410 L 290,380 L 375,430 L 470,430 L 420,530 L 320,565 L 235,530 L 195,460 Z',
    depotName: 'Madurai South Wholesale Depot #3',
    depotPos: { x: 335, y: 510 },
    description: 'Southern cultural capital & heavy commercial transit corridor',
  },
  {
    id: 'Tirunelveli',
    name: 'Tirunelveli & Deep South',
    shortName: 'Tirunelveli',
    code: 'TNV',
    centroid: { x: 285, y: 640 },
    path: 'M 235,530 L 320,565 L 420,530 L 380,620 L 330,715 L 285,730 L 240,670 L 215,590 Z',
    depotName: 'Madurai South Depot (Southern Feeder)',
    depotPos: { x: 295, y: 620 },
    description: 'Deep south terminal district connecting Cape Comorin & Tirunelveli',
  },
];

export function ShopMapModal({
  isOpen,
  onClose,
  shops = [],
  depots = [],
  selectedShop = null,
  onSelectShop,
  onOrderForShop,
}) {
  const [activeRegionId, setActiveRegionId] = useState(() => selectedShop?.district || 'Chennai');
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [shopTypeFilter, setShopTypeFilter] = useState('ALL');

  // Track active theme (Dark Mode / Light Mode) dynamically
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    const updateThemeState = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    updateThemeState();

    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Compute shop count per region
  const shopsByDistrict = useMemo(() => {
    const map = {};
    shops.forEach((s) => {
      const d = s.district || 'Chennai';
      if (!map[d]) map[d] = [];
      map[d].push(s);
    });
    return map;
  }, [shops]);

  const activeRegion = REGIONS.find((r) => r.id === activeRegionId) || REGIONS[0];

  // Filtered shops based on active region, type, and search query
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          shop.name.toLowerCase().includes(q) ||
          shop.shop_code.toLowerCase().includes(q) ||
          shop.district.toLowerCase().includes(q) ||
          shop.address.toLowerCase().includes(q) ||
          (shop.manager_name && shop.manager_name.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      } else if (activeRegionId !== 'ALL' && shop.district !== activeRegionId) {
        return false;
      }

      if (shopTypeFilter !== 'ALL' && shop.shop_type !== shopTypeFilter) {
        return false;
      }

      return true;
    });
  }, [shops, activeRegionId, searchQuery, shopTypeFilter]);

  if (!isOpen) return null;

  const handleShopSelectAndOrder = (shop) => {
    if (onOrderForShop) {
      onOrderForShop(shop);
    } else if (onSelectShop) {
      onSelectShop(shop);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl max-h-[92vh] bg-white dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 rounded-md shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:px-6 border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#000000] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shadow-sm">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 font-bold">
                  TASMAC Statewide Geographic Telemetry
                </span>
                <span className="hidden sm:inline text-xs text-zinc-400 dark:text-zinc-500">&bull;</span>
                <span className="hidden sm:inline text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                  {shops.length} Retail Stores Online
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                Statewide Retail Vend Locator & Region Map
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition cursor-pointer"
            title="Close Map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Region Quick Filter Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-zinc-100 dark:bg-[#090a0e] border-b border-zinc-200 dark:border-white/[0.06] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1 font-semibold">
            <Layers className="w-3.5 h-3.5 text-orange-500" />
            Select Region:
          </span>

          <button
            onClick={() => {
              setActiveRegionId('ALL');
              setSearchQuery('');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeRegionId === 'ALL'
                ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/30'
                : 'bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/5'
            }`}
          >
            <span>All Regions</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeRegionId === 'ALL' ? 'bg-black/30 text-white' : 'bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300'
            }`}>
              {shops.length}
            </span>
          </button>

          {REGIONS.map((region) => {
            const count = (shopsByDistrict[region.id] || []).length;
            const isSelected = activeRegionId === region.id;
            return (
              <button
                key={region.id}
                onClick={() => {
                  setActiveRegionId(region.id);
                  setSearchQuery('');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/30'
                    : 'bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/5'
                }`}
              >
                <span>{region.shortName}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected 
                    ? 'bg-black/30 text-white' 
                    : 'bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Body: 2 Columns (Map on Left, Shops on Right) */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          
          {/* LEFT: Interactive Tamil Nadu SVG Map Canvas - Responsive to Theme */}
          <div className="lg:w-7/12 flex flex-col bg-zinc-100/70 dark:bg-[#07080b] border-r border-zinc-200 dark:border-white/[0.08] select-none">
            
            {/* SVG Canvas Container with relative positioning for overlays */}
            <div className="flex-1 w-full h-full relative flex items-center justify-center p-2 sm:p-4 min-h-[380px] lg:min-h-0 overflow-hidden">
              
              {/* Map Header Overlay */}
              <div className="absolute top-4 left-4 z-10 bg-white dark:bg-[#0c0d14] border border-zinc-200 dark:border-white/10 rounded-md p-3 shadow-sm pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                    Tamil Nadu State Grid
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Click any region polygon or hub pin to explore local retail shops.
                </p>
              </div>

              {/* Map Legend Overlay */}
              <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-[#0c0d14] border border-zinc-200 dark:border-white/10 rounded-md p-3 text-xs font-mono space-y-2 shadow-sm hidden sm:block">
                <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white dark:border-zinc-800 shrink-0" />
                  <span className="font-medium">Active Region Focus</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                  <span className="w-2.5 h-2.5 rotate-45 bg-[#0284c7] border border-white/60 shrink-0" />
                  <span className="font-medium">Wholesale Central Depot</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-500 dark:text-zinc-400">
                  <span className="w-3.5 h-0 border-t-2 border-dashed border-orange-500 shrink-0" />
                  <span>Logistics Transit Corridor</span>
                </div>
              </div>

              {/* SVG Canvas */}
              <svg 
                viewBox="0 0 680 780" 
                className="w-full h-full max-h-[580px] object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
              >
                <defs>
                  {/* Theme Adaptive Grid Pattern */}
                  <pattern id="geo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path 
                      d="M 40 0 L 0 0 0 40" 
                      fill="none" 
                      stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} 
                      strokeWidth="1" 
                    />
                  </pattern>

                  {/* Theme Adaptive Radial Glow */}
                  <radialGradient id="tn-glow" cx="45%" cy="45%" r="60%">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity={isDark ? "0.14" : "0.08"} />
                    <stop offset="60%" stopColor={isDark ? "#1e293b" : "#e2e8f0"} stopOpacity={isDark ? "0.05" : "0.03"} />
                    <stop offset="100%" stopColor={isDark ? "#050608" : "#f8fafc"} stopOpacity="0.0" />
                  </radialGradient>
                </defs>

                {/* Background Tech Grid */}
                <rect width="680" height="780" fill="url(#geo-grid)" />
                <rect width="680" height="780" fill="url(#tn-glow)" />

                {/* Coastal Water Accents */}
                <path 
                  d="M 570,40 Q 610,250 560,420 T 360,750" 
                  fill="none" 
                  stroke={isDark ? "rgba(56,189,248,0.15)" : "rgba(2,132,199,0.22)"} 
                  strokeWidth="2" 
                  strokeDasharray="4 8"
                />
                <text 
                  x="590" 
                  y="240" 
                  fill={isDark ? "rgba(56,189,248,0.3)" : "rgba(2,132,199,0.5)"} 
                  fontSize="11" 
                  fontFamily="monospace" 
                  letterSpacing="4" 
                  transform="rotate(70 590 240)"
                >
                  BAY OF BENGAL
                </text>
                <text 
                  x="380" 
                  y="740" 
                  fill={isDark ? "rgba(56,189,248,0.3)" : "rgba(2,132,199,0.5)"} 
                  fontSize="10" 
                  fontFamily="monospace" 
                  letterSpacing="3"
                >
                  INDIAN OCEAN
                </text>

                {/* Base Tamil Nadu Landmass Silhouette (Adaptive Fill & Stroke) */}
                <path
                  d="M 330,75 
                     L 450,70 L 560,95 L 550,165 L 515,310 L 530,375 L 470,430 L 420,530 L 380,620 L 330,715 L 285,730 L 240,670 L 215,590 L 195,460 L 155,395 L 135,340 L 150,290 L 260,230 L 285,175 L 330,75 Z"
                  fill={isDark ? "#0c0e17" : "#e2e8f0"}
                  stroke={isDark ? "rgba(255,255,255,0.18)" : "#cbd5e1"}
                  strokeWidth="2"
                  className="transition-colors duration-300"
                />

                {/* Supply Logistics Route Vectors */}
                {REGIONS.map((r) => {
                  const isCurActive = activeRegionId === r.id;
                  return (
                    <g key={`route-${r.id}`}>
                      <line
                        x1={r.depotPos.x}
                        y1={r.depotPos.y}
                        x2={r.centroid.x}
                        y2={r.centroid.y}
                        stroke={isCurActive ? "#ea580c" : (isDark ? "rgba(249,115,22,0.3)" : "rgba(234,88,12,0.35)")}
                        strokeWidth={isCurActive ? "2.5" : "1.5"}
                        strokeDasharray={isCurActive ? "none" : "3 3"}
                        className="transition-all"
                      />
                    </g>
                  );
                })}

                {/* Interactive District / Region Polygons */}
                {REGIONS.map((region) => {
                  const isSelected = activeRegionId === region.id;
                  const isHovered = hoveredRegionId === region.id;
                  const count = (shopsByDistrict[region.id] || []).length;

                  // Adaptive Polygon Fill
                  let polygonFill;
                  if (isSelected) {
                    polygonFill = isDark ? 'rgba(234, 88, 12, 0.35)' : 'rgba(249, 115, 22, 0.25)';
                  } else if (isHovered) {
                    polygonFill = isDark ? 'rgba(234, 88, 12, 0.2)' : 'rgba(249, 115, 22, 0.14)';
                  } else {
                    polygonFill = isDark ? 'rgba(18, 22, 36, 0.75)' : '#f8fafc';
                  }

                  // Adaptive Polygon Stroke
                  let polygonStroke;
                  if (isSelected) {
                    polygonStroke = '#ea580c';
                  } else if (isHovered) {
                    polygonStroke = '#f97316';
                  } else {
                    polygonStroke = isDark ? 'rgba(255, 255, 255, 0.22)' : '#cbd5e1';
                  }

                  return (
                    <g 
                      key={region.id}
                      className="cursor-pointer group"
                      onClick={() => {
                        setActiveRegionId(region.id);
                        setSearchQuery('');
                      }}
                      onMouseEnter={() => setHoveredRegionId(region.id)}
                      onMouseLeave={() => setHoveredRegionId(null)}
                    >
                      {/* Polygon Path */}
                      <path
                        d={region.path}
                        fill={polygonFill}
                        stroke={polygonStroke}
                        strokeWidth={isSelected ? '2.5' : isHovered ? '2' : '1.2'}
                        className="transition-all duration-200"
                        style={{
                          filter: isSelected ? 'drop-shadow(0 0 10px rgba(249,115,22,0.4))' : 'none'
                        }}
                      />

                      {/* Region Centroid Hub Marker */}
                      <g transform={`translate(${region.centroid.x}, ${region.centroid.y})`}>
                        {/* Outer Pulse when active */}
                        {isSelected && (
                          <circle
                            r="22"
                            fill="none"
                            stroke="#ea580c"
                            strokeWidth="2"
                            className="animate-ping opacity-75"
                          />
                        )}

                        {/* Central Hub Pin */}
                        <circle
                          r={isSelected ? "14" : "11"}
                          fill={
                            isSelected 
                              ? "#ea580c" 
                              : isHovered 
                              ? "#f97316" 
                              : (isDark ? "#1e2438" : "#ffffff")
                          }
                          stroke={
                            isSelected || isHovered 
                              ? "#ffffff" 
                              : (isDark ? "#ffffff" : "#ea580c")
                          }
                          strokeWidth="2"
                          className="transition-all shadow-md"
                        />

                        {/* Store Count Badge inside Pin */}
                        <text
                          textAnchor="middle"
                          dy="4"
                          fill={
                            isSelected || isHovered 
                              ? "#ffffff" 
                              : (isDark ? "#ffffff" : "#ea580c")
                          }
                          fontSize={isSelected ? "11" : "10"}
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {count}
                        </text>

                        {/* Region Label Pill Below Pin */}
                        <g transform="translate(0, 26)">
                          <rect
                            x={- (region.shortName.length * 4.2 + 14)}
                            y="-11"
                            width={(region.shortName.length * 8.4 + 28)}
                            height="20"
                            rx="5"
                            fill={
                              isSelected 
                                ? "#ea580c" 
                                : (isDark ? "#0d0f18" : "#ffffff")
                            }
                            stroke={
                              isSelected 
                                ? "#ffffff" 
                                : (isDark ? "rgba(255,255,255,0.25)" : "#cbd5e1")
                            }
                            strokeWidth="1"
                            className="transition-all shadow-sm"
                          />
                          <text
                            textAnchor="middle"
                            dy="3"
                            fill={
                              isSelected 
                                ? "#ffffff" 
                                : (isDark ? "#ffffff" : "#1e293b")
                            }
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight={isSelected ? "bold" : "600"}
                          >
                            {region.shortName} ({count})
                          </text>
                        </g>
                      </g>

                      {/* Regional Wholesale Depot Diamond Indicator */}
                      <g transform={`translate(${region.depotPos.x}, ${region.depotPos.y})`}>
                        <polygon
                          points="0,-6 6,0 0,6 -6,0"
                          fill="#0284c7"
                          stroke={isDark ? "#ffffff" : "#0369a1"}
                          strokeWidth="1.5"
                          title={`Depot: ${region.depotName}`}
                        />
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Region Details Bar */}
            <div className="p-3 bg-white/95 dark:bg-[#0c0d14]/90 border-t border-zinc-200 dark:border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-orange-600 dark:text-orange-400 font-bold uppercase">{activeRegion.name}</span>
                <span className="text-zinc-400 dark:text-zinc-500">&bull;</span>
                <span className="text-zinc-600 dark:text-zinc-400">{activeRegion.depotName}</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {(shopsByDistrict[activeRegion.id] || []).length} Vends Linked
              </span>
            </div>
          </div>

          {/* RIGHT: Retail Shops in Selected Region Panel */}
          <div className="lg:w-5/12 flex flex-col bg-zinc-50 dark:bg-[#0c0d12] min-h-0">
            {/* Header & Search */}
            <div className="p-4 border-b border-zinc-200 dark:border-white/[0.08] space-y-3 bg-white dark:bg-[#0a0b10]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Store className="w-4 h-4 text-orange-500" />
                    <span>
                      {activeRegionId === 'ALL' ? 'All Statewide Stores' : `Retail Stores in ${activeRegion.shortName}`}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {filteredShops.length} retail store{filteredShops.length === 1 ? '' : 's'} available to order
                  </p>
                </div>

                {/* Shop Type Toggle */}
                <select
                  value={shopTypeFilter}
                  onChange={(e) => setShopTypeFilter(e.target.value)}
                  className="bg-zinc-100 dark:bg-[#141622] text-xs text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="ALL">All Types</option>
                  <option value="STANDARD_VEND">Standard Vend</option>
                  <option value="ELITE_MALL_SHOP">Elite Mall Shop</option>
                </select>
              </div>

              {/* Instant Search in Region */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shop by code, name, or street..."
                  className="w-full bg-zinc-100 dark:bg-[#12141e] border border-zinc-200 dark:border-white/10 rounded-md pl-9 pr-8 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Shops List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {filteredShops.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                    No Retail Stores Found
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                    No shops match the current search in this district. Try selecting another region from the map or clear filters.
                  </p>
                  <button
                    onClick={() => {
                      setActiveRegionId('ALL');
                      setSearchQuery('');
                      setShopTypeFilter('ALL');
                    }}
                    className="py-1.5 px-3 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-xs font-mono hover:bg-orange-500/20 transition cursor-pointer"
                  >
                    Reset & View All Statewide Shops
                  </button>
                </div>
              ) : (
                filteredShops.map((shop) => {
                  const isCurrentDestination = selectedShop?.id === shop.id;

                  return (
                    <div
                      key={shop.id}
                      className={`p-4 rounded-xl border-2 transition-all space-y-3 bg-white dark:bg-[#0f1118] ${
                        isCurrentDestination
                          ? 'border-orange-500 shadow-md shadow-orange-500/10'
                          : 'border-zinc-200 dark:border-white/[0.08] hover:border-orange-500/50'
                      }`}
                    >
                      {/* Shop Header Pill & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                            {shop.shop_code}
                          </span>
                          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                            shop.shop_type === 'ELITE_MALL_SHOP'
                              ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30'
                              : 'bg-zinc-100 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-500/20'
                          }`}>
                            {shop.shop_type === 'ELITE_MALL_SHOP' ? 'Elite Mall Store' : 'Standard Vend'}
                          </span>
                        </div>

                        {isCurrentDestination ? (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Current Destination
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                            {shop.district}
                          </span>
                        )}
                      </div>

                      {/* Shop Name & Address */}
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                          {shop.name}
                        </h4>
                        <div className="flex items-start gap-1.5 mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{shop.address}</span>
                        </div>
                      </div>

                      {/* Manager & Contact */}
                      <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                          <span>{shop.manager_name || 'Store In-Charge'}</span>
                        </div>
                        {shop.phone && (
                          <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                            <Phone className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                            <span>{shop.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button: Order for this Shop */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => handleShopSelectAndOrder(shop)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                            isCurrentDestination
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                              : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/25 hover:shadow-orange-600/40'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>
                            {isCurrentDestination
                              ? 'Order for this Shop (Selected)'
                              : 'Order for this Shop'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
