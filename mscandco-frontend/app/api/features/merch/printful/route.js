import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Printful API client wrapper
class PrintfulClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.printful.com';
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Printful API error');
    }

    return data.result;
  }

  async createProduct(productData) {
    return this.request('/store/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async getProducts() {
    return this.request('/store/products');
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(orderId) {
    return this.request(`/orders/@${orderId}`);
  }

  async getCatalog() {
    return this.request('/products');
  }

  async getVariants(productId) {
    return this.request(`/products/${productId}`);
  }

  async estimateShipping(orderData) {
    return this.request('/shipping/rates', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
}

// POST: Create new merch product
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      action, // 'create_product', 'sync_order', 'get_catalog'
      product_type, // 't-shirt', 'hoodie', 'poster', etc.
      name,
      design_url,
      variants = [], // sizes, colors
      retail_price,
      release_id,
    } = await request.json();

    if (!process.env.PRINTFUL_API_KEY) {
      return NextResponse.json({
        error: 'Printful not configured',
      }, { status: 500 });
    }

    const printful = new PrintfulClient(process.env.PRINTFUL_API_KEY);

    // Handle different actions
    if (action === 'get_catalog') {
      const catalog = await printful.getCatalog();
      return NextResponse.json({ success: true, catalog });
    }

    if (action === 'create_product') {
      if (!name || !design_url) {
        return NextResponse.json({
          error: 'name and design_url required for product creation',
        }, { status: 400 });
      }

      // Map product type to Printful product ID
      const productMapping = {
        't-shirt': 71, // Unisex Staple T-Shirt
        'hoodie': 380, // Unisex Heavy Blend Hoodie
        'poster': 1, // Enhanced Matte Paper Poster
        'mug': 19, // White Glossy Mug
        'tote-bag': 178, // All-Over Print Tote
      };

      const printfulProductId = productMapping[product_type];

      if (!printfulProductId) {
        return NextResponse.json({
          error: `Unsupported product type: ${product_type}`,
        }, { status: 400 });
      }

      // Get product variants
      const productInfo = await printful.getVariants(printfulProductId);

      // Create sync product with variants
      const syncProductData = {
        sync_product: {
          name: name,
          thumbnail: design_url,
        },
        sync_variants: variants.map((variant, index) => {
          const printfulVariant = productInfo.variants.find(
            v => v.size === variant.size && v.color === variant.color
          );

          return {
            retail_price: retail_price || '25.00',
            variant_id: printfulVariant?.id || productInfo.variants[index]?.id,
            files: [
              {
                type: 'front',
                url: design_url,
              },
            ],
          };
        }),
      };

      const printfulProduct = await printful.createProduct(syncProductData);

      // Save to database
      const { data: product, error: dbError } = await supabase
        .from('merchandise_products')
        .insert({
          user_id: user.id,
          release_id,
          name,
          product_type,
          design_url,
          printful_sync_product_id: printfulProduct.id,
          printful_sync_variants: printfulProduct.sync_variants,
          retail_price: parseFloat(retail_price || 25),
          variants,
          provider: 'printful',
          status: 'active',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return NextResponse.json({
        success: true,
        product,
        printful_product: printfulProduct,
      });
    }

    if (action === 'sync_order') {
      // Handle order fulfillment via Printful
      const { order_id } = await request.json();

      const { data: order } = await supabase
        .from('merchandise_orders')
        .select('*, merchandise_products(*)')
        .eq('id', order_id)
        .eq('user_id', user.id)
        .single();

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Create Printful order
      const printfulOrderData = {
        recipient: {
          name: order.customer_name,
          address1: order.shipping_address.line1,
          city: order.shipping_address.city,
          state_code: order.shipping_address.state,
          country_code: order.shipping_address.country,
          zip: order.shipping_address.postal_code,
          email: order.customer_email,
        },
        items: [
          {
            sync_variant_id: order.merchandise_products.printful_sync_variants[0]?.id,
            quantity: order.quantity,
          },
        ],
        retail_costs: {
          currency: 'GBP',
          subtotal: order.subtotal,
          shipping: order.shipping_cost,
          tax: order.tax,
        },
      };

      const printfulOrder = await printful.createOrder(printfulOrderData);

      // Update order with Printful ID
      await supabase
        .from('merchandise_orders')
        .update({
          printful_order_id: printfulOrder.id,
          status: 'processing',
          fulfillment_provider: 'printful',
        })
        .eq('id', order_id);

      return NextResponse.json({
        success: true,
        printful_order: printfulOrder,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Printful API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Retrieve products or order status
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const order_id = searchParams.get('order_id');

    if (!process.env.PRINTFUL_API_KEY) {
      return NextResponse.json({
        error: 'Printful not configured',
      }, { status: 500 });
    }

    const printful = new PrintfulClient(process.env.PRINTFUL_API_KEY);

    if (action === 'get_products') {
      const products = await printful.getProducts();
      return NextResponse.json({ success: true, products });
    }

    if (action === 'get_order_status' && order_id) {
      const { data: order } = await supabase
        .from('merchandise_orders')
        .select('printful_order_id')
        .eq('id', order_id)
        .eq('user_id', user.id)
        .single();

      if (!order || !order.printful_order_id) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const printfulOrder = await printful.getOrder(order.printful_order_id);

      // Update local status
      await supabase
        .from('merchandise_orders')
        .update({
          status: printfulOrder.status,
          tracking_number: printfulOrder.shipments?.[0]?.tracking_number,
          tracking_url: printfulOrder.shipments?.[0]?.tracking_url,
        })
        .eq('id', order_id);

      return NextResponse.json({
        success: true,
        order: printfulOrder,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Printful GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
