# ✅ Printful Integration - COMPLETE

## Summary

Printful API integration has been successfully set up and configured.

---

## ✅ What Was Done

### 1. API Credentials
- ✅ API Token added to `.env.local` as `PRINTFUL_API_KEY`
- ✅ Token added to Vercel (Production, Preview, Development)
- ✅ API token tested and verified working

### 2. Integration Code Created
- ✅ `lib/integrations/printful.js` - Core API client library
  - `listStores()` - List stores
  - `getStore()` - Get store details
  - `listProducts()` - List products (catalog)
  - `getProduct()` - Get product details
  - `listSyncedProducts()` - List synced products
  - `syncProduct()` - Sync product to store
  - `createOrder()` - Create order
  - `getOrder()` - Get order details
  - `listOrders()` - List orders
  - `cancelOrder()` - Cancel order
  - `getShippingRates()` - Get shipping rates
  - `uploadFile()` - Upload file
  - `getFile()` - Get file details
  - `getCategories()` - Get product categories
  - `getVariant()` - Get variant details

### 3. API Route Created
- ✅ `app/api/features/merchandise/printful/route.js` - REST API endpoint
  - `GET` - List stores, products, orders, categories, etc.
  - `POST` - Create orders, sync products, upload files, get shipping rates
  - `DELETE` - Cancel orders
  - Requires authentication

---

## 📋 Environment Variables

### Local (.env.local)
```bash
PRINTFUL_API_KEY=DXFTiNsjpZLpqR9FeBB2cgq8PJBcKncegrFBY6lf
```

### Vercel
✅ Added to Production, Preview, and Development environments

---

## 🔌 API Usage Examples

### List Stores
```javascript
const response = await fetch('/api/features/merchandise/printful?action=stores');
const data = await response.json();
```

### List Products (Catalog)
```javascript
const response = await fetch('/api/features/merchandise/printful?action=products&limit=20&offset=0');
const data = await response.json();
```

### Get Product Details
```javascript
const response = await fetch('/api/features/merchandise/printful?action=product&productId=123');
const data = await response.json();
```

### List Synced Products
```javascript
const response = await fetch('/api/features/merchandise/printful?action=synced-products&storeId=123');
const data = await response.json();
```

### Sync Product to Store
```javascript
const response = await fetch('/api/features/merchandise/printful?action=sync-product&storeId=123', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    external_id: 'product-123',
    name: 'Artist T-Shirt',
    sync_variants: [
      {
        external_id: 'variant-123',
        variant_id: 4011, // Printful variant ID
        retail_price: '29.99',
        files: [
          {
            type: 'front',
            url: 'https://example.com/design.png',
          }
        ]
      }
    ]
  })
});
const data = await response.json();
```

### Create Order
```javascript
const response = await fetch('/api/features/merchandise/printful?action=order&storeId=123', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipient: {
      name: 'John Doe',
      address1: '123 Main St',
      city: 'London',
      state_code: 'ENG',
      country_code: 'GB',
      zip: 'SW1A 1AA',
    },
    items: [
      {
        sync_variant_id: 12345,
        quantity: 1,
      }
    ],
  })
});
const data = await response.json();
```

### Get Order Details
```javascript
const response = await fetch('/api/features/merchandise/printful?action=order&orderId=123');
const data = await response.json();
```

### List Orders
```javascript
const response = await fetch('/api/features/merchandise/printful?action=orders&storeId=123&status=draft');
const data = await response.json();
```

### Get Shipping Rates
```javascript
const response = await fetch('/api/features/merchandise/printful?action=shipping-rates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipient: {
      country_code: 'GB',
      state_code: 'ENG',
      city: 'London',
      zip: 'SW1A 1AA',
    },
    items: [
      {
        variant_id: 4011,
        quantity: 1,
      }
    ],
  })
});
const data = await response.json();
```

### Upload File
```javascript
const response = await fetch('/api/features/merchandise/printful?action=upload-file', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com/design.png',
  })
});
const data = await response.json();
```

### Get Categories
```javascript
const response = await fetch('/api/features/merchandise/printful?action=categories');
const data = await response.json();
```

### Cancel Order
```javascript
const response = await fetch('/api/features/merchandise/printful?orderId=123', {
  method: 'DELETE',
});
const data = await response.json();
```

---

## 📚 API Endpoints

### Printful API
- **Base URL**: `https://api.printful.com/`
- **Authentication**: Bearer Token (API Key)
- **Header**: `Authorization: Bearer {PRINTFUL_API_KEY}`
- **Rate Limits**: 120 requests per minute (free tier)

### Our API Route
- **Endpoint**: `/api/features/merchandise/printful`
- **Methods**: `GET`, `POST`, `DELETE`
- **Auth**: Required (Supabase session)

### Query Parameters (GET)
- `action` - `stores` | `store` | `products` | `product` | `synced-products` | `orders` | `order` | `categories` | `variant` | `file` (default: `stores`)
- `storeId` - Store ID (required for store, synced-products, orders)
- `productId` - Product ID (required for product)
- `orderId` - Order ID (required for order)
- `variantId` - Variant ID (required for variant)
- `fileId` - File ID (required for file)
- `limit` - Results per page (default: 20, max: 100)
- `offset` - Offset for pagination (default: 0)
- `status` - Filter orders by status
- `categoryId` - Filter products by category

---

## 🎯 Next Steps

1. ✅ **Integration Complete** - Ready to use
2. ⏳ **UI Components** - Create React components for merchandise management
3. ⏳ **Database Schema** - Create `merchandise_products` and `merchandise_orders` tables
4. ⏳ **Product Catalog** - Display Printful product catalog
5. ⏳ **Order Management** - Create and track orders
6. ⏳ **Design Upload** - Allow artists to upload designs
7. ⏳ **Store Setup** - Guide artists through Printful store setup

---

## 📖 Documentation

- **Printful API Docs**: https://developers.printful.com/
- **Integration Code**: `lib/integrations/printful.js`
- **API Route**: `app/api/features/merchandise/printful/route.js`

---

## ✅ Status: READY FOR USE

The Printful integration is fully configured and ready to be used in the application.


