'use strict';

/**
 * monthly-statement router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::monthly-statement.monthly-statement', {
  config: {
    find: {
      policies: ['plugin::users-permissions.isAuthenticated']
    },
    findOne: {
      policies: ['plugin::users-permissions.isAuthenticated']
    },
    create: {
      policies: ['plugin::users-permissions.isAuthenticated']
    },
    update: {
      policies: ['plugin::users-permissions.isAuthenticated']
    },
    delete: {
      policies: ['plugin::users-permissions.isAuthenticated']
    }
  },
  routes: [
    {
      method: 'GET',
      path: '/monthly-statements/user',
      handler: 'monthly-statement.getUserStatements',
      config: {
        policies: ['plugin::users-permissions.isAuthenticated']
      }
    },
    {
      method: 'GET',
      path: '/monthly-statements/analytics',
      handler: 'monthly-statement.getEarningsAnalytics',
      config: {
        policies: ['plugin::users-permissions.isAuthenticated']
      }
    },
    {
      method: 'POST',
      path: '/monthly-statements/generate',
      handler: 'monthly-statement.generateStatement',
      config: {
        policies: ['plugin::users-permissions.isAuthenticated']
      }
    },
    {
      method: 'GET',
      path: '/monthly-statements/all',
      handler: 'monthly-statement.getAllStatements',
      config: {
        policies: ['plugin::users-permissions.isAuthenticated']
      }
    },
    {
      method: 'GET',
      path: '/monthly-statements/summary',
      handler: 'monthly-statement.getEarningsSummary',
      config: {
        policies: ['plugin::users-permissions.isAuthenticated']
      }
    }
  ]
}); 