module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/verify-email',
      handler: 'verify-email.verify',
      config: {
        auth: false,
      },
    },
  ],
}; 