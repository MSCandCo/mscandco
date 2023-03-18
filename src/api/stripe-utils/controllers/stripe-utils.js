"use strict";

/**
 * A set of functions called "actions" for `stripe-utils`
 */

module.exports = {
  createCheckoutSession: async (ctx, next) => {
    try {
      const stripe = strapi.service(
        "api::stripe-utils.stripe-utils"
      ).stripeInstance;
      const { priceId } = ctx.request.query;

      if (!stripe || !priceId)
        return ctx.send({ error: "priceId not provided" }, 400);

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            // For metered billing, do not pass quantity
            quantity: 1,
          },
        ],
        // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
        // the actual Session ID is returned in the query parameter when your customer
        // is redirected to the success page.
        success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/subscription/canceled`,
      });
      ctx.send(session);
    } catch (err) {
      console.log(err.message);
      ctx.send(err, 500);
    }
  },
};
