import { View, Pressable, StyleSheet, Platform } from "react-native";
import { useCallback } from "react";
import { RadialSlider } from "react-native-radial-slider";
import _ from "lodash";
import { RFValue, RFPercentage } from "react-native-responsive-fontsize";
import { colours } from "../constants/colours";

const SliderControl = ({
  isDesiredOn,
  isCooling,
  temp,
  setTemp,
  liveReading,
  gradientStart,
  gradientEnd,
  track,
  textSlider,
  subtextSlider,
  leftIcon,
  centerIcon,
  rightIcon,
}) => {
  // debounce delay for rapid changes
  const debouncedUpdate = useCallback(
    _.debounce((newTemp) => {
      setTemp(newTemp);
      console.log("New Desired Value:", newTemp);
    }, 100),
    [], // make sure it's created once
  );

  const handlePrecisionUpdate = (updateVal) => {
    setTemp(temp + updateVal);
  };

  const handleAutoSet = () => {
    setTemp(5.5); // ideal fridge temp
  };

  // const uiCoolingState = isDesiredOn ? "Starting" : isCooling ? "Cooling" : "System Off";
  let uiCoolingState;

  if (isDesiredOn) {
    uiCoolingState = isCooling ? "Cooling" : "Starting";
  } else {
    uiCoolingState = isCooling ? "Stopping" : "System Off";
  }

  return (
    <View>
      <RadialSlider
        value={temp}
        min={0}
        max={25}
        step={0.5}
        markerValue={liveReading}
        onChange={debouncedUpdate}
        subTitle={uiCoolingState}
        unit="°C"
        thumbRadius={RFValue(20)}
        sliderWidth={RFValue(36)}
        radius={RFValue(120)}
        isHideLines={false}
        lineSpace={1000}
        thumbColor={isDesiredOn && colours.buttonPrimary}
        sliderTrackColor={track}
        linearGradient={
          isDesiredOn
            ? [
                { offset: "0%", color: gradientStart },
                { offset: "100%", color: gradientEnd },
              ]
            : [
                { offset: "0%", color: colours.buttonDisabled },
                { offset: "100%", color: colours.buttonDisabled },
              ]
        }
        titleStyle={[styles.subtitle, { color: subtextSlider }]}
        subTitleStyle={[styles.subtitle, { color: subtextSlider }]}
        valueStyle={[
          styles.value,
          isDesiredOn
            ? { color: textSlider }
            : { color: colours.buttonDisabled },
        ]}
        unitStyle={[
          styles.unit,
          isDesiredOn
            ? { color: textSlider }
            : { color: colours.buttonDisabled },
        ]}
        isHideButtons={true}
        stroke={textSlider}
      />

      {/* Convenient buttons */}
      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { borderColor: isDesiredOn ? "#1e88e5" : colours.buttonDisabled },
            pressed && { opacity: 0.3 },
          ]}
          onPress={() => handlePrecisionUpdate(-0.5)}
        >
          {leftIcon(isDesiredOn ? textSlider : colours.buttonDisabled, 32)}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { borderColor: isDesiredOn ? "#1e88e5" : colours.buttonDisabled },
            pressed && { opacity: 0.3 },
          ]}
          onPress={() => handleAutoSet()}
        >
          {centerIcon(isDesiredOn ? textSlider : colours.buttonDisabled, 32)}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { borderColor: isDesiredOn ? "#1e88e5" : colours.buttonDisabled },
            pressed && { opacity: 0.3 },
          ]}
          onPress={() => handlePrecisionUpdate(0.5)}
        >
          {rightIcon(isDesiredOn ? textSlider : colours.buttonDisabled, 32)}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: Platform.OS === "ios" ? RFPercentage(-8) : RFValue(-32),
  },
  button: {
    borderRadius: 100,
    borderWidth: 1.5,
    padding: 10,
  },
  subtitle: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: RFValue(16),
  },
  value: {
    fontFamily: "Rajdhani_700Bold",
    fontSize: RFValue(70),
  },
  unit: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: RFValue(30),
  },
});

export default SliderControl;
