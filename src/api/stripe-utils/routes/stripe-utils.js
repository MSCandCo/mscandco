module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/stripe-utils/create-checkout-session',
     handler: 'stripe-utils.createCheckoutSession',
     config: {
       policies: [],
       middlewares: [],
     },
    },
    {
      method: 'GET',
      path: '/stripe-utils/create-portal-session',
      handler: 'stripe-utils.createPortalSession',
      config: {
        policies: [],
        middlewares: [],
      },
     },
    {
      method: 'POST',
      path: '/stripe-utils/webhook',
      handler: 'stripe-utils.webhook',
      config: {
        policies: [],
        middlewares: [],
      },
     },
  ],
};
