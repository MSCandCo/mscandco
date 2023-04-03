"use strict";
const fs = require("fs");
/**
 * song controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::song.song", ({ strapi }) => ({
  async download(ctx) {
    ctx.query = { ...ctx.query, populate: "*" };
    const response = await super.findOne(ctx);
    const { title, mediaPreview } = response.data.attributes;

    // for allowing to access content-disposition on client side
    ctx.set("Access-Control-Expose-Headers", "Content-Disposition");

    ctx.response.attachment(`${title}${mediaPreview.data.attributes.ext}`);
    ctx.type = mediaPreview.data.attributes.mime;
    ctx.body = fs.readFileSync(`public/${mediaPreview.data.attributes.url}`);
    return response;
  },
}));
