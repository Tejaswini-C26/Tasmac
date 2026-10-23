import React, { useState } from 'react';
import { 
  Building2, 
  Warehouse, 
  Sparkles, 
  Check, 
  MapPin, 
  Phone, 
  User, 
  Layers, 
  Package, 
  Boxes, 
  Beer, 
  Wine, 
  Flame,
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  Sliders, 
  PlusCircle, 
  ChevronRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { createDepot } from '../services/api';

const REGION_OPTIONS = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Salem',
  'Trichy',
  'Tirunelveli',
  'Vellore',
  'Thanjavur',
  'Erode',
  'Dharmapuri',
  'Cuddalore',
  'Tiruppur',
  'Dindigul',
  'Kanchipuram'
];

const DEPOT_PRESETS = [
  {
    name: 'Tirunelveli Central Wholesale Depot',
    code: 'DEP-TNV',
    region: 'Tirunelveli',
    manager_name: 'M. Arumugam (Depot Superintendent)',
    phone: '+91 462 250 8822',
    address: 'Plot 12, Phase-II SIDCO Industrial Complex, Gangaikondan, Tirunelveli - 627352',
    capacity_cases: 140000,
    initial_stock_cases: 12500,
    shed1Name: 'Gangaikondan IMFL Whisky Vault',
    shed2Name: 'Gangaikondan Beer Storage Bay',
    shed3Name: 'Gangaikondan Vodka & White Spirits',
    shed4Name: 'Gangaikondan Cane Rum Vault',
    shed5Name: 'Gangaikondan Wine & Premium Reserve'
  },
  {
    name: 'Vellore Regional Wholesale Depot',
    code: 'DEP-VEL',
    region: 'Vellore',
    manager_name: 'K. Rajasekaran',
    phone: '+91 416 224 5510',
    address: 'NH-48 Bypass, Ranipet SIPCOT Logistics Corridor, Vellore - 632403',
    capacity_cases: 125000,
    initial_stock_cases: 11000,
    shed1Name: 'Ranipet Whisky Buffer Vault',
    shed2Name: 'Ranipet Fast-Moving Beer Bay',
    shed3Name: 'Ranipet Vodka & Botanical Spirits',
    shed4Name: 'Ranipet Dark Rum Storage',
    shed5Name: 'Ranipet Premium Single Malt Cellar'
  },
  {
    name: 'Thanjavur Delta Wholesale Depot',
    code: 'DEP-TNJ',
    region: 'Thanjavur',
    manager_name: 'S. Swaminathan',
    phone: '+91 4362 278 120',
    address: 'Old Tiruvaiyaru Road, Delta Grain & Beverage Hub, Thanjavur - 613004',
    capacity_cases: 110000,
    initial_stock_cases: 9500,
    shed1Name: 'Delta Central Whisky Warehouse',
    shed2Name: 'Delta Beer Staging Facility',
    shed3Name: 'Delta Vodka & White Spirits Vault',
    shed4Name: 'Delta Spiced Cane Rum Shed',
    shed5Name: 'Delta Reserve Wine & Elite Vault'
  },
  {
    name: 'Erode West Logistics Supply Depot',
    code: 'DEP-ERD',
    region: 'Erode',
    manager_name: 'P. Balachandran',
    phone: '+91 424 253 4488',
    address: 'Perundurai SIPCOT Growth Center, Erode - 638052',
    capacity_cases: 135000,
    initial_stock_cases: 12000,
    shed1Name: 'Perundurai IMFL Whisky Vault',
    shed2Name: 'Perundurai Palletized Beer Bay',
    shed3Name: 'Perundurai Vodka & Grain Spirits',
    shed4Name: 'Perundurai Rum Staging Bay',
    shed5Name: 'Perundurai Wine & Reserve Cellar'
  }
];

export function AddDepot({ onDepotAdded, onCancel }) {
  // Form State
  const [name, setName] = useState('Tirunelveli Central Wholesale Depot');
  const [code, setCode] = useState('DEP-TNV');
  const [region, setRegion] = useState('Tirunelveli');
  const [managerName, setManagerName] = useState('M. Arumugam (Depot Superintendent)');
  const [phone, setPhone] = useState('+91 462 250 8822');
  const [address, setAddress] = useState('Plot 12, Phase-II SIDCO Industrial Complex, Gangaikondan, Tirunelveli - 627352');
  const [capacityCases, setCapacityCases] = useState(140000);
  const [initialStockCases, setInitialStockCases] = useState(12500);

  // 5 Specialized Warehouse Shed Configurations
  const [shed1Ratio, setShed1Ratio] = useState(42); // Whisky
  const [shed2Ratio, setShed2Ratio] = useState(30); // Beer
  const [shed3Ratio, setShed3Ratio] = useState(13); // Vodka & Gin
  const [shed4Ratio, setShed4Ratio] = useState(9);  // Rum
  const [shed5Ratio, setShed5Ratio] = useState(6);  // Wine & Premium

  const [shed1Name, setShed1Name] = useState('Gangaikondan IMFL Whisky Vault');
  const [shed2Name, setShed2Name] = useState('Gangaikondan Beer Storage Bay');
  const [shed3Name, setShed3Name] = useState('Gangaikondan Vodka & White Spirits');
  const [shed4Name, setShed4Name] = useState('Gangaikondan Cane Rum Vault');
  const [shed5Name, setShed5Name] = useState('Gangaikondan Wine & Premium Reserve');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Apply a preset
  const handleApplyPreset = (preset) => {
    setName(preset.name);
    setCode(preset.code);
    setRegion(preset.region);
    setManagerName(preset.manager_name);
    setPhone(preset.phone);
    setAddress(preset.address);
    setCapacityCases(preset.capacity_cases);
    setInitialStockCases(preset.initial_stock_cases);
    setShed1Name(preset.shed1Name);
    setShed2Name(preset.shed2Name);
    setShed3Name(preset.shed3Name);
    setShed4Name(preset.shed4Name || 'Regional Cane Rum Vault');
    setShed5Name(preset.shed5Name || 'Regional Wine & Premium Reserve');
    setError(null);
  };

  const handleNameChange = (val) => {
    setName(val);
  };

  // Calculations for 5 warehouse sheds
  const shed1Cases = Math.round((capacityCases * shed1Ratio) / 100);
  const shed2Cases = Math.round((capacityCases * shed2Ratio) / 100);
  const shed3Cases = Math.round((capacityCases * shed3Ratio) / 100);
  const shed4Cases = Math.round((capacityCases * shed4Ratio) / 100);
  const shed5Cases = capacityCases - shed1Cases - shed2Cases - shed3Cases - shed4Cases;

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Please provide an official wholesale depot name.');
      return;
    }
    if (!code.trim()) {
      setError('Please provide a unique depot code (e.g. DEP-TNV).');
      return;
    }
    if (!managerName.trim()) {
      setError('Please specify the designated depot superintendent / manager.');
      return;
    }
    if (!address.trim()) {
      setError('Please provide the physical depot address / industrial hub.');
      return;
    }
    if (capacityCases < 10000) {
      setError('Depot capacity must be at least 10,000 cases.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        region: region.trim(),
        address: address.trim(),
        manager_name: managerName.trim(),
        phone: phone.trim() || '+91 44 2625 1100',
        capacity_cases: Number(capacityCases),
        initial_stock_cases: Number(initialStockCases)
      };

      const result = await createDepot(payload);
      setSuccessData(result);

      if (onDepotAdded) {
        onDepotAdded(result);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to register wholesale depot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-3 font-sans">
      {/* Top Header / Breadcrumb */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              type="button"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition cursor-pointer"
              title="Return to Wholesale Depots"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                Add Wholesale Depot
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                5-SHED BUFFER FACILITY
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Commission a new regional TASMAC buffer depot with 5 specialized warehouse sheds & initial stock
            </p>
          </div>
        </div>

        {/* Quick Presets Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono font-semibold text-zinc-500 dark:text-zinc-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Presets:
          </span>
          {DEPOT_PRESETS.map((p) => {
            const isCurrent = code === p.code;
            return (
              <button
                key={p.code}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                  isCurrent
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-orange-500/10 hover:text-orange-500 border border-zinc-200 dark:border-white/10'
                }`}
              >
                {p.region}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Content Grid - Internally Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-6">
          
          {/* Left Form Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Depot Identity */}
            <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-white/10 p-4 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-white/5">
                <Building2 className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  1. Depot Identification & Region
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Depot Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Depot Official Facility Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Tirunelveli Central Wholesale Depot"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                {/* Unique Depot Code */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>Depot Code *</span>
                    <span className="text-[10px] font-mono text-zinc-400">PREFIX: DEP-</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DEP-TNV"
                    className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-lg bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 text-orange-600 dark:text-orange-400 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                {/* Region / Zone Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Revenue Region / Zone *
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {REGION_OPTIONS.map((r) => (
                      <option key={r} value={r} className="bg-white dark:bg-zinc-900">
                        {r} Region
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Management & Facility Location */}
            <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-white/10 p-4 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-white/5">
                <User className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  2. Operations & Facility Management
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Depot Superintendent / Manager */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Depot Superintendent / Manager *
                  </label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="e.g. M. Arumugam"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                {/* Official Contact Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Official Telephone / Hotline
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 462 250 8822"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Facility Address & Logistics Complex *
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Plot & Industrial Estate Address, PIN Code..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Buffer Capacity & Initial Stock */}
            <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-white/10 p-4 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-500" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    3. Buffer Storage Capacity & Initial Stock
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
                  {capacityCases.toLocaleString()} Total Cases
                </span>
              </div>

              <div className="space-y-3">
                {/* Total Capacity Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-zinc-600 dark:text-zinc-400">Approved Buffer Capacity (Cases):</span>
                    <input
                      type="number"
                      min="10000"
                      max="300000"
                      step="5000"
                      value={capacityCases}
                      onChange={(e) => setCapacityCases(Number(e.target.value))}
                      className="w-28 px-2 py-1 text-xs font-mono font-bold text-right rounded bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 text-orange-500"
                    />
                  </div>
                  <input
                    type="range"
                    min="20000"
                    max="250000"
                    step="5000"
                    value={capacityCases}
                    onChange={(e) => setCapacityCases(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>20,000 cs (Satellite)</span>
                    <span>140,000 cs (Standard Regional)</span>
                    <span>250,000 cs (Mega Hub)</span>
                  </div>
                </div>

                {/* Initial Stock Allocation */}
                <div className="pt-2 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                      Initial Inward Stock Allocation
                    </label>
                    <p className="text-[11px] text-zinc-500">
                      Dispatched across active state IMFL, Beer & Wine brands upon registration
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1000"
                      max="50000"
                      step="500"
                      value={initialStockCases}
                      onChange={(e) => setInitialStockCases(Number(e.target.value))}
                      className="w-24 px-2 py-1 text-xs font-mono font-bold text-right rounded bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                    />
                    <span className="text-xs font-mono text-zinc-500">cases</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: 5 Specialized Warehouse Sheds */}
            <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-white/10 p-4 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-orange-500" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    4. Five (5) Specialized Warehouse Sheds
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-orange-500 font-bold">
                  Full 5-Zone Architecture
                </span>
              </div>

              <div className="space-y-3">
                {/* Shed 1: IMFL Whisky Vault */}
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Boxes className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        WH Shed 1: IMFL Whisky Vault
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-orange-500/10 text-orange-500">
                        {shed1Ratio}% Allocation
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-orange-500">
                      {shed1Cases.toLocaleString()} cs
                    </span>
                  </div>
                  <input
                    type="text"
                    value={shed1Name}
                    onChange={(e) => setShed1Name(e.target.value)}
                    placeholder="Shed 1 Name"
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                    <span>Stock Categories:</span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300">WHISKY (11 Brands)</span>
                  </div>
                </div>

                {/* Shed 2: Beer Storage Bay */}
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Beer className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        WH Shed 2: Beer Storage Bay
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-500">
                        {shed2Ratio}% Allocation
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-500">
                      {shed2Cases.toLocaleString()} cs
                    </span>
                  </div>
                  <input
                    type="text"
                    value={shed2Name}
                    onChange={(e) => setShed2Name(e.target.value)}
                    placeholder="Shed 2 Name"
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                    <span>Stock Categories:</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">BEER & DRAUGHT (5 Brands)</span>
                  </div>
                </div>

                {/* Shed 3: Vodka & White Spirits */}
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        WH Shed 3: Vodka & White Spirits
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-sky-500/10 text-sky-500">
                        {shed3Ratio}% Allocation
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-sky-500">
                      {shed3Cases.toLocaleString()} cs
                    </span>
                  </div>
                  <input
                    type="text"
                    value={shed3Name}
                    onChange={(e) => setShed3Name(e.target.value)}
                    placeholder="Shed 3 Name"
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                    <span>Stock Categories:</span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">VODKA & GIN (4 Brands)</span>
                  </div>
                </div>

                {/* Shed 4: Rum & Dark Spirits */}
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        WH Shed 4: Rum & Cane Spirits
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-red-500/10 text-red-500">
                        {shed4Ratio}% Allocation
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-500">
                      {shed4Cases.toLocaleString()} cs
                    </span>
                  </div>
                  <input
                    type="text"
                    value={shed4Name}
                    onChange={(e) => setShed4Name(e.target.value)}
                    placeholder="Shed 4 Name"
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                    <span>Stock Categories:</span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400">RUM & SPICED (2 Brands)</span>
                  </div>
                </div>

                {/* Shed 5: Wine & Premium Reserve */}
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wine className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        WH Shed 5: Wine & Premium Reserve
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/10 text-purple-500">
                        {shed5Ratio}% Allocation
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-500">
                      {shed5Cases.toLocaleString()} cs
                    </span>
                  </div>
                  <input
                    type="text"
                    value={shed5Name}
                    onChange={(e) => setShed5Name(e.target.value)}
                    placeholder="Shed 5 Name"
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                    <span>Stock Categories:</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">WINE & BRANDY (2 Brands)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-mono uppercase font-bold tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-mono uppercase font-bold tracking-wider transition shadow-md shadow-orange-950/30 flex items-center gap-2 cursor-pointer group"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Commissioning Depot...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                    <span>Register Wholesale Depot</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Facility Blueprint & Status Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-2 space-y-4">
              
              {/* Live Facility Blueprint Card */}
              <div className="bg-white dark:bg-[#101010] rounded-xl border-2 border-orange-500/30 dark:border-orange-500/40 p-4 shadow-lg space-y-4">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      FACILITY BLUEPRINT (5 SHEDS)
                    </span>
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white mt-1 leading-snug">
                      {name || 'State Wholesale Depot'}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-orange-500" />
                      <span>{region} Revenue Zone</span> &bull; 
                      <span className="font-mono font-bold text-orange-500">{code || 'DEP-XXX'}</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-mono font-bold text-orange-500">
                      {code ? code.replace(/^DEP-/, '').slice(0, 2) : 'DP'}
                    </span>
                  </div>
                </div>

                {/* Capacity Gauge */}
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/5 space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Total Buffer Capacity:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                      {capacityCases.toLocaleString()} cs
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                    <div style={{ width: `${shed1Ratio}%` }} className="bg-orange-500 h-full" title="Whisky" />
                    <div style={{ width: `${shed2Ratio}%` }} className="bg-amber-500 h-full" title="Beer" />
                    <div style={{ width: `${shed3Ratio}%` }} className="bg-sky-500 h-full" title="Vodka/Gin" />
                    <div style={{ width: `${shed4Ratio}%` }} className="bg-red-500 h-full" title="Rum" />
                    <div style={{ width: `${shed5Ratio}%` }} className="bg-purple-500 h-full" title="Wine/Reserve" />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 flex-wrap gap-1">
                    <span className="text-orange-500">● Whisky: {shed1Ratio}%</span>
                    <span className="text-amber-500">● Beer: {shed2Ratio}%</span>
                    <span className="text-sky-500">● Vodka: {shed3Ratio}%</span>
                    <span className="text-red-500">● Rum: {shed4Ratio}%</span>
                    <span className="text-purple-500">● Wine: {shed5Ratio}%</span>
                  </div>
                </div>

                {/* 5 Warehouses Blueprint View */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase font-semibold text-zinc-400 block">
                    Assigned Warehouse Sheds (5):
                  </span>

                  {/* Shed 1 Preview */}
                  <div className="p-2 rounded-lg bg-orange-500/5 border border-orange-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Boxes className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {shed1Name}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Whisky Vault &bull; 11 Brands
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400 shrink-0">
                      {shed1Cases.toLocaleString()} cs
                    </span>
                  </div>

                  {/* Shed 2 Preview */}
                  <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Beer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {shed2Name}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Palletized Bay &bull; 5 Lager Brands
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
                      {shed2Cases.toLocaleString()} cs
                    </span>
                  </div>

                  {/* Shed 3 Preview */}
                  <div className="p-2 rounded-lg bg-sky-500/5 border border-sky-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {shed3Name}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Vodka & Gin Vault &bull; 4 Brands
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400 shrink-0">
                      {shed3Cases.toLocaleString()} cs
                    </span>
                  </div>

                  {/* Shed 4 Preview */}
                  <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {shed4Name}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Dark Rum Shed &bull; 2 Brands
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-red-600 dark:text-red-400 shrink-0">
                      {shed4Cases.toLocaleString()} cs
                    </span>
                  </div>

                  {/* Shed 5 Preview */}
                  <div className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Wine className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {shed5Name}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Wine Cellar &bull; 2 Brands
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400 shrink-0">
                      {shed5Cases.toLocaleString()} cs
                    </span>
                  </div>
                </div>

                {/* Operations & Location Snapshot */}
                <div className="pt-2 border-t border-zinc-100 dark:border-white/5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{managerName || 'Designated Superintendent'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="font-mono text-[11px]">{phone || 'Hotline pending'}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug line-clamp-2">{address || 'Location pending'}</span>
                  </div>
                </div>

                {/* Compliance Checklist Badge */}
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-mono">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="text-[11px]">TASMAC 5-Shed Excise Buffer Standard Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog Modal */}
      {successData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121212] border border-orange-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-500">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Wholesale Depot Commissioned!
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-white">{successData.name}</span> ({successData.code}) has been registered with {successData.capacity_cases?.toLocaleString()} cases capacity.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/60 border border-zinc-200 dark:border-white/10 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Depot Code:</span>
                <span className="font-bold text-orange-500">{successData.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Region:</span>
                <span className="text-zinc-900 dark:text-zinc-100">{successData.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Seeded Brand Stock:</span>
                <span className="text-emerald-500 font-bold">{successData.total_stock_cases?.toLocaleString()} cases</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Warehouse Sheds:</span>
                <span className="text-orange-500 font-bold">5 Specialized Sheds</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  if (onCancel) onCancel();
                }}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition shadow-md shadow-orange-950/30 cursor-pointer text-center"
              >
                View in Wholesale Depots &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
