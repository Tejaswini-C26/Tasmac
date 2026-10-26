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
  AlertCircle
} from 'lucide-react';
import { fetchDepots, fetchDepotInventory } from '../services/api';
import { DepotStockModal } from '../components/DepotStockModal';
import { AddWarehouseModal } from '../components/AddWarehouseModal';
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
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [whVersion, setWhVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setWhVersion(v => v + 1);
    window.addEventListener('tasmac_warehouses_updated', handleUpdate);
    return () => window.removeEventListener('tasmac_warehouses_updated', handleUpdate);
  }, []);

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
    // If a specific warehouse shed is selected, filter items belonging to this warehouse's categories
    if (activeWarehouse && activeWarehouse.categories && activeWarehouse.categories.length > 0) {
      const matchCat = activeWarehouse.categories.some(cat => 
        (item.category || '').toUpperCase().includes(cat.toUpperCase())
      );
      if (!matchCat) return false;
    }
    if (!effectiveSearch) return true;
    return item.brand_name.toLowerCase().includes(effectiveSearch) ||
           item.category.toLowerCase().includes(effectiveSearch);
  });

  const getWarehouseStats = (wh, inventoryItems = []) => {
    const whCategories = wh.categories || [];
    const whItems = whCategories.length > 0
      ? inventoryItems.filter(item => 
          whCategories.some(cat => (item.category || '').toUpperCase().includes(cat.toUpperCase()))
        )
      : inventoryItems;

    let liveCases = 0;
    let liveBottles = 0;

    whItems.forEach(item => {
      const cases = Number(item.available_cases) || 0;
      const btlCount = item.bottles_per_case || ((item.category === 'BEER' && (item.pack_size || '').includes('500ml')) ? 24 : 12);
      liveCases += cases;
      liveBottles += (item.available_bottles != null ? Number(item.available_bottles) : (cases * btlCount));
    });

    const cap = Number(wh.capacity_cases) || 1;
    const usagePct = Math.round((liveCases / cap) * 100);

    return {
      liveCases,
      liveBottles,
      capacity: cap,
      usagePct,
      brandCount: whItems.length
    };
  };

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-3 font-sans">
      {/* Warehouse Overview Cards (Pinned Top) */}
      <div className="shrink-0 space-y-2">
        <div className="flex items-center justify-end gap-2">
          {selectedWarehouseId && (
            <button
              type="button"
              onClick={() => {
                if (onSelectWarehouse) onSelectWarehouse(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-white/10 hover:bg-orange-600 hover:text-white text-zinc-700 dark:text-zinc-300 text-xs font-mono transition cursor-pointer"
              title="Reset warehouse filter and show all sheds"
            >
              ✕ Show All Sheds
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsAddWarehouseOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-orange-950/30 cursor-pointer group"
            title="Commission a new warehouse shed for this depot"
          >
            <PlusCircle className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
            <span>Add Warehouse</span>
          </button>
        </div>
        {(loadingDepots || loadingInventory) && !depotInventory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] animate-pulse space-y-2">
                <div className="h-3.5 bg-zinc-200 dark:bg-white/10 rounded w-2/3" />
                <div className="h-3 bg-zinc-200 dark:bg-white/10 rounded w-1/2" />
                <div className="h-1.5 bg-zinc-200 dark:bg-white/10 rounded w-full mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 overflow-x-auto pb-1">
            {(activeDepotConfig?.warehouses || []).map((wh, idx) => {
              const displayName = wh.shortName?.replace(/^WH\s*(\d+)[:\s].*$/i, 'Warehouse $1') || wh.shortName || wh.name || `Warehouse ${idx + 1}`;
              const stats = getWarehouseStats(wh, depotInventory?.items || []);
              const isSelected = selectedWarehouseId === wh.id;
return (
                <button
                  key={wh.id}
                  type="button"
                  onClick={() => {
                    if (onSelectWarehouse) {
                      onSelectWarehouse(isSelected ? null : wh.id);
                    }
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-colors duration-150 flex flex-col justify-between outline-none focus:outline-none focus:ring-0 cursor-pointer bg-white dark:bg-[#101010] relative group ${
                    isSelected
                      ? 'border-orange-500 shadow-md shadow-orange-500/10 ring-2 ring-orange-500/20 bg-orange-500/[0.03]'
                      : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
                  }`}
                >
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate" title={displayName}>
                      {displayName}
                    </h3>
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-white/10 space-y-1">
                    <div className="flex justify-between items-baseline text-xs font-normal">
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Live Buffer:</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">
                        {(stats.liveCases || 0).toLocaleString()} cs
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      <span>Bottle Stock:</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        {(stats.liveBottles || 0).toLocaleString()} btls
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-[#000000] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSelected ? 'bg-orange-500' : 'bg-orange-500/80 group-hover:bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(100, stats.usagePct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                      <span>Cap: {stats.capacity.toLocaleString()}</span>
                      <span className="font-semibold text-orange-500">{stats.usagePct}%</span>
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
          {/* Header Bar with Active Depot Info */}
          <div className="shrink-0 pb-2 border-b border-zinc-200 dark:border-white/10">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
              {(depotInventory.name || '').replace(/\s*Supply\s+Depot/gi, '').trim()}
            </h2>
          </div>

          {/* Brands Stock Table (Internally Scrollable with Sticky Header) */}
          <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-zinc-200 dark:border-white/10">
            <table className="w-full text-left text-xs text-zinc-900 dark:text-zinc-300">
              <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-[#090a0d] text-zinc-900 dark:text-white uppercase text-xs font-mono font-semibold tracking-wider border-b border-zinc-200 dark:border-white/10 shadow-xs">
                <tr>
                  <th className="py-2.5 px-4">Brand</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Pack Size</th>
                  <th className="py-2.5 px-3 text-right">Available Cases</th>
                  <th className="py-2.5 px-3 text-right">Bottle Stock</th>
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
                      <td className="py-2.5 px-4 font-semibold text-zinc-900 dark:text-white flex items-center gap-2.5 group-hover:text-orange-500 transition-colors">
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

                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-zinc-500 dark:text-zinc-400">
                        {item.pack_size}
                      </td>

                      {(() => {
                        const displayCases = Number(item.available_cases) || 0;
                        const btlsPerCase = item.bottles_per_case || ((item.category === 'BEER' && (item.pack_size || '').includes('500ml')) ? 24 : 12);
                        const displayBottles = item.available_bottles != null ? Number(item.available_bottles) : (displayCases * btlsPerCase);

                        return (
                          <>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                              {displayCases.toLocaleString()} cs
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono">
                              <div className="font-bold text-orange-600 dark:text-orange-400">
                                {displayBottles.toLocaleString()} btls
                              </div>
                              <div className="text-[10px] text-zinc-400 font-normal">
                                ({btlsPerCase} btls/cs)
                              </div>
                            </td>
                          </>
                        );
                      })()}

                      <td className="py-2.5 px-3 text-right font-mono text-zinc-600 dark:text-zinc-300">
                        ₹{item.wholesale_price?.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-orange-500 font-bold">
                        ₹{item.mrp}
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        {item.available_cases <= 150 ? (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              Low Buffer
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-purple-600 dark:text-purple-400 font-medium">
                              <Factory className="w-2.5 h-2.5" /> Requisitioned to Distillery
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
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

      {/* Add New Warehouse Modal */}
      <AddWarehouseModal
        isOpen={isAddWarehouseOpen}
        onClose={() => setIsAddWarehouseOpen(false)}
        depot={activeDepotConfig}
        onWarehouseAdded={(newWh) => {
          setWhVersion(v => v + 1);
          if (onSelectWarehouse) onSelectWarehouse(newWh.id);
        }}
      />
    </div>
  );
}
