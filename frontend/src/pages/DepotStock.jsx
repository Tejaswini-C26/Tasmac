import React, { useState, useEffect } from 'react';

import { 

  Building2, 

  MapPin, 

  Phone, 

  User, 

  Package, 

  Layers, 

  CheckCircle2,

  TrendingDown

} from 'lucide-react';

import { fetchDepots, fetchDepotInventory } from '../services/api';
import { DepotStockModal } from '../components/DepotStockModal';

export function DepotStock({ externalSearchQuery = '' }) {
  const [depots, setDepots] = useState([]);
  const [selectedDepotId, setSelectedDepotId] = useState(null);
  const [depotInventory, setDepotInventory] = useState(null);
  const [loadingDepots, setLoadingDepots] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [search, setSearch] = useState('');
  const [inspectingBrand, setInspectingBrand] = useState(null);



  useEffect(() => {

    fetchDepots()

      .then((data) => {

        setDepots(data);

        if (data.length > 0) setSelectedDepotId(data[0].id);

        setLoadingDepots(false);

      })

      .catch((err) => {

        console.error(err);

        setLoadingDepots(false);

      });

  }, []);



  useEffect(() => {

    if (!selectedDepotId) return;

    setLoadingInventory(true);

    fetchDepotInventory(selectedDepotId)

      .then((data) => {

        setDepotInventory(data);

        setLoadingInventory(false);

      })

      .catch((err) => {

        console.error(err);

        setLoadingInventory(false);

      });

  }, [selectedDepotId]);



  const effectiveSearch = (externalSearchQuery || search).trim().toLowerCase();
  const filteredItems = (depotInventory?.items || []).filter((item) => {
    if (!effectiveSearch) return true;
    return item.brand_name.toLowerCase().includes(effectiveSearch) ||
           item.category.toLowerCase().includes(effectiveSearch);
  });



  return (
    <div className="h-full flex flex-col overflow-hidden space-y-3">
      {/* 5 Depots Overview Cards (Pinned Top) */}
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {depots.map((depot) => {
          const isSelected = selectedDepotId === depot.id;
          const usagePct = Math.round((depot.total_stock_cases / depot.capacity_cases) * 100);

          return (
            <button
              key={depot.id}
              onClick={() => setSelectedDepotId(depot.id)}
              className={`p-3 rounded-md border-2 text-left transition-colors duration-150 flex flex-col justify-between outline-none focus:outline-none focus:ring-0 cursor-pointer bg-white dark:bg-[#101010] ${
                isSelected
                  ? 'border-orange-500 shadow-md shadow-orange-500/10'
                  : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
              }`}
            >
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{depot.name}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1 font-normal">
                  <User className="w-3 h-3 text-zinc-400 dark:text-zinc-500" /> {depot.manager_name}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-white/10 space-y-1">
                <div className="flex justify-between items-baseline text-xs font-normal">
                  <span className="text-zinc-500 dark:text-zinc-400">Live Stock:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {depot.total_stock_cases?.toLocaleString()} cs
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-[#000000] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${Math.min(100, usagePct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                  <span>Cap: {depot.capacity_cases.toLocaleString()}</span>
                  <span>{usagePct}% full</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Depot Detail & Brand Breakdown (Internally Scrollable) */}
      {depotInventory && (
        <div className="flex-1 min-h-0 forge-card rounded-md p-4 border border-zinc-200 dark:border-white/10 flex flex-col overflow-hidden space-y-3 bg-white dark:bg-[#101010] shadow-sm">
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2.5 border-b border-zinc-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  {depotInventory.name} Wholesale Inventory
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Region: <span className="text-zinc-200">{depotInventory.region}</span> &bull; 
                  Total Cases: <span className="text-orange-400 font-mono font-semibold">{depotInventory.total_cases?.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <span className="text-xs text-zinc-500 font-mono hidden sm:inline-block">
              Click any brand row to view statewide depot breakdown &rarr;
            </span>
          </div>

          {/* Brands Stock Table (Internally Scrollable with Sticky Header) */}
          {loadingInventory ? (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-400 font-mono">
              Loading warehouse stock records...
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-auto rounded-md border border-zinc-200 dark:border-white/10">
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
                    const isGoodStock = item.available_cases > 40;

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
                          {item.available_cases} cs
                        </td>

                        <td className="py-2 px-3 text-right font-mono text-zinc-600 dark:text-zinc-300">
                          ₹{item.wholesale_price?.toLocaleString()}
                        </td>

                        <td className="py-2 px-3 text-right font-mono text-orange-500 font-medium">
                          ₹{item.mrp}
                        </td>

                        <td className="py-2 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                              isGoodStock
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isGoodStock ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            {isGoodStock ? 'High Stock' : 'Replenish Soon'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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



