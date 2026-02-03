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


/* ---------------- PINS AND PWM  - PASCHAL ---------------- */
const int PELTIER1_PIN = 26;
const int PELTIER2_PIN = 27;
const int PELTIER3_PIN = 25;
const int PELTIER4_PIN = 33;

const int FAN1_PIN = 32;
const int FAN2_PIN = 14;

const int MOSFET_MOTOR_PIN = 13;   // Motor pin driven by MOSFET and PWM
const int TEMP_SENSOR_PIN = 4; // DS18B20 temperature sensor pin

const int PWM_CHANNEL = 0;   // PWM channel in LEDC (PWM controller)
const int PWM_FREQ = 2000;   // PWM frequency in Hz
const int PWM_RES_BITS = 8;  // 2^8 = 256 PWM levels


/* =========================================================
    ENUMS & STRUCTS
   ========================================================= */
/* ---------------- SYSTEM STATE ---------------- */
enum class SystemState {
    Booting,
    Idle,
    Cooling,
    Error
};

/* ---------------- THERMAL STATE ---------------- */
struct ThermalState {
    float currentTempC;
    float targetTempC;
};


/* =========================================================
   GLOBAL VARIABLES & OBJECTS
   ========================================================= */
/* ---------------- GLOBAL VARIABLES ---------------- */
unsigned long coolingStartTimeMs = 0; // time at start of cooling
float coolingStartTempC = 0.0f; // temp at start of cooling
unsigned long lastCmdPollMs = 0; // last time command was polled
unsigned long lastTelemMs = 0;   // last time telemetry history was sent
unsigned long lastWifiRetryMs = 0; // last time wifi reconnect was attempted
bool wifiEverConnected = false; // flag to track if wifi was ever connected
unsigned long wifiAttemptStartMs = 0; // last time wifi connection attempt was started
const unsigned long WIFI_TIMEOUT_MS = 10000; // 10 seconds

/* ---------------- GLOBAL OBJECTS ---------------- */
OneWire oneWire(TEMP_SENSOR_PIN); // OneWire bus for temperature sensor pin
DallasTemperature tempSensor(&oneWire); // object for requesting temperatures on OneWire bus
SystemState currentState; // current system state
ThermalState thermalState; // current thermal state


/* =========================================================
   PERIPHERAL CONTROL - PASCHAL
   ========================================================= */
void peltiersOn() {
    digitalWrite(PELTIER1_PIN, HIGH);
    digitalWrite(PELTIER2_PIN, HIGH);
    digitalWrite(PELTIER3_PIN, HIGH);
    digitalWrite(PELTIER4_PIN, HIGH);
}

void peltiersOff() {
    digitalWrite(PELTIER1_PIN, LOW);
    digitalWrite(PELTIER2_PIN, LOW);
    digitalWrite(PELTIER3_PIN, LOW);
    digitalWrite(PELTIER4_PIN, LOW);
}

void fansOn() {
    digitalWrite(FAN1_PIN, HIGH);
    digitalWrite(FAN2_PIN, HIGH);
}

void fansOff() {
    digitalWrite(FAN1_PIN, LOW);
    digitalWrite(FAN2_PIN, LOW);
}

void setMotorSpeed(uint8_t duty) {
    ledcWrite(PWM_CHANNEL, duty);   // 0–255
}

void motorOff() {
    ledcWrite(PWM_CHANNEL, 0);
}

void readTemperature() {
    tempSensor.requestTemperatures(); // request temperatures from available sensors
    float temp = tempSensor.getTempCByIndex(0);  // get measured temperature from sensor 0
    if(temp == DEVICE_DISCONNECTED_C) {
        Serial.println("Temperature sensor error!");
    } else {
        thermalState.currentTempC = temp;
    }
}


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */
bool wifiConnected() {
    return WiFi.status() == WL_CONNECTED;
}

void connectToWifi() {
    if (wifiConnected()) return;

    if (wifiAttemptStartMs == 0) { // start connection if not already trying
        Serial.println("Starting WiFi connection...");
        WiFi.begin(WIFI_SSID, WIFI_PASS);
        wifiAttemptStartMs = millis();
        return;
    }
    
    if (millis() - wifiAttemptStartMs < WIFI_TIMEOUT_MS) { // still trying
        return;
    }

    // timeout reached
    Serial.println("WiFi unavailable, running offline");
    wifiAttemptStartMs = 0; // allow retry later
}

const char* systemStateToString(SystemState state) {
    switch (state) {
        case SystemState::Booting:
            return "Booting";
        case SystemState::Idle:
            return "Idle";
        case SystemState::Cooling:
            return "Cooling";
        case SystemState::Error:
            return "Error";
        default:
            return "Unknown";
    }
}

void setSystemState(SystemState newState) {
    if (currentState != newState) {
        Serial.println("System state changed from " + String(systemStateToString(currentState)) + " to " + String(systemStateToString(newState)));
        currentState = newState;
    }
}


/* =========================================================
   CLOUD COMMUNICATION
   ========================================================= */
void sendTelemetryToCloud() {
    if (!wifiConnected()) return; // return if wifi is not connected

    HTTPClient cloudHttpClient; // create cloud HTTP client object
    cloudHttpClient.begin("https://d5uo13qpfc.execute-api.us-east-1.amazonaws.com/telemetry"); // begin connection to /telemetry endpoint
    cloudHttpClient.addHeader("Content-Type", "application/json"); // set content type to JSON

    StaticJsonDocument<256> jsonDoc; // create JSON document
    jsonDoc["deviceId"] = "cooler-01"; // set device ID
    jsonDoc["systemState"] = systemStateToString(currentState); // set system state
    jsonDoc["currentTemp"] = thermalState.currentTempC; // set current temperature
    jsonDoc["targetTemp"] = thermalState.targetTempC; // set target temperature
    jsonDoc["uptimeMs"] = millis(); // set uptime in milliseconds

    String payload; // create payload string
    serializeJson(jsonDoc, payload); // serialize JSON document to payload string

    cloudHttpClient.POST(payload); // send POST request with payload to cloud
    Serial.println("Sent telemetry to cloud: " + payload);
    cloudHttpClient.end(); // close HTTP client
}

void pollCloudForCommand() { // new
    if (!wifiConnected()) return; // return if wifi is not connected

    HTTPClient cloudHttpClient; // create cloud HTTP client object
    cloudHttpClient.begin("https://d5uo13qpfc.execute-api.us-east-1.amazonaws.com/command"); // begin connection to /command endpoint
    int httpCode = cloudHttpClient.GET(); // send GET request to cloud

    if (httpCode == 200) { // if HTTP response code is 200 (OK)
        String payload = cloudHttpClient.getString(); // get response payload
        StaticJsonDocument<256> jsonDoc; // create JSON document
        DeserializationError err = deserializeJson(jsonDoc, payload); // deserialize payload string to JSON document

        if (err) { // if deserialization fails
            Serial.println("JSON deserialization error: " + String(err.c_str())); // print deserialization error message
            cloudHttpClient.end(); // close HTTP client
            return;
        }

        String cmd = jsonDoc["command"]; // get command from JSON document
        Serial.println("Received command: " + cmd); // print command message
        if (cmd == "SET_TARGET_TEMP") { // if command is SET_TARGET_TEMP
            float target = jsonDoc["value"]; // get target temperature value
            if (target < 0){
                Serial.println("Invalid target temperature, must be greater than 0 °C"); // print error message
                cloudHttpClient.end(); // close HTTP client
                return;
            }
            thermalState.targetTempC = target;  // update target temperature

            if (currentState != SystemState::Cooling) { // if system state is not Cooling
                setSystemState(SystemState::Cooling); // set system state to Cooling
            }

        } else if (cmd == "STOP_COOLING") { // if command is STOP_COOLING
            setSystemState(SystemState::Idle); // set system state to Idle
        }

        else {
            Serial.println("Unknown command received: " + cmd); // print unknown command message
        }
    }
    else {
        Serial.println("HTTP GET failed, code: " + String(httpCode)); // print HTTP error code
    }

    cloudHttpClient.end();
}


/* =========================================================
   STATE MACHINE
   ========================================================= */
void runStateMachine() {
    switch (currentState) {

    /* ---------------- BOOTING ---------------- */
    case SystemState::Booting: // - Paschal
        // --- Configure GPIO modes ---
        pinMode(PELTIER1_PIN, OUTPUT);
        pinMode(PELTIER2_PIN, OUTPUT);
        pinMode(PELTIER3_PIN, OUTPUT);
        pinMode(PELTIER4_PIN, OUTPUT);
        pinMode(FAN1_PIN, OUTPUT);
        pinMode(FAN2_PIN, OUTPUT);

        // --- Motor PWM setup ---
        ledcSetup(PWM_CHANNEL, PWM_FREQ, PWM_RES_BITS);
        ledcAttachPin(MOSFET_MOTOR_PIN, PWM_CHANNEL);

        // --- Ensure everything OFF ---
        peltiersOff();
        fansOff();
        motorOff();

        tempSensor.begin(); // initialize temperature sensor

        thermalState.currentTempC = 0.0f; // initialize current temp
        thermalState.targetTempC = 5.0f; // default target temp (fridge)

        connectToWifi(); // connect to wifi

        setSystemState(SystemState::Idle); // set system state to Idle
        break;


    /* ---------------- IDLE ---------------- */
    case SystemState::Idle:
        peltiersOff();
        fansOff();
        motorOff();
        break;

    /* ---------------- COOLING ---------------- */
    case SystemState::Cooling:
        readTemperature(); // read temperature

        if (thermalState.currentTempC > thermalState.targetTempC) { // if current temp is greater than target
            peltiersOn();
            fansOn();
            setMotorSpeed(200);   // adjust speed as needed
            Serial.println("Cooling... Current Temp: " + String(thermalState.currentTempC) + " °C, Target Temp: " + String(thermalState.targetTempC) + " °C");
        } else { // if current temp is less than or equal to target
            peltiersOff();
            fansOff();
            motorOff();
            Serial.println("Target temperature reached. Current Temp: " + String(thermalState.currentTempC) + " °C");
            setSystemState(SystemState::Idle); // set system state to Idle
        }
        break;

    /* ---------------- ERROR ---------------- */
    case SystemState::Error:
        peltiersOff();
        fansOff();
        motorOff();
        break;
    }
}

/* =========================================================
   SETUP & LOOP
   ========================================================= */
void setup() { // called once at startup
    Serial.begin(115200); // initialize serial interface for debugging
    currentState = SystemState::Booting; // set initial system state to Booting
    Serial.println("System Booting...");
}

void loop() { // called repeatedly
    unsigned long now = millis(); // get current time in milliseconds

    if (now - lastTelemMs >= 30000) { // send telemetry every 30 seconds
        lastTelemMs = now;       // update last telemetry timestamp
        readTemperature();       // get latest temperature
        sendTelemetryToCloud();  // send telemetry to cloud
    }

    if (now - lastCmdPollMs >= 2000) { // Poll cloud for commands from cloud every 2 seconds
        lastCmdPollMs = now; // update last command poll timestamp
        pollCloudForCommand(); // poll cloud for command
    }

    if (!wifiConnected() && now - lastWifiRetryMs >= 60000) { // retry wifi connection every 60 seconds
        lastWifiRetryMs = now;
        connectToWifi();
    }

    runStateMachine(); // Run state machine
}