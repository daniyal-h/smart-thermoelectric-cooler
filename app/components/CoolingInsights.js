import { Text, View } from "react-native";

import { typography } from "../constants/typography";

const CoolingInsights = ({ startTime, finishTime, startTemp, finishTemp }) => {
  const delta = finishTime - startTime;
  const minutes = Math.floor(delta / 60);
  const seconds = Math.floor(delta % 60);
  const coolingRate = ((finishTemp - startTemp) / (delta / 60)).toFixed(2); // divide by zero

  return (
    <View>
      {delta > 0 ? (
        <Text style={typography.body}>
          Range:{" "}
          <Text style={typography.boldBody}>
            {startTemp}°C → {finishTemp}°C
          </Text>
          {"\n"}
          Cooling Time:{" "}
          <Text style={typography.boldBody}>
            {minutes}m {seconds}s
          </Text>
          {"\n"}
          Cooling Rate:{" "}
          <Text style={typography.boldBody}>{coolingRate}°C/min</Text>
        </Text>
      ) : (
        <Text style={typography.body}>Requires at least two data points...</Text>
      )}
    </View>
  );
};

export default CoolingInsights;
