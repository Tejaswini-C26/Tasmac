from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    supplier_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False) # Brewery, Distillery, Winery, Importer
    gstin = Column(String(20), nullable=False)
    excise_license_no = Column(String(100), nullable=False)
    contact_person = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(25), nullable=False)
    district = Column(String(100), default="Chennai")
    state = Column(String(50), default="Tamil Nadu")
    status = Column(String(50), default="ACTIVE")
    kyc_status = Column(String(30), default="APPROVED") # PENDING, APPROVED, REJECTED
    pan_number = Column(String(20), default="AAACT1234F")
    bank_account_no = Column(String(40), default="04120100004589")
    bank_ifsc = Column(String(20), default="SBIN0001234")
    bank_name = Column(String(100), default="State Bank of India")
    contract_terms = Column(Text, default="Net 30-Day Indent Framework, Annual 50K Case Quota")
    payout_balance = Column(Float, default=485000.0)
    rating = Column(Float, default=4.8)
    created_at = Column(DateTime, default=datetime.utcnow)

    brands = relationship("Brand", back_populates="supplier")

class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    brand_code = Column(String(50), unique=True, index=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False) # BEER, IMFL, IMPORTED, WINE, VODKA, RUM, WHISKY
    sub_category = Column(String(50), nullable=False)
    pack_size = Column(String(50), nullable=False) # 650ml, 500ml, 330ml, 750ml, 375ml, 180ml
    bottles_per_case = Column(Integer, default=12)
    strength_percentage = Column(Float, default=42.8)
    image_url = Column(String(500), nullable=True)
    flavor_notes = Column(Text, nullable=True)
    barcode = Column(String(50), default="8901234000000")
    batch_no = Column(String(50), default="TN-BATCH-2026-01")
    expiry_period_months = Column(Integer, default=24)
    is_counterfeit_protected = Column(Boolean, default=True)
    regional_pricing_json = Column(Text, nullable=True)
    status = Column(String(50), default="APPROVED")
    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", back_populates="brands")
    prices = relationship("BrandPrice", back_populates="brand", order_by="desc(BrandPrice.id)")
    depot_stocks = relationship("DepotStock", back_populates="brand")

class BrandPrice(Base):
    __tablename__ = "brand_prices"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    ex_factory_price = Column(Float, nullable=False)
    excise_duty = Column(Float, nullable=False)
    vat_amount = Column(Float, nullable=False)
    wholesale_issue_price = Column(Float, nullable=False) # Price per case charged to retail shop
    bottled_cost = Column(Float, nullable=False) # Net wholesale cost per bottle
    mrp_per_bottle = Column(Float, nullable=False) # Maximum Retail Price per bottle
    case_margin = Column(Float, nullable=False) # Profit for retail shop per case
    margin_percentage = Column(Float, nullable=False) # Profit margin % for retail shop
    is_active = Column(Boolean, default=True)

    brand = relationship("Brand", back_populates="prices")

class Depot(Base):
    __tablename__ = "depots"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    region = Column(String(50), nullable=False) # Chennai, Coimbatore, Madurai, Salem, Trichy
    address = Column(String(200), nullable=False)
    manager_name = Column(String(100), nullable=False)
    phone = Column(String(25), nullable=False)
    capacity_cases = Column(Integer, default=150000)

    stocks = relationship("DepotStock", back_populates="depot")

class DepotStock(Base):
    __tablename__ = "depot_stocks"

    id = Column(Integer, primary_key=True, index=True)
    depot_id = Column(Integer, ForeignKey("depots.id"), nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    available_cases = Column(Integer, default=500)
    reserved_cases = Column(Integer, default=0)
    damaged_cases = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    depot = relationship("Depot", back_populates="stocks")
    brand = relationship("Brand", back_populates="depot_stocks")

class RetailShop(Base):
    __tablename__ = "retail_shops"

    id = Column(Integer, primary_key=True, index=True)
    shop_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    shop_type = Column(String(50), default="STANDARD_VEND") # STANDARD_VEND, ELITE_MALL_SHOP, LICENSED_BAR
    district = Column(String(50), nullable=False)
    address = Column(String(250), nullable=False)
    manager_name = Column(String(100), nullable=False)
    phone = Column(String(25), nullable=False)
    assigned_depot_id = Column(Integer, ForeignKey("depots.id"), nullable=True)
    license_number = Column(String(100), default="TN-EXC-RET-2026/0101")
    license_expiry_date = Column(DateTime, nullable=True)
    license_status = Column(String(30), default="ACTIVE") # ACTIVE, EXPIRING_SOON, EXPIRED, BLOCKED
    credit_limit = Column(Float, default=800000.0)
    current_credit_used = Column(Float, default=150000.0)
    monthly_quota_cases = Column(Integer, default=750)
    cases_ordered_this_month = Column(Integer, default=280)
    lat = Column(Float, default=13.0827)
    lng = Column(Float, default=80.2707)
    category = Column(String(50), default="STANDARD")
    kyc_status = Column(String(30), default="VERIFIED")
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("ShopOrder", back_populates="shop")
    inventories = relationship("ShopInventory", back_populates="shop")
    assigned_depot = relationship("Depot")

class SupplierConsignment(Base):
    __tablename__ = "supplier_consignments"

    id = Column(Integer, primary_key=True, index=True)
    consignment_no = Column(String(50), unique=True, index=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    depot_id = Column(Integer, ForeignKey("depots.id"), nullable=False)
    wholesale_unit = Column(String(50), nullable=True, default="Wholesale 1")
    total_cases = Column(Integer, nullable=False)
    total_value = Column(Float, nullable=False)
    status = Column(String(50), default="DISPATCHED") # DISPATCHED, IN_TRANSIT, RECEIVED
    batch_no = Column(String(50), nullable=False)
    vehicle_no = Column(String(50), nullable=False)
    driver_name = Column(String(100), nullable=True)
    driver_phone = Column(String(25), nullable=True)
    excise_permit_no = Column(String(100), nullable=True)
    grn_no = Column(String(50), nullable=True)
    breakage_bottles = Column(Integer, default=0)
    received_cases = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    received_at = Column(DateTime, nullable=True)

    supplier = relationship("Supplier")
    depot = relationship("Depot")
    items = relationship("ConsignmentItem", back_populates="consignment", cascade="all, delete-orphan")

class ConsignmentItem(Base):
    __tablename__ = "consignment_items"

    id = Column(Integer, primary_key=True, index=True)
    consignment_id = Column(Integer, ForeignKey("supplier_consignments.id"), nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    cases_dispatched = Column(Integer, nullable=False)
    case_rate = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)

    consignment = relationship("SupplierConsignment", back_populates="items")
    brand = relationship("Brand")

class ShopOrder(Base):
    __tablename__ = "shop_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String(50), unique=True, index=True, nullable=False)
    shop_id = Column(Integer, ForeignKey("retail_shops.id"), nullable=False)
    depot_id = Column(Integer, ForeignKey("depots.id"), nullable=False)
    total_cases = Column(Integer, nullable=False)
    subtotal_amount = Column(Float, nullable=False)
    tax_duty_amount = Column(Float, nullable=False)
    total_payable = Column(Float, nullable=False)
    status = Column(String(50), default="PENDING") # PENDING, APPROVED, PACKED, DISPATCHED, DELIVERED, CANCELLED
    
    # Compliance & Invoicing
    invoice_no = Column(String(50), nullable=True)
    excise_duty_amount = Column(Float, default=0.0)
    vat_gst_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    
    # Workflow Progression
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    packed_at = Column(DateTime, nullable=True)
    dispatched_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    
    # Logistics & Dispatch
    transit_pass_no = Column(String(100), nullable=True)
    vehicle_no = Column(String(50), nullable=True)
    driver_id = Column(Integer, nullable=True)
    driver_name = Column(String(100), default="K. Selvakumar")
    driver_phone = Column(String(25), default="+91 97910 88776")
    route_name = Column(String(100), default="Chennai Central Express Route #03")
    delivery_eta = Column(String(50), default="2 Hours (On Schedule)")
    
    # Proof of Delivery (POD)
    pod_otp = Column(String(10), default="4892")
    pod_signature = Column(Text, nullable=True)
    pod_photo_url = Column(Text, nullable=True)
    damaged_bottles = Column(Integer, default=0)
    shortage_cases = Column(Integer, default=0)
    
    # Payment & Empty Bottles
    payment_status = Column(String(30), default="ON_CREDIT") # UNPAID, PAID, ON_CREDIT
    payment_method = Column(String(50), default="TASMAC_CREDIT")
    returnable_crates_collected = Column(Integer, default=0)
    returnable_bottles_collected = Column(Integer, default=0)
    deposit_refund_amount = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    expected_delivery = Column(DateTime, nullable=True)

    shop = relationship("RetailShop", back_populates="orders")
    depot = relationship("Depot")
    items = relationship("ShopOrderItem", back_populates="order")

class ShopOrderItem(Base):
    __tablename__ = "shop_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("shop_orders.id"), nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    cases_ordered = Column(Integer, nullable=False)
    case_wholesale_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    order = relationship("ShopOrder", back_populates="items")
    brand = relationship("Brand")

class ShopInventory(Base):
    __tablename__ = "shop_inventories"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("retail_shops.id"), nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    cases_on_hand = Column(Integer, default=20)
    bottles_on_shelf = Column(Integer, default=40)
    daily_sales_rate = Column(Float, default=5.0) # bottles per day
    reorder_threshold_cases = Column(Integer, default=10)
    last_restocked = Column(DateTime, default=datetime.utcnow)

    shop = relationship("RetailShop", back_populates="inventories")
    brand = relationship("Brand")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    # Roles: SUPER_ADMIN, REGIONAL_MANAGER, WAREHOUSE_MANAGER, SUPPLIER_OWNER, RETAIL_SHOP_OWNER, DELIVERY_DRIVER, AUDITOR
    organization = Column(String(200), nullable=False)
    code = Column(String(50), nullable=False)
    default_stage = Column(String(50), default="suppliers")
    allowed_stages = Column(String(200), default="suppliers")
    assigned_region = Column(String(50), default="All")
    assigned_depot_id = Column(Integer, nullable=True)
    assigned_shop_id = Column(Integer, nullable=True)
    phone = Column(String(25), default="+91 98400 11000")
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class BottleReturn(Base):
    __tablename__ = "bottle_returns"

    id = Column(Integer, primary_key=True, index=True)
    return_no = Column(String(50), unique=True, index=True, nullable=False)
    shop_id = Column(Integer, ForeignKey("retail_shops.id"), nullable=False)
    depot_id = Column(Integer, ForeignKey("depots.id"), nullable=False)
    driver_name = Column(String(100), nullable=True)
    bottles_returned = Column(Integer, default=0)
    crates_returned = Column(Integer, default=0)
    bottle_deposit_rate = Column(Float, default=10.0) # Rs 10 per bottle
    crate_deposit_rate = Column(Float, default=50.0)  # Rs 50 per crate
    total_refund_amount = Column(Float, default=0.0)
    refund_status = Column(String(50), default="CREDITED_TO_LEDGER")
    created_at = Column(DateTime, default=datetime.utcnow)

    shop = relationship("RetailShop")
    depot = relationship("Depot")

class FinancialLedger(Base):
    __tablename__ = "financial_ledgers"

    id = Column(Integer, primary_key=True, index=True)
    entry_no = Column(String(50), unique=True, index=True, nullable=False)
    party_type = Column(String(50), nullable=False) # RETAIL_SHOP or SUPPLIER
    party_id = Column(Integer, nullable=False)
    party_name = Column(String(200), nullable=False)
    transaction_type = Column(String(50), nullable=False) # INVOICE_CHARGE, PAYMENT_RECEIVED, SUPPLIER_PAYOUT, BOTTLE_REFUND, DAMAGE_CREDIT
    amount = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)
    reference_id = Column(String(100), nullable=True)
    payment_mode = Column(String(50), default="ONLINE_TREASURY")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class BatchRecall(Base):
    __tablename__ = "batch_recalls"

    id = Column(Integer, primary_key=True, index=True)
    recall_no = Column(String(50), unique=True, index=True, nullable=False)
    batch_no = Column(String(50), nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    reason = Column(Text, nullable=False)
    severity = Column(String(30), default="CRITICAL") # CRITICAL, HIGH, MODERATE
    status = Column(String(30), default="ACTIVE_RECALL") # ACTIVE_RECALL, RESOLVED, INVESTIGATING
    quarantined_cases = Column(Integer, default=0)
    issued_by = Column(String(100), default="Excise Quality Directorate")
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    brand = relationship("Brand")
    supplier = relationship("Supplier")

class SystemAlert(Base):
    __tablename__ = "system_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(30), default="SMS") # WHATSAPP, SMS, EMAIL, SYSTEM
    recipient = Column(String(100), nullable=False)
    recipient_role = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="SENT")
    created_at = Column(DateTime, default=datetime.utcnow)
