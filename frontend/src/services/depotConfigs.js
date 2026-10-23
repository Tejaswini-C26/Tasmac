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
        name: 'Ambattur IMFL Spirits Warehouse', 
        shortName: 'WH 1: Spirits', 
        categories: ['WHISKY', 'RUM', 'VODKA'],
        capacity_cases: 100000,
        desc: 'High-strength IMFL Spirits & Liquor Vault (Whisky, Rum, Vodka)' 
      },
      { 
        id: 'wh-chn-2', 
        code: 'WH-CHN-02', 
        name: 'Ambattur Beer Storage Bay', 
        shortName: 'WH 2: Beer Bay', 
        categories: ['BEER'],
        capacity_cases: 70000,
        desc: 'Ambient & Palletized Storage Bay for Lagers & Strong Beer' 
      },
      { 
        id: 'wh-chn-3', 
        code: 'WH-CHN-03', 
        name: 'Ambattur Wine & Premium Reserve', 
        shortName: 'WH 3: Wine/Premium', 
        categories: ['WINE'],
        capacity_cases: 30000,
        desc: 'Bonded Reserve Shed for Wines, Single Malts & Elite Liquors' 
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
        name: 'Peelamedu Spirits Warehouse', 
        shortName: 'WH 1: Spirits', 
        categories: ['WHISKY', 'RUM', 'VODKA'],
        capacity_cases: 80000,
        desc: 'Western Corridor High-Proof Spirit Buffer Vault' 
      },
      { 
        id: 'wh-cbe-2', 
        code: 'WH-CBE-02', 
        name: 'Peelamedu Beer Pallet Facility', 
        shortName: 'WH 2: Beer Bay', 
        categories: ['BEER'],
        capacity_cases: 50000,
        desc: 'Fast-Moving Pallet Bay for Commercial Beer Cases' 
      },
      { 
        id: 'wh-cbe-3', 
        code: 'WH-CBE-03', 
        name: 'Peelamedu Premium & Wine Vault', 
        shortName: 'WH 3: Wine/Premium', 
        categories: ['WINE'],
        capacity_cases: 20000,
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
        name: 'Kappalur IMFL Spirits Warehouse', 
        shortName: 'WH 1: Spirits', 
        categories: ['WHISKY', 'RUM', 'VODKA'],
        capacity_cases: 75000,
        desc: 'Southern Region IMFL Spirit Storage Facility' 
      },
      { 
        id: 'wh-mdu-2', 
        code: 'WH-MDU-02', 
        name: 'Kappalur Beer Storage Bay', 
        shortName: 'WH 2: Beer Bay', 
        categories: ['BEER'],
        capacity_cases: 45000,
        desc: 'Bulk Commercial Beer Buffer Shed' 
      },
      { 
        id: 'wh-mdu-3', 
        code: 'WH-MDU-03', 
        name: 'Kappalur Wine & Reserve Cellar', 
        shortName: 'WH 3: Wine/Premium', 
        categories: ['WINE'],
        capacity_cases: 20000,
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
        name: 'Kandampatty Spirits Warehouse', 
        shortName: 'WH 1: Spirits', 
        categories: ['WHISKY', 'RUM', 'VODKA'],
        capacity_cases: 65000,
        desc: 'Central Industrial Corridor Spirit Depot' 
      },
      { 
        id: 'wh-slm-2', 
        code: 'WH-SLM-02', 
        name: 'Kandampatty Beer Pallet Facility', 
        shortName: 'WH 2: Beer Bay', 
        categories: ['BEER'],
        capacity_cases: 40000,
        desc: 'Commercial Beer Pallet Staging Area' 
      },
      { 
        id: 'wh-slm-3', 
        code: 'WH-SLM-03', 
        name: 'Kandampatty Specialty Wine Vault', 
        shortName: 'WH 3: Wine/Premium', 
        categories: ['WINE'],
        capacity_cases: 15000,
        desc: 'Secure Lockup for Premium Liquors & Wines' 
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
        name: 'Thuvakudi IMFL Spirits Warehouse', 
        shortName: 'WH 1: Spirits', 
        categories: ['WHISKY', 'RUM', 'VODKA'],
        capacity_cases: 70000,
        desc: 'Delta Region Central IMFL Spirit Depot' 
      },
      { 
        id: 'wh-try-2', 
        code: 'WH-TRY-02', 
        name: 'Thuvakudi Beer Storage Bay', 
        shortName: 'WH 2: Beer Bay', 
        categories: ['BEER'],
        capacity_cases: 45000,
        desc: 'High-Turnover Regional Beer Staging Bay' 
      },
      { 
        id: 'wh-try-3', 
        code: 'WH-TRY-03', 
        name: 'Thuvakudi Wine & Malts Vault', 
        shortName: 'WH 3: Wine/Premium', 
        categories: ['WINE'],
        capacity_cases: 15000,
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
  const wh1Cap = Math.round(cap * 0.55);
  const wh2Cap = Math.round(cap * 0.30);
  const wh3Cap = cap - wh1Cap - wh2Cap;

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
        name: `${shortName} IMFL Spirits Vault`,
        shortName: 'WH 1: Spirits',
        categories: ['WHISKY', 'RUM', 'VODKA', 'BRANDY'],
        capacity_cases: wh1Cap,
        desc: `High-Proof IMFL Buffer Vault for ${shortName}`
      },
      {
        id: `wh-${rawCode.toLowerCase()}-2`,
        code: `WH-${initials}-02`,
        name: `${shortName} Beer Storage Bay`,
        shortName: 'WH 2: Beer Bay',
        categories: ['BEER'],
        capacity_cases: wh2Cap,
        desc: `Chilled & Staged Commercial Beer Pallet Bay for ${shortName}`
      },
      {
        id: `wh-${rawCode.toLowerCase()}-3`,
        code: `WH-${initials}-03`,
        name: `${shortName} Wine & Premium Reserve`,
        shortName: 'WH 3: Wine/Premium',
        categories: ['WINE', 'GIN'],
        capacity_cases: wh3Cap,
        desc: `Bonded Premium Liquor Cellar & Reserve Vault for ${shortName}`
      }
    ]
  };
}

export function getEffectiveDepotConfigs(backendDepots = []) {
  if (!backendDepots || backendDepots.length === 0) {
    return DEPOT_CONFIGS;
  }

  const configMap = new Map();
  DEPOT_CONFIGS.forEach(d => configMap.set(d.id, d));
  DEPOT_CONFIGS.forEach(d => configMap.set(d.code, d));

  return backendDepots.map(depot => {
    const existing = configMap.get(depot.id) || configMap.get(depot.code);
    if (existing) {
      return {
        ...existing,
        ...depot,
        warehouses: existing.warehouses
      };
    }
    return buildDepotConfig(depot);
  });
}


