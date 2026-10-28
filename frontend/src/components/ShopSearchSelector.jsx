import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Navigation,
  PlusCircle,
  Plus
} from 'lucide-react';
import { AddShopModal } from './AddShopModal';

export function ShopSearchSelector({ 
  selectedShop, 
  onSelectShop, 
  shops = [], 
  onOpenMap,
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddShopOpen, setIsAddShopOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [internalShops, setInternalShops] = useState(shops || []);

  useEffect(() => {
    if (shops && shops.length > 0) {
      setInternalShops(shops);
    }
  }, [internalShops]);

  // Listen to external shop onboardings
  useEffect(() => {
    const handleShopUpdate = (e) => {
      const newShop = e.detail;
      if (newShop) {
        setInternalShops((prev) => {
          if (prev.some((s) => s.id === newShop.id || s.shop_code === newShop.shop_code)) {
            return prev;
          }
          return [newShop, ...prev];
        });
      }
    };
    window.addEventListener('tasmac_shops_updated', handleShopUpdate);
    return () => window.removeEventListener('tasmac_shops_updated', handleShopUpdate);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Extract unique districts
  const districts = useMemo(() => {
    const list = Array.from(new Set(internalShops.map((s) => s.district).filter(Boolean)));
    return ['ALL', ...list];
  }, [shops]);

  // Filtered shops based on search & district
  const filteredShops = useMemo(() => {
    return internalShops.filter((shop) => {
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
  }, [internalShops, searchQuery, selectedDistrict]);

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
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Centered Modal in the Middle of the Page */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-150 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />

          {/* Centered Modal Dialog Card */}
          <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/15 rounded-xl shadow-2xl z-10 p-5 space-y-4 font-mono text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500 shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Select Retail Store
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {filteredShops.length} of {internalShops.length} Statewide TASMAC Vends
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input & Add New Shop Button Row */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search code, name, city, district, address, manager..."
                  autoFocus
                  className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Add New Shop Button */}
              <button
                type="button"
                onClick={() => setIsAddShopOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-mono text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-orange-950/30 shrink-0 group"
                title="Onboard & Commission a new TASMAC Retail Vend"
              >
                <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                <span>+ Add Shop</span>
              </button>
            </div>

            {/* District Quick Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 text-xs no-scrollbar">
              {districts.map((district) => (
                <button
                  key={district}
                  type="button"
                  onClick={() => setSelectedDistrict(district)}
                  className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition cursor-pointer text-[11px] ${
                    selectedDistrict === district
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10'
                  }`}
                >
                  {district === 'ALL' ? 'All Districts' : district}
                </button>
              ))}
            </div>

            {/* Scrollable Shop Results */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-80 font-mono">
              {filteredShops.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
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
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start justify-between gap-3 bg-zinc-50 dark:bg-white/[0.02] ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/5 dark:bg-orange-500/10 text-zinc-900 dark:text-white'
                          : 'border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/15 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-[10px] border border-orange-500/20">
                            {shop.shop_code}
                          </span>
                          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 truncate">
                            {shop.district}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {shop.name}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
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
              <div className="pt-2 border-t border-zinc-200 dark:border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenMap();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Explore Regions & Vends on Map</span>
                </button>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}

      {/* Onboard New Shop Modal */}
      <AddShopModal
        isOpen={isAddShopOpen}
        onClose={() => setIsAddShopOpen(false)}
        existingShopsCount={internalShops.length}
        onShopAdded={(newShop) => {
          setInternalShops((prev) => [newShop, ...prev]);
          if (onSelectShop) {
            onSelectShop(newShop);
          }
          setIsOpen(false);
        }}
      />
    </div>
  );
}

