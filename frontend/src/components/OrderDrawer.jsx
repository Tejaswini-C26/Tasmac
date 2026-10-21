import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Truck, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  FileText,
  ChevronDown,
  Check,
  MapPin,
  Store,
  Navigation
} from 'lucide-react';
import { createOrder } from '../services/api';
import { ShopMapModal } from './ShopMapModal';

export function OrderDrawer({
  isOpen,
  onClose,
  cart,
  setCart,
  selectedShop,
  onSelectShop,
  shops = [],
  depots = [],
  onOrderSuccess,
}) {
  const [selectedDepotId, setSelectedDepotId] = useState(null);
  const [isDepotDropdownOpen, setIsDepotDropdownOpen] = useState(false);
  const depotDropdownRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Close depot dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (depotDropdownRef.current && !depotDropdownRef.current.contains(event.target)) {
        setIsDepotDropdownOpen(false);
      }
    };
    if (isDepotDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDepotDropdownOpen]);

  // Close dropdown when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setIsDepotDropdownOpen(false);
    }
  }, [isOpen]);

  // Fallback depot if not selected
  const activeDepotId = selectedDepotId || selectedShop?.assigned_depot_id || (depots[0]?.id ?? 1);
  const activeDepot = depots.find((d) => d.id === activeDepotId);

  // Cart calculations
  const totalCases = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce(
    (acc, item) => acc + item.quantity * (item.current_price?.wholesale_issue_price || 0),
    0
  );
  const taxDuty = Math.round(subtotal * 0.05 * 100) / 100;
  const totalPayable = Math.round((subtotal + taxDuty) * 100) / 100;

  const handleUpdateQuantity = (itemKey, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          const key = item.cartKey || item.id;
          if (key === itemKey) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (itemKey) => {
    setCart((prev) => prev.filter((item) => (item.cartKey || item.id) !== itemKey));
  };

  const handleSubmitOrder = async () => {
    if (!selectedShop) {
      setErrorMsg('Please select a retail shop first.');
      return;
    }
    if (cart.length === 0) {
      setErrorMsg('Your indent cart is empty.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const payload = {
        shop_id: selectedShop.id,
        depot_id: activeDepotId,
        items: cart.map((item) => ({
          brand_id: item.id,
          cases_ordered: item.quantity,
        })),
      };

      const result = await createOrder(payload);
      setConfirmedOrder(result);
      setCart([]); // Clear cart
      if (onOrderSuccess) onOrderSuccess(result);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to submit replenishment indent');
    } finally {
      setSubmitting(false);
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-md bg-white dark:bg-[#101010] border-l border-zinc-200 dark:border-white/[0.08] h-full flex flex-col shadow-2xl text-zinc-100 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#000000] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight text-white">
                  Retail Replenishment Indent
                </h2>
              </div>
            </div>
            <button
              onClick={() => {
                setConfirmedOrder(null);
                onClose();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {confirmedOrder ? (
              /* Order Success View */
              <div className="py-6 flex flex-col items-center text-center space-y-4 animate-scale-up">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Indent Placed Successfully!</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Wholesale warehouse dispatch has been scheduled with TASMAC Logistics.
                  </p>
                </div>

                {/* Order Pass Ticket */}
                <div className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/[0.08] rounded-xl p-4 text-left space-y-2.5">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-white/[0.06]">
                    <span className="text-xs text-zinc-400">Indent Order Number</span>
                    <span className="text-xs font-mono font-bold text-orange-400">
                      {confirmedOrder.order_no}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Transit Pass (e-TP)</span>
                    <span className="font-mono text-zinc-200">{confirmedOrder.transit_pass_no}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Assigned Logistics Vehicle</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {confirmedOrder.vehicle_no}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Fulfillment Depot</span>
                    <span className="text-zinc-200">{confirmedOrder.depot_name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Total Cases</span>
                    <span className="font-mono font-semibold text-white">
                      {confirmedOrder.total_cases} cases
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-200 dark:border-white/[0.06]">
                    <span className="text-zinc-400">Total Payable Amount</span>
                    <span className="font-mono font-bold text-base text-white">
                      ₹{confirmedOrder.total_payable.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="w-full pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setConfirmedOrder(null);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm transition cursor-pointer"
                  >
                    Create Another Indent
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              /* Empty Cart View */
              <div className="py-16 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-zinc-100 dark:bg-[#141620] border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500">
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <p className="text-sm font-medium text-zinc-300">Your replenishment cart is empty</p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Browse the catalog and add wholesale cases to create your shop replenishment indent.
                </p>
              </div>
            ) : (
              /* Cart Items List */
              <>
                {/* Destination Retail Vend Indicator - Clickable to open Tamil Nadu Region Map */}
                {selectedShop && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Store className="w-3.5 h-3.5 text-orange-400" />
                        Destination Retail Vend
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsMapModalOpen(true)}
                        className="text-[11px] font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer transition font-semibold"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Change on Map</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      title="Click to explore Tamil Nadu regions on map and select retail shop"
                      className="w-full text-left bg-zinc-50 dark:bg-[#0c0d12] hover:bg-orange-500/5 p-3 rounded-xl border border-zinc-200 dark:border-white/[0.08] hover:border-orange-500/50 transition-all flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          {selectedShop.shop_code}
                        </span>
                        <div className="min-w-0 truncate">
                          <div className="text-xs font-semibold text-white group-hover:text-orange-400 transition-colors truncate flex items-center gap-1.5">
                            <span>{selectedShop.name}</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {selectedShop.district} &bull; {selectedShop.address}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-[10px] font-mono text-zinc-400 group-hover:text-orange-300">
                          Map
                        </span>
                        <Navigation className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
                      </div>
                    </button>
                  </div>
                )}

                {/* Depot Selector with Premium Orange Dropdown */}
                <div 
                  ref={depotDropdownRef}
                  className="bg-zinc-50 dark:bg-[#0c0d12] p-3 rounded-xl border border-zinc-200 dark:border-white/[0.08] space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-orange-400" />
                      Select Fulfilling Wholesale Depot
                    </label>
                    <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                      {depots.length} Statewide Depots
                    </span>
                  </div>

                  {/* Custom Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsDepotDropdownOpen((prev) => !prev)}
                    className={`w-full bg-zinc-50 dark:bg-[#000000] border ${
                      isDepotDropdownOpen
                        ? 'border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.2)]'
                        : 'border-zinc-200 dark:border-white/10 hover:border-orange-500/60'
                    } text-xs rounded-xl px-3 py-2.5 flex items-center justify-between transition group cursor-pointer`}
                  >
                    <div className="flex items-center gap-2 text-left truncate">
                      <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] flex-shrink-0" />
                      <span className="font-semibold text-white truncate">
                        {activeDepot ? activeDepot.name : 'Select Depot'}
                      </span>
                      {activeDepot?.region && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">
                          {activeDepot.region}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {activeDepot?.capacity_cases && (
                        <span className="text-[11px] font-mono text-zinc-400">
                          Cap: {activeDepot.capacity_cases.toLocaleString()} cs
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 group-hover:text-orange-400 transition-transform duration-200 ${
                          isDepotDropdownOpen ? 'rotate-180 text-orange-400' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Custom Options List */}
                  {isDepotDropdownOpen && (
                    <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/15 rounded-xl shadow-2xl p-1.5 space-y-1 max-h-60 overflow-y-auto">
                      {depots.map((d) => {
                        const isSelected = d.id === activeDepotId;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              setSelectedDepotId(d.id);
                              setIsDepotDropdownOpen(false);
                            }}
                            className={`w-full p-2.5 rounded-lg text-left text-xs transition-all flex items-center justify-between group cursor-pointer ${
                              isSelected
                                ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/30'
                                : 'text-zinc-300 hover:bg-orange-500 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-white text-orange-600'
                                    : 'border border-zinc-500 group-hover:border-white group-hover:bg-white/20'
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full group-hover:bg-white" />
                                )}
                              </div>
                              <div className="truncate">
                                <span className="font-medium truncate">
                                  {d.name} <span className={`text-[11px] opacity-80 ${isSelected ? 'text-orange-100' : 'group-hover:text-orange-100'}`}>({d.region})</span>
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded ml-2 flex-shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-black/20 text-white font-bold'
                                  : 'bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 group-hover:bg-white/20 group-hover:text-white'
                              }`}
                            >
                              Cap: {d.capacity_cases.toLocaleString()} cases
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2.5">
                  <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Indent Items ({cart.length})
                  </div>
                  {cart.map((item) => {
                    const itemKey = item.cartKey || item.id;
                    const unitPrice = item.current_price?.wholesale_issue_price || 0;
                    const itemTotal = unitPrice * item.quantity;
                    const packLabel = item.selectedLabel || item.pack_size;
                    const mrp = item.current_price?.mrp_per_bottle;

                    return (
                      <div
                        key={itemKey}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/[0.06] flex items-center gap-3"
                      >
                        <div className="w-12 h-14 rounded-lg bg-white dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                            <span className="text-orange-400 font-semibold">{packLabel}</span>
                            {mrp && <span className="text-zinc-500"> &bull; ₹{mrp} MRP</span>}
                            <span> &bull; ₹{unitPrice.toLocaleString()}/cs</span>
                          </div>
                          <div className="text-xs font-mono font-medium text-orange-400 mt-1">
                            ₹{itemTotal.toLocaleString()}
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-1.5 bg-white dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 rounded-lg p-1">
                          <button
                            onClick={() => handleUpdateQuantity(itemKey, -1)}
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold px-1.5 text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(itemKey, 1)}
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveItem(itemKey)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    {errorMsg}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Financial Summary & Action */}
          {!confirmedOrder && cart.length > 0 && (
            <div className="p-4 bg-zinc-50 dark:bg-[#000000] border-t border-zinc-200 dark:border-white/[0.08] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Total Wholesale Cases</span>
                  <span className="font-mono text-zinc-200">{totalCases} Cases</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Wholesale Net Price</span>
                  <span className="font-mono text-zinc-200">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Excise Transit & Admin Duty (5%)</span>
                  <span className="font-mono text-zinc-200">₹{taxDuty.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-white pt-2 border-t border-zinc-200 dark:border-white/[0.06]">
                  <span>Total Payable</span>
                  <span className="font-mono text-orange-400">₹{totalPayable.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition cursor-pointer"
              >
                {submitting ? (
                  <span>Generating Transit Pass & Placing Indent...</span>
                ) : (
                  <>
                    <span>Submit Replenishment Indent</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Statewide Region Map Modal */}
      <ShopMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        shops={shops}
        depots={depots}
        selectedShop={selectedShop}
        onSelectShop={(newShop) => {
          if (onSelectShop) onSelectShop(newShop);
          setIsMapModalOpen(false);
        }}
        onOrderForShop={(newShop) => {
          if (onSelectShop) onSelectShop(newShop);
          setIsMapModalOpen(false);
        }}
      />
    </>
  );
}
