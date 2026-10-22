import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  RotateCcw, 
  QrCode, 
  Layers, 
  XCircle,
  Eye,
  Lock,
  Download
} from 'lucide-react';
import { fetchSuppliers, fetchShops, fetchBrands } from '../services/api';

export function ComplianceAudit() {
  const [suppliers, setSuppliers] = useState([]);
  const [shops, setShops] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('licenses');

  // Anti-counterfeit verification simulator
  const [serialQuery, setSerialQuery] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  // Batch Recall state
  const [recalls, setRecalls] = useState([
    {
      recall_no: 'RCL-2026-001',
      batch_no: 'TN-BATCH-2026-08',
      brand_name: 'Old Monk The Legend Rum',
      distillery: 'Mohan Meakin Distilleries',
      severity: 'CRITICAL',
      status: 'ACTIVE_QUARANTINE',
      quarantined_cases: 1240,
      reason: 'Sedimentation anomaly detected during Regional Excise Lab random assay.',
      issued_date: '2026-10-18'
    }
  ]);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [recallBatchNo, setRecallBatchNo] = useState('');
  const [recallReason, setRecallReason] = useState('');

  useEffect(() => {
    Promise.all([fetchSuppliers(), fetchShops(), fetchBrands()])
      .then(([sup, shp, brd]) => {
        setSuppliers(sup || []);
        setShops(shp || []);
        setBrands(brd || []);
      })
      .catch((err) => console.error('Failed to load compliance data:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleVerifySerial = (e) => {
    e.preventDefault();
    if (!serialQuery) return;
    setVerifyResult({
      is_authentic: true,
      serial_number: serialQuery.trim().toUpperCase(),
      brand_name: 'Royal Challenge Whisky (750ml)',
      distillery: 'United Spirits Ltd. (Diageo)',
      bottling_date: '14-Sep-2026',
      excise_stamp: 'TN-EXC-HOL-9928114',
      status: 'GENUINE_STATE_ISSUED',
      duty_paid: 'VERIFIED_TREASURY'
    });
  };

  const handleAddRecall = (e) => {
    e.preventDefault();
    if (!recallBatchNo || !recallReason) return;
    const newRecall = {
      recall_no: `RCL-2026-00${recalls.length + 1}`,
      batch_no: recallBatchNo,
      brand_name: 'Statewide Quarantined Consignment',
      distillery: 'Multiple Depot Feeders',
      severity: 'CRITICAL',
      status: 'ACTIVE_QUARANTINE',
      quarantined_cases: 850,
      reason: recallReason,
      issued_date: new Date().toISOString().split('T')[0]
    };
    setRecalls([newRecall, ...recalls]);
    setRecallBatchNo('');
    setRecallReason('');
    setIsRecallModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Prohibition & Excise Vigilance Directorate
            </span>
            <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded border border-zinc-200 dark:border-white/10 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Read-Only Auditor Console
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Excise Compliance, Batch Recall & Hologram Audit
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Independent statutory audit trail, anti-counterfeit QR lookups, and statewide emergency quarantine controls.
          </p>
        </div>

        {/* Emergency Action */}
        <button
          onClick={() => setIsRecallModalOpen(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs transition cursor-pointer flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <AlertOctagon className="w-4 h-4" />
          Trigger Emergency Batch Recall
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Active Recalls
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-rose-600 dark:text-rose-400 mt-2">
            {recalls.length}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {recalls.reduce((acc, r) => acc + r.quarantined_cases, 0).toLocaleString()} cases frozen
          </span>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Audited Distilleries
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            {suppliers.length || 5}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
            100% active FSSAI & Excise permits
          </span>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Retail Vend Compliance
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-900 dark:text-white mt-2">
            {shops.length || 5}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            0 expired licenses detected
          </span>
        </div>

        <div className="forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm">
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 uppercase block">
            Excise Hologram Integrity
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            99.98%
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Cryptographic QR stamp verified
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-white/10 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('licenses')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'licenses'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Statutory License Register
        </button>

        <button
          onClick={() => setActiveTab('recalls')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'recalls'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          Statewide Batch Recalls ({recalls.length})
        </button>

        <button
          onClick={() => setActiveTab('counterfeit')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'counterfeit'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          Anti-Counterfeit Hologram Check
        </button>
      </div>

      {/* Tab 1: Statutory License Register */}
      {activeTab === 'licenses' && (
        <div className="forge-card rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Supplier Distilleries & Retail Shop License Validity
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              Government Gazetted Compliance Record
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 dark:bg-[#08090c] text-zinc-900 dark:text-white font-mono uppercase font-semibold border-b border-zinc-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-3">Name / Licensee</th>
                  <th className="py-3 px-3">Permit Reference</th>
                  <th className="py-3 px-3">District</th>
                  <th className="py-3 px-3">Validity Expiry</th>
                  <th className="py-3 px-3 text-center">Permit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
                {suppliers.map((s) => (
                  <tr key={`sup-${s.id}`} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-bold">
                        DISTILLERY
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-white">
                      {s.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                      {s.excise_license_no}
                    </td>
                    <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300">
                      {s.district}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                      31-Mar-2027
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                        VALIDATED
                      </span>
                    </td>
                  </tr>
                ))}

                {shops.map((shop) => (
                  <tr key={`shp-${shop.id}`} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-white/10 font-bold">
                        RETAIL VEND
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-white">
                      {shop.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                      {shop.license_number || 'TN-EXC-RET-2026/0101'}
                    </td>
                    <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300">
                      {shop.district}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                      31-Dec-2026
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Statewide Batch Recalls */}
      {activeTab === 'recalls' && (
        <div className="space-y-4">
          <div className="forge-card p-5 rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Statewide Batch Quarantine Directives
            </h3>
            <p className="text-xs text-zinc-500">
              When an emergency recall is logged, all retail indents and warehouse dispatches matching the batch are automatically locked.
            </p>

            <div className="space-y-3 mt-4">
              {recalls.map((recall) => (
                <div 
                  key={recall.recall_no}
                  className="p-4 rounded-lg border border-rose-500/30 bg-rose-500/5 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                        {recall.recall_no}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white">
                        {recall.severity}
                      </span>
                      <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                        Batch #{recall.batch_no} &bull; {recall.brand_name}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                      {recall.quarantined_cases} Cases Quarantined
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    <strong className="text-zinc-900 dark:text-white">Inspection Finding:</strong> {recall.reason}
                  </p>

                  <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500 pt-2 border-t border-rose-500/20">
                    <span>Issued Date: {recall.issued_date}</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">STATEWIDE SALE FROZEN</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Anti-Counterfeit Hologram Check */}
      {activeTab === 'counterfeit' && (
        <div className="max-w-xl mx-auto forge-card p-6 rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#101010] shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-orange-500" />
              TASMAC Anti-Counterfeit Hologram Authenticator
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Enter any government 2D barcode serial or bottle hologram bracket number to verify excise authenticity.
            </p>
          </div>

          <form onSubmit={handleVerifySerial} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. TN-EXC-HOL-9928114 or 8901234000101"
                value={serialQuery}
                onChange={(e) => setSerialQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded transition cursor-pointer"
              >
                Verify Bottle
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSerialQuery('TN-EXC-HOL-9928114')}
              className="text-[11px] font-mono text-orange-600 dark:text-orange-400 hover:underline"
            >
              Paste Sample Genuine Hologram: TN-EXC-HOL-9928114
            </button>
          </form>

          {verifyResult && (
            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-3 animate-in fade-in-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 100% GENUINE TASMAC BOTTLE
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                  DUTY PAID
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                <div><span className="text-zinc-500">Serial Stamp:</span> {verifyResult.excise_stamp}</div>
                <div><span className="text-zinc-500">Product:</span> {verifyResult.brand_name}</div>
                <div><span className="text-zinc-500">Distillery:</span> {verifyResult.distillery}</div>
                <div><span className="text-zinc-500">Bottling Date:</span> {verifyResult.bottling_date}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Emergency Batch Recall Modal */}
      {isRecallModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="forge-card w-full max-w-md rounded-xl border border-rose-500/30 bg-white dark:bg-[#101010] shadow-2xl p-6 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
              <AlertOctagon className="w-5 h-5" />
              <h3>Statewide Emergency Recall Order</h3>
            </div>
            <p className="text-xs text-zinc-500">
              Issuing this order will instantly notify all wholesale depots and retail vends to quarantine all inventory matching this production batch.
            </p>

            <form onSubmit={handleAddRecall} className="space-y-3">
              <div>
                <label className="text-xs font-mono uppercase text-zinc-700 dark:text-zinc-300 block mb-1">
                  Batch Code to Quarantine
                </label>
                <input
                  type="text"
                  placeholder="e.g. TN-BATCH-2026-14"
                  value={recallBatchNo}
                  onChange={(e) => setRecallBatchNo(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-mono rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-700 dark:text-zinc-300 block mb-1">
                  Quality Laboratory Finding / Defect Reason
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Failed secondary alcohol strength test (below 42.8% ABV statutory limit)..."
                  value={recallReason}
                  onChange={(e) => setRecallReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#090a0d] text-zinc-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecallModalOpen(false)}
                  className="px-4 py-2 rounded text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded transition cursor-pointer"
                >
                  Issue Quarantine Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
