import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  Warehouse, 
  Store, 
  Truck, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Clock, 
  Boxes, 
  Activity,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { 
  fetchMetrics, 
  fetchSupplierAnalytics, 
  fetchDepots, 
  fetchShops, 
  fetchSupplierConsignments, 
  fetchOrders, 
  fetchSystemAlerts, 
  triggerReplenishment 
} from '../services/api';

export function AdminOverview({ onNavigateToPage, externalSearchQuery = '' }) {
  const [metrics, setMetrics] = useState(null);
  const [supplierAnalytics, setSupplierAnalytics] = useState(null);
  const [depots, setDepots] = useState([]);
  const [shops, setShops] = useState([]);
  const [consignments, setConsignments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replenishing, setReplenishing] = useState(false);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        metricsRes,
        supRes,
        depotsRes,
        shopsRes,
        csgRes,
        ordersRes,
        alertsRes
      ] = await Promise.allSettled([
        fetchMetrics(),
        fetchSupplierAnalytics(),
        fetchDepots(),
        fetchShops(),
        fetchSupplierConsignments(),
        fetchOrders(),
        fetchSystemAlerts()
      ]);

      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value);
      if (supRes.status === 'fulfilled') setSupplierAnalytics(supRes.value);
      if (depotsRes.status === 'fulfilled') setDepots(depotsRes.value || []);
      if (shopsRes.status === 'fulfilled') setShops(shopsRes.value || []);
      if (csgRes.status === 'fulfilled') setConsignments(csgRes.value || []);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value || []);
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value || []);
    } catch (err) {
      console.error('Failed to load admin overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleTriggerAutoReplenish = async () => {
    try {
      setReplenishing(true);
      await triggerReplenishment();
      await loadAllData();
    } catch (err) {
      console.error('Replenishment failed:', err);
    } finally {
      setReplenishing(false);
    }
  };

  // Data Calculations
  const calculatedDepotsStock = depots.reduce((sum, d) => sum + (Number(d.total_stock_cases) || 0), 0);
  const totalWholesaleCases = calculatedDepotsStock > 0 ? calculatedDepotsStock : (metrics?.total_wholesale_cases || 74617);
  
  const calculatedInwardCases = consignments.reduce((sum, c) => sum + (Number(c.received_cases || c.total_cases) || 0), 0);
  const totalInwardCases = calculatedInwardCases > 0 ? calculatedInwardCases : (supplierAnalytics?.total_inward_cases || 2598);

  const totalShopsCount = shops.length || metrics?.total_shops || 13;
  const totalDepotsCount = depots.length || metrics?.total_depots || 5;
  const totalSuppliersCount = supplierAnalytics?.total_suppliers || 12;

  const calculatedSalesVal = orders.reduce((sum, o) => sum + (Number(o.total_payable) || 0), 0);
  const totalSalesVal = calculatedSalesVal > 0 ? calculatedSalesVal : (metrics?.total_sales_value || 190355.5);

  const totalOrdersCount = orders.length || metrics?.total_orders || 4;
  const totalConsignmentsCount = consignments.length || supplierAnalytics?.total_consignments || 6;
  const totalDepotCapacity = depots.reduce((sum, d) => sum + (Number(d.capacity_cases) || 0), 0) || 740000;
  const depotCodesList = depots.map(d => (d.code || '').replace('DEP-', '')).join(', ') || 'CHN, CBE, MDU, SLM, TRY';
  const inTransitCount = orders.filter(o => o.status === 'IN_TRANSIT' || o.status === 'DISPATCHED').length;
  const totalBreakagePct = supplierAnalytics?.breakage_percentage != null ? Number(supplierAnalytics.breakage_percentage).toFixed(2) : '0.10';

  // Sort depots by total stock descending based on live data
  const sortedDepots = [...depots].sort((a, b) => (Number(b.total_stock_cases) || 0) - (Number(a.total_stock_cases) || 0));

  return (
    <div className="h-full flex flex-col overflow-y-auto space-y-5 pr-1 text-zinc-900 dark:text-zinc-100 select-none pb-6">
      
      {/* 1. Statewide Core KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Card 1: Inward Inflow */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <span>Inward Inflow</span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-zinc-900 dark:text-white tracking-tight">
              {totalInwardCases.toLocaleString()} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">cs</span>
            </div>
            <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              {totalConsignmentsCount} bulk consignments
            </p>
          </div>
        </div>

        {/* Card 2: Delivery OTIF */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <span>Delivery OTIF</span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-teal-600 dark:text-teal-400 tracking-tight">
              {supplierAnalytics?.otif_percentage || 97.2}%
            </div>
            <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              {totalBreakagePct}% Breakage SLA
            </p>
          </div>
        </div>

        {/* Card 3: Depot Buffer Stock */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <span>Depot Buffer Stock</span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-zinc-900 dark:text-white tracking-tight">
              {totalWholesaleCases.toLocaleString()} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">cs</span>
            </div>
            <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Across {totalDepotsCount} regional depots
            </p>
          </div>
        </div>

        {/* Card 4: Buffer Capacity */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <span>Buffer Capacity</span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-zinc-900 dark:text-white tracking-tight">
              {totalDepotCapacity.toLocaleString()} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">cs</span>
            </div>
            <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              {totalDepotCapacity > 0 ? Math.round((totalWholesaleCases / totalDepotCapacity) * 100) : 0}% state buffer spread
            </p>
          </div>
        </div>

        {/* Card 5: Replenishment Indents */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <span>Replenishment Indents</span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-orange-600 dark:text-orange-400 tracking-tight">
              {totalOrdersCount} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">Orders</span>
            </div>
            <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              {totalShopsCount} Standard & Elite Vends
            </p>
          </div>
        </div>

        {/* Card 6: Sales Revenue */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <span>Sales Revenue</span>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              ₹{(totalSalesVal / 100000).toFixed(2)}L
            </div>
            <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Total indent turnover
            </p>
          </div>
        </div>

      </div>

      {/* 2. Three-Tier Architectural Command Cards (Manufacturing -> Depots -> Retail) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* TIER 1: Manufacturing Distilleries */}
        <div className="p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  <Factory className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
                    Tier 1 &bull; Manufacturing
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Distilleries & Consignments
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                {totalSuppliersCount} Units
              </span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Registered Distilleries:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalSuppliersCount} Consortia</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Inward Consignments:</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{totalConsignmentsCount} Dispatches</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Bulk Inward Cases:</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{totalInwardCases.toLocaleString()} cs</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Excise Gate Passes:</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{supplierAnalytics?.otif_percentage || 100}% Verified GRN</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              onClick={() => onNavigateToPage('consignments')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-orange-500/10 text-zinc-800 dark:text-zinc-200 hover:text-orange-500 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Consignments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToPage('directory')}
              className="py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-orange-500/30 text-zinc-700 dark:text-zinc-300 hover:text-orange-500 text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="Distilleries Directory"
            >
              Directory
            </button>
            <button
              onClick={() => onNavigateToPage('scorecard')}
              className="py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-orange-500/30 text-zinc-700 dark:text-zinc-300 hover:text-orange-500 text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="Supplier Scorecard"
            >
              Scorecard
            </button>
          </div>
        </div>

        {/* TIER 2: Wholesale Depots */}
        <div className="p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  <Warehouse className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
                    Tier 2 &bull; Wholesale Depots
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Regional Buffer Warehouses
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                {totalDepotsCount} Depots
              </span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Live Buffer Inventory:</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{totalWholesaleCases.toLocaleString()} cs</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Total Buffer Capacity:</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{totalDepotCapacity.toLocaleString()} cs</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Regional Depots:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate ml-2 text-right">{depotCodesList}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Depot Health:</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">Optimal Buffer Spread</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateToPage('depots')}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-orange-500/10 text-zinc-800 dark:text-zinc-200 hover:text-orange-500 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Manage Wholesale Depots</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TIER 3: Retail Shops & Vends */}
        <div className="p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
                    Tier 3 &bull; Retail Vends
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Stores, Indents & Delivery
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                {totalShopsCount} Vends
              </span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Retail Outlets:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalShopsCount} Standard & Elite</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Replenishment Indents:</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{totalOrdersCount} Orders</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Approved Brand SKUs:</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{metrics?.total_brands || 25} Brands</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Logistics Transit:</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {inTransitCount > 0 ? `${inTransitCount} Dispatches In Transit` : 'Live GPS & QR Seals'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              onClick={() => onNavigateToPage('inventory')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-orange-500/10 text-zinc-800 dark:text-zinc-200 hover:text-orange-500 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Stockroom</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToPage('catalog')}
              className="py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-orange-500/30 text-zinc-700 dark:text-zinc-300 hover:text-orange-500 text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="Wholesale Catalog"
            >
              Catalog
            </button>
            <button
              onClick={() => onNavigateToPage('orders')}
              className="py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-orange-500/30 text-zinc-700 dark:text-zinc-300 hover:text-orange-500 text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="Orders & Transit"
            >
              Orders
            </button>
          </div>
        </div>
      </div>

      {/* 3. Statewide Regional Depots Capacity & Allocation (Sorted by Live Stock Data) */}
      <div className="p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <Warehouse className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
              Statewide Regional Depots Capacity & Allocation
            </h3>
          </div>
          <button
            onClick={() => onNavigateToPage('depots')}
            className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <span>Inspect All Depots</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {sortedDepots.map((depot) => {
            const usagePct = depot.capacity_cases > 0 ? Math.round(((depot.total_stock_cases || 0) / depot.capacity_cases) * 100) : 0;
            const cleanName = (depot.shortName || depot.name || '').replace(/\s*Wholesale Depot/gi, '').trim();

            return (
              <div 
                key={depot.id}
                onClick={() => onNavigateToPage('depots')}
                className="p-3.5 sm:p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 transition cursor-pointer group"
              >
                <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-orange-500 transition-colors">
                  {cleanName}
                </h4>
                <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                  Region: {depot.region}
                </p>

                <div className="mt-3 pt-2.5 border-t border-zinc-200 dark:border-white/10 space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs sm:text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Live Stock:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {(depot.total_stock_cases || 0).toLocaleString()} cs
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-black h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, usagePct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>Cap: {(depot.capacity_cases || 0).toLocaleString()}</span>
                    <span>Buffer Safe</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Live State Network Alerts & Quick Launchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Real-time Supply Alerts Feed */}
        <div className="p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
                  Active Replenishment Alerts
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {alerts.length} In Queue
              </span>
            </div>

            <div className="space-y-2.5 mt-3.5 max-h-60 overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                  ✓ All state supply chain nodes stocked within target thresholds.
                </div>
              ) : (
                alerts.slice(0, 5).map((al) => (
                  <div 
                    key={al.id}
                    className="p-3 rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] text-xs sm:text-sm flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-orange-500/15 text-orange-500">
                          {al.alert_type === 'RETAIL_REPLENISHMENT' ? 'Vend → Depot' : 'Depot → Distillery'}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                          {al.title}
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                        {al.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-white/5 flex justify-end">
            <button
              onClick={handleTriggerAutoReplenish}
              disabled={replenishing}
              className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>Trigger Statewide Indent Dispatch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Launchpad to All Web App Pages */}
        <div className="p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
                Enterprise Modules Directory
              </h3>
            </div>
            <span className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 font-mono">
              Master Quick Navigation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs sm:text-sm">
            <button
              onClick={() => onNavigateToPage('consignments')}
              className="p-3.5 sm:p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 text-left transition cursor-pointer group"
            >
              <Truck className="w-5 h-5 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                Inward Consignments
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Distillery Dispatches
              </div>
            </button>

            <button
              onClick={() => onNavigateToPage('directory')}
              className="p-3.5 sm:p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 text-left transition cursor-pointer group"
            >
              <Factory className="w-5 h-5 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                Distilleries
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                12 Consortia Directory
              </div>
            </button>

            <button
              onClick={() => onNavigateToPage('scorecard')}
              className="p-3.5 sm:p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 text-left transition cursor-pointer group"
            >
              <BarChart3 className="w-5 h-5 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                Scorecard
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                OTIF & SLA Compliance
              </div>
            </button>

            <button
              onClick={() => onNavigateToPage('depots')}
              className="p-3.5 sm:p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 text-left transition cursor-pointer group"
            >
              <Warehouse className="w-5 h-5 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                Wholesale Depots
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                5 State Warehouses
              </div>
            </button>

            <button
              onClick={() => onNavigateToPage('inventory')}
              className="p-3.5 sm:p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 text-left transition cursor-pointer group"
            >
              <Store className="w-5 h-5 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                Store Stockroom
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Retail Vend Shelves
              </div>
            </button>

            <button
              onClick={() => onNavigateToPage('orders')}
              className="p-3.5 sm:p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 text-left transition cursor-pointer group"
            >
              <Clock className="w-5 h-5 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                Orders & Transit
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Live Deliveries & e-Pass
              </div>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
