import { StyleSheet, Text, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { typography } from "../constants/typography";
import { colours } from "../constants/colours";
import { ingestTelemetry } from "../api/coolerApi";
import {
  getTelemetries,
  getStartingTime,
  getLabels,
} from "../utils/trendsHelper";

import CoolingCurve from "../components/CoolingCurve";

const { width, height } = Dimensions.get("window");
const hPadding = 16;
const updateSpeed = 35000; // in s; 5s slower than ESP32 update speed

const TrendsScreen = () => {
  const [temperatures, setTemperatures] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchTelemetryHistory = async () => {
        const data = await ingestTelemetry(); // get history

        if (!isActive) return;
        if (!data) {
          // TODO
          console.log("Telemetry history was empty!");
          setTemperatures(null);
          setStartTime(null);
          return;
        }

        // store history
        const [ts, temps] = getTelemetries(data); // destructure tuple
        setTemperatures(temps);
        setStartTime(getStartingTime(ts[0])); // start at oldest
      };

      // fetch on focus then periodically
      fetchTelemetryHistory();
      const intervalId = setInterval(fetchTelemetryHistory, updateSpeed);

      return () => {
        // clean up when no longer in focus
        clearInterval(intervalId);
        isActive = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.title, styles.header]}>Thermal Profile</Text>

      <View style={styles.graph}>
        <Text style={typography.subtitle}>Cooling Curve</Text>
        <Text style={typography.body}>
          Started: <Text style={typography.boldBody}>{startTime}</Text>
        </Text>
        <CoolingCurve temperatures={temperatures} />
      </View>

      <View style={styles.insightsContainer}>
        <Text style={typography.subtitle}>Insights</Text>
        <Text style={typography.body}>
          Range: <Text style={typography.boldBody}>20.5°C → 5.5°C</Text>
          {"\n"}
          Cooling Time: <Text style={typography.boldBody}>10m 13s</Text>
          {"\n"}
          Cooling Rate: <Text style={typography.boldBody}>-1.47°C/min</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default TrendsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    backgroundColor: colours.trendsBackgroundPrimary,
  },
  header: {
    marginTop: height * 0.03,
    marginBottom: 8,
    textAlign: "center",
  },
  graph: {
    marginVertical: 24,
    backgroundColor: colours.trendsBackgroundSecondary,
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: hPadding,
    paddingVertical: 12,
    gap: 6,
  },
  insightsContainer: {
    backgroundColor: colours.trendsBackgroundSecondary,
    paddingHorizontal: hPadding,
    paddingVertical: 12,
    gap: 6,
    borderRadius: 12,
    justifyContent: "center",
  },
});
