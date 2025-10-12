'use strict';

module.exports = (plugin) => {
  // Override the registration controller
  if (plugin.controllers && plugin.controllers.auth) {
    plugin.controllers.auth.register = async (ctx) => {
      const { email, password, username } = ctx.request.body;

      try {
        // Create user with email verification
        const user = await strapi.query('plugin::users-permissions.user').create({
          data: {
            email,
            password,
            username,
            confirmed: false,
            emailVerificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
            emailVerificationExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          },
        });

        // Send verification email
        try {
          await strapi.plugins['email'].services.email.send({
            to: email,
            from: 'noreply@audiostems.com',
            subject: 'Verify your AudioStems account',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Verify your AudioStems account</h2>
                <p>Your verification code is:</p>
                <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                  <h1 style="color: #007bff; font-size: 32px; margin: 0;">${user.emailVerificationCode}</h1>
                </div>
                <p>This code will expire in 15 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
              </div>
            `,
          });
          console.log(`📧 Email verification code sent to ${email}: ${user.emailVerificationCode}`);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
        }

        ctx.send({
          jwt: strapi.plugins['users-permissions'].services.jwt.issue({
            id: user.id,
          }),
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            confirmed: user.confirmed,
          },
        });
      } catch (error) {
        ctx.badRequest('Registration failed', { error: error.message });
      }
    };
  }

  return plugin;
};
