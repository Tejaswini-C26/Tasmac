import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  User, 
  Package, 
  Layers, 
  CheckCircle2,
  TrendingDown,
  RotateCw,
  Factory,
  PlusCircle,
  Warehouse,
  Boxes,
  Beer,
  Wine,
  AlertCircle,
  Sparkles,
  Flame
} from 'lucide-react';
import { fetchDepots, fetchDepotInventory } from '../services/api';
import { DepotStockModal } from '../components/DepotStockModal';
import { getEffectiveDepotConfigs } from '../services/depotConfigs';

export function DepotStock({ 
  externalSearchQuery = '',
  selectedDepotId: propSelectedDepotId = null,
  selectedWarehouseId = null,
  onSelectDepot = null,
  onSelectWarehouse = null,
  onNavigateToAddDepot = null
}) {
  const [depots, setDepots] = useState([]);
  const [internalSelectedDepotId, setInternalSelectedDepotId] = useState(1);
  const [depotInventory, setDepotInventory] = useState(null);
  const [loadingDepots, setLoadingDepots] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [inspectingBrand, setInspectingBrand] = useState(null);

  const selectedDepotId = propSelectedDepotId ?? internalSelectedDepotId;

  const handleSelectDepot = (id) => {
    setInternalSelectedDepotId(id);
    if (onSelectDepot) {
      onSelectDepot(id);
    }
  };

  const loadDepotsData = async () => {
    setLoadingDepots(true);
    setError(null);
    try {
      const data = await fetchDepots();
      setDepots(data || []);
      const activeId = selectedDepotId || (data && data.length > 0 ? data[0].id : 1);
      if (activeId) {
        await loadInventoryData(activeId);
      }
    } catch (err) {
      console.error('Failed to load depots:', err);
      setError('Unable to load wholesale depot data. Please check connection and retry.');
    } finally {
      setLoadingDepots(false);
    }
  };

  const loadInventoryData = async (depotId) => {
    if (!depotId) return;
    setLoadingInventory(true);
    setError(null);
    try {
      const inv = await fetchDepotInventory(depotId);
      setDepotInventory(inv);
    } catch (err) {
      console.error(`Failed to load inventory for depot ${depotId}:`, err);
      setError(`Unable to load inventory records for Depot #${depotId}.`);
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    loadDepotsData();
  }, []);

  useEffect(() => {
    if (selectedDepotId) {
      loadInventoryData(selectedDepotId);
    }
  }, [selectedDepotId]);

  const effectiveConfigs = getEffectiveDepotConfigs(depots);
  const activeDepotConfig = effectiveConfigs.find(d => Number(d.id) === Number(selectedDepotId)) || effectiveConfigs[0];
  const activeWarehouse = activeDepotConfig?.warehouses?.find(w => w.id === selectedWarehouseId);

  const effectiveSearch = (externalSearchQuery || search).trim().toLowerCase();
  const filteredItems = (depotInventory?.items || []).filter((item) => {
    // Warehouse category filter
    if (activeWarehouse && activeWarehouse.categories && activeWarehouse.categories.length > 0) {
      const itemCat = (item.category || '').toUpperCase();
      const match = activeWarehouse.categories.some(cat => {
        if (cat === 'BEER') return itemCat === 'BEER';
        if (cat === 'WINE') return itemCat === 'WINE';
        if (cat === 'WHISKY') return itemCat === 'WHISKY';
        if (cat === 'RUM') return itemCat === 'RUM';
        if (cat === 'VODKA') return itemCat === 'VODKA';
        if (cat === 'BRANDY') return itemCat === 'BRANDY';
        if (cat === 'GIN') return itemCat === 'GIN';
        return true;
      });
      if (!match) return false;
    }

    if (!effectiveSearch) return true;
    return item.brand_name.toLowerCase().includes(effectiveSearch) ||
           item.category.toLowerCase().includes(effectiveSearch);
  });

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-3 font-sans">
      {/* Depots Overview Cards (Pinned Top) */}
      <div className="shrink-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Statewide Wholesale Depots ({depots.length})
            </span>
          </div>
          {onNavigateToAddDepot && (
            <button
              onClick={onNavigateToAddDepot}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-orange-950/30 cursor-pointer group"
              title="Commission a new wholesale depot"
            >
              <PlusCircle className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
              <span>Add Wholesale Depot</span>
            </button>
          )}
        </div>

        {/* Depots Top Bar - Responsive Grid or Skeleton */}
        {loadingDepots && depots.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] animate-pulse space-y-2">
                <div className="h-3.5 bg-zinc-200 dark:bg-white/10 rounded w-2/3" />
                <div className="h-3 bg-zinc-200 dark:bg-white/10 rounded w-1/2" />
                <div className="h-1.5 bg-zinc-200 dark:bg-white/10 rounded w-full mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 overflow-x-auto pb-1">
            {depots.map((depot) => {
              const isSelected = Number(selectedDepotId) === Number(depot.id);
              const usagePct = depot.capacity_cases > 0 
                ? Math.round((depot.total_stock_cases / depot.capacity_cases) * 100) 
                : 0;

              return (
                <button
                  key={depot.id}
                  onClick={() => handleSelectDepot(depot.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-colors duration-150 flex flex-col justify-between outline-none focus:outline-none focus:ring-0 cursor-pointer bg-white dark:bg-[#101010] ${
                    isSelected
                      ? 'border-orange-500 shadow-md shadow-orange-500/10'
                      : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">
                        {depot.code}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {depot.region}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate" title={depot.name}>
                      {depot.name}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1 truncate font-normal">
                      <User className="w-3 h-3 text-zinc-400 shrink-0" /> 
                      <span className="truncate">{depot.manager_name}</span>
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-white/10 space-y-1">
                    <div className="flex justify-between items-baseline text-xs font-normal">
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Live Buffer:</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">
                        {depot.total_stock_cases?.toLocaleString()} cs
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-[#000000] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${Math.min(100, usagePct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                      <span>Cap: {depot.capacity_cases?.toLocaleString()}</span>
                      <span className="font-semibold text-orange-500">{usagePct}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Depot Detail & Brand Breakdown */}
      {loadingInventory && !depotInventory ? (
        <div className="flex-1 min-h-0 forge-card rounded-xl p-8 border border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-[#101010] shadow-sm">
          <RotateCw className="w-6 h-6 animate-spin text-orange-500" />
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Loading wholesale warehouse inventory records...</p>
        </div>
      ) : error ? (
        <div className="flex-1 min-h-0 forge-card rounded-xl p-8 border border-rose-500/20 flex flex-col items-center justify-center space-y-3 bg-rose-500/5 text-center">
          <AlertCircle className="w-6 h-6 text-rose-500" />
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
          <button
            onClick={loadDepotsData}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono uppercase font-bold tracking-wider transition cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : depotInventory ? (
        <div className="flex-1 min-h-0 forge-card rounded-xl p-4 border border-zinc-200 dark:border-white/10 flex flex-col overflow-hidden space-y-3 bg-white dark:bg-[#101010] shadow-sm">
          {/* Header Bar with 3 Warehouse Shed Sub-tabs */}
          <div className="shrink-0 space-y-3 pb-2.5 border-b border-zinc-200 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>{depotInventory.name}</span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      {activeDepotConfig?.code || 'DEPOT'}
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Region: <span className="text-zinc-700 dark:text-zinc-200 font-medium">{depotInventory.region}</span> &bull; 
                    Live Stock: <span className="text-orange-500 font-mono font-bold">{depotInventory.total_cases?.toLocaleString()} cs</span> &bull;
                    Max Cap: <span className="font-mono text-zinc-600 dark:text-zinc-300">{depotInventory.capacity_cases?.toLocaleString()} cs</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono hidden sm:inline-block">
                  Click any brand row to view statewide distribution &rarr;
                </span>
                <button
                  onClick={loadDepotsData}
                  disabled={loadingDepots || loadingInventory}
                  title="Refresh Depot Stock"
                  className="p-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 transition disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <RotateCw className={`w-4 h-4 ${(loadingDepots || loadingInventory) ? 'animate-spin text-orange-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* 3 Specialized Warehouse Sheds Selector Filter */}
            {activeDepotConfig?.warehouses && activeDepotConfig.warehouses.length > 0 && (
              <div className="flex items-center gap-2 pt-1 overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-mono font-bold uppercase text-zinc-400 shrink-0">
                  Warehouse Sheds:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectWarehouse) onSelectWarehouse(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer shrink-0 ${
                    !selectedWarehouseId
                      ? 'bg-orange-600 text-white font-bold shadow-xs'
                      : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/10'
                  }`}
                >
                  All Sheds ({depotInventory.total_cases?.toLocaleString()} cs)
                </button>

                {activeDepotConfig.warehouses.map((wh) => {
                  const isWhActive = selectedWarehouseId === wh.id;
                  const WhIcon = wh.categories.includes('BEER') ? Beer : wh.categories.includes('WINE') ? Wine : wh.categories.includes('VODKA') ? Sparkles : wh.categories.includes('RUM') ? Flame : Boxes;

                  return (
                    <button
                      key={wh.id}
                      type="button"
                      onClick={() => {
                        if (onSelectWarehouse) onSelectWarehouse(wh.id);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isWhActive
                          ? 'bg-orange-600 text-white font-bold shadow-xs'
                          : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/10'
                      }`}
                    >
                      <WhIcon className="w-3.5 h-3.5" />
                      <span>{wh.shortName}</span>
                      <span className="text-[10px] opacity-75">({wh.capacity_cases?.toLocaleString()} cs cap)</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Brands Stock Table (Internally Scrollable with Sticky Header) */}
          <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-zinc-200 dark:border-white/10">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-[#090a0d] text-zinc-900 dark:text-white uppercase text-xs font-mono font-semibold tracking-wider border-b border-zinc-200 dark:border-white/10 shadow-xs">
                <tr>
                  <th className="py-2.5 px-4">Brand</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Pack Size</th>
                  <th className="py-2.5 px-3 text-right">Available Cases</th>
                  <th className="py-2.5 px-3 text-right">Wholesale Case Rate</th>
                  <th className="py-2.5 px-3 text-right">Gazette MRP</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
                {filteredItems.map((item) => {
                  return (
                    <tr 
                      key={item.brand_id} 
                      onClick={() => setInspectingBrand({
                        id: item.brand_id,
                        name: item.brand_name,
                        image_url: item.image_url,
                        brand_code: item.brand_code || `TAS-${item.brand_id}`,
                        pack_size: item.pack_size
                      })}
                      className="hover:bg-orange-500/5 dark:hover:bg-white/[0.03] transition cursor-pointer group"
                    >
                      <td className="py-2 px-4 font-semibold text-zinc-900 dark:text-white flex items-center gap-2.5 group-hover:text-orange-500 transition-colors">
                        <div className="w-7 h-7 rounded bg-zinc-100 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 p-0.5 flex items-center justify-center flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.brand_name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/100x100/181b24/94a3b8?text=' + encodeURIComponent(item.brand_name.slice(0, 3));
                            }}
                          />
                        </div>
                        <span>{item.brand_name}</span>
                      </td>

                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-2 px-3 font-mono text-zinc-500 dark:text-zinc-400">
                        {item.pack_size}
                      </td>

                      <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                        {item.available_cases?.toLocaleString()} cs
                      </td>

                      <td className="py-2 px-3 text-right font-mono text-zinc-600 dark:text-zinc-300">
                        ₹{item.wholesale_price?.toLocaleString()}
                      </td>

                      <td className="py-2 px-3 text-right font-mono text-orange-500 font-medium">
                        ₹{item.mrp}
                      </td>

                      <td className="py-2 px-4 text-center">
                        {item.available_cases <= 150 ? (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              Low Buffer
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-purple-600 dark:text-purple-400 font-medium">
                              <Factory className="w-2.5 h-2.5" /> Requisitioned to Distillery
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Optimal Buffer
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono space-y-2">
                      <p>No brands found matching criteria in this depot shed.</p>
                      {selectedWarehouseId && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectWarehouse) onSelectWarehouse(null);
                          }}
                          className="px-3 py-1 rounded bg-orange-500/10 text-orange-500 border border-orange-500/30 text-xs font-mono hover:bg-orange-500 hover:text-white transition cursor-pointer mt-1"
                        >
                          View All Sheds ({depotInventory?.items?.length || 0} brands)
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Slide-over Brand Statewide Depot Breakdown Drawer */}
      {inspectingBrand && (
        <DepotStockModal
          brand={inspectingBrand}
          onClose={() => setInspectingBrand(null)}
        />
      )}
    </div>
  );
}
