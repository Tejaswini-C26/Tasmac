from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models

def seed_consignments_if_missing(db: Session):
    try:
        if db.query(models.SupplierConsignment).first():
            return

        suppliers = db.query(models.Supplier).all()
        depots = db.query(models.Depot).all()
        brands = db.query(models.Brand).all()

        if not suppliers or not depots or not brands:
            return

        print('Seeding sample inward supplier consignments (Distillery -> Depot)...')
        sup1 = suppliers[0]  # UB
        sup2 = suppliers[2] if len(suppliers) > 2 else suppliers[0] # Mohan
        sup3 = suppliers[1] if len(suppliers) > 1 else suppliers[0] # SNJ
        sup4 = suppliers[6] if len(suppliers) > 6 else suppliers[0] # John Distilleries

        dep1 = depots[0] # Chennai
        dep2 = depots[1] if len(depots) > 1 else depots[0] # Coimbatore
        dep3 = depots[2] if len(depots) > 2 else depots[0] # Madurai
        dep4 = depots[3] if len(depots) > 3 else depots[0] # Salem

        consignments_to_seed = [
            models.SupplierConsignment(
                consignment_no='CSG-2026-8801',
                supplier_id=sup1.id,
                depot_id=dep1.id,
                wholesale_unit='Wholesale 1',
                total_cases=500,
                total_value=1825000.0,
                status='RECEIVED',
                batch_no='UB-2026-CH-09',
                vehicle_no='TN-04-AB-9811 (Eicher 14T)',
                driver_name='R. Muthuvel',
                driver_phone='+91 94441 55667',
                excise_permit_no='TN-EXC-PRMT-2026/04112',
                grn_no='GRN-CHN-2026/0412',
                breakage_bottles=2,
                received_cases=500,
                created_at=datetime.utcnow() - timedelta(days=2),
                received_at=datetime.utcnow() - timedelta(days=1)
            ),
            models.SupplierConsignment(
                consignment_no='CSG-2026-8802',
                supplier_id=sup2.id,
                depot_id=dep2.id,
                wholesale_unit='Wholesale 2',
                total_cases=350,
                total_value=1450000.0,
                status='IN_TRANSIT',
                batch_no='MBD-B4-118',
                vehicle_no='TN-37-CT-4421 (Tata Prima 28T)',
                driver_name='M. Murugesan',
                driver_phone='+91 98410 44221',
                excise_permit_no='TN-EXC-PRMT-2026/05891',
                breakage_bottles=0,
                created_at=datetime.utcnow() - timedelta(hours=8)
            ),
            models.SupplierConsignment(
                consignment_no='CSG-2026-8803',
                supplier_id=sup3.id,
                depot_id=dep3.id,
                wholesale_unit='Wholesale 1',
                total_cases=450,
                total_value=1680000.0,
                status='DISPATCHED',
                batch_no='SNJ-BRW-402',
                vehicle_no='TN-58-DK-3312 (BharatBenz 16T)',
                driver_name='K. Selvakumar',
                driver_phone='+91 97910 88776',
                excise_permit_no='TN-EXC-PRMT-2026/06124',
                breakage_bottles=0,
                created_at=datetime.utcnow() - timedelta(hours=3)
            ),
            models.SupplierConsignment(
                consignment_no='CSG-2026-8804',
                supplier_id=sup4.id,
                depot_id=dep4.id,
                wholesale_unit='Wholesale 3',
                total_cases=300,
                total_value=1290000.0,
                status='RECEIVED',
                batch_no='JD-DST-889',
                vehicle_no='TN-27-AZ-1109 (Ashok Leyland)',
                driver_name='A. Jayachandran',
                driver_phone='+91 99401 22334',
                excise_permit_no='TN-EXC-PRMT-2026/03982',
                grn_no='GRN-SLM-2026/0189',
                breakage_bottles=1,
                received_cases=300,
                created_at=datetime.utcnow() - timedelta(days=3),
                received_at=datetime.utcnow() - timedelta(days=2)
            )
        ]

        db.add_all(consignments_to_seed)
        db.commit()

        for idx, csg in enumerate(consignments_to_seed):
            brand_item = brands[idx % len(brands)]
            item = models.ConsignmentItem(
                consignment_id=csg.id,
                brand_id=brand_item.id,
                cases_dispatched=csg.total_cases,
                case_rate=round(csg.total_value / csg.total_cases, 2),
                total_amount=csg.total_value
            )
            db.add(item)
        db.commit()
        print('Sample supplier consignments seeded successfully!')
    except Exception as e:
        print('Notice: seed_consignments skipped:', e)
        db.rollback()

def seed_retail_supplier_database(db: Session):
    seed_consignments_if_missing(db)

    # Check if already seeded
    if db.query(models.Brand).first():
        return

    print("Seeding Retail Shop Wholesale Supplier database...")

    # 1. SUPPLIERS
    suppliers_data = [
        models.Supplier(supplier_code="SUP-1001", name="United Breweries Ltd.", category="Brewery", gstin="33AAACU1234F1Z9", excise_license_no="TN-EXC-BREW-01", contact_person="V. S. Raghavan", email="orders@ubmail.com", phone="+91 98400 12345", district="Chennai"),
        models.Supplier(supplier_code="SUP-1002", name="SNJ Breweries & Distilleries Pvt. Ltd.", category="Brewery", gstin="33AAACS9988H1Z8", excise_license_no="TN-EXC-BREW-03", contact_person="P. Karthikeyan", email="orders@snjbreweries.com", phone="+91 97910 54321", district="Chengalpattu"),
        models.Supplier(supplier_code="SUP-1003", name="Mohan Breweries & Distilleries Ltd.", category="Distillery & Brewery", gstin="33AAACM1234F1Z1", excise_license_no="TN-EXC-DIST-09", contact_person="R. Venkatesan", email="procurement@mohanbreweries.com", phone="+91 98401 23456", district="Chennai"),
        models.Supplier(supplier_code="SUP-1004", name="Empee Distilleries Ltd.", category="Distillery", gstin="33AAACE5678G2Z3", excise_license_no="TN-EXC-DIST-14", contact_person="M. Anbarasan", email="sales@empeegroup.co.in", phone="+91 94440 98765", district="Kanchipuram"),
        models.Supplier(supplier_code="SUP-1005", name="Anheuser-Busch InBev India Ltd.", category="Brewery", gstin="33AAACA9876P1Z3", excise_license_no="TN-EXC-BREW-11", contact_person="David G. Raj", email="orders@ab-inbev.com", phone="+91 98414 77889", district="Ranipet"),
        models.Supplier(supplier_code="SUP-1006", name="Carlsberg India Pvt. Ltd.", category="Brewery", gstin="33AAACC5544K1Z5", excise_license_no="TN-EXC-BREW-15", contact_person="S. Balasubramanian", email="supply@carlsberg.in", phone="+91 98844 55667", district="Tiruvallur"),
        models.Supplier(supplier_code="SUP-1007", name="John Distilleries Pvt. Ltd.", category="Distillery", gstin="33AAACJ3322M1Z2", excise_license_no="TN-EXC-DIST-04", contact_person="K. Sundararajan", email="distillery@johndistilleries.com", phone="+91 99400 33221", district="Chennai"),
        models.Supplier(supplier_code="SUP-1008", name="Shiva Distilleries Ltd.", category="Distillery", gstin="33AAACS1122D1Z4", excise_license_no="TN-EXC-DIST-01", contact_person="T. Ravichandran", email="orders@shivadistilleries.in", phone="+91 98840 11223", district="Coimbatore"),
        models.Supplier(supplier_code="SUP-1009", name="TASMAC State Bonded Cellar", category="Importer", gstin="33AAACT7788R1Z5", excise_license_no="TN-EXC-IMPORT-19", contact_person="K. Ramanathan", email="customs@tasmac.tn.gov.in", phone="+91 94444 88220", district="Chennai"),
        models.Supplier(supplier_code="SUP-1010", name="B9 Beverages Ltd. (Bira 91)", category="Brewery", gstin="33AAACB4433E1Z6", excise_license_no="TN-EXC-BREW-22", contact_person="Ankur Sen", email="orders@bira91.com", phone="+91 97110 88291", district="Coimbatore"),
        models.Supplier(supplier_code="SUP-1011", name="Sula Vineyards Pvt. Ltd.", category="Winery", gstin="33AAACS5566K1Z2", excise_license_no="TN-EXC-WINE-08", contact_person="R. S. Narayanan", email="cellars@sulavineyards.com", phone="+91 98402 33445", district="Ranipet"),
        models.Supplier(supplier_code="SUP-1012", name="Nao Spirits & Beverages Ltd.", category="Distillery", gstin="33AAACN9911L1Z4", excise_license_no="TN-EXC-DIST-04", contact_person="Anand Virmani", email="orders@naospirits.com", phone="+91 97112 34567", district="Chennai")
    ]
    db.add_all(suppliers_data)
    db.commit()

    sup_map = {s.supplier_code: s for s in suppliers_data}

    # 2. WHOLESALE DEPOTS
    depots_data = [
        models.Depot(code="DEP-CHN", name="Chennai Central", region="Chennai", address="Plot 45, Ambattur Industrial Estate, Chennai - 600058", manager_name="K. Palanivel (Depot Manager)", phone="+91 44 2625 1101", capacity_cases=200000),
        models.Depot(code="DEP-CBE", name="Coimbatore Regional", region="Coimbatore", address="Avinashi Road, Peelamedu, Coimbatore - 641004", manager_name="S. Muthukumar", phone="+91 422 257 8890", capacity_cases=150000),
        models.Depot(code="DEP-MDU", name="Madurai Wholesale", region="Madurai", address="NH-7 Byepass, Kappalur SIDCO, Madurai - 625008", manager_name="V. Selvaraj", phone="+91 452 248 3344", capacity_cases=140000),
        models.Depot(code="DEP-SLM", name="Salem Central", region="Salem", address="Bangalore Main Road, Kandampatty, Salem - 636005", manager_name="R. Anbalagan", phone="+91 427 238 9911", capacity_cases=120000),
        models.Depot(code="DEP-TRY", name="Trichy Regional", region="Trichy", address="Thuvakudi Industrial Complex, Trichy - 620015", manager_name="G. Srinivasan", phone="+91 431 250 4422", capacity_cases=130000),
    ]
    db.add_all(depots_data)
    db.commit()

    # 3. 24 BRANDS OFFICIAL CATALOG
    catalog = [
        {"code": "BRD-2001", "sup": "SUP-1009", "name": "Absolut Vodka", "cat": "VODKA", "sub": "WHEAT_VODKA", "pack": "750ml", "btl": 12, "abv": 40.0, "img": "/brands/absolut-vodka.jpg", "mrp": 1650},
        {"code": "BRD-2002", "sup": "SUP-1009", "name": "Bacardi", "cat": "RUM", "sub": "WHITE_RUM", "pack": "750ml", "btl": 12, "abv": 40.0, "img": "/brands/bacardi-white.jpg", "mrp": 850},
        {"code": "BRD-2003", "sup": "SUP-1009", "name": "Chivas Regal", "cat": "WHISKY", "sub": "SCOTCH_WHISKY", "pack": "750ml", "btl": 12, "abv": 40.0, "img": "/brands/chivas-regal.jpg", "mrp": 3600},
        {"code": "BRD-2004", "sup": "SUP-1009", "name": "Dewar's", "cat": "WHISKY", "sub": "SCOTCH_WHISKY", "pack": "750ml", "btl": 12, "abv": 40.0, "img": "/brands/dewars-white-label.jpg", "mrp": 2350},
        {"code": "BRD-2005", "sup": "SUP-1007", "name": "Eight PM", "cat": "WHISKY", "sub": "IMFL_WHISKY", "pack": "750ml", "btl": 12, "abv": 42.8, "img": "/brands/eight-pm-whisky.jpg", "mrp": 440},
        {"code": "BRD-2006", "sup": "SUP-1011", "name": "Four Seasons", "cat": "WINE", "sub": "RED_WINE", "pack": "750ml", "btl": 12, "abv": 13.0, "img": "/brands/four-seasons-wine.jpg", "mrp": 850},
        {"code": "BRD-2007", "sup": "SUP-1009", "name": "Glenfiddich", "cat": "WHISKY", "sub": "SINGLE_MALT", "pack": "750ml", "btl": 12, "abv": 40.0, "img": "/brands/glenfiddich-12.jpg", "mrp": 4950},
        {"code": "BRD-2008", "sup": "SUP-1001", "name": "Heineken", "cat": "BEER", "sub": "PALE_LAGER", "pack": "500ml", "btl": 24, "abv": 4.0, "img": "/brands/heineken-silver.jpg", "mrp": 210},
        {"code": "BRD-2009", "sup": "SUP-1008", "name": "Imperial Blue", "cat": "WHISKY", "sub": "IMFL_WHISKY", "pack": "750ml", "btl": 12, "abv": 42.8, "img": "/brands/imperial-blue.jpg", "mrp": 460},
        {"code": "BRD-2010", "sup": "SUP-1009", "name": "Johnnie Walker", "cat": "WHISKY", "sub": "SCOTCH_WHISKY", "pack": "750ml", "btl": 12, "abv": 40.0, "img": "/brands/johnnie-walker-black.png", "mrp": 3850},
        {"code": "BRD-2011", "sup": "SUP-1001", "name": "Kingfisher", "cat": "BEER", "sub": "PALE_LAGER", "pack": "650ml", "btl": 12, "abv": 4.8, "img": "/brands/kingfisher-strong.png", "mrp": 170},
        {"code": "BRD-2012", "sup": "SUP-1001", "name": "London Pilsner", "cat": "BEER", "sub": "STRONG_BEER", "pack": "650ml", "btl": 12, "abv": 7.5, "img": "/brands/london-pilsner.jpg", "mrp": 170},
        {"code": "BRD-2013", "sup": "SUP-1008", "name": "McDowell's No.1", "cat": "WHISKY", "sub": "IMFL_WHISKY", "pack": "750ml", "btl": 12, "abv": 42.8, "img": "/brands/mcdowells-no1.jpg", "mrp": 460},
        {"code": "BRD-2014", "sup": "SUP-1009", "name": "Newcastle Brown Ale", "cat": "BEER", "sub": "ALE", "pack": "500ml", "btl": 24, "abv": 4.7, "img": "/brands/newcastle-brown-ale.jpg", "mrp": 290},
        {"code": "BRD-2015", "sup": "SUP-1003", "name": "Old Monk", "cat": "RUM", "sub": "DARK_RUM", "pack": "750ml", "btl": 12, "abv": 42.8, "img": "/brands/old-monk-rum.png", "mrp": 420},
        {"code": "BRD-2016", "sup": "SUP-1008", "name": "Royal Stag", "cat": "WHISKY", "sub": "IMFL_WHISKY", "pack": "750ml", "btl": 12, "abv": 42.8, "img": "/brands/royal-stag.png", "mrp": 520},
        {"code": "BRD-2017", "sup": "SUP-1008", "name": "Signature", "cat": "WHISKY", "sub": "PREMIUM_WHISKY", "pack": "750ml", "btl": 12, "abv": 42.8, "img": "/brands/signature-whisky.jpg", "mrp": 720},
        {"code": "BRD-2018", "sup": "SUP-1009", "name": "Teachers", "cat": "WHISKY", "sub": "SCOTCH_WHISKY", "pack": "750ml", "btl": 12, "abv": 40.0, "img": "/brands/teachers-whisky.jpg", "mrp": 2100},
        {"code": "BRD-2019", "sup": "SUP-1001", "name": "United Breweries", "cat": "BEER", "sub": "STRONG_BEER", "pack": "650ml", "btl": 12, "abv": 7.0, "img": "/brands/ub-export.jpg", "mrp": 160},
        {"code": "BRD-2020", "sup": "SUP-1009", "name": "VAT 69", "cat": "WHISKY", "sub": "SCOTCH_WHISKY", "pack": "750ml", "btl": 12, "abv": 40.0, "img": "/brands/vat-69.jpg", "mrp": 1850},
        {"code": "BRD-2021", "sup": "SUP-1008", "name": "White Mischief", "cat": "VODKA", "sub": "TRIPLE_DISTILLED", "pack": "750ml", "btl": 12, "abv": 42.8, "img": "/brands/white-mischief.png", "mrp": 390},
        {"code": "BRD-2022", "sup": "SUP-1009", "name": "X-rated Fusion Liqueur", "cat": "VODKA", "sub": "LIQUEUR", "pack": "750ml", "btl": 12, "abv": 17.0, "img": "/brands/x-rated-liqueur.jpg", "mrp": 2950},
        {"code": "BRD-2023", "sup": "SUP-1009", "name": "Yellow Tail", "cat": "WINE", "sub": "RED_WINE", "pack": "750ml", "btl": 12, "abv": 13.5, "img": "/brands/yellow-tail.jpg", "mrp": 1550},
        {"code": "BRD-2024", "sup": "SUP-1009", "name": "Zing Vodka", "cat": "VODKA", "sub": "PREMIUM_VODKA", "pack": "750ml", "btl": 12, "abv": 40.0, "img": "/brands/zing-vodka.jpg", "mrp": 1600}
    ]

    created_brands = []
    for item in catalog:
        sup = sup_map[item["sup"]]
        brand = models.Brand(
            brand_code=item["code"],
            supplier_id=sup.id,
            name=item["name"],
            category=item["cat"],
            sub_category=item["sub"],
            pack_size=item["pack"],
            bottles_per_case=item["btl"],
            strength_percentage=item["abv"],
            image_url=item["img"],
            status="APPROVED",
            created_at=datetime.utcnow() - timedelta(days=90)
        )
        db.add(brand)
        db.commit()
        db.refresh(brand)
        created_brands.append(brand)

        # Realistic wholesale calculation with genuine retail shop profit margin
        mrp = float(item["mrp"])
        btl_count = item["btl"]
        total_retail_revenue = mrp * btl_count
        # Retail shops purchase at wholesale depot price (approx 75-78% of Gazette MRP)
        margin_target_pct = 24.5 if "BEER" in brand.category else (26.0 if "WINE" in brand.category else 23.5)
        ws_price = round(total_retail_revenue * (1.0 - margin_target_pct / 100.0) / 10.0) * 10.0
        bottled_cost = round(ws_price / btl_count, 2)
        case_margin = round(total_retail_revenue - ws_price, 2)
        margin_pct = round((case_margin / total_retail_revenue) * 100.0, 1)

        price = models.BrandPrice(
            brand_id=brand.id,
            ex_factory_price=round(ws_price * 0.50, 2),
            excise_duty=round(ws_price * 0.35, 2),
            vat_amount=round(ws_price * 0.15, 2),
            wholesale_issue_price=ws_price,
            bottled_cost=bottled_cost,
            mrp_per_bottle=mrp,
            case_margin=case_margin,
            margin_percentage=margin_pct,
            is_active=True
        )
        db.add(price)

    db.commit()

    # 4. SEED DEPOT STOCKS (Across all 5 Depots)
    for depot in depots_data:
        for brand in created_brands:
            stock = models.DepotStock(
                depot_id=depot.id,
                brand_id=brand.id,
                available_cases=1200 if "BEER" in brand.category else 450,
                reserved_cases=50,
                damaged_cases=2,
                last_updated=datetime.utcnow()
            )
            db.add(stock)
    db.commit()

    # 5. SEED RETAIL SHOPS
    shops_data = [
        models.RetailShop(shop_code="SHOP-1042", name="TASMAC T. Nagar Central Vend #1042", shop_type="STANDARD_VEND", district="Chennai", address="14, Usman Road, T. Nagar, Chennai - 600017", manager_name="K. Murugan", phone="+91 98401 10420", assigned_depot_id=depots_data[0].id),
        models.RetailShop(shop_code="SHOP-2018", name="TASMAC Elite Mall Store #2018", shop_type="ELITE_MALL_SHOP", district="Chennai", address="Express Avenue Mall, Ground Floor, Whites Road, Royapettah, Chennai", manager_name="R. Anitha", phone="+91 98402 20180", assigned_depot_id=depots_data[0].id),
        models.RetailShop(shop_code="SHOP-3055", name="TASMAC Gandhipuram Town Vend #3055", shop_type="STANDARD_VEND", district="Coimbatore", address="88, Cross Cut Road, Gandhipuram, Coimbatore - 641012", manager_name="M. Selvakumar", phone="+91 97910 30550", assigned_depot_id=depots_data[1].id),
        models.RetailShop(shop_code="SHOP-4012", name="TASMAC Mattuthavani Junction Vend #4012", shop_type="STANDARD_VEND", district="Madurai", address="Integrated Bus Terminus Complex, Mattuthavani, Madurai - 625020", manager_name="P. Ganesan", phone="+91 94440 40120", assigned_depot_id=depots_data[2].id),
        models.RetailShop(shop_code="SHOP-1077", name="TASMAC Anna Nagar West Vend #1077", shop_type="STANDARD_VEND", district="Chennai", address="2nd Avenue, Anna Nagar West, Chennai - 600040", manager_name="S. Vijayakumar", phone="+91 98403 10770", assigned_depot_id=depots_data[0].id),
        models.RetailShop(shop_code="SHOP-3082", name="TASMAC RS Puram Elite #3082", shop_type="ELITE_MALL_SHOP", district="Coimbatore", address="DB Road, RS Puram, Coimbatore - 641002", manager_name="K. Balaji", phone="+91 97911 30820", assigned_depot_id=depots_data[1].id),
        models.RetailShop(shop_code="SHOP-4066", name="TASMAC Periyar Bus Stand Elite #4066", shop_type="ELITE_MALL_SHOP", district="Madurai", address="West Veli Street, Periyar, Madurai - 625001", manager_name="T. Soundararajan", phone="+91 94441 40660", assigned_depot_id=depots_data[2].id),
        models.RetailShop(shop_code="SHOP-5088", name="TASMAC Salem Junction Elite #5088", shop_type="ELITE_MALL_SHOP", district="Salem", address="Junction Main Road, Meyyanur, Salem - 636004", manager_name="S. Kumaravel", phone="+91 98414 50880", assigned_depot_id=depots_data[3].id),
        models.RetailShop(shop_code="SHOP-5014", name="TASMAC Fairlands Town Vend #5014", shop_type="STANDARD_VEND", district="Salem", address="Fairlands Main Road, Salem - 636016", manager_name="N. Saravanan", phone="+91 98415 50140", assigned_depot_id=depots_data[3].id),
        models.RetailShop(shop_code="SHOP-6021", name="TASMAC Thillai Nagar Elite #6021", shop_type="ELITE_MALL_SHOP", district="Trichy", address="11th Cross Road, Thillai Nagar Main Rd, Tiruchirappalli - 620018", manager_name="A. Meenakshisundaram", phone="+91 98421 60210", assigned_depot_id=depots_data[4].id),
        models.RetailShop(shop_code="SHOP-6034", name="TASMAC Central Bus Stand Vend #6034", shop_type="STANDARD_VEND", district="Trichy", address="Rockins Road, Cantonment, Tiruchirappalli - 620001", manager_name="M. Prabhakaran", phone="+91 98422 60340", assigned_depot_id=depots_data[4].id),
        models.RetailShop(shop_code="SHOP-7015", name="TASMAC Palayamkottai High Ground Vend #7015", shop_type="STANDARD_VEND", district="Tirunelveli", address="High Ground Road, Palayamkottai, Tirunelveli - 627002", manager_name="R. Nellaiyappan", phone="+91 94431 70150", assigned_depot_id=depots_data[2].id),
        models.RetailShop(shop_code="SHOP-8019", name="TASMAC Katpadi Junction Vend #8019", shop_type="STANDARD_VEND", district="Vellore", address="Chittoor Main Road, Katpadi, Vellore - 632007", manager_name="G. Elangovan", phone="+91 94422 80190", assigned_depot_id=depots_data[0].id),
    ]
    db.add_all(shops_data)
    db.commit()

    # 6. SEED INITIAL SHOP INVENTORY & SAMPLE ORDERS
    for shop in shops_data:
        # Give shop 10-15 stocked brands
        for brand in created_brands[:15]:
            inv = models.ShopInventory(
                shop_id=shop.id,
                brand_id=brand.id,
                cases_on_hand=35 if "BEER" in brand.category else 18,
                bottles_on_shelf=48 if "BEER" in brand.category else 24,
                daily_sales_rate=8.5 if "BEER" in brand.category else 4.2,
                reorder_threshold_cases=12,
                last_restocked=datetime.utcnow() - timedelta(days=2)
            )
            db.add(inv)

    # 7. SEED PAST ORDERS WITH TRANSIT SEALS
    sample_order = models.ShopOrder(
        order_no="ORD-2026-9001",
        shop_id=shops_data[0].id,
        depot_id=depots_data[0].id,
        total_cases=40,
        subtotal_amount=146000.0,
        tax_duty_amount=24500.0,
        total_payable=170500.0,
        status="DISPATCHED",
        transit_pass_no="TN-EXC-PASS-2026/9021",
        vehicle_no="TN-02-AZ-4412 (Ashok Leyland 16T)",
        created_at=datetime.utcnow() - timedelta(hours=6),
        expected_delivery=datetime.utcnow() + timedelta(hours=4)
    )
    db.add(sample_order)
    db.commit()
    db.refresh(sample_order)

    # Add items to order
    db.add(models.ShopOrderItem(order_id=sample_order.id, brand_id=created_brands[0].id, cases_ordered=25, case_wholesale_price=3650.0, total_price=91250.0))
    db.add(models.ShopOrderItem(order_id=sample_order.id, brand_id=created_brands[17].id, cases_ordered=15, case_wholesale_price=5320.0, total_price=79800.0))

    db.commit()
    print("Database seeded with 24 Brands, 5 Wholesale Depots, 5 Retail Shops & Sample Orders!")

