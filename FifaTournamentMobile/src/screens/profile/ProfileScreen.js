import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AuthContext } from '../../context/AuthContext';
import { ImageService } from '../../services/ImageService';
import { OfflineStorageService } from '../../services/OfflineStorageService';
import { NotificationService } from '../../services/NotificationService';

const API_URL = 'http://YOUR_BACKEND_IP:5000';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { state, signOut } = useContext(AuthContext);

  useEffect(() => {
    // Initialize offline storage
    OfflineStorageService.init();
    NotificationService.initialize();
  }, []);

  const handleCameraPhoto = async () => {
    try {
      const hasPermission = await ImageService.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required');
        return;
      }

      setLoading(true);
      const base64Image = await ImageService.takePhoto();
      if (base64Image) {
        setProfilePicture(base64Image);
        Alert.alert('Success', 'Photo captured');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to take photo');
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryPhoto = async () => {
    try {
      const hasPermission = await ImageService.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Photo library permission is required');
        return;
      }

      setLoading(true);
      const base64Image = await ImageService.pickFromLibrary();
      if (base64Image) {
        setProfilePicture(base64Image);
        Alert.alert('Success', 'Photo selected');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to pick photo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!isOnline && profilePicture.length > 100000) {
      Alert.alert('Warning', 'Large images may not sync when offline');
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.userToken}`,
        },
        body: JSON.stringify({
          name,
          profilePicture,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Save to offline storage
        await OfflineStorageService.setItem('currentUser', {
          ...updatedUser,
          email: state.userEmail,
        });

        // Send notification
        await NotificationService.sendLocalNotification(
          'Profile Updated',
          'Your profile has been successfully updated!',
          { screen: 'Profile' }
        );

        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      // Save for later sync when online
      if (!isOnline) {
        await OfflineStorageService.setItem('pendingProfileUpdate', {
          name,
          profilePicture,
          timestamp: Date.now(),
        });
        Alert.alert('Offline', 'Changes saved locally. Will sync when online.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            // Clear offline cache on logout
            await OfflineStorageService.clearAllCache();
            await signOut();
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineWarning}>
          <MaterialIcons name="cloud-off" size={20} color="#ff9800" />
          <Text style={styles.offlineText}>You are offline - using cached data</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Image</Text>
        
        {profilePicture ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: profilePicture }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setProfilePicture('')}
            >
              <MaterialIcons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="camera-alt" size={40} color="#667eea" />
          </View>
        )}

        <View style={styles.imageButtonGroup}>
          <TouchableOpacity
            style={[styles.imageButton, loading && styles.buttonDisabled]}
            onPress={handleCameraPhoto}
            disabled={loading}
          >
            <MaterialIcons name="camera-alt" size={20} color="white" />
            <Text style={styles.imageButtonText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.imageButton, loading && styles.buttonDisabled]}
            onPress={handleGalleryPhoto}
            disabled={loading}
          >
            <MaterialIcons name="image" size={20} color="white" />
            <Text style={styles.imageButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <Text style={styles.label}>Email</Text>
        <View style={styles.readOnlyInput}>
          <Text style={styles.readOnlyText}>{state.userEmail}</Text>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>Update Profile</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  offlineWarning: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  offlineText: {
    color: '#ff9800',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#667eea',
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ddd',
  },
  imageButtonGroup: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  imageButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  imageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  readOnlyInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  readOnlyText: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
