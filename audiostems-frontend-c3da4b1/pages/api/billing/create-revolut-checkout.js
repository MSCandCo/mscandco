// 🚀 Revolut Checkout Session API
// Create payment links for subscriptions with 0.8% fees

import { createRevolutCheckout } from '../../../lib/revolut';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      priceId, 
      customerId, 
      successUrl, 
      cancelUrl, 
      userEmail, 
      userId 
    } = req.body;

    // Validate required fields
    if (!priceId || !userEmail || !userId) {
      return res.status(400).json({ 
        message: 'Missing required fields: priceId, userEmail, userId' 
      });
    }

    // Map price IDs to plan data (keeping same structure as Stripe for easy migration)
    const planMapping = {
      // Artist Plans
      'price_1Rsf8jEbz7hJzxJVL4PddB68': { 
        amount: 9.99, 
        currency: 'GBP', 
        planType: 'artist_starter',
        interval: 'monthly',
        description: 'Artist Starter Monthly Subscription'
      },
      'price_1Rsf95Ebz7hJzxJVdsKFDu6v': { 
        amount: 99.99, 
        currency: 'GBP', 
        planType: 'artist_starter',
        interval: 'yearly',
        description: 'Artist Starter Yearly Subscription'
      },
      'price_1RsfC6Ebz7hJzxJVunfzoZUD': { 
        amount: 19.99, 
        currency: 'GBP', 
        planType: 'artist_pro',
        interval: 'monthly',
        description: 'Artist Pro Monthly Subscription'
      },
      'price_1RsfCLEbz7hJzxJV1LnfFIcS': { 
        amount: 199.99, 
        currency: 'GBP', 
        planType: 'artist_pro',
        interval: 'yearly',
        description: 'Artist Pro Yearly Subscription'
      },
      
      // Label Admin Plans
      'price_1RsfCvEbz7hJzxJV5Ev8mZk6': { 
        amount: 29.99, 
        currency: 'GBP', 
        planType: 'label_admin_starter',
        interval: 'monthly',
        description: 'Label Admin Starter Monthly Subscription'
      },
      'price_1RsfD7Ebz7hJzxJVmS7BGMGH': { 
        amount: 299.99, 
        currency: 'GBP', 
        planType: 'label_admin_starter',
        interval: 'yearly',
        description: 'Label Admin Starter Yearly Subscription'
      },
      'price_1Rsph0Ebz7hJzxJVEHqJ8sye': { 
        amount: 49.99, 
        currency: 'GBP', 
        planType: 'label_admin_pro',
        interval: 'monthly',
        description: 'Label Admin Pro Monthly Subscription'
      },
      'price_1RsphDEbz7hJzxJVk4smCHyg': { 
        amount: 499.99, 
        currency: 'GBP', 
        planType: 'label_admin_pro',
        interval: 'yearly',
        description: 'Label Admin Pro Yearly Subscription'
      }
    };

    const planData = planMapping[priceId];
    if (!planData) {
      return res.status(400).json({ message: 'Invalid price ID' });
    }

    // Create Revolut payment link
    const checkoutSession = await createRevolutCheckout(
      planData,
      { userId, userEmail }
    );

    console.log('✅ Revolut checkout created:', {
      paymentId: checkoutSession.id,
      amount: planData.amount,
      planType: planData.planType,
      userEmail
    });

    // Return payment URL (same format as Stripe for easy frontend migration)
    res.status(200).json({ 
      url: checkoutSession.url,
      paymentId: checkoutSession.id,
      planData: {
        ...planData,
        revolutFees: calculateRevolutFees(planData.amount)
      }
    });

  } catch (error) {
    console.error('Error creating Revolut checkout:', error);
    res.status(500).json({ 
      error: error.message || 'Error creating checkout session' 
    });
  }
}

// Helper to calculate fee breakdown
function calculateRevolutFees(amount) {
  const revolutFee = amount * 0.008; // 0.8%
  const netAmount = amount - revolutFee;
  
  return {
    grossAmount: amount,
    revolutFee: Number(revolutFee.toFixed(2)),
    netAmount: Number(netAmount.toFixed(2)),
    feePercentage: '0.8%',
    savings: {
      stripeFee: amount * 0.029, // 2.9%
      revolutFee: revolutFee,
      savings: Number((amount * 0.029 - revolutFee).toFixed(2)),
      savingsPercentage: '72%'
    }
  };
}
