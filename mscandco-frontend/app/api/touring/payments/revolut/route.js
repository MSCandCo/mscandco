/**
 * Touring Platform - Revolut Payment Integration
 * Handle payments for tour expenses, crew payments, and revenue
 */

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { 
      amount, 
      currency = 'GBP', 
      description, 
      tourId, 
      tourDateId,
      type, // 'expense', 'crew_payment', 'revenue', 'hotel', 'travel'
      metadata = {}
    } = body;
    
    if (!amount || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, description, type' },
        { status: 400 }
      );
    }
    
    const revolutApiUrl = process.env.REVOLUT_API_URL || 'https://sandbox-merchant.revolut.com/api/1.0';
    const revolutApiKey = process.env.REVOLUT_API_KEY;
    
    if (!revolutApiKey) {
      console.error('REVOLUT_API_KEY not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }
    
    // Create payment order
    const paymentData = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      description: description,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        tour_id: tourId || null,
        tour_date_id: tourDateId || null,
        payment_type: type,
        ...metadata
      },
      settlement_currency: currency,
      capture_mode: 'AUTOMATIC'
    };
    
    try {
      const response = await fetch(`${revolutApiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${revolutApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Revolut API error:', errorData);
        throw new Error(errorData.message || 'Failed to create payment order');
      }
      
      const orderData = await response.json();
      
      // Store payment record in database
      const paymentRecord = {
        user_id: user.id,
        tour_id: tourId || null,
        tour_date_id: tourDateId || null,
        type: type,
        amount: amount,
        currency: currency,
        description: description,
        revolut_order_id: orderData.id,
        status: 'pending',
        metadata: metadata
      };
      
      // Insert into appropriate table based on type
      if (type === 'expense') {
        await supabase.from('tour_expenses').insert({
          tour_id: tourId,
          tour_date_id: tourDateId,
          category: metadata.category || 'other',
          amount: amount,
          description: description,
          date: new Date().toISOString(),
          submitted_by: user.id,
          payment_method: 'revolut',
          revolut_order_id: orderData.id,
          status: 'pending'
        });
      } else if (type === 'revenue') {
        await supabase.from('tour_revenue').insert({
          tour_date_id: tourDateId,
          source: metadata.source || 'other',
          amount: amount,
          description: description,
          payment_method: 'revolut',
          reference_number: orderData.id,
          recorded_by: user.id,
          revolut_order_id: orderData.id
        });
      }
      
      return NextResponse.json({
        success: true,
        paymentUrl: orderData.checkout_url || orderData.public_id,
        orderId: orderData.id,
        payment: paymentRecord
      });
      
    } catch (revolutError) {
      console.error('Revolut payment creation error:', revolutError);
      return NextResponse.json(
        { 
          error: 'Failed to create payment',
          details: revolutError.message 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Touring payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Get payment status
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const tourId = searchParams.get('tourId');
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId required' },
        { status: 400 }
      );
    }
    
    const revolutApiUrl = process.env.REVOLUT_API_URL || 'https://sandbox-merchant.revolut.com/api/1.0';
    const revolutApiKey = process.env.REVOLUT_API_KEY;
    
    if (!revolutApiKey) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }
    
    // Get order status from Revolut
    const response = await fetch(`${revolutApiUrl}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${revolutApiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch order status');
    }
    
    const orderData = await response.json();
    
    return NextResponse.json({
      success: true,
      order: orderData,
      status: orderData.state // COMPLETED, PENDING, CANCELLED, etc.
    });
    
  } catch (error) {
    console.error('Get payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status', details: error.message },
      { status: 500 }
    );
  }
}

