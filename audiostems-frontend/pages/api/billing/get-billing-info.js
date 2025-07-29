import { stripe } from '../../../lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    // Get customer information
    const customer = await stripe.customers.retrieve(customerId);
    
    // Get subscription information
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    // Get invoice history
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

    // Get upcoming invoice
    let upcomingInvoice = null;
    if (subscriptions.data.length > 0) {
      try {
        upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          customer: customerId,
          subscription: subscriptions.data[0].id,
        });
      } catch (error) {
        console.log('No upcoming invoice available');
      }
    }

    const billingInfo = {
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
      },
      subscription: subscriptions.data[0] || null,
      paymentMethods: paymentMethods.data,
      invoices: invoices.data,
      upcomingInvoice,
    };

    res.status(200).json(billingInfo);
  } catch (error) {
    console.error('Error fetching billing info:', error);
    res.status(500).json({ 
      message: 'Error fetching billing information',
      error: error.message 
    });
  }
} 