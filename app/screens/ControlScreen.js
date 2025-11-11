import { StyleSheet, Text, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { typography } from "../constants/typography";
import { colours } from "../constants/colours";
import icons from "../constants/icons";

import SliderControl from "../components/SliderControl";

const { width, height } = Dimensions.get("window");

const ControlScreen = () => {
  const mockCurrentTemp = 20.5;
  const [temp, setTemp] = useState(mockCurrentTemp);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={[styles.header, typography.title]}>
          Temperature Control
        </Text>

        <Text style={[{ textAlign: "center" }, typography.smallDisplay]}>
          Current: {mockCurrentTemp}°C
        </Text>
      </View>

      <View style={styles.controlContainer}>
        <SliderControl
          temp={temp}
          setTemp={setTemp}
          gradientStart={colours.gradientStart}
          gradientEnd={colours.gradientEnd}
          textSlider={colours.textSlider}
          subtextSlider={colours.subtextSlider}
          leftIcon={icons.minus}
          centerIcon={icons.auto}
          rightIcon={icons.plus}
        />

        <View style={styles.commandWindow}>
          <Text style={typography.subsection}>Command Window</Text>
          <Text style={typography.boldBody}>
            Cooling unit to {temp.toFixed(1)}°C...
          </Text>
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
    backgroundColor: colours.backgroundPrimary,
    paddingHorizontal: width * 0.05,
  },
  header: {
    marginTop: height * 0.05,
    marginBottom: 8,
  },
  controlContainer: {
    flex: 1,
    marginTop: 16,
    justifyContent: "space-evenly",
  },
  commandWindow: {
    backgroundColor: colours.backgroundSecondary,
    borderRadius: 16,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.05)",
  },
});
