module.exports = ({ env }) => ({
  app: {
    keys: env.array('APP_KEYS', ['yourKeyA', 'yourKeyB']),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
