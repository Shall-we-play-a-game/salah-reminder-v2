# Salah Reminder - Mobile Application Guide

## 📱 Overview

A complete React Native mobile application built with Expo that connects to the same backend API as the web application.

## 🏗️ Architecture

```
┌─────────────────┐
│  React Native   │
│   Mobile App    │
│   (Expo)        │
└────────┬────────┘
         │
         │ HTTPS/REST API
         │
         ▼
┌─────────────────┐
│   Node.js       │
│   Express       │
│   Backend       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    MongoDB      │
└─────────────────┘
```

## 📂 Project Structure

```
/app/
├── mobile/                    # React Native mobile app (NEW)
│   ├── App.js                # Main app entry
│   ├── src/
│   │   ├── screens/          # Screen components
│   │   ├── services/         # API services
│   │   └── utils/            # Utilities
│   ├── package.json
│   └── README.md
│
├── frontend/                  # React web app (UNCHANGED)
├── backend/                   # Node.js API (SHARED)
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone

### Installation

```bash
# Navigate to mobile directory
cd /app/mobile

# Install dependencies (already done)
yarn install

# Start development server
yarn start
```

### Running on Device

1. **Install Expo Go** on your phone
2. **Scan QR code** shown in terminal
3. App will load on your device

### Running on Emulator

```bash
# Android
yarn android

# iOS (macOS only)
yarn ios
```

## 🎯 Features Implemented

### ✅ User Features
- **Authentication**: Login & Register
- **Prayer Times**: Real-time from Aladhan API
- **Alarms**: Toggle notifications for each prayer
- **Mosques**: Browse and favorite mosques
- **Ringtones**: 5 options (Adhan, Bell, Chime, Gong, Soft)
- **Themes**: Light/Dark mode
- **Tabs**: Donation QR & Community Feed
- **Posts**: View posts with images

### ✅ Technical Features
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **UI**: React Native Paper (Material Design)
- **Storage**: AsyncStorage for persistence
- **Notifications**: Expo Notifications
- **API**: Axios with shared backend
- **Audio**: Expo AV for ringtones

## 📱 Screen Breakdown

### 1. Login Screen
- Email/password authentication
- Show/hide password toggle
- Navigate to register
- Islamic-themed design with moon icon

### 2. Register Screen
- User or Admin registration
- Role selection with segmented buttons
- Note for admin about web app requirements

### 3. Home Screen (Main)
**Header:**
- App logo and title
- Mosque selector with Picker
- Favorite star button

**Prayer Times Grid:**
- 5 prayer cards (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Prayer name and time
- Alarm toggle switch

**Tabbed Content:**
- **Donation Tab**: QR code display
- **Feed Tab**: Community posts with images

**Features:**
- Pull-to-refresh
- Auto-refresh prayer times
- Persistent alarm settings

### 4. Settings Screen
**Appearance:**
- Dark mode toggle (requires restart)

**Ringtone Selection:**
- 5 ringtone options with radio buttons
- Preview sound on selection
- Persistent choice

**Account:**
- Display email and role
- Logout button

### 5. Admin Dashboard
- Information card
- Redirect message to web app
- Quick status display

### 6. SuperAdmin Dashboard
- Information card
- Redirect message to web app
- Features list

## 🔧 Configuration

### API URL
Located in `/app/mobile/src/services/api.js`:
```javascript
const API_URL = 'https://prayerpal-14.preview.emergentagent.com/api';
```

### Theme Colors
Located in `App.js`:
```javascript
customLightTheme: {
  primary: '#10b981',  // Emerald
  accent: '#34d399',
  background: '#f5f7fa',
}

customDarkTheme: {
  primary: '#34d399',
  accent: '#6ee7b7',
  background: '#1a1a1a',
}
```

## 🔔 Notifications System

### Setup
```javascript
// Request permissions
await requestNotificationPermissions();

// Schedule prayer notification
await schedulePrayerNotification('Fajr', '05:30');
```

### Features
- Daily recurring notifications
- Custom notification channel (Android)
- High priority alerts
- Vibration pattern
- Sound enabled

## 💾 Data Persistence

### AsyncStorage Keys
- `user` - User session data
- `darkMode` - Theme preference
- `ringtone` - Selected ringtone
- `alarms_{mosqueId}` - Alarm settings per mosque

## 🎨 Styling Approach

### Design System
- **Colors**: Emerald green theme (#10b981)
- **Typography**: System fonts with React Native Paper
- **Spacing**: Consistent 8px grid
- **Elevation**: Material Design shadows

### Components
- **Cards**: Elevated with rounded corners
- **Buttons**: Contained (filled) for primary actions
- **Inputs**: Outlined mode with icons
- **Switches**: Themed to match app colors

## 🔄 State Management

Using React Hooks (useState, useEffect):
- Local component state
- AsyncStorage for persistence
- No Redux (keeping it simple)

## 📡 API Integration

### Service Layer Pattern
```javascript
// Example: Fetch mosques
import { mosqueAPI } from '../services/api';

const mosques = await mosqueAPI.getAll();
```

### Available Services
- `authAPI` - Login, Register
- `mosqueAPI` - Get mosques, Upload QR
- `prayerTimesAPI` - Get times, Set manual
- `postsAPI` - Get posts, Create, Update
- `userAPI` - Favorites, Pending admins, Status updates

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with test credentials
- [ ] View prayer times
- [ ] Toggle alarms
- [ ] Switch between tabs
- [ ] View QR code
- [ ] Read community posts
- [ ] Change ringtone
- [ ] Toggle dark mode
- [ ] Favorite a mosque
- [ ] Logout

### Test Credentials
```
User: user@test.com / user123
Admin: admin@test.com / admin123
SuperAdmin: superadmin@salah.com / superadmin123
```

## 📦 Building for Production

### Android APK
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build APK
eas build --platform android --profile preview
```

### iOS (Requires Apple Developer Account)
```bash
eas build --platform ios
```

## 🐛 Troubleshooting

### App won't load
- Check if backend is running
- Verify API_URL in api.js
- Check Expo Go version compatibility

### Notifications not working
- Check device notification permissions
- Verify notification channel (Android)
- Test with simple notification first

### Theme not changing
- Dark mode requires app restart
- Clear AsyncStorage if stuck

## 🔮 Future Enhancements

### Phase 1 (Immediate)
- [ ] Add loading skeletons
- [ ] Improve error handling
- [ ] Add offline mode
- [ ] Cache prayer times

### Phase 2 (Short-term)
- [ ] Full admin features in mobile
- [ ] Image upload for posts
- [ ] Push notifications for new posts
- [ ] Prayer time history

### Phase 3 (Long-term)
- [ ] Qibla compass
- [ ] Prayer tracker/statistics
- [ ] Multiple mosque subscriptions
- [ ] Community chat
- [ ] Widget support

## 📚 Dependencies

### Core
- `expo` - Expo SDK
- `react-native` - React Native framework
- `react-navigation` - Navigation
- `react-native-paper` - UI components

### Features
- `axios` - HTTP client
- `@react-native-async-storage/async-storage` - Storage
- `expo-notifications` - Push notifications
- `expo-av` - Audio playback
- `@react-native-picker/picker` - Picker component

## 🔐 Security Considerations

### Current Implementation
- AsyncStorage for session (not encrypted)
- HTTPS for API calls
- No sensitive data stored locally

### Recommended Improvements
- Use SecureStore for sensitive data
- Implement token refresh
- Add biometric authentication
- Certificate pinning for API

## 🌐 Web vs Mobile

### Feature Parity
| Feature | Web | Mobile |
|---------|-----|--------|
| Prayer Times | ✅ | ✅ |
| Alarms | ✅ | ✅ |
| Donations | ✅ | ✅ |
| Feed | ✅ | ✅ |
| Dark Mode | ✅ | ✅ |
| Ringtones | ✅ | ✅ |
| Admin Dashboard | ✅ | 🔄 (Basic) |
| SuperAdmin | ✅ | 🔄 (Basic) |
| File Upload | ✅ | ❌ |

### Mobile Advantages
- Native notifications
- Always accessible
- Better performance
- Offline capable (future)

### Web Advantages
- Full admin features
- File uploads
- Larger screen
- No installation

## 📞 Support

For issues:
1. Check logs in Expo console
2. Verify backend is running
3. Test API endpoints with Postman
4. Check device permissions

---

**Mobile App Complete! ✅**
**Built with React Native & Expo for cross-platform excellence**
