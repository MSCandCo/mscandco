"use strict";
const fs = require("fs");
/**
 * stem controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::stem.stem", ({ strapi }) => ({
  async download(ctx) {
    const { user } = ctx.state;

    if (!user || !user.credit || user.credit < 0) {
      ctx.status = 403;
      ctx.body = {
        error: "no-credit",
      };
      return;
    }
    ctx.query = { ...ctx.query, populate: "*" };
    const response = await super.findOne(ctx);
    const { title, fullPreview, credit = 1 } = response.data.attributes;

    if (user.credit - credit < 0) {
      ctx.status = 403;
      ctx.body = {
        error: "no-credit",
      };
      return;
    }

    // for allowing to access content-disposition on client side
    ctx.set("Access-Control-Expose-Headers", "Content-Disposition");

    ctx.response.attachment(`${title}${fullPreview.data.attributes.ext}`);
    ctx.type = fullPreview.data.attributes.mime;
    ctx.body = fs.readFileSync(`public/${fullPreview.data.attributes.url}`);

    await strapi.entityService.update(
      "plugin::users-permissions.user",
      user.id,
      {
        data: {
          credit: user.credit - credit,
        },
      }
    );
    return;
  },
}));
