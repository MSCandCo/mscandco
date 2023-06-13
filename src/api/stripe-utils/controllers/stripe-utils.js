"use strict";

const { getCreditsCountFromPriceId } = require("../../../constants");

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
      const { user } = ctx.state;

      if (!stripe || !priceId || !user)
        return ctx.send({ error: "priceId not provided" }, 400);

      const session = await stripe.checkout.sessions.create({
        customer: user.stripeCustomerId || undefined,
        mode: "subscription",
        // TODO remove it
        client_reference_id: user.id,
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
        metadata: {
          userId: user.id
        }
      });
      ctx.send(session);
    } catch (err) {
      console.log(err.message);
      ctx.send(err, 500);
    }
  },
  webhook: async (ctx, next) => {
    const stripe = strapi.service(
      "api::stripe-utils.stripe-utils"
    ).stripeInstance;
    const request = ctx.request;
    const rawBody = request.body[Symbol.for("unparsedBody")];
    let event = request.body;
    // Replace this endpoint secret with your endpoint's unique secret
    // If you are testing with the CLI, find the secret by running 'stripe listen'
    // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
    // at https://dashboard.stripe.com/webhooks
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return ctx.send("Webhook signature verification failed", 400);
      }
    }

    let subscription;
    let status;
    let customerId;
    let user;
    let plan;
    let product;
    let planName;
    let productId;
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        subscription = event.data.object;
        customerId = subscription.customer;
        user = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          parseInt(subscription.metadata.userId)
        );
        await strapi.entityService.update(
          "plugin::users-permissions.user",
          parseInt(subscription.metadata.userId),
          {
            data: {
              stripeCustomerId: customerId,
            },
          }
        );
        console.log(`${customerId} set to user: ${user.email}`);
        break;
      case "customer.subscription.created":
        subscription = event.data.object;
        status = subscription.status;
        customerId = subscription.customer;
        plan = subscription.plan; // e.g. {id: "price_1Mn5KoFP1MiYzMK9aVsGNCSA" ...}
        productId = plan.product; // e.g. prod_NYBiJqWIBiBgFf

        product = await stripe.products.retrieve(productId);
        planName = product.name;

        const creditCount = getCreditsCountFromPriceId(plan.id);

        user = await strapi.db.query("plugin::users-permissions.user").findOne({
          where: { stripeCustomerId: customerId },
        });

        await strapi.entityService.update(
          "plugin::users-permissions.user",
          user.id,
          {
            data: {
              // useless, maybe remove?
              subscriptionId: subscription.id,
              // this determines the product/package
              productId: productId,
              // this determines the price
              planId: plan.id,
              planActive: true,
              credit: creditCount
            },
          }
        );

        console.log(
          "customer.subscription.created",
          `Subscription created for user ${user.email}. Plan/Interval/Credit: ${planName}/${plan.interval}/${creditCount}.`
        );
        break;
      // TODO complete the credit system here!
      case "customer.subscription.updated":
        subscription = event.data.object;
        status = subscription.status;
        customerId = subscription.customer;

        user = await strapi.db.query("plugin::users-permissions.user").findOne({
          where: { stripeCustomerId: customerId },
        });

        console.log(
          "customer.subscription.updated",
          `Subscription status for ${user.email} is ${status}.`
        );

        await strapi.entityService.update(
          "plugin::users-permissions.user",
          user.id,
          {
            data: {
              planActive: status === "active",
            },
          }
        );
        break;
      case "customer.subscription.deleted":
        subscription = event.data.object;
        status = subscription.status;
        customerId = subscription.customer;

        user = await strapi.db.query("plugin::users-permissions.user").findOne({
          where: { stripeCustomerId: customerId },
        });

        console.log(
          "customer.subscription.deleted",
          `Subscription deleted/ended for ${user.email}. Status: ${status}.`
        );

        await strapi.entityService.update(
          "plugin::users-permissions.user",
          user.id,
          {
            data: {
              planActive: false,
              credit: 0
            },
          }
        );
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    ctx.send("ok");
  },
};
