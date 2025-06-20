import React from 'react';
import { Dimensions, Image, ScrollView, View } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const ZoomableImage = ({ source }) => (
  <View style={{ height: height * 0.65, justifyContent: 'center', alignItems: 'center' }}>
    <ScrollView
      maximumZoomScale={3}
      minimumZoomScale={1}
      contentContainerStyle={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      bouncesZoom
      pinchGestureEnabled
      horizontal={true}
    >
      <Image
        source={source}
        style={{
          width: width * 0.9,
          height: height * 0.6,
          resizeMode: 'contain',
          borderRadius: 20,
        }}
      />
    </ScrollView>
  </View>
);

export default function OnboardingScreen() {
  const router = useRouter();

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/');
  };

  const imagePaths = [
    require('./images/one.jpg'),
    require('./images/two.jpg'),
    require('./images/three.jpg'),
    require('./images/four.jpg'),
    require('./images/five.jpg'),
    require('./images/seven.jpg'),
    require('./images/eight.jpg'),
    require('./images/eleven.jpg'),
  ];

  const pages = imagePaths.map((img) => ({
    backgroundColor: '#fff',
    image: <ZoomableImage source={img} />,
  }));

  return (
    <Onboarding
      onDone={finishOnboarding}
      onSkip={finishOnboarding}
      pages={pages}
    />
  );
}
