from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class BrandPriceResponse(BaseModel):
    id: int
    wholesale_issue_price: float
    bottled_cost: float
    mrp_per_bottle: float
    case_margin: float
    margin_percentage: float

    class Config:
        from_attributes = True

class PackRateItem(BaseModel):
    size: str
    label: str
    mrp: float
    wholesale_issue_price: float
    bottles_per_case: int

class PackRateCreate(BaseModel):
    size: str
    label: str
    mrp: float
    wholesale_issue_price: float
    bottles_per_case: int

class BrandCreate(BaseModel):
    name: str
    category: str
    sub_category: str
    strength_percentage: float = 42.8
    image_url: Optional[str] = None
    flavor_notes: Optional[str] = None
    barcode: Optional[str] = None
    batch_no: Optional[str] = None
    pack_rates: Optional[List[PackRateCreate]] = None
    initial_depot_stock: Optional[int] = 1000

class BrandResponse(BaseModel):
    id: int
    brand_code: str
    supplier_id: int
    supplier_name: Optional[str] = None
    name: str
    category: str
    sub_category: str
    pack_size: str
    bottles_per_case: int
    strength_percentage: float
    image_url: Optional[str] = None
    flavor_notes: Optional[str] = None
    barcode: Optional[str] = None
    batch_no: Optional[str] = None
    expiry_period_months: Optional[int] = 24
    is_counterfeit_protected: Optional[bool] = True
    status: str
    current_price: Optional[BrandPriceResponse] = None
    total_depot_stock: Optional[int] = 0
    pack_rates: Optional[List[PackRateItem]] = None

    class Config:
        from_attributes = True

class DepotStockResponse(BaseModel):
    depot_id: int
    depot_name: str
    region: str
    available_cases: int

class OrderItemCreate(BaseModel):
    brand_id: int
    cases_ordered: int

class OrderCreate(BaseModel):
    shop_id: int
    depot_id: int
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: str

class OrderApproveRequest(BaseModel):
    notes: Optional[str] = None

class OrderPackRequest(BaseModel):
    warehouse_notes: Optional[str] = None

class OrderDispatchRequest(BaseModel):
    driver_name: Optional[str] = "K. Selvakumar"
    driver_phone: Optional[str] = "+91 97910 88776"
    vehicle_no: Optional[str] = "TN-04-E-8812 (Eicher 14T)"
    route_name: Optional[str] = "Chennai Central - Anna Salai Corridor"
    transit_pass_no: Optional[str] = None
    delivery_eta: Optional[str] = "2 Hours"

class OrderDeliverRequest(BaseModel):
    pod_otp: str
    pod_signature: Optional[str] = None
    pod_photo_url: Optional[str] = None
    damaged_bottles: int = 0
    shortage_cases: int = 0
    returnable_crates_collected: int = 0
    returnable_bottles_collected: int = 0

class OrderItemResponse(BaseModel):
    id: int
    brand_id: int
    brand_name: str
    cases_ordered: int
    case_wholesale_price: float
    total_price: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_no: str
    shop_id: int
    shop_name: str
    depot_id: int
    depot_name: str
    total_cases: int
    subtotal_amount: float
    tax_duty_amount: float
    total_payable: float
    status: str
    invoice_no: Optional[str] = None
    excise_duty_amount: Optional[float] = 0.0
    vat_gst_amount: Optional[float] = 0.0
    discount_amount: Optional[float] = 0.0
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    packed_at: Optional[datetime] = None
    dispatched_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    transit_pass_no: Optional[str] = None
    vehicle_no: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    route_name: Optional[str] = None
    delivery_eta: Optional[str] = None
    pod_otp: Optional[str] = None
    pod_signature: Optional[str] = None
    pod_photo_url: Optional[str] = None
    damaged_bottles: Optional[int] = 0
    shortage_cases: Optional[int] = 0
    payment_status: Optional[str] = "ON_CREDIT"
    payment_method: Optional[str] = "TASMAC_CREDIT"
    returnable_crates_collected: Optional[int] = 0
    returnable_bottles_collected: Optional[int] = 0
    deposit_refund_amount: Optional[float] = 0.0
    created_at: datetime
    expected_delivery: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class DepotResponse(BaseModel):
    id: int
    code: str
    name: str
    region: str
    address: str
    manager_name: str
    phone: str
    capacity_cases: int
    total_stock_cases: Optional[int] = 0

    class Config:
        from_attributes = True

class RetailShopResponse(BaseModel):
    id: int
    shop_code: str
    name: str
    shop_type: str
    district: str
    address: str
    manager_name: str
    phone: str
    assigned_depot_id: Optional[int] = None
    license_number: Optional[str] = None
    license_expiry_date: Optional[datetime] = None
    license_status: Optional[str] = "ACTIVE"
    credit_limit: Optional[float] = 800000.0
    current_credit_used: Optional[float] = 150000.0
    monthly_quota_cases: Optional[int] = 750
    cases_ordered_this_month: Optional[int] = 280
    lat: Optional[float] = 13.0827
    lng: Optional[float] = 80.2707
    category: Optional[str] = "STANDARD"
    kyc_status: Optional[str] = "VERIFIED"

    class Config:
        from_attributes = True

class RetailShopOnboardRequest(BaseModel):
    shop_code: str
    name: str
    shop_type: str = "STANDARD_VEND"
    district: str
    address: str
    manager_name: str
    phone: str
    assigned_depot_id: Optional[int] = None
    license_number: str
    credit_limit: float = 800000.0
    monthly_quota_cases: int = 750
    category: str = "STANDARD"
    lat: Optional[float] = 13.0827
    lng: Optional[float] = 80.2707

class ShopInventoryResponse(BaseModel):
    id: int
    shop_id: int
    brand_id: int
    brand_code: str
    brand_name: str
    category: str
    pack_size: str
    image_url: Optional[str] = None
    cases_on_hand: int
    bottles_on_shelf: int
    daily_sales_rate: float
    reorder_threshold_cases: int
    mrp_per_bottle: float
    is_low_stock: bool

    class Config:
        from_attributes = True

class SupplierResponse(BaseModel):
    id: int
    supplier_code: str
    name: str
    category: str
    gstin: str
    excise_license_no: str
    contact_person: str
    email: str
    phone: str
    district: str
    state: str
    status: str
    kyc_status: Optional[str] = "APPROVED"
    pan_number: Optional[str] = "AAACT1234F"
    bank_account_no: Optional[str] = "04120100004589"
    bank_ifsc: Optional[str] = "SBIN0001234"
    bank_name: Optional[str] = "State Bank of India"
    contract_terms: Optional[str] = None
    payout_balance: Optional[float] = 485000.0
    rating: Optional[float] = 4.8
    created_at: datetime
    active_brands_count: Optional[int] = 0
    total_cases_supplied: Optional[int] = 0

    class Config:
        from_attributes = True

class SupplierKYCUpdateRequest(BaseModel):
    kyc_status: str # APPROVED, REJECTED, PENDING
    contract_terms: Optional[str] = None

class SupplierPayoutRequest(BaseModel):
    amount: float
    payment_mode: str = "RTGS_STATE_BANK"
    notes: Optional[str] = None

class SupplierAnalyticsResponse(BaseModel):
    total_suppliers: int
    total_consignments: int
    total_inward_cases: int
    otif_percentage: float
    breakage_percentage: float
    active_licenses: int

class ConsignmentItemCreate(BaseModel):
    brand_id: int
    cases_dispatched: int

class ConsignmentCreate(BaseModel):
    supplier_id: int
    depot_id: int
    batch_no: str
    vehicle_no: str
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    excise_permit_no: Optional[str] = None
    items: List[ConsignmentItemCreate]

class ConsignmentReceiveGRN(BaseModel):
    breakage_bottles: int = 0
    remarks: Optional[str] = None

class ConsignmentItemResponse(BaseModel):
    id: int
    brand_id: int
    brand_name: str
    cases_dispatched: int
    case_rate: float
    total_amount: float

    class Config:
        from_attributes = True

class ConsignmentResponse(BaseModel):
    id: int
    consignment_no: str
    supplier_id: int
    supplier_name: str
    depot_id: int
    depot_name: str
    total_cases: int
    total_value: float
    status: str
    batch_no: str
    vehicle_no: str
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    excise_permit_no: Optional[str] = None
    grn_no: Optional[str] = None
    breakage_bottles: Optional[int] = 0
    received_cases: Optional[int] = None
    created_at: datetime
    received_at: Optional[datetime] = None
    items: List[ConsignmentItemResponse] = []

    class Config:
        from_attributes = True

class BottleReturnCreate(BaseModel):
    shop_id: int
    depot_id: int
    driver_name: Optional[str] = "K. Selvakumar"
    bottles_returned: int
    crates_returned: int
    bottle_deposit_rate: float = 10.0
    crate_deposit_rate: float = 50.0

class BottleReturnResponse(BaseModel):
    id: int
    return_no: str
    shop_id: int
    shop_name: Optional[str] = None
    depot_id: int
    depot_name: Optional[str] = None
    driver_name: Optional[str] = None
    bottles_returned: int
    crates_returned: int
    bottle_deposit_rate: float
    crate_deposit_rate: float
    total_refund_amount: float
    refund_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class FinancialLedgerResponse(BaseModel):
    id: int
    entry_no: str
    party_type: str
    party_id: int
    party_name: str
    transaction_type: str
    amount: float
    balance_after: float
    reference_id: Optional[str] = None
    payment_mode: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BatchRecallCreate(BaseModel):
    batch_no: str
    brand_id: Optional[int] = None
    supplier_id: Optional[int] = None
    reason: str
    severity: str = "CRITICAL"
    issued_by: Optional[str] = "Excise Quality Directorate"

class BatchRecallResponse(BaseModel):
    id: int
    recall_no: str
    batch_no: str
    brand_id: Optional[int] = None
    brand_name: Optional[str] = None
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    reason: str
    severity: str
    status: str
    quarantined_cases: int
    issued_by: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CounterfeitCheckRequest(BaseModel):
    qr_code_or_serial: str

class CounterfeitCheckResponse(BaseModel):
    is_authentic: bool
    serial_number: str
    brand_name: str
    distillery_name: str
    batch_number: str
    bottling_date: str
    excise_stamp_no: str
    duty_paid_status: str
    verification_hash: str
    tamper_status: str

class UserLoginRequest(BaseModel):
    username_or_email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    organization: str
    code: str
    default_stage: str
    allowed_stages: List[str] = []
    is_active: bool

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
