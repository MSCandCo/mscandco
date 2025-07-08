'use strict';

module.exports = {
  async verify(ctx) {
    const { token } = ctx.query;

    if (!token) {
      return ctx.badRequest('Verification token is required');
    }

    try {
      // Find user by confirmation token
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { confirmationToken: token },
      });

      if (!user) {
        return ctx.badRequest('Invalid or expired verification token');
      }

      // Check if token is expired (24 hours)
      const tokenCreatedAt = new Date(user.updatedAt);
      const now = new Date();
      const hoursDiff = (now - tokenCreatedAt) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        return ctx.badRequest('Verification token has expired');
      }

      // Update user to confirmed
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          confirmed: true,
          confirmationToken: null,
        },
      });

      ctx.send({
        message: 'Email verified successfully! You can now log in to your account.',
        verified: true,
      });
    } catch (error) {
      console.error('Email verification error:', error);
      ctx.badRequest('An error occurred during verification');
    }
  },
}; 