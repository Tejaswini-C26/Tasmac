from pydantic import BaseModel
from typing import List, Optional
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
    transit_pass_no: Optional[str] = None
    vehicle_no: Optional[str] = None
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

    class Config:
        from_attributes = True

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
    created_at: datetime
    active_brands_count: Optional[int] = 0
    total_cases_supplied: Optional[int] = 0

    class Config:
        from_attributes = True

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

class SupplierAnalyticsResponse(BaseModel):
    total_suppliers: int
    total_consignments: int
    total_inward_cases: int
    otif_percentage: float
    breakage_percentage: float
    active_licenses: int

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



