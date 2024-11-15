import React from 'react';
import { View, Text } from 'react-native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faExclamationTriangle, faComment, faMapMarker } from '@fortawesome/free-solid-svg-icons';

import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
  default: "native",
});

const SOSReports = () => {
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
    <View className={`flex p-4`}>
      <Text className={`text-2xl font-bold mb-4`}>SOS Reports</Text>
      {reports.map((report, index) => (
        <View key={index} className={`border border-gray-300 rounded-lg p-4 mb-4`}>
          <Text className={`text-sm text-gray-500 mb-2`}>{report.timestamp}</Text>
          <View className={`flex flex-row items-center`}>
            <FontAwesomeIcon icon={report.icon} size={16} color="red" />
            <Text className={`ml-2`}>{report.timestamp}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default SOSReports;