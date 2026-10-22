import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  RotateCcw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Layers, 
  Store, 
  Building2, 
  Plus, 
  CheckCircle2, 
  FileText,
  Search,
  DollarSign
} from 'lucide-react';
import { 
  fetchFinanceSummary, 
  fetchFinancialLedgers, 
  fetchBottleReturns, 
  createBottleReturn, 
  fetchShops, 
  fetchDepots 
} from '../services/api';

export function FinanceLedger() {
  const [summary, setSummary] = useState(null);
  const [ledgers, setLedgers] = useState([]);
  const [returns, setReturns] = useState([]);
  const [shops, setShops] = useState([]);
  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ledgers');
  const [partyTypeFilter, setPartyTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // New bottle return modal state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [selectedDepotId, setSelectedDepotId] = useState('');
  const [driverName, setDriverName] = useState('K. Selvakumar');
  const [bottlesCount, setBottlesCount] = useState(360);
  const [cratesCount, setCratesCount] = useState(15);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumData, ledData, retData, shpData, depData] = await Promise.all([
        fetchFinanceSummary(),
        fetchFinancialLedgers(),
        fetchBottleReturns(),
        fetchShops(),
        fetchDepots()
      ]);
      setSummary(sumData);
      setLedgers(Array.isArray(ledData) ? ledData : []);
      setReturns(Array.isArray(retData) ? retData : []);
      setShops(Array.isArray(shpData) ? shpData : []);
      setDepots(Array.isArray(depData) ? depData : []);
      if (shpData && shpData.length > 0) setSelectedShopId(shpData[0].id);
      if (depData && depData.length > 0) setSelectedDepotId(depData[0].id);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateReturn = async (e) => {
    e.preventDefault();
    if (!selectedShopId || !selectedDepotId) return;

    try {
      setSubmittingReturn(true);
      await createBottleReturn({
        shop_id: Number(selectedShopId),
        depot_id: Number(selectedDepotId),
        driver_name: driverName,
        bottles_returned: Number(bottlesCount),
        crates_returned: Number(cratesCount),
        bottle_deposit_rate: 10.0,
        crate_deposit_rate: 50.0
      });
      setIsReturnModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to create bottle return:', err);
    } finally {
      setSubmittingReturn(false);
    }
  };

  const filteredLedgers = ledgers.filter((l) => {
    if (partyTypeFilter !== 'ALL' && l.party_type !== partyTypeFilter) return false;
    if (search && !l.party_name.toLowerCase().includes(search.toLowerCase()) && !l.entry_no.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5" />
              TASMAC State Treasury & Accounts
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Financial Ledger & Returnable Bottles (DRS)
          </h1>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReturnModalOpen(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg text-xs transition cursor-pointer flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Log Empty Bottle Return
          </button>
          <button
            onClick={loadData}
            title="Refresh Financials"
            className="p-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] text-zinc-600 dark:text-zinc-400 hover:text-orange-500 transition cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Retail Shop Receivables
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            ₹{summary ? Math.round(summary.total_receivables).toLocaleString() : '4,12,500'}
          </div>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Supplier Payout Liabilities
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            ₹{summary ? Math.round(summary.total_supplier_payouts).toLocaleString() : '4,85,000'}
          </div>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Bottle Deposit Refunds (DRS)
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{summary ? Math.round(summary.total_bottle_refunds).toLocaleString() : '3,600'}
          </div>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Recycled Glass Bottles
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-orange-600 dark:text-orange-400 mt-2">
            {summary ? summary.total_bottles_recycled.toLocaleString() : '240'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-white/10 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('ledgers')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ledgers'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Financial Ledgers & Statements ({ledgers.length})
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'returns'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Empty Bottle Return Manifests ({returns.length})
        </button>
      </div>

      {/* Tab 1: Financial Ledgers */}
      {activeTab === 'ledgers' && (
        <div className="forge-card rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter pills */}
            <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 gap-1">
              {['ALL', 'RETAIL_SHOP', 'SUPPLIER'].map((t) => (
                <button
                  key={t}
                  onClick={() => setPartyTypeFilter(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    partyTypeFilter === t
                      ? 'bg-orange-500 text-white font-semibold shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {t === 'ALL' ? 'All Parties' : t === 'RETAIL_SHOP' ? 'Retail Vends' : 'Suppliers'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search ledger entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-[#090a0d] border border-zinc-200 dark:border-white/10 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-[#08090c] text-zinc-900 dark:text-white font-mono uppercase font-semibold border-b border-zinc-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Entry No</th>
                  <th className="py-3 px-3">Party Name</th>
                  <th className="py-3 px-3">Party Type</th>
                  <th className="py-3 px-3">Transaction</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-right">Balance After</th>
                  <th className="py-3 px-3">Payment Mode</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
                {filteredLedgers.map((l) => {
                  const isCredit = l.transaction_type === 'BOTTLE_REFUND' || l.transaction_type === 'PAYMENT_RECEIVED';
                  return (
                    <tr key={l.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition">
                      <td className="py-3 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                        {l.entry_no}
                      </td>
                      <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-white">
                        {l.party_name}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                          {l.party_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCredit 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10'
                        }`}>
                          {l.transaction_type}
                        </span>
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-bold ${
                        isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'
                      }`}>
                        {isCredit ? '-' : '+'}₹{l.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                        ₹{l.balance_after.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-zinc-500">
                        {l.payment_mode}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-zinc-500">
                        {l.created_at ? new Date(l.created_at).toLocaleDateString() : 'Today'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Bottle Returns Manifests */}
      {activeTab === 'returns' && (
        <div className="forge-card rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Deposit Return Scheme (DRS) Manifests
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              Statutory ₹10/btl & ₹50/crate reverse credit ledger
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-[#08090c] text-zinc-900 dark:text-white font-mono uppercase font-semibold border-b border-zinc-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Return No</th>
                  <th className="py-3 px-3">Shop Name</th>
                  <th className="py-3 px-3">Receiving Depot</th>
                  <th className="py-3 px-3">Driver</th>
                  <th className="py-3 px-3 text-right">Crates (₹50)</th>
                  <th className="py-3 px-3 text-right">Bottles (₹10)</th>
                  <th className="py-3 px-3 text-right">Total Refund</th>
                  <th className="py-3 px-3 text-center">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition">
                    <td className="py-3 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                      {r.return_no}
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-white">
                      {r.shop_name}
                    </td>
                    <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300">
                      {r.depot_name}
                    </td>
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">
                      {r.driver_name || 'K. Selvakumar'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {r.crates_returned}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {r.bottles_returned}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{r.total_refund_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                        {r.refund_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Return Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="forge-card w-full max-w-md rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-2xl p-6 space-y-4 animate-in fade-in-50 zoom-in-95">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-500" />
              Record Empty Bottle & Crate Return
            </h3>
            <p className="text-xs text-zinc-500">
              The refund will be credited directly against the shop's credit ledger.
            </p>

            <form onSubmit={handleCreateReturn} className="space-y-3">
              <div>
                <label className="text-xs font-mono uppercase text-zinc-700 dark:text-zinc-300 block mb-1">
                  Retail Vend
                </label>
                <select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-900 dark:text-white"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shop_code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-700 dark:text-zinc-300 block mb-1">
                  Receiving Wholesale Depot
                </label>
                <select
                  value={selectedDepotId}
                  onChange={(e) => setSelectedDepotId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-900 dark:text-white"
                >
                  {depots.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.depot_code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-700 dark:text-zinc-300 block mb-1">
                    Empty Crates (₹50/cr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cratesCount}
                    onChange={(e) => setCratesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-700 dark:text-zinc-300 block mb-1">
                    Glass Bottles (₹10/btl)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bottlesCount}
                    onChange={(e) => setBottlesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded bg-orange-500/10 border border-orange-500/20 text-xs font-mono text-orange-600 dark:text-orange-400 flex justify-between font-bold">
                <span>Calculated Refund:</span>
                <span>₹{(cratesCount * 50) + (bottlesCount * 10)}</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 rounded text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded transition cursor-pointer"
                >
                  Credit to Shop Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

