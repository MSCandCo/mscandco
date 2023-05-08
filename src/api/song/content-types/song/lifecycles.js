const _exec = require("child_process").exec;
const promisify = require("util").promisify;
const fs = require("fs");
const { getAudioDurationInSeconds } = require('get-audio-duration');

const exec = promisify(_exec);

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    if (result.mediaPreview) {
      try {
        const peaks = await generatePeaks(result);
        await strapi.entityService.update("api::song.song", result.id, {
          data: {
            mediaPreviewPeaks: peaks,
          },
        });
        console.log(`Peaks generated for ${result.title}`);
      } catch (error) {
        console.log(error.message);
      }
    }
  },
  async afterUpdate(event) {
    const { result } = event;

    // update call below should not start the loop
    if (result.mediaPreview) {
      try {
        const peaks = await generatePeaks(result);
        await strapi.entityService.update("api::song.song", result.id, {
          data: {
            mediaPreviewPeaks: peaks,
          },
        });
        console.log(`Peaks generated for ${result.title}`);
      } catch (error) {
        console.log(error.message);
      }
    }
  },
  async beforeCreate(event) {
    const { data } = event.params;
    event.params.data.length = await getDurationOfMedia(data.mediaPreview);
  },
  async beforeUpdate(event) {
    const { data } = event.params;
    event.params.data.length = await getDurationOfMedia(data.mediaPreview);
  },
};

const getDurationOfMedia = async (mediaId) => {
  const mediaPreview = await strapi.entityService.findOne('plugin::upload.file', mediaId);
  const duration = await getAudioDurationInSeconds(`public/${mediaPreview.url}`);
  return Math.floor(duration);
}

const generatePeaks = async (data) => {
  const outputFilePath = `public/uploads/${data.mediaPreview.hash}.json`;
  const inputFilePath = `public/${data.mediaPreview.url}`;
  const command = `audiowaveform -i ${inputFilePath} -o ${outputFilePath} --pixels-per-second 20 --bits 8`;

  await exec(command);

  const outputPeaks = fs.readFileSync(outputFilePath, {
    encoding: "utf8",
  });

  return JSON.parse(outputPeaks);
};
