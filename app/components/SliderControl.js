import { View, Pressable, StyleSheet } from "react-native";
import { useCallback } from "react";
import { RadialSlider } from "react-native-radial-slider";
import _ from "lodash";
import { RFValue } from "react-native-responsive-fontsize";
import { colours } from "../constants/colours";

const SliderControl = ({
  isOn,
  temp,
  setTemp,
  unitTemp,
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
    [] // make sure it's created once
  );

  const handlePrecisionUpdate = (updateVal) => {
    setTemp(temp + updateVal);
  };

  const handleAutoSet = () => {
    setTemp(4); // ideal fridge temp
  };

  return (
    <View>
      <RadialSlider
        value={temp}
        min={0}
        max={25}
        step={0.5}
        markerValue={unitTemp}
        onChange={debouncedUpdate}
        subTitle={isOn ? "Cooling" : "System Off"}
        unit="°C"
        thumbRadius={RFValue(20)}
        sliderWidth={RFValue(36)}
        radius={RFValue(120)}
        isHideLines={false}
        lineSpace={1000}
        thumbColor={isOn && colours.buttonPrimary}
        sliderTrackColor={track}
        linearGradient={
          isOn
            ? [
                { offset: "0%", color: gradientStart },
                { offset: "100%", color: gradientEnd },
              ]
            : [
                { offset: "0%", color: colours.buttonDisabled },
                { offset: "100%", color: colours.buttonDisabled },
              ]
        }
        subTitleStyle={[styles.subtitle, { color: subtextSlider }]}
        valueStyle={[
          styles.value,
          isOn ? { color: textSlider } : { color: colours.buttonDisabled },
        ]}
        unitStyle={[
          styles.unit,
          isOn ? { color: textSlider } : { color: colours.buttonDisabled },
        ]}
        isHideButtons={true}
        stroke={textSlider}
      />

      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { borderColor: isOn ? "#1e88e5" : colours.buttonDisabled },
            pressed && { opacity: 0.3 },
          ]}
          onPress={() => handlePrecisionUpdate(-0.5)}
        >
          {leftIcon(isOn ? textSlider : colours.buttonDisabled, 32)}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { borderColor: isOn ? "#1e88e5" : colours.buttonDisabled },
            pressed && { opacity: 0.3 },
          ]}
          onPress={() => handleAutoSet()}
        >
          {centerIcon(isOn ? textSlider : colours.buttonDisabled, 32)}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { borderColor: isOn ? "#1e88e5" : colours.buttonDisabled },
            pressed && { opacity: 0.3 },
          ]}
          onPress={() => handlePrecisionUpdate(0.5)}
        >
          {rightIcon(isOn ? textSlider : colours.buttonDisabled, 32)}
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
    marginTop: RFValue(-32),
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
