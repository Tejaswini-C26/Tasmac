const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchBrands(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'ALL') query.set('category', params.category);
  if (params.sub_category && params.sub_category !== 'ALL') query.set('sub_category', params.sub_category);
  if (params.search) query.set('search', params.search);

  const res = await fetch(`${API_BASE}/brands?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch brands');
  return res.json();
}

export async function fetchBrandDepotStock(brandId) {
  const res = await fetch(`${API_BASE}/brands/${brandId}/depot-stocks`);
  if (!res.ok) throw new Error('Failed to fetch depot stocks');
  return res.json();
}

export async function fetchOrders(shopId = null, status = null) {
  const query = new URLSearchParams();
  if (shopId) query.set('shop_id', shopId);
  if (status && status !== 'ALL') query.set('status', status);

  const res = await fetch(`${API_BASE}/orders?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function createOrder(orderPayload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to place order');
  }
  return res.json();
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update order status');
  }
  return res.json();
}

export async function fetchDepots() {
  const res = await fetch(`${API_BASE}/depots`);
  if (!res.ok) throw new Error('Failed to fetch depots');
  return res.json();
}

export async function fetchDepotInventory(depotId) {
  const res = await fetch(`${API_BASE}/depots/${depotId}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch depot inventory');
  return res.json();
}

export async function fetchShops() {
  const res = await fetch(`${API_BASE}/shops`);
  if (!res.ok) throw new Error('Failed to fetch shops');
  return res.json();
}

export async function fetchShopInventory(shopId) {
  const res = await fetch(`${API_BASE}/shops/${shopId}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch shop inventory');
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/shops/dashboard/metrics`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

// Supplier Management & Inward Supply APIs
export async function fetchSuppliers() {
  const res = await fetch(`${API_BASE}/suppliers`);
  if (!res.ok) throw new Error('Failed to fetch suppliers');
  return res.json();
}

export async function fetchSupplierConsignments(params = {}) {
  const query = new URLSearchParams();
  if (params.supplierId) query.set('supplier_id', params.supplierId);
  if (params.status && params.status !== 'ALL') query.set('status', params.status);

  const res = await fetch(`${API_BASE}/suppliers/consignments?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch supplier consignments');
  return res.json();
}

export async function createSupplierConsignment(payload) {
  const res = await fetch(`${API_BASE}/suppliers/consignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to dispatch inward consignment');
  }
  return res.json();
}

export async function updateConsignmentStatus(consignmentId, status) {
  const res = await fetch(`${API_BASE}/suppliers/consignments/${consignmentId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update consignment status');
  }
  return res.json();
}

export async function receiveConsignmentGRN(consignmentId, payload) {
  const res = await fetch(`${API_BASE}/suppliers/consignments/${consignmentId}/receive-grn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to verify GRN receipt');
  }
  return res.json();
}

export async function fetchSupplierAnalytics() {
  const res = await fetch(`${API_BASE}/suppliers/analytics/overview`);
  if (!res.ok) throw new Error('Failed to fetch supplier analytics');
  return res.json();
}

export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Authentication failed. Please verify your credentials.');
  }
  return res.json();
}

export async function fetchCurrentUser() {
  const token = localStorage.getItem('tasmac_auth_token');
  if (!token) throw new Error('No authentication token found');
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Session expired');
  }
  return res.json();
}

// Finance, B2B Ledgers & Returnable Bottles
export async function fetchFinanceSummary() {
  const res = await fetch(`${API_BASE}/finance/summary`);
  if (!res.ok) throw new Error('Failed to fetch finance summary');
  return res.json();
}

export async function fetchFinancialLedgers(partyType = null, partyId = null) {
  const query = new URLSearchParams();
  if (partyType && partyType !== 'ALL') query.set('party_type', partyType);
  if (partyId) query.set('party_id', partyId);
  const res = await fetch(`${API_BASE}/finance/ledgers?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch financial ledgers');
  return res.json();
}

export async function fetchBottleReturns(shopId = null) {
  const query = new URLSearchParams();
  if (shopId) query.set('shop_id', shopId);
  const res = await fetch(`${API_BASE}/finance/returns?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch bottle returns');
  return res.json();
}

export async function createBottleReturn(payload) {
  const res = await fetch(`${API_BASE}/finance/returns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit bottle return');
  }
  return res.json();
}

// Compliance & Batch Recalls
export async function fetchRecalls() {
  const res = await fetch(`${API_BASE}/compliance/recalls`);
  if (!res.ok) throw new Error('Failed to fetch batch recalls');
  return res.json();
}

export async function createRecall(payload) {
  const res = await fetch(`${API_BASE}/compliance/recalls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to trigger batch recall');
  }
  return res.json();
}

export async function verifyHologram(serialNumber) {
  const res = await fetch(`${API_BASE}/compliance/verify-hologram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serial_number: serialNumber })
  });
  if (!res.ok) throw new Error('Failed to verify hologram');
  return res.json();
}

// Shop Quota & License Management
export async function extendShopQuota(shopId, cases = 100) {
  const res = await fetch(`${API_BASE}/shops/${shopId}/extend-quota`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cases })
  });
  if (!res.ok) throw new Error('Failed to extend quota');
  return res.json();
}

export async function renewShopLicense(shopId) {
  const res = await fetch(`${API_BASE}/shops/${shopId}/renew-license`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to renew license');
  return res.json();
}

// Supplier KYC Governance
export async function approveSupplierKyc(supplierId) {
  const res = await fetch(`${API_BASE}/suppliers/${supplierId}/approve-kyc`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to approve supplier KYC');
  return res.json();
}

// System & Supply Chain Replenishment Alerts
export async function fetchSystemAlerts(role = null) {
  const url = role ? `${API_BASE}/alerts?role=${encodeURIComponent(role)}` : `${API_BASE}/alerts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch system alerts');
  return res.json();
}

export async function triggerReplenishment() {
  const res = await fetch(`${API_BASE}/alerts/trigger-replenishment`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to trigger auto replenishment');
  return res.json();
}

export async function dismissAlert(alertId) {
  const res = await fetch(`${API_BASE}/alerts/dismiss/${alertId}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to dismiss alert');
  return res.json();
}





