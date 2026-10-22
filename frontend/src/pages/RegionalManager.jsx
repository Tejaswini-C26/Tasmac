import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Store, 
  MapPin, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  Warehouse,
  Filter,
  RefreshCw,
  Sliders,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { fetchDepots, fetchShops, fetchMetrics } from '../services/api';

const ZONES = [
  { id: 'chennai', name: 'Chennai & Northern Zone', districts: ['Chennai', 'Tiruvallur', 'Kanchipuram', 'Chengalpattu', 'Ranipet'] },
  { id: 'coimbatore', name: 'Coimbatore & Western Zone', districts: ['Coimbatore', 'Salem', 'Erode', 'Tiruppur'] },
  { id: 'madurai', name: 'Madurai & Southern Zone', districts: ['Madurai', 'Tirunelveli', 'Trichy', 'Thanjavur'] },
];

export function RegionalManager() {
  const [selectedZone, setSelectedZone] = useState('chennai');
  const [depots, setDepots] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([fetchDepots(), fetchShops()])
      .then(([depotsData, shopsData]) => {
        setDepots(depotsData || []);
        setShops(shopsData || []);
      })
      .catch((err) => console.error('Failed to load regional data:', err))
      .finally(() => setLoading(false));
  }, []);

  const currentZoneConfig = ZONES.find((z) => z.id === selectedZone) || ZONES[0];

  const zoneShops = shops.filter((s) => {
    if (!currentZoneConfig.districts.includes(s.district)) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.shop_code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const zoneDepots = depots.filter((d) => currentZoneConfig.districts.includes(d.district));

  const totalZoneCases = zoneDepots.reduce((acc, d) => acc + (d.current_cases || 0), 0);
  const totalZoneCapacity = zoneDepots.reduce((acc, d) => acc + (d.total_capacity_cases || 1), 0);
  const zoneFillPct = totalZoneCapacity > 0 ? Math.round((totalZoneCases / totalZoneCapacity) * 100) : 0;

  const lowStockShopsCount = zoneShops.filter((s) => (s.cases_ordered_this_month || 0) < 150).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              TASMAC Zonal Logistics Command
            </span>
            <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded border border-zinc-200 dark:border-white/10">
              Regional Manager Console
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Territory Depots & Retail Quota Oversight
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Monitor zonal buffer allocations, inter-depot rebalancing, and approve shop quota requests.
          </p>
        </div>

        {/* Zone Selector Chips */}
        <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 gap-1 overflow-x-auto">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedZone === zone.id
                  ? 'bg-orange-500 text-white font-semibold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {zone.name.split('&')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Regional Depots
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            {zoneDepots.length}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {currentZoneConfig.districts.slice(0, 3).join(', ')}
          </span>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Buffer Stock on Hand
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            {totalZoneCases.toLocaleString()} cs
          </div>
          <div className="w-full bg-zinc-200 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-orange-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(zoneFillPct, 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
            {zoneFillPct}% aggregate buffer fill
          </span>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Monitored Vends
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            {zoneShops.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
            Active retail license status
          </span>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Monthly Quota Utilization
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            68.4%
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Pacing normal for cycle day 22
          </span>
        </div>
      </div>

      {/* Territory Depots Section */}
      <div className="forge-card rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm p-5 space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-orange-500" />
          Zonal Wholesale Feeding Depots
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zoneDepots.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-zinc-500">
              No depots assigned directly to this zone.
            </div>
          ) : (
            zoneDepots.map((depot) => {
              const pct = Math.round((depot.current_cases / depot.total_capacity_cases) * 100);
              return (
                <div 
                  key={depot.id}
                  className="p-4 rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-[11px] font-bold text-orange-600 dark:text-orange-400">
                        {depot.depot_code}
                      </div>
                      <div className="font-semibold text-zinc-900 dark:text-white text-sm">
                        {depot.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {depot.district} &bull; {depot.address}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                      OPERATIONAL
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-zinc-500">Buffer Fill</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{pct}% ({depot.current_cases.toLocaleString()} cs)</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-white/10 text-[11px] font-mono text-zinc-500">
                    <span>Mgr: {depot.manager_name}</span>
                    <span>{depot.phone}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Retail Shops Quota Management */}
      <div className="forge-card rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Retail Vends Quota & Indent Allowances ({zoneShops.length})
            </h2>
            <p className="text-xs text-zinc-500">
              Shops nearing or exceeding monthly allocations require Regional Manager authorization.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search by vend or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#090a0d] text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-orange-500 w-full sm:w-60"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 dark:bg-[#08090c] text-zinc-900 dark:text-white font-mono uppercase font-semibold border-b border-zinc-200 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">Vend Code</th>
                <th className="py-3 px-3">Shop Name</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3 text-right">Credit Ceiling</th>
                <th className="py-3 px-3 text-right">Quota Used</th>
                <th className="py-3 px-3 text-right">Monthly Cap</th>
                <th className="py-3 px-3 text-center">Quota Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
              {zoneShops.map((shop) => {
                const quota = shop.monthly_quota_cases || 750;
                const ordered = shop.cases_ordered_this_month || 280;
                const pct = Math.round((ordered / quota) * 100);
                const isOverQuota = pct >= 90;

                return (
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
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      ₹{shop.credit_limit ? (shop.credit_limit / 100000).toFixed(1) + 'L' : '8.0L'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-800 dark:text-zinc-200 font-semibold">
                      {ordered} cs
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-500">
                      {quota} cs
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {isOverQuota ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold">
                          QUOTA ALERT ({pct}%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                          NORMAL ({pct}%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => alert(`Quota extension of 100 cases authorized for ${shop.name}`)}
                        className="px-2.5 py-1 text-[11px] font-medium rounded bg-orange-500/10 hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:text-white border border-orange-500/20 transition cursor-pointer"
                      >
                        Extend +100cs
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
