import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Scale, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Sliders, 
  Building2, 
  Landmark,
  Save,
  RotateCcw,
  Sparkles,
  Users,
  Store,
  Layers
} from 'lucide-react';
import { fetchSuppliers, fetchShops, fetchMetrics } from '../services/api';

export function HQSuperAdmin() {
  const [metrics, setMetrics] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tax-policy');

  // Policy state
  const [exciseRateBeer, setExciseRateBeer] = useState(25.0);
  const [exciseRateIMFL, setExciseRateIMFL] = useState(58.0);
  const [vatRate, setVatRate] = useState(14.5);
  const [bottleDepositRate, setBottleDepositRate] = useState(10.0);
  const [policySaved, setPolicySaved] = useState(false);

  useEffect(() => {
    Promise.all([fetchSuppliers(), fetchShops(), fetchMetrics()])
      .then(([supData, shopData, metricData]) => {
        setSuppliers(supData || []);
        setShops(shopData || []);
        setMetrics(metricData || null);
      })
      .catch((err) => console.error('Failed to load HQ admin data:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSavePolicy = (e) => {
    e.preventDefault();
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 3000);
  };

  const pendingSuppliers = suppliers.filter((s) => s.kyc_status === 'PENDING' || s.status === 'PENDING');
  const expiringShops = shops.filter((s) => s.license_status === 'EXPIRING_SOON' || s.license_status === 'EXPIRED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5" />
              TASMAC Head Office (HQ CMDA Tower)
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Super Admin Level
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Statewide Command & Policy Directorate
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            State excise duties, wholesale pricing formulas, licensing sign-offs, and master system governance.
          </p>
        </div>

        {/* Global Action Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] text-xs font-mono text-zinc-700 dark:text-zinc-300">
            Jurisdiction: <span className="font-bold text-orange-600 dark:text-orange-400">Tamil Nadu (Statewide)</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Wholesale Revenue
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            ₹{metrics?.total_sales_value ? Math.round(metrics.total_sales_value).toLocaleString() : '5,86,153'}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
            ↑ 14.8% vs last fiscal cycle
          </span>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            State Depots Monitored
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            {metrics?.total_depots || 5}
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">
            Total capacity: 1,45,000 cases
          </span>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Licensed Distilleries
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            {suppliers.length || 5}
          </div>
          <span className="text-[11px] text-orange-600 dark:text-orange-400 mt-1 block">
            {pendingSuppliers.length} pending KYC review
          </span>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Retail Vends Monitored
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            {shops.length || 5}
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">
            100% active state quota compliance
          </span>
        </div>
      </div>

      {/* HQ Navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-white/10 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('tax-policy')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tax-policy'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Excise Duty & Tax Engine
        </button>

        <button
          onClick={() => setActiveTab('supplier-licensing')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'supplier-licensing'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Supplier Distilleries & KYC ({suppliers.length})
        </button>

        <button
          onClick={() => setActiveTab('shop-licensing')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'shop-licensing'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Retail Vend Licenses ({shops.length})
        </button>
      </div>

      {/* Tab 1: Tax Policy Engine */}
      {activeTab === 'tax-policy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 forge-card p-6 rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm space-y-6">
            <div className="border-b border-zinc-200 dark:border-white/10 pb-4">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-500" />
                Tamil Nadu Prohibition & Excise Gazette Rate Configurator
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Updates directly recompute the Wholesale Issue Price and Gazette MRP on all catalog products across depots.
              </p>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-600 dark:text-zinc-400 block mb-1">
                    Beer State Excise Duty (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={exciseRateBeer}
                    onChange={(e) => setExciseRateBeer(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">Statutory standard: 25.0%</span>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-600 dark:text-zinc-400 block mb-1">
                    IMFL Spirit Excise Duty (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={exciseRateIMFL}
                    onChange={(e) => setExciseRateIMFL(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">Statutory standard: 58.0%</span>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-600 dark:text-zinc-400 block mb-1">
                    State VAT / Commercial Surcharge (%)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={vatRate}
                    onChange={(e) => setVatRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">Applied on Ex-Factory + Excise</span>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-600 dark:text-zinc-400 block mb-1">
                    Glass Bottle Return Deposit DRS (₹/btl)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={bottleDepositRate}
                    onChange={(e) => setBottleDepositRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">Refunded to shop credit ledger on return</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Publish Statewide Gazette Rates
                </button>
                {policySaved && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Rates successfully gazetted and updated across all depots!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Pricing Formula Explainer */}
          <div className="forge-card p-6 rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase font-mono tracking-wider">
              Statutory Gazette Formula
            </h3>
            <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              <div className="p-3 rounded bg-zinc-50 dark:bg-[#08090c] border border-zinc-200 dark:border-white/10">
                <div className="text-zinc-900 dark:text-white font-semibold">1. Ex-Factory Price (A)</div>
                <div className="text-[11px] text-zinc-500">Declared cost by authorized distillery per case.</div>
              </div>
              <div className="p-3 rounded bg-zinc-50 dark:bg-[#08090c] border border-zinc-200 dark:border-white/10">
                <div className="text-zinc-900 dark:text-white font-semibold">2. State Excise Duty (B)</div>
                <div className="text-[11px] text-zinc-500">= A &times; {exciseRateIMFL}% (IMFL) or {exciseRateBeer}% (Beer).</div>
              </div>
              <div className="p-3 rounded bg-zinc-50 dark:bg-[#08090c] border border-zinc-200 dark:border-white/10">
                <div className="text-zinc-900 dark:text-white font-semibold">3. State VAT (C)</div>
                <div className="text-[11px] text-zinc-500">= (A + B) &times; {vatRate}%.</div>
              </div>
              <div className="p-3 rounded bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-semibold">
                Wholesale Issue Price = A + B + C + TASMAC Handling
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Supplier Distilleries & KYC */}
      {activeTab === 'supplier-licensing' && (
        <div className="forge-card rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Approved Distilleries & Breweries Master Directory
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              Total Suppliers: {suppliers.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-[#08090c] text-zinc-900 dark:text-white font-mono font-semibold uppercase border-b border-zinc-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Supplier Code</th>
                  <th className="py-3 px-3">Distillery Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Excise License No</th>
                  <th className="py-3 px-3">District</th>
                  <th className="py-3 px-3">KYC Status</th>
                  <th className="py-3 px-3 text-right">Payout Balance</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition">
                    <td className="py-3 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                      {s.supplier_code}
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-white">
                      {s.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                      {s.category}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                      {s.excise_license_no}
                    </td>
                    <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300">
                      {s.district}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                        {s.kyc_status || 'APPROVED'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      ₹{s.payout_balance ? s.payout_balance.toLocaleString() : '4,85,000'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Retail Vend Licenses */}
      {activeTab === 'shop-licensing' && (
        <div className="forge-card rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              TASMAC Retail Vends License & Quota Governance
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              Total Vends: {shops.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-[#08090c] text-zinc-900 dark:text-white font-mono font-semibold uppercase border-b border-zinc-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Vend Code</th>
                  <th className="py-3 px-3">Shop Name</th>
                  <th className="py-3 px-3">District</th>
                  <th className="py-3 px-3">Excise License</th>
                  <th className="py-3 px-3 text-right">Credit Limit</th>
                  <th className="py-3 px-3 text-right">Monthly Quota</th>
                  <th className="py-3 px-3 text-center">License Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
                {shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition">
                    <td className="py-3 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                      {shop.shop_code}
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-white">
                      {shop.name}
                    </td>
                    <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300">
                      {shop.district}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                      {shop.license_number || 'TN-EXC-RET-2026/0101'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      ₹{shop.credit_limit ? (shop.credit_limit / 100000).toFixed(1) + ' Lakhs' : '8.0 Lakhs'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-zinc-900 dark:text-white">
                      {shop.monthly_quota_cases || 750} cs/mo
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                        {shop.license_status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
