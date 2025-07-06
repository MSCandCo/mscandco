module.exports = {
  routes: [
    {
     method: 'POST',
     path: '/save-peaks',
     handler: 'save-peaks.savePeaks',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
