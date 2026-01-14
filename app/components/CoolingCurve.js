import { LineChart } from "react-native-chart-kit";
import { Dimensions, View, StyleSheet } from "react-native";
import { useState } from "react";

import { colours } from "../constants/colours";
import { getLabels, getTemperatures } from "../utils/trendsHelper";

const chartConfig = {
  backgroundGradientFrom: colours.trendsBackgroundSecondary,
  backgroundGradientTo: colours.trendsBackgroundSecondary,
  decimalPlaces: 1, // one decimal place
  color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`, // line color
  labelColor: () => "#333", // axis labels
  propsForDots: {
    r: "3",
    strokeWidth: "2",
    stroke: "#1E88E5",
  },
};

const { width } = Dimensions.get("window");

const CoolingCurve = ({ temperatures }) => {
  const [chartHeight, setChartHeight] = useState(0);
  const labels = temperatures ? getLabels(temperatures.length) : null;

  const data = {
    labels,
    datasets: [
      {
        data: getTemperatures(temperatures), // sample by minute
        color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`, // line color
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View
      style={styles.graph}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        setChartHeight(height);
      }}
    >
      {chartHeight > 0 && (
        <LineChart
          data={data}
          width={width * 0.9} // fits portrait screen
          height={chartHeight}
          yAxisSuffix="°C"
          formatYLabel={(y) => `${Math.round(y)}`} // rounds to nearest 5
          xLabelsOffset={10}
          fromZero
          withVerticalLines={false}
          withHorizontalLines={false}
          withDots={true}
          chartConfig={chartConfig}
          style={{ borderRadius: 12 }}
        />
      )}
    </View>
  );
};

export default CoolingCurve;

const styles = StyleSheet.create({
  graph: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
});
