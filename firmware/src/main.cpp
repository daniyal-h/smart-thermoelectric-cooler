#include <Arduino.h>
#include <WiFi.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
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
unsigned long lastCommandPollMs = 0;    // new
unsigned long lastTelemetryMs = 0;      // new

/* ---------------- GLOBAL OBJECTS ---------------- */
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

void startCooling() { // new
    setPeltierPower(255);   // 100% power
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

void sendTelemetryToCloud(float temp) { // new
    if(WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin("https://your-cloud-api.com/telemetry");
        http.addHeader("Content-Type", "application/json");

        String payload = "{\"temperature\": " + String(temp) + 
                         ", \"timestamp\": " + String(millis()) + "}";
        int httpCode = http.POST(payload);
        http.end();
    }
}

void sendTelemetryHistory() { // new
    if(WiFi.status() != WL_CONNECTED) return;

    HTTPClient http;
    http.begin("https://your-cloud-api.com/telemetryHistory");
    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument doc(1024);
    JsonArray arr = doc.to<JsonArray>();
    for(int i = 0; i < 20; i++) {
        JsonObject obj = arr.createNestedObject();
        obj["timestamp"] = tempHistory[i].timestampMs;
        obj["temperature"] = tempHistory[i].temperatureC;
    }

    String payload;
    serializeJson(doc, payload);
    http.POST(payload);
    http.end();
}

void fetchCommandFromCloud() { // new
    if(WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin("https://your-cloud-api.com/command");
        int httpCode = http.GET();
        if(httpCode == 200) {
            String payload = http.getString();

            DynamicJsonDocument doc(512);
            deserializeJson(doc, payload);
            String cmd = doc["cmd"];
            
            if(cmd == "SET_TARGET_TEMP") {
                float target = doc["value"];
                if(target < 0) target = 0;
                thermalState.targetTempC = target;
                coolingStartTimeMs = millis();
                coolingStartTempC = thermalState.currentTempC;
                startCooling();
                lastCommand = "Cooling to " + String(target) + "°C";
                systemState = SystemState::Cooling;
            } else if(cmd == "STOP_COOLING") {
                stopCooling();
                lastCommand = "Cooling stopped";
                systemState = SystemState::ReadyForClientReq;
            }
        }
        http.end();
    }
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
            Serial.print("ESP32 IP address: "); 
            Serial.println(WiFi.localIP()); // print ESP32 IP address to serial for debugging
            systemState = SystemState::ReadyForClientReq; // move to next state
        }
        break;

    /* ---------------- READY FOR CLIENT REQUEST ---------------- */
    case SystemState::ReadyForClientReq: // new
        // idle
        break;

    /* ---------------- COOLING ---------------- */
    case SystemState::Cooling: // new
        readTemperature(); // update current temperature

        // Only start cooling if not already at/below target
        if (thermalState.currentTempC > thermalState.targetTempC) {
            startCooling();     
        } else {
            stopCooling();
            systemState = SystemState::ReadyForClientReq;
            Serial.println("Target temperature reached. Cooling stopped.");
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

void loop() { //new
    unsigned long now = millis();

    // 1️⃣ Sample temperature every 30 seconds
    if (now - lastTempSampleMs >= 30000) {
        lastTempSampleMs = now;
        readTemperature();

        // Add to circular history buffer
        tempHistory[tempHistIndex] = {millis(), thermalState.currentTempC};
        tempHistIndex = (tempHistIndex + 1) % 20;

        // Send current temperature to cloud
        sendTelemetryToCloud(thermalState.currentTempC);
    }

    // 2️⃣ Poll cloud for commands every 5 seconds
    if (now - lastCommandPollMs >= 5000) {
        lastCommandPollMs = now;
        fetchCommandFromCloud();
    }

    // 3️⃣ Optionally: send telemetry history every 5 minutes
    if (now - lastTelemetryMs >= 300000) {
        lastTelemetryMs = now;
        sendTelemetryHistory();
    }

    // Run your state machine
    runStateMachine();
}