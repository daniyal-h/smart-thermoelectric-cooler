export const rectifyLiveReadings = (data) => {
  const readings = [];
  for (let i = 0; i < data.length; i += 2) {
    readings.push(data[i]);
  }
  return readings;
};

export const getTemperatures = (telemetries) => {
  // return an array of arrays as data points (timestamp, temp)
  const temperatures = [];
  telemetries.forEach((telemetry) => {
    temperatures.push(parseFloat(telemetry["currentTemp"]));
  });

  return temperatures;
};
