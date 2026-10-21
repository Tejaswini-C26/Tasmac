# TASMAC B2B Wholesale Retail Supplier Platform

Enterprise B2B Wholesale Supply & Indent Management Platform for Retail Liquor Shops across Tamil Nadu, developed for the **Tamil Nadu State Marketing Corporation (TASMAC)**.

---

## 🌟 Key Capabilities & Features

0. **Public Landing Page & PWA Web App (`/#landing`)**:
   - Official Tamil Nadu State Marketing Corporation (TASMAC) public gateway.
   - Live interactive state grid telemetry sandbox (Distillery inward consignments, depot buffers, retail low-stock alerts, e-Pass permit layouts).
   - Approved brand price breakdown (Ex-Factory + Excise Duty + VAT = Wholesale Issue Price & Retail MRP).
   - Progressive Web App (PWA) with `manifest.json` and Service Worker for one-click installation on Desktop and Android/iOS field tablets.
   - Dual experience: Public Showcase &rarr; Authenticated ERP Workspace (`/#portal`).

1. **Brand & Price Management (`/api/brands`)**:
   - Comprehensive IMFL, Beer, Wine, and Imported spirits catalog.
   - Price calculation formula: Ex-Factory Cost + Excise Duty + VAT = Wholesale Issue Price & Retail MRP.
   - Pack size segregation (180ml, 375ml, 750ml, 650ml).
   - In-memory caching layer (`cache.py`) eliminating Supabase Tokyo cloud latency.

2. **Retail Replenishment Orders & Dispatches (`/api/orders`)**:
   - End-to-end indent management for TASMAC retail shops.
   - Sequential dispatch gating: `PENDING` → `CONFIRMED` → `DISPATCHED` → `IN_TRANSIT` → `DELIVERED`.
   - Automatic depot inventory deduction and retail shop stock crediting upon delivery confirmation.

3. **Visual Live Delivery Tracker**:
   - Interactive 4-stage visual transit telemetry timeline.
   - Status indicators with delivery truck positioning and floating info callouts.

4. **Excise Delivery Transit e-Pass Print**:
   - Official government transit permit layout with batch numbers, QR/Barcode metadata, and authorized signatory blocks.
   - Isolated single-order printing with print-specific CSS rules hiding navigational chrome, sidebar, and telemetry trackers.

5. **Retail Shop Network & Telemetry (`/api/shops`)**:
   - Live telemetry across Tamil Nadu regional districts (Chennai Central, Madurai, Coimbatore North, Trichy Town, Salem West).
   - Daily offtake velocity, low-stock threshold triggers, and real-time replenishment requests.

---

## 🛠 Tech Stack

- **Backend**: FastAPI (Python 3.10+), SQLAlchemy ORM, Uvicorn.
- **Database**: PostgreSQL (Supabase Tokyo pooler) with automatic fallback to local SQLite.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Sonner notifications.

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd Supplier/backend

# Create virtual environment (optional)
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (optional, defaults to SQLite if omitted)
cp .env.example .env

# Run FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API Documentation: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/health`

### 2. Frontend Setup

```bash
cd Supplier/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run Vite dev server
npm run dev
```

- Web Portal: `http://localhost:5173/`

### 3. One-Command Docker Full-Stack Deployment

Run both the FastAPI backend and Nginx-powered React frontend in production containers:

```bash
docker compose up --build -d
```

- Production Web App: `http://localhost/`
- API Backend: `http://localhost:8000/`

---

## 📁 Directory Structure

```text
Supplier/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & database startup seeding
│   │   ├── database.py          # SQLAlchemy connection & engine pooling
│   │   ├── models.py            # Relational database models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── cache.py             # High-performance in-memory cache
│   │   ├── seed_data.py         # Realistic Tamil Nadu distillery data seeder
│   │   └── routers/
│   │       ├── brands.py        # Brands & pricing endpoints
│   │       ├── depots.py        # Regional depots & buffer stock
│   │       ├── orders.py        # Replenishment orders & status updates
│   │       └── shops.py         # Retail shops directory & stock telemetry
│   ├── .env.example             # Safe environment configuration template
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── OrderDeliveryTracker.jsx # 4-stage visual transit tracker
│   │   │   ├── OrderDrawer.jsx          # Order creation modal
│   │   │   ├── DepotStockModal.jsx      # Depot buffer stock modal
│   │   │   └── StatusBadge.jsx          # Workflow status pill
│   │   ├── pages/
│   │   │   ├── ShopOrders.jsx           # Order & e-Pass print page
│   │   │   ├── ShopInventory.jsx        # Retail shops stock telemetry
│   │   │   ├── RetailCatalog.jsx        # Brand catalog & pricing
│   │   │   ├── DepotStock.jsx           # Depot inventory management
│   │   │   └── AddBottle.jsx            # Brand registration form
│   │   ├── services/
│   │   │   └── api.js                   # API client service
│   │   ├── App.jsx                      # Main app shell & tabs
│   │   ├── index.css                    # Tailwind & print-media stylesheet
│   │   └── main.jsx
│   ├── public/
│   │   └── brands/                      # Brand bottle imagery
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
└── README.md
```
