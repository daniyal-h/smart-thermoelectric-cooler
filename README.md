# Smart Thermoelectric Cooler

The **Smart Thermoelectric Cooler** is a mobile-controlled temperature regulation system designed for cooling of aluminum cans using thermoelectric (Peltier) modules. The companion app allows users to remotely monitor and adjust temperature settings through a clean and intuitive interface. Real-time temperature trends are displayed within the app, providing insight into system performance and stability.

---

## Features

### 1. Remote Control
The mobile app connects to the ESP32 microcontroller over Wi-Fi using a REST API. Users can adjust the target temperature through an on-screen slider or buttons, and the app sends this value to the microcontroller. The ESP32 then regulates the cooling intensity by controlling the current to the thermoelectric (Peltier) module via PWM, allowing precise and efficient temperature control without mechanical components.

### 2. Real-Time Temperature Monitoring
The system continuously measures temperature through a digital sensor in the cooler. This data is sent from the ESP32 to the app at regular intervals, where it is displayed in both numeric and graphical form. Users can observe live updates and temperature trends, helping visualize the cooler’s performance and system stability.


---

## Milestones

**Milestone 1 - App UI and Core Features**  
Develop a fully functional mobile interface that simulates all controls and data visualization without hardware integration.  
- Interactive slider and temperature display.
- Mock backend for testing UI responsiveness.
- Navigation between control and monitoring screens.

**Milestone 2 - Hardware Integration and System Control**  
Connect the app to the actual thermoelectric system for full operation.  
- Real-time data exchange with ESP32.
- PWM control of TEC based on user input.
- Temperature sensor feedback and live graph updates.

---

## Tech Stack

- **Mobile App:** React Native (Expo)  
- **Microcontroller:** ESP32 (C/C++)  
- **Communication:** REST API (Wi-Fi)  
- **Cooling Hardware:** Thermoelectric (Peltier) modules  
- **Sensor:** Digital temperature sensor

---

## Documentation

All detailed planning, testing, and retrospective notes are available in the [`docs/`](./docs) directory.