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
      const { user } = ctx.state;

      if (!stripe || !priceId || !user)
        return ctx.send({ error: "priceId not provided" }, 400);

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
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
          subscription.client_reference_id
        );
        await strapi.entityService.update(
          "plugin::users-permissions.user",
          subscription.client_reference_id,
          {
            data: {
              stripeCustomerId: customerId,
            },
          }
        );
        console.log(`${customerId} set to user: ${user.email}`);
        break;
      case "customer.subscription.trial_will_end":
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription trial ending.
        // handleSubscriptionTrialEnding(subscription);
        break;
      case "customer.subscription.deleted":
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription deleted.
        // handleSubscriptionDeleted(subscriptionDeleted);
        break;
      case "customer.subscription.created":
        subscription = event.data.object;
        status = subscription.status;
        customerId = subscription.customer;
        plan = subscription.plan;
        productId = plan.product;

        product = await stripe.products.retrieve(plan.product);
        planName = product.name;

        user = await strapi.db.query("plugin::users-permissions.user").findOne({
          where: { stripeCustomerId: customerId },
        });

        await strapi.entityService.update(
          "plugin::users-permissions.user",
          user.id,
          {
            data: {
              // this determines the product/package
              productId: productId,
              // this determines the price
              planId: plan.id,
              // TODO: later move this to payment success hook event
              planActive: true,
            },
          }
        );

        console.log(
          `customer.subscription.created: Subscription user: ${user.email}. Plan: ${planName}.`
        );
        // Then define and call a method to handle the subscription created.
        // handleSubscriptionCreated(subscription);
        break;
      case "customer.subscription.updated":
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription update.
        // handleSubscriptionUpdated(subscription);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    ctx.send("ok");
  },
};
