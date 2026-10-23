import React, { useState } from 'react';
import { 
  Warehouse, 
  PlusCircle, 
  X, 
  Boxes, 
  Beer, 
  Wine, 
  Sparkles, 
  Flame, 
  Layers, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { saveCustomWarehouse } from '../services/depotConfigs';

const AVAILABLE_CATEGORIES = [
  { id: 'WHISKY', label: 'IMFL Whisky', icon: Boxes, color: 'text-amber-500' },
  { id: 'BEER', label: 'Beer & Draught', icon: Beer, color: 'text-yellow-500' },
  { id: 'VODKA', label: 'Vodka', icon: Sparkles, color: 'text-sky-500' },
  { id: 'GIN', label: 'Gin & White Spirits', icon: Sparkles, color: 'text-teal-500' },
  { id: 'RUM', label: 'Rum & Cane Spirits', icon: Flame, color: 'text-orange-500' },
  { id: 'WINE', label: 'Wines', icon: Wine, color: 'text-rose-500' },
  { id: 'BRANDY', label: 'Brandies', icon: Wine, color: 'text-purple-500' },
];

export function AddWarehouseModal({ isOpen, onClose, depot, onWarehouseAdded }) {
  if (!isOpen || !depot) return null;

  const currentCount = depot.warehouses?.length || 5;
  const nextNum = currentCount + 1;
  const rawPrefix = (depot.code || 'DEP').replace(/^DEP-/, '');
  const initials = depot.initials || rawPrefix.slice(0, 2).toUpperCase() || 'DP';

  const [name, setName] = useState(`Warehouse ${nextNum}`);
  const [shortName, setShortName] = useState(`Warehouse ${nextNum}`);
  const [code, setCode] = useState(`WH-${initials}-0${nextNum}`);
  const [selectedCategories, setSelectedCategories] = useState(['WHISKY']);
  const [capacityCases, setCapacityCases] = useState(25000);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const toggleCategory = (catId) => {
    setSelectedCategories(prev => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(c => c !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!shortName || shortName === `Warehouse ${nextNum}` || shortName.startsWith('Warehouse ')) {
      setShortName(val.trim() || `Warehouse ${nextNum}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please provide a warehouse shed name.');
      return;
    }
    if (selectedCategories.length === 0) {
      setError('Please select at least one spirit category for this warehouse.');
      return;
    }
    if (!capacityCases || capacityCases <= 0) {
      setError('Please specify a positive storage capacity in cases.');
      return;
    }

    const uniqueId = `wh-${(depot.code || 'dep').toLowerCase()}-${Date.now().toString(36)}`;
    const newWarehouse = {
      id: uniqueId,
      code: code.trim() || `WH-${initials}-0${nextNum}`,
      name: trimmedName || `Warehouse ${nextNum}`,
      shortName: shortName.trim() || trimmedName || `Warehouse ${nextNum}`,
      categories: selectedCategories,
      capacity_cases: Number(capacityCases),
      desc: description.trim() || `Specialized storage facility for ${selectedCategories.join(', ')}`,
      isCustom: true
    };

    saveCustomWarehouse(depot.id, newWarehouse);
    window.dispatchEvent(new Event('tasmac_warehouses_updated'));

    if (onWarehouseAdded) {
      onWarehouseAdded(newWarehouse);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div 
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#121318] border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Add Warehouse Shed</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/20">
                  {depot.code}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {depot.name} &bull; {depot.region}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-xs font-mono">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Warehouse Name */}
          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[11px]">
              Warehouse Official Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={`e.g. Warehouse ${nextNum}`}
              className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Short Name & Code */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[11px]">
                Short Display Title *
              </label>
              <input
                type="text"
                required
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder={`e.g. Warehouse ${nextNum}`}
                className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[11px]">
                Shed Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`WH-${initials}-0${nextNum}`}
                className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Spirit Categories */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[11px] flex justify-between">
              <span>Allocated Spirit Categories *</span>
              <span className="text-zinc-400 font-normal">Select 1 or more</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-2 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold'
                        : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-orange-500' : 'text-zinc-400'}`} />
                    <span className="truncate text-[11px]">{cat.label}</span>
                    {isSelected && <Check className="w-3 h-3 ml-auto text-orange-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Case Capacity */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[11px]">
                Approved Buffer Capacity (Cases) *
              </label>
              <span className="text-orange-500 font-bold">
                {Number(capacityCases || 0).toLocaleString()} cs
              </span>
            </div>
            <input
              type="number"
              min="1000"
              max="200000"
              step="1000"
              required
              value={capacityCases}
              onChange={(e) => setCapacityCases(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
            <div className="flex gap-1.5 pt-1">
              {[10000, 20000, 35000, 50000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCapacityCases(val)}
                  className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 transition"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[11px]">
              Facility Purpose / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Temperature-controlled buffer for regional draught beer"
              className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-200 dark:border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition cursor-pointer font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-950/30 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Commission Warehouse</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

