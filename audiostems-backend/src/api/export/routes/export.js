'use strict';

module.exports = {
  routes: [
    // PDF Export for Creations
    {
      method: 'POST',
      path: '/export/creations/pdf',
      handler: 'export.exportCreationsPDF',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: []
      }
    },
    // Excel Export for Creations
    {
      method: 'POST',
      path: '/export/creations/excel',
      handler: 'export.exportCreationsExcel',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: []
      }
    },
    // PDF Export for Earnings
    {
      method: 'POST',
      path: '/export/earnings/pdf',
      handler: 'export.exportEarningsPDF',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: []
      }
    },
    // Excel Export for Earnings
    {
      method: 'POST',
      path: '/export/earnings/excel',
      handler: 'export.exportEarningsExcel',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: [],
        middlewares: []
      }
    }
  ]
}; 