import React, { useState, useEffect } from 'react';

import { 

  AlertTriangle, 

  Package, 

  TrendingUp, 

  Plus, 

  CheckCircle2, 

  Search,

  ShoppingCart

} from 'lucide-react';

import { fetchShopInventory } from '../services/api';

import { ShopSearchSelector } from '../components/ShopSearchSelector';



export function ShopInventory({ selectedShop, onSelectShop, shops = [], onOpenMap, onQuickIndent }) {

  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const [search, setSearch] = useState('');



  const loadInventory = async () => {

    if (!selectedShop) return;

    try {

      setLoading(true);

      const data = await fetchShopInventory(selectedShop.id);

      setInventory(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    loadInventory();

  }, [selectedShop]);



  const filteredItems = inventory.filter((item) => {

    if (onlyLowStock && !item.is_low_stock) return false;

    if (search && !item.brand_name.toLowerCase().includes(search.toLowerCase())) return false;

    return true;

  });



  const totalCasesOnHand = inventory.reduce((acc, i) => acc + i.cases_on_hand, 0);

  const totalBottlesOnShelf = inventory.reduce((acc, i) => acc + i.bottles_on_shelf, 0);

  const lowStockCount = inventory.filter((i) => i.is_low_stock).length;

  const estimatedShelfValue = inventory.reduce((acc, i) => acc + (i.bottles_on_shelf * i.mrp_per_bottle), 0);



  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">

        <div>

          <div className="flex items-center gap-2 mb-1">

            <span className="text-[11px] font-mono uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">

              Retail Vend Stockroom & Shelves

            </span>

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">

            <span className="text-orange-600 dark:text-orange-500 font-bold">Store Stockroom</span> & Shelf Inventory

          </h1>

        </div>



        {/* Search & Select Retail Store */}

        {shops && shops.length > 0 && (

          <ShopSearchSelector 

            selectedShop={selectedShop} 

            onSelectShop={onSelectShop} 

            shops={shops} 

            onOpenMap={onOpenMap}

          />

        )}

      </div>



      {/* KPI Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">

          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">

            Backroom Cases

          </span>

          <div className="text-3xl sm:text-4xl font-mono font-normal text-zinc-900 dark:text-white mt-2">

            {totalCasesOnHand.toLocaleString()}

          </div>

        </div>



        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">

          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">

            Bottles on Shelf

          </span>

          <div className="text-3xl sm:text-4xl font-mono font-normal text-zinc-900 dark:text-white mt-2">

            {totalBottlesOnShelf.toLocaleString()}

          </div>

        </div>



        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">

          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">

            Low Stock SKUs

          </span>

          <div className={`text-3xl sm:text-4xl font-mono font-normal mt-2 ${

            lowStockCount > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-zinc-900 dark:text-white'

          }`}>

            {lowStockCount.toLocaleString()}

          </div>

        </div>



        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">

          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">

            Est. Shelf Stock Value

          </span>

          <div className="text-3xl sm:text-4xl font-mono font-normal text-zinc-900 dark:text-white mt-2">

            ₹{Math.round(estimatedShelfValue).toLocaleString()}

          </div>

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



        <div className="relative w-full sm:w-64">

          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />

          <input

            type="text"

            placeholder="Search shop inventory..."

            value={search}

            onChange={(e) => setSearch(e.target.value)}

            className="w-full pl-8 pr-3 py-1.5 bg-[#08090c] border border-white/10 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"

          />

        </div>

      </div>



      {/* Table */}

      {loading ? (

        <div className="py-20 text-center text-xs text-zinc-400">

          Syncing retail shop shelves...

        </div>

      ) : filteredItems.length === 0 ? (

        <div className="py-16 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-md">

          No inventory items match the current filters.

        </div>

      ) : (

        <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010]">

          <table className="w-full text-left text-xs text-zinc-300">

            <thead className="bg-zinc-100 dark:bg-[#08090c] text-black dark:text-white uppercase text-xs font-mono font-semibold tracking-wider border-b border-zinc-200 dark:border-white/[0.06]">

              <tr>

                <th className="py-3 px-4">Brand</th>

                <th className="py-3 px-3">Category</th>

                <th className="py-3 px-3 text-right">Backroom Cases</th>

                <th className="py-3 px-3 text-right">Shelf Bottles</th>

                <th className="py-3 px-3 text-right">Sales Velocity</th>

                <th className="py-3 px-3 text-right">Reorder Threshold</th>

                <th className="py-3 px-3 text-center">Status</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-white/[0.04]">

              {filteredItems.map((item) => {

                return (

                  <tr key={item.id} className="hover:bg-white/[0.03] transition">

                    <td className="py-3 px-4">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded bg-[#08090c] border border-white/10 p-0.5 flex items-center justify-center flex-shrink-0">

                          <img

                            src={item.image_url}

                            alt={item.brand_name}

                            className="w-full h-full object-contain"

                          />

                        </div>

                        <div>

                          <div className="font-semibold text-white">{item.brand_name}</div>

                          <div className="text-[10px] font-mono text-zinc-500">

                            {item.brand_code} &bull; {item.pack_size}

                          </div>

                        </div>

                      </div>

                    </td>

                    <td className="py-3 px-3">

                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/5 text-zinc-300">

                        {item.category}

                      </span>

                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-white">

                      {item.cases_on_hand} cs

                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium text-zinc-200">

                      {item.bottles_on_shelf} btls

                    </td>

                    <td className="py-3 px-3 text-right font-mono text-zinc-400">

                      ~{item.daily_sales_rate} btls/day

                    </td>

                    <td className="py-3 px-3 text-right font-mono text-zinc-500">

                      {item.reorder_threshold_cases} cs

                    </td>

                    <td className="py-3 px-3 text-center">

                      {item.is_low_stock ? (

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30">

                          <AlertTriangle className="w-3 h-3" /> Low Stock

                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> In Stock
                        </span>
                      )}
                    </td>
                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}



