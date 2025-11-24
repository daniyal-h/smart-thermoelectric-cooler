import { LineChart } from "react-native-chart-kit";
import { Dimensions, View, StyleSheet } from "react-native";
import { useState } from "react";

import { colours } from "../constants/colours";

const mockData = {
  labels: ["0m", "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "10m"],
  datasets: [
    {
      data: [20.5, 19.1, 17.7, 16.3, 14.9, 13.5, 12.1, 10.7, 8.9, 7.1, 5.5],
      color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`, // line color
      strokeWidth: 2,
    },
  ],
};

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

const CoolingCurve = () => {
  const [chartHeight, setChartHeight] = useState(0);

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
          data={mockData}
          width={width * 0.9} // fits portrait screen
          height={chartHeight}
          yAxisSuffix="°C"
          formatYLabel={(y) => `${Math.round(y / 5) * 5}`} // rounds to nearest 5
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
