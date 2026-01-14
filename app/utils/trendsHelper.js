export const getTelemetries = (telemetries) => {
  // return an two arrays of timestamps and their temperatures
  const timestamps = [];
  const temperatures = [];
  telemetries.forEach((telemetry) => {
    temperatures.push(parseFloat(telemetry["currentTemp"]));
    timestamps.push(telemetry["timestamp"]);
  });

  return [timestamps, temperatures];
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

export const getLabels = (count) => {
  if (!count || count <= 0) return [];

  const labels = [];
  const sampleIntervalMin = 0.5; // 30s per point

  let labelStepPoints;

  if (count <= 10) {
    labelStepPoints = 1; // every 0.5 min
  } else if (count <= 20) {
    labelStepPoints = 2; // every 1 min
  } else {
    labelStepPoints = 4; // every 2 min
  }

  for (let i = 0; i < count; i += labelStepPoints) {
    const minutes = i * sampleIntervalMin;
    labels.push(`${minutes}m`);
  }

  return labels;
};

export const getTemperatures = (temperatures) => {
  if (!temperatures || temperatures.length === 0) return [];

  let step;
  const count = temperatures.length;

  if (count <= 10) {
    step = 1; // every 30s
  } else if (count <= 20) {
    step = 2; // every 1 min
  } else {
    step = 4; // every 2 min
  }

  const sampled = [];
  for (let i = 0; i < count; i += step) {
    sampled.push(temperatures[i]);
  }

  console.log(sampled);
  return sampled;
};

export const rectifyLiveReadings = (data) => {
  const readings = [];
  for (let i = 0; i < data.length; i += 2) {
    readings.push(data[i]);
  }
  return readings;
};
