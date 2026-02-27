# FIFA Tournament Mobile App

React Native mobile application for FIFA Tournament management built with Expo.

## Project Structure

```
FifaTournamentMobile/
├── src/
│   ├── screens/              # Screen components
│   │   ├── auth/             # Login & Register screens
│   │   ├── tournaments/       # Tournament screens
│   │   ├── team/             # Team management screens
│   │   └── profile/          # User profile screen
│   ├── navigation/           # Navigation configuration
│   ├── context/              # Auth context
│   ├── components/           # Reusable components
│   ├── services/             # API services
│   └── utils/                # Utility functions
├── assets/                   # Icons and fonts
├── App.js                    # Main app component
├── package.json              # Dependencies
├── app.json                  # Expo configuration
└── metro.config.js           # Metro bundler config
```

## Features

- ✅ User authentication (Login/Register)
- ✅ Team management (Join teams, view members)
- ✅ Tournament browsing
- ✅ User profile management
- ✅ Team player listing
- ✅ Bottom tab navigation
- ✅ Responsive design for all screen sizes

### Advanced Features
- **📸 Image Upload** - Upload profile pictures from camera or photo library (base64 encoded)
- **📴 Offline Support** - Automatic caching with SQLite, works without internet
- **🔔 Push Notifications** - Local notifications for updates and events

See [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md) for detailed documentation.

## Installation

### Prerequisites
- Node.js >= 18.0.0
- Expo CLI: `npm install -g expo-cli`

### Setup

1. Navigate to the project directory:
```bash
cd FifaTournamentMobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API endpoints in files:
   - `App.js` - Replace `YOUR_BACKEND_IP` with your backend server IP
   - All screen files - Replace `YOUR_BACKEND_IP` with your backend server IP

Example:
```javascript
const API_URL = 'http://192.168.1.100:5000';  // Your backend IP:port
```

## Development

### Start the development server:

```bash
npm start
```

This will open the Expo developer menu where you can:

- **Press `i`** - Open iOS simulator
- **Press `a`** - Open Android emulator
- **Press `w`** - Open web version
- **Press `j`** - Open debugger
- **Press `r`** - Reload the app

### Using Android Studio (Android Emulator)

1. Install Android Studio
2. Create/Start an emulator from AVD Manager
3. Run `npm start`
4. Press `a` in the terminal

### Using Xcode (iOS Simulator)

1. Install Xcode from App Store
2. Run `npm start`
3. Press `i` in the terminal

## Building for Production

### Create EAS account (if not already):
```bash
eas login
```

### Build for Android:
```bash
eas build --platform android
```

### Build for iOS:
```bash
eas build --platform ios
```

### Submit to App Stores:
```bash
eas submit --platform android
eas submit --platform ios
```

## API Integration

The app connects to the FIFA Tournament backend API. Ensure your backend is running on the configured port (default: 5000).

**Backend endpoints used:**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /teams/my-team` - Get user's team
- `GET /teams/team-members` - Get team members
- `POST /teams/join-by-code` - Join team by code
- `GET /tournaments` - Get tournaments list
- `PUT /users/me` - Update user profile

## Key Technologies

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation management
- **Axios** - HTTP client
- **JWT Decode** - Token management
- **React Native Paper** - UI components

## Configuration

### Update Backend URL

Before running the app, update the API URL in these files:

1. **App.js** - Changes the auth context API calls
2. **src/screens/auth/LoginScreen.js**
3. **src/screens/auth/RegisterScreen.js**
4. **src/screens/team/TeamJoinScreen.js**
5. **src/screens/tournaments/TournamentsScreen.js**
6. **src/screens/team/TeamPlayersScreen.js**
7. **src/screens/profile/ProfileScreen.js**

Replace:
```javascript
const API_URL = 'http://YOUR_BACKEND_IP:5000';
```

With your actual backend IP:
```javascript
const API_URL = 'http://192.168.1.100:5000';  // Example
```

## Notes

- The app uses AsyncStorage for token persistence
- JWT tokens are automatically validated on app startup
- The app supports both iOS and Android
- All screens are responsive to different screen sizes
- Bottom tab navigation provides easy access to main features

## Troubleshooting

### Build Issues
If you encounter build issues, try:
```bash
npm install
npx expo prebuild --clean
npm start
```

### Port Already in Use
If port 19000 is already in use, Expo will use the next available port.

### Backend Connection Issues
- Ensure backend is running on the configured port
- Check that your device/emulator can reach the backend IP
- On Android emulator, use `10.0.2.2` instead of `localhost`

## Next Steps

1. Test the app on Android emulator/device
2. Test on iOS simulator/device
3. Configure proper API URLs for your backend
4. Add app icons and splash screens
5. Build and deploy to app stores

## License

Game Score Card Management System
