import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  listStores,
  getStore,
  listProducts,
  getProduct,
  listSyncedProducts,
  syncProduct,
  createOrder,
  getOrder,
  listOrders,
  cancelOrder,
  getShippingRates,
  uploadFile,
  getFile,
  getCategories,
  getVariant,
} from '@/lib/integrations/printful';

/**
 * GET /api/features/merchandise/printful
 * List stores, products, orders, etc.
 * 
 * POST /api/features/merchandise/printful
 * Create orders, sync products, upload files, etc.
 * 
 * DELETE /api/features/merchandise/printful
 * Cancel orders
 */
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stores'; // stores, products, orders, categories, etc.
    const storeId = searchParams.get('storeId');
    const productId = searchParams.get('productId');
    const orderId = searchParams.get('orderId');
    const fileId = searchParams.get('fileId');
    const variantId = searchParams.get('variantId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');

    switch (action) {
      case 'stores':
        // List stores
        const stores = await listStores();
        return NextResponse.json({ success: true, data: stores });

      case 'store':
        // Get store details
        if (!storeId) {
          return NextResponse.json(
            { error: 'storeId is required' },
            { status: 400 }
          );
        }
        const store = await getStore(parseInt(storeId));
        return NextResponse.json({ success: true, data: store });

      case 'products':
        // List products (catalog)
        const products = await listProducts({
          limit,
          offset,
          category_id: categoryId,
        });
        return NextResponse.json({ success: true, data: products });

      case 'product':
        // Get product details
        if (!productId) {
          return NextResponse.json(
            { error: 'productId is required' },
            { status: 400 }
          );
        }
        const product = await getProduct(parseInt(productId));
        return NextResponse.json({ success: true, data: product });

      case 'synced-products':
        // List synced products
        if (!storeId) {
          return NextResponse.json(
            { error: 'storeId is required' },
            { status: 400 }
          );
        }
        const syncedProducts = await listSyncedProducts(parseInt(storeId), {
          limit,
          offset,
        });
        return NextResponse.json({ success: true, data: syncedProducts });

      case 'orders':
        // List orders
        if (!storeId) {
          return NextResponse.json(
            { error: 'storeId is required' },
            { status: 400 }
          );
        }
        const orders = await listOrders(parseInt(storeId), {
          limit,
          offset,
          status,
        });
        return NextResponse.json({ success: true, data: orders });

      case 'order':
        // Get order details
        if (!orderId) {
          return NextResponse.json(
            { error: 'orderId is required' },
            { status: 400 }
          );
        }
        const order = await getOrder(parseInt(orderId));
        return NextResponse.json({ success: true, data: order });

      case 'categories':
        // Get product categories
        const categories = await getCategories();
        return NextResponse.json({ success: true, data: categories });

      case 'variant':
        // Get variant details
        if (!variantId) {
          return NextResponse.json(
            { error: 'variantId is required' },
            { status: 400 }
          );
        }
        const variant = await getVariant(parseInt(variantId));
        return NextResponse.json({ success: true, data: variant });

      case 'file':
        // Get file details
        if (!fileId) {
          return NextResponse.json(
            { error: 'fileId is required' },
            { status: 400 }
          );
        }
        const file = await getFile(parseInt(fileId));
        return NextResponse.json({ success: true, data: file });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Printful API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Printful data',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'order'; // order, sync-product, upload-file, shipping-rates
    const storeId = searchParams.get('storeId');
    const body = await request.json();

    switch (action) {
      case 'order':
        // Create order
        if (!storeId) {
          return NextResponse.json(
            { error: 'storeId is required' },
            { status: 400 }
          );
        }
        const order = await createOrder(parseInt(storeId), body);
        return NextResponse.json({ success: true, data: order }, { status: 201 });

      case 'sync-product':
        // Sync product to store
        if (!storeId) {
          return NextResponse.json(
            { error: 'storeId is required' },
            { status: 400 }
          );
        }
        const syncResult = await syncProduct(parseInt(storeId), body);
        return NextResponse.json({ success: true, data: syncResult }, { status: 201 });

      case 'upload-file':
        // Upload file
        if (!body.url) {
          return NextResponse.json(
            { error: 'File URL is required' },
            { status: 400 }
          );
        }
        const fileResult = await uploadFile(body.url);
        return NextResponse.json({ success: true, data: fileResult }, { status: 201 });

      case 'shipping-rates':
        // Get shipping rates
        if (!body.recipient || !body.items) {
          return NextResponse.json(
            { error: 'recipient and items are required' },
            { status: 400 }
          );
        }
        const shippingRates = await getShippingRates(body);
        return NextResponse.json({ success: true, data: shippingRates });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Printful API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create Printful resource',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    const result = await cancelOrder(parseInt(orderId));
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Printful API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to cancel order',
        message: error.message,
      },
      { status: 500 }
    );
  }
}


