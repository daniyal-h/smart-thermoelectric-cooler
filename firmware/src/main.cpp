#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

/* =========================================================
   CONFIG CONSTANTS
   ========================================================= */
/* ---------------- WIFI ---------------- */
const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_PASS";

/* ---------------- GPIO ---------------- */
const int MOSFET_PELTIER_PIN = 26;  // MOSFET pin for Peltier control
const int TEMP_SENSOR_PIN = 4;      // DS18B20 temperature sensor data pin

/* ---------------- PWM ---------------- */
const int PWM_CHANNEL = 0;   // PWM channel in LEDC (PWM controller)
const int PWM_FREQ = 2000;   // PWM frequency in Hz
const int PWM_RES_BITS = 8;  // 2^8 = 256 PWM levels

/* =========================================================
   GLOBAL VARIABLES & OBJECTS
   ========================================================= */
/* ---------------- GLOBAL VARIABLES ---------------- */
unsigned long coolingStartTimeMs = 0; // NEW
float coolingStartTempC = 0.0f; // NEW
String lastCommand; // NEW
int tempHistIndex = 0; // NEW

/* ---------------- GLOBAL OBJECTS ---------------- */
WebServer server(80); // create HTTP server on port 80
JsonDocument jsonReqObj; // JSON request object
OneWire oneWire(TEMP_SENSOR_PIN); // OneWire bus for temperature sensor pin
DallasTemperature tempSensor(&oneWire); // object for requesting temperatures on OneWire bus
SystemState systemState; // current system state
ThermalState thermalState; // current thermal state
TempSample tempHistory[600]; // NEW

/* =========================================================
   STATE
   ========================================================= */
/* ---------------- SYSTEM STATE ---------------- */
enum class SystemState {
    Booting,
    StartingServer,
    ReadyForClientReq,
    ServingApiCommand,
    ServingApiStatus,
    Cooling,
    Error
};

/* ---------------- THERMAL STATE ---------------- */
struct ThermalState {
    float currentTempC;
    float targetTempC;
};

/* ---------------- HISTORY & METADATA ---------------- */   // NEW

struct TempSample {
    unsigned long tMs;
    float tempC;
};


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
    WiFi.begin(WIFI_SSID, WIFI_PASS); // connect to wifi using credentials
}

bool wifiConnected() {
    return WiFi.status() == WL_CONNECTED; // return true if wifi is connected
}

void readTemperature() {
    tempSensor.requestTemperatures(); // request temperatures from available sensors
    thermalState.currentTempC = tempSensor.getTempCByIndex(0);  // get measured temperature from sensor 0
}

void apiCommandHandler() {
    deserializeJson(jsonReqObj, server.arg("plain")); // deserialize JSON string to JSON object
    systemState = SystemState::ServingApiCommand; // set state to ServingApiCommand
}

void apiStatusHandler() {
    systemState = SystemState::ServingApiStatus; // set state to ServingApiStatus
}

void apiHistoryHandler() { // NEW
    JsonDocument jsonRespObj;
    JsonArray arr = jsonRespObj["samples"].to<JsonArray>();

    for (int i = 0; i < 600; i++) {
        JsonObject o = arr.add<JsonObject>();
        o["t"] = tempHistory[i].tMs;
        o["temp"] = tempHistory[i].tempC;
    }

    String jsonRespStr;
    serializeJson(jsonRespObj, jsonRespStr);
    server.send(200, "application/json", jsonRespStr);
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
            server.on("/api/command", HTTP_POST, apiCommandHandler); // register /api/command endpoint and handler
            server.on("/api/status", HTTP_GET, apiStatusHandler); // register /api/status endpoint and handler
            server.on("/api/history", HTTP_GET, apiHistoryHandler); // register /api/history endpoint and handler
            server.begin(); // start HTTP server
            systemState = SystemState::ReadyForClientReq; // move to next state
        }
        break;

    /* ---------------- READY FOR CLIENT REQUEST ---------------- */
    case SystemState::ReadyForClientReq:
        server.handleClient(); // handle client HTTP requests
        break;

    /* ---------------- SERVING /api/command ---------------- */
    case SystemState::ServingApiCommand: {
        if (!jsonReqObj["cmd"].is<const char*>()) { // if cmd is missing, return error and go back to ready state
            server.send(400, "application/json", "{\"error\":\"missing cmd\"}");
            systemState = SystemState::ReadyForClientReq;
            break;
        }

        String cmd = jsonReqObj["cmd"];
        if (cmd == "SET_TARGET_TEMP") {
            if (jsonReqObj["value"].is<float>()) { // if value is missing, use default
                thermalState.targetTempC = jsonReqObj["value"];
            }

            coolingStartTimeMs = millis();
            coolingStartTempC = thermalState.currentTempC;
            lastCommand = "Cooling unit to " + String(thermalState.targetTempC) + "°C";

            startCooling();
            systemState = SystemState::Cooling; // move to cooling state
            server.send(200, "application/json", "{\"ok\":true}"); // return 200 OK
        }
        else if (cmd == "STOP_COOLING") {
            stopCooling(); // stop cooling
            lastCommand = "Cooling stopped";
            systemState = SystemState::ReadyForClientReq; // move to ready state
            server.send(200, "application/json", "{\"ok\":true}"); // return 200 OK
        }
        
        else {
            server.send(400, "application/json", "{\"error\":\"unknown cmd\"}"); // return 400 Bad Request
            systemState = SystemState::ReadyForClientReq; // move to ready state
        }
        break;
    }

    /* ---------------- SERVING /api/status ---------------- */
    case SystemState::ServingApiStatus: {
        JsonDocument jsonRespObj; // create JSON object
        jsonRespObj["currentTemp"] = thermalState.currentTempC; // add current temp
        jsonRespObj["targetTemp"] = thermalState.targetTempC; // add target temp
        jsonRespObj["state"] = (systemState == SystemState::Cooling) ? "cooling" : "idle"; // NEW
        jsonRespObj["lastUpdated"] = (millis() - lastTempTimeMs) / 1000; // add time since last temp read in seconds
        jsonRespObj["lastCommand"] = lastCommand; // add last command

        if (systemState == SystemState::Cooling) {
            jsonRespObj["coolingTimeSec"] = (millis() - coolingStartTimeMs) / 1000; // NEW
            jsonRespObj["rangeStart"] = coolingStartTempC; // NEW
        }

        String jsonRespStr;
        serializeJson(jsonRespObj, jsonRespStr); // serialize JSON object to JSON string
        server.send(200, "application/json", jsonRespStr); // send response as JSON string

        systemState = SystemState::ReadyForClientReq; // move to ready state
        break;
    }

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
    systemState = SystemState::Booting; // start in BOOT state
}

unsigned long lastTempTimeMs = 0;
void loop() { // called repeatedly after setup
    unsigned long now = millis();
    if (now - lastTempTimeMs >= 1000) { // update temperature every second
        lastTempTimeMs = now;
        readTemperature();

        tempHistory[tempHistIndex] = { millis(), thermalState.currentTempC }; // NEW
        tempHistIndex = (tempHistIndex + 1) % 600; // NEW
    }

    runStateMachine(); // run state machine
}