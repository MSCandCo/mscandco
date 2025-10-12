'use strict';

const stripe = require("stripe")(process.env.STRIPE_SECRET);
/**
 * stripe-utils service
 */

module.exports = () => ({
    stripeInstance: stripe
});
