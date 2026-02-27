import NetInfo from '@react-native-community/netinfo';

export const NetworkService = {
  // Check current network state
  checkNetworkState: async () => {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      };
    } catch (error) {
      console.error('Network check error:', error);
      return {
        isConnected: false,
        isInternetReachable: false,
        type: 'unknown',
      };
    }
  },

  // Listen to network changes (returns unsubscribe function)
  subscribeToNetworkStatus: (callback) => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      callback({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      });
    });

    return unsubscribe;
  },
};
