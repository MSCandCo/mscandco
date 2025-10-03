import { requireAuth } from '@/lib/rbac/middleware';

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { order_id } = req.query;

  if (!order_id) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    console.log('🔍 Fetching Revolut order details for:', order_id);

    const response = await fetch(`https://sandbox-merchant.revolut.com/api/orders/${order_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.REVOLUT_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Revolut-Api-Version': '2024-09-01'
      }
    });

    const orderData = await response.json();
    
    if (!response.ok) {
      console.error('Revolut API error:', orderData);
      throw new Error(orderData.message || 'Failed to fetch order details');
    }

    console.log('✅ Order details fetched:', { 
      id: orderData.id, 
      state: orderData.state, 
      amount: orderData.amount,
      currency: orderData.currency 
    });

    res.json({
      success: true,
      data: orderData
    });

  } catch (error) {
    console.error('Failed to fetch order details:', error);
    
    // Check if it's a missing API key error
    if (error.message.includes('Authorization') || !process.env.REVOLUT_API_KEY) {
      return res.status(500).json({ 
        error: 'Revolut API not configured',
        details: 'Missing REVOLUT_API_KEY environment variable'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch payment details',
      details: error.message
    });
  }
}

export default requireAuth()(handler);
