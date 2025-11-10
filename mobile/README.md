# Salah Reminder - Mobile App (React Native)

React Native mobile application for Salah Reminder using Expo.

## 📱 Features

### User Features
- **Prayer Times Display**: View prayer times from Aladhan API
- **Mosque Selection**: Choose and favorite mosques
- **Prayer Alarms**: Toggle notifications for each prayer
- **5 Ringtone Options**: Choose from different alarm sounds
- **Light/Dark Mode**: Theme switcher
- **Tabbed Interface**: Donation QR codes and Community Feed
- **User Authentication**: Login/Register

### Admin & SuperAdmin
- Dashboard views with web app redirection for full features
- Role-based navigation

## 🚀 Tech Stack

- **React Native** with Expo
- **React Navigation** (Stack & Bottom Tabs)
- **React Native Paper** (UI Components)
- **Expo Notifications** (Prayer alarms)
- **AsyncStorage** (Local data persistence)
- **Axios** (API calls)
- **Expo AV** (Audio playback)

## 🛠️ Installation

```bash
cd /app/mobile

# Install dependencies
yarn install

# Start Expo development server
yarn start

# Run on Android
yarn android

# Run on iOS
yarn ios
```

## 📱 Running the App

### Using Expo Go

1. Install Expo Go app on your device:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. Start the development server:
   ```bash
   yarn start
   ```

3. Scan the QR code with:
   - **Android**: Expo Go app
   - **iOS**: Camera app

### Using Android Emulator

```bash
yarn android
```

### Using iOS Simulator (macOS only)

```bash
yarn ios
```

## 📝 Project Structure

```
/app/mobile/
├── App.js                      # Main app component
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── babel.config.js             # Babel configuration
└── src/
    ├── screens/                # Screen components
    │   ├── HomeScreen.js
    │   ├── LoginScreen.js
    │   ├── RegisterScreen.js
    │   ├── SettingsScreen.js
    │   ├── AdminDashboardScreen.js
    │   └── SuperAdminDashboardScreen.js
    ├── services/               # API services
    │   └── api.js
    └── utils/                  # Utility functions
        └── notifications.js
```

## 🔑 API Configuration

The app connects to the backend API at:
```
https://mosque-connect-11.preview.emergentagent.com/api
```

To change the API URL, edit `/app/mobile/src/services/api.js`:
```javascript
const API_URL = 'YOUR_API_URL_HERE';
```

## 🎬 Key Features

### 1. Home Screen
- Mosque selector with favorites
- Prayer times in grid layout
- Alarm toggles for each prayer
- Tabs for Donation and Feed
- Pull-to-refresh functionality

### 2. Settings Screen
- Dark mode toggle
- Ringtone selection with preview
- Account information
- Logout functionality

### 3. Authentication
- Login with email/password
- Register as User or Admin
- Persistent session with AsyncStorage
- Role-based navigation

### 4. Notifications
- Prayer time reminders
- Customizable ringtones
- Android notification channels
- iOS notification support

## 📦 Building for Production

### Android APK
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## 📝 Environment Variables

No environment variables needed - API URL is hardcoded in `api.js`.

## 🔔 Permissions

- **Notifications**: For prayer time alarms
- **Vibration**: For alarm alerts

## 🚀 Future Enhancements

- [ ] Full admin dashboard in mobile
- [ ] Offline mode with cached data
- [ ] Qibla direction compass
- [ ] Prayer history tracking
- [ ] Custom notification sounds
- [ ] Widget support
- [ ] Apple Watch / Wear OS support

## 🐛 Known Issues

- Theme change requires app restart
- Admin features require web app
- Sound preview uses placeholder URL

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Backend API Docs](../backend/README.md)

## 🔗 Related

- Web App: `/app/frontend/`
- Backend API: `/app/backend/`

---

**Built with ❤️ using React Native & Expo**