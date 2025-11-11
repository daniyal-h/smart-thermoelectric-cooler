import { View, Pressable, StyleSheet } from "react-native";
import { useCallback } from "react";
import { RadialSlider } from "react-native-radial-slider";
import _ from "lodash";
import { RFValue } from "react-native-responsive-fontsize";

const SliderControl = ({
  temp,
  setTemp,
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
        onChange={debouncedUpdate}
        subTitle="Cooling"
        unit="°C"
        thumbRadius={RFValue(20)}
        sliderWidth={RFValue(36)}
        radius={RFValue(120)}
        markerLineSize={0}
        isHideLines={true}
        lineSpace={RFValue(4)}
        sliderTrackColor={track}
        linearGradient={[
          { offset: "0%", color: gradientStart },
          { offset: "100%", color: gradientEnd },
        ]}
        subTitleStyle={{fontFamily: "Rajdhani_600SemiBold", fontSize: RFValue(16), color: subtextSlider }}
        valueStyle={{fontFamily: "Rajdhani_700Bold", fontSize: RFValue(70), color: textSlider }}
        unitStyle={{fontFamily: "Rajdhani_600SemiBold", fontSize: RFValue(30), color: textSlider }}
        isHideButtons={true}
        stroke={textSlider}
      />

      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.3 }]}
          onPress={() => handlePrecisionUpdate(-0.5)}
        >
          {leftIcon(textSlider, 32)}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.3 }]}
          onPress={() => handleAutoSet()}
        >
          {centerIcon(textSlider, 32)}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.3 }]}
          onPress={() => handlePrecisionUpdate(0.5)}
        >
          {rightIcon(textSlider, 32)}
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
    marginTop: RFValue(-24),
  },
  button: {
    borderRadius: 100,
    borderColor: "#1e88e5",
    borderWidth: 1.5,
    padding: 10,
  },
});

export default SliderControl;
