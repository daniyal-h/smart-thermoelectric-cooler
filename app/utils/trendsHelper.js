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
    temperatures.push([
      telemetry["timestamp"],
      parseFloat(telemetry["currentTemp"]),
    ]);
  });

  return temperatures;
};

export const getStartingTime = (timestamp) => {
  const ts = new Date(timestamp * 1000); // convert to ms

  const options = {
    hour: "2-digit",
    minute: "2-digit",
  };

  const convertedTimestamp = ts.toLocaleDateString("en-US", options);
  const [_, time] = convertedTimestamp.split(",");

  return time.toLowerCase(); // i.g. 6:02 pm
};
