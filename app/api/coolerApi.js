const cloud_url =
  "https://d5uo13qpfc.execute-api.us-east-1.amazonaws.com/latestTelemetry?deviceId=cooler-01";

export async function getStatus() {
  try {
    const response = await fetch(cloud_url);

    // Check if the request was successful (e.g., HTTP status 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // Parse the response body as JSON
    console.log(data);
    // You can now work with the 'data' object in your application
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}
