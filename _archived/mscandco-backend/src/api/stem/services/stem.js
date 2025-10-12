'use strict';

/**
 * stem service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::stem.stem');
