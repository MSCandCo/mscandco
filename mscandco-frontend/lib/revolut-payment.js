/**
 * Revolut Payment Processing for MSC & Co
 */

import axios from 'axios';

const REVOLUT_API_URL = process.env.REVOLUT_API_URL || 'https://sandbox-b2b.revolut.com/api/1.0';

function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.REVOLUT_API_KEY}`,
    'Content-Type': 'application/json'
  };
}

export async function createPayment(paymentData) {
  try {
    const { amount, currency, description, metadata = {} } = paymentData;
    const response = await axios.post(
      `${REVOLUT_API_URL}/orders`,
      { amount, currency, description, metadata, capture_mode: 'AUTOMATIC' },
      { headers: getHeaders() }
    );
    return { success: true, data: response.data, orderId: response.data.id };
  } catch (error) {
    console.error('Error creating payment:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

export async function getPayment(orderId) {
  try {
    const response = await axios.get(`${REVOLUT_API_URL}/orders/${orderId}`, { headers: getHeaders() });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

export function verifyWebhookSignature(payload, signature) {
  const crypto = require('crypto');
  const secret = process.env.REVOLUT_WEBHOOK_SECRET;
  if (!secret) return false;
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return signature === expectedSignature;
}

export async function processWebhook(webhookData) {
  return { success: true, event: webhookData.event };
}

export async function getRevolutPaymentDetails(orderId) {
  return getPayment(orderId);
}

export function formatAmount(amount, currency = 'GBP') {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency
  });
  return formatter.format(amount / 100); // Convert from cents
}
