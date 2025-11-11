import { StyleSheet, Text, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { typography } from "../constants/typography";
import { colours } from "../constants/colours";
import icons from "../constants/icons";

import SliderControl from "../components/SliderControl";

const { width, height } = Dimensions.get("window");

const ControlScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={[styles.header, typography.title]}>
          Temperature Control
        </Text>

        <Text style={[{ textAlign: "center" }, typography.smallDisplay]}>
          Current: 20.5°C
        </Text>
      </View>

      <View style={styles.slider}>
        <SliderControl
          gradientStart={colours.gradientStart}
          gradientEnd={colours.gradientEnd}
          textSlider={colours.textSlider}
          subtextSlider={colours.subtextSlider}
          leftIcon={icons.minus}
          rightIcon={icons.plus}
        />
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
  slider: {
    //backgroundColor: colours.backgroundSecondary,
    width: "100%",
    height: "45%",
    borderRadius: 16,
    marginBottom: height * 0.15,
    alignItems: "center",
    justifyContent: "center",
  },
});
