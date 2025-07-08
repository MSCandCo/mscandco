'use strict';

/**
 * monthly-statement router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::monthly-statement.monthly-statement', {
  config: {
    find: {},
    findOne: {},
    create: {},
    update: {},
    delete: {}
  },
  routes: [
    {
      method: 'GET',
      path: '/monthly-statements/user',
      handler: 'monthly-statement.getUserStatements',
      config: {}
    },
    {
      method: 'GET',
      path: '/monthly-statements/analytics',
      handler: 'monthly-statement.getEarningsAnalytics',
      config: {}
    },
    {
      method: 'POST',
      path: '/monthly-statements/generate',
      handler: 'monthly-statement.generateStatement',
      config: {}
    },
    {
      method: 'GET',
      path: '/monthly-statements/all',
      handler: 'monthly-statement.getAllStatements',
      config: {}
    },
    {
      method: 'GET',
      path: '/monthly-statements/summary',
      handler: 'monthly-statement.getEarningsSummary',
      config: {}
    }
  ]
}); 