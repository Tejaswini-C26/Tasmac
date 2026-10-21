import React, { useState, useEffect } from 'react';

import { 

  Building2, 

  MapPin, 

  Phone, 

  User, 

  Package, 

  Search, 

  Layers, 

  CheckCircle2,

  TrendingDown

} from 'lucide-react';

import { fetchDepots, fetchDepotInventory } from '../services/api';



export function DepotStock() {

  const [depots, setDepots] = useState([]);

  const [selectedDepotId, setSelectedDepotId] = useState(null);

  const [depotInventory, setDepotInventory] = useState(null);

  const [loadingDepots, setLoadingDepots] = useState(true);

  const [loadingInventory, setLoadingInventory] = useState(false);

  const [search, setSearch] = useState('');



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



  const filteredItems = (depotInventory?.items || []).filter((item) => {

    if (!search) return true;

    return item.brand_name.toLowerCase().includes(search.toLowerCase()) ||

           item.category.toLowerCase().includes(search.toLowerCase());

  });



  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">

        <div>

          <div className="flex items-center gap-2 mb-1">

            <span className="text-[11px] font-mono uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">

              Statewide Depot Logistics

            </span>

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">

            Wholesale Depots & Statewide Inventory

          </h1>

        </div>

      </div>



      {/* 5 Depots Overview Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

        {depots.map((depot) => {

          const isSelected = selectedDepotId === depot.id;

          const usagePct = Math.round((depot.total_stock_cases / depot.capacity_cases) * 100);



          return (

            <button

              key={depot.id}

              onClick={() => setSelectedDepotId(depot.id)}

              className={`p-3.5 rounded-md border-2 text-left transition-colors duration-150 flex flex-col justify-between h-full outline-none focus:outline-none focus:ring-0 cursor-pointer bg-white dark:bg-[#101010] ${

                isSelected

                  ? 'border-orange-500 shadow-md shadow-orange-500/10'

                  : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'

              }`}

            >

              <div>

                <h3 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{depot.name}</h3>

                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">

                  <User className="w-3 h-3 text-zinc-400 dark:text-zinc-500" /> {depot.manager_name}

                </p>

              </div>



              <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-white/10 space-y-1.5">

                <div className="flex justify-between items-baseline text-[11px]">

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

                <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">

                  <span>Cap: {depot.capacity_cases.toLocaleString()}</span>

                  <span>{usagePct}% full</span>

                </div>

              </div>

            </button>

          );

        })}

      </div>



      {/* Selected Depot Detail & Brand Breakdown */}

      {depotInventory && (

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 space-y-4">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-white/10">

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">

                <Building2 className="w-5 h-5" />

              </div>

              <div>

                <h2 className="text-base font-bold text-white flex items-center gap-2">

                  {depotInventory.name} Wholesale Inventory

                </h2>

                <p className="text-xs text-zinc-400 mt-0.5">

                  Region: <span className="text-zinc-200">{depotInventory.region}</span> &bull; 

                  Total Cases: <span className="text-orange-400 font-mono font-semibold">{depotInventory.total_cases?.toLocaleString()}</span>

                </p>

              </div>

            </div>



            {/* Filter Search inside depot */}

            <div className="relative w-full sm:w-64">

              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />

              <input

                type="text"

                placeholder="Search brands in depot..."

                value={search}

                onChange={(e) => setSearch(e.target.value)}

                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"

              />

            </div>

          </div>



          {/* Brands Stock Table */}

          {loadingInventory ? (

            <div className="py-16 text-center text-xs text-zinc-400">

              Loading warehouse stock records...

            </div>

          ) : (

            <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-white/10">

              <table className="w-full text-left text-xs text-zinc-300">

                <thead className="bg-zinc-100 dark:bg-[#000000] text-black dark:text-white uppercase text-xs font-mono font-semibold tracking-wider border-b border-zinc-200 dark:border-white/10">

                  <tr>

                    <th className="py-3 px-4">Brand</th>

                    <th className="py-3 px-3">Category</th>

                    <th className="py-3 px-3">Pack Size</th>

                    <th className="py-3 px-3 text-right">Available Cases</th>

                    <th className="py-3 px-3 text-right">Wholesale Case Rate</th>

                    <th className="py-3 px-3 text-right">Gazette MRP</th>

                    <th className="py-3 px-4 text-center">Status</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">

                  {filteredItems.map((item) => {

                    const isGoodStock = item.available_cases > 40;

                    return (

                      <tr key={item.brand_id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition">

                        <td className="py-2.5 px-4 font-semibold text-white flex items-center gap-2.5">

                          <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 p-0.5 flex items-center justify-center flex-shrink-0">

                            <img

                              src={item.image_url}

                              alt={item.brand_name}

                              className="w-full h-full object-contain"

                            />

                          </div>

                          <span>{item.brand_name}</span>

                        </td>

                        <td className="py-2.5 px-3">

                          <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">

                            {item.category}

                          </span>

                        </td>

                        <td className="py-2.5 px-3 font-mono text-zinc-400">

                          {item.pack_size}

                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white">

                          {item.available_cases} cs

                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-zinc-300">

                          ₹{item.wholesale_price?.toLocaleString()}

                        </td>

                        <td className="py-2.5 px-3 text-right font-mono text-orange-400 font-medium">

                          ₹{item.mrp}

                        </td>

                        <td className="py-2.5 px-4 text-center">

                          <span

                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${

                              isGoodStock

                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'

                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'

                            }`}

                          >

                            <span

                              className={`w-1.5 h-1.5 rounded-full ${

                                isGoodStock ? 'bg-emerald-400' : 'bg-amber-400'

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

    </div>

  );

}



