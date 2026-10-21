import React, { useState, useMemo } from 'react';
import { 
  Store, 
  Search, 
  ChevronDown, 
  MapPin, 
  Check, 
  Phone, 
  User, 
  X,
  Filter,
  Navigation
} from 'lucide-react';

export function ShopSearchSelector({ 
  selectedShop, 
  onSelectShop, 
  shops = [], 
  onOpenMap,
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  // Extract unique districts
  const districts = useMemo(() => {
    const list = Array.from(new Set(shops.map((s) => s.district).filter(Boolean)));
    return ['ALL', ...list];
  }, [shops]);

  // Filtered shops based on search & district
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      if (selectedDistrict !== 'ALL' && shop.district !== selectedDistrict) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = shop.shop_code?.toLowerCase().includes(q);
        const matchName = shop.name?.toLowerCase().includes(q);
        const matchDistrict = shop.district?.toLowerCase().includes(q);
        const matchAddress = shop.address?.toLowerCase().includes(q);
        const matchManager = shop.manager_name?.toLowerCase().includes(q);
        return matchCode || matchName || matchDistrict || matchAddress || matchManager;
      }
      return true;
    });
  }, [shops, searchQuery, selectedDistrict]);

  return (
    <div className={`relative ${className}`}>
      {/* Active Shop Button Anchor */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-xs font-mono transition cursor-pointer group text-left max-w-sm"
      >
        <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500 shrink-0">
          <Store className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold border border-orange-500/20">
              {selectedShop ? selectedShop.shop_code : 'Select Shop'}
            </span>
            <span className="text-zinc-500 text-[10px] truncate">
              {selectedShop?.district || ''}
            </span>
          </div>
          <p className="text-[11px] font-bold text-zinc-900 dark:text-white truncate">
            {selectedShop ? selectedShop.name : 'Choose Retail Store'}
          </p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Click Outside Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Search & Selection Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 sm:left-0 sm:right-auto w-84 sm:w-96 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/15 rounded-md shadow-2xl z-50 p-3 space-y-3 font-mono text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Search Retail Stores
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              {filteredShops.length} of {shops.length} Stores
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, name, city, area..."
              autoFocus
              className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-md pl-9 pr-8 py-2 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* District Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[10px]">
            {districts.map((district) => (
              <button
                key={district}
                type="button"
                onClick={() => setSelectedDistrict(district)}
                className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedDistrict === district
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10'
                }`}
              >
                {district === 'ALL' ? 'All Districts' : district}
              </button>
            ))}
          </div>

          {/* Scrollable Shop Results */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 font-mono">
            {filteredShops.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs">
                No retail stores match "{searchQuery}"
              </div>
            ) : (
              filteredShops.map((shop) => {
                const isSelected = selectedShop?.id === shop.id;
                return (
                  <div
                    key={shop.id}
                    onClick={() => {
                      onSelectShop(shop);
                      setIsOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-start justify-between gap-2.5 bg-zinc-50 dark:bg-white/[0.02] ${
                      isSelected
                        ? 'border-orange-500 text-zinc-900 dark:text-white'
                        : 'border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/15 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-[10px] border border-orange-500/20">
                          {shop.shop_code}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 truncate">
                          {shop.district}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {shop.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>{shop.address}</span>
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 mt-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer: Open Statewide Region Map */}
          {onOpenMap && (
            <div className="pt-2 border-t border-zinc-200/60 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenMap();
                }}
                className="w-full py-2 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Explore Regions & Vends on Map</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

