import { createContext } from 'react';

export const AuthContext = createContext({
  state: {
    isLoading: true,
    isSignout: false,
    userToken: null,
    userEmail: null,
    userId: null,
  },
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});
