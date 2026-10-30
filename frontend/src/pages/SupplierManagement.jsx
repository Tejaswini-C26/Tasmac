import React, { useState, useEffect, useRef, useMemo } from 'react';

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

  Wine,

  RotateCw

} from 'lucide-react';

import { ConsignmentWorkstation } from '../components/ConsignmentWorkstation';

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



  const selectedOption = options.find((opt) => !opt.isHeader && (

    String(opt.value) === String(value) ||

    (opt.depotId && String(opt.depotId) === String(value) && opt.wholesaleUnit === 'Wholesale 1')

  ));



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

            if (opt.isHeader) {

              return (

                <div

                  key={opt.value}

                  className="px-2.5 py-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider bg-zinc-100/90 dark:bg-zinc-900/90 sticky top-0 z-10 border-y border-zinc-200/60 dark:border-white/10 select-none flex items-center justify-between"

                >

                  <span>{opt.label}</span>

                  <span className="text-[9px] font-normal text-zinc-400 lowercase">5 wholesale units</span>

                </div>

              );

            }

            const isSelected = selectedOption && selectedOption.value === opt.value;

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




const INITIAL_CONSIGNMENTS = [
  {
    id: 7,
    consignment_no: "CSG-2610261201-939",
    supplier_id: 7,
    supplier_name: "John Distilleries Pvt. Ltd.",
    depot_id: 5,
    depot_name: "Trichy Wholesale 4",
    wholesale_unit: "Wholesale 4",
    total_cases: 500,
    total_value: 7575000,
    status: "RECEIVED",
    batch_no: "BTH-2026-312",
    vehicle_no: "TN-04-AB-8821",
    driver_name: "R. Senthil Kumar",
    driver_phone: "+91 98401 99882",
    excise_permit_no: "TN-EXC-PRMT-2026/25876",
    grn_no: "GRN-TRY-2026/5179",
    breakage_bottles: 0,
    received_cases: 500,
    created_at: "2026-10-26T12:01:16",
    items: [{ id: 7, brand_id: 1, brand_name: "Absolut Vodka", cases_dispatched: 500, case_rate: 15150, total_amount: 7575000 }]
  },
  {
    id: 6,
    consignment_no: "CSG-2610260443-995",
    supplier_id: 1,
    supplier_name: "United Breweries Ltd.",
    depot_id: 3,
    depot_name: "Madurai Wholesale 1",
    wholesale_unit: "Wholesale 1",
    total_cases: 500,
    total_value: 7575000,
    status: "RECEIVED",
    batch_no: "BTH-2026-990",
    vehicle_no: "TN-04-AB-8821",
    driver_name: "R. Senthil Kumar",
    driver_phone: "+91 98401 99882",
    excise_permit_no: "TN-EXC-PRMT-2026/60435",
    grn_no: "GRN-MDU-2026/5246",
    breakage_bottles: 0,
    received_cases: 500,
    created_at: "2026-10-26T04:43:49",
    items: [{ id: 6, brand_id: 1, brand_name: "Absolut Vodka", cases_dispatched: 500, case_rate: 15150, total_amount: 7575000 }]
  },
  {
    id: 5,
    consignment_no: "CSG-2610231237-805",
    supplier_id: 1,
    supplier_name: "United Breweries Ltd.",
    depot_id: 4,
    depot_name: "Salem Wholesale 2",
    wholesale_unit: "Wholesale 2",
    total_cases: 500,
    total_value: 7575000,
    status: "RECEIVED",
    batch_no: "BTH-2026-334",
    vehicle_no: "TN-04-AB-8821",
    driver_name: "R. Senthil Kumar",
    driver_phone: "+91 98401 99882",
    excise_permit_no: "TN-EXC-PRMT-2026/94269",
    grn_no: "GRN-SLM-2026/5709",
    breakage_bottles: 15,
    received_cases: 499,
    created_at: "2026-10-23T12:37:28",
    items: [{ id: 5, brand_id: 1, brand_name: "Absolut Vodka", cases_dispatched: 500, case_rate: 15150, total_amount: 7575000 }]
  },
  {
    id: 4,
    consignment_no: "CSG-2026-8804",
    supplier_id: 7,
    supplier_name: "John Distilleries Pvt. Ltd.",
    depot_id: 4,
    depot_name: "Salem Wholesale 3",
    wholesale_unit: "Wholesale 3",
    total_cases: 300,
    total_value: 1290000,
    status: "RECEIVED",
    batch_no: "JD-DST-889",
    vehicle_no: "TN-27-AZ-1109 (Ashok Leyland)",
    driver_name: "A. Jayachandran",
    driver_phone: "+91 99401 22334",
    excise_permit_no: "TN-EXC-PRMT-2026/03982",
    grn_no: "GRN-SLM-2026/0189",
    breakage_bottles: 1,
    received_cases: 300,
    created_at: "2026-10-20T09:29:16",
    items: [{ id: 4, brand_id: 4, brand_name: "Dewar's", cases_dispatched: 300, case_rate: 4300, total_amount: 1290000 }]
  },
  {
    id: 3,
    consignment_no: "CSG-2026-8803",
    supplier_id: 2,
    supplier_name: "SNJ Breweries & Distilleries Pvt. Ltd.",
    depot_id: 3,
    depot_name: "Madurai Wholesale 1",
    wholesale_unit: "Wholesale 1",
    total_cases: 450,
    total_value: 1680000,
    status: "RECEIVED",
    batch_no: "SNJ-BRW-402",
    vehicle_no: "TN-58-DK-3312 (BharatBenz 16T)",
    driver_name: "K. Selvakumar",
    driver_phone: "+91 97910 88776",
    excise_permit_no: "TN-EXC-PRMT-2026/06124",
    grn_no: "GRN-MDU-2026/9936",
    breakage_bottles: 0,
    received_cases: 450,
    created_at: "2026-10-23T06:29:16",
    items: [{ id: 3, brand_id: 3, brand_name: "Chivas Regal", cases_dispatched: 450, case_rate: 3733.33, total_amount: 1680000 }]
  },
  {
    id: 2,
    consignment_no: "CSG-2026-8802",
    supplier_id: 3,
    supplier_name: "Mohan Breweries & Distilleries Ltd.",
    depot_id: 2,
    depot_name: "Coimbatore Wholesale 2",
    wholesale_unit: "Wholesale 2",
    total_cases: 350,
    total_value: 1450000,
    status: "RECEIVED",
    batch_no: "MBD-B4-118",
    vehicle_no: "TN-37-CT-4421 (Tata Prima 28T)",
    driver_name: "M. Murugesan",
    driver_phone: "+91 98410 44221",
    excise_permit_no: "TN-EXC-PRMT-2026/05891",
    grn_no: "GRN-CBE-2026/5891",
    breakage_bottles: 12,
    received_cases: 349,
    created_at: "2026-10-23T01:29:16",
    items: [{ id: 2, brand_id: 2, brand_name: "Bacardi", cases_dispatched: 350, case_rate: 4142.86, total_amount: 1450000 }]
  },
  {
    id: 1,
    consignment_no: "CSG-2026-8801",
    supplier_id: 1,
    supplier_name: "United Breweries Ltd.",
    depot_id: 1,
    depot_name: "Chennai Wholesale 1",
    wholesale_unit: "Wholesale 1",
    total_cases: 500,
    total_value: 1825000,
    status: "RECEIVED",
    batch_no: "UB-2026-CH-09",
    vehicle_no: "TN-04-AB-9811 (Eicher 14T)",
    driver_name: "R. Muthuvel",
    driver_phone: "+91 94441 55667",
    excise_permit_no: "TN-EXC-PRMT-2026/04112",
    grn_no: "GRN-CHN-2026/0412",
    breakage_bottles: 2,
    received_cases: 500,
    created_at: "2026-10-21T09:29:16",
    items: [{ id: 1, brand_id: 1, brand_name: "Absolut Vodka", cases_dispatched: 500, case_rate: 3650, total_amount: 1825000 }]
  }
];

const INITIAL_ANALYTICS = {
  total_suppliers: 12,
  total_consignments: 7,
  total_inward_cases: 3098,
  otif_percentage: 97.2,
  breakage_percentage: 0.08,
  active_licenses: 12
};

const INITIAL_SUPPLIERS = [
  { id: 1, name: "United Breweries Ltd.", supplier_code: "SUP-1001", category: "Brewery", district: "Chennai", state: "Tamil Nadu", status: "ACTIVE", rating: 4.8 },
  { id: 2, name: "SNJ Breweries & Distilleries Pvt. Ltd.", supplier_code: "SUP-1002", category: "Brewery", district: "Chengalpattu", state: "Tamil Nadu", status: "ACTIVE", rating: 4.8 },
  { id: 3, name: "Mohan Breweries & Distilleries Ltd.", supplier_code: "SUP-1003", category: "Distillery & Brewery", district: "Chennai", state: "Tamil Nadu", status: "ACTIVE", rating: 4.8 },
  { id: 4, name: "Empee Distilleries Ltd.", supplier_code: "SUP-1004", category: "Distillery", district: "Kanchipuram", state: "Tamil Nadu", status: "ACTIVE", rating: 4.8 },
  { id: 5, name: "Anheuser-Busch InBev India Ltd.", supplier_code: "SUP-1005", category: "Brewery", district: "Ranipet", state: "Tamil Nadu", status: "ACTIVE", rating: 4.8 },
  { id: 6, name: "Carlsberg India Pvt. Ltd.", supplier_code: "SUP-1006", category: "Brewery", district: "Tiruvallur", state: "Tamil Nadu", status: "ACTIVE", rating: 4.8 },
  { id: 7, name: "John Distilleries Pvt. Ltd.", supplier_code: "SUP-1007", category: "Distillery", district: "Chennai", state: "Tamil Nadu", status: "ACTIVE", rating: 4.8 },
  { id: 8, name: "Shiva Distilleries Ltd.", supplier_code: "SUP-1008", category: "Distillery", district: "Coimbatore", state: "Tamil Nadu", status: "ACTIVE", rating: 4.8 },
  { id: 9, name: "TASMAC State Bonded Cellar", supplier_code: "SUP-1009", category: "Importer", district: "Chennai", state: "Tamil Nadu", status: "ACTIVE", rating: 4.8 },
  { id: 10, name: "B9 Beverages Ltd. (Bira 91)", supplier_code: "SUP-1010", category: "Brewery", district: "Coimbatore", state: "Tamil Nadu", status: "ACTIVE", rating: 4.8 },
  { id: 11, name: "Sula Vineyards Pvt. Ltd.", supplier_code: "SUP-1011", category: "Winery", district: "Ranipet", state: "Tamil Nadu", status: "ACTIVE", rating: 4.8 },
  { id: 12, name: "Nao Spirits & Beverages Ltd.", supplier_code: "SUP-1012", category: "Distillery", district: "Chennai", state: "Tamil Nadu", status: "ACTIVE", rating: 4.8 }
];

export function SupplierManagement({ externalSearchQuery = '', activeTab: propActiveTab, onTabChange }) {

  const [internalActiveTab, setInternalActiveTab] = useState('consignments'); // 'consignments' | 'directory' | 'scorecard'

  const activeTab = propActiveTab !== undefined ? propActiveTab : internalActiveTab;

  const setActiveTab = (tabKey) => {

    setInternalActiveTab(tabKey);

    if (onTabChange) onTabChange(tabKey);

  };

  const [animateShares, setAnimateShares] = useState(false);

  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);

  const [consignments, setConsignments] = useState(INITIAL_CONSIGNMENTS);

  const [analytics, setAnalytics] = useState(INITIAL_ANALYTICS);

  const [depots, setDepots] = useState([]);

  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(false);

  const handleConsignmentUpdated = (updated) => {
    if (updated && updated.id) {
      setConsignments(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
      setSelectedConsignmentForWorkstation(prev => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
    }
    loadData();
  };



  // Filters

  const [statusFilter, setStatusFilter] = useState('ALL');

  const [searchQuery, setSearchQuery] = useState('');



  // Modals & Side Drawers

  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  const [inspectingConsignment, setInspectingConsignment] = useState(null);

  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);

  const [selectedSupplierForBrands, setSelectedSupplierForBrands] = useState(null);

  const [selectedConsignmentForInspect, setSelectedConsignmentForInspect] = useState(null);
  const [selectedConsignmentForWorkstation, setSelectedConsignmentForWorkstation] = useState(null);



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



  // 5 wholesale units for every city

  const destinationDepotOptions = useMemo(() => {

    const opts = [];

    const targetDepots = depots.length > 0 ? depots : [

      { id: 1, region: 'Chennai', name: 'Chennai Central' },

      { id: 2, region: 'Coimbatore', name: 'Coimbatore Regional' },

      { id: 3, region: 'Madurai', name: 'Madurai Wholesale' },

      { id: 4, region: 'Salem', name: 'Salem Central' },

      { id: 5, region: 'Trichy', name: 'Trichy Regional' }

    ];



    targetDepots.forEach((d) => {

      const regionName = d.region || (d.name || '').replace(/\s*(Wholesale|Central|Regional|Supply|Depot)/gi, '').trim();

      opts.push({

        isHeader: true,

        label: regionName,

        value: `header-${d.id}`

      });

      [1, 2, 3, 4, 5].forEach((num) => {

        opts.push({

          value: `${d.id}|Wholesale ${num}`,

          label: `${regionName} Wholesale ${num}`,

          depotId: d.id,

          wholesaleNum: num,

          wholesaleUnit: `Wholesale ${num}`,

          region: regionName

        });

      });

    });

    return opts;

  }, [depots]);





  // Form states for GRN Receipt Modal

  const [grnBreakageBottles, setGrnBreakageBottles] = useState(0);

  const [grnRemarks, setGrnRemarks] = useState('');

  const [grnSubmitting, setGrnSubmitting] = useState(false);



  const loadData = async () => {
    try {
      setLoading(true);

      // Timeout helper to avoid any indefinite hangs on Tokyo cloud database
      const fetchWithTimeout = (promise, ms = 4000) => Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
      ]);

      const [supRes, csgRes, anlRes, depRes, brdRes] = await Promise.allSettled([
        fetchWithTimeout(fetchSuppliers()),
        fetchWithTimeout(fetchSupplierConsignments()),
        fetchWithTimeout(fetchSupplierAnalytics()),
        fetchWithTimeout(fetchDepots()),
        fetchWithTimeout(fetchBrands())
      ]);

      if (supRes.status === 'fulfilled' && Array.isArray(supRes.value) && supRes.value.length > 0) {
        setSuppliers(supRes.value);
        if (!formSupplierId) setFormSupplierId(supRes.value[0].id);
      }
      if (csgRes.status === 'fulfilled' && Array.isArray(csgRes.value) && csgRes.value.length > 0) {
        setConsignments(csgRes.value);
      }
      if (anlRes.status === 'fulfilled' && anlRes.value) {
        setAnalytics(anlRes.value);
      }
      if (depRes.status === 'fulfilled' && Array.isArray(depRes.value) && depRes.value.length > 0) {
        setDepots(depRes.value);
        if (!formDepotId) setFormDepotId(`${depRes.value[0].id}|Wholesale 1`);
      }
      if (brdRes.status === 'fulfilled' && Array.isArray(brdRes.value) && brdRes.value.length > 0) {
        setBrands(brdRes.value);
        if (!formBrandId) setFormBrandId(brdRes.value[0].id);
      }
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

        if (selectedConsignmentForInspect) setSelectedConsignmentForInspect(null);

      }

    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);

  }, [isDispatchModalOpen, isGrnModalOpen, selectedSupplierForBrands, selectedConsignmentForInspect]);



  const handleCreateConsignment = async (e) => {

    e.preventDefault();

    if (!formSupplierId || !formDepotId || !formBrandId || !formCases) return;



    try {

      setFormSubmitting(true);

      const [depotIdStr, wholesaleUnitStr] = String(formDepotId).includes('|')

        ? String(formDepotId).split('|')

        : [formDepotId, 'Wholesale 1'];



      const payload = {

        supplier_id: parseInt(formSupplierId),

        depot_id: parseInt(depotIdStr),

        wholesale_unit: wholesaleUnitStr || 'Wholesale 1',

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



  const effectiveQuery = (externalSearchQuery || searchQuery).trim().toLowerCase();

  const filteredConsignments = consignments.filter((c) => {

    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

    if (effectiveQuery) {

      const matchNo = c.consignment_no?.toLowerCase().includes(effectiveQuery);

      const matchSup = c.supplier_name?.toLowerCase().includes(effectiveQuery);

      const matchDep = c.depot_name?.toLowerCase().includes(effectiveQuery);

      const matchBatch = c.batch_no?.toLowerCase().includes(effectiveQuery);

      if (!matchNo && !matchSup && !matchDep && !matchBatch) return false;

    }

    return true;

  });



  const activeTrucksCount = consignments.filter(c => c.status === 'IN_TRANSIT' || c.status === 'DISPATCHED').length;



  return (

    <div className="h-full flex flex-col overflow-hidden space-y-3">

      {/* KPI Cards (Pinned Top) */}

      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Card 1: Suppliers */}

        <div className="forge-card rounded-md p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all flex items-end justify-between gap-3">

          <div>

            <span className="text-xs font-normal tracking-wider text-black dark:text-white uppercase block">

              Licensed Suppliers

            </span>

            <div className="text-2xl sm:text-3xl font-mono font-normal text-black dark:text-white mt-1">

              {suppliers.length}

            </div>

          </div>

          <div className="text-right pb-1 shrink-0">

            <span className="text-xs text-black dark:text-white block font-normal">

              Authorized distilleries

            </span>

          </div>

        </div>



        {/* Card 2: Inward Cases */}

        <div className="forge-card rounded-md p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all flex items-end justify-between gap-3">

          <div>

            <span className="text-xs font-normal tracking-wider text-black dark:text-white uppercase block">

              Total Inward Cases

            </span>

            <div className="text-2xl sm:text-3xl font-mono font-normal text-black dark:text-white mt-1">

              {analytics?.total_inward_cases?.toLocaleString() || consignments.reduce((sum, c) => sum + (Number(c.received_cases || c.total_cases) || 0), 0).toLocaleString()}

            </div>

          </div>

          <div className="text-right pb-1 shrink-0">

            <span className="text-xs text-black dark:text-white block font-normal">

              Depot routed shipments

            </span>

          </div>

        </div>



        {/* Card 3: OTIF */}

        <div className="forge-card rounded-md p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all flex items-end justify-between gap-3">

          <div>

            <span className="text-xs font-normal tracking-wider text-black dark:text-white uppercase block">

              Fulfillment (OTIF)

            </span>

            <div className="text-2xl sm:text-3xl font-mono font-normal text-black dark:text-white mt-1">

              {analytics?.otif_percentage || 97.2}%

            </div>

          </div>

          <div className="text-right pb-1 shrink-0">

            <span className="text-xs text-black dark:text-white block font-normal">

              Target &gt; 95%

            </span>

          </div>

        </div>



        {/* Card 4: Active Trucks */}

        <div className="forge-card rounded-md p-4 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm hover:border-zinc-300 dark:hover:border-white/20 transition-all flex items-end justify-between gap-3">

          <div>

            <span className="text-xs font-normal tracking-wider text-black dark:text-white uppercase block">

              Active Supply Trucks

            </span>

            <div className="text-2xl sm:text-3xl font-mono font-normal text-black dark:text-white mt-1">

              {activeTrucksCount}

            </div>

          </div>

          <div className="text-right pb-1 shrink-0">

            <span className="text-xs text-black dark:text-white block font-normal">

              GPS tracked

            </span>

          </div>

        </div>

      </div>



      {/* Actions Suite for non-consignments tabs */}

      {activeTab !== 'consignments' && (

        <div className="shrink-0 flex items-center justify-end gap-2">

          <button

            onClick={loadData}

            disabled={loading}

            title="Refresh Consignments & Analytics"

            className="p-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 transition disabled:opacity-50 cursor-pointer"

          >

            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />

          </button>

        </div>

      )}



            {/* TAB 1: Inward Consignments */}
      {activeTab === 'consignments' && (
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto space-y-3 pr-1 pb-4">
          {/* Live Interactive Workstation */}
          <ConsignmentWorkstation
            consignments={consignments}
            selectedConsignment={selectedConsignmentForWorkstation}
            onSelectConsignment={setSelectedConsignmentForWorkstation}
            onConsignmentUpdated={handleConsignmentUpdated}
            onOpenDispatch={() => setIsDispatchModalOpen(true)}
          />

          {/* SELECT CONSIGNMENT TO TRACK TABLE (Matching media_1793171744257_73ca696e.png) */}
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0d12] shadow-sm p-4 sm:p-5 transition-all">
            <div className="mb-3">
              <span className="text-xs font-sans font-normal uppercase tracking-wider text-black dark:text-white">
                SELECT CONSIGNMENT TO TRACK
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {consignments.map((item) => {
                const isSelected = (selectedConsignmentForWorkstation?.id === item.id) || 
                  (!selectedConsignmentForWorkstation && consignments[0]?.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedConsignmentForWorkstation(item);
                      setSelectedConsignmentForInspect(item);
                    }}
                    className={`w-full p-3 sm:px-4 sm:py-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#fff7ed] dark:bg-orange-950/20 border-orange-300 dark:border-orange-500/40 shadow-xs'
                        : 'bg-white dark:bg-[#12131a] border-zinc-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-white/20 hover:bg-orange-50/40 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold text-sm tracking-tight ${
                          isSelected ? 'text-orange-600 dark:text-orange-400 font-extrabold' : 'text-zinc-900 dark:text-zinc-100'
                        }`}>
                          {item.consignment_no}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                            Tracking Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5 truncate">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{item.supplier_name}</span>
                        <span className="text-orange-500 font-bold">➔</span>
                        <span>{item.depot_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <div className="text-right hidden sm:block font-mono text-[11px] text-zinc-500">
                        <div>{item.total_cases?.toLocaleString()} cs</div>
                        <div className="text-orange-500 font-semibold">₹{item.total_value?.toLocaleString()}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-wider uppercase border ${
                        item.status === 'RECEIVED'
                          ? 'border-[#fed7aa] dark:border-orange-500/30 bg-[#fff7ed] dark:bg-orange-500/10 text-[#ea580c] dark:text-[#fb923c]'
                          : item.status === 'IN_TRANSIT'
                          ? 'border-blue-300 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consignments Table (Internally Scrollable with Sticky Header) */}

          {loading ? (

            <div className="flex-1 flex items-center justify-center text-xs font-mono text-zinc-400 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-md">

              Loading inward consignments from state network...

            </div>

          ) : filteredConsignments.length === 0 ? (

            <div className="flex-1 flex flex-col items-center justify-center space-y-2 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-md p-6">

              <Package className="w-10 h-10 mx-auto text-zinc-500" />

              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-300">No consignments found</h3>

              <p className="text-xs text-zinc-500">

                Click "+ Dispatch Inward Consignment" above to log a new distillery shipment.

              </p>

            </div>

          ) : (

            <div className="flex-1 min-h-0 overflow-auto rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">

              <table className="w-full text-left text-xs text-zinc-900 dark:text-zinc-300">

                <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-[#090a0d] text-zinc-900 dark:text-white uppercase text-xs font-mono font-semibold tracking-wider border-b border-zinc-200 dark:border-white/10 shadow-xs">

                  <tr>

                    <th className="py-2.5 px-4">Consignment #</th>

                    <th className="py-2.5 px-3">Distillery (Supplier)</th>

                    <th className="py-2.5 px-3">Destination Depot</th>

                    <th className="py-2.5 px-3">Batch &amp; Permit</th>

                    <th className="py-2.5 px-3 text-right">Cases</th>

                    <th className="py-2.5 px-3 text-right">Value (₹)</th>

                    <th className="py-2.5 px-3 text-center">Status</th>

                    <th className="py-2.5 px-4 text-right">Actions</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">

                  {filteredConsignments.map((csg) => (

                    <tr 

                      key={csg.id} 

                      onClick={() => {
                        setSelectedConsignmentForWorkstation(csg);
                        setSelectedConsignmentForInspect(csg);
                      }}
                      className={`hover:bg-orange-500/5 dark:hover:bg-white/[0.03] transition cursor-pointer group ${
                        selectedConsignmentForWorkstation?.id === csg.id ? 'bg-orange-500/[0.07] dark:bg-orange-950/20' : ''
                      }`}

                    >

                      <td className="py-2.5 px-4 font-mono font-bold text-orange-500 group-hover:underline">

                        {csg.consignment_no}

                        <span className="block text-[10px] font-normal text-zinc-500">

                          {new Date(csg.created_at).toLocaleDateString()}

                        </span>

                      </td>



                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-zinc-900 dark:text-white">{csg.supplier_name}</div>
                        <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                          <span className="truncate max-w-[120px]">{csg.supplier_name}</span>
                          <span className="text-orange-500 font-bold">➔</span>
                          <span className="truncate max-w-[120px]">{csg.depot_name}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          Vehicle: {csg.vehicle_no}
                        </div>
                      </td>



                      <td className="py-2.5 px-3">

                        <div className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">

                          <Warehouse className="w-3.5 h-3.5 text-zinc-500" />

                          {csg.depot_name}

                        </div>

                      </td>



                      <td className="py-2.5 px-3 font-mono text-[11px]">

                        <div className="text-zinc-700 dark:text-zinc-300 font-semibold">{csg.batch_no}</div>

                        <div className="text-[10px] text-zinc-500 truncate max-w-[140px]">{csg.excise_permit_no}</div>

                      </td>



                      <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">

                        {csg.total_cases?.toLocaleString()} cs

                      </td>



                      <td className="py-2.5 px-3 text-right font-mono font-bold text-orange-500">

                        ₹{csg.total_value?.toLocaleString()}

                      </td>



                      <td className="py-2.5 px-3 text-center">

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



                      <td className="py-2.5 px-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedConsignmentForWorkstation(csg)}
                          title="Track in Live Statutory Workstation"
                          className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                            selectedConsignmentForWorkstation?.id === csg.id
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'bg-zinc-100 dark:bg-white/5 hover:bg-orange-500/20 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10'
                          }`}
                        >
                          {selectedConsignmentForWorkstation?.id === csg.id ? '● Tracking' : 'Track'}
                        </button>

                        {csg.status === 'PLANNED' && (

                          <button

                            onClick={() => handleStatusTransition(csg.id, 'DISPATCHED')}

                            className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-mono font-bold transition cursor-pointer shadow-sm shadow-orange-950/20"

                          >

                            Dispatch Truck

                          </button>

                        )}

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

                            Inspect &amp; GRN

                          </button>

                        )}

                        {csg.status === 'RECEIVED' && (

                          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">

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



      {/* TAB 2: Distilleries Directory (Internally Scrollable Grid) */}

      {activeTab === 'directory' && (

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">

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

                    View Brands &rarr;

                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}



      {/* TAB 3: Scorecard (Internally Scrollable View) */}

      {activeTab === 'scorecard' && (

        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4 pb-4">

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

                {analytics?.breakage_percentage != null ? Number(analytics.breakage_percentage).toFixed(2) : '0.10'}%

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



      {/* SLIDE-OVER DRAWER 1: Dispatch New Inward Consignment */}

      {isDispatchModalOpen && typeof document !== 'undefined' && createPortal(

        <div 

          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in cursor-pointer"

          onClick={() => setIsDispatchModalOpen(false)}

        >

          <div 

            className="relative w-full max-w-lg bg-white dark:bg-[#111217] border-l border-zinc-200 dark:border-white/10 h-full flex flex-col shadow-2xl animate-slide-left cursor-default text-zinc-900 dark:text-zinc-100"

            onClick={(e) => e.stopPropagation()}

          >

            {/* Drawer Pinned Header */}

            <div className="shrink-0 p-4 sm:p-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0c10] flex items-center justify-between">

              <div>

                <span className="text-[10px] font-mono text-orange-500 uppercase tracking-wider font-bold block">

                  Upstream Inward Dispatch

                </span>

                <h2 className="text-base font-bold text-zinc-900 dark:text-white">

                  Dispatch Distillery Consignment

                </h2>

              </div>

              <button

                onClick={() => setIsDispatchModalOpen(false)}

                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition cursor-pointer"

              >

                <X className="w-5 h-5" />

              </button>

            </div>



            {/* Scrollable Form Body */}

            <form onSubmit={handleCreateConsignment} className="flex-1 min-h-0 flex flex-col">

              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-mono">

                <div className="space-y-4">

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

                      options={destinationDepotOptions}

                      placeholder="Select Destination Depot"

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

                <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/20 text-[11px] text-zinc-600 dark:text-zinc-400">

                  A unique Government Transit Permit will automatically be generated. The receiving wholesale depot can inspect and confirm receipt via the Goods Receipt Note (GRN) workflow.

                </div>

              </div>



              {/* Drawer Pinned Footer */}

              <div className="shrink-0 p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0c10] flex items-center justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-mono text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Dispatching Consignment...' : 'Confirm & Dispatch Truck'}
                </button>

              </div>

            </form>

          </div>

        </div>,

        document.body

      )}



      {/* SLIDE-OVER DRAWER 2: Inspect & Receive (GRN) */}

      {isGrnModalOpen && inspectingConsignment && typeof document !== 'undefined' && createPortal(

        <div 

          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in cursor-pointer"

          onClick={() => setIsGrnModalOpen(false)}

        >

          <div 

            className="relative w-full max-w-lg bg-white dark:bg-[#111217] border-l border-zinc-200 dark:border-white/10 h-full flex flex-col shadow-2xl animate-slide-left cursor-default text-zinc-900 dark:text-zinc-100"

            onClick={(e) => e.stopPropagation()}

          >

            {/* Drawer Pinned Header */}

            <div className="shrink-0 p-4 sm:p-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0c10] flex items-center justify-between">

              <div>

                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-bold block">

                  Depot Inward Inspection &amp; Restock

                </span>

                <h2 className="text-base font-bold text-zinc-900 dark:text-white">

                  Generate Goods Receipt Note (GRN)

                </h2>

              </div>

              <button

                onClick={() => setIsGrnModalOpen(false)}

                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition cursor-pointer"

              >

                <X className="w-5 h-5" />

              </button>

            </div>



            {/* Scrollable Form Body */}

            <form onSubmit={handleReceiveGRN} className="flex-1 min-h-0 flex flex-col">

              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-mono">

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

                  <div className="flex justify-between">

                    <span className="text-zinc-500">Excise Permit:</span>

                    <span className="text-zinc-700 dark:text-zinc-300 font-mono">{inspectingConsignment.excise_permit_no}</span>

                  </div>

                </div>



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

              </div>



              {/* Drawer Pinned Footer */}

              <div className="shrink-0 p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0c10] flex items-center justify-end gap-3">

                <button

                  type="button"

                  onClick={() => setIsGrnModalOpen(false)}

                  className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-mono text-xs font-medium transition cursor-pointer"

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  disabled={grnSubmitting}

                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"

                >

                  <CheckCircle2 className="w-3.5 h-3.5" />

                  {grnSubmitting ? 'Confirming GRN...' : 'Confirm GRN & Restock Depot'}

                </button>

              </div>

            </form>

          </div>

        </div>,

        document.body

      )}



      {/* SLIDE-OVER DRAWER 3: View Supplier's Registered Brands */}

      {selectedSupplierForBrands && typeof document !== 'undefined' && createPortal(

        <div 

          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in cursor-pointer"

          onClick={() => setSelectedSupplierForBrands(null)}

        >

          <div 

            className="relative w-full max-w-lg bg-white dark:bg-[#111217] border-l border-zinc-200 dark:border-white/10 h-full flex flex-col shadow-2xl animate-slide-left cursor-default text-zinc-900 dark:text-zinc-100"

            onClick={(e) => e.stopPropagation()}

          >

            {/* Drawer Pinned Header */}

            <div className="shrink-0 p-4 sm:p-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0c10] flex items-center justify-between">

              <div>

                <span className="text-[10px] font-mono text-orange-500 uppercase tracking-wider font-bold block">

                  Distillery Brand Portfolio

                </span>

                <h2 className="text-base font-bold text-zinc-900 dark:text-white">

                  {selectedSupplierForBrands.name}

                </h2>

              </div>

              <button

                onClick={() => setSelectedSupplierForBrands(null)}

                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition cursor-pointer"

              >

                <X className="w-5 h-5" />

              </button>

            </div>



            {/* Scrollable Brands List */}

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-2.5">

              {brands.filter(b => b.supplier_id === selectedSupplierForBrands.id).length === 0 ? (

                <div className="py-16 text-center text-xs text-zinc-500 font-mono">

                  No active brands registered under this supplier yet.

                </div>

              ) : (

                brands.filter(b => b.supplier_id === selectedSupplierForBrands.id).map(b => (

                  <div key={b.id} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#090a0d] border border-zinc-200 dark:border-white/10 flex items-center justify-between hover:border-orange-500/40 transition">

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



            {/* Drawer Pinned Footer */}

            <div className="shrink-0 p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0c10] flex justify-end">

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



      {/* SLIDE-OVER DRAWER 4: Detailed Consignment Inspection & Tracking */}

      {selectedConsignmentForInspect && typeof document !== 'undefined' && createPortal(

        <div 

          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in cursor-pointer"

          onClick={() => setSelectedConsignmentForInspect(null)}

        >

          <div 

            className="relative w-full max-w-lg bg-white dark:bg-[#111217] border-l border-zinc-200 dark:border-white/10 h-full flex flex-col shadow-2xl animate-slide-left cursor-default text-zinc-900 dark:text-zinc-100"

            onClick={(e) => e.stopPropagation()}

          >

            {/* Drawer Pinned Header */}

            <div className="shrink-0 p-4 sm:p-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0c10] flex items-center justify-between">

              <div>

                <span className="text-[10px] font-mono text-orange-500 uppercase tracking-wider font-bold block">

                  Consignment Inspection Dossier

                </span>

                <h2 className="text-base font-bold text-zinc-900 dark:text-white">

                  {selectedConsignmentForInspect.consignment_no}

                </h2>

              </div>

              <button

                onClick={() => setSelectedConsignmentForInspect(null)}

                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition cursor-pointer"

              >

                <X className="w-5 h-5" />

              </button>

            </div>



            {/* Scrollable Body */}

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-mono">

              {/* Status Header Badge */}

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#0a0b0e] border border-zinc-200 dark:border-white/10 flex items-center justify-between">

                <div>

                  <span className="text-[10px] text-zinc-500 uppercase block">Logistics Status</span>

                  <span className="font-bold text-sm text-zinc-900 dark:text-white">{selectedConsignmentForInspect.status}</span>

                </div>

                <div>

                  {selectedConsignmentForInspect.status === 'DISPATCHED' && (

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">

                      Dispatched

                    </span>

                  )}

                  {selectedConsignmentForInspect.status === 'IN_TRANSIT' && (

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1.5">

                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />

                      In Transit

                    </span>

                  )}

                  {selectedConsignmentForInspect.status === 'RECEIVED' && (

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">

                      <CheckCircle2 className="w-3.5 h-3.5" />

                      GRN Verified

                    </span>

                  )}

                </div>

              </div>



              {/* Transit & Excise Permit */}

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0a0b0e] border border-zinc-200 dark:border-white/10 space-y-2.5">

                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">

                  Excise Statutory Details

                </span>

                <div className="flex justify-between items-center text-xs">

                  <span className="text-zinc-500">Excise Permit No:</span>

                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedConsignmentForInspect.excise_permit_no}</span>

                </div>

                <div className="flex justify-between items-center text-xs">

                  <span className="text-zinc-500">Distillery Batch:</span>

                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedConsignmentForInspect.batch_no}</span>

                </div>

                <div className="flex justify-between items-center text-xs">

                  <span className="text-zinc-500">Dispatched Date:</span>

                  <span className="text-zinc-800 dark:text-zinc-200">{new Date(selectedConsignmentForInspect.created_at).toLocaleString()}</span>

                </div>

                {selectedConsignmentForInspect.grn_no && (

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-200 dark:border-white/10">

                    <span className="text-emerald-500 font-semibold">GRN Reference:</span>

                    <span className="font-bold text-emerald-500">{selectedConsignmentForInspect.grn_no}</span>

                  </div>

                )}

              </div>



              {/* Supply Route & Depots */}

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0a0b0e] border border-zinc-200 dark:border-white/10 space-y-2.5">

                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">

                  Supply Route &amp; Destination

                </span>

                <div className="flex justify-between items-center text-xs">

                  <span className="text-zinc-500">Origin Distillery:</span>

                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedConsignmentForInspect.supplier_name}</span>

                </div>

                <div className="flex justify-between items-center text-xs">

                  <span className="text-zinc-500">Destination Depot:</span>

                  <span className="font-bold text-orange-500">{selectedConsignmentForInspect.depot_name}</span>

                </div>

              </div>



              {/* Transport Vehicle & Driver */}

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0a0b0e] border border-zinc-200 dark:border-white/10 space-y-2.5">

                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">

                  Carrier &amp; Driver Telemetry

                </span>

                <div className="flex justify-between items-center text-xs">

                  <span className="text-zinc-500">Vehicle Plate:</span>

                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedConsignmentForInspect.vehicle_no}</span>

                </div>

                <div className="flex justify-between items-center text-xs">

                  <span className="text-zinc-500">Driver Name:</span>

                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedConsignmentForInspect.driver_name}</span>

                </div>

                <div className="flex justify-between items-center text-xs">

                  <span className="text-zinc-500">Driver Phone:</span>

                  <span className="font-bold text-orange-500">{selectedConsignmentForInspect.driver_phone}</span>

                </div>

              </div>



              {/* Consignment Valuation */}

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0a0b0e] border border-zinc-200 dark:border-white/10 space-y-2.5">

                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">

                  Volume &amp; Statutory Valuation

                </span>

                <div className="flex justify-between items-center text-xs">

                  <span className="text-zinc-500">Total Cases Dispatched:</span>

                  <span className="font-bold text-zinc-900 dark:text-white">{selectedConsignmentForInspect.total_cases?.toLocaleString()} cases</span>

                </div>

                <div className="flex justify-between items-center text-xs">

                  <span className="text-zinc-500">Statutory Valuation:</span>

                  <span className="font-bold text-orange-500 text-sm">₹{selectedConsignmentForInspect.total_value?.toLocaleString()}</span>

                </div>

                {selectedConsignmentForInspect.breakage_bottles !== undefined && (

                  <div className="flex justify-between items-center text-xs">

                    <span className="text-zinc-500">Transit Breakage:</span>

                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedConsignmentForInspect.breakage_bottles} bottles</span>

                  </div>

                )}

              </div>

            </div>



            {/* Drawer Pinned Footer with Actions */}

            <div className="shrink-0 p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0b0c10] flex items-center justify-between gap-3">

              <button

                type="button"

                onClick={() => setSelectedConsignmentForInspect(null)}

                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"

              >

                Close Drawer

              </button>



              <div className="flex items-center gap-2">

                {selectedConsignmentForInspect.status === 'DISPATCHED' && (

                  <button

                    onClick={() => {

                      handleStatusTransition(selectedConsignmentForInspect.id, 'IN_TRANSIT');

                      setSelectedConsignmentForInspect(null);

                    }}

                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition cursor-pointer"

                  >

                    Mark In Transit

                  </button>

                )}

                {selectedConsignmentForInspect.status === 'IN_TRANSIT' && (

                  <button

                    onClick={() => {

                      const csg = selectedConsignmentForInspect;

                      setSelectedConsignmentForInspect(null);

                      setInspectingConsignment(csg);

                      setIsGrnModalOpen(true);

                    }}

                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer flex items-center gap-1.5"

                  >

                    <CheckCircle2 className="w-4 h-4" />

                    Inspect &amp; Receive (GRN)

                  </button>

                )}

              </div>

            </div>

          </div>

        </div>,

        document.body

      )}

    </div>

  );

}

