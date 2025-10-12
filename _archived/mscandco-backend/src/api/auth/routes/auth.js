'use strict';

module.exports = {
  routes: [
    // Email verification
    {
      method: 'POST',
      path: '/auth/verify-email',
      handler: 'auth.verifyEmail',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // Mobile verification
    {
      method: 'POST',
      path: '/auth/verify-mobile',
      handler: 'auth.verifyMobile',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // Complete profile
    {
      method: 'POST',
      path: '/auth/complete-profile',
      handler: 'auth.completeProfile',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // Resend email verification code
    {
      method: 'POST',
      path: '/auth/resend-email-code',
      handler: 'auth.resendEmailCode',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 