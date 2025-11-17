import { StyleSheet, Text, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { typography } from "../constants/typography";
import { colours } from "../constants/colours";

const { width, height } = Dimensions.get("window");

const TrendsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.title, styles.header]}>Temperature Trends</Text>

      <View style={styles.graph}></View>

      <View style={styles.insightsContainer}>
        <Text style={typography.subtitle}>
          Insights
        </Text>
        <Text>
          Range: Cooled from 20.5
          Cooling Time: 
          Cooling Rate: 
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default TrendsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //alignItems: "center",
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
    backgroundColor: "skyblue",
    justifyContent: "center",
    flex: 1.5,
  },
  insightsContainer: {
    backgroundColor: "skyblue",
    flex: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
});
