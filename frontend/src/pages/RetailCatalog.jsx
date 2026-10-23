import React, { useState, useEffect } from 'react';

import { 

  Filter, 

  Grid, 

  List as ListIcon, 

  Package, 

  Warehouse, 

  Plus, 

  Check, 

  TrendingUp,

  Tag,

  Percent,

  Sparkles,

  Info,

  PlusCircle,
  RotateCw

} from 'lucide-react';

import { fetchBrands } from '../services/api';

import { DepotStockModal } from '../components/DepotStockModal';



export function RetailCatalog({ onAddToCart, cart, onNavigateToAddBottle, externalSearchQuery = '' }) {

  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const [inspectingBrand, setInspectingBrand] = useState(null);

  const [selectedSizes, setSelectedSizes] = useState({});
  const [showAIPredictions, setShowAIPredictions] = useState(false);



  const categories = [

    { key: 'ALL', label: 'All Brands' },

    { key: 'BEER', label: 'Beer & Cider' },

    { key: 'WHISKY', label: 'Whisky' },

    { key: 'BRANDY', label: 'Brandy' },

    { key: 'RUM', label: 'Rum' },

    { key: 'VODKA', label: 'Vodka' },

    { key: 'GIN', label: 'Gin' },

    { key: 'WINE', label: 'Wine' },

  ];



  const getBrandPackRates = (brand) => {

    if (brand.pack_rates && brand.pack_rates.length > 0) {

      return brand.pack_rates;

    }

    const isBeer = brand.category === 'BEER';

    const baseMrp = brand.current_price?.mrp_per_bottle || 500;

    if (isBeer) {

      return [

        { size: '650ml', label: '650ml', mrp: Math.round(baseMrp), wholesale_issue_price: Math.round(baseMrp * 12 * 0.755), bottles_per_case: 12 },

        { size: '500ml', label: '500ml', mrp: Math.round(baseMrp * 0.82 / 10) * 10, wholesale_issue_price: Math.round(baseMrp * 0.82 * 24 * 0.755), bottles_per_case: 24 },

        { size: '330ml', label: '330ml', mrp: Math.round(baseMrp * 0.58 / 5) * 5, wholesale_issue_price: Math.round(baseMrp * 0.58 * 24 * 0.755), bottles_per_case: 24 },

      ];

    }

    return [

      { size: '1000ml', label: '1000ml', mrp: Math.round(baseMrp * 1.32 / 10) * 10, wholesale_issue_price: Math.round(baseMrp * 1.32 * 12 * 0.75), bottles_per_case: 12 },

      { size: '750ml', label: '750ml', mrp: Math.round(baseMrp), wholesale_issue_price: Math.round(baseMrp * 12 * 0.765), bottles_per_case: 12 },

      { size: '375ml', label: '375ml', mrp: Math.round(baseMrp * 0.515 / 10) * 10, wholesale_issue_price: Math.round(baseMrp * 0.515 * 24 * 0.765), bottles_per_case: 24 },

      { size: '180ml', label: '180ml', mrp: Math.round(baseMrp * 0.265 / 5) * 5, wholesale_issue_price: Math.round(baseMrp * 0.265 * 48 * 0.765), bottles_per_case: 48 },

    ];

  };



  const loadBrands = async () => {

    try {

      setLoading(true);

      const effectiveSearch = (externalSearchQuery || search).trim() || undefined;

      const data = await fetchBrands({

        category: selectedCategory,

        search: effectiveSearch,

      });

      setBrands(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    const timer = setTimeout(() => {

      loadBrands();

    }, 250);

    return () => clearTimeout(timer);

  }, [selectedCategory, search, externalSearchQuery]);



  const handleSearchSubmit = (e) => {

    e.preventDefault();

    loadBrands();

  };



  const getCartQuantity = (brandId, size = null) => {

    if (!size) {

      const found = cart.find((i) => i.id === brandId);

      return found ? found.quantity : 0;

    }

    const cartKey = `${brandId}-${size}`;

    const found = cart.find((i) => (i.cartKey || `${i.id}-${i.pack_size}`) === cartKey);

    return found ? found.quantity : 0;

  };



  return (
    <div className="h-full flex flex-col overflow-hidden space-y-3">
      {/* Pinned Top Controls */}
      <div className="shrink-0 space-y-2.5">
        {/* Top Bar: Category Pills on Left, Action Buttons on Right */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Filter Pills (Now at the top) */}
          <div className="inline-flex items-center p-1 rounded-xl bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 gap-1 overflow-x-auto scrollbar-none max-w-full shadow-sm">
            {categories.map((c) => {
              const active = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-orange-500 text-white shadow-sm font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Header Actions: AI Reorder, Add Bottle & View Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* AI Smart Reorder Button */}
            <button
              onClick={() => setShowAIPredictions(!showAIPredictions)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                showAIPredictions
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-100 dark:bg-[#101010] border border-zinc-200 dark:border-white/10 text-orange-600 dark:text-orange-400 hover:border-orange-500'
              }`}
              title="Toggle AI Demand Forecasting & Smart Auto-Reorder"
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>AI Reorder</span>
            </button>

            {/* Add Bottle Button */}
            <button
              onClick={onNavigateToAddBottle}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-orange-950/30 cursor-pointer group"
              title="Add a new bottle to the wholesale catalog"
            >
              <PlusCircle className="w-4 h-4 stroke-[2] group-hover:rotate-90 transition-transform duration-200" />
              <span>Add Bottle</span>
            </button>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#101010] border border-zinc-200 dark:border-white/10 p-0.5 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-orange-600 text-white shadow-sm font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Card Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-orange-600 text-white shadow-sm font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>Dense Table</span>
              </button>
            </div>

            {/* Refresh Catalog */}
            <button
              onClick={loadBrands}
              disabled={loading}
              title="Refresh Catalog"
              className="p-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 transition disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* AI Demand Forecasting Banner */}
        {showAIPredictions && (
          <div className="p-3.5 rounded-xl border border-orange-500/30 bg-orange-500/5 space-y-2.5 animate-in fade-in-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-xs uppercase font-mono text-zinc-900 dark:text-white">
                  AI Demand Forecasting &amp; Predictive Restock Suggestions
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold">
                  Statewide Run-Rate
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Upcoming weekend festival quota spike (+26% avg)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {brands.slice(0, 3).map((b, idx) => {
                const surgePct = [34, 28, 19][idx];
                const suggestedCases = [20, 15, 12][idx];
                const packRate = getBrandPackRates(b)[0];
                return (
                  <div key={`ai-${b.id}`} className="p-2.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] flex items-center justify-between gap-2 shadow-sm">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">{b.name}</div>
                      <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        +{surgePct}% Forecasted Run-Rate
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        Suggested: {suggestedCases} cases
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (onAddToCart) onAddToCart(b, packRate, suggestedCases);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+{suggestedCases}cs</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>



      {/* Product Display Area */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-mono">Loading catalog from wholesale database...</p>
        </div>
      ) : brands.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-2 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-md p-6">
          <Package className="w-10 h-10 mx-auto text-zinc-600" />
          <h3 className="text-sm font-semibold text-zinc-300">No brands found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search query or switching to another category.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Card Grid View (Scrollable inside container) */
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 pb-4">

          {brands.map((brand) => {

            const packRates = getBrandPackRates(brand);

            const defaultSize = brand.category === 'BEER' ? '650ml' : '750ml';

            const activeSize = selectedSizes[brand.id] || defaultSize;

            const activeRate = packRates.find((r) => r.size === activeSize) || packRates[0];

            const inCartQty = getCartQuantity(brand.id, activeRate?.size);



            return (

              <div

                key={brand.id}

                className="forge-card rounded-md border border-zinc-200 dark:border-white/10 flex flex-col overflow-hidden group hover:border-zinc-300 dark:hover:border-white/20 transition-all"

              >

                {/* 1. Real Product Image (Uncropped Full View - Click to view depot stocks) */}

                <div 

                  onClick={() => setInspectingBrand(brand)}

                  className="h-64 w-full relative flex items-center justify-center overflow-hidden bg-white dark:bg-[#0a0a0a] border-b border-zinc-200 dark:border-white/10 p-2 cursor-pointer group/img"

                  title="Click to view Statewide Depot Stock & Details"

                >

                  <img

                    src={brand.image_url}

                    alt={brand.name}

                    className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300"

                    loading="lazy"

                    onError={(e) => {

                      e.target.src = 'https://placehold.co/300x400/181b24/94a3b8?text=' + encodeURIComponent(brand.name);

                    }}

                  />

                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-zinc-300 font-mono opacity-0 group-hover/img:opacity-100 transition-opacity">

                    View Stock

                  </div>

                </div>



                {/* Card Content */}

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">

                  <div className="space-y-2.5">

                    {/* Government Brand Approval Code */}

                    <div className="flex items-center text-[11px]">

                      <div className="flex items-center gap-1.5 font-mono">

                        <span className="text-zinc-500 text-[10px] uppercase">Govt Code:</span>

                        <span className="text-orange-600 dark:text-orange-400 font-semibold">{brand.brand_code}</span>

                      </div>

                    </div>



                    {/* Brand Name */}

                    <h3 

                      onClick={() => setInspectingBrand(brand)}

                      className="text-sm font-bold text-zinc-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-1 cursor-pointer"

                      title="Click to view Statewide Depot Stock & Details"

                    >

                      {brand.name}

                    </h3>



                    {/* 4. Pack Sizes with Individual Rates */}

                    <div className="pt-2 border-t border-zinc-200 dark:border-white/10">

                      <div className="grid grid-cols-2 gap-1.5">

                        {packRates.map((rate) => {

                          const isSelected = activeRate.size === rate.size;

                          return (

                            <button

                              key={rate.size}

                              type="button"

                              onClick={() => setSelectedSizes((prev) => ({ ...prev, [brand.id]: rate.size }))}

                              className={`px-2 py-1.5 rounded-lg border text-left flex items-center justify-between transition-all ${

                                isSelected

                                  ? 'bg-transparent border-orange-500 text-orange-500 dark:text-orange-400 shadow-sm'

                                  : 'bg-zinc-50 dark:bg-[#161616] border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-white/20'

                              }`}

                            >

                              <span className={`font-mono text-xs font-semibold ${isSelected ? 'text-orange-500 dark:text-orange-400' : ''}`}>

                                {rate.size}

                              </span>

                              <span className={`font-mono text-xs font-bold ${isSelected ? 'text-orange-500 dark:text-orange-400' : 'text-zinc-700 dark:text-zinc-300'}`}>

                                ₹{rate.mrp}

                              </span>

                            </button>

                          );

                        })}

                      </div>

                    </div>



                    {/* 5. Alcohol % (% ABV) & 6. Statutory Gazette Maximum Retail Price (MRP) */}

                    <div className="bg-zinc-50 dark:bg-[#000000] p-2.5 rounded-md border border-zinc-200 dark:border-white/10 flex items-center justify-between">

                      <div>

                        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">

                          Alcohol Strength

                        </span>

                        <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">

                          {brand.strength_percentage}% ABV

                        </span>

                      </div>



                      <div className="text-right">

                        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">

                          Statutory Gazette MRP ({activeRate.size})

                        </span>

                        <span className="text-base font-mono font-extrabold text-orange-600 dark:text-orange-400">

                          ₹{activeRate.mrp}

                        </span>

                      </div>

                    </div>

                  </div>



                  {/* 7. Action Button */}

                  <button

                    onClick={() => onAddToCart(brand, activeRate)}

                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm ${

                      inCartQty > 0

                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'

                        : 'bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white shadow-orange-950/40'

                    }`}

                  >

                    {inCartQty > 0 ? (

                      <>

                        <Check className="w-3.5 h-3.5" />

                        <span>{inCartQty} Cases in Indent</span>

                      </>

                    ) : (

                      <>

                        <Plus className="w-3.5 h-3.5" />

                        <span>Order</span>

                      </>

                    )}

                  </button>

                </div>

              </div>
            );
          })}
          </div>
        </div>
      ) : (
        /* Dense Table View (Internally scrollable with sticky header) */
        <div className="flex-1 min-h-0 overflow-auto rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-[#08090c] text-zinc-900 dark:text-white uppercase text-xs font-mono font-semibold tracking-wider border-b border-zinc-200 dark:border-white/10 shadow-xs">
              <tr>
                <th className="py-2.5 px-4">Brand</th>
                <th className="py-2.5 px-3">Govt Approval Code</th>
                <th className="py-2.5 px-3">Manufacturer / Distillery</th>
                <th className="py-2.5 px-3">Pack Sizes &amp; Rates (Select Size)</th>
                <th className="py-2.5 px-3">Alcohol % (% ABV)</th>
                <th className="py-2.5 px-3">Statutory Gazette MRP</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">

              {brands.map((brand) => {

                const packRates = getBrandPackRates(brand);

                const defaultSize = brand.category === 'BEER' ? '650ml' : '750ml';

                const activeSize = selectedSizes[brand.id] || defaultSize;

                const activeRate = packRates.find((r) => r.size === activeSize) || packRates[0];

                const inCartQty = getCartQuantity(brand.id, activeRate?.size);



                return (

                  <tr key={brand.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition">

                    <td className="py-3 px-4">

                      <div 

                        onClick={() => setInspectingBrand(brand)}

                        className="flex items-center gap-3 cursor-pointer group/row"

                        title="Click to view Statewide Depot Stock & Details"

                      >

                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#000000] border border-zinc-200 dark:border-white/10 p-1 flex items-center justify-center flex-shrink-0 group-hover/row:border-orange-500/50 transition">

                          <img

                            src={brand.image_url}

                            alt={brand.name}

                            className="w-full h-full object-contain"

                          />

                        </div>

                        <div className="font-semibold text-zinc-900 dark:text-white group-hover/row:text-orange-600 dark:group-hover/row:text-orange-400 transition-colors">{brand.name}</div>

                      </div>

                    </td>

                    <td className="py-3 px-3 font-mono font-semibold text-orange-400">

                      {brand.brand_code}

                    </td>

                    <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300">

                      {brand.supplier_name}

                    </td>

                    <td className="py-3 px-3">

                      <div className="flex flex-wrap gap-1.5">

                        {packRates.map((rate) => {

                          const isSelected = activeRate.size === rate.size;

                          return (

                            <button

                              key={rate.size}

                              type="button"

                              onClick={() => setSelectedSizes((prev) => ({ ...prev, [brand.id]: rate.size }))}

                              className={`px-2 py-0.5 rounded text-[10px] font-mono transition border ${

                                isSelected

                                  ? 'bg-orange-500/25 border-orange-500 text-orange-600 dark:text-orange-300 font-bold'

                                  : 'bg-zinc-50 dark:bg-[#161616] border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/20'

                              }`}

                            >

                              {rate.size}: ₹{rate.mrp}

                            </button>

                          );

                        })}

                      </div>

                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-800 dark:text-zinc-200">

                      {brand.strength_percentage}% ABV

                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-orange-400 text-sm">

                      ₹{activeRate.mrp} <span className="text-[11px] text-zinc-400 font-normal">({activeRate.size})</span>

                    </td>

                    <td className="py-3 px-4 text-right">

                      <button

                        onClick={() => onAddToCart(brand, activeRate)}

                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${

                          inCartQty > 0

                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'

                            : 'bg-orange-600 hover:bg-orange-500 text-white'

                        }`}

                      >

                        {inCartQty > 0 ? `+1 in Indent (${inCartQty})` : `+ Order`}

                      </button>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      )}



      {/* Regional Depot Stock Modal */}

      {inspectingBrand && (

        <DepotStockModal

          brand={inspectingBrand}

          onClose={() => setInspectingBrand(null)}

        />

      )}

    </div>

  );

}



