export const rectifyLiveReadings = (data) => {
  const readings = [];
  for (let i = 0; i < data.length; i += 2) {
    readings.push(data[i]);
  }
  return readings;
};

export const getTelemetryArray = (telemetries) => {
  // return an array of arrays as data points (timestamp, temp)
  const telemetryArr = [];
  telemetries.forEach(telemetry => {
    telemetryArr.push([telemetry["timestamp"], telemetry["currentTemp"]]);
  })

  return telemetryArr;
}
