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
import { useTarget } from "../context/TargetContext";

const { width, height } = Dimensions.get("window");
const onThreshold = 90; // 1 minute max
const updateSpeed = 10000; // every 10s

const ControlScreen = () => {
  const { target, setTarget } = useTarget(); // target shared across screens

  const [isCooling, setIsCooling] = useState(false); // backend truth
  const [isDesiredOn, setIsDesiredOn] = useState(false); // default to off
  const [systemTarget, setSystemTarget] = useState(null);
  const [liveReading, setLiveReading] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState("");

  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchStatus = async () => {
        const data = await getStatus();
        if (!isActive) return;
        if (!data) {
          setIsBackendConnected(false);
          return;
        }

        setIsBackendConnected(true);
        const { currentTemp, state, targetTemp, timestamp } = data;

        // set UI based on status
        setLiveReading(currentTemp);
        setSystemTarget(targetTemp);

        // initialize slider once from system state
        if (!initialized) {
          setTarget(targetTemp);
          setInitialized(true);
        }

        // infer system state if latest update was less than the threshold
        const timeSince = getTimeSince(timestamp);
        setIsCooling(timeSince <= onThreshold && state === "Cooling");

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
    }, [initialized]),
  );

  // send command ONLY when user changes target
  useEffect(() => {
    if (!isDesiredOn) return;
    if (!initialized) return;
    if (target === systemTarget) return;

    sendCommand(target, true);
  }, [target, systemTarget, initialized, isDesiredOn]);

  // for toggling cooling
  const onTogglePower = () => {
    const next = !isDesiredOn;
    setIsDesiredOn(next);
    sendCommand(systemTarget, next);
  };

  let uiCoolingState;

  if (isDesiredOn) {
    uiCoolingState = isCooling ? "Cooling unit to " : "Starting to cool to ";
  } else {
    uiCoolingState = isCooling ? "Stopping unit..." : "Unit is off...";
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          // toggle background colour by system status
          backgroundColor: isDesiredOn
            ? colours.backgroundPrimary
            : colours.backgroundOff,
        },
      ]}
    >
      <View>
        <Text style={[styles.header, typography.title]}>
          Temperature Control
        </Text>

        {isBackendConnected ? (
          <View>
            <Text style={[{ textAlign: "center" }, typography.smallDisplay]}>
              Current: {liveReading}°C
            </Text>
            <Text style={[{ textAlign: "center" }, typography.caption]}>
              updated {lastUpdateTime}
            </Text>
          </View>
        ) : (
          <Text style={[{ textAlign: "center" }, typography.smallDisplay]}>
            Error connecting to Database
          </Text>
        )}
      </View>

      <View style={styles.controlContainer}>
        <View style={styles.liveReading}>
          {icons.thermometer(colours.subtextSlider, 18)}
          <Text style={styles.readingText}>{liveReading}</Text>
        </View>

        <SliderControl
          isDesiredOn={isDesiredOn}
          isCooling={isCooling}
          temp={target}
          liveReading={liveReading}
          setTemp={setTarget}
          gradientStart={colours.gradientStart}
          gradientEnd={colours.gradientEnd}
          textSlider={colours.textSlider}
          subtextSlider={colours.subtextSlider}
          leftIcon={icons.minus}
          centerIcon={icons.auto}
          rightIcon={icons.plus}
        />

        {isBackendConnected ? (
          <View style={{ marginTop: 20, gap: 12 }}>
            <Pressable
              // reflect power status with outline colour
              style={({ pressed }) => [
                styles.powerButtonContainer,
                styles.shadowOutline,
                {
                  borderColor: isDesiredOn
                    ? colours.buttonPrimary
                    : colours.buttonDisabled,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={onTogglePower} // toggle
            >
              {/* Make the power button toggle in text and colour */}
              <View style={styles.powerButton}>
                {!isDesiredOn ? (
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
                !isDesiredOn && { opacity: 0.6 },
              ]}
            >
              <Text style={typography.boldBody}>Command Window</Text>
              {isDesiredOn ? (
                <Text style={typography.body}>
                  {uiCoolingState}{target.toFixed(1)}°C...
                </Text>
              ) : (
                <Text style={typography.boldBody}>{uiCoolingState}</Text>
              )}
            </View>
          </View>
        ) : (
          <View />
        )}
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
