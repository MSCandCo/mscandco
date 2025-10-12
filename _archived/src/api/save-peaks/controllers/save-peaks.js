"use strict";

/**
 * A set of functions called "actions" for `save-peaks`
 */

module.exports = {
  savePeaks: async (ctx) => {
    const stemId = ctx.request.body.stem;
    const trackId = ctx.request.body.track;
    const peaks = ctx.request.body.peaks;
    try {
      const stem = await strapi.entityService.findOne(
        "api::stem.stem",
        stemId,
        {
          populate: {
            tracks: {
              populate: "*",
            },
          },
        }
      );
      const updatedTracks = [];
      for (const track of stem.tracks) {
        if (track.id === trackId) {
          track.sourcePeaks = peaks;
        }
        updatedTracks.push(track);
      }

      await strapi.entityService.update("api::stem.stem", stemId, {
        data: {
          tracks: updatedTracks,
        },
      });
      ctx.body = "ok";
    } catch (err) {
      ctx.body = err;
    }
  },
};
