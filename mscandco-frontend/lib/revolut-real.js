/**
 * Revolut API integration for MSC & Co
 * Handles payment processing, wallet operations, and subscriptions
 */

import axios from 'axios';

const REVOLUT_API_URL = process.env.REVOLUT_API_URL || 'https://sandbox-b2b.revolut.com/api/1.0';

/**
 * Get Revolut API headers
 * @returns {object}
 */
function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.REVOLUT_API_KEY}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Create a Revolut payment order
 * @param {number} amount - Amount in smallest currency unit (e.g., cents)
 * @param {string} currency - Currency code (e.g., 'GBP', 'USD')
 * @param {string} description - Payment description
 * @param {object} metadata - Additional metadata
 * @returns {Promise<object>}
 */
export async function createPaymentOrder(amount, currency, description, metadata = {}) {
  try {
    const response = await axios.post(
      `${REVOLUT_API_URL}/orders`,
      {
        amount,
        currency,
        description,
        metadata
      },
      { headers: getHeaders() }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating Revolut payment order:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Create a Revolut subscription
 * @param {string} customerId - Customer ID
 * @param {object} subscriptionData - Subscription details
 * @returns {Promise<object>}
 */
export async function createSubscription(customerId, subscriptionData) {
  try {
    const response = await axios.post(
      `${REVOLUT_API_URL}/subscriptions`,
      {
        customer_id: customerId,
        ...subscriptionData
      },
      { headers: getHeaders() }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating Revolut subscription:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Add funds to wallet
 * @param {string} walletId - Wallet ID
 * @param {number} amount - Amount to add
 * @param {string} currency - Currency code
 * @returns {Promise<object>}
 */
export async function addWalletFunds(walletId, amount, currency) {
  try {
    const response = await axios.post(
      `${REVOLUT_API_URL}/wallets/${walletId}/topup`,
      {
        amount,
        currency
      },
      { headers: getHeaders() }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error adding wallet funds:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Get payment order status
 * @param {string} orderId - Order ID
 * @returns {Promise<object>}
 */
export async function getOrderStatus(orderId) {
  try {
    const response = await axios.get(
      `${REVOLUT_API_URL}/orders/${orderId}`,
      { headers: getHeaders() }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error getting order status:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Verify Revolut webhook signature
 * @param {string} payload - Webhook payload
 * @param {string} signature - Webhook signature
 * @returns {boolean}
 */
export function verifyWebhookSignature(payload, signature) {
  const crypto = require('crypto');
  const secret = process.env.REVOLUT_WEBHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}
