import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  ShoppingCart,
  RotateCcw,
  Store,
  ArrowRight
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
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Backroom Cases
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            {totalCasesOnHand.toLocaleString()}
          </div>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Bottles on Shelf
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            {totalBottlesOnShelf.toLocaleString()}
          </div>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Low Stock SKUs
          </span>
          <div className={`text-3xl sm:text-4xl font-mono font-bold mt-2 ${
            lowStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'
          }`}>
            {lowStockCount.toLocaleString()}
          </div>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Est. Shelf Stock Value
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            ₹{Math.round(estimatedShelfValue).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Store Selector & Actions */}
      <div className="flex justify-end items-center gap-2 pb-1">
        {/* Search & Select Retail Store */}
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

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 gap-1 overflow-x-auto">
          <button
            onClick={() => setOnlyLowStock(false)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              !onlyLowStock
                ? 'bg-orange-500 text-white shadow-sm font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All Shelf SKUs ({inventory.length})
          </button>
          <button
            onClick={() => setOnlyLowStock(true)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              onlyLowStock
                ? 'bg-orange-500 text-white shadow-sm font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Reorder Alerts ({lowStockCount})</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-md">
          <RotateCcw className="w-6 h-6 mx-auto mb-2 animate-spin text-orange-500" />
          Syncing retail shop shelves & inventory telemetry...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-xs text-rose-500 bg-white dark:bg-[#101010] border border-rose-500/20 rounded-md">
          <p className="mb-3">{error}</p>
          <button
            onClick={() => loadInventory(selectedShop)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg text-xs transition"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-md">
          <Package className="w-8 h-8 mx-auto mb-2 text-zinc-400 dark:text-zinc-600" />
          <p>No inventory items found matching the current filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 dark:bg-[#08090c] text-zinc-900 dark:text-white uppercase text-xs font-mono font-semibold tracking-wider border-b border-zinc-200 dark:border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Backroom Cases</th>
                <th className="py-3 px-3 text-right">Shelf Bottles</th>
                <th className="py-3 px-3 text-right">Sales Velocity</th>
                <th className="py-3 px-3 text-right">Reorder Threshold</th>
                <th className="py-3 px-3 text-center">Status</th>
                {onQuickIndent && (
                  <th className="py-3 px-3 text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-zinc-100 dark:bg-[#08090c] border border-zinc-200 dark:border-white/10 p-0.5 flex items-center justify-center flex-shrink-0">
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
                        <div className="font-semibold text-zinc-900 dark:text-white">{item.brand_name}</div>
                        <div className="text-[10px] font-mono text-zinc-500">
                          {item.brand_code} &bull; {item.pack_size}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 font-mono">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                    {item.cases_on_hand} cs
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-zinc-800 dark:text-zinc-200">
                    {item.bottles_on_shelf} btls
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                    ~{item.daily_sales_rate} btls/day
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-zinc-500">
                    {item.reorder_threshold_cases} cs
                  </td>
                  <td className="py-3 px-3 text-center">
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
                    <td className="py-3 px-3 text-right">
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
    </div>
  );
}
