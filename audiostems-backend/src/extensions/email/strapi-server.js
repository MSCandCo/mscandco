'use strict';

module.exports = (/* { strapi } */) => {
  // Override the email provider to log emails to console
  plugin.services.email = {
    ...plugin.services.email,
    send: async (options) => {
      console.log('📧 EMAIL SENT (TEST MODE):');
      console.log('To:', options.to);
      console.log('From:', options.from);
      console.log('Subject:', options.subject);
      console.log('Text:', options.text);
      console.log('HTML:', options.html);
      console.log('---');
      
      // Return success response
      return {
        message: 'Email logged to console (test mode)',
        success: true
      };
    }
  };

  return plugin;
}; 