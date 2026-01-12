import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { RFValue } from "react-native-responsive-fontsize";

import { typography } from "../constants/typography";
import { colours } from "../constants/colours";
import icons from "../constants/icons";
import { getStatus, sendCommand } from "../api/coolerApi";
import { getTimeSinceString, getTimeSince } from "../utils/controlHelper";

import SliderControl from "../components/SliderControl";

const { width, height } = Dimensions.get("window");

const ControlScreen = () => {
  const onThreshold = 90;
  const updateSpeed = 35000; // in s; 5s slower than ESP32 update speed

  const [isOn, setIsOn] = useState(false); // default to off
  const [userTarget, setUserTarget] = useState(null);
  const [systemTarget, setSystemTarget] = useState(null);
  const [liveReading, setLiveReading] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState("");

  const [initialized, setInitialized] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchStatus = async () => {
        const { currentTemp, state, targetTemp, timestamp } = await getStatus();
        if (!isActive) return;

        // set UI based on status
        setLiveReading(currentTemp);
        setSystemTarget(targetTemp);

        // initialize slider once from system state
        if (!initialized) {
          setUserTarget(targetTemp);
          setInitialized(true);
        }

        // infer system state if latest update was less than the threshold
        const timeSince = getTimeSince(timestamp);
        setIsOn(timeSince <= onThreshold && state === "Cooling");

        setLastUpdateTime(getTimeSinceString(timestamp));
      };

      // fetch on focus then periodically
      fetchStatus();
      const intervalId = setInterval(fetchStatus, updateSpeed);

      return () => {
        // clean up when no longer in focus
        clearInterval(intervalId);
        isActive = false;
      };
    }, [initialized])
  );

  // send command ONLY when user changes target
  useEffect(() => {
    if (!initialized) return;
    if (userTarget === systemTarget) return;

    sendCommand(userTarget);
  }, [userTarget, systemTarget, initialized]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          // toggle background colour by system status
          backgroundColor: isOn
            ? colours.backgroundPrimary
            : colours.backgroundOff,
        },
      ]}
    >
      <View>
        <Text style={[styles.header, typography.title]}>
          Temperature Control
        </Text>

        <Text style={[{ textAlign: "center" }, typography.smallDisplay]}>
          Current: {liveReading}°C
        </Text>
        <Text style={[{ textAlign: "center" }, typography.caption]}>
          updated {lastUpdateTime}
        </Text>
      </View>

      <View style={styles.controlContainer}>
        <View style={styles.liveReading}>
          {icons.thermometer(colours.subtextSlider, 18)}
          <Text style={styles.readingText}>{liveReading}</Text>
        </View>

        <SliderControl
          isOn={isOn}
          temp={userTarget}
          liveReading={liveReading}
          setTemp={setUserTarget}
          gradientStart={colours.gradientStart}
          gradientEnd={colours.gradientEnd}
          textSlider={colours.textSlider}
          subtextSlider={colours.subtextSlider}
          leftIcon={icons.minus}
          centerIcon={icons.auto}
          rightIcon={icons.plus}
        />

        <View style={{ marginTop: 20, gap: 12 }}>
          <Pressable
            // reflect power status with outline colour
            style={({ pressed }) => [
              styles.powerButtonContainer,
              styles.shadowOutline,
              {
                borderColor: isOn
                  ? colours.buttonPrimary
                  : colours.buttonDisabled,
              },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setIsOn((prev) => !prev)} // toggle
          >
            {/* Make the power button toggle in text and colour */}
            <View style={styles.powerButton}>
              {!isOn ? (
                <>
                  {icons.power()}
                  <Text style={typography.boldBody}>Start Cooling</Text>
                </>
              ) : (
                <>
                  {icons.power(colours.buttonPrimary)}
                  <Text style={typography.boldBody}>Stop Cooling</Text>
                </>
              )}
            </View>
          </Pressable>

          <View
            style={[
              styles.commandWindow,
              styles.shadowOutline,
              !isOn && { opacity: 0.6 },
            ]}
          >
            <Text style={typography.boldBody}>Command Window</Text>
            {isOn ? (
              <Text style={typography.body}>
                Cooling unit to {userTarget.toFixed(1)}°C...
              </Text>
            ) : (
              <Text style={typography.boldBody}>System is off...</Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ControlScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
  },
  header: {
    marginTop: height * 0.03,
    marginBottom: 8,
  },
  controlContainer: {
    flex: 1,
    marginTop: 16,
    justifyContent: "space-evenly",
  },
  liveReading: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: RFValue(-100),
    marginTop: RFValue(80),
    marginTop: Platform.OS === "ios" ? RFValue(60) : RFValue(82),
  },
  readingText: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: RFValue(16),
    color: colours.subtextSlider,
  },
  commandWindow: {
    backgroundColor: colours.backgroundSecondary,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 6,
  },
  powerButtonContainer: {
    backgroundColor: colours.backgroundSecondary,
    paddingVertical: 12,
  },
  powerButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  shadowOutline: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderRadius: 16,
    borderColor: "rgba(0,0,0,0.05)",
  },
});
