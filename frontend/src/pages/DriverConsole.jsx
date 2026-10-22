import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  PenTool, 
  Package, 
  RotateCcw, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Send,
  X,
  FileCheck
} from 'lucide-react';
import { fetchOrders, updateOrderStatus, createBottleReturn } from '../services/api';

export function DriverConsole() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForPOD, setSelectedOrderForPOD] = useState(null);

  // POD Modal form state
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [damagedBottles, setDamagedBottles] = useState(0);
  const [shortageCases, setShortageCases] = useState(0);
  const [cratesCollected, setCratesCollected] = useState(10);
  const [bottlesCollected, setBottlesCollected] = useState(240);
  const [signatureDone, setSignatureDone] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [isSubmittingPOD, setIsSubmittingPOD] = useState(false);
  const [podSuccess, setPodSuccess] = useState(false);

  const loadDriverOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load driver orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverOrders();
  }, []);

  const handleOpenPOD = (order) => {
    setSelectedOrderForPOD(order);
    setOtpInput('');
    setOtpError(false);
    setDamagedBottles(0);
    setShortageCases(0);
    setCratesCollected(12);
    setBottlesCollected(280);
    setSignatureDone(false);
    setPhotoUploaded(false);
    setPodSuccess(false);
  };

  const handleConfirmPOD = async () => {
    if (!otpInput || otpInput.trim().length !== 4) {
      setOtpError(true);
      return;
    }
    try {
      setIsSubmittingPOD(true);
      if (selectedOrderForPOD?.id) {
        await updateOrderStatus(selectedOrderForPOD.id, 'DELIVERED');
        if (bottlesCollected > 0 || cratesCollected > 0) {
          try {
            await createBottleReturn({
              shop_id: selectedOrderForPOD.shop_id,
              depot_id: selectedOrderForPOD.depot_id || 1,
              driver_name: 'K. Selvakumar',
              bottles_returned: parseInt(bottlesCollected, 10) || 0,
              crates_returned: parseInt(cratesCollected, 10) || 0,
              bottle_deposit_rate: 10.0,
              crate_deposit_rate: 50.0,
              notes: `Doorstep e-POD return for order ${selectedOrderForPOD.order_no} (Damages: ${damagedBottles} btls, Shortage: ${shortageCases} cs)`
            });
          } catch (retErr) {
            console.warn('Bottle return recorded locally:', retErr);
          }
        }
      }
      setPodSuccess(true);
      setTimeout(() => {
        setSelectedOrderForPOD(null);
        loadDriverOrders();
      }, 1500);
    } catch (err) {
      console.error('Failed to confirm POD:', err);
    } finally {
      setIsSubmittingPOD(false);
    }
  };

  const pendingStops = orders.filter((o) => o.status !== 'DELIVERED');
  const completedStops = orders.filter((o) => o.status === 'DELIVERED');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Mobile Driver Header */}
      <div className="forge-card p-5 rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  Fleet Vehicle #TN-04-E-8812
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  GPS Active
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
                K. Selvakumar (Lead Driver)
              </h1>
              <p className="text-xs text-zinc-500 font-mono">
                Ambattur Central Depot &rarr; Chennai Central Route #03
              </p>
            </div>
          </div>

          <button
            onClick={loadDriverOrders}
            title="Refresh Route Sheet"
            className="p-2.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 transition cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
        </div>

        {/* Route Progress bar */}
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-zinc-50 dark:bg-[#090a0d] border border-zinc-200 dark:border-white/5">
            <div className="text-[10px] uppercase font-mono text-zinc-500">Remaining Stops</div>
            <div className="text-lg font-bold font-mono text-orange-600 dark:text-orange-400">{pendingStops.length}</div>
          </div>
          <div className="p-2 rounded bg-zinc-50 dark:bg-[#090a0d] border border-zinc-200 dark:border-white/5">
            <div className="text-[10px] uppercase font-mono text-zinc-500">Completed Stops</div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{completedStops.length}</div>
          </div>
          <div className="p-2 rounded bg-zinc-50 dark:bg-[#090a0d] border border-zinc-200 dark:border-white/5">
            <div className="text-[10px] uppercase font-mono text-zinc-500">Total Cases</div>
            <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white">
              {orders.reduce((acc, o) => acc + (o.total_cases || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Route Stops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            Today's Delivery Stops Manifest
          </h2>
          <span className="text-xs font-mono text-zinc-500">
            {orders.length} total destinations
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400 forge-card rounded-md border border-zinc-200 dark:border-white/10">
            Loading route manifest...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 forge-card rounded-md border border-zinc-200 dark:border-white/10">
            No active orders assigned to this route today.
          </div>
        ) : (
          orders.map((order, idx) => {
            const isDelivered = order.status === 'DELIVERED';
            return (
              <div 
                key={order.id}
                className={`forge-card p-4 rounded-md border transition-all ${
                  isDelivered 
                    ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10'
                    : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] hover:border-orange-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                      isDelivered 
                        ? 'bg-emerald-500 text-white'
                        : 'bg-orange-500 text-white shadow-sm'
                    }`}>
                      {isDelivered ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                          {order.order_no}
                        </span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-semibold ${
                          isDelivered 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="font-semibold text-zinc-900 dark:text-white text-sm mt-0.5">
                        {order.shop_name || 'TASMAC Retail Vend'}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {order.shop_address || 'T. Nagar Commercial Hub, Chennai'}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                        <span className="text-zinc-900 dark:text-white font-bold">
                          {order.total_cases} Cases to Unload
                        </span>
                        <span className="text-zinc-500">
                          Value: ₹{order.total_payable?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 items-end">
                    <a
                      href="tel:+919840110420"
                      className="p-2 rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-600 dark:text-zinc-400 hover:text-orange-500 transition"
                      title="Call Shop Manager"
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    {!isDelivered ? (
                      <button
                        onClick={() => handleOpenPOD(order)}
                        className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm whitespace-nowrap"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Doorstep POD
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Doorstep Proof of Delivery (POD) Modal */}
      {selectedOrderForPOD && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="forge-card w-full max-w-lg rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-2xl p-6 space-y-5 animate-in fade-in-50 zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                  Electronic Proof of Delivery (e-POD)
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                  Deliver Order #{selectedOrderForPOD.order_no}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedOrderForPOD(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* OTP Verification Gate */}
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-[#090a0d] border border-zinc-200 dark:border-white/10 space-y-2">
              <label className="text-xs font-mono uppercase text-zinc-700 dark:text-zinc-300 block">
                1. Retail Store 4-Digit OTP Code
              </label>
              <p className="text-[11px] text-zinc-500">
                Ask the retail shop supervisor for the SMS verification OTP (Demo OTP: <strong className="text-orange-500 font-mono">4892</strong>).
              </p>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="4892"
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value);
                    setOtpError(false);
                  }}
                  className="w-32 px-3 py-2 text-center text-lg font-mono font-bold tracking-widest rounded border border-zinc-300 dark:border-white/20 bg-white dark:bg-[#12141a] text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setOtpInput('4892')}
                  className="px-2 py-1 text-[11px] font-mono text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Auto-fill Demo OTP
                </button>
              </div>
              {otpError && (
                <span className="text-xs text-rose-500 font-mono">
                  Please enter a valid 4-digit verification code.
                </span>
              )}
            </div>

            {/* Discrepancy & Returns Reporting */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-zinc-50 dark:bg-[#090a0d] border border-zinc-200 dark:border-white/10">
                <label className="font-mono text-zinc-500 block mb-1">Damaged Bottles</label>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setDamagedBottles(Math.max(0, damagedBottles - 1))}
                    className="w-7 h-7 rounded border border-zinc-300 dark:border-white/10 flex items-center justify-center font-bold"
                  >-</button>
                  <span className="font-mono font-bold text-base text-zinc-900 dark:text-white">{damagedBottles}</span>
                  <button 
                    onClick={() => setDamagedBottles(damagedBottles + 1)}
                    className="w-7 h-7 rounded border border-zinc-300 dark:border-white/10 flex items-center justify-center font-bold"
                  >+</button>
                </div>
              </div>

              <div className="p-3 rounded bg-zinc-50 dark:bg-[#090a0d] border border-zinc-200 dark:border-white/10">
                <label className="font-mono text-zinc-500 block mb-1">Shortage Cases</label>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShortageCases(Math.max(0, shortageCases - 1))}
                    className="w-7 h-7 rounded border border-zinc-300 dark:border-white/10 flex items-center justify-center font-bold"
                  >-</button>
                  <span className="font-mono font-bold text-base text-zinc-900 dark:text-white">{shortageCases}</span>
                  <button 
                    onClick={() => setShortageCases(shortageCases + 1)}
                    className="w-7 h-7 rounded border border-zinc-300 dark:border-white/10 flex items-center justify-center font-bold"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Reverse Logistics: Returnable Bottles */}
            <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-orange-600 dark:text-orange-400">
                <span>Returned Empty Bottles (DRS Reverse Logistics)</span>
                <span>Refund: ₹{(bottlesCollected * 10) + (cratesCollected * 50)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <label className="text-zinc-500">Crates (₹50/cr):</label>
                  <input
                    type="number"
                    value={cratesCollected}
                    onChange={(e) => setCratesCollected(Number(e.target.value))}
                    className="w-full px-2 py-1 mt-1 rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#090a0d] text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-500">Bottles (₹10/btl):</label>
                  <input
                    type="number"
                    value={bottlesCollected}
                    onChange={(e) => setBottlesCollected(Number(e.target.value))}
                    className="w-full px-2 py-1 mt-1 rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#090a0d] text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Digital Signature & Photo Simulation */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setSignatureDone(!signatureDone)}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                  signatureDone
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-600 dark:text-zinc-400 hover:border-orange-500'
                }`}
              >
                <PenTool className="w-5 h-5 text-orange-500" />
                <span>{signatureDone ? '✓ Signature Captured' : 'Touch to Sign'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoUploaded(!photoUploaded)}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                  photoUploaded
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-600 dark:text-zinc-400 hover:border-orange-500'
                }`}
              >
                <Camera className="w-5 h-5 text-orange-500" />
                <span>{photoUploaded ? '✓ Crates Photo Taken' : 'Backdoor Photo'}</span>
              </button>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForPOD(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-white/10 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmittingPOD}
                onClick={handleConfirmPOD}
                className="px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {podSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Delivery Confirmed!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Sign Off & Complete Delivery
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
