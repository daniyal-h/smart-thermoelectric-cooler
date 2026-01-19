# Smart Thermoelectric Cooler

The **Smart Thermoelectric Cooler** is a mobile-controlled cooling system using Peltier modules for precise, silent temperature regulation.  
The companion app enables remote control and displays real-time temperature trends for performance monitoring.

---

## Features

- **Remote Control:** Adjust and monitor cooling levels through a mobile app interface.  
- **Temperature Trends:** View real-time temperature graphs for system performance and stability.  

---

## Milestone 1: Frontend Simulation
**Goal:** Complete app interface with simulated data and mock backend.

### User Story #1
*As a user, I want simple control so I can adjust the temperature without physical access.*

#### Dev Tasks:
- Design and implement the screen UI (3 hours).
- Implement the slider and buttons for precise temperature control, including feedback (3 hours).

### User Story #2
*As a user, I want to see temperature changes over time so I can verify cooling performance.*

#### Dev Tasks:
- Create and design the temperature trend screen (3 hours).
- Add stub data to simulate a realistic trend as a graph (5 hours).
- Add an insights node which gives a general summary of the cooling (4 hours).


## Milestone 2: Hardware Integration and Control
**Goal:** Integrate ESP32 and thermoelectric module with full communication and feedback loop.

### User Story #3
*As a user, I want to remotely control the cooler so I can adjust the target temperature without physical access.*  

#### Dev Tasks:
- Integrate the mobile app with a cloud backend using RESTful APIs over HTTPS (3 hours).
- Connect the control screen UI to backend command endpoints (send commands and receive) and validate successful command submission (4 hours).

### User Story #4
*As a user, I want to see temperature changes over time so I can verify cooling performance.* 

#### Dev Tasks:
- Implement backend telemetry ingestion and persistence for temperature and system state data (4 hours).
- Implement periodic GET requests from the mobile app to retrieve recent telemetry data (4 hours).
- Populate the Trends screen graph using stored telemetry history from the backend (5 hours).
- Create insights of simple metrics of the temperature trend (4 hours).