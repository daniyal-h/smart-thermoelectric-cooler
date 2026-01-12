const cloud_url = "https://d5uo13qpfc.execute-api.us-east-1.amazonaws.com";
const deviceId = "cooler-01";

export async function getStatus() {
  try {
    const response = await fetch(
      cloud_url + "/status" + "?deviceId=" + deviceId
    );

    // check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // Parse the response body as JSON
    console.log(data);
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

export async function sendCommand(value) {
  try {
    const response = await fetch(cloud_url + "/command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceId: deviceId,
        command: "SET_TARGET_TEMP",
        value: value,
      }),
    });

    // check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // Parse the response body as JSON
    console.log(data);
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

// TODO: Return something when failed (null right now will break UI)