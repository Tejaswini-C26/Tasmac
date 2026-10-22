import React, { useState, useEffect } from 'react';

import { 

  Truck, 

  FileCheck, 

  Clock, 

  Calendar, 

  Package, 

  CheckCircle2, 

  AlertCircle,

  Building2,

  FileText,

  Printer,

  ArrowRight,

  Check,

  RotateCcw

} from 'lucide-react';

import { fetchOrders, updateOrderStatus } from '../services/api';

import { StatusBadge } from '../components/StatusBadge';

import { OrderDeliveryTracker } from '../components/OrderDeliveryTracker';

import { ShopSearchSelector } from '../components/ShopSearchSelector';



export function ShopOrders({ selectedShop, onSelectShop, shops = [], onOpenMap }) {

  const [allOrders, setAllOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('ALL');

  const [printingOrderId, setPrintingOrderId] = useState(null);

  const [updatingOrderId, setUpdatingOrderId] = useState(null);



  const loadOrders = async () => {

    try {

      setLoading(true);

      const data = await fetchOrders(selectedShop?.id, 'ALL');

      setAllOrders(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    loadOrders();

  }, [selectedShop]);



  const handleStatusChange = async (orderId, newStatus) => {

    try {

      setUpdatingOrderId(orderId);

      const updated = await updateOrderStatus(orderId, newStatus);

      setAllOrders((prev) =>

        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))

      );

    } catch (err) {

      console.error('Failed to update status:', err);

      alert('Could not update order status: ' + (err.message || 'Network error'));

    } finally {

      setUpdatingOrderId(null);

    }

  };



  const handlePrintOrder = (orderId) => {

    setPrintingOrderId(orderId);

  };



  useEffect(() => {

    if (printingOrderId !== null) {

      // Allow DOM to reflect single-order print isolation before print dialog opens

      const timer = setTimeout(() => {

        window.print();

      }, 60);



      const cleanup = () => {

        setPrintingOrderId(null);

      };



      window.addEventListener('afterprint', cleanup, { once: true });

      const fallback = setTimeout(cleanup, 6000);



      return () => {

        clearTimeout(timer);

        clearTimeout(fallback);

        window.removeEventListener('afterprint', cleanup);

      };

    }

  }, [printingOrderId]);



  // Compute live counts for each operation tab

  const confirmedCount = allOrders.filter((o) => o.status === 'CONFIRMED').length;

  const dispatchedCount = allOrders.filter((o) => o.status === 'DISPATCHED').length;

  const inTransitCount = allOrders.filter((o) => o.status === 'IN_TRANSIT').length;

  const deliveredCount = allOrders.filter((o) => o.status === 'DELIVERED').length;



  const filterTabs = [

    { key: 'ALL', label: 'All Indents', count: allOrders.length },

    { key: 'CONFIRMED', label: 'Confirmed', count: confirmedCount },

    { key: 'DISPATCHED', label: 'Dispatched', count: dispatchedCount },

    { key: 'IN_TRANSIT', label: 'In Transit', count: inTransitCount },

    { key: 'DELIVERED', label: 'Delivered', count: deliveredCount },

  ];



  const visibleOrders = statusFilter === 'ALL'

    ? allOrders

    : allOrders.filter((o) => o.status === statusFilter);



  return (

    <div className="space-y-6">

      {/* Header Actions - Hidden in Print */}

      <div className="flex justify-end items-center gap-3 pb-2 print:hidden">

          {shops && shops.length > 0 && (

            <ShopSearchSelector 

              selectedShop={selectedShop} 

              onSelectShop={onSelectShop} 

              shops={shops} 

              onOpenMap={onOpenMap}

            />

          )}

          <button

            onClick={loadOrders}

            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer print:hidden"

          >

            Refresh Dispatches

          </button>

      </div>



      {/* Status Filter Tabs */}

      <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 gap-1 overflow-x-auto scrollbar-none w-fit max-w-full">

        {filterTabs.map((tab) => {

          const active = statusFilter === tab.key;

          return (

            <button

              key={tab.key}

              onClick={() => setStatusFilter(tab.key)}

              className={`px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${

                active

                  ? 'bg-orange-500 text-white shadow-sm font-semibold'

                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'

              }`}

            >

              <span>{tab.label}</span>

              <span

                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold transition-colors ${

                  active

                    ? 'bg-white/25 text-white'

                    : 'bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400'

                }`}

              >

                {tab.count}

              </span>

            </button>

          );

        })}

      </div>



      {/* Orders List */}

      {loading ? (

        <div className="py-24 text-center space-y-3">

          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-xs text-zinc-400">Fetching order dispatches...</p>

        </div>

      ) : visibleOrders.length === 0 ? (

        <div className="py-20 text-center space-y-2 bg-white dark:bg-[#101010] border border-zinc-200 dark:border-white/10 rounded-md">

          <Truck className="w-10 h-10 mx-auto text-zinc-600" />

          <h3 className="text-sm font-semibold text-zinc-300">No orders found</h3>

          <p className="text-xs text-zinc-500 max-w-sm mx-auto">

            There are no replenishment indents matching the "{statusFilter}" filter.

          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {visibleOrders.map((order) => {

            // In print, isolate and render ONLY the single selected order

            const isHiddenInPrint = printingOrderId !== null ? order.id !== printingOrderId : false;

            const isUpdating = updatingOrderId === order.id;



            return (

              <div

                key={order.id}

                className={`forge-card rounded-md p-5 border border-zinc-200 dark:border-white/10 hover:border-white/[0.16] space-y-4 print:break-inside-avoid print:border-zinc-300 print:mb-0 print:bg-white print:p-5 print:shadow-none ${

                  isHiddenInPrint ? 'print:hidden' : ''

                }`}

              >

                {/* Order Top Bar */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/[0.06]">

                  <div className="flex items-center gap-3">

                    <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">

                      <Truck className="w-5 h-5" />

                    </div>

                    <div>

                      <div className="flex items-center gap-2">

                        <span className="font-mono font-bold text-sm text-white">

                          {order.order_no}

                        </span>

                        <StatusBadge status={order.status} />

                      </div>

                      <p className="text-xs text-zinc-400 mt-0.5">

                        Shop: <span className="text-zinc-200">{order.shop_name}</span> &bull; 

                        Depot: <span className="text-zinc-200">{order.depot_name}</span>

                      </p>

                    </div>

                  </div>



                  <div className="flex items-center gap-4 text-xs">

                    <div className="text-right">

                      <div className="text-zinc-500 text-[10px] uppercase font-mono">Total Payable</div>

                      <div className="font-mono font-bold text-sm text-orange-400">

                        ₹{order.total_payable.toLocaleString()}

                      </div>

                    </div>

                  </div>

                </div>



                {/* Visual Order Delivery Progress Stepper (Hidden in Print) */}

                <div className="print:hidden">

                  <OrderDeliveryTracker order={order} />

                </div>



                {/* Logistics & Transit Details Grid - Constant 3-column layout */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 dark:bg-[#000000] p-3.5 rounded-md border border-zinc-200 dark:border-white/10 text-xs">

                  <div className="space-y-1 min-w-0">

                    <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-mono tracking-wider">

                      State Transit Pass (e-TP)

                    </span>

                    <span className="font-mono text-zinc-800 dark:text-zinc-100 font-bold flex items-center gap-1.5 text-xs truncate">

                      <span className="p-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 shrink-0">

                        <FileCheck className="w-3 h-3" />

                      </span>

                      <span className="truncate">{order.transit_pass_no || 'TN-TP-76389-VERIFIED'}</span>

                    </span>

                  </div>



                  <div className="space-y-1 min-w-0">

                    <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-mono tracking-wider">

                      Assigned Logistics Vehicle

                    </span>

                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 text-xs truncate">

                      <span className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 shrink-0">

                        <Truck className="w-3 h-3" />

                      </span>

                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 tracking-wider truncate">

                        {order.vehicle_no || 'TN 07 NO 3188'}

                      </span>

                    </span>

                  </div>



                  <div className="space-y-1 min-w-0">

                    <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-mono tracking-wider">

                      Indent Created &bull; Expected Delivery

                    </span>

                    <span className="text-zinc-700 dark:text-zinc-300 font-mono text-xs flex items-center gap-1.5 truncate">

                      <span className="p-1 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-white/10 text-zinc-600 dark:text-zinc-400 shrink-0">

                        <Clock className="w-3 h-3" />

                      </span>

                      <span className="truncate">{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>

                    </span>

                  </div>

                </div>



                {/* Itemized Breakdown Table - Constant Fixed Width Columns */}

                <div className="overflow-x-auto">

                  <table className="w-full table-fixed text-left text-xs text-zinc-300">

                    <thead className="text-xs text-black dark:text-white uppercase font-mono font-semibold border-b border-zinc-200 dark:border-white/[0.06]">

                      <tr>

                        <th className="py-1.5 px-2 w-[44%]">Brand Name</th>

                        <th className="py-1.5 px-2 w-[18%] text-right">Cases Ordered</th>

                        <th className="py-1.5 px-2 w-[18%] text-right">Wholesale Case Rate</th>

                        <th className="py-1.5 px-2 w-[20%] text-right">Subtotal</th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-white/[0.04]">

                      {order.items.map((item) => (

                        <tr key={item.id}>

                          <td className="py-2 px-2 font-medium text-white truncate">

                            {item.brand_name}

                          </td>

                          <td className="py-2 px-2 text-right font-mono font-semibold text-zinc-200">

                            {item.cases_ordered} cs

                          </td>

                          <td className="py-2 px-2 text-right font-mono text-zinc-400">

                            ₹{item.case_wholesale_price.toLocaleString()}

                          </td>

                          <td className="py-2 px-2 text-right font-mono font-bold text-zinc-100">

                            ₹{item.total_price.toLocaleString()}

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>



                {/* Financial Summary & Operational Controls */}

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-white/[0.06] text-zinc-400">

                  <div className="flex items-center gap-4">

                    <span>Total Indent Volume: <strong className="text-white font-mono">{order.total_cases} Cases</strong></span>

                    <span>Excise Handling: <strong className="text-zinc-300 font-mono">₹{order.tax_duty_amount.toLocaleString()}</strong></span>

                  </div>



                  {/* Actions Area (Hidden in Print) */}

                  <div className="flex items-center flex-wrap gap-2 print:hidden">

                    {/* Status Dropdown / Quick Switcher */}

                    <div className="flex items-center gap-1.5">

                      <span className="text-[11px] text-zinc-500 font-mono">Status:</span>

                      <select

                        value={order.status}

                        onClick={(e) => e.stopPropagation()}

                        onChange={(e) => {

                          e.stopPropagation();

                          handleStatusChange(order.id, e.target.value);

                        }}

                        disabled={isUpdating}

                        className="py-1 px-2.5 rounded-lg bg-[#08090c] border border-white/10 text-xs text-zinc-200 font-mono cursor-pointer hover:border-white/20 focus:outline-none focus:border-orange-500 transition disabled:opacity-50"

                      >

                        <option value="CONFIRMED">CONFIRMED</option>

                        <option value="DISPATCHED">DISPATCHED</option>

                        <option value="IN_TRANSIT">IN TRANSIT</option>

                        <option value="DELIVERED">DELIVERED</option>

                      </select>

                    </div>



                    {/* Sequential Lifecycle Progression Action Button */}

                    {order.status === 'CONFIRMED' && (

                      <button

                        onClick={(e) => {

                          e.stopPropagation();

                          handleStatusChange(order.id, 'DISPATCHED');

                        }}

                        disabled={isUpdating}

                        className="py-1 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"

                        title="Authorize Gate Pass and Dispatch from Wholesale Depot"

                      >

                        <Truck className="w-3.5 h-3.5" />

                        <span>{isUpdating ? 'Updating...' : 'Dispatch Order'}</span>

                      </button>

                    )}



                    {order.status === 'DISPATCHED' && (

                      <button

                        onClick={(e) => {

                          e.stopPropagation();

                          handleStatusChange(order.id, 'IN_TRANSIT');

                        }}

                        disabled={isUpdating}

                        className="py-1 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"

                        title="Carrier has departed wholesale depot - now in transit"

                      >

                        <ArrowRight className="w-3.5 h-3.5" />

                        <span>{isUpdating ? 'Updating...' : 'Start Transit'}</span>

                      </button>

                    )}



                    {order.status === 'IN_TRANSIT' && (

                      <button

                        onClick={(e) => {

                          e.stopPropagation();

                          handleStatusChange(order.id, 'DELIVERED');

                        }}

                        disabled={isUpdating}

                        className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"

                        title="Confirm arrival at retail shop and automatically stock into inventory"

                      >

                        <CheckCircle2 className="w-3.5 h-3.5" />

                        <span>{isUpdating ? 'Updating...' : 'Confirm Delivery'}</span>

                      </button>

                    )}



                    {order.status === 'DELIVERED' && (

                      <span className="py-1 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-1">

                        <Check className="w-3.5 h-3.5" />

                        <span>Restocked In Store</span>

                      </span>

                    )}



                    {/* Print e-Pass button */}

                    <button

                      onClick={(e) => {

                        e.stopPropagation();

                        handlePrintOrder(order.id);

                      }}

                      className="py-1 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer ml-1 transition"

                    >

                      <Printer className="w-3.5 h-3.5 text-zinc-400" />

                      <span>Print e-Pass</span>

                    </button>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      )}

    </div>

  );

}

