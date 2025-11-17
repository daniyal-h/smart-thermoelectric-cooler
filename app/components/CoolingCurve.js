import { StyleSheet, Text, View, ScrollView } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const mockData = [
  { value: 20.5, dataPointText: "20.5" },
  { value: 19.8, dataPointText: "19.8" },
  { value: 19.1, dataPointText: "19.1" },
  { value: 18.4, dataPointText: "18.4" },
  { value: 17.7, dataPointText: "17.7" },
  { value: 17.0, dataPointText: "17.0" },
  { value: 16.3, dataPointText: "16.3" },
  { value: 15.6, dataPointText: "15.6" },
  { value: 14.9, dataPointText: "14.9" },
  { value: 14.2, dataPointText: "14.2" },
  { value: 13.5, dataPointText: "13.5" },
  { value: 12.8, dataPointText: "12.8" },
  { value: 12.1, dataPointText: "12.1" },
  { value: 11.4, dataPointText: "11.4" },
  { value: 10.7, dataPointText: "10.7" },
  { value: 10.0, dataPointText: "10.0" },
  { value: 8.9, dataPointText: "8.9" },
  { value: 7.7, dataPointText: "7.7" },
  { value: 6.5, dataPointText: "6.5" },
  { value: 5.3, dataPointText: "5.3" },
  { value: 4.0, dataPointText: "4.0" },
];

const xLabels = [
  "0s",
  "30s",
  "1m",
  "1m30",
  "2m",
  "2m30",
  "3m",
  "3m30",
  "4m",
  "4m30",
  "5m",
  "5m30",
  "6m",
  "6m30",
  "7m",
  "7m30",
  "8m",
  "8m30",
  "9m",
  "9m30",
  "10m",
];

const CoolingCurve = ({ width }) => {
  const value = mockData[0].value + 2;
  const maxValue = Math.floor(value / 2) * 2;
  const stepValue = 2;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ width: mockData.length * 50 + 40, alignItems: "center" }}
    >
      <LineChart
        data={mockData}
        xAxisLabelTexts={xLabels}
        width={mockData.length * 50 + 20}
        maxValue={maxValue}
        initialSpacing={20}
        stepHeight={30}
        stepValue={stepValue}
        noOfSections={maxValue / stepValue}
        isAnimated={true}
        hideRules={true}
        scrollToEnd={true}
        endSpacing={20}
      />
    </ScrollView>
  );
};

export default CoolingCurve;
