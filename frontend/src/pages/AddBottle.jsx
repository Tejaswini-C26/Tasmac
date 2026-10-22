import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  Check, 
  Image as ImageIcon, 
  Layers, 
  IndianRupee, 
  AlertCircle, 
  Wine, 
  Package, 
  ArrowRight,
  RefreshCw,
  Trash2,
  Building2,
  ChevronDown
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'WHISKY', label: 'Whisky' },
  { value: 'BEER', label: 'Beer & Cider' },
  { value: 'VODKA', label: 'Vodka' },
  { value: 'RUM', label: 'Rum' },
  { value: 'BRANDY', label: 'Brandy' },
  { value: 'GIN', label: 'Gin' },
  { value: 'WINE', label: 'Wine' },
];

const PRESET_BOTTLE_IMAGES = [
  { name: 'Corona Extra', url: '/brands/corona-extra.jpg', category: 'BEER' },
  { name: 'Captain Morgan', url: '/brands/captain-morgan.jpg', category: 'RUM' },
  { name: 'Jameson Irish', url: '/brands/jameson-irish.jpg', category: 'WHISKY' },
  { name: 'Grey Goose', url: '/brands/grey-goose.jpg', category: 'VODKA' },
  { name: 'Magic Moments', url: '/brands/magic-moments.jpg', category: 'VODKA' },
  { name: 'Morpheus XO', url: '/brands/morpheus-xo.jpg', category: 'BRANDY' },
  { name: 'Roku Gin', url: '/brands/roku-gin.jpg', category: 'GIN' },
  { name: 'Sula Shiraz', url: '/brands/sula-shiraz.jpg', category: 'WINE' },
  { name: 'Tuborg Strong', url: '/brands/tuborg-strong.jpg', category: 'BEER' },
  { name: 'Jack Daniel\'s', url: '/brands/jack-daniels.jpg', category: 'WHISKY' },
  { name: 'Tanqueray Gin', url: '/brands/tanqueray-gin.jpg', category: 'GIN' },
  { name: 'Jacob\'s Creek', url: '/brands/jacobs-creek.jpg', category: 'WINE' },
];

export function AddBottle({ onBottleAdded }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('WHISKY');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    if (isCategoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryOpen]);
  const [strength, setStrength] = useState(42.8);
  const [flavorNotes, setFlavorNotes] = useState('Smooth blend with oak finish and refined aroma');
  const [imageUrl, setImageUrl] = useState('/brands/jameson-irish.jpg');
  const [initialStock, setInitialStock] = useState(1500);

  // Pack rates state
  const [packRates, setPackRates] = useState([
    { size: '1000ml', label: '1000ml', mrp: 1850, wholesale_issue_price: 16650, bottles_per_case: 12 },
    { size: '750ml', label: '750ml', mrp: 1400, wholesale_issue_price: 12880, bottles_per_case: 12 },
    { size: '375ml', label: '375ml', mrp: 720, wholesale_issue_price: 13240, bottles_per_case: 24 },
    { size: '180ml', label: '180ml', mrp: 370, wholesale_issue_price: 13610, bottles_per_case: 48 },
  ]);

  const [selectedPreviewPack, setSelectedPreviewPack] = useState('750ml');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Switch pack presets if user changes to beer
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (newCat === 'BEER') {
      setStrength(7.0);
      setImageUrl('/brands/corona-extra.jpg');
      setPackRates([
        { size: '650ml', label: '650ml', mrp: 180, wholesale_issue_price: 1620, bottles_per_case: 12 },
        { size: '500ml', label: '500ml', mrp: 150, wholesale_issue_price: 2700, bottles_per_case: 24 },
        { size: '330ml', label: '330ml', mrp: 110, wholesale_issue_price: 1980, bottles_per_case: 24 },
      ]);
      setSelectedPreviewPack('650ml');
    } else {
      if (category === 'BEER') {
        setPackRates([
          { size: '1000ml', label: '1000ml', mrp: 1850, wholesale_issue_price: 16650, bottles_per_case: 12 },
          { size: '750ml', label: '750ml', mrp: 1400, wholesale_issue_price: 12880, bottles_per_case: 12 },
          { size: '375ml', label: '375ml', mrp: 720, wholesale_issue_price: 13240, bottles_per_case: 24 },
          { size: '180ml', label: '180ml', mrp: 370, wholesale_issue_price: 13610, bottles_per_case: 48 },
        ]);
        setSelectedPreviewPack('750ml');
      }
      if (newCat === 'VODKA') {
        setStrength(42.8);
        setImageUrl('/brands/grey-goose.jpg');
      } else if (newCat === 'RUM') {
        setStrength(42.8);
        setImageUrl('/brands/captain-morgan.jpg');
      } else if (newCat === 'BRANDY') {
        setStrength(42.8);
        setImageUrl('/brands/morpheus-xo.jpg');
      } else if (newCat === 'GIN') {
        setStrength(41.4);
        setImageUrl('/brands/roku-gin.jpg');
      } else if (newCat === 'WINE') {
        setStrength(13.5);
        setImageUrl('/brands/sula-shiraz.jpg');
      } else {
        setStrength(42.8);
        setImageUrl('/brands/jameson-irish.jpg');
      }
    }
  };

  const updatePackRate = (index, field, value) => {
    const updated = [...packRates];
    updated[index] = {
      ...updated[index],
      [field]: field === 'size' || field === 'label' ? value : Number(value) || 0
    };
    setPackRates(updated);
  };

  const addPackRate = () => {
    setPackRates([
      ...packRates,
      { size: '500ml', label: '500ml', mrp: 900, wholesale_issue_price: 8100, bottles_per_case: 12 }
    ]);
  };

  const removePackRate = (index) => {
    if (packRates.length <= 1) return;
    const updated = packRates.filter((_, i) => i !== index);
    setPackRates(updated);
    if (!updated.some(p => p.size === selectedPreviewPack)) {
      setSelectedPreviewPack(updated[0]?.size || '750ml');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a bottle/brand name');
      return;
    }

    if (packRates.length === 0) {
      setError('At least one pack size is required');
      return;
    }

    setLoading(true);
    try {
      const getSubCategory = (cat) => {
        switch (cat) {
          case 'BEER': return 'Strong Premium Beer';
          case 'VODKA': return 'Triple Distilled Vodka';
          case 'RUM': return 'Dark Spiced Rum';
          case 'BRANDY': return 'Premium Grape Brandy';
          case 'GIN': return 'London Dry Craft Gin';
          case 'WINE': return 'Cabernet Shiraz';
          default: return 'Blended Indian Whisky';
        }
      };

      const payload = {
        name: name.trim(),
        category,
        sub_category: getSubCategory(category),
        strength_percentage: parseFloat(strength) || 42.8,
        image_url: imageUrl,
        flavor_notes: flavorNotes,
        pack_rates: packRates,
        initial_depot_stock: parseInt(initialStock, 10) || 1000
      };

      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Failed to create bottle: ${res.statusText}`);
      }

      const created = await res.json();
      setSuccessData(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activePack = packRates.find(p => p.size === selectedPreviewPack) || packRates[0] || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          Add New Bottle to Wholesale Catalog
        </h1>
      </div>

      {/* Success Notification Modal / Banner */}
      {successData && (
        <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {successData.name} Successfully Added!
              </h3>
              <p className="text-xs text-emerald-300 mt-0.5">
                Brand Code: <span className="font-mono font-bold text-white">{successData.brand_code}</span> &bull; {successData.pack_rates?.length || 0} pack sizes configured &bull; {successData.total_depot_stock?.toLocaleString()} cases allocated across depots.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setSuccessData(null);
                setName('');
              }}
              className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 hover:text-white text-xs font-mono font-bold uppercase transition"
            >
              Add Another
            </button>
            <button
              onClick={() => {
                if (onBottleAdded) onBottleAdded();
              }}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-orange-900/30"
            >
              <span>View in Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Form on Left, Live Card Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-md p-6 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-mono flex items-center gap-2">
                <Wine className="w-4 h-4" />
                1. General Bottle Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    Bottle / Brand Name <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Challenge"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-md px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition font-sans"
                  />
                </div>

                <div ref={categoryDropdownRef} className="relative">
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    Category <span className="text-orange-500">*</span>
                  </label>
                  
                  {/* Custom Category Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen((prev) => !prev)}
                    className={`w-full bg-zinc-50 dark:bg-[#000000] border ${
                      isCategoryOpen
                        ? 'border-orange-500 ring-2 ring-orange-500/25 shadow-[0_0_12px_rgba(249,115,22,0.2)]'
                        : 'border-zinc-200 dark:border-white/10 hover:border-orange-500/60'
                    } rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white font-mono flex items-center justify-between transition group cursor-pointer`}
                  >
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {CATEGORY_OPTIONS.find((c) => c.value === category)?.label || category}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 group-hover:text-orange-400 transition-transform duration-200 ${
                        isCategoryOpen ? 'rotate-180 text-orange-400' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Options List (Theme background) */}
                  {isCategoryOpen && (
                    <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/15 rounded-md shadow-2xl p-1.5 space-y-1">
                      {CATEGORY_OPTIONS.map((opt) => {
                        const isSelected = opt.value === category;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              handleCategoryChange(opt.value);
                              setIsCategoryOpen(false);
                            }}
                            className={`w-full p-2.5 rounded-lg text-left text-xs font-mono transition-all flex items-center justify-between group cursor-pointer ${
                              isSelected
                                ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/30'
                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-orange-500 hover:text-white'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-white text-orange-600 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    Alcohol Strength (% ABV)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-md px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bottle Image Selection */}
            <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-white/10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-mono flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                2. Bottle Image &amp; Artwork
              </h2>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Image Path / URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/brands/my-bottle.jpg or https://..."
                  className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-md px-3.5 py-2 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <span className="block text-[11px] font-mono text-zinc-400 mb-2">
                  Or pick from preloaded high-resolution bottle assets:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_BOTTLE_IMAGES.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => {
                        setImageUrl(img.url);
                        if (!name) setName(img.name);
                        handleCategoryChange(img.category);
                      }}
                      className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                        imageUrl === img.url
                          ? 'border-orange-500 bg-orange-500/15'
                          : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#141620] hover:border-zinc-300 dark:hover:border-zinc-500'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-10 h-14 object-contain"
                        onError={(e) => { e.target.src = '/brands/corona-extra.jpg'; }}
                      />
                      <span className="text-[10px] text-zinc-700 dark:text-zinc-300 truncate w-full">
                        {img.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pack Rates & Statutory Pricing */}
            <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-mono flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  3. Pack Sizes &amp; Statutory Pricing
                </h2>
                <button
                  type="button"
                  onClick={addPackRate}
                  className="text-xs font-mono font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Size
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-100 dark:bg-[#000000] text-black dark:text-white text-xs font-semibold border-b border-zinc-200 dark:border-white/10">
                    <tr>
                      <th className="py-2.5 px-3">Size (ml)</th>
                      <th className="py-2.5 px-3">Gazette MRP (₹)</th>
                      <th className="py-2.5 px-3">Wholesale / Case (₹)</th>
                      <th className="py-2.5 px-3">Bottles / Case</th>
                      <th className="py-2.5 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
                    {packRates.map((rate, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={rate.size}
                            onChange={(e) => updatePackRate(idx, 'size', e.target.value)}
                            className="w-20 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1 text-zinc-900 dark:text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="10"
                            value={rate.mrp}
                            onChange={(e) => updatePackRate(idx, 'mrp', e.target.value)}
                            className="w-24 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1 text-orange-400 font-bold font-mono text-xs focus:outline-none focus:border-orange-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="100"
                            value={rate.wholesale_issue_price}
                            onChange={(e) => updatePackRate(idx, 'wholesale_issue_price', e.target.value)}
                            className="w-28 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1 text-zinc-700 dark:text-zinc-200 font-mono text-xs focus:outline-none focus:border-orange-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            value={rate.bottles_per_case}
                            onChange={(e) => updatePackRate(idx, 'bottles_per_case', e.target.value)}
                            className="w-16 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1 text-zinc-700 dark:text-zinc-300 font-mono text-xs focus:outline-none focus:border-orange-500"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          {packRates.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePackRate(idx)}
                              className="text-zinc-500 hover:text-red-400 transition p-1"
                              title="Delete pack size"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Initial Depot Allocation */}
            <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-white/10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-mono flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                4. Depot Inventory Allocation
              </h2>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                    Initial Cases to Distribute Across 5 State Depots
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-md px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition font-mono"
                  />
                </div>
                <div className="text-xs font-mono text-zinc-500 pt-5">
                  ≈ {Math.round(initialStock / 5)} cases per regional depot
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-zinc-200 dark:border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Registering with State Wholesale Network...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish Bottle to Wholesale Catalog</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Live Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Live Wholesale Card Preview
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Interactive
            </span>
          </div>

          {/* Actual Card Render */}
          <div className="forge-card rounded-md overflow-hidden border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] flex flex-col justify-between shadow-2xl">
            {/* Card Image Area */}
            <div className="relative aspect-[4/3] bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-[#0f1117] dark:to-[#000000] p-4 flex items-center justify-center border-b border-zinc-200 dark:border-white/10 overflow-hidden">
              <img
                src={imageUrl}
                alt={name || 'Bottle Preview'}
                className="h-full max-h-44 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                onError={(e) => { e.target.src = '/brands/corona-extra.jpg'; }}
              />

              {/* Category Badge */}
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono uppercase tracking-wider text-orange-400 border border-white/10">
                {category}
              </span>

              {/* Strength Badge */}
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-zinc-300 border border-white/10">
                {strength}% ABV
              </span>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">
                  Govt Code: <span className="text-orange-400 font-bold">BRD-NEW</span>
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white tracking-tight truncate">
                  {name || 'Sample Bottle Name'}
                </h3>
              </div>

              {/* Pack Sizes Grid */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                  Select Pack Size:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {packRates.map((pkg) => {
                    const isSelected = selectedPreviewPack === pkg.size;
                    return (
                      <button
                        key={pkg.size}
                        type="button"
                        onClick={() => setSelectedPreviewPack(pkg.size)}
                        className={`px-2 py-1.5 rounded-lg border text-left font-mono transition flex items-center justify-between text-xs cursor-pointer ${
                          isSelected
                            ? 'bg-transparent border-orange-500 text-orange-500 dark:text-orange-400 font-bold shadow-sm'
                            : 'bg-zinc-100 dark:bg-[#141620] border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        <span className={`truncate ${isSelected ? 'text-orange-500 dark:text-orange-400' : ''}`}>{pkg.size}</span>
                        <span className={`font-bold ml-1 ${isSelected ? 'text-orange-500 dark:text-orange-400' : 'text-zinc-500'}`}>₹{pkg.mrp}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Price & Issue Metric */}
              <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-zinc-500 text-[10px] block">Statutory MRP ({activePack.size}):</span>
                  <span className="text-base font-bold text-orange-400">
                    ₹{activePack.mrp || 0}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500 text-[10px] block">Wholesale Issue / Case:</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-200">
                    ₹{activePack.wholesale_issue_price?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#101010] border border-zinc-200 dark:border-white/10 text-xs text-zinc-600 dark:text-zinc-400 font-mono space-y-1.5">
            <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
              <Package className="w-4 h-4 text-orange-400" />
              <span>Catalog Integration Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Upon publishing, this bottle will instantly be active across all TASMAC retail and wholesale dashboards. Shop managers will be able to indent cases directly to their assigned depots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

