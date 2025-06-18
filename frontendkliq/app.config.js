export default {
  "expo": {
    "name": "KLIQ",
    "scheme": "KliqThesis",
    "slug": "frontendkliq",
    "version": "2.0.0",
    "devClient": true,
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSBluetoothAlwaysUsageDescription": "We need Bluetooth access to connect to BLE devices.",
        "NSLocationWhenInUseUsageDescription": "We need location access to scan for BLE devices."
      }
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      "useNextNotificationsApi": true,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.kliqApp",
      "googleServicesFiles": "./google-services.json",
      "permissions": [
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "INTERNET",
        "ACCESS_NOTIFICATION_POLICY",
        "VIBRATE",
        "MODIFY_AUDIO_SETTINGS",
        "RECEIVE_BOOT_COMPLETED"
      ]
    },
    "web": {
      "favicon": "./assets/images/splash.png"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/splash.png",
          "color": "#ffffff",
          "sounds": ["./assets/alert.mp3"],
          "mode": "production"
        }
      ],
      "expo-router",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#232323",
          "image": "./assets/images/splash.png",
          "dark": {
            "image": "./assets/images/splash.png",
            "backgroundColor": "#000000"
          },
          "imageWidth": 200
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "Allow voice recording",
          "cameraPermission": "Allow camera access"
        }
      ]
    ],
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "f096e32f-ba16-4255-a1cb-0483b11baf51"
      }
    }
  }
};