import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { RFValue } from "react-native-responsive-fontsize";

import { typography } from "../constants/typography";
import { colours } from "../constants/colours";
import icons from "../constants/icons";

import SliderControl from "../components/SliderControl";

const { width, height } = Dimensions.get("window");

const ControlScreen = () => {
  const mockCurrentTemp = 20.5;
  const [isOn, setIsOn] = useState(false); // default to off
  const [temp, setTemp] = useState(mockCurrentTemp);
  const [liveReading, setLiveReading] = useState(mockCurrentTemp);
  const [lastUpdateTime, setLastUpdateTime] = useState(37);

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
          Current: {mockCurrentTemp}°C
        </Text>
        <Text style={[{ textAlign: "center" }, typography.caption]}>
          updated {lastUpdateTime}s ago
        </Text>
      </View>

      <View style={styles.controlContainer}>
        <View style={styles.liveReading}>
          {icons.thermometer(colours.subtextSlider, 18)}
          <Text style={styles.readingText}>20.5</Text>
        </View>

        <SliderControl
          isOn={isOn}
          temp={temp}
          liveReading={liveReading}
          setTemp={setTemp}
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
                Cooling unit to {temp.toFixed(1)}°C...
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
