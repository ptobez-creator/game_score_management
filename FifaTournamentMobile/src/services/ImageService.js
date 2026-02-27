import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export const ImageService = {
  // Request camera and photo library permissions
  requestPermissions: async () => {
    try {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return (
        cameraStatus.granted &&
        mediaLibraryStatus.granted
      );
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  },

  // Pick image from camera
  takePhoto: async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        return await ImageService.convertToBase64(result.assets[0].uri);
      }
      return null;
    } catch (error) {
      console.error('Camera error:', error);
      throw error;
    }
  },

  // Pick image from photo library
  pickFromLibrary: async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        return await ImageService.convertToBase64(result.assets[0].uri);
      }
      return null;
    } catch (error) {
      console.error('Library error:', error);
      throw error;
    }
  },

  // Convert image URI to base64
  convertToBase64: async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Create data URL
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Conversion error:', error);
      throw error;
    }
  },

  // Validate image size (max 2MB)
  validateImageSize: async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const maxSize = 2 * 1024 * 1024; // 2MB
      return fileInfo.size <= maxSize;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  },
};
