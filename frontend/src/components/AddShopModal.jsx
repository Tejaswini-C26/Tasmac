import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Store, 
  PlusCircle, 
  X, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Phone, 
  User, 
  CreditCard, 
  Package, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { createShop } from '../services/api';

const DISTRICT_DEPOT_MAP = {
  Chennai: 1,
  Coimbatore: 2,
  Madurai: 3,
  Salem: 4,
  Trichy: 5,
  Tirunelveli: 3,
  Erode: 2,
  Vellore: 1,
  Thanjavur: 5,
  Dindigul: 3
};

const DEFAULT_DISTRICTS = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Salem',
  'Trichy',
  'Tirunelveli',
  'Erode',
  'Vellore',
  'Thanjavur',
  'Dindigul'
];

export function AddShopModal({ 
  isOpen, 
  onClose, 
  onShopAdded,
  existingShopsCount = 13,
  depots = []
}) {
  const nextShopNum = 1000 + existingShopsCount + 1;
  const initialCode = `SHOP-${nextShopNum}`;

  const [name, setName] = useState(`TASMAC Anna Nagar West Vend #${nextShopNum}`);
  const [shopCode, setShopCode] = useState(initialCode);
  const [district, setDistrict] = useState('Chennai');
  const [shopType, setShopType] = useState('STANDARD_VEND');
  const [assignedDepotId, setAssignedDepotId] = useState(1);
  const [address, setAddress] = useState(`142, 2nd Avenue, Anna Nagar West, Chennai - 600040`);
  const [managerName, setManagerName] = useState('R. Karthikeyan');
  const [phone, setPhone] = useState('+91 98401 55678');
  const [monthlyQuota, setMonthlyQuota] = useState(750);
  const [creditLimit, setCreditLimit] = useState(800000);
  const [licenseNumber, setLicenseNumber] = useState(`TN-EXC-RET-2026/${nextShopNum}`);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-sync depot when district changes
  const handleDistrictChange = (newDistrict) => {
    setDistrict(newDistrict);
    const suggestedDepotId = DISTRICT_DEPOT_MAP[newDistrict] || 1;
    setAssignedDepotId(suggestedDepotId);
    if (address.includes('Chennai - 600040') && newDistrict !== 'Chennai') {
      setAddress(`TASMAC Commercial Complex, Main Road, ${newDistrict}`);
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please provide a valid shop / vend name.');
      return;
    }
    if (!address.trim()) {
      setError('Please provide the full street address.');
      return;
    }
    if (!managerName.trim()) {
      setError('Please provide the store manager / station officer name.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        shop_code: shopCode.trim() || `SHOP-${nextShopNum}`,
        name: trimmedName,
        shop_type: shopType,
        district: district,
        address: address.trim(),
        manager_name: managerName.trim(),
        phone: phone.trim() || '+91 98401 00000',
        assigned_depot_id: Number(assignedDepotId) || 1,
        license_number: licenseNumber.trim() || `TN-EXC-RET-2026/${nextShopNum}`,
        credit_limit: Number(creditLimit) || 800000.0,
        monthly_quota_cases: Number(monthlyQuota) || 750,
        category: shopType === 'ELITE_MALL_SHOP' ? 'ELITE' : 'STANDARD',
        lat: district === 'Coimbatore' ? 11.0168 : district === 'Madurai' ? 9.9252 : 13.0827,
        lng: district === 'Coimbatore' ? 76.9558 : district === 'Madurai' ? 78.1198 : 80.2707,
      };

      const createdShop = await createShop(payload);

      // Notify parent & global listener
      if (onShopAdded) {
        onShopAdded(createdShop);
      }
      window.dispatchEvent(new CustomEvent('tasmac_shops_updated', { detail: createdShop }));
      onClose();
    } catch (err) {
      console.error('Failed to create retail shop:', err);
      setError(err.message || 'Failed to onboard shop to TASMAC database.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans text-zinc-900 dark:text-zinc-100"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#121318] border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 uppercase font-bold tracking-wider">
                  State Retail Network
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold">
                  {shopCode}
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Onboard New TASMAC Retail Store
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-mono text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Shop Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                Retail Vend Name <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. TASMAC Anna Nagar West Vend #1055"
                required
                className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                Shop Code <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={shopCode}
                onChange={(e) => setShopCode(e.target.value.toUpperCase())}
                placeholder="SHOP-1055"
                required
                className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white font-bold text-orange-500 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          {/* District & Shop Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                District / Revenue Zone <span className="text-orange-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition cursor-pointer"
              >
                {DEFAULT_DISTRICTS.map((d) => (
                  <option key={d} value={d} className="bg-white dark:bg-[#121318] text-zinc-900 dark:text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                Vend Category / Type <span className="text-orange-500">*</span>
              </label>
              <select
                value={shopType}
                onChange={(e) => setShopType(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition cursor-pointer"
              >
                <option value="STANDARD_VEND" className="bg-white dark:bg-[#121318] text-zinc-900 dark:text-white">
                  STANDARD_VEND (Standard Retail Vend)
                </option>
                <option value="ELITE_MALL_SHOP" className="bg-white dark:bg-[#121318] text-zinc-900 dark:text-white">
                  ELITE_MALL_SHOP (TASMAC Elite Mall Store)
                </option>
                <option value="LICENSED_BAR" className="bg-white dark:bg-[#121318] text-zinc-900 dark:text-white">
                  LICENSED_BAR (Licensed Attached Vend)
                </option>
              </select>
            </div>
          </div>

          {/* Assigned Wholesale Depot */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase flex items-center justify-between">
              <span>Fulfilling Wholesale Depot <span className="text-orange-500">*</span></span>
              <span className="text-[10px] text-zinc-400">Auto-routed by region</span>
            </label>
            <select
              value={assignedDepotId}
              onChange={(e) => setAssignedDepotId(Number(e.target.value))}
              className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition cursor-pointer font-bold"
            >
              <option value={1} className="bg-white dark:bg-[#121318] text-zinc-900 dark:text-white">
                Chennai Central Wholesale Depot (DEP-CHN-01)
              </option>
              <option value={2} className="bg-white dark:bg-[#121318] text-zinc-900 dark:text-white">
                Coimbatore Regional Depot (DEP-CBE-02)
              </option>
              <option value={3} className="bg-white dark:bg-[#121318] text-zinc-900 dark:text-white">
                Madurai Buffer Wholesale Depot (DEP-MDU-03)
              </option>
              <option value={4} className="bg-white dark:bg-[#121318] text-zinc-900 dark:text-white">
                Salem Steel City Depot (DEP-SLM-04)
              </option>
              <option value={5} className="bg-white dark:bg-[#121318] text-zinc-900 dark:text-white">
                Trichy Central State Depot (DEP-TRY-05)
              </option>
            </select>
          </div>

          {/* Full Street Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
              Street Address &amp; Pin Code <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 142, 2nd Avenue, Anna Nagar West, Chennai - 600040"
              required
              className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Manager Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                Store Manager / Station Officer <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. R. Karthikeyan"
                required
                className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                Contact Phone <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98401 55678"
                required
                className="w-full bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          {/* Statutory Quota, Credit Limit & License */}
          <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-3">
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
              Statutory Licensing &amp; Indent Ceilings
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Monthly Quota (cs)</label>
                <input
                  type="number"
                  value={monthlyQuota}
                  onChange={(e) => setMonthlyQuota(e.target.value)}
                  min={100}
                  max={5000}
                  className="w-full bg-white dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Credit Ceiling (₹)</label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  step={50000}
                  className="w-full bg-white dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase">Excise License #</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full bg-white dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-white text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Info pill */}
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/[0.03] text-[11px] text-zinc-500 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>Store shelf inventory will automatically be seeded across statewide approved brands.</span>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-orange-950/30 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Registering...' : 'Commission & Onboard Retail Vend'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
