import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faExclamationTriangle, faComment, faMapMarker } from '@fortawesome/free-solid-svg-icons';
import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
  default: "native",
});

const RecipientSOSReports = () => {
  const reports = [
    {
      timestamp: '7/17/24 2:11 PM',
      icon: faExclamationTriangle,
    },
    {
      timestamp: '8/11/24 11:11 PM',
      icon: faExclamationTriangle,
    },
    {
      timestamp: '9/11/24 12:11 PM',
      icon: faExclamationTriangle,
    },
    {
      timestamp: '10/11/24 4:11 PM',
      icon: faComment,
    },
    {
      timestamp: '11/11/24 11:11 AM',
      icon: faExclamationTriangle,
    },
    {
      timestamp: '11/11/24 11:11 AM',
      icon: faExclamationTriangle,
    },
    {
      timestamp: '9/17/24 8:00 AM',
      icon: faMapMarker,
    },
  ];

  return (
    <View className={`flex-1 p-4 bg-gray-100`}>
      <Text className={`text-3xl font-bold text-left mb-6 text-black`}>SOS Reports:</Text>
      <View className={`space-y-4`}>
        {reports.map((report, index) => (
          <View key={index} className={`flex flex-row items-center bg-white border border-gray-300 rounded-lg shadow-md p-4`}>
            <FontAwesomeIcon icon={report.icon} size={20} color="red" />
            <View className={`ml-3`}>
              <Text className={`text-lg font-semibold`}>{report.timestamp}</Text>
              <Text className={`text-sm text-gray-500`}>Details about the report...</Text> {/* Placeholder for additional details */}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default RecipientSOSReports;