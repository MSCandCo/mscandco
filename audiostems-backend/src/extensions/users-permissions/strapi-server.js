'use strict';

const crypto = require('crypto');

module.exports = (/* { strapi } */) => {
  // Save the original register controller
  const originalRegister = plugin.controllers.auth.register;

  plugin.controllers.auth.register = async (ctx) => {
    try {
      const { email, password, firstName, lastName, username } = ctx.request.body;

      // Check if user already exists
      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return ctx.badRequest('Email already registered');
      }

      // Create user with pending verification status
      const user = await strapi.query('plugin::users-permissions.user').create({
        data: {
          email: email.toLowerCase(),
          password,
          firstName,
          lastName,
          username: username || email,
          confirmed: false,
          emailVerified: false,
          mobileVerified: false,
          profileComplete: false,
          emailVerificationCode: generateVerificationCode(),
          emailVerificationExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          recoveryCodes: generateRecoveryCodes(),
          blocked: false,
          role: 1, // Default authenticated role
        }
      });

      // Send email verification code
      await sendEmailVerificationCode(user.email, user.emailVerificationCode);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
          mobileVerified: user.mobileVerified,
          profileComplete: user.profileComplete
        },
        message: 'Registration successful. Please check your email for verification code.',
        nextStep: 'email_verification'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return ctx.badRequest('Registration failed');
    }
  };

  // Email verification endpoint
  plugin.controllers.auth.verifyEmail = async (ctx) => {
    try {
      const { email, code } = ctx.request.body;

      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return ctx.badRequest('User not found');
      }

      if (user.emailVerified) {
        return ctx.badRequest('Email already verified');
      }

      if (user.emailVerificationCode !== code) {
        return ctx.badRequest('Invalid verification code');
      }

      if (new Date() > user.emailVerificationExpires) {
        return ctx.badRequest('Verification code expired');
      }

      // Update user as email verified
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationCode: null,
          emailVerificationExpires: null
        }
      });

      return {
        message: 'Email verified successfully',
        nextStep: 'mobile_verification',
        user: {
          id: user.id,
          email: user.email,
          emailVerified: true,
          mobileVerified: user.mobileVerified,
          profileComplete: user.profileComplete
        }
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return ctx.badRequest('Email verification failed');
    }
  };

  // Mobile verification endpoint
  plugin.controllers.auth.verifyMobile = async (ctx) => {
    try {
      const { email, mobileNumber, code } = ctx.request.body;

      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return ctx.badRequest('User not found');
      }

      if (!user.emailVerified) {
        return ctx.badRequest('Email must be verified first');
      }

      if (user.mobileVerified) {
        return ctx.badRequest('Mobile already verified');
      }

      // For now, we'll use a simple verification (in production, integrate with SMS service)
      // In a real implementation, you'd verify against a stored SMS code
      if (code !== '123456') { // Demo code - replace with actual SMS verification
        return ctx.badRequest('Invalid mobile verification code');
      }

      // Update user as mobile verified
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          mobileVerified: true,
          mobileNumber: mobileNumber
        }
      });

      return {
        message: 'Mobile verified successfully',
        nextStep: 'recovery_codes',
        user: {
          id: user.id,
          email: user.email,
          emailVerified: true,
          mobileVerified: true,
          profileComplete: user.profileComplete,
          recoveryCodes: user.recoveryCodes
        }
      };
    } catch (error) {
      console.error('Mobile verification error:', error);
      return ctx.badRequest('Mobile verification failed');
    }
  };

  // Complete profile endpoint
  plugin.controllers.auth.completeProfile = async (ctx) => {
    try {
      const { email, profileData } = ctx.request.body;

      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return ctx.badRequest('User not found');
      }

      if (!user.emailVerified || !user.mobileVerified) {
        return ctx.badRequest('Email and mobile must be verified first');
      }

      // Update user profile
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          ...profileData,
          profileComplete: true,
          confirmed: true // Final confirmation
        }
      });

      return {
        message: 'Profile completed successfully',
        nextStep: 'complete',
        user: {
          id: user.id,
          email: user.email,
          emailVerified: true,
          mobileVerified: true,
          profileComplete: true,
          confirmed: true
        }
      };
    } catch (error) {
      console.error('Profile completion error:', error);
      return ctx.badRequest('Profile completion failed');
    }
  };

  // Resend email verification code
  plugin.controllers.auth.resendEmailCode = async (ctx) => {
    try {
      const { email } = ctx.request.body;

      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return ctx.badRequest('User not found');
      }

      if (user.emailVerified) {
        return ctx.badRequest('Email already verified');
      }

      // Generate new verification code
      const newCode = generateVerificationCode();
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          emailVerificationCode: newCode,
          emailVerificationExpires: new Date(Date.now() + 15 * 60 * 1000)
        }
      });

      // Send new verification code
      await sendEmailVerificationCode(user.email, newCode);

      return {
        message: 'New verification code sent to your email'
      };
    } catch (error) {
      console.error('Resend email code error:', error);
      return ctx.badRequest('Failed to resend verification code');
    }
  };

  return plugin;
};

// Helper functions
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRecoveryCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

async function sendEmailVerificationCode(email, code) {
  try {
    await strapi.plugins['email'].services.email.send({
      to: email,
      from: process.env.DEFAULT_FROM_EMAIL || 'noreply@audiostems.com',
      subject: 'Verify your AudioStems account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify your AudioStems account</h2>
          <p>Your verification code is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0;">${code}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    });
    console.log(`📧 Email verification code sent to ${email}: ${code}`);
  } catch (error) {
    console.error('Failed to send email verification code:', error);
  }
} 