export const DEPOT_CONFIGS = [
  {
    id: 1,
    code: 'DEP-CHN',
    name: 'Chennai Central Wholesale Depot',
    shortName: 'Chennai Central',
    region: 'Chennai',
    manager_name: 'K. Palanivel (Depot Manager)',
    capacity_cases: 200000,
    address: 'Plot 45, Ambattur Industrial Estate, Chennai - 600058',
    phone: '+91 44 2625 1101',
    initials: 'CH',
    warehouses: [
      { 
        id: 'wh-chn-1', 
        code: 'WH-CHN-01', 
        name: 'Warehouse 1',
        shortName: 'Warehouse 1', 
        categories: ['WHISKY'],
        capacity_cases: 85000,
        desc: 'High-strength IMFL Premium Blends & Scotch Whisky Vault' 
      },
      { 
        id: 'wh-chn-2', 
        code: 'WH-CHN-02', 
        name: 'Warehouse 2',
        shortName: 'Warehouse 2', 
        categories: ['BEER'],
        capacity_cases: 60000,
        desc: 'Ambient & Palletized Storage Bay for Lagers, Draught & Strong Beer' 
      },
      { 
        id: 'wh-chn-3', 
        code: 'WH-CHN-03', 
        name: 'Warehouse 3',
        shortName: 'Warehouse 3', 
        categories: ['VODKA', 'GIN'],
        capacity_cases: 25000,
        desc: 'High-Purity Triple-Distilled Vodka, Gin & Botanical Spirits' 
      },
      { 
        id: 'wh-chn-4', 
        code: 'WH-CHN-04', 
        name: 'Warehouse 4',
        shortName: 'Warehouse 4', 
        categories: ['RUM'],
        capacity_cases: 18000,
        desc: 'Dark Cane Rum, Spiced Blends & Coastal Buffer Vault' 
      },
      { 
        id: 'wh-chn-5', 
        code: 'WH-CHN-05', 
        name: 'Warehouse 5',
        shortName: 'Warehouse 5', 
        categories: ['WINE', 'BRANDY'],
        capacity_cases: 12000,
        desc: 'Bonded Climate-Controlled Reserve Cellar for Wines, Single Malts & Brandies' 
      },
    ]
  },
  {
    id: 2,
    code: 'DEP-CBE',
    name: 'Coimbatore Regional Supply Depot',
    shortName: 'Coimbatore Regional',
    region: 'Coimbatore',
    manager_name: 'S. Muthukumar',
    capacity_cases: 150000,
    address: 'Avinashi Road, Peelamedu, Coimbatore - 641004',
    phone: '+91 422 257 8890',
    initials: 'CB',
    warehouses: [
      { 
        id: 'wh-cbe-1', 
        code: 'WH-CBE-01', 
        name: 'Warehouse 1',
        shortName: 'Warehouse 1', 
        categories: ['WHISKY'],
        capacity_cases: 65000,
        desc: 'Western Corridor High-Proof Spirit Buffer Vault' 
      },
      { 
        id: 'wh-cbe-2', 
        code: 'WH-CBE-02', 
        name: 'Warehouse 2',
        shortName: 'Warehouse 2', 
        categories: ['BEER'],
        capacity_cases: 45000,
        desc: 'Fast-Moving Pallet Bay for Commercial Beer Cases' 
      },
      { 
        id: 'wh-cbe-3', 
        code: 'WH-CBE-03', 
        name: 'Warehouse 3',
        shortName: 'Warehouse 3', 
        categories: ['VODKA', 'GIN'],
        capacity_cases: 20000,
        desc: 'Grain Vodka, Flavored Spirits & Botanical Gin Vault' 
      },
      { 
        id: 'wh-cbe-4', 
        code: 'WH-CBE-04', 
        name: 'Warehouse 4',
        shortName: 'Warehouse 4', 
        categories: ['RUM'],
        capacity_cases: 12000,
        desc: 'Regional Molasses & Spiced Rum Buffer Storage' 
      },
      { 
        id: 'wh-cbe-5', 
        code: 'WH-CBE-05', 
        name: 'Warehouse 5',
        shortName: 'Warehouse 5', 
        categories: ['WINE', 'BRANDY'],
        capacity_cases: 8000,
        desc: 'Climate-Controlled Wine & Reserve Single Malt Cellar' 
      },
    ]
  },
  {
    id: 3,
    code: 'DEP-MDU',
    name: 'Madurai Wholesale Supply Depot',
    shortName: 'Madurai Wholesale',
    region: 'Madurai',
    manager_name: 'V. Selvaraj',
    capacity_cases: 140000,
    address: 'NH-7 Byepass, Kappalur SIDCO, Madurai - 625008',
    phone: '+91 452 248 3344',
    initials: 'MD',
    warehouses: [
      { 
        id: 'wh-mdu-1', 
        code: 'WH-MDU-01', 
        name: 'Warehouse 1',
        shortName: 'Warehouse 1', 
        categories: ['WHISKY'],
        capacity_cases: 60000,
        desc: 'Southern Region IMFL Blended Whisky Storage Facility' 
      },
      { 
        id: 'wh-mdu-2', 
        code: 'WH-MDU-02', 
        name: 'Warehouse 2',
        shortName: 'Warehouse 2', 
        categories: ['BEER'],
        capacity_cases: 42000,
        desc: 'Bulk Commercial Beer Buffer Shed' 
      },
      { 
        id: 'wh-mdu-3', 
        code: 'WH-MDU-03', 
        name: 'Warehouse 3',
        shortName: 'Warehouse 3', 
        categories: ['VODKA', 'GIN'],
        capacity_cases: 18000,
        desc: 'White Spirits & Filtered Grain Liquor Storage' 
      },
      { 
        id: 'wh-mdu-4', 
        code: 'WH-MDU-04', 
        name: 'Warehouse 4',
        shortName: 'Warehouse 4', 
        categories: ['RUM'],
        capacity_cases: 12000,
        desc: 'Dark & Traditional Spiced Rum Staging Shed' 
      },
      { 
        id: 'wh-mdu-5', 
        code: 'WH-MDU-05', 
        name: 'Warehouse 5',
        shortName: 'Warehouse 5', 
        categories: ['WINE', 'BRANDY'],
        capacity_cases: 8000,
        desc: 'Bonded Reserve Vault for Fine Wines & Scotch' 
      },
    ]
  },
  {
    id: 4,
    code: 'DEP-SLM',
    name: 'Salem Central Supply Depot',
    shortName: 'Salem Central',
    region: 'Salem',
    manager_name: 'R. Anbalagan',
    capacity_cases: 120000,
    address: 'Bangalore Main Road, Kandampatty, Salem - 636005',
    phone: '+91 427 238 9911',
    initials: 'SL',
    warehouses: [
      { 
        id: 'wh-slm-1', 
        code: 'WH-SLM-01', 
        name: 'Warehouse 1',
        shortName: 'Warehouse 1', 
        categories: ['WHISKY'],
        capacity_cases: 50000,
        desc: 'Central Industrial Corridor Whisky Depot' 
      },
      { 
        id: 'wh-slm-2', 
        code: 'WH-SLM-02', 
        name: 'Warehouse 2',
        shortName: 'Warehouse 2', 
        categories: ['BEER'],
        capacity_cases: 36000,
        desc: 'Commercial Beer Pallet Staging Area' 
      },
      { 
        id: 'wh-slm-3', 
        code: 'WH-SLM-03', 
        name: 'Warehouse 3',
        shortName: 'Warehouse 3', 
        categories: ['VODKA', 'GIN'],
        capacity_cases: 16000,
        desc: 'High-Purity Vodka & Gin Corridor Storage' 
      },
      { 
        id: 'wh-slm-4', 
        code: 'WH-SLM-04', 
        name: 'Warehouse 4',
        shortName: 'Warehouse 4', 
        categories: ['RUM'],
        capacity_cases: 10000,
        desc: 'Spiced & Regular Cane Rum Inventory' 
      },
      { 
        id: 'wh-slm-5', 
        code: 'WH-SLM-05', 
        name: 'Warehouse 5',
        shortName: 'Warehouse 5', 
        categories: ['WINE', 'BRANDY'],
        capacity_cases: 8000,
        desc: 'Secure Lockup for Premium Liquors, Wines & Brandies' 
      },
    ]
  },
  {
    id: 5,
    code: 'DEP-TRY',
    name: 'Trichy Regional Supply Depot',
    shortName: 'Trichy Regional',
    region: 'Trichy',
    manager_name: 'G. Srinivasan',
    capacity_cases: 130000,
    address: 'Thuvakudi Industrial Complex, Trichy - 620015',
    phone: '+91 431 250 4422',
    initials: 'TR',
    warehouses: [
      { 
        id: 'wh-try-1', 
        code: 'WH-TRY-01', 
        name: 'Warehouse 1',
        shortName: 'Warehouse 1', 
        categories: ['WHISKY'],
        capacity_cases: 55000,
        desc: 'Delta Region Central IMFL Whisky Depot' 
      },
      { 
        id: 'wh-try-2', 
        code: 'WH-TRY-02', 
        name: 'Warehouse 2',
        shortName: 'Warehouse 2', 
        categories: ['BEER'],
        capacity_cases: 40000,
        desc: 'High-Turnover Regional Beer Staging Bay' 
      },
      { 
        id: 'wh-try-3', 
        code: 'WH-TRY-03', 
        name: 'Warehouse 3',
        shortName: 'Warehouse 3', 
        categories: ['VODKA', 'GIN'],
        capacity_cases: 17000,
        desc: 'Clean Spirit Vault & Distilled Vodka Bay' 
      },
      { 
        id: 'wh-try-4', 
        code: 'WH-TRY-04', 
        name: 'Warehouse 4',
        shortName: 'Warehouse 4', 
        categories: ['RUM'],
        capacity_cases: 10000,
        desc: 'Central Delta Cane Rum Staging Facility' 
      },
      { 
        id: 'wh-try-5', 
        code: 'WH-TRY-05', 
        name: 'Warehouse 5',
        shortName: 'Warehouse 5', 
        categories: ['WINE', 'BRANDY'],
        capacity_cases: 8000,
        desc: 'Elite Wine Cellar & Premium Consignment Storage' 
      },
    ]
  }
];

export function buildDepotConfig(depot, customWarehouses = null) {
  if (!depot) return null;
  const rawCode = (depot.code || 'DEP').replace(/^DEP-/, '');
  const initials = rawCode.slice(0, 2).toUpperCase() || 'DP';
  const shortName = depot.name ? depot.name.replace(/\s+(Wholesale\s+)?(Supply\s+)?Depot.*$/i, '').trim() : depot.code;

  if (customWarehouses && customWarehouses.length > 0) {
    return {
      id: depot.id,
      code: depot.code,
      name: depot.name,
      shortName: shortName || depot.name,
      region: depot.region,
      manager_name: depot.manager_name,
      capacity_cases: depot.capacity_cases || 150000,
      address: depot.address || '',
      phone: depot.phone || '',
      initials,
      warehouses: customWarehouses
    };
  }

  const cap = depot.capacity_cases || 150000;
  const wh1Cap = Math.round(cap * 0.42);
  const wh2Cap = Math.round(cap * 0.30);
  const wh3Cap = Math.round(cap * 0.13);
  const wh4Cap = Math.round(cap * 0.09);
  const wh5Cap = cap - wh1Cap - wh2Cap - wh3Cap - wh4Cap;

  return {
    id: depot.id,
    code: depot.code,
    name: depot.name,
    shortName: shortName || depot.name,
    region: depot.region,
    manager_name: depot.manager_name,
    capacity_cases: cap,
    address: depot.address || '',
    phone: depot.phone || '',
    initials,
    warehouses: [
      {
        id: `wh-${rawCode.toLowerCase()}-1`,
        code: `WH-${initials}-01`,
        name: 'Warehouse 1',
        shortName: 'Warehouse 1',
        categories: ['WHISKY'],
        capacity_cases: wh1Cap,
        desc: `High-Proof IMFL Whisky Buffer Vault for ${shortName}`
      },
      {
        id: `wh-${rawCode.toLowerCase()}-2`,
        code: `WH-${initials}-02`,
        name: 'Warehouse 2',
        shortName: 'Warehouse 2',
        categories: ['BEER'],
        capacity_cases: wh2Cap,
        desc: `Chilled & Staged Commercial Beer Pallet Bay for ${shortName}`
      },
      {
        id: `wh-${rawCode.toLowerCase()}-3`,
        code: `WH-${initials}-03`,
        name: 'Warehouse 3',
        shortName: 'Warehouse 3',
        categories: ['VODKA', 'GIN'],
        capacity_cases: wh3Cap,
        desc: `Triple-Distilled Vodka & Craft Spirits Vault for ${shortName}`
      },
      {
        id: `wh-${rawCode.toLowerCase()}-4`,
        code: `WH-${initials}-04`,
        name: 'Warehouse 4',
        shortName: 'Warehouse 4',
        categories: ['RUM'],
        capacity_cases: wh4Cap,
        desc: `Dark & Spiced Cane Rum Buffer Shed for ${shortName}`
      },
      {
        id: `wh-${rawCode.toLowerCase()}-5`,
        code: `WH-${initials}-05`,
        name: 'Warehouse 5',
        shortName: 'Warehouse 5',
        categories: ['WINE', 'BRANDY'],
        capacity_cases: wh5Cap,
        desc: `Bonded Premium Liquor Cellar & Reserve Vault for ${shortName}`
      }
    ]
  };
}

const CUSTOM_WAREHOUSES_STORAGE_KEY = 'tasmac_custom_warehouses';

export function getCustomWarehouses() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CUSTOM_WAREHOUSES_STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveCustomWarehouse(depotId, newWh) {
  try {
    const all = getCustomWarehouses();
    const key = String(depotId);
    const depotWhList = all[key] || [];
    all[key] = [...depotWhList, newWh];
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_WAREHOUSES_STORAGE_KEY, JSON.stringify(all));
    }
    return all[key];
  } catch (e) {
    console.error('Failed to save custom warehouse:', e);
    return [];
  }
}

export function getEffectiveDepotConfigs(backendDepots = []) {
  const customMap = getCustomWarehouses();

  if (!backendDepots || backendDepots.length === 0) {
    return DEPOT_CONFIGS.map(depot => {
      const extraWhs = customMap[String(depot.id)] || customMap[depot.code] || [];
      return {
        ...depot,
        warehouses: [...(depot.warehouses || []), ...extraWhs]
      };
    });
  }

  const configMap = new Map();
  DEPOT_CONFIGS.forEach(d => configMap.set(d.id, d));
  DEPOT_CONFIGS.forEach(d => configMap.set(d.code, d));

  return backendDepots.map(depot => {
    const existing = configMap.get(depot.id) || configMap.get(depot.code);
    const extraWhs = customMap[String(depot.id)] || customMap[depot.code] || [];
    if (existing) {
      return {
        ...existing,
        ...depot,
        warehouses: [...(existing.warehouses || []), ...extraWhs]
      };
    }
    const built = buildDepotConfig(depot);
    return {
      ...built,
      warehouses: [...(built.warehouses || []), ...extraWhs]
    };
  });
}
