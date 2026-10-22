import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Maximize2, 
  Minimize2, 
  Bell, 
  Clock, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  Truck, 
  Factory, 
  Warehouse, 
  Store, 
  Layers, 
  Send, 
  Users, 
  Briefcase, 
  Check, 
  X,
  Filter
} from 'lucide-react';
import { fetchMetrics, fetchSupplierConsignments, fetchOrders } from '../services/api';

export function Dashboard({ portalMode = 'manufacturing', onNavigate, currentUser, theme, onToggleTheme }) {
  // Mode toggle between:
  // 'talent': Exact data and labels as shown in the screenshot
  // 'supply': Adapted to TASMAC statewide supply chain & logistics telemetry
  const [dataView, setDataView] = useState('talent');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nudgeSuccess, setNudgeSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live backend metrics
  const [backendMetrics, setBackendMetrics] = useState(null);
  const [backendConsignments, setBackendConsignments] = useState([]);
  const [backendOrders, setBackendOrders] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [metricsRes, consignmentsRes, ordersRes] = await Promise.allSettled([
          fetchMetrics(),
          fetchSupplierConsignments(),
          fetchOrders()
        ]);

        if (isMounted) {
          if (metricsRes.status === 'fulfilled') setBackendMetrics(metricsRes.value);
          if (consignmentsRes.status === 'fulfilled') setBackendConsignments(consignmentsRes.value);
          if (ordersRes.status === 'fulfilled') setBackendOrders(ordersRes.value);
        }
      } catch (err) {
        console.error('Error fetching dashboard telemetry:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Handle Nudge Team action
  const handleNudge = (name) => {
    setNudgeSuccess(name);
    setTimeout(() => {
      setNudgeSuccess(null);
    }, 3500);
  };

  // Dataset 1: Exact Talent/Recruitment data from the uploaded image
  const talentData = {
    kpis: [
      {
        title: 'Open Openings',
        value: '7',
        badgeText: '+2 this month',
        badgeHighlight: true
      },
      {
        title: 'Active Candidates',
        value: '24',
        subText: 'In recruitment'
      },
      {
        title: 'On-Hold Openings',
        value: '0',
        subText: 'All active'
      },
      {
        title: 'Onboarding Progress',
        value: '50%',
        subText: '6 of 12 tasks'
      }
    ],
    pipeline: {
      title: 'Active Pipeline Throughput',
      actionLabel: 'View pipeline',
      stages: [
        { id: 1, step: '1. Sourced', percent: '13%', count: '3', label: 'candidates', width: '13%', barColor: 'bg-zinc-300 dark:bg-zinc-700' },
        { id: 2, step: '2. Mgr Review', percent: '13%', count: '3', label: 'in review', width: '13%', barColor: 'bg-zinc-400 dark:bg-zinc-600' },
        { id: 3, step: '3. Interview', percent: '17%', count: '4', label: 'rounds', width: '17%', barColor: 'bg-zinc-600 dark:bg-zinc-500' },
        { id: 4, step: '4. Offer', percent: '29%', count: '7', label: 'extended', width: '29%', barColor: 'bg-zinc-800 dark:bg-zinc-400' },
        { id: 5, step: '5. Joined', percent: '13%', count: '3', label: 'hired', width: '13%', barColor: 'bg-orange-600' }
      ],
      footerLeft: 'Talent acquisition progression',
      footerRight: '3 hires finalized (13% conversion)'
    },
    onboarding: {
      title: 'Onboarding Readiness',
      actionLabel: 'View checklist',
      progressTitle: 'Task Completion',
      progressValue: '6 / 12 tasks (50%)',
      progressPercent: 50,
      sectionTitle: 'INCOMING HIRES',
      activeCount: '10 active',
      hires: [
        {
          id: 1,
          initials: 'AD',
          name: 'Aditi Verma',
          role: 'Senior Software Engineer'
        },
        {
          id: 2,
          initials: 'HA',
          name: 'Harsh Vardhan',
          role: 'Senior PM'
        }
      ]
    },
    watchlist: [
      {
        id: 1,
        initials: 'AB',
        name: 'Abhishek Sinha',
        sub: 'Frontend Tech Lead',
        stage: 'Interview',
        slaStatus: 'Action required',
        noticePeriod: '30 Days'
      },
      {
        id: 2,
        initials: 'AN',
        name: 'Anish Kapoor',
        sub: 'Product Designer',
        stage: 'Shared with Manager',
        slaStatus: 'Action required',
        noticePeriod: '15 Days'
      },
      {
        id: 3,
        initials: 'AM',
        name: 'Amit Choudhury',
        sub: 'Data Analyst',
        stage: 'Shared with Manager',
        slaStatus: 'Action required',
        noticePeriod: '60 Days'
      }
    ]
  };

  // Dataset 2: TASMAC Supply Chain & Logistics Operations
  const supplyData = {
    kpis: [
      {
        title: 'Active Consignments',
        value: backendConsignments.length > 0 ? String(backendConsignments.length) : '7',
        badgeText: '+2 today',
        badgeHighlight: true
      },
      {
        title: 'Active Depots & Vends',
        value: backendMetrics ? String(backendMetrics.total_depots + backendMetrics.total_shops) : '24',
        subText: 'In distribution'
      },
      {
        title: 'Bottlenecks / Delays',
        value: '0',
        subText: 'All active'
      },
      {
        title: 'Fulfillment Rate',
        value: '94%',
        subText: '42 of 45 dispatches'
      }
    ],
    pipeline: {
      title: 'Supply Chain Pipeline Throughput',
      actionLabel: 'View consignments',
      stages: [
        { id: 1, step: '1. Distiller Dispatch', percent: '15%', count: '3', label: 'consignments', width: '15%', barColor: 'bg-zinc-300 dark:bg-zinc-700' },
        { id: 2, step: '2. Transit Route', percent: '20%', count: '3', label: 'in transit', width: '20%', barColor: 'bg-zinc-400 dark:bg-zinc-600' },
        { id: 3, step: '3. GRN Review', percent: '18%', count: '4', label: 'at depot', width: '18%', barColor: 'bg-zinc-600 dark:bg-zinc-500' },
        { id: 4, step: '4. Depot Stock', percent: '32%', count: '7', label: 'allocated', width: '32%', barColor: 'bg-zinc-800 dark:bg-zinc-400' },
        { id: 5, step: '5. Vend Delivered', percent: '15%', count: '3', label: 'delivered', width: '15%', barColor: 'bg-orange-600' }
      ],
      footerLeft: 'Statewide supply chain progression',
      footerRight: '3 consignments finalized (15% conversion)'
    },
    onboarding: {
      title: 'Dispatch & Depot Readiness',
      actionLabel: 'View dispatches',
      progressTitle: 'GRN Verification Progress',
      progressValue: '8 / 10 batches (80%)',
      progressPercent: 80,
      sectionTitle: 'INCOMING CONSIGNMENTS',
      activeCount: '10 active',
      hires: [
        {
          id: 1,
          initials: 'MB',
          name: 'Mohan Breweries Ltd.',
          role: 'Consignment CSG-2026/8802 • 350 Cases'
        },
        {
          id: 2,
          initials: 'SN',
          name: 'SNJ Breweries & Distilleries',
          role: 'Consignment CSG-2026/8803 • 450 Cases'
        }
      ]
    },
    watchlist: [
      {
        id: 1,
        initials: 'UB',
        name: 'United Breweries (Chennai Depot)',
        sub: 'Consignment CSG-2026/8801 • Bacardi',
        stage: 'Gate Verification',
        slaStatus: 'Action required',
        noticePeriod: '30 Mins'
      },
      {
        id: 2,
        initials: 'MB',
        name: 'Mohan Breweries (Coimbatore Depot)',
        sub: 'Consignment CSG-2026/8802 • Chivas Regal',
        stage: 'In Transit',
        slaStatus: 'Action required',
        noticePeriod: '15 Mins'
      },
      {
        id: 3,
        initials: 'JD',
        name: 'John Distilleries (Salem Central)',
        sub: 'Consignment CSG-2026/8804 • Eight PM',
        stage: 'GRN Pending',
        slaStatus: 'Action required',
        noticePeriod: '60 Mins'
      }
    ]
  };

  const activeData = dataView === 'talent' ? talentData : supplyData;

  // Filter watchlist rows based on search
  const filteredWatchlist = useMemo(() => {
    if (!searchQuery.trim()) return activeData.watchlist;
    const q = searchQuery.toLowerCase();
    return activeData.watchlist.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.sub.toLowerCase().includes(q) ||
        item.stage.toLowerCase().includes(q)
    );
  }, [activeData, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 font-sans select-none animate-fadeIn">
      {/* Toast Alert for Nudge Action */}
      {nudgeSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-2xl border border-zinc-700 dark:border-zinc-200 flex items-center gap-3 animate-slideDown">
          <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
          <div>
            <p className="text-xs font-bold">Nudge Dispatched Successfully</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600">
              Notification &amp; SLA alert sent to the assigned supervisor for <span className="font-semibold text-white dark:text-black">{nudgeSuccess}</span>.
            </p>
          </div>
          <button 
            onClick={() => setNudgeSuccess(null)}
            className="ml-2 text-zinc-400 hover:text-white dark:hover:text-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Row matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Dashboard
          </h1>
          {/* Subtle Live Status Indicator */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Right Action Icons matching screenshot */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Perspective Switcher Pill */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs">
            <button
              onClick={() => setDataView('talent')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                dataView === 'talent'
                  ? 'bg-white dark:bg-[#161616] text-orange-600 dark:text-orange-400 shadow-sm border border-zinc-200 dark:border-white/10'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              title="Talent & Operations View (Matches Mockup)"
            >
              <Users className="w-3 h-3" />
              <span>Talent &amp; SLA</span>
            </button>
            <button
              onClick={() => setDataView('supply')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                dataView === 'supply'
                  ? 'bg-white dark:bg-[#161616] text-orange-600 dark:text-orange-400 shadow-sm border border-zinc-200 dark:border-white/10'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              title="Statewide Supply Chain &amp; Logistics View"
            >
              <Truck className="w-3 h-3" />
              <span>Supply Chain</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-zinc-300 dark:bg-white/10 hidden sm:block" />

          {/* Search Trigger */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 outline-none text-xs text-zinc-900 dark:text-white placeholder-zinc-400 w-24 sm:w-32 focus:w-40 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-zinc-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Fullscreen Toggle Icon */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 p-3 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl z-50 animate-slideDown">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-white/5 mb-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">Active Alerts &amp; SLAs</span>
                  <span className="text-[10px] text-orange-500 font-bold uppercase font-mono">3 New</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-white/5">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">SLA Action Required</p>
                    <p className="text-[11px] text-zinc-500">Abhishek Sinha (Frontend Tech Lead) reached 30 days notice deadline.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-white/5">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">GRN Verification Cleared</p>
                    <p className="text-[11px] text-zinc-500">Salem Central Supply Depot verified 500 cases of Eight PM.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Avatar Icon */}
          <div 
            className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center border border-zinc-300 dark:border-zinc-700 shadow-sm cursor-pointer"
            title={currentUser?.role || 'Admin'}
          >
            PS
          </div>
        </div>
      </div>

      {/* Row 1: 4 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {activeData.kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#101010] border border-zinc-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-200 flex flex-col justify-between h-28"
          >
            {/* Title */}
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {kpi.title}
            </div>

            {/* Bottom Row: Big Bold Metric + Subtext/Badge */}
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-mono">
                {kpi.value}
              </span>

              {kpi.badgeText && (
                <span
                  className={`text-xs font-semibold font-mono ${
                    kpi.badgeHighlight
                      ? 'text-orange-600 dark:text-orange-500'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {kpi.badgeText}
                </span>
              )}

              {kpi.subText && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {kpi.subText}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Active Pipeline Throughput (Left) & Onboarding Readiness (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left Card: Active Pipeline Throughput (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#101010] border border-zinc-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                {activeData.pipeline.title}
              </h2>
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(dataView === 'talent' ? 'suppliers' : 'orders');
                  }
                }}
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 transition cursor-pointer group"
              >
                <span>{activeData.pipeline.actionLabel}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* 5 Horizontal Pipeline Stage Columns */}
            <div className="grid grid-cols-5 divide-x divide-zinc-100 dark:divide-white/5 py-4 my-2">
              {activeData.pipeline.stages.map((stg) => (
                <div key={stg.id} className="px-2.5 sm:px-3 first:pl-0 last:pr-0 flex flex-col justify-between">
                  {/* Top Stage Name & Percentage */}
                  <div className="flex items-center justify-between gap-1 text-[11px] mb-2 font-mono">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {stg.step}
                    </span>
                    <span className="text-zinc-400 dark:text-zinc-500 font-medium">
                      {stg.percent}
                    </span>
                  </div>

                  {/* Stage Count & Label */}
                  <div className="flex items-baseline gap-1.5 my-1">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">
                      {stg.count}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                      {stg.label}
                    </span>
                  </div>

                  {/* Underline Indicator */}
                  <div className="w-full bg-zinc-100 dark:bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
                    <div className={`h-full rounded-full ${stg.barColor}`} style={{ width: '45%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Segmented Progress Bar & Footer */}
          <div className="pt-4 border-t border-zinc-100 dark:border-white/5">
            {/* Connected Stacked Progress Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden flex gap-0.5 bg-zinc-100 dark:bg-white/5 mb-3">
              <div className="bg-zinc-300 dark:bg-zinc-700 h-full" style={{ width: '13%' }} />
              <div className="bg-zinc-400 dark:bg-zinc-600 h-full" style={{ width: '13%' }} />
              <div className="bg-zinc-600 dark:bg-zinc-500 h-full" style={{ width: '17%' }} />
              <div className="bg-zinc-800 dark:bg-zinc-400 h-full" style={{ width: '29%' }} />
              <div className="bg-orange-600 h-full" style={{ width: '13%' }} />
            </div>

            {/* Subtext Under the Stacked Bar */}
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span>{activeData.pipeline.footerLeft}</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">
                {activeData.pipeline.footerRight}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Onboarding Readiness (1/3 width) */}
        <div className="lg:col-span-1 bg-white dark:bg-[#101010] border border-zinc-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                {activeData.onboarding.title}
              </h2>
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(dataView === 'talent' ? 'depots' : 'inventory');
                  }
                }}
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 transition cursor-pointer group"
              >
                <span>{activeData.onboarding.actionLabel}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Task Completion Progress */}
            <div className="py-2 mb-4">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-zinc-700 dark:text-zinc-300">
                  {activeData.onboarding.progressTitle}
                </span>
                <span className="font-mono text-zinc-900 dark:text-white">
                  {activeData.onboarding.progressValue}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-orange-600 rounded-full transition-all duration-500"
                  style={{ width: `${activeData.onboarding.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Sub-Header: INCOMING HIRES */}
            <div className="flex items-center justify-between pt-2 pb-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                {activeData.onboarding.sectionTitle}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {activeData.onboarding.activeCount}
              </span>
            </div>

            {/* List of Incoming Hires / Consignments */}
            <div className="space-y-3">
              {activeData.onboarding.hires.map((hire) => (
                <div key={hire.id} className="flex items-center justify-between py-1 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 font-bold text-xs font-mono flex items-center justify-center shrink-0 border border-zinc-200 dark:border-white/5">
                      {hire.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {hire.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium shrink-0 ml-2">
                    {hire.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Full-Width SLA Watchlist Table */}
      <div className="bg-white dark:bg-[#101010] border border-zinc-200/80 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
              SLA Watchlist
            </h2>
            {searchQuery && (
              <span className="text-xs text-zinc-400 font-mono">
                ({filteredWatchlist.length} match{filteredWatchlist.length !== 1 ? 'es' : ''})
              </span>
            )}
          </div>
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate(dataView === 'talent' ? 'suppliers' : 'orders');
              }
            }}
            className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 transition cursor-pointer group"
          >
            <span>{dataView === 'talent' ? 'View all candidates' : 'View all consignments'}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-white/5 text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                <th className="py-3.5 px-4 font-semibold">Candidate</th>
                <th className="py-3.5 px-4 font-semibold text-center sm:text-left">Current Stage</th>
                <th className="py-3.5 px-4 font-semibold">SLA Status</th>
                <th className="py-3.5 px-4 font-semibold">Notice Period</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5 text-xs">
              {filteredWatchlist.map((row) => (
                <tr 
                  key={row.id}
                  className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {/* Candidate / Entity */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 font-bold text-xs font-mono flex items-center justify-center shrink-0 border border-zinc-200 dark:border-white/5">
                        {row.initials}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white text-xs">
                          {row.name}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {row.sub}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Current Stage */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-white/5 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-white/10">
                      {row.stage}
                    </span>
                  </td>

                  {/* SLA Status */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-medium text-xs">{row.slaStatus}</span>
                    </div>
                  </td>

                  {/* Notice Period */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-sm font-mono text-zinc-800 dark:text-zinc-200">
                      {row.noticePeriod}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleNudge(row.name)}
                      className="text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer hover:underline"
                    >
                      Nudge Team
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
