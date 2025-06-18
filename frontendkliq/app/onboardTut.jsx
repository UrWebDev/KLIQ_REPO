import React, { useEffect } from 'react';
import { Dimensions, Image } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const imageStyle = {
  width: width * 0.75,
  height: width * 0.75,
  resizeMode: 'contain',
};

export default function OnboardingScreen() {
  const router = useRouter();

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/');
  };

  return (
    <Onboarding
      onDone={finishOnboarding}
      onSkip={finishOnboarding}
      pages={[
        {
          backgroundColor: '#fff',
          image: <Image source={require('./images/one.jpg')} style={imageStyle} />,
          title: 'Welcome to KLIQ',
          subtitle: 'Your emergency alert assistant.',
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('./images/two.jpg')} style={imageStyle} />,
          title: 'Create Your Account',
          subtitle: 'Create a KLIQ account (user or recipient).',
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('./images/three.jpg')} style={imageStyle} />,
          title: 'Log In Your Account',
          subtitle: 'Log in your newly created account.',
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('./images/four.jpg')} style={imageStyle} />,
          title: 'KLIQ User Account',
          subtitle: `The summary and reports of the KLIQ User's SOS Alerts`,
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('./images/five.jpg')} style={imageStyle} />,
          title: 'Stay Connected',
          subtitle: 'Add a trusted contact (bluetooth) to send SOS Messages.',
        },
        // {
        //   backgroundColor: '#e9bcbe',
        //   image: <Image source={require('./images/six.jpg')} style={imageStyle} />,
        //   title: 'Stay Connected',
        //   subtitle: 'Keep your trusted contacts informed.',
        // },
        {
          backgroundColor: '#fff',
          image: <Image source={require('./images/seven.jpg')} style={imageStyle} />,
          title: 'Send Alerts',
          subtitle: 'Keep your trusted contacts informed.',
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('./images/eight.jpg')} style={imageStyle} />,
          title: 'Recipient Account',
          subtitle: `Quickly receives SOS messages with user's location.`,
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('./images/nine.jpg')} style={imageStyle} />,
          title: 'Summary of SOS Messages',
          subtitle: `View and track the user's monthly sos alerts.`,
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('./images/ten.jpg')} style={imageStyle} />,
          title: 'Emergency Hotlines',
          subtitle: 'Add your trusted emergency hotlines.',
        },
        {
          backgroundColor: '#fff',
          image: <Image source={require('./images/eleven.jpg')} style={imageStyle} />,
         title: `Let's Get Started`,
          subtitle: 'You may now proceed to the app.',
        },
      ]}
    />
  );
}
