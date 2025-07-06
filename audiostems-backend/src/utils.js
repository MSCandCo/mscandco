const generatePeaks = async (mediaPreview) => {
  const response = await fetch(
    `http://audiowaveform-server:8888/?file=${mediaPreview.url}`
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);

  return data;
};

module.exports = {
  generatePeaks,
};
