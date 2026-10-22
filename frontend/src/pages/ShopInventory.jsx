import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  ShoppingCart,
  RotateCcw,
  Store,
  ArrowRight,
  X
} from 'lucide-react';
import { fetchShopInventory, fetchShops } from '../services/api';
import { ShopSearchSelector } from '../components/ShopSearchSelector';

export function ShopInventory({ selectedShop, onSelectShop, shops = [], onOpenMap, onQuickIndent, externalSearchQuery = '' }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [search, setSearch] = useState('');
  const [availableShops, setAvailableShops] = useState(shops || []);
  const [selectedSkuForDrawer, setSelectedSkuForDrawer] = useState(null);

  // Sync available shops and self-heal if empty
  useEffect(() => {
    if (shops && shops.length > 0) {
      setAvailableShops(shops);
      if (!selectedShop && onSelectShop) {
        onSelectShop(shops[0]);
      }
    } else {
      fetchShops()
        .then((data) => {
          if (data && data.length > 0) {
            setAvailableShops(data);
            if (!selectedShop && onSelectShop) {
              onSelectShop(data[0]);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to fetch shops fallback:', err);
        });
    }
  }, [shops, selectedShop, onSelectShop]);

  const loadInventory = async (shopToLoad = selectedShop) => {
    const targetShop = shopToLoad || (availableShops.length > 0 ? availableShops[0] : null);
    if (!targetShop) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchShopInventory(targetShop.id);
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Unable to load inventory data for this shop. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedShop?.id) {
      loadInventory(selectedShop);
    } else if (availableShops.length > 0) {
      const first = availableShops[0];
      if (onSelectShop) onSelectShop(first);
      loadInventory(first);
    } else {
      setLoading(false);
    }
  }, [selectedShop?.id]);

  const effectiveSearch = (externalSearchQuery || search).trim().toLowerCase();
  const filteredItems = inventory.filter((item) => {
    if (onlyLowStock && !item.is_low_stock) return false;
    if (effectiveSearch && !item.brand_name.toLowerCase().includes(effectiveSearch) && !item.brand_code?.toLowerCase().includes(effectiveSearch)) {
      return false;
    }
    return true;
  });

  const totalCasesOnHand = inventory.reduce((acc, i) => acc + (i.cases_on_hand || 0), 0);
  const totalBottlesOnShelf = inventory.reduce((acc, i) => acc + (i.bottles_on_shelf || 0), 0);
  const lowStockCount = inventory.filter((i) => i.is_low_stock).length;
  const estimatedShelfValue = inventory.reduce((acc, i) => acc + ((i.bottles_on_shelf || 0) * (i.mrp_per_bottle || 0)), 0);

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-3">
      {/* KPI Cards (Pinned Top) */}
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="forge-card rounded-md p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
          <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Backroom Cases
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-white mt-1">
            {totalCasesOnHand.toLocaleString()}
          </div>
        </div>

        <div className="forge-card rounded-md p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
          <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Bottles on Shelf
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-white mt-1">
            {totalBottlesOnShelf.toLocaleString()}
          </div>
        </div>

        <div className="forge-card rounded-md p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
          <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Low Stock SKUs
          </span>
          <div className={`text-2xl sm:text-3xl font-mono font-bold mt-1 ${
            lowStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'
          }`}>
            {lowStockCount.toLocaleString()}
          </div>
        </div>

        <div className="forge-card rounded-md p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
          <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Est. Shelf Stock Value
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-white mt-1">
            ₹{Math.round(estimatedShelfValue).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Store Selector & Control Bar (Pinned) */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 pb-0.5">
        <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 gap-1 overflow-x-auto">
          <button
            onClick={() => setOnlyLowStock(false)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              !onlyLowStock
                ? 'bg-orange-500 text-white shadow-sm font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All Shelf SKUs ({inventory.length})
          </button>
          <button
            onClick={() => setOnlyLowStock(true)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              onlyLowStock
                ? 'bg-orange-500 text-white shadow-sm font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Alerts ({lowStockCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {availableShops && availableShops.length > 0 && (
            <ShopSearchSelector 
              selectedShop={selectedShop || availableShops[0]} 
              onSelectShop={onSelectShop} 
              shops={availableShops} 
              onOpenMap={onOpenMap}
            />
          )}

          <button
            onClick={() => loadInventory(selectedShop)}
            disabled={loading}
            title="Refresh Inventory"
            className="p-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 transition disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table (Internally Scrollable with Sticky Header) */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-md">
          <RotateCcw className="w-5 h-5 mr-2 animate-spin text-orange-500" />
          Syncing retail shop shelves &amp; inventory telemetry...
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-xs text-rose-500 bg-white dark:bg-[#101010] border border-rose-500/20 rounded-md">
          <p className="mb-3">{error}</p>
          <button
            onClick={() => loadInventory(selectedShop)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-md">
          <Package className="w-8 h-8 mx-auto mb-2 text-zinc-400 dark:text-zinc-600" />
          <p>No inventory items found matching the current filters.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-[#08090c] text-zinc-900 dark:text-white uppercase text-xs font-mono font-semibold tracking-wider border-b border-zinc-200 dark:border-white/[0.06] shadow-xs">
              <tr>
                <th className="py-2.5 px-4">Brand</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Backroom Cases</th>
                <th className="py-2.5 px-3 text-right">Shelf Bottles</th>
                <th className="py-2.5 px-3 text-right">Sales Velocity</th>
                <th className="py-2.5 px-3 text-right">Reorder Threshold</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                {onQuickIndent && (
                  <th className="py-2.5 px-3 text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
              {filteredItems.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => setSelectedSkuForDrawer(item)}
                  className="hover:bg-orange-500/5 dark:hover:bg-white/[0.03] transition cursor-pointer group"
                >
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-[#08090c] border border-zinc-200 dark:border-white/10 p-0.5 flex items-center justify-center flex-shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.brand_name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors">{item.brand_name}</div>
                        <div className="text-[10px] font-mono text-zinc-500">
                          {item.brand_code} &bull; {item.pack_size}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 font-mono">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                    {item.cases_on_hand} cs
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-medium text-zinc-800 dark:text-zinc-200">
                    {item.bottles_on_shelf} btls
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                    ~{item.daily_sales_rate} btls/day
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-zinc-500">
                    {item.reorder_threshold_cases} cs
                  </td>
                  <td className="py-2 px-3 text-center">
                    {item.is_low_stock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> In Stock
                      </span>
                    )}
                  </td>
                  {onQuickIndent && (
                    <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onQuickIndent(item)}
                        className="px-2.5 py-1 text-[11px] font-medium rounded bg-orange-500/10 hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:text-white border border-orange-500/20 transition cursor-pointer"
                      >
                        Indent
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-Over SKU Inspection Drawer */}
      {selectedSkuForDrawer && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in cursor-pointer"
          onClick={() => setSelectedSkuForDrawer(null)}
        >
          <div 
            className="relative w-full max-w-md bg-white dark:bg-[#111217] border-l border-zinc-200 dark:border-white/10 h-full flex flex-col shadow-2xl animate-slide-left cursor-default text-zinc-900 dark:text-zinc-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Drawer Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0c10] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-[#08090c] border border-zinc-200 dark:border-white/10 p-0.5 flex items-center justify-center shrink-0">
                  {selectedSkuForDrawer.image_url ? (
                    <img src={selectedSkuForDrawer.image_url} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <Package className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-orange-500 uppercase tracking-wider font-bold block">
                    Retail Shelf Dossier
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                    {selectedSkuForDrawer.brand_name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedSkuForDrawer(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#08090c] border border-zinc-200 dark:border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Category:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{selectedSkuForDrawer.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">SKU Code:</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{selectedSkuForDrawer.brand_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Pack Size:</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{selectedSkuForDrawer.pack_size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Gazette MRP:</span>
                  <span className="text-orange-500 font-bold">₹{selectedSkuForDrawer.mrp_per_bottle || '-'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#08090c] border border-zinc-200 dark:border-white/10 space-y-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                  Store Inventory Status
                </span>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Backroom Reserve:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{selectedSkuForDrawer.cases_on_hand} cases</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Display Shelf:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{selectedSkuForDrawer.bottles_on_shelf} bottles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Daily Sales Rate:</span>
                  <span className="text-emerald-500 font-bold">~{selectedSkuForDrawer.daily_sales_rate} btls/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Reorder Threshold:</span>
                  <span className="text-amber-500 font-bold">{selectedSkuForDrawer.reorder_threshold_cases} cases</span>
                </div>
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="shrink-0 p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0c10] flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedSkuForDrawer(null)}
                className="px-4 py-2 text-xs rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
              >
                Close
              </button>
              {onQuickIndent && (
                <button
                  onClick={() => {
                    const item = selectedSkuForDrawer;
                    setSelectedSkuForDrawer(null);
                    onQuickIndent(item);
                  }}
                  className="px-4 py-2 text-xs rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add to Indent
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
