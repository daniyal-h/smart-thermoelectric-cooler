import urllib.request
import json
import random
import time

BASE_URL = "https://d5uo13qpfc.execute-api.us-east-1.amazonaws.com"
DEVICE_ID = "cooler-01"
NUM_POINTS = 60

timestamp = int(time.time())

# populate the telemetry history to test out the cooling curve

for i in range(NUM_POINTS):
    payload = json.dumps({
        "deviceId": DEVICE_ID,
        "currentTemp": round(22 - (i * 0.4), 1),
        "targetTemp": 5.5,
        "systemState": "Cooling",
        "uptimeMs": 4820 + (i * 30000),
        "timestamp": timestamp
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE_URL}/telemetry",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req) as res:
        print(f"[{i+1}/{NUM_POINTS}] {res.status} — {round(22 - (i * 0.4), 1)}°C")

    timestamp += 30 + random.randint(-2, 2) # ~30s upload speed