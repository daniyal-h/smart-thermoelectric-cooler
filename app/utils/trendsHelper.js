export const getTelemetries = (telemetries) => {
  // return an two arrays of timestamps and their temperatures
  const timestamps = [];
  const temperatures = [];

  telemetries.forEach((telemetry) => {
    if (telemetry["state"] === "Cooling") {
      temperatures.push(parseFloat(telemetry["currentTemp"]));
      timestamps.push(telemetry["timestamp"]);
    }
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

export const getTemperatures = (temperatures) => {
  if (!temperatures || temperatures.length === 0) return [];

  const count = temperatures.length;
  const targetPoints = 10; // keep chart readable
  const step = Math.max(1, Math.ceil(count / targetPoints));

  const sampled = [];
  for (let i = 0; i < count; i += step) {
    sampled.push(temperatures[i]);
  }
  return sampled;
};

export const getLabels = (count) => {
  if (!count || count <= 0) return [];

  const sampleIntervalMin = 0.5;
  const targetPoints = 10;
  const step = Math.max(1, Math.ceil(count / targetPoints));

  const labels = [];
  for (let i = 0; i < count; i += step) {
    const minutes = i * sampleIntervalMin;
    labels.push(`${minutes}m`);
  }
  return labels;
};
