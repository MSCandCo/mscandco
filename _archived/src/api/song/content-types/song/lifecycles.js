const { getAudioDurationInSeconds } = require("get-audio-duration");
const { generatePeaks } = require("../../../../utils");

const beforeAndAfter = async (event) => {
  const { data } = event.params;
  if (data.mediaPreview) {
    const mediaPreview = await strapi.entityService.findOne(
      "plugin::upload.file",
      data.mediaPreview
    );
    try {
      event.params.data.length = await getDurationOfMedia(mediaPreview);
      event.params.data.mediaPreviewPeaks = await generatePeaks(mediaPreview);
      console.log(`peaks and duration generated for ${data.title}`);
    } catch (error) {
      console.log("error while generating peaks / duration", error.message);
    }
  }
};

module.exports = {
  beforeCreate: beforeAndAfter,
  beforeUpdate: beforeAndAfter,
};

const getDurationOfMedia = async (mediaPreview) => {
  const duration = await getAudioDurationInSeconds(
    `public/${mediaPreview.url}`
  );
  return Math.floor(duration);
};
