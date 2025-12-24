/**
 * Printful API Integration
 * 
 * API Documentation: https://developers.printful.com/
 * Base URL: https://api.printful.com/
 * Authentication: Bearer Token (API Key)
 */

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const PRINTFUL_BASE_URL = 'https://api.printful.com';

/**
 * Make authenticated request to Printful API
 * @param {string} endpoint - API endpoint (e.g., '/stores')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
async function apiRequest(endpoint, options = {}) {
  if (!PRINTFUL_API_KEY) {
    throw new Error('PRINTFUL_API_KEY is not configured');
  }

  const url = `${PRINTFUL_BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (data.code && data.code >= 400) {
      throw new Error(`Printful API error: ${data.code} - ${data.result || data.message || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.error('Printful API error:', error);
    throw error;
  }
}

/**
 * List stores
 * @returns {Promise<Object>} Stores data
 */
export async function listStores() {
  return apiRequest('/stores');
}

/**
 * Get store details
 * @param {number} storeId - Store ID
 * @returns {Promise<Object>} Store data
 */
export async function getStore(storeId) {
  return apiRequest(`/stores/${storeId}`);
}

/**
 * List products (catalog)
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Results per page (default: 20, max: 100)
 * @param {number} params.offset - Offset for pagination
 * @param {string} params.category_id - Filter by category ID
 * @returns {Promise<Object>} Products data
 */
export async function listProducts(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());
  if (params.category_id) queryParams.set('category_id', params.category_id);

  const queryString = queryParams.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest(endpoint);
}

/**
 * Get product details
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Product data
 */
export async function getProduct(productId) {
  return apiRequest(`/products/${productId}`);
}

/**
 * List synced products
 * @param {number} storeId - Store ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Synced products data
 */
export async function listSyncedProducts(storeId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = `/stores/${storeId}/sync/products${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest(endpoint);
}

/**
 * Sync a product to store
 * @param {number} storeId - Store ID
 * @param {Object} syncData - Sync data
 * @param {number} syncData.external_id - External product ID
 * @param {number} syncData.sync_product_id - Sync product ID (if updating)
 * @param {string} syncData.name - Product name
 * @param {Object[]} syncData.sync_variants - Variants array
 * @returns {Promise<Object>} Sync result
 */
export async function syncProduct(storeId, syncData) {
  return apiRequest(`/stores/${storeId}/sync/products`, {
    method: 'POST',
    body: JSON.stringify(syncData),
  });
}

/**
 * Create an order
 * @param {number} storeId - Store ID
 * @param {Object} orderData - Order data
 * @param {Object} orderData.recipient - Recipient information
 * @param {Object[]} orderData.items - Order items
 * @param {Object} orderData.options - Order options
 * @returns {Promise<Object>} Created order data
 */
export async function createOrder(storeId, orderData) {
  return apiRequest(`/orders`, {
    method: 'POST',
    body: JSON.stringify({
      ...orderData,
      store_id: storeId,
    }),
  });
}

/**
 * Get order details
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order data
 */
export async function getOrder(orderId) {
  return apiRequest(`/orders/${orderId}`);
}

/**
 * List orders
 * @param {number} storeId - Store ID
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Results per page
 * @param {number} params.offset - Offset for pagination
 * @param {string} params.status - Filter by status
 * @returns {Promise<Object>} Orders data
 */
export async function listOrders(storeId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());
  if (params.status) queryParams.set('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = `/stores/${storeId}/orders${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest(endpoint);
}

/**
 * Cancel an order
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Cancellation result
 */
export async function cancelOrder(orderId) {
  return apiRequest(`/orders/${orderId}`, {
    method: 'DELETE',
  });
}

/**
 * Get shipping rates
 * @param {Object} shippingData - Shipping calculation data
 * @param {Object} shippingData.recipient - Recipient address
 * @param {Object[]} shippingData.items - Items array
 * @returns {Promise<Object>} Shipping rates
 */
export async function getShippingRates(shippingData) {
  return apiRequest('/shipping/rates', {
    method: 'POST',
    body: JSON.stringify(shippingData),
  });
}

/**
 * Upload a file
 * @param {string} fileUrl - URL of the file to upload
 * @returns {Promise<Object>} File upload result
 */
export async function uploadFile(fileUrl) {
  return apiRequest('/files', {
    method: 'POST',
    body: JSON.stringify({
      url: fileUrl,
    }),
  });
}

/**
 * Get file details
 * @param {number} fileId - File ID
 * @returns {Promise<Object>} File data
 */
export async function getFile(fileId) {
  return apiRequest(`/files/${fileId}`);
}

/**
 * Get product categories
 * @returns {Promise<Object>} Categories data
 */
export async function getCategories() {
  return apiRequest('/categories');
}

/**
 * Get product variant details
 * @param {number} variantId - Variant ID
 * @returns {Promise<Object>} Variant data
 */
export async function getVariant(variantId) {
  return apiRequest(`/products/variant/${variantId}`);
}


