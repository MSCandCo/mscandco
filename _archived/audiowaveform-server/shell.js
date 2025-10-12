const http = require("http");
const _exec = require("child_process").exec;
const promisify = require("util").promisify;

const exec = promisify(_exec);
const PORT = 8888;

const server = http.createServer(async (req, res) => {
  const query = req.url
    .substring(2)
    .split("&")
    .map((i) => i.split("="));

  const fileQuery = query.find((i) => i[0] === "file");

  if (fileQuery) {
    const fileUrl = fileQuery[1];
    try {
      const peaks = await generatePeaks(fileUrl);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(peaks);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Error: " + error.message }));
    }
    return;
  }
  res.writeHead(400, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "What are you even trying to do?!" }));
});

const generatePeaks = async (url) => {
  // url comes like /uploads/filename.ext
  // it automatically maps with our mount point
  const inputFilePath = `${url}`;
  const command = `audiowaveform -i ${inputFilePath} --output-format json --pixels-per-second 20 --bits 8`;

  const { stdout } = await exec(command);

  return stdout;
};

server.listen(PORT, () => {
  console.log(`AudioWaveform server is running on PORT:${PORT}`);
});
