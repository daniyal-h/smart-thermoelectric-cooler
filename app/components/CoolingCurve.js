import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const mockData = [
  { value: 20.5, dataPointText: "20.5", label: "0m" },
  { value: 18.8, dataPointText: "18.8", label: "1m" },
  { value: 17.1, dataPointText: "17.1", label: "2m" },
  { value: 15.4, dataPointText: "15.4", label: "3m" },
  { value: 13.6, dataPointText: "13.6", label: "4m" },
  { value: 11.9, dataPointText: "11.9", label: "5m" },
  { value: 10.2, dataPointText: "10.2", label: "6m" },
  { value: 8.6, dataPointText: "8.6", label: "7m" },
  { value: 6.9, dataPointText: "6.9", label: "8m" },
  { value: 5.3, dataPointText: "5.3", label: "9m" },
  { value: 4.0, dataPointText: "4.0", label: "10m" },
];

const CoolingCurve = () => {
  return <LineChart data={mockData} />;
};

export default CoolingCurve;

const styles = StyleSheet.create({});
