const _exec = require("child_process").exec;
const promisify = require("util").promisify;
const fs = require("fs");
const { getAudioDurationInSeconds } = require("get-audio-duration");

const exec = promisify(_exec);

const beforeAndAfter = async (event) => {
  const { data } = event.params;
  if (data.mediaPreview) {
    try {
      event.params.data.length = await getDurationOfMedia(data.mediaPreview);
      event.params.data.mediaPreviewPeaks = await generatePeaks(data);
      console.log(`Peaks generated for ${data.title}`);
    } catch (error) {
      console.log("error while generating peaks / duration", error.message);
    }
  }
};

module.exports = {
  beforeCreate: beforeAndAfter,
  beforeUpdate: beforeAndAfter,
};

const getDurationOfMedia = async (mediaId) => {
  const mediaPreview = await strapi.entityService.findOne(
    "plugin::upload.file",
    mediaId
  );
  const duration = await getAudioDurationInSeconds(
    `public/${mediaPreview.url}`
  );
  return Math.floor(duration);
};

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
