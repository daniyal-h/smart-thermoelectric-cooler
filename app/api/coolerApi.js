const cloud_url = "https://d5uo13qpfc.execute-api.us-east-1.amazonaws.com";
const deviceId = "cooler-01";

export async function getStatus() {
  const url = cloud_url + "/status" + "?deviceId=" + deviceId;
  return await apiRunner(url);
}

export async function sendCommand(target, powerOn) {
  const body = powerOn
    ? {
        deviceId,
        command: "SET_TARGET_TEMP",
        value: target,
      }
    : {
        deviceId,
        command: "STOP_COOLING",
      };

  return await apiRunner(cloud_url + "/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function ingestTelemetry() {
  const url = cloud_url + "/telemetryHistory" + "?deviceId=" + deviceId;
  return await apiRunner(url);
}

async function apiRunner(url, options = {}) {
  try {
    const response = await fetch(url, options);
    // check if the request was successful
    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.text();
      } catch {
        errorBody = "<no body>";
      }

      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    if (response.status === 204) {
      return null; // no data received but successful request
    }

    const data = await response.json(); // Parse the response body as JSON
    //console.log(data);
    return data;
  } catch (error) {
    console.log("Error during fetch:", error);
  }
}
