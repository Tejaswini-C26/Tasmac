import React, { useState, useEffect } from 'react';
import {
  Factory, 
  Warehouse, 
  Store, 
  Truck, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  ArrowRight, 
  Layers, 
  Clock, 
  FileCheck, 
  Boxes, 
  Activity,
  ChevronRight,
  Sparkles,
  BarChart3,
  Landmark,
  ExternalLink
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

  const totalWholesaleCases = metrics?.total_wholesale_cases || 78374;
  const totalInwardCases = supplierAnalytics?.total_inward_cases || 5300;
  const totalShopsCount = shops.length || metrics?.total_shops || 13;
  const totalDepotsCount = depots.length || metrics?.total_depots || 5;
  const totalSuppliersCount = supplierAnalytics?.total_suppliers || 12;
  const totalSalesVal = metrics?.total_sales_value || 586153.0;

  return (
    <div className="h-full flex flex-col overflow-y-auto space-y-4 pr-1 text-zinc-900 dark:text-zinc-100 select-none pb-6">
      
      {/* 2. Statewide Core KPI Tiles (6-card responsive matrix) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Total Depots Stock */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div className="text-zinc-500 text-xs font-medium">
            <span>Depot Buffer Stock</span>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-mono font-bold text-zinc-900 dark:text-white">
              {totalWholesaleCases.toLocaleString()} <span className="text-xs font-normal text-zinc-500">cs</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Across 5 regional depots</p>
          </div>
        </div>

        {/* KPI 2: Commercial Sales Turnover */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div className="text-zinc-500 text-xs font-medium">
            <span>Sales Revenue</span>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
              ₹{(totalSalesVal / 100000).toFixed(2)}L
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Total indent turnover</p>
          </div>
        </div>

        {/* KPI 3: Operational Nodes */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div className="text-zinc-500 text-xs font-medium">
            <span>Network Nodes</span>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-mono font-bold text-zinc-900 dark:text-white">
              {totalSuppliersCount + totalDepotsCount + totalShopsCount}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">12 Dist. + 5 Depots + {totalShopsCount} Vends</p>
          </div>
        </div>

        {/* KPI 4: Inward Consignments */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div className="text-zinc-500 text-xs font-medium">
            <span>Inward Inflow</span>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-mono font-bold text-zinc-900 dark:text-white">
              {totalInwardCases.toLocaleString()} <span className="text-xs font-normal text-zinc-500">cs</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">{consignments.length || 13} bulk consignments</p>
          </div>
        </div>

        {/* KPI 5: OTIF SLA Rating */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div className="text-zinc-500 text-xs font-medium">
            <span>Delivery OTIF</span>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-mono font-bold text-teal-600 dark:text-teal-400">
              {supplierAnalytics?.otif_percentage || 97.2}%
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">0.01% Breakage SLA</p>
          </div>
        </div>

        {/* KPI 6: Active System Alerts */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between">
          <div className="text-zinc-500 text-xs font-medium">
            <span>Active Alerts</span>
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-mono font-bold ${alerts.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {alerts.length}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Low-stock requisitions</p>
          </div>
        </div>
      </div>

      {/* 3. Three-Tier Architectural Command Cards (Manufacturing, Depots, Retail) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* TIER 1: Manufacturing Distilleries */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  <Factory className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Tier 1 &bull; Manufacturing</h3>
                  <p className="text-[11px] text-zinc-400">Distilleries & Consignments</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400">
                12 Units
              </span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500">Registered Distilleries:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">12 Consortia</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500">Inward Consignments:</span>
                <span className="font-mono font-semibold text-orange-500">{consignments.length || 13} Dispatches</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500">Bulk Inward Cases:</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{totalInwardCases.toLocaleString()} cs</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Excise Gate Passes:</span>
                <span className="font-mono font-semibold text-emerald-500">100% Verified GRN</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => onNavigateToPage('consignments')}
              className="flex-1 py-2 px-3 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-orange-500/10 text-zinc-800 dark:text-zinc-200 hover:text-orange-500 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Consignments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateToPage('directory')}
              className="py-2 px-3 rounded-lg border border-zinc-200 dark:border-white/10 hover:border-orange-500/30 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 text-xs font-semibold transition cursor-pointer"
              title="Distilleries Directory"
            >
              Directory
            </button>
            <button
              onClick={() => onNavigateToPage('scorecard')}
              className="py-2 px-3 rounded-lg border border-zinc-200 dark:border-white/10 hover:border-orange-500/30 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 text-xs font-semibold transition cursor-pointer"
              title="Supplier Scorecard"
            >
              Scorecard
            </button>
          </div>
        </div>

        {/* TIER 2: Wholesale Depots */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Tier 2 &bull; Wholesale Depots</h3>
                  <p className="text-[11px] text-zinc-400">Regional Buffer Warehouses</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400">
                5 Depots
              </span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500">Live Buffer Inventory:</span>
                <span className="font-mono font-semibold text-orange-500">{totalWholesaleCases.toLocaleString()} cs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500">Total Buffer Capacity:</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">760,000 cs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500">Regional Depots:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">CHN, CBE, MDU, SLM, TRY</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Depot Health:</span>
                <span className="font-mono font-semibold text-emerald-500">Optimal Buffer Spread</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateToPage('depots')}
              className="w-full py-2 px-3 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-orange-500/10 text-zinc-800 dark:text-zinc-200 hover:text-orange-500 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Manage Wholesale Depots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* TIER 3: Retail Shops & Vends */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Tier 3 &bull; Retail Vends</h3>
                  <p className="text-[11px] text-zinc-400">Stores, Indents & Delivery</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400">
                {totalShopsCount} Vends
              </span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500">Retail Outlets:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{totalShopsCount} Standard & Elite</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500">Replenishment Indents:</span>
                <span className="font-mono font-semibold text-orange-500">{orders.length || 7} Orders</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-white/5">
                <span className="text-zinc-500">Approved Brand SKUs:</span>
                <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{metrics?.total_brands || 25} Brands</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Logistics e-Passes:</span>
                <span className="font-mono font-semibold text-emerald-500">Live GPS & QR Seals</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => onNavigateToPage('inventory')}
              className="flex-1 py-2 px-3 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-orange-500/10 text-zinc-800 dark:text-zinc-200 hover:text-orange-500 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Stockroom</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateToPage('catalog')}
              className="py-2 px-3 rounded-lg border border-zinc-200 dark:border-white/10 hover:border-orange-500/30 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 text-xs font-semibold transition cursor-pointer"
              title="Wholesale Catalog"
            >
              Catalog
            </button>
            <button
              onClick={() => onNavigateToPage('orders')}
              className="py-2 px-3 rounded-lg border border-zinc-200 dark:border-white/10 hover:border-orange-500/30 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 text-xs font-semibold transition cursor-pointer"
              title="Orders & Transit"
            >
              Orders
            </button>
          </div>
        </div>
      </div>

      {/* 4. Regional Wholesale Depots Capacity Breakdown */}
      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Statewide Regional Depots Capacity & Allocation
            </h3>
          </div>
          <button
            onClick={() => onNavigateToPage('depots')}
            className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Inspect All Depots</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {depots.map((depot) => {
            const usagePct = depot.capacity_cases > 0 ? Math.round((depot.total_stock_cases / depot.capacity_cases) * 100) : 0;
            return (
              <div 
                key={depot.id}
                onClick={() => onNavigateToPage('depots')}
                className="p-3 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded bg-orange-500/10">
                    {depot.code}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">{usagePct}%</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-2 truncate group-hover:text-orange-500 transition-colors">
                  {(depot.shortName || depot.name).replace(/\s*Supply\s+Depot/gi, '').trim()}
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Region: {depot.region}</p>

                <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-white/10 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500">Live Stock:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{depot.total_stock_cases?.toLocaleString()} cs</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-black h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, usagePct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Cap: {depot.capacity_cases?.toLocaleString()}</span>
                    <span>Buffer Safe</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Live State Network Alerts & Critical Pipeline Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Real-time Supply Alerts Feed */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Active Replenishment Alerts</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {alerts.length} In Queue
              </span>
            </div>

            <div className="space-y-2 mt-3 max-h-56 overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                  ✓ All state supply chain nodes stocked within target thresholds.
                </div>
              ) : (
                alerts.slice(0, 5).map((al) => (
                  <div 
                    key={al.id}
                    className="p-2.5 rounded-lg border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-orange-500/15 text-orange-500">
                          {al.alert_type === 'RETAIL_REPLENISHMENT' ? 'Vend → Depot' : 'Depot → Distillery'}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{al.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{al.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-white/5 flex justify-end">
            <button
              onClick={handleTriggerAutoReplenish}
              disabled={replenishing}
              className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer disabled:opacity-50"
            >
              Trigger Statewide Indent Dispatch &rarr;
            </button>
          </div>
        </div>

        {/* Quick Launchpad to All Web App Pages */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Enterprise Modules Directory</h3>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">Master Quick Navigation</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <button
              onClick={() => onNavigateToPage('consignments')}
              className="p-3 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 text-left transition cursor-pointer group"
            >
              <Truck className="w-4 h-4 text-orange-500 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-zinc-900 dark:text-white">Inward Consignments</div>
              <div className="text-[10px] text-zinc-400">Distillery Dispatches</div>
            </button>

            <button
              onClick={() => onNavigateToPage('directory')}
              className="p-3 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 text-left transition cursor-pointer group"
            >
              <Factory className="w-4 h-4 text-orange-500 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-zinc-900 dark:text-white">Distilleries</div>
              <div className="text-[10px] text-zinc-400">12 Consortia Directory</div>
            </button>

            <button
              onClick={() => onNavigateToPage('scorecard')}
              className="p-3 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 text-left transition cursor-pointer group"
            >
              <BarChart3 className="w-4 h-4 text-orange-500 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-zinc-900 dark:text-white">Scorecard</div>
              <div className="text-[10px] text-zinc-400">OTIF & SLA Compliance</div>
            </button>

            <button
              onClick={() => onNavigateToPage('depots')}
              className="p-3 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 text-left transition cursor-pointer group"
            >
              <Warehouse className="w-4 h-4 text-orange-500 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-zinc-900 dark:text-white">Wholesale Depots</div>
              <div className="text-[10px] text-zinc-400">5 State Warehouses</div>
            </button>

            <button
              onClick={() => onNavigateToPage('inventory')}
              className="p-3 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 text-left transition cursor-pointer group"
            >
              <Store className="w-4 h-4 text-orange-500 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-zinc-900 dark:text-white">Store Stockroom</div>
              <div className="text-[10px] text-zinc-400">Retail Vend Shelves</div>
            </button>

            <button
              onClick={() => onNavigateToPage('orders')}
              className="p-3 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] hover:border-orange-500/40 text-left transition cursor-pointer group"
            >
              <Clock className="w-4 h-4 text-orange-500 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-zinc-900 dark:text-white">Orders & Transit</div>
              <div className="text-[10px] text-zinc-400">Live Deliveries & e-Pass</div>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
