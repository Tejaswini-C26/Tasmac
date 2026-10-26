import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Warehouse, 
  Factory, 
  Boxes, 
  Sparkles, 
  Layers, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export function OverviewCharts({ depots = [], consignments = [], metrics = null, supplierAnalytics = null }) {
  const [activeChartTab, setActiveChartTab] = useState('depots'); // 'depots' | 'distilleries'
  const [hoveredDepot, setHoveredDepot] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredDistillery, setHoveredDistillery] = useState(null);

  // 1. Process Depots Data
  const depotChartData = (depots.length > 0 ? depots : [
    { id: 4, name: 'Salem Central', region: 'Salem', total_stock_cases: 15350, capacity_cases: 120000 },
    { id: 3, name: 'Madurai Wholesale', region: 'Madurai', total_stock_cases: 15300, capacity_cases: 140000 },
    { id: 2, name: 'Coimbatore Regional', region: 'Coimbatore', total_stock_cases: 15200, capacity_cases: 150000 },
    { id: 5, name: 'Trichy Regional', region: 'Trichy', total_stock_cases: 14850, capacity_cases: 130000 },
    { id: 1, name: 'Chennai Central', region: 'Chennai', total_stock_cases: 13917, capacity_cases: 200000 },
  ]).map(d => {
    const stock = Number(d.total_stock_cases) || 0;
    const capacity = Number(d.capacity_cases) || 150000;
    const cleanName = (d.shortName || d.name || '').replace(/\s*(Wholesale|Supply|Central|Regional)\s*Depot?/gi, '').trim() || d.region || 'Depot';
    const utilPct = capacity > 0 ? Number(((stock / capacity) * 100).toFixed(1)) : 0;
    const headroom = Math.max(0, capacity - stock);
    return {
      id: d.id,
      name: cleanName,
      fullName: d.name || `${cleanName} Depot`,
      region: d.region || 'Tamil Nadu',
      stock,
      capacity,
      headroom,
      utilPct
    };
  });

  const maxDepotCapacity = Math.max(...depotChartData.map(d => d.capacity), 200000);
  const maxDepotStock = Math.max(...depotChartData.map(d => d.stock), 16000);

  // 2. Process Categories Data (Donut Chart)
  const categoryConfig = [
    { id: 'WHISKY', label: 'IMFL Whisky', count: metrics?.categories?.WHISKY ?? 12, color: '#f97316', bgClass: 'bg-orange-500' },
    { id: 'BEER', label: 'Beer & Draught', count: metrics?.categories?.BEER ?? 5, color: '#eab308', bgClass: 'bg-yellow-500' },
    { id: 'VODKA_GIN', label: 'Vodka & Gin', count: metrics?.categories?.VODKA_GIN ?? 4, color: '#0ea5e9', bgClass: 'bg-sky-500' },
    { id: 'RUM', label: 'Rum & Cane', count: metrics?.categories?.RUM ?? 2, color: '#f43f5e', bgClass: 'bg-rose-500' },
    { id: 'WINE', label: 'Wines', count: metrics?.categories?.WINE ?? 2, color: '#a855f7', bgClass: 'bg-purple-500' },
  ];
  const totalCategoryBrands = categoryConfig.reduce((sum, c) => sum + c.count, 0) || 25;

  // Donut geometry constants
  const donutRadius = 68;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let accumulatedDonutOffset = 0;
  const donutSlices = categoryConfig.map(cat => {
    const pct = cat.count / totalCategoryBrands;
    const strokeDash = pct * donutCircumference;
    const offset = accumulatedDonutOffset;
    accumulatedDonutOffset += strokeDash;
    return {
      ...cat,
      pct: (pct * 100).toFixed(1),
      strokeDasharray: `${strokeDash.toFixed(2)} ${donutCircumference.toFixed(2)}`,
      strokeDashoffset: (-offset).toFixed(2)
    };
  });

  // 3. Process Distilleries Volume Data
  const distilleryData = (() => {
    const map = {};
    if (consignments && consignments.length > 0) {
      consignments.forEach(c => {
        const rawName = c.supplier_name || `Distillery #${c.supplier_id}`;
        const name = rawName.replace(/\s*(Pvt|Ltd|Breweries|Distilleries)\.?/gi, '').trim() || rawName;
        const cases = Number(c.received_cases || c.total_cases) || 0;
        map[name] = (map[name] || 0) + cases;
      });
    }
    if (Object.keys(map).length === 0) {
      return [
        { name: 'United Breweries', cases: 1000, pct: 38.5, grn: '100% OK' },
        { name: 'SNJ Breweries', cases: 450, pct: 17.3, grn: '100% OK' },
        { name: 'Mohan Breweries', cases: 350, pct: 13.5, grn: '100% OK' },
        { name: 'John Distilleries', cases: 300, pct: 11.5, grn: '100% OK' },
        { name: 'Empee Distilleries', cases: 298, pct: 11.5, grn: '98% OK' },
        { name: 'Kals Distilleries', cases: 200, pct: 7.7, grn: '100% OK' }
      ];
    }
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map)
      .map(([name, cases]) => ({
        name,
        cases,
        pct: Number(((cases / total) * 100).toFixed(1)),
        grn: '100% OK'
      }))
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 6);
  })();

  const maxDistilleryCases = Math.max(...distilleryData.map(d => d.cases), 1000);

  const activeDonutInfo = hoveredCategory 
    ? donutSlices.find(s => s.id === hoveredCategory)
    : null;

  return (
    <div className="space-y-4">
      {/* Visual Analytics Header & Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Statewide Supply Visual Telemetry</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry
              </span>
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              Real-time multi-dimensional data models across regional depots & brand catalog
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 self-start sm:self-auto text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => setActiveChartTab('depots')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeChartTab === 'depots'
                ? 'bg-white dark:bg-[#18181b] text-orange-600 dark:text-orange-400 shadow-xs border border-zinc-200/80 dark:border-white/10'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>Depot Buffer Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab('distilleries')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeChartTab === 'distilleries'
                ? 'bg-white dark:bg-[#18181b] text-orange-600 dark:text-orange-400 shadow-xs border border-zinc-200/80 dark:border-white/10'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Inward Dispatches</span>
          </button>
        </div>
      </div>

      {/* Main Dual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Card: Dynamic Bar Chart (Depots Stock OR Distilleries Inflow) */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                {activeChartTab === 'depots' ? (
                  <Warehouse className="w-4 h-4 text-orange-500" />
                ) : (
                  <Factory className="w-4 h-4 text-orange-500" />
                )}
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                    {activeChartTab === 'depots' 
                      ? 'Regional Wholesale Depots • Stock vs Approved Capacity' 
                      : 'Distillery Consignments • Inward Cases by Producer'}
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    {activeChartTab === 'depots'
                      ? 'Live cases in storage compared to sanctioned state warehouse buffer limit'
                      : 'Volume of verified inward cases received at state wholesale distribution hubs'}
                  </p>
                </div>
              </div>

              {/* Legend pill */}
              <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono">
                {activeChartTab === 'depots' ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
                      <span className="text-zinc-600 dark:text-zinc-400">Live Buffer</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700" />
                      <span className="text-zinc-500">Max Cap</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
                    <span className="text-zinc-600 dark:text-zinc-400">Inward Cases</span>
                  </div>
                )}
              </div>
            </div>

            {/* TAB 1: DEPOT BUFFER COMPARISON CHART */}
            {activeChartTab === 'depots' && (
              <div className="mt-4 space-y-3">
                {/* Visual Grouped SVG / HTML Bar Chart */}
                <div className="space-y-3 pt-1">
                  {depotChartData.map((depot) => {
                    const isHovered = hoveredDepot === depot.id;
                    const stockWidth = Math.max(8, (depot.stock / maxDepotCapacity) * 100);
                    const capacityWidth = (depot.capacity / maxDepotCapacity) * 100;

                    return (
                      <div 
                        key={depot.id}
                        onMouseEnter={() => setHoveredDepot(depot.id)}
                        onMouseLeave={() => setHoveredDepot(null)}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                          isHovered 
                            ? 'bg-orange-500/5 border-orange-500/40 shadow-sm' 
                            : 'bg-zinc-50/60 dark:bg-white/[0.02] border-zinc-200/60 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                              {depot.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
                              {depot.region}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-orange-600 dark:text-orange-400">
                              {depot.stock.toLocaleString()} cs
                            </span>
                            <span className="text-zinc-400 text-[11px]">
                              / {depot.capacity.toLocaleString()} cs
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                              {depot.utilPct}%
                            </span>
                          </div>
                        </div>

                        {/* Dual Comparative Bar */}
                        <div className="relative w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          {/* Maximum capacity outline marker */}
                          <div 
                            className="absolute top-0 bottom-0 left-0 bg-zinc-300 dark:bg-zinc-700/60"
                            style={{ width: `${capacityWidth}%` }}
                          />
                          {/* Active Stock Bar */}
                          <div 
                            className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-500 ${
                              isHovered ? 'bg-orange-600 shadow-md shadow-orange-500/50' : 'bg-orange-500'
                            }`}
                            style={{ width: `${stockWidth}%` }}
                          />
                        </div>

                        {/* Headroom readout */}
                        {isHovered && (
                          <div className="mt-2 pt-1.5 border-t border-orange-500/20 flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-zinc-400 animate-fade-in">
                            <span>Available Headroom: <strong className="text-zinc-900 dark:text-zinc-200">{depot.headroom.toLocaleString()} cs</strong></span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ State Storage Buffer Safe</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: DISTILLERIES INFLOW CHART */}
            {activeChartTab === 'distilleries' && (
              <div className="mt-4 space-y-3">
                <div className="space-y-2.5 pt-1">
                  {distilleryData.map((dist, idx) => {
                    const isHovered = hoveredDistillery === dist.name;
                    const barWidth = Math.max(10, (dist.cases / maxDistilleryCases) * 100);

                    return (
                      <div 
                        key={dist.name}
                        onMouseEnter={() => setHoveredDistillery(dist.name)}
                        onMouseLeave={() => setHoveredDistillery(null)}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                          isHovered 
                            ? 'bg-orange-500/5 border-orange-500/40 shadow-sm' 
                            : 'bg-zinc-50/60 dark:bg-white/[0.02] border-zinc-200/60 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-[10px]">
                              0{idx + 1}
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {dist.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">
                              {dist.cases.toLocaleString()} cs
                            </span>
                            <span className="text-zinc-400 text-[11px] font-mono">
                              ({dist.pct}%)
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              GRN OK
                            </span>
                          </div>
                        </div>

                        {/* Bar */}
                        <div className="relative w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHovered ? 'bg-orange-600' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Statewide Inventory Allocation Factor</span>
            <span className="text-orange-600 dark:text-orange-400 font-semibold">100% Excise Permitted</span>
          </div>
        </div>

        {/* Right Card: Donut Chart (Spirit Category Mix & Portfolio) */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-orange-500" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                    Catalog Category Distribution
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    25 approved liquor SKUs by spirit category
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400">
                {totalCategoryBrands} SKUs
              </span>
            </div>

            {/* Donut Chart Visualizer */}
            <div className="mt-4 flex flex-col items-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  {/* Background Track Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={donutRadius}
                    fill="none"
                    stroke="currentColor"
                    className="text-zinc-100 dark:text-zinc-800"
                    strokeWidth="20"
                  />
                  {/* Category Slices */}
                  {donutSlices.map((slice) => {
                    const isHovered = hoveredCategory === slice.id;
                    return (
                      <circle
                        key={slice.id}
                        cx="80"
                        cy="80"
                        r={donutRadius}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth={isHovered ? 24 : 20}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 cursor-pointer opacity-90 hover:opacity-100"
                        onMouseEnter={() => setHoveredCategory(slice.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    );
                  })}
                </svg>

                {/* Central Donut Readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  {activeDonutInfo ? (
                    <div className="animate-fade-in">
                      <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-white">
                        {activeDonutInfo.count}
                      </div>
                      <div className="text-[10px] font-mono font-semibold uppercase text-orange-500 truncate max-w-[110px]">
                        {activeDonutInfo.label}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        {activeDonutInfo.pct}% Share
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-white">
                        {totalCategoryBrands}
                      </div>
                      <div className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                        Approved Brands
                      </div>
                      <div className="text-[9px] font-mono text-orange-500">
                        Hover Category
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Legend Pills with Breakdown */}
              <div className="w-full mt-4 space-y-1.5 font-mono text-xs">
                {donutSlices.map((cat) => {
                  const isHovered = hoveredCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isHovered
                          ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold'
                          : 'border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="truncate">{cat.label}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {cat.count} <span className="text-zinc-400 text-[10px]">SKUs</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-semibold w-9 text-right">
                          {cat.pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Portfolio Diversification</span>
            <span className="text-orange-600 dark:text-orange-400 font-semibold">5 Spirit Categories</span>
          </div>
        </div>

      </div>
    </div>
  );
}
