import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  CheckCircle2, 
  Plus,
  ShieldCheck, 
  FileText, 
  Truck, 
  Warehouse, 
  QrCode, 
  FlaskConical, 
  Clock, 
  MapPin, 
  Scale, 
  Receipt, 
  Coins, 
  ChevronRight, 
  AlertCircle, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Printer, 
  Building2, 
  BadgeCheck, 
  Activity, 
  Radio, 
  Sparkles,
  Eye,
  RotateCw
} from 'lucide-react';
import { updateConsignmentStatus, receiveConsignmentGRN } from '../services/api';

const STAGES = [
  { id: 1, key: 'licensing', label: 'Licensing & Quota', shortLabel: 'Stage 1' },
  { id: 2, key: 'batch', label: 'Batch & Holograms', shortLabel: 'Stage 2' },
  { id: 3, key: 'egp', label: 'Excise Gate Pass', shortLabel: 'Stage 3' },
  { id: 4, key: 'transit', label: 'Depot Transit', shortLabel: 'Stage 4' },
  { id: 5, key: 'grn', label: 'GRN & Settlement', shortLabel: 'Stage 5' },
];

export function ConsignmentWorkstation({
  consignments = [],
  selectedConsignment,
  onSelectConsignment,
  onConsignmentUpdated,
  onOpenDispatch
}) {
  // If no consignment selected, default to the first active/in-progress or first overall
  const activeConsignment = useMemo(() => {
    if (selectedConsignment) return selectedConsignment;
    if (!consignments || consignments.length === 0) return null;
    const inProgress = consignments.find(c => c.status === 'IN_TRANSIT' || c.status === 'DISPATCHED' || c.status === 'PLANNED');
    return inProgress || consignments[0];
  }, [selectedConsignment, consignments]);

  // Persistent stage storage key
  const storageKey = activeConsignment ? `tasmac_consignment_stage_${activeConsignment.id}` : null;

  // Compute base active stage from consignment status
  const getInitialActiveStage = (csg) => {
    if (!csg) return 1;
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 1 && parsed <= 5) return parsed;
      }
    }
    if (csg.status === 'RECEIVED') return 5;
    if (csg.status === 'IN_TRANSIT') return 4;
    if (csg.status === 'DISPATCHED') return 4; // EGP done, transit active
    return 1;
  };

  const [activeStage, setActiveStage] = useState(() => getInitialActiveStage(activeConsignment));
  const [viewingStage, setViewingStage] = useState(() => getInitialActiveStage(activeConsignment));
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Sync when activeConsignment changes
  useEffect(() => {
    if (activeConsignment) {
      const stage = getInitialActiveStage(activeConsignment);
      setActiveStage(stage);
      setViewingStage(stage);
      setActionFeedback(null);
    }
  }, [activeConsignment?.id, activeConsignment?.status]);

  if (!activeConsignment) {
    return null;
  }

  const csg = activeConsignment;
  const isReceived = csg.status === 'RECEIVED' || activeStage === 5 && localStorage.getItem(`${storageKey}_settled`) === 'true';

  // Save stage change
  const advanceToStage = async (nextStage, statusToUpdate = null) => {
    try {
      setActionLoading(true);
      if (statusToUpdate && csg.status !== statusToUpdate) {
        await updateConsignmentStatus(csg.id, statusToUpdate);
      }
      localStorage.setItem(storageKey, String(nextStage));
      setActiveStage(nextStage);
      setViewingStage(nextStage);
      if (onConsignmentUpdated) {
        await onConsignmentUpdated({
          ...csg,
          status: statusToUpdate || csg.status
        });
      }
    } catch (err) {
      console.error('Failed to advance stage:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Specific Action Handlers
  const handleStage1AuthorizeQuota = async () => {
    setActionLoading(true);
    setActionFeedback('Excise Quota Authorized! Government audit token generated. Unlocking lab batching...');
    setTimeout(async () => {
      await advanceToStage(2);
      setActionFeedback(null);
    }, 600);
  };

  const handleStage2AffixHolograms = async () => {
    setActionLoading(true);
    setActionFeedback('Affixing 2D QR Holograms & cryptographic batch stamp... Unlocking Gate Pass...');
    setTimeout(async () => {
      await advanceToStage(3);
      setActionFeedback(null);
    }, 600);
  };

  const handleStage3IssueEGP = async () => {
    setActionLoading(true);
    setActionFeedback('Issuing Digital Excise Gate Pass (EGP) and assigning vehicle fleet...');
    try {
      await advanceToStage(4, 'DISPATCHED');
    } finally {
      setTimeout(() => setActionFeedback(null), 1000);
    }
  };

  const handleStage4CheckInWeighbridge = async () => {
    setActionLoading(true);
    setActionFeedback('Simulating Depot RFID Gate Check-in & Gross Weighbridge Verification (Matched)...');
    try {
      await advanceToStage(5, 'IN_TRANSIT');
    } finally {
      setTimeout(() => setActionFeedback(null), 1000);
    }
  };

  const handleStage5SignGRN = async () => {
    setActionLoading(true);
    setActionFeedback('Signing Goods Receipt Note (GRN) and disbursing Fortnightly Treasury settlement...');
    try {
      if (csg.status !== 'RECEIVED') {
        await receiveConsignmentGRN(csg.id, {
          breakage_bottles: 0,
          remarks: 'Verified 0% breakage via Statutory Live Workstation'
        });
      }
      localStorage.setItem(`${storageKey}_settled`, 'true');
      localStorage.setItem(storageKey, '5');
      setActiveStage(5);
      if (onConsignmentUpdated) {
        await onConsignmentUpdated({
          ...csg,
          status: 'RECEIVED',
          grn_no: csg.grn_no || `GRN-${(csg.depot_name || 'DEP').slice(0, 3).toUpperCase()}-2026/${5100 + csg.id * 19}`,
          breakage_bottles: 0,
          received_cases: csg.total_cases || 500
        });
      }
    } catch (err) {
      console.error('Failed to receive GRN:', err);
    } finally {
      setTimeout(() => {
        setActionLoading(false);
        setActionFeedback('GRN Issued & Fortnight Settlement Disbursed Successfully!');
      }, 700);
    }
  };

  // Progress Bar Percentage
  const progressPercent = 
    activeStage === 1 ? 10 :
    activeStage === 2 ? 30 :
    activeStage === 3 ? 50 :
    activeStage === 4 ? 80 : 100;

  // Derived mock data based on consignment
  const bottlesCount = (csg.total_cases || 500) * 12;
  const exciseLicNo = `TN-EXC-LIC-2024/${9900 + (csg.supplier_id || 1) * 7}`;
  const egpPermitNo = csg.excise_permit_no || `EGP-TN-2026-${8800 + csg.id * 14}`;
  const grnNo = csg.grn_no || `GRN-${(csg.depot_name || 'DEP').slice(0, 3).toUpperCase()}-2026/${5100 + csg.id * 19}`;
  const settlementRef = `FT-SETTLE-2026-${9100 + csg.id * 23}`;

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0d12] shadow-md p-4 sm:p-5 mb-4 text-zinc-900 dark:text-zinc-100 transition-all">
      {/* 1. Header Bar: Workstation Title + Consignment Quick Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
          Live Interactive Workstation
        </h2>

        {onOpenDispatch && (
          <button
            onClick={onOpenDispatch}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs uppercase font-bold tracking-wider shadow-md shadow-orange-950/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Dispatch Inward Consignment
          </button>
        )}
      </div>

      {/* 2. Step-by-Step Statutory Pipeline (Exact Match to Screenshot) */}
      <div className="pt-4 pb-2">
        {/* Pipeline Subheader */}
        <div className="flex items-center justify-end text-[11px] font-mono tracking-wider mb-3">
          <div className="text-orange-500 font-bold">
            Viewing Stage {viewingStage} of 5
          </div>
        </div>

        {/* 5 Stages Grid / Row */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 items-center text-center">
          {STAGES.map((s) => {
            const isCompleted = s.id < activeStage || (s.id === 5 && isReceived);
            const isActive = s.id === activeStage && !isReceived;
            const isViewing = s.id === viewingStage;

            // Status label below stage title
            let statusText = `Stage ${s.id}`;
            let statusClass = 'text-zinc-400 dark:text-zinc-500';
            if (isCompleted) {
              statusText = 'Done ✓';
              statusClass = 'text-emerald-600 dark:text-emerald-400 font-semibold';
            } else if (isActive) {
              statusText = 'Active •';
              statusClass = 'text-orange-500 font-bold';
            }

            return (
              <div
                key={s.id}
                onClick={() => setViewingStage(s.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer select-none ${
                  isViewing 
                    ? 'border border-orange-500/40 bg-orange-50/70 dark:bg-orange-950/20 shadow-xs' 
                    : 'hover:bg-zinc-100/60 dark:hover:bg-white/[0.02]'
                }`}
              >
                {/* Circle Badge Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isActive
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 ring-4 ring-orange-500/20'
                      : 'border-2 border-zinc-300 dark:border-white/20 text-zinc-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : isActive ? (
                    s.id === 4 ? (
                      <Truck className="w-4 h-4" />
                    ) : (
                      <span className="font-mono text-xs font-bold">{s.id}</span>
                    )
                  ) : (
                    <Check className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                  )}
                </div>

                {/* Stage Title */}
                <span className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white mt-1.5 truncate max-w-full">
                  {s.label}
                </span>

                {/* Status Subtitle */}
                <span className={`text-[10px] font-mono mt-0.5 ${statusClass}`}>
                  {statusText}
                </span>
              </div>
            );
          })}
        </div>

        {/* Orange Horizontal Progress Bar Underneath */}
        <div className="w-full h-1 bg-zinc-200 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Action Feedback Banner (if any) */}
      {actionFeedback && (
        <div className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold flex items-center gap-2 animate-pulse">
          <RotateCw className="w-4 h-4 animate-spin shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* 3. Stage Detail Interactive Workspace Card */}
      <div className="mt-4 pt-4">
        {/* ================= STAGE 1 ================= */}
        {viewingStage === 1 && (
          <div className="space-y-4">
            <div className="pb-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                State Licensing & Quota Verification
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Manufacturer & License</div>
                <div className="font-bold text-zinc-900 dark:text-white mt-1 text-sm truncate">{csg.supplier_name}</div>
                <div className="text-orange-500 font-semibold mt-0.5">{exciseLicNo}</div>
                <div className="text-zinc-500 text-[10px] mt-1">Status: Primary Grain Distillery (State Corridor)</div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Monthly Quota Ceiling & Balance</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-zinc-500 text-[10px]">Monthly Ceiling:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">50,000 cs</span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-zinc-500 text-[10px]">Already Drawn:</span>
                  <span className="font-bold text-amber-500">32,500 cs (65%)</span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-zinc-500 text-[10px]">Quota Balance:</span>
                  <span className="font-bold text-emerald-500">17,500 cs</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Consignment Requisition</div>
                <div className="font-bold text-zinc-900 dark:text-white mt-1 text-sm">
                  {csg.total_cases?.toLocaleString()} Cases Indent
                </div>
                <div className="text-orange-500 font-semibold mt-0.5">₹{csg.total_value?.toLocaleString()}</div>
                <div className="text-emerald-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Within Monthly Permissible Quota
                </div>
              </div>
            </div>

            {/* Click Action Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                {activeStage > 1 ? '✓ Government quota audit recorded and verified.' : 'Action Required: Authorize state quota to unlock laboratory chemical certification.'}
              </span>
              <button
                onClick={handleStage1AuthorizeQuota}
                disabled={actionLoading || activeStage > 1}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                  activeStage > 1 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950/20'
                }`}
              >
                <Check className="w-4 h-4" />
                {activeStage > 1 ? 'Quota Authorized ✓ (Stage 1 Complete)' : 'Authorize Quota & Advance to Stage 2'}
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 2 ================= */}
        {viewingStage === 2 && (
          <div className="space-y-4">
            <div className="pb-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Chemical Lab Certification & Holograms
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Chemical Purity Analysis</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-zinc-500 text-[10px]">Ethyl Purity:</span>
                  <span className="font-bold text-emerald-500">99.98% Vol</span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-zinc-500 text-[10px]">Alcohol By Vol:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">42.8% ABV (Statutory Pass)</span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-zinc-500 text-[10px]">Methanol/Toxins:</span>
                  <span className="font-bold text-emerald-500">0.00% (Not Detected)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Batch & Hologram Calculation</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-zinc-500 text-[10px]">Batch Number:</span>
                  <span className="font-bold text-orange-500">{csg.batch_no}</span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-zinc-500 text-[10px]">Required 2D QR:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{bottlesCount.toLocaleString()} Holograms</span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-zinc-500 text-[10px]">Series Range:</span>
                  <span className="font-bold text-zinc-600 dark:text-zinc-400 text-[10px]">TN-HOLO-26-90401..</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014] flex flex-col justify-between">
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-bold">Government Lab Stamp</div>
                  <div className="text-emerald-500 font-bold mt-1 flex items-center gap-1.5 text-xs">
                    <BadgeCheck className="w-4 h-4 shrink-0" />
                    CERTIFIED STATUTORY COMPLIANT
                  </div>
                  <div className="text-zinc-500 text-[10px] mt-1">
                    State Chemical Testing Laboratory, Chennai Division
                  </div>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-2">
                  Tamper-Evident Hologram Roll Hash: #TAS-QR-88192
                </div>
              </div>
            </div>

            {/* Click Action Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                {activeStage > 2 ? '✓ 2D QR Holograms digitally stamped to batch.' : 'Action Required: Affix government holograms to generate statutory transport gate pass.'}
              </span>
              <button
                onClick={handleStage2AffixHolograms}
                disabled={actionLoading || activeStage > 2}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                  activeStage > 2 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950/20'
                }`}
              >
                <QrCode className="w-4 h-4" />
                {activeStage > 2 ? 'Holograms Affixed ✓ (Stage 2 Complete)' : 'Affix Holograms & Unlock Gate Pass'}
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 3 ================= */}
        {viewingStage === 3 && (
          <div className="space-y-4">
            <div className="pb-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Statutory Excise Gate Pass (EGP)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Origin & Destination Depot</div>
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white mt-1">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="truncate">{csg.supplier_name}</span>
                </div>
                <div className="text-center my-1 text-zinc-400 text-xs">➔</div>
                <div className="flex items-center gap-1.5 font-bold text-orange-500">
                  <Warehouse className="w-3.5 h-3.5" />
                  <span className="truncate">{csg.depot_name}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Assigned Transport Fleet</div>
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white mt-1">
                  <Truck className="w-3.5 h-3.5 text-orange-500" />
                  <span>{csg.vehicle_no || 'TN-01-AN-4421'}</span>
                </div>
                <div className="text-zinc-500 text-[10px] mt-1">
                  Driver: {csg.driver_name || 'M. Murugan'} ({csg.driver_phone || '+91 94440 12345'})
                </div>
                <div className="text-emerald-500 text-[10px] font-semibold mt-1">
                  Fleet GPS Sensor Active (AIS-140)
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Authorized Digital EGP Code</div>
                <div className="font-bold text-orange-500 mt-1 text-sm">{egpPermitNo}</div>
                <div className="text-zinc-500 text-[10px] mt-1">
                  Validity Window: Departure: 10:30 AM ➔ Expiry: 04:30 PM
                </div>
                <div className="text-zinc-400 text-[10px] mt-0.5">
                  Electronic Seal: Dual RFID Tamper Proof
                </div>
              </div>
            </div>

            {/* Click Action Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                {activeStage > 3 ? '✓ Digital EGP Permit authorized and assigned to vehicle.' : 'Action Required: Issue authorized digital transit pass to start highway transit.'}
              </span>
              <button
                onClick={handleStage3IssueEGP}
                disabled={actionLoading || activeStage > 3}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                  activeStage > 3 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950/20'
                }`}
              >
                <FileText className="w-4 h-4" />
                {activeStage > 3 ? 'EGP Issued ✓ (Stage 3 Complete)' : 'Authorize & Issue Digital EGP Permit'}
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 4 ================= */}
        {viewingStage === 4 && (
          <div className="space-y-4">
            <div className="pb-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                GPS Highway Transit to Buffer Depot
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Highway Corridor Transit</div>
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white mt-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>NH-44 State Logistics Highway</span>
                </div>
                <div className="flex items-baseline justify-between mt-1 text-[11px]">
                  <span className="text-zinc-500">Live Speed:</span>
                  <span className="font-bold text-emerald-500">54 km/h (Normal Cruise)</span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5 text-[11px]">
                  <span className="text-zinc-500">GPS Fix:</span>
                  <span className="text-zinc-400">11.6643° N, 78.1460° E</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Electronic Tamper Seals</div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-500 mt-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SEALS INTACT (0 Breaches)</span>
                </div>
                <div className="text-zinc-500 text-[10px] mt-1">
                  Primary Seal: RFID-TN-E90281 | Active
                </div>
                <div className="text-zinc-500 text-[10px] mt-0.5">
                  Secondary Seal: Barcode-TN-B88204 | Verified
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Depot Weighbridge Arrival</div>
                <div className="font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Gross Weight: 24,850 kg</span>
                </div>
                <div className="text-zinc-500 text-[10px] mt-1">
                  Tare: 11,200 kg | Net Payload: 13,650 kg (Exact Match)
                </div>
                <div className="text-orange-500 text-[10px] font-semibold mt-1">
                  RFID Gate Inward Queue: Ready for Weigh Check
                </div>
              </div>
            </div>

            {/* Click Action Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                {activeStage > 4 ? '✓ Weighbridge verified & vehicle checked in at depot RFID gates.' : 'Action Required: Confirm arrival and register truck at depot weighbridge.'}
              </span>
              <button
                onClick={handleStage4CheckInWeighbridge}
                disabled={actionLoading || activeStage > 4}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                  activeStage > 4 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950/20'
                }`}
              >
                <Scale className="w-4 h-4" />
                {activeStage > 4 ? 'Weighbridge Checked In ✓ (Stage 4 Complete)' : 'Check In at Depot Weighbridge'}
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 5 ================= */}
        {viewingStage === 5 && (
          <div className="space-y-4">
            <div className="pb-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Goods Receipt Note (GRN) & Fortnight Payout
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Physical Inspection Results</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-zinc-500 text-[10px]">Dispatched Cases:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{csg.total_cases?.toLocaleString()} cs</span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-zinc-500 text-[10px]">Transit Breakage:</span>
                  <span className="font-bold text-emerald-500">0 Bottles (0.00% Zero-Loss)</span>
                </div>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-zinc-500 text-[10px]">Net Restocked:</span>
                  <span className="font-bold text-orange-500">{csg.total_cases?.toLocaleString()} cs to {csg.depot_name}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Official Goods Receipt Note</div>
                <div className="font-bold text-emerald-500 mt-1 text-sm">{grnNo}</div>
                <div className="text-zinc-500 text-[10px] mt-1">
                  Receiving Depot: {csg.depot_name}{csg.wholesale_unit && !csg.depot_name?.toLowerCase().includes(csg.wholesale_unit.toLowerCase()) ? ` (${csg.wholesale_unit})` : ''}
                </div>
                <div className="text-zinc-400 text-[10px] mt-0.5">
                  Depot Buffer Stock Credited in Database
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#101014]">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Fortnightly Treasury Payout</div>
                <div className="font-bold text-zinc-900 dark:text-white mt-1 text-sm">
                  ₹{csg.total_value?.toLocaleString()}
                </div>
                <div className="text-zinc-500 text-[10px] mt-1">
                  Treasury Voucher: {settlementRef}
                </div>
                <div className="text-emerald-500 text-[10px] font-semibold mt-0.5 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {isReceived ? 'Disbursed via Escrow Treasury Account' : 'Pre-approved by State Treasury'}
                </div>
              </div>
            </div>

            {/* Click Action Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                {isReceived ? '✓ Consignment 100% completed, GRN registered, and fortnight payout disbursed.' : 'Action Required: Sign GRN, credit live depot buffer stock, and release fortnight payment.'}
              </span>
              <button
                onClick={handleStage5SignGRN}
                disabled={actionLoading || isReceived}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                  isReceived 
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isReceived ? 'GRN Signed & Settlement Disbursed ✓' : 'Sign GRN & Disburse Fortnight Settlement'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

