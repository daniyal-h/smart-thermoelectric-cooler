const rectifyLiveReadings = (data) => {
  const readings = [];
  for (let i = 0; i < data.length; i += 2) {
    readings.push(data[i]);
  }
  return readings;
};

export default rectifyLiveReadings;
