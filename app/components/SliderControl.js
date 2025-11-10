import { useState, useEffect, useCallback } from "react";
import { RadialSlider } from "react-native-radial-slider";
import _ from "lodash";

const SliderControl = ({ contentStyle }) => {
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

  return (
    <RadialSlider
      value={temp}
      min={0}
      max={40}
      step={0.5}
      onChange={debouncedUpdate}
      subTitle="Cool to"
      unit="°C"
      thumbRadius={20}
      sliderWidth={26}
      radius={120}
      markerLineSize={0}
      isHideLines={true}
      isHideMarkerLine={false}
      lineSpace={4}
      sliderTrackColor="#E5E5E5"
      linearGradient={[
        { offset: "0%", color: "#4fc3f7" }, // cool blue start
        { offset: "100%", color: "#0288d1" }, // deeper blue end
      ]}
      subTitleStyle={{ fontSize: 16, color: "#555" }}
      valueStyle={{ fontSize: 60, fontWeight: "600", color: "#1e88e5" }}
      unitStyle={{ fontSize: 30, color: "#1e88e5" }}
      buttonContainerStyle={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: 120,
        alignSelf: "center",
      }}
      leftIconStyle={{ width: 32, height: 32 }}
      rightIconStyle={{ width: 32, height: 32 }}
      stroke="#1e88e5"
      fixedMarker={false}
    />
  );
};

export default SliderControl;
