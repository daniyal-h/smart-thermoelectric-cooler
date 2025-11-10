import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

import { typography } from "../constants/typography";
import { colours } from "../constants/colours";

const ControlScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.header, typography.boldBody]}>
        Temperature Control
      </Text>
    </SafeAreaView>
  );
};

export default ControlScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colours.backgroundPrimary
  },
  header: {
    marginTop: 24,
    marginVertical: 12,
    marginHorizontal: "5%",
  },
});
