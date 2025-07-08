module.exports = (plugin) => {
  // Add custom email verification endpoint
  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/auth/verify-email',
    handler: 'auth.verifyEmail',
    config: {
      auth: false,
    },
  });

  // Add verifyEmail controller
  plugin.controllers.auth.verifyEmail = async (ctx) => {
    const { code, email } = ctx.request.body;

    if (!code || !email) {
      return ctx.badRequest('Code and email are required');
    }

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { email },
    });

    if (!user) {
      return ctx.badRequest('User not found');
    }

    if (user.emailVerificationCode !== code) {
      return ctx.badRequest('Invalid verification code');
    }

    if (new Date() > new Date(user.emailVerificationExpires)) {
      return ctx.badRequest('Verification code has expired');
    }

    // Update user as verified
    await strapi.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: {
        confirmed: true,
        emailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpires: null,
      },
    });

    ctx.send({
      message: 'Email verified successfully',
    });
  };

  return plugin;
}; 