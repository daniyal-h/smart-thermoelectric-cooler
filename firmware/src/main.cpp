#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ESPmDNS.h>
#include <HTTPClient.h>

/* =========================================================
   CONFIG CONSTANTS
   ========================================================= */
/* ---------------- WIFI ---------------- */
const char* WIFI_SSID = "nwokike"; // WiFi SSID
const char* WIFI_PASS = "nwokike425"; // WiFi Password

/* ---------------- GPIO ---------------- */
const int MOSFET_PELTIER_PIN = 26;  // MOSFET pin for Peltier control
const int TEMP_SENSOR_PIN = 4;      // DS18B20 temperature sensor data pin

/* ---------------- PWM ---------------- */
const int PWM_CHANNEL = 0;   // PWM channel in LEDC (PWM controller)
const int PWM_FREQ = 2000;   // PWM frequency in Hz
const int PWM_RES_BITS = 8;  // 2^8 = 256 PWM levels

/* =========================================================
    ENUMS & STRUCTS
   ========================================================= */
/* ---------------- SYSTEM STATE ---------------- */
enum class SystemState {
    Booting,
    StartingServer,
    ReadyForClientReq,
    Cooling,
    Error
};

/* ---------------- THERMAL STATE ---------------- */
struct ThermalState {
    float currentTempC;
    float targetTempC;
};

/* ---------------- TEMP HISTORY ---------------- */
struct TempHistory {
    unsigned long timestampMs;
    float temperatureC;
};

/* =========================================================
   GLOBAL VARIABLES & OBJECTS
   ========================================================= */
/* ---------------- GLOBAL VARIABLES ---------------- */
unsigned long coolingStartTimeMs = 0; // time at start of cooling
float coolingStartTempC = 0.0f; // temp at start of cooling
String lastCommand = "N/A"; // last command sent by client
int tempHistIndex = 0; // index for temperature history buffer
unsigned long lastTempSampleMs = 0; // last time temperature was sampled

/* ---------------- GLOBAL OBJECTS ---------------- */
WebServer server(80); // create HTTP server on port 80
JsonDocument jsonReqObj; // JSON request object
OneWire oneWire(TEMP_SENSOR_PIN); // OneWire bus for temperature sensor pin
DallasTemperature tempSensor(&oneWire); // object for requesting temperatures on OneWire bus
SystemState systemState; // current system state
ThermalState thermalState; // current thermal state
TempHistory tempHistory[20]; // temperature history (2 samples/minute * 10 minutes = 20 samples)

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */
void setPeltierPower(uint8_t dutyCycle) {
    ledcWrite(PWM_CHANNEL, dutyCycle); // write PWM at dutyCycle to pin
}

void startCooling() {
    setPeltierPower(180);   // 180/255 ~ 70% power (tune later)
}

void stopCooling() {
    setPeltierPower(0);     // 0% power
}

void connectToWifi() {
    Serial.println("Connecting to WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASS); // connect to wifi using credentials
}

bool wifiConnected() {
    return WiFi.status() == WL_CONNECTED; // return true if wifi is connected
}

void readTemperature() {
    tempSensor.requestTemperatures(); // request temperatures from available sensors
    thermalState.currentTempC = tempSensor.getTempCByIndex(0);  // get measured temperature from sensor 0
}

void sendCorsHeaders() { // Cross-Origin Resource Sharing headers, only useful if client is served from different origin
    server.sendHeader("Access-Control-Allow-Origin", "*"); // allow requests from any origin
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // allow GET, POST, OPTIONS methods
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type"); // allow Content-Type header
}

void apiCommandHandler() {
    deserializeJson(jsonReqObj, server.arg("plain")); // deserialize JSON string to JSON object
    if (!jsonReqObj["cmd"].is<const char*>()) { // if cmd is missing, return error and go back to ready state
        sendCorsHeaders(); // send CORS headers
        server.send(400, "application/json", "{\"error\":\"missing cmd\"}");
        systemState = SystemState::ReadyForClientReq;
        return;
    }

    String cmd = jsonReqObj["cmd"];
    if (cmd == "SET_TARGET_TEMP") {
        if (jsonReqObj["value"].is<float>()) {
            float requestedTemp = jsonReqObj["value"];
            if (requestedTemp < 0) { // if requested temp is ever below 0, set it to 0, safety measure
                requestedTemp = 0;
            }

            if (requestedTemp >= thermalState.currentTempC) { // if requested temp >= current temp, stop cooling
                stopCooling();
                systemState = SystemState::ReadyForClientReq;
                sendCorsHeaders();
                server.send(200, "application/json", "{\"ok\":true,\"note\":\"target above current, cooling not needed\"}");
                return;
            }

            thermalState.targetTempC = requestedTemp; // set target temp
            coolingStartTimeMs = millis(); // set cooling start time
            coolingStartTempC = thermalState.currentTempC; // set cooling start temp
            lastCommand = "Cooling unit to " + String(thermalState.targetTempC) + "°C";

            startCooling();
            systemState = SystemState::Cooling; // move to cooling state
            sendCorsHeaders(); // send CORS headers
            server.send(200, "application/json", "{\"ok\":true}"); // return 200 OK
            return;
        }
    }
    else if (cmd == "STOP_COOLING") {
        stopCooling(); // stop cooling
        lastCommand = "Cooling stopped";
        systemState = SystemState::ReadyForClientReq; // move to ready state
        sendCorsHeaders(); // send CORS headers
        server.send(200, "application/json", "{\"ok\":true}"); // return 200 OK
        return;
    }
    else {
        sendCorsHeaders(); // send CORS headers
        server.send(400, "application/json", "{\"error\":\"unknown cmd\"}"); // return 400 Bad Request
        systemState = SystemState::ReadyForClientReq; // move to ready state
        return;
    }
}

void apiStatusHandler() {
    JsonDocument respJsonObj; // create JSON object
    const char* systemStateStrs[] = { "Booting", "StartingServer", "ReadyForClientReq", "Cooling", "Error" };
    respJsonObj["systemState"] = systemStateStrs[static_cast<int>(systemState)]; // add system state string
    respJsonObj["currentTemp"] = thermalState.currentTempC; // add current temp
    respJsonObj["targetTemp"] = thermalState.targetTempC; // add target temp
    respJsonObj["lastUpdated"] = (millis() - lastTempSampleMs) / 1000; // add time since last temp read in seconds
    respJsonObj["lastCommand"] = lastCommand; // add last command

    if (systemState == SystemState::Cooling) {
        respJsonObj["coolingTime"] = (millis() - coolingStartTimeMs) / 1000; // add cooling time
        respJsonObj["coolingStartTemp"] = coolingStartTempC; // add cooling start temp
    }

    String respJsonStr;
    serializeJson(respJsonObj, respJsonStr); // serialize JSON object to JSON string
    sendCorsHeaders(); // send CORS headers
    server.send(200, "application/json", respJsonStr); // send response as JSON string

    systemState = SystemState::ReadyForClientReq; // move to ready state
    return;
}

void apiHistoryHandler() {
    JsonDocument respJsonObj; // create response JSON object
    JsonArray histJsonArr = respJsonObj["history"].to<JsonArray>(); // get history field in response JSON object as JSON array

    for (int i = 0; i < 20; i++) { // loop through temp history
        JsonObject jsonHistObj = histJsonArr.add<JsonObject>(); // get newly added JSON object in history JSON array
        jsonHistObj["timestamp"] = tempHistory[i].timestampMs; // add timestamp to history JSON object
        jsonHistObj["temperature"] = tempHistory[i].temperatureC; // add temperature to history JSON object
    }

    String respJsonStr; // create JSON response string
    serializeJson(respJsonObj, respJsonStr); // serialize JSON object to JSON string
    sendCorsHeaders(); // send CORS headers
    server.send(200, "application/json", respJsonStr); // send JSON response containing history
}

void apiPingHandler() {
    JsonDocument respJsonObj;
    respJsonObj["success"] = true;      // add success field to response JSON object
    respJsonObj["uptimeMs"] = millis(); // add uptimeMs field to response JSON object

    String respJsonStr;
    serializeJson(respJsonObj, respJsonStr); // serialize JSON object to JSON string

    sendCorsHeaders(); // send CORS headers
    server.send(200, "application/json", respJsonStr); // send JSON response
}

/* =========================================================
   STATE MACHINE
   ========================================================= */
void runStateMachine() {
    switch (systemState) {

    /* ---------------- BOOTING ---------------- */
    case SystemState::Booting:
        ledcSetup(PWM_CHANNEL, PWM_FREQ, PWM_RES_BITS); // setup PWM
        ledcAttachPin(MOSFET_PELTIER_PIN, PWM_CHANNEL); // attach PWM to pin
        stopCooling(); // ensure TEC is off

        tempSensor.begin(); // initialize temperature sensor

        thermalState.currentTempC = 0.0f; // initialize current temp
        thermalState.targetTempC = 5.0f; // default target temp (fridge)

        connectToWifi(); // connect to wifi

        systemState = SystemState::StartingServer; // move to next state
        break;

    /* ---------------- STARTING SERVER ---------------- */
    case SystemState::StartingServer:
        if (wifiConnected()) {
            MDNS.begin("esp32"); // begin mDNS at http://esp32.local to enable clinet to connect without knowing IP
            Serial.print("ESP32 IP address: "); 
            Serial.println(WiFi.localIP()); // print ESP32 IP address to serial for debugging

            server.on("/api/command", HTTP_POST, apiCommandHandler); // handle POST /api/command requests
            server.on("/api/status", HTTP_GET, apiStatusHandler); // handle GET /api/status requests
            server.on("/api/history", HTTP_GET, apiHistoryHandler); // handle GET /api/history requests
            server.on("/api/ping", HTTP_GET, apiPingHandler); // handle GET /api/ping requests
            server.onNotFound([]() { // handle unknown requests
                if (server.method() == HTTP_OPTIONS) { // handle CORS preflight request
                    sendCorsHeaders(); // send CORS headers
                    server.send(204); // send empty response
                } else { // handle other unknown requests
                    sendCorsHeaders(); // send CORS headers
                    server.send(404, "text/plain", "Not Found"); // send 404 Not Found
                }
            });
            server.begin(); // start HTTP server
            systemState = SystemState::ReadyForClientReq; // move to next state
        }
        break;

    /* ---------------- READY FOR CLIENT REQUEST ---------------- */
    case SystemState::ReadyForClientReq:
        server.handleClient(); // handle client HTTP requests
        break;

    /* ---------------- COOLING ---------------- */
    case SystemState::Cooling:
        server.handleClient(); // handle client HTTP requests during cooling
        readTemperature(); // update current temperature

        if (thermalState.currentTempC <= thermalState.targetTempC) { // stop cooling if target temp is reached
            stopCooling();
            systemState = SystemState::ReadyForClientReq;
        }
        break;

    /* ---------------- ERROR ---------------- */
    case SystemState::Error:
        stopCooling();
        break;
    }
}

/* =========================================================
   SETUP & LOOP
   ========================================================= */
void setup() { // called once at startup
    Serial.begin(115200); // initialize serial interface for debugging
    Serial.println("=== SETUP START ===");
    systemState = SystemState::Booting; // start in BOOT state
}

void loop() { // called repeatedly after setup
    unsigned long now = millis();
    if (now - lastTempSampleMs >= 30000) { // update temperature every 30 seconds
        lastTempSampleMs = now;
        readTemperature();

        tempHistory[tempHistIndex] = {millis(), thermalState.currentTempC }; // add new temp sample to history
        tempHistIndex = (tempHistIndex + 1) % 20; // update history index (circular buffer of 20 samples)
    }

    runStateMachine(); // run state machine
}