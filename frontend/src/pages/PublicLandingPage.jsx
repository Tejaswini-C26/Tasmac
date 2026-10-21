import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Factory, 
  Warehouse, 
  Store, 
  Truck, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  Monitor, 
  Smartphone, 
  Sparkles, 
  RefreshCw, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  Layers, 
  Lock, 
  LogIn, 
  ExternalLink,
  ChevronDown,
  FileText,
  BadgeCheck,
  Check,
  Users,
  Compass,
  Boxes,
  Zap
} from 'lucide-react';

const STATS_DATA = [
  { label: 'Active Distilleries & Breweries', value: '12', sub: 'Licensed across Tamil Nadu', icon: Factory },
  { label: 'Regional Wholesale Depots', value: '5', sub: 'Buffer storage network', icon: Warehouse },
  { label: 'Retail Vend Shops', value: '4,800+', sub: 'Real-time stockroom telemetry', icon: Store },
  { label: 'Depot Buffer Capacity', value: '76,387', sub: 'Cases in active reserve', icon: Boxes },
  { label: 'Digital Transit Compliance', value: '100%', sub: 'Tamper-evident e-Pass', icon: ShieldCheck }
];

const PREVIEW_TABS = [
  { id: 'inward', label: '1. Distillery Inward', icon: Factory },
  { id: 'depots', label: '2. Wholesale Depots', icon: Warehouse },
  { id: 'vends', label: '3. Retail Vend Telemetry', icon: Store },
  { id: 'epass', label: '4. Excise Transit e-Pass', icon: QrCode }
];

const SAMPLE_BRANDS = [
  {
    name: 'Kingfisher Premium Lager',
    category: 'BEER',
    pack: '650ml Bottle',
    supplier: 'United Breweries Ltd.',
    exFactory: '₹72.50',
    excise: '₹38.20',
    wholesale: '₹124.00',
    mrp: '₹160.00',
    img: '/brands/kingfisher-premium.jpg',
    badge: 'State Leader'
  },
  {
    name: 'Old Monk Supreme XXX Rum',
    category: 'RUM',
    pack: '750ml Bottle',
    supplier: 'Mohan Breweries & Distilleries',
    exFactory: '₹84.00',
    excise: '₹46.50',
    wholesale: '₹142.00',
    mrp: '₹180.00',
    img: '/brands/old-monk-rum.jpg',
    badge: 'High Velocity'
  },
  {
    name: 'Mansion House French Brandy',
    category: 'BRANDY',
    pack: '750ml Bottle',
    supplier: 'Empee Distilleries Ltd.',
    exFactory: '₹98.00',
    excise: '₹54.00',
    wholesale: '₹168.00',
    mrp: '₹210.00',
    img: '/brands/mansion-house.jpg',
    badge: 'Popular Choice'
  },
  {
    name: 'Magic Moments Grain Vodka',
    category: 'VODKA',
    pack: '750ml Bottle',
    supplier: 'John Distilleries Pvt. Ltd.',
    exFactory: '₹92.00',
    excise: '₹50.00',
    wholesale: '₹154.00',
    mrp: '₹195.00',
    img: '/brands/magic-moments.jpg',
    badge: 'Verified Batch'
  },
  {
    name: 'Sula Shiraz Cabernet',
    category: 'WINE',
    pack: '750ml Bottle',
    supplier: 'Sula Vineyards Pvt. Ltd.',
    exFactory: '₹410.00',
    excise: '₹220.00',
    wholesale: '₹695.00',
    mrp: '₹850.00',
    img: '/brands/sula-shiraz.jpg',
    badge: 'Premium Cellar'
  },
  {
    name: 'British Empire Ultra Beer',
    category: 'BEER',
    pack: '650ml Bottle',
    supplier: 'SNJ Breweries & Distilleries',
    exFactory: '₹82.00',
    excise: '₹44.00',
    wholesale: '₹138.00',
    mrp: '₹175.00',
    img: '/brands/british-empire.jpg',
    badge: 'High Inward'
  }
];

const ROLES_DATA = [
  {
    id: 'distillery',
    title: 'Distillery & Brewery Partner',
    stage: 'suppliers',
    badge: 'Stage 1: Inward Supply',
    icon: Factory,
    desc: 'Register production batches, generate automated GRN permits, and dispatch bulk consignments directly to regional wholesale depots.',
    cta: 'Launch Inward Dispatch'
  },
  {
    id: 'depot',
    title: 'Wholesale Depot Superintendent',
    stage: 'depots',
    badge: 'Stage 2: Regional Depots',
    icon: Warehouse,
    desc: 'Supervise regional buffer warehouse capacity, reconcile inward distillery consignments, and dispatch replenishment orders to retail shops.',
    cta: 'Open Depot Inventory'
  },
  {
    id: 'shop',
    title: 'Retail Vend Shop Supervisor',
    stage: 'inventory',
    badge: 'Stage 3: Store Stockroom',
    icon: Store,
    desc: 'Monitor real-time shelf stock levels, trigger one-click replenishment indents, and track delivery trucks with live transit telemetry.',
    cta: 'Enter Store Stockroom'
  },
  {
    id: 'excise',
    title: 'State Excise Enforcement Wing',
    stage: 'orders',
    badge: 'Stage 5: Orders & Transit',
    icon: ShieldCheck,
    desc: 'Verify digital transit e-Pass credentials, monitor inter-district transport compliance, and prevent unauthorized diversion.',
    cta: 'Audit Transit Orders'
  }
];

export function PublicLandingPage({ 
  onEnterPortal, 
  onOpenLogin, 
  onNavigateToStage,
  installPrompt,
  onInstallApp,
  theme,
  onToggleTheme 
}) {
  const [activePreviewTab, setActivePreviewTab] = useState('inward');
  const [demoIndentSubmitted, setDemoIndentSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Public Header */}
      <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-md border-b border-white/[0.08] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Seal */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-sm">
              TN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">TASMAC</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                  B2B Grid
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:block tracking-wide uppercase">
                Govt. of Tamil Nadu • Wholesale Supply Platform
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
            <a href="#overview" className="hover:text-orange-400 transition-colors">Overview</a>
            <a href="#pipeline" className="hover:text-orange-400 transition-colors">Supply Pipeline</a>
            <a href="#interactive-preview" className="hover:text-orange-400 transition-colors">Live Telemetry</a>
            <a href="#catalog" className="hover:text-orange-400 transition-colors">Brand Catalog</a>
            <a href="#roles" className="hover:text-orange-400 transition-colors">Department Access</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {installPrompt && (
              <button
                onClick={onInstallApp}
                title="Install Progressive Web App on Desktop/Mobile"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-medium border border-white/10 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-orange-400" />
                <span>Install App</span>
              </button>
            )}

            <button
              onClick={() => onOpenLogin()}
              title="Official Department Login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-zinc-300 hover:text-white hover:bg-white/5 border border-white/10 transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-orange-400" />
              <span>Department Login</span>
            </button>

            <button
              onClick={onEnterPortal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold font-mono tracking-wide shadow-lg shadow-orange-600/25 transition cursor-pointer group"
            >
              <span>Launch Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="relative pt-16 pb-20 overflow-hidden border-b border-white/[0.08]">
        {/* Glow ambient background lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Official Gov Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-mono font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>OFFICIAL B2B SUPPLY GRID • TAMIL NADU PROHIBITION & EXCISE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Statewide Wholesale Liquor Distribution & Real-Time Retail Supply Grid
          </h1>

          <p className="mt-6 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Unifying 12 licensed distilleries, 5 regional wholesale buffer depots, and 4,800+ retail vends under a single digital transit framework with automated e-Pass verification and zero-latency stockroom telemetry.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onEnterPortal}
              className="px-7 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-orange-600/30 transition cursor-pointer hover:scale-105"
            >
              Launch Enterprise Grid
            </button>
            <button
              onClick={() => onOpenLogin()}
              className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs sm:text-sm font-semibold border border-white/10 flex items-center gap-2 transition cursor-pointer hover:border-orange-500/40"
            >
              <KeyRound className="w-4 h-4 text-orange-400" />
              <span>Department Login</span>
            </button>
          </div>
        </div>
      </section>

      {/* Official Government Footer */}
      <footer className="py-12 bg-[#000000] text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-xs">
                  TN
                </div>
                <span className="font-extrabold text-white text-sm">TASMAC B2B Grid</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Tamil Nadu State Marketing Corporation Limited. Official wholesale supply & retail indent telemetry platform.
              </p>
            </div>

            <div>
              <div className="font-mono uppercase text-zinc-300 font-bold text-[11px] mb-3">Supply Stages</div>
              <ul className="space-y-2 text-[11px]">
                <li><button onClick={() => onNavigateToStage('suppliers')} className="hover:text-orange-400 transition cursor-pointer">Stage 1: Supplier Inward</button></li>
                <li><button onClick={() => onNavigateToStage('depots')} className="hover:text-orange-400 transition cursor-pointer">Stage 2: Wholesale Depots</button></li>
                <li><button onClick={() => onNavigateToStage('inventory')} className="hover:text-orange-400 transition cursor-pointer">Stage 3: Store Stockroom</button></li>
                <li><button onClick={() => onNavigateToStage('catalog')} className="hover:text-orange-400 transition cursor-pointer">Stage 4: Brand Catalog</button></li>
                <li><button onClick={() => onNavigateToStage('orders')} className="hover:text-orange-400 transition cursor-pointer">Stage 5: Orders & Transit</button></li>
              </ul>
            </div>

            <div>
              <div className="font-mono uppercase text-zinc-300 font-bold text-[11px] mb-3">Regulatory & Acts</div>
              <ul className="space-y-2 text-[11px] text-zinc-400">
                <li>Tamil Nadu Prohibition Act, 1937</li>
                <li>TASMAC Retail Vending Rules, 2003</li>
                <li>Excise Transit e-Pass Regulations</li>
                <li>Barcoding & Hologram Compliance</li>
              </ul>
            </div>

            <div>
              <div className="font-mono uppercase text-zinc-300 font-bold text-[11px] mb-3">Support & Helpline</div>
              <div className="text-[11px] text-zinc-400 space-y-1.5">
                <div>State Control Room: 1800-425-TASMAC</div>
                <div>Technical Support: support@tasmac.tn.gov.in</div>
                <div className="pt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 font-mono text-[10px]">Cloud Grid: 100% Operational</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
            <div>
              &copy; {new Date().getFullYear()} Tamil Nadu State Marketing Corporation (TASMAC). All rights reserved.
            </div>
            <div className="text-zinc-600 font-mono text-[10px]">
              Statutory Warning: Consumption of alcohol is injurious to health. Be safe - Don't drink and drive.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

