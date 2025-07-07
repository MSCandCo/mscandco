module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "aws-s3",
      providerOptions: {
        s3Options: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
          region: process.env.AWS_REGION,
          params: {
            Bucket: process.env.AWS_BUCKET,
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  email: {
    config: {
      provider: '@strapi/provider-email-sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: env('DEFAULT_FROM_EMAIL', 'noreply@audiostems.com'),
        defaultReplyTo: env('DEFAULT_REPLY_TO_EMAIL', 'support@audiostems.com'),
      },
    },
  },
});
