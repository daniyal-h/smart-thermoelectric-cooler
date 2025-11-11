import { View, Pressable, StyleSheet } from "react-native";
import { useState, useCallback } from "react";
import { RadialSlider } from "react-native-radial-slider";
import _ from "lodash";

const SliderControl = ({
  gradientStart,
  gradientEnd,
  track,
  textSlider,
  subtextSlider,
  leftIcon,
  rightIcon,
}) => {
  // temp value
  const [temp, setTemp] = useState(20.5);

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
        thumbRadius={20}
        sliderWidth={36}
        radius={120}
        markerLineSize={0}
        isHideLines={true}
        lineSpace={4}
        sliderTrackColor={track}
        linearGradient={[
          { offset: "0%", color: gradientStart },
          { offset: "100%", color: gradientEnd },
        ]}
        subTitleStyle={{ fontSize: 16, color: subtextSlider }}
        valueStyle={{ fontSize: 55, fontWeight: "600", color: textSlider }}
        unitStyle={{ fontSize: 30, color: textSlider }}
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
    gap: 32,
    marginTop: -32,
  },
  button: {
    borderRadius: 100,
    borderColor: "#1e88e5",
    borderWidth: 1.5,
    padding: 10,
  },
});

export default SliderControl;
