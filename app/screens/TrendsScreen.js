import { StyleSheet, Text, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { typography } from "../constants/typography";
import { colours } from "../constants/colours";

import CoolingCurve from "../components/CoolingCurve";

const { width, height } = Dimensions.get("window");

const TrendsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.title, styles.header]}>Thermal Profile</Text>

      <View style={styles.graph}>
        <Text style={typography.subtitle}>Cooling Curve</Text>
        <CoolingCurve />
      </View>

      <View style={styles.insightsContainer}>
        <Text style={typography.subtitle}>Insights</Text>
        <Text style={typography.body}>
          Range: <Text style={typography.boldBody}>20.5°C → 4.0°C</Text>
          {"\n"}
          Cooling Time: <Text style={typography.boldBody}>11m 13s</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  insightsContainer: {
    backgroundColor: colours.trendsBackgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
    borderRadius: 12,
    justifyContent: "center",
  },
});
