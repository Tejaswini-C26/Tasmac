import React, { useState } from 'react';
import { 
  Check, 
  ChevronRight, 
  Truck, 
  MapPin, 
  FileCheck, 
  Clock, 
  Building2, 
  Store, 
  Calendar, 
  ShieldCheck, 
  ChevronDown,
  Activity,
  Navigation
} from 'lucide-react';

export function OrderDeliveryTracker({ order }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!order) return null;

  // Format date helper: "16 Oct", "17 Oct"
  const formatDate = (dateInput, addHours = 0) => {
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return '--';
      if (addHours !== 0) {
        d.setHours(d.getHours() + addHours);
      }
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return '--';
    }
  };

  const formatFullDateTime = (dateInput, addHours = 0) => {
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return '--';
      if (addHours !== 0) d.setHours(d.getHours() + addHours);
      return d.toLocaleString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '--';
    }
  };

  const status = (order.status || 'CONFIRMED').toUpperCase().trim();

  // Progress fraction (0.0 to 1.0) along the 4 stages:
  // 0: Ordered (0.0)
  // 1: Shipped (0.33333)
  // 2: Out for Delivery (0.66667)
  // 3: Delivery (1.0)
  let progressFraction = 0;
  let currentStageIndex = 0;
  let locationTitle = 'Wholesale Depot';
  let locationSubtitle = 'Order Earmarked';

  const depotName = order.depot_name || 'Central Wholesale Depot';
  const depotShort = depotName.replace(/Wholesale\s+Depot/i, '').trim();
  const shopName = order.shop_name || 'TASMAC Vend';
  const shopShort = shopName.replace(/TASMAC\s+/i, '').split('#')[0].trim();
  const vehicleNo = order.vehicle_no || 'TN 07 NO 3188';

  if (status === 'CONFIRMED') {
    progressFraction = 0;
    currentStageIndex = 0;
    locationTitle = `${depotShort} Depot`;
    locationSubtitle = 'Gate Clearance Pending';
  } else if (status === 'DISPATCHED') {
    progressFraction = 0.33333;
    currentStageIndex = 1;
    locationTitle = `${depotShort} Depot Gate`;
    locationSubtitle = 'State Transit Pass Cleared';
  } else if (status === 'IN_TRANSIT') {
    progressFraction = 0.66667;
    currentStageIndex = 2;
    locationTitle = `${vehicleNo.split(' ').slice(0, 2).join(' ')} En Route`;
    locationSubtitle = `Highway Transit to ${shopShort}`;
  } else if (status === 'DELIVERED') {
    progressFraction = 1.0;
    currentStageIndex = 3;
    locationTitle = `${shopShort}`;
    locationSubtitle = 'Delivered & Stocked In';
  }

  // Dynamic clamping to ensure the tooltip NEVER overflows the container edges
  let tooltipTranslate = '-translate-x-1/2';
  let pointerAlign = 'mx-auto';

  if (progressFraction >= 0.85) {
    // Near right edge (Delivery node): shift card leftward so it never clips the right boundary
    tooltipTranslate = '-translate-x-[calc(100%-20px)]';
    pointerAlign = 'ml-auto mr-4';
  } else if (progressFraction <= 0.15) {
    // Near left edge (Ordered node): shift card rightward so it never clips the left boundary
    tooltipTranslate = '-translate-x-[20px]';
    pointerAlign = 'mr-auto ml-4';
  }

  // Dates for each milestone
  const createdAt = order.created_at || new Date().toISOString();
  const expectedDelivery = order.expected_delivery || new Date(new Date().getTime() + 24 * 3600000).toISOString();

  const stages = [
    {
      id: 'ordered',
      label: 'Ordered',
      subLabel: 'Indent Confirmed',
      date: formatDate(createdAt, 0),
      fullDate: formatFullDateTime(createdAt, 0),
      isCompleted: true,
      desc: 'Indent confirmed and warehouse cases reserved'
    },
    {
      id: 'shipped',
      label: 'Shipped',
      subLabel: 'Gate Pass Cleared',
      date: formatDate(createdAt, 6),
      fullDate: formatFullDateTime(createdAt, 6),
      isCompleted: ['DISPATCHED', 'IN_TRANSIT', 'DELIVERED'].includes(status),
      desc: `State Transit Pass issued at ${depotShort} Depot`
    },
    {
      id: 'out_for_delivery',
      label: 'Out for Delivery',
      subLabel: 'Highway Transit',
      date: formatDate(expectedDelivery, -3),
      fullDate: formatFullDateTime(expectedDelivery, -3),
      isCompleted: ['IN_TRANSIT', 'DELIVERED'].includes(status),
      desc: `Logistics Carrier ${vehicleNo} heading to retail vend`
    },
    {
      id: 'delivery',
      label: 'Delivery',
      subLabel: 'Vend Stockroom',
      date: formatDate(expectedDelivery, 0),
      fullDate: formatFullDateTime(expectedDelivery, 0),
      isCompleted: status === 'DELIVERED',
      desc: `Cases checked and restocked into ${shopShort}`
    }
  ];

  return (
    <div className="w-full bg-white dark:bg-[#000000] rounded-xl p-4 sm:p-5 border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.7)] space-y-4 my-2 print:hidden relative overflow-hidden transition-colors">
      {/* Ambient Backlight Glow (Dark mode only) */}
      
      {/* Top Edge Metallic Highlight (Dark mode only) */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent hidden dark:block" />

      {/* Telemetry Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-white/[0.06] text-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          </span>
          <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-zinc-800 dark:text-zinc-200">
            {status === 'DELIVERED' ? 'Delivery Completed & Restocked' : 'Live Fleet Telemetry'}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
            <FileCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            <span>e-TP #{order.transit_pass_no || '76389'}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500">Carrier Unit: </span>
            <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">{vehicleNo}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="py-1 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>{showDetails ? 'Hide Details' : 'Telemetry HUD'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDetails ? 'rotate-180 text-orange-500' : 'text-zinc-400 dark:text-zinc-400'}`} />
          </button>
        </div>
      </div>

      {/* Stepper Track Area */}
      <div className="relative pt-16 pb-4 select-none px-4">
        {/* Inactive Rail Background Line spanning exactly from center of Node 0 to center of Node 3 (56px from each edge) */}
        <div 
          className="absolute top-[80px] left-[56px] right-[56px] h-1.5 bg-zinc-200 dark:bg-[#181a24] rounded-full z-0 border border-zinc-300/50 dark:border-white/[0.04]" 
        />

        {/* Completed Emerald Progress Line */}
        <div 
          className="absolute top-[80px] left-[56px] h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 rounded-full z-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
          style={{ width: `calc((100% - 112px) * ${progressFraction})` }}
        />

        {/* Floating Tooltip HUD Card above the Carrier */}
        <div 
          className={`absolute top-[22px] z-30 pointer-events-auto ${tooltipTranslate}`}
          style={{ 
            left: `calc(56px + (100% - 112px) * ${progressFraction})` 
          }}
        >
          {/* Compact Orange Pill Card */}
          <div className="tracker-orange-card relative bg-[#EA580C] text-white border border-[#EA580C] shadow-md shadow-orange-600/30 rounded-lg px-3 py-1 whitespace-nowrap flex flex-col items-center overflow-hidden" style={{ backgroundColor: "#EA580C", color: "#ffffff" }}>
            {/* Top row: White Status Pip + Bold Monospace Location */}
            <div className="relative z-10 flex items-center gap-1.5 w-full justify-center">
              <span className="inline-flex rounded-full h-1.5 w-1.5 bg-white shadow-[0_0_4px_#ffffff] shrink-0" />
              <span className="font-bold text-[11px] tracking-tight text-white !text-white font-mono whitespace-nowrap" style={{ color: "#ffffff" }}>
                {locationTitle || shopShort}
              </span>
            </div>

            {/* Sub-action */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className="relative z-10 text-[9px] text-white/90 hover:text-white flex items-center gap-0.5 mt-0.5 transition cursor-pointer font-mono group" style={{ color: "#ffffff" }}
            >
              <span className="group-hover:underline decoration-white/70" style={{ color: "#ffffff" }}>
                View Details
              </span>
              <ChevronRight className="w-2.5 h-2.5 text-white/90 group-hover:translate-x-0.5 transition-transform" style={{ color: "#ffffff" }} />
            </button>
          </div>

          {/* Downward Pointer Triangle matching the bottom orange tone */}
          <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] -mt-px filter drop-shadow-[0_1px_1px_rgba(234,88,12,0.4)] ${pointerAlign}`} style={{ borderTopColor: "#EA580C" }} />
        </div>

        

        {/* 4 Milestones Dots & Labels */}
        <div className="relative flex items-start justify-between z-10">
          {stages.map((stage, idx) => {
            const isCompleted = stage.isCompleted;
            const isCurrent = currentStageIndex === idx;

            return (
              <div 
                key={stage.id} 
                className="w-20 flex flex-col items-center text-center cursor-pointer group select-none shrink-0"
                onClick={() => setShowDetails(!showDetails)}
              >
                {/* Milestone Circle - Travel icon occupies the whole circle */}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm relative ${
                    isCurrent || isCompleted
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30'
                      : 'bg-zinc-100 dark:bg-[#13151f] border border-zinc-300 dark:border-white/10 text-zinc-400 dark:text-zinc-500'
                  }`}
                  style={isCurrent || isCompleted ? { color: "#ffffff" } : undefined}
                >
                  {isCurrent ? (
                    <Truck className="w-5 h-5 text-white drop-shadow-sm" strokeWidth={2.2} style={{ color: "#ffffff" }} />
                  ) : isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3] text-white" style={{ color: "#ffffff", stroke: "#ffffff" }} />
                  ) : (
                    <span className="text-[11px] font-mono font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Milestone Labels below */}
                <div className="mt-2.5 space-y-0.5 w-full">
                  <p className={`text-xs font-semibold tracking-tight transition-colors truncate ${
                    isCompleted 
                      ? 'text-zinc-900 dark:text-white' 
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}>
                    {stage.label}
                  </p>
                  <p className={`text-[11px] font-mono ${
                    isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400/90 font-medium'
                      : 'text-zinc-400 dark:text-zinc-600'
                  }`}>
                    {stage.date}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono hidden sm:block truncate">
                    {stage.subLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Logistics Details Drawer */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/[0.06] bg-zinc-50/80 dark:bg-[#080808] rounded-xl p-4 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Logistics Dispatch Journey &bull; {order.order_no}</span>
            </span>
            <button
              onClick={() => setShowDetails(false)}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-mono cursor-pointer transition"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white dark:bg-[#0f1117] p-3 rounded-lg border border-zinc-200 dark:border-white/[0.06] space-y-1.5 shadow-sm">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span>Origin Wholesale Depot</span>
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">{order.depot_name}</p>
              <p className="text-zinc-500 dark:text-zinc-500 text-[10px]">
                State Transit Pass (e-TP): <strong className="text-zinc-800 dark:text-zinc-300 font-mono">{order.transit_pass_no || 'Authorized'}</strong>
              </p>
            </div>

            <div className="bg-white dark:bg-[#0f1117] p-3 rounded-lg border border-zinc-200 dark:border-white/[0.06] space-y-1.5 shadow-sm">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Destination Retail Shop</span>
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">{order.shop_name}</p>
              <p className="text-zinc-500 dark:text-zinc-500 text-[10px]">
                Assigned Carrier: <strong className="text-zinc-800 dark:text-zinc-300 font-mono">{order.vehicle_no || 'TN 07 NO 3188'}</strong>
              </p>
            </div>
          </div>

          {/* Chronological Event Milestones */}
          <div className="pt-2 border-t border-zinc-200/60 dark:border-white/[0.06] space-y-2">
            <p className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-500 font-bold">Fulfillment Timeline Milestones</p>
            <div className="space-y-1.5">
              {stages.map((stg) => (
                <div key={stg.id} className="flex items-start gap-2.5 text-xs">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] mt-0.5 shrink-0 ${
                    stg.isCompleted 
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold' 
                      : 'bg-zinc-200 dark:bg-[#161820] text-zinc-400 dark:text-zinc-600 border border-zinc-300 dark:border-white/5'
                  }`}>
                    {stg.isCompleted ? '✓' : '○'}
                  </span>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div>
                      <strong className={`font-medium ${stg.isCompleted ? 'text-zinc-900 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {stg.label}
                      </strong>
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px] ml-2">&bull; {stg.desc}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 shrink-0">
                      {stg.fullDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
