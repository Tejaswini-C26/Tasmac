import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Factory, 
  Truck, 
  Warehouse, 
  ClipboardCheck, 
  FileText, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Package, 
  ArrowRight, 
  X, 
  ExternalLink, 
  TrendingUp, 
  BadgePercent,
  Check,
  ChevronDown,
  Beer,
  Wine
} from 'lucide-react';
import { 
  fetchSuppliers, 
  fetchSupplierConsignments, 
  createSupplierConsignment, 
  updateConsignmentStatus, 
  receiveConsignmentGRN, 
  fetchSupplierAnalytics,
  fetchDepots,
  fetchBrands
} from '../services/api';

function AnimatedCategoryShareBar({ item, idx, animate }) {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    if (!animate) {
      setDisplayVal(0);
      return;
    }

    const startDelay = idx * 150;
    const duration = 900;
    let startTimestamp = null;
    let frameId;

    const timeoutId = setTimeout(() => {
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setDisplayVal(Math.round(ease * item.share));
        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        }
      };
      frameId = requestAnimationFrame(step);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [animate, item.share, idx]);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-zinc-800 dark:text-zinc-300 font-medium">{item.cat}</span>
        <span className="text-zinc-900 dark:text-white font-bold">{displayVal}%</span>
      </div>
      <div className="w-full bg-zinc-200 dark:bg-[#000000] h-2 rounded-full overflow-hidden">
        <div
          className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: animate ? `${item.share}%` : '0%',
            transitionDelay: `${idx * 150}ms`,
          }}
        />
      </div>
    </div>
  );
}

function CustomModalSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-10'}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full p-2.5 rounded-md bg-zinc-50 dark:bg-[#000000] border ${
          isOpen ? 'border-orange-500 ring-1 ring-orange-500' : 'border-zinc-200 dark:border-white/10 hover:border-orange-500/60'
        } text-zinc-900 dark:text-white text-xs font-mono flex items-center justify-between text-left focus:outline-none transition-colors cursor-pointer`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 dark:text-zinc-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-orange-500' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/15 rounded-md shadow-2xl p-1 max-h-60 overflow-y-auto space-y-0.5">
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange({ target: { value: opt.value } });
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 rounded text-left text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-orange-500 text-white font-bold shadow-sm'
                    : 'text-zinc-800 dark:text-zinc-200 hover:bg-orange-500 hover:text-white'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SupplierManagement() {
  const [activeTab, setActiveTab] = useState('consignments'); // 'consignments' | 'directory' | 'scorecard'
  const [animateShares, setAnimateShares] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [consignments, setConsignments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [depots, setDepots] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [inspectingConsignment, setInspectingConsignment] = useState(null);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [selectedSupplierForBrands, setSelectedSupplierForBrands] = useState(null);

  // Form states for Dispatch Modal
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formDepotId, setFormDepotId] = useState('');
  const [formBrandId, setFormBrandId] = useState('');
  const [formCases, setFormCases] = useState(500);
  const [formBatchNo, setFormBatchNo] = useState('');
  const [formVehicleNo, setFormVehicleNo] = useState('');
  const [formDriverName, setFormDriverName] = useState('');
  const [formDriverPhone, setFormDriverPhone] = useState('');
  const [formExcisePermit, setFormExcisePermit] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form states for GRN Receipt Modal
  const [grnBreakageBottles, setGrnBreakageBottles] = useState(0);
  const [grnRemarks, setGrnRemarks] = useState('');
  const [grnSubmitting, setGrnSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [supData, csgData, anlData, depData, brdData] = await Promise.all([
        fetchSuppliers(),
        fetchSupplierConsignments(),
        fetchSupplierAnalytics(),
        fetchDepots(),
        fetchBrands()
      ]);

      setSuppliers(supData);
      setConsignments(csgData);
      setAnalytics(anlData);
      setDepots(depData);
      setBrands(brdData);

      if (supData.length > 0 && !formSupplierId) setFormSupplierId(supData[0].id);
      if (depData.length > 0 && !formDepotId) setFormDepotId(depData[0].id);
      if (brdData.length > 0 && !formBrandId) setFormBrandId(brdData[0].id);
    } catch (err) {
      console.error('Failed to load supplier management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'scorecard') {
      setAnimateShares(false);
      const timer = setTimeout(() => {
        setAnimateShares(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimateShares(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isDispatchModalOpen) setIsDispatchModalOpen(false);
        if (isGrnModalOpen) setIsGrnModalOpen(false);
        if (selectedSupplierForBrands) setSelectedSupplierForBrands(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDispatchModalOpen, isGrnModalOpen, selectedSupplierForBrands]);

  const handleCreateConsignment = async (e) => {
    e.preventDefault();
    if (!formSupplierId || !formDepotId || !formBrandId || !formCases) return;

    try {
      setFormSubmitting(true);
      const payload = {
        supplier_id: parseInt(formSupplierId),
        depot_id: parseInt(formDepotId),
        batch_no: formBatchNo || `BTH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        vehicle_no: formVehicleNo || 'TN-04-AB-8821',
        driver_name: formDriverName || 'R. Senthil Kumar',
        driver_phone: formDriverPhone || '+91 98401 99882',
        excise_permit_no: formExcisePermit || `TN-EXC-PRMT-${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`,
        items: [
          {
            brand_id: parseInt(formBrandId),
            cases_dispatched: parseInt(formCases)
          }
        ]
      };

      await createSupplierConsignment(payload);
      setIsDispatchModalOpen(false);
      resetDispatchForm();
      await loadData();
    } catch (err) {
      alert('Error creating consignment: ' + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetDispatchForm = () => {
    setFormBatchNo('');
    setFormVehicleNo('');
    setFormDriverName('');
    setFormDriverPhone('');
    setFormExcisePermit('');
    setFormCases(500);
  };

  const handleStatusTransition = async (csgId, newStatus) => {
    try {
      await updateConsignmentStatus(csgId, newStatus);
      await loadData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleReceiveGRN = async (e) => {
    e.preventDefault();
    if (!inspectingConsignment) return;

    try {
      setGrnSubmitting(true);
      await receiveConsignmentGRN(inspectingConsignment.id, {
        breakage_bottles: parseInt(grnBreakageBottles) || 0,
        remarks: grnRemarks
      });
      setIsGrnModalOpen(false);
      setInspectingConsignment(null);
      setGrnBreakageBottles(0);
      setGrnRemarks('');
      await loadData();
    } catch (err) {
      alert('Error verifying GRN: ' + err.message);
    } finally {
      setGrnSubmitting(false);
    }
  };

  const filteredConsignments = consignments.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNo = c.consignment_no.toLowerCase().includes(q);
      const matchSup = c.supplier_name.toLowerCase().includes(q);
      const matchDep = c.depot_name.toLowerCase().includes(q);
      const matchBatch = c.batch_no?.toLowerCase().includes(q);
      if (!matchNo && !matchSup && !matchDep && !matchBatch) return false;
    }
    return true;
  });

  const activeTrucksCount = consignments.filter(c => c.status === 'IN_TRANSIT' || c.status === 'DISPATCHED').length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Suppliers */}
        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
          <span className="text-xs font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Licensed Suppliers
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            {suppliers.length}
          </div>
        </div>

        {/* Card 2: Inward Cases */}
        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
          <span className="text-xs font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Total Inward Cases
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            {analytics?.total_inward_cases?.toLocaleString() || '1,600'}
          </div>
        </div>

        {/* Card 3: OTIF */}
        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
          <span className="text-xs font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Fulfillment (OTIF)
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {analytics?.otif_percentage || 97.2}%
          </div>
        </div>

        {/* Card 4: Active Trucks */}
        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
          <span className="text-xs font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Active Supply Trucks
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2 flex items-center gap-2.5">
            {activeTrucksCount}
            {activeTrucksCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse inline-block" />
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation & Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 gap-1 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('consignments')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'consignments'
                ? 'bg-orange-500 text-white shadow-sm font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold'
            }`}
          >
            <Truck className="w-4 h-4" />
            Inward Consignments ({consignments.length})
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'directory'
                ? 'bg-orange-500 text-white shadow-sm font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold'
            }`}
          >
            <Factory className="w-4 h-4" />
            Distilleries Directory ({suppliers.length})
          </button>

          <button
            onClick={() => setActiveTab('scorecard')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'scorecard'
                ? 'bg-orange-500 text-white shadow-sm font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold'
            }`}
          >
            <BadgePercent className="w-4 h-4" />
            Supplier Scorecard
          </button>
        </div>

        {/* Action Button: Dispatch Inward Consignment */}
        <button
          onClick={() => setIsDispatchModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs uppercase font-bold tracking-wider shadow-lg shadow-orange-950/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Dispatch Inward Consignment
        </button>
      </div>

      {/* TAB 1: Inward Consignments */}
      {activeTab === 'consignments' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 gap-1 overflow-x-auto max-w-full">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'DISPATCHED', label: 'Dispatched' },
                { key: 'IN_TRANSIT', label: 'In Transit' },
                { key: 'RECEIVED', label: 'Received' },
              ].map((tab) => {
                const active = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-orange-500 text-white shadow-sm font-bold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search consignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Consignments Table */}
          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-zinc-400">
              Loading inward consignments from state network...
            </div>
          ) : filteredConsignments.length === 0 ? (
            <div className="py-16 text-center space-y-2 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-md">
              <Package className="w-10 h-10 mx-auto text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-300">No consignments found</h3>
              <p className="text-xs text-zinc-500">
                Click "+ Dispatch Inward Consignment" above to log a new distillery shipment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010]">
              <table className="w-full text-left text-xs text-zinc-900 dark:text-zinc-300">
                <thead className="bg-zinc-100 dark:bg-[#000000] text-black dark:text-white uppercase text-xs font-mono font-semibold tracking-wider border-b border-zinc-200 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-4">Consignment #</th>
                    <th className="py-3 px-3">Distillery (Supplier)</th>
                    <th className="py-3 px-3">Destination Depot</th>
                    <th className="py-3 px-3">Batch &amp; Permit</th>
                    <th className="py-3 px-3 text-right">Cases</th>
                    <th className="py-3 px-3 text-right">Value (₹)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
                  {filteredConsignments.map((csg) => (
                    <tr key={csg.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition">
                      <td className="py-3 px-4 font-mono font-bold text-orange-500">
                        {csg.consignment_no}
                        <span className="block text-[10px] font-normal text-zinc-500">
                          {new Date(csg.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-zinc-900 dark:text-white">{csg.supplier_name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          Vehicle: {csg.vehicle_no}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <Warehouse className="w-3.5 h-3.5 text-zinc-500" />
                          {csg.depot_name}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div className="text-zinc-700 dark:text-zinc-300 font-semibold">{csg.batch_no}</div>
                        <div className="text-[10px] text-zinc-500 truncate max-w-[140px]">{csg.excise_permit_no}</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                        {csg.total_cases?.toLocaleString()} cs
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-orange-500">
                        ₹{csg.total_value?.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {csg.status === 'DISPATCHED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Truck className="w-3 h-3" />
                            Dispatched
                          </span>
                        )}
                        {csg.status === 'IN_TRANSIT' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            In Transit
                          </span>
                        )}
                        {csg.status === 'RECEIVED' && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              GRN Verified
                            </span>
                            {csg.grn_no && (
                              <span className="block text-[9px] font-mono text-zinc-500">
                                {csg.grn_no}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        {csg.status === 'DISPATCHED' && (
                          <button
                            onClick={() => handleStatusTransition(csg.id, 'IN_TRANSIT')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-mono font-bold transition cursor-pointer"
                          >
                            Mark In Transit
                          </button>
                        )}
                        {csg.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => {
                              setInspectingConsignment(csg);
                              setIsGrnModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-mono font-bold transition cursor-pointer shadow-sm shadow-emerald-950/20"
                          >
                            Inspect &amp; Receive (GRN)
                          </button>
                        )}
                        {csg.status === 'RECEIVED' && (
                          <span className="text-[11px] font-mono text-zinc-500">
                            Breakage: {csg.breakage_bottles || 0} btl
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Distilleries Directory */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] flex flex-col justify-between space-y-4 hover:border-orange-500/50 transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 font-bold">
                      {sup.category}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white mt-1.5">
                      {sup.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded">
                    {sup.supplier_code}
                  </span>
                </div>

                <div className="space-y-2.5 text-sm border-t border-zinc-200 dark:border-white/10 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium text-xs sm:text-[13px]">Excise License:</span>
                    <span className="text-zinc-900 dark:text-white font-bold font-mono text-xs sm:text-[13px]">{sup.excise_license_no}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium text-xs sm:text-[13px]">GSTIN:</span>
                    <span className="text-zinc-900 dark:text-white font-mono text-xs sm:text-[13px] font-semibold">{sup.gstin}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium text-xs sm:text-[13px]">Plant District:</span>
                    <span className="text-zinc-900 dark:text-white font-medium text-xs sm:text-[13px]">{sup.district}, {sup.state}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium text-xs sm:text-[13px]">Contact Person:</span>
                    <span className="text-zinc-900 dark:text-white font-medium text-xs sm:text-[13px]">{sup.contact_person}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium text-xs sm:text-[13px]">Phone:</span>
                    <span className="text-orange-600 dark:text-orange-400 font-semibold font-mono text-xs sm:text-[13px]">{sup.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300">
                  {sup.active_brands_count} Registered Brands
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSupplierForBrands(sup)}
                  className="text-xs font-mono text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1 cursor-pointer hover:underline"
                >
                  View Brands <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Scorecard */}
      {activeTab === 'scorecard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
              <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
                Statutory Compliance
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-normal text-emerald-500 mt-2">
                100%
              </div>
            </div>

            <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
              <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
                Transit Breakage Rate
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-normal text-zinc-900 dark:text-white mt-2">
                {analytics?.breakage_percentage || 0.08}%
              </div>
            </div>

            <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all">
              <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
                Average Depot Turnaround
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-normal text-orange-500 mt-2">
                14.2 hrs
              </div>
            </div>
          </div>

          <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] space-y-3">
            <h3 className="text-sm font-bold font-mono text-zinc-900 dark:text-white uppercase tracking-wider">
              Supplier Inward Share by Category
            </h3>
            <div className="space-y-3">
              {[
                { cat: 'Breweries (Beer)', share: 45, color: 'bg-amber-500' },
                { cat: 'Distilleries (IMFL Spirits)', share: 38, color: 'bg-orange-500' },
                { cat: 'Wineries (Wine)', share: 10, color: 'bg-purple-500' },
                { cat: 'Bonded Cellars (Imported)', share: 7, color: 'bg-emerald-500' },
              ].map((item, idx) => (
                <AnimatedCategoryShareBar
                  key={item.cat}
                  item={item}
                  idx={idx}
                  animate={animateShares}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Dispatch New Inward Consignment */}
      {isDispatchModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsDispatchModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/15 rounded-md w-full max-w-xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
              <div>
                <span className="text-[10px] font-mono text-orange-500 uppercase tracking-wider font-bold">
                  Upstream Inward Dispatch
                </span>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Dispatch Distillery Consignment
                </h2>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateConsignment} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Supplier */}
                <div>
                  <label className="block text-zinc-500 mb-1">
                    Manufacturing Supplier <span className="text-orange-500">*</span>
                  </label>
                  <CustomModalSelect
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    options={suppliers.map((s) => ({
                      value: s.id,
                      label: `${s.name} (${s.category})`,
                    }))}
                    placeholder="Select Supplier"
                  />
                </div>

                {/* Receiving Depot */}
                <div>
                  <label className="block text-zinc-500 mb-1">
                    Destination Depot <span className="text-orange-500">*</span>
                  </label>
                  <CustomModalSelect
                    value={formDepotId}
                    onChange={(e) => setFormDepotId(e.target.value)}
                    options={depots.map((d) => ({
                      value: d.id,
                      label: `${d.name} (${d.region})`,
                    }))}
                    placeholder="Select Depot"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-zinc-500 mb-1">
                    Brand SKU <span className="text-orange-500">*</span>
                  </label>
                  <CustomModalSelect
                    value={formBrandId}
                    onChange={(e) => setFormBrandId(e.target.value)}
                    options={brands.map((b) => ({
                      value: b.id,
                      label: `${b.name} (${b.pack_size})`,
                    }))}
                    placeholder="Select Brand SKU"
                  />
                </div>

                {/* Cases */}
                <div>
                  <label className="block text-zinc-500 mb-1">
                    Cases Dispatched <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={formCases}
                    onChange={(e) => setFormCases(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Batch No */}
                <div>
                  <label className="block text-zinc-500 mb-1">Distillery Batch Number</label>
                  <input
                    type="text"
                    placeholder="e.g. UB-2026-CH-12"
                    value={formBatchNo}
                    onChange={(e) => setFormBatchNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Vehicle */}
                <div>
                  <label className="block text-zinc-500 mb-1">Vehicle / Carrier Number</label>
                  <input
                    type="text"
                    placeholder="e.g. TN-04-AZ-4412"
                    value={formVehicleNo}
                    onChange={(e) => setFormVehicleNo(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Driver Name */}
                <div>
                  <label className="block text-zinc-500 mb-1">Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. M. Murugesan"
                    value={formDriverName}
                    onChange={(e) => setFormDriverName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Driver Phone */}
                <div>
                  <label className="block text-zinc-500 mb-1">Driver Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98401 23456"
                    value={formDriverPhone}
                    onChange={(e) => setFormDriverPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 text-[11px] text-zinc-500">
                A unique Government Transit Permit will automatically be generated. The receiving wholesale depot can inspect and confirm receipt via the Goods Receipt Note (GRN) workflow.
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Dispatching Consignment...' : 'Confirm & Dispatch Truck'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: Inspect & Receive (GRN) */}
      {isGrnModalOpen && inspectingConsignment && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsGrnModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/15 rounded-md w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
              <div>
                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-bold">
                  Depot Inward Inspection &amp; Restock
                </span>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  Generate Goods Receipt Note (GRN)
                </h2>
              </div>
              <button
                onClick={() => setIsGrnModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Consignment Overview */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Consignment #:</span>
                <span className="text-orange-500 font-bold">{inspectingConsignment.consignment_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Distillery:</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{inspectingConsignment.supplier_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Receiving Depot:</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{inspectingConsignment.depot_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Dispatched Volume:</span>
                <span className="text-zinc-900 dark:text-white font-bold">{inspectingConsignment.total_cases} cases</span>
              </div>
            </div>

            <form onSubmit={handleReceiveGRN} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-500 mb-1">
                  Inspected Breakage Bottles (Damaged in Transit)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={grnBreakageBottles}
                  onChange={(e) => setGrnBreakageBottles(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Net accepted cases will be credited directly to the {inspectingConsignment.depot_name} live stock.
                </span>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Inspection Remarks / Seal Condition</label>
                <input
                  type="text"
                  placeholder="e.g. Excise seal verified intact. Temperature normal."
                  value={grnRemarks}
                  onChange={(e) => setGrnRemarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsGrnModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grnSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {grnSubmitting ? 'Confirming GRN...' : 'Confirm GRN & Restock Depot'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: View Supplier's Registered Brands */}
      {selectedSupplierForBrands && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedSupplierForBrands(null)}
        >
          <div 
            className="bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/15 rounded-md w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
              <div>
                <span className="text-[10px] font-mono text-orange-500 uppercase tracking-wider font-bold">
                  Distillery Brand Portfolio
                </span>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  {selectedSupplierForBrands.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedSupplierForBrands(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {brands.filter(b => b.supplier_id === selectedSupplierForBrands.id).length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                  No active brands registered under this supplier yet.
                </div>
              ) : (
                brands.filter(b => b.supplier_id === selectedSupplierForBrands.id).map(b => (
                  <div key={b.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-[#000000] border border-zinc-200 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{b.name}</h4>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {b.category} &bull; {b.pack_size} &bull; {b.strength_percentage}% ABV
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-orange-500">
                      ₹{b.current_price?.mrp_per_bottle || '-'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedSupplierForBrands(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-white/10 text-xs font-mono font-bold text-zinc-900 dark:text-white hover:bg-zinc-200 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
