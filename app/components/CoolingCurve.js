import { LineChart } from "react-native-chart-kit";
import { Dimensions, View, StyleSheet, Text } from "react-native";
import { useState } from "react";

import { colours } from "../constants/colours";
import { rectifyLiveReadings } from "../utils/trendsHelper";
import { typography } from "../constants/typography";

const mockDataOnly = [
  20.5, 19.8, 19.1, 18.4, 17.7, 17.0, 16.3, 15.6, 14.9, 14.2, 13.5, 12.8, 12.1,
  11.4, 10.7, 9.5, 8.3, 7.7, 6.8, 6.1, 5.5,
];

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

  console.log(temperatures);

  const data = {
    labels: ["0m", "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", "10m"],
    datasets: [
      {
        data: temperatures, // sample by minute
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
      {chartHeight > 0 && temperatures ? (
          <LineChart
            data={data}
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
      ) : (
        <Text style={typography.body}>No data found</Text>
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
