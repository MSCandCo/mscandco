'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

export default function MerchandiseManagement() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State
  const [activeTab, setActiveTab] = useState('products'); // products, orders, create, analytics
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [printfulProducts, setPrintfulProducts] = useState([]);

  // Create product state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    product_type: 't-shirt',
    design_image_url: '',
    available_sizes: ['S', 'M', 'L', 'XL'],
    available_colors: ['Black', 'White'],
    is_active: true,
  });

  const productTypes = [
    { value: 't-shirt', label: 'T-Shirt', icon: '👕' },
    { value: 'hoodie', label: 'Hoodie', icon: '🧥' },
    { value: 'poster', label: 'Poster', icon: '🖼️' },
    { value: 'vinyl', label: 'Vinyl Record', icon: '💿' },
    { value: 'cd', label: 'CD', icon: '📀' },
    { value: 'hat', label: 'Hat', icon: '🧢' },
    { value: 'sticker', label: 'Stickers', icon: '✨' },
    { value: 'mug', label: 'Mug', icon: '☕' },
    { value: 'tote-bag', label: 'Tote Bag', icon: '👜' },
    { value: 'phone-case', label: 'Phone Case', icon: '📱' },
  ];

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadProducts();
        await loadOrders();
        await loadPrintfulProducts();
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function loadProducts() {
    try {
      const response = await fetch('/api/features/merch/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  async function loadOrders() {
    try {
      const response = await fetch('/api/features/merch/orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }

  async function loadPrintfulProducts() {
    try {
      const response = await fetch('/api/features/merch/printful/catalog');
      const data = await response.json();
      setPrintfulProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load Printful products:', error);
    }
  }

  async function createProduct() {
    if (!formData.name || !formData.base_price) {
      alert('Please fill in required fields: Name and Base Price');
      return;
    }

    try {
      const response = await fetch('/api/features/merch/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Product created successfully!');
        setFormData({
          name: '',
          description: '',
          base_price: '',
          product_type: 't-shirt',
          design_image_url: '',
          available_sizes: ['S', 'M', 'L', 'XL'],
          available_colors: ['Black', 'White'],
          is_active: true,
        });
        await loadProducts();
        setActiveTab('products');
      } else {
        alert('Failed to create product: ' + data.error);
      }
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to create product: ' + error.message);
    }
  }

  async function updateProduct(productId, updates) {
    try {
      const response = await fetch(`/api/features/merch/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        alert('Product updated!');
        await loadProducts();
      } else {
        alert('Failed to update product');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update: ' + error.message);
    }
  }

  async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/features/merch/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product deleted successfully');
        await loadProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete: ' + error.message);
    }
  }

  async function syncWithPrintful(productId) {
    try {
      const response = await fetch(`/api/features/merch/printful/sync/${productId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Product synced with Printful!');
        await loadProducts();
      } else {
        alert('Failed to sync: ' + data.error);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync: ' + error.message);
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      out_of_stock: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.draft;
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🛍️ Merchandise Management</h1>
          <p className="text-gray-600">
            Create, manage, and sell merchandise powered by Printful print-on-demand
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'products'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('products')}
          >
            📦 Products ({products.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'orders'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            📋 Orders ({orders.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'create'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('create')}
          >
            ➕ Create Product
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'printful'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('printful')}
          >
            🖨️ Printful Catalog
          </button>
        </div>

        {/* TAB: Products */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 mb-4">No products yet</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                    {product.design_image_url ? (
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={product.design_image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-6xl">
                          {productTypes.find(t => t.value === product.product_type)?.icon || '📦'}
                        </span>
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(product.status)}`}>
                          {product.is_active ? 'Active' : 'Draft'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-semibold capitalize">{product.product_type.replace(/-/g, ' ')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-semibold text-green-600">£{product.base_price}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sales:</span>
                          <span className="font-semibold">{product.total_sales || 0}</span>
                        </div>
                      </div>

                      {product.available_sizes && product.available_sizes.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-500">Sizes: </span>
                          {product.available_sizes.map(size => (
                            <span key={size} className="text-xs bg-gray-100 px-2 py-1 rounded mr-1">
                              {size}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                        >
                          Edit
                        </button>
                        {product.printful_product_id ? (
                          <button
                            onClick={() => syncWithPrintful(product.id)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            Sync
                          </button>
                        ) : (
                          <button
                            onClick={() => syncWithPrintful(product.id)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            Push to Printful
                          </button>
                        )}
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">📋 Merchandise Orders</h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No orders yet. Orders will appear here when customers purchase your merchandise.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">Order #{order.order_number || order.id.slice(0, 8)}</div>
                        <div className="text-sm text-gray-600">{order.customer_email}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-gray-500">Product</div>
                        <div className="font-semibold">{order.product?.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Quantity</div>
                        <div className="font-semibold">{order.quantity}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="font-semibold text-green-600">£{order.total_amount}</div>
                      </div>
                    </div>

                    {order.shipping_address && (
                      <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                        <div className="font-medium mb-1">Shipping Address:</div>
                        <div>{order.shipping_address}</div>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      Ordered: {new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Create Product */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">➕ Create New Product</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="Limited Edition Tour T-Shirt"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full h-24 px-4 py-2 border rounded-md"
                  placeholder="High-quality cotton t-shirt featuring exclusive tour artwork..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Product Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.product_type}
                  onChange={(e) => setFormData({...formData, product_type: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                >
                  {productTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Base Price (£) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="24.99"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Design Image URL</label>
                <input
                  type="url"
                  value={formData.design_image_url}
                  onChange={(e) => setFormData({...formData, design_image_url: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="https://example.com/design.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use high-resolution images (at least 2400x3200px for best results)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        const sizes = formData.available_sizes || [];
                        if (sizes.includes(size)) {
                          setFormData({...formData, available_sizes: sizes.filter(s => s !== size)});
                        } else {
                          setFormData({...formData, available_sizes: [...sizes, size]});
                        }
                      }}
                      className={`px-3 py-2 border rounded-md text-sm ${
                        formData.available_sizes?.includes(size)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Available Colors</label>
                <div className="flex flex-wrap gap-2">
                  {['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green'].map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        const colors = formData.available_colors || [];
                        if (colors.includes(color)) {
                          setFormData({...formData, available_colors: colors.filter(c => c !== color)});
                        } else {
                          setFormData({...formData, available_colors: [...colors, color]});
                        }
                      }}
                      className={`px-3 py-2 border rounded-md text-sm ${
                        formData.available_colors?.includes(color)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Make product active immediately</span>
                </label>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">🖨️ Printful Integration</h3>
              <p className="text-sm text-gray-700">
                Once created, you can sync this product with Printful for automated print-on-demand fulfillment.
                No upfront inventory costs - products are printed and shipped only when ordered.
              </p>
            </div>

            <button
              onClick={createProduct}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
            >
              Create Product
            </button>
          </div>
        )}

        {/* TAB: Printful Catalog */}
        {activeTab === 'printful' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">🖨️ Printful Product Catalog</h2>
            <p className="text-gray-600 mb-6">
              Browse available products from Printful. Select a product type to create your merchandise.
            </p>

            {printfulProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Loading Printful catalog...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {printfulProducts.map((product, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                    {product.image && (
                      <div className="h-32 mb-3 flex items-center justify-center bg-gray-50 rounded">
                        <img src={product.image} alt={product.name} className="max-h-full" />
                      </div>
                    )}
                    <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{product.description}</p>
                    {product.price && (
                      <div className="text-sm font-semibold text-green-600">
                        From £{product.price}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
