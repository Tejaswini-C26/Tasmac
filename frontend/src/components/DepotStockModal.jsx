import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, Package, MapPin, CheckCircle2 } from 'lucide-react';
import { fetchBrandDepotStock } from '../services/api';

export function DepotStockModal({ brand, onClose }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brand) return;
    setLoading(true);
    fetchBrandDepotStock(brand.id)
      .then((data) => {
        setStocks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [brand]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!brand) return null;

  const totalCases = stocks.reduce((acc, s) => acc + s.available_cases, 0);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#111217] border-l border-zinc-200 dark:border-white/10 h-full flex flex-col shadow-2xl animate-slide-left cursor-default text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Pinned Header */}
        <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0c10]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 p-1 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={brand.image_url}
                alt={brand.name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              <span className="text-[10px] font-mono text-orange-500 uppercase tracking-wider font-bold block">
                Wholesale Depot Stock Breakdown
              </span>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">{brand.name}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Code: <span className="font-mono text-zinc-700 dark:text-zinc-300">{brand.brand_code}</span> &bull; {brand.pack_size}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Stock banner (Pinned) */}
        <div className="shrink-0 px-5 py-3 bg-zinc-100/70 dark:bg-[#08090c] border-b border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Total Statewide Depot Stock</span>
          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 font-mono">
            {totalCases.toLocaleString()} Cases Available
          </span>
        </div>

        {/* Depot list (Scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-zinc-400 text-xs font-mono">
              Loading depot real-time stock...
            </div>
          ) : stocks.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 text-xs font-mono">
              No depot stocks recorded for this brand.
            </div>
          ) : (
            stocks.map((item) => {
              const maxStock = 500;
              const pct = Math.min(100, Math.round((item.available_cases / maxStock) * 100));
              const isGoodStock = item.available_cases > 50;

              return (
                <div
                  key={item.depot_id}
                  className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#08090c] border border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/20 transition flex flex-col gap-2 font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-zinc-900 dark:text-white font-sans">{item.depot_name}</span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {item.region}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-sans">
                      <MapPin className="w-3.5 h-3.5" /> Regional Depot #{item.depot_id}
                    </span>
                    <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                      {item.available_cases} cases
                    </span>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="w-full bg-zinc-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isGoodStock ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Pinned Footer */}
        <div className="shrink-0 p-4 bg-zinc-50 dark:bg-[#0b0c10] border-t border-zinc-200 dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-zinc-200 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-700 dark:text-zinc-200 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

