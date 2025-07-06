module.exports = {
  routes: [
    {
      method: "GET",
      path: "/song/download/:id",
      handler: "song.download",
    },
  ],
};
