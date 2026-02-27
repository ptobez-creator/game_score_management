import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AuthContext } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import * as AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export default function App() {
  const [state, dispatch] = useState({
    isLoading: true,
    isSignout: false,
    userToken: null,
    userEmail: null,
    userId: null,
  });

  const authContext = {
    signIn: async (credentials) => {
      try {
        const response = await fetch('http://YOUR_BACKEND_IP:5000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        
        if (!response.ok) throw new Error('Login failed');
        
        const data = await response.json();
        const decoded = jwtDecode(data.token);
        
        await AsyncStorage.setItem('token', data.token);
        dispatch({
          ...state,
          isSignout: false,
          userToken: data.token,
          userEmail: decoded.user.email,
          userId: decoded.user.id,
        });
      } catch (error) {
        throw error;
      }
    },

    signUp: async (credentials) => {
      try {
        const response = await fetch('http://YOUR_BACKEND_IP:5000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        
        if (!response.ok) throw new Error('Registration failed');
        
        const data = await response.json();
        const decoded = jwtDecode(data.token);
        
        await AsyncStorage.setItem('token', data.token);
        dispatch({
          ...state,
          isSignout: false,
          userToken: data.token,
          userEmail: decoded.user.email,
          userId: decoded.user.id,
        });
      } catch (error) {
        throw error;
      }
    },

    signOut: async () => {
      await AsyncStorage.removeItem('token');
      dispatch({
        ...state,
        isSignout: true,
        userToken: null,
      });
    },

    signUp: async (credentials) => {
      // Sign up is same as register
      try {
        const response = await fetch('http://YOUR_BACKEND_IP:5000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        
        if (!response.ok) throw new Error('Registration failed');
        
        const data = await response.json();
        const decoded = jwtDecode(data.token);
        
        await AsyncStorage.setItem('token', data.token);
        dispatch({
          ...state,
          isSignout: false,
          userToken: data.token,
          userEmail: decoded.user.email,
          userId: decoded.user.id,
        });
      } catch (error) {
        throw error;
      }
    },
  };

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          try {
            const decoded = jwtDecode(token);
            if (decoded.exp * 1000 > Date.now()) {
              dispatch({
                ...state,
                isLoading: false,
                userToken: token,
                userEmail: decoded.user.email,
                userId: decoded.user.id,
              });
            } else {
              await AsyncStorage.removeItem('token');
              dispatch({
                ...state,
                isLoading: false,
              });
            }
          } catch {
            await AsyncStorage.removeItem('token');
            dispatch({
              ...state,
              isLoading: false,
            });
          }
        } else {
          dispatch({
            ...state,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error(error);
        dispatch({
          ...state,
          isLoading: false,
        });
      }
    };

    bootstrapAsync();
  }, []);

  return (
    <AuthContext.Provider value={{ ...authContext, state }}>
      <RootNavigator />
      <StatusBar barStyle="light-content" />
    </AuthContext.Provider>
  );
}
