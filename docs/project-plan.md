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
*As as user, I want to see temperature changes over time so I can verify cooling performance.*

#### Dev Tasks:
- Create and design the temperature trend screen (3 hours).
- Add stub data to simulate a realistic trend as a graph (5 hours).
- Add an insights node which gives a general summary of the cooling (4 hours).


## Milestone 2: Hardware Integration and Control
**Goal:** Integrate ESP32 and thermoelectric module with full communication and feedback loop.

### User Story #3
*As a user, I want to remotely control the cooler so I can adjust the temperature without physical access.*  

#### Dev Tasks:
- Connect the mobile app to the microcontroller over a Wi-Fi connection (3 hours).
- Create a protocol to enable communication between the microcontroller and the app in a RESTful manner (6 hours).
- Test the communication by sending simple temperature change commands (5 hours).

### User Story #4
*As as user, I want to see temperature changes over time so I can verify cooling performance.* 

#### Dev Tasks:
- Use a GET to periodically acquire the temperature of the unit and store it (6 hours).
- Populate the graph based on the data in storage (5 hours).
- Create insights of simple metrics of the temperature trend (5 hours).