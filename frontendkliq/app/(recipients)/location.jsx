import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMapMarker } from '@fortawesome/free-solid-svg-icons';

import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
  default: "native",
});

const Location = () => {
  const reports = [
    {
      timestamp: '9/17/24 8:00 AM',
      location: 'map.google.com/12341234', // Replace with actual location URL
    },
    {
      timestamp: '9/25/24 12:11 PM',
      location: 'map.google.com/56785678', // Replace with actual location URL
    },
  ];

  const [selectedReportIndex, setSelectedReportIndex] = useState(null);

  const handleReportClick = (index) => {
    setSelectedReportIndex(index);
  };

  return (
    <View className={`flex p-4`}>
      <Text className={`text-2xl font-bold mb-4`}>SOS Reports</Text>
      {reports.map((report, index) => (
        <TouchableOpacity
          key={index}
          className={`border border-gray-300 rounded-lg p-4 mb-4`}
          onPress={() => handleReportClick(index)}
        >
          <Text className={`text-sm text-gray-500 mb-2`}>{report.timestamp}</Text>
          <View className={`flex flex-row items-center`}>
            <FontAwesomeIcon icon={faMapMarker} size={16} color="blue" />
            <Text className={`ml-2`}>{report.timestamp}</Text>
          </View>
          {index === selectedReportIndex && (
            <View className={`mt-2`}>
              <Text className={`text-sm text-gray-500`}>Click to see more</Text>
              <Image source={{ uri: report.location }} style={{ width: '100%', height: 200 }} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Location;