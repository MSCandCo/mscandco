const { generatePeaks } = require("../../../../utils");

const beforeAndAfter = async (event) => {
  // when 'after create' id comes in result
  const stemId =
    event.action === "afterCreate" ? event.result.id : event.params.data.id;
  if (stemId) {
    const stem = await strapi.entityService.findOne("api::stem.stem", stemId, {
      populate: {
        tracks: {
          populate: "*",
        },
      },
    });
    const updatedTracks = [];
    for (const track of stem.tracks) {
      try {
        if (!track.source) throw new Error("no source");
        track.sourcePeaks = await generatePeaks(track.source);
      } catch (error) {
        if (error.message !== "no source") {
          console.log("error while generating peaks", error);
        }
      }
      updatedTracks.push(track);
    }

    await strapi.entityService.update("api::stem.stem", stemId, {
      data: {
        tracks: updatedTracks,
      },
    });
  }
};

module.exports = {
  // afterCreate: beforeAndAfter,
  // beforeUpdate: beforeAndAfter,
};
