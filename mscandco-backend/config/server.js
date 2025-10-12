module.exports = ({ env }) => ({
  app: {
    keys: [
      'mySuperSecretKeyA',
      'mySuperSecretKeyB'
    ],
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
