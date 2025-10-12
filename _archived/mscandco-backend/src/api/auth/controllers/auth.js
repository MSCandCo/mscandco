'use strict';

const crypto = require('crypto');

module.exports = {
  async verifyEmail(ctx) {
    try {
      const { token } = ctx.request.body;

      if (!token) {
        return ctx.badRequest('Verification token is required');
      }

      // Find user by verification token
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { emailVerificationToken: token }
      });

      if (!user) {
        return ctx.badRequest('Invalid verification token');
      }

      // Check if token is expired (24 hours)
      const tokenAge = Date.now() - new Date(user.emailVerificationTokenCreatedAt).getTime();
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return ctx.badRequest('Verification token has expired');
      }

      // Update user
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationTokenCreatedAt: null,
          emailVerificationCode: null,
          emailVerificationCodeExpires: null
        }
      });

      return ctx.send({
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          emailVerified: true
        }
      });
    } catch (error) {
      console.error('Email verification error:', error);
      return ctx.internalServerError('Email verification failed');
    }
  },

  async verifyMobile(ctx) {
    try {
      const { code } = ctx.request.body;

      if (!code) {
        return ctx.badRequest('Verification code is required');
      }

      // For demo purposes, accept any 6-digit code
      // In production, you'd verify against the stored code
      if (code === '123456') {
        return ctx.send({
          message: 'Mobile verification successful',
          verified: true
        });
      }

      return ctx.badRequest('Invalid verification code');
    } catch (error) {
      console.error('Mobile verification error:', error);
      return ctx.internalServerError('Mobile verification failed');
    }
  },

  async completeProfile(ctx) {
    try {
      const { userId, firstName, lastName, phoneNumber } = ctx.request.body;

      if (!userId || !firstName || !lastName) {
        return ctx.badRequest('User ID, first name, and last name are required');
      }

      // Update user profile
      const updatedUser = await strapi.query('plugin::users-permissions.user').update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phoneNumber,
          profileCompleted: true
        }
      });

      return ctx.send({
        message: 'Profile completed successfully',
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phoneNumber: updatedUser.phoneNumber,
          profileCompleted: updatedUser.profileCompleted
        }
      });
    } catch (error) {
      console.error('Profile completion error:', error);
      return ctx.internalServerError('Profile completion failed');
    }
  },

  async resendEmailCode(ctx) {
    try {
      const { email } = ctx.request.body;

      if (!email) {
        return ctx.badRequest('Email is required');
      }

      // Find user
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email }
      });

      if (!user) {
        return ctx.badRequest('User not found');
      }

      // Generate new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update user with new code
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          emailVerificationCode: verificationCode,
          emailVerificationCodeExpires: expiresAt
        }
      });

      // Send email with new code
      await strapi.plugins['email'].services.email.send({
        to: user.email,
        subject: 'AudioStems - Email Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">AudioStems Email Verification</h2>
            <p>Your new verification code is: <strong style="font-size: 24px; color: #007bff;">${verificationCode}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      });

      return ctx.send({
        message: 'Verification code sent successfully'
      });
    } catch (error) {
      console.error('Resend email code error:', error);
      return ctx.internalServerError('Failed to send verification code');
    }
  }
}; 