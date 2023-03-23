const _exec = require("child_process").exec;
const promisify = require("util").promisify;
const fs = require("fs");

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
