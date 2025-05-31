import React, { useRef } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from "expo-notifications";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export default function LandingPage() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start(() => {
      router.replace('/authScreen');
    });
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      {/* Outer Gray Circle */}
      <View className="w-64 h-64 rounded-full bg-gray-400 flex justify-center items-center shadow-lg">
        {/* Middle White Circle */}
        <View className="relative w-56 h-56 rounded-full bg-gray-200 shadow-xl justify-center items-center flex">
          {/* Fake inner shadow */}
          <View className="absolute w-56 h-56 rounded-full border-[6px] border-black/10 opacity-40" style={{ zIndex: 1 }} />
          {/* Animated Red Button */}
          <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
                zIndex: 2,
              }}
              className="relative w-48 h-48 rounded-full bg-[#C40000] border-[3px] border-black flex justify-center items-center shadow-2xl"
            >
              {/* Inset Circle */}
              <View className="w-44 h-44 rounded-full bg-[#FF0000] shadow-inner justify-center items-center flex">
                {/* Ellipse with stroke + shadows */}
                <View className="absolute w-40 h-40 rounded-full border border-black shadow-lg justify-center items-center">
                  {/* Fake inner shadow for ellipse */}
                  <View className="absolute w-40 h-40 rounded-full border-[7px] border-black/30 opacity-30" style={{ zIndex: 1 }} />
                </View>
                {/* Text */}
                <Text className="text-white text-4xl italic font-bold z-10" style={{ textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 6 }}>
                  KLIQ
                </Text>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </View>
  );
}