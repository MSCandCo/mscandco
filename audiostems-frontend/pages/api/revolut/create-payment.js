export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'GBP', description, userEmail } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Your Revolut Business API integration
    const revolutResponse = await fetch('https://sandbox-merchant.revolut.com/api/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REVOLUT_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Revolut-Api-Version': '2024-09-01'
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to pence
        currency: currency,
        description: description || 'Wallet Top-up',
        merchant_order_ext_ref: `order-${Date.now()}`,
        customer_email: userEmail,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?payment=success`,
        failure_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?payment=failed`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?payment=cancelled`
      })
    });

    const revolutData = await revolutResponse.json();
    
    if (!revolutResponse.ok) {
      console.error('Revolut API error:', revolutData);
      throw new Error(revolutData.message || 'Revolut API error');
    }

    res.json({ 
      paymentUrl: revolutData.checkout_url,
      orderId: revolutData.id 
    });

  } catch (error) {
    console.error('Revolut payment creation failed:', error);
    
    // Check if it's a missing API key error
    if (error.message.includes('Authorization') || !process.env.REVOLUT_API_KEY) {
      return res.status(500).json({ 
        error: 'Revolut API not configured',
        details: 'Missing REVOLUT_API_KEY environment variable'
      });
    }
    
    res.status(500).json({ 
      error: 'Payment creation failed',
      details: error.message
    });
  }
}
