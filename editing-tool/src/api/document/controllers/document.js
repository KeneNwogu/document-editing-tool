'use strict';

/**
 * document controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::document.document');

// module.exports = {
//     async find(ctx) {
//         const documents = await strapi.service("api::document.document").find(ctx.query);
//         return documents
//     }
// }
