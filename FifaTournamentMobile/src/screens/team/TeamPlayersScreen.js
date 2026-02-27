import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AuthContext } from '../../context/AuthContext';
import { OfflineStorageService } from '../../services/OfflineStorageService';
import { NetworkService } from '../../services/NetworkService';
import { NotificationService } from '../../services/NotificationService';

const API_URL = 'http://YOUR_BACKEND_IP:5000';

export default function TeamPlayersScreen() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { state } = useContext(AuthContext);
  const [networkSubscription, setNetworkSubscription] = useState(null);

  useEffect(() => {
    initializeScreen();
    
    return () => {
      if (networkSubscription) {
        networkSubscription();
      }
    };
  }, []);

  const initializeScreen = async () => {
    try {
      await OfflineStorageService.init();
      
      // Subscribe to network changes
      const unsubscribe = NetworkService.subscribeToNetworkStatus((status) => {
        setIsOnline(status.isConnected);
      });
      setNetworkSubscription(() => unsubscribe);
      
      // Check initial network state
      const networkState = await NetworkService.checkNetworkState();
      setIsOnline(networkState.isConnected);
      
      // Fetch team members
      await fetchTeamPlayers();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  const fetchTeamPlayers = async () => {
    try {
      if (isOnline) {
        // Fetch from API when online
        const response = await fetch(`${API_URL}/teams/team-members`, {
          headers: { Authorization: `Bearer ${state.userToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setPlayers(data);
          
          // Cache team members for offline use
          await OfflineStorageService.saveTeamMembers(data);
          
          // Send notification
          if (data.length > 0) {
            await NotificationService.sendLocalNotification(
              'Team Members',
              `${data.length} member(s) in your team`,
              { screen: 'TeamPlayers' }
            );
          }
        }
      } else {
        // Load from cache when offline
        const cachedPlayers = await OfflineStorageService.getCachedTeamMembers();
        if (cachedPlayers.length > 0) {
          setPlayers(cachedPlayers);
        } else {
          Alert.alert('Offline', 'No cached team members available. Come back online to load team.');
        }
      }
    } catch (error) {
      console.error('Fetch team error:', error);
      
      // Fall back to cached data
      try {
        const cachedPlayers = await OfflineStorageService.getCachedTeamMembers();
        if (cachedPlayers.length > 0) {
          setPlayers(cachedPlayers);
          Alert.alert('Info', 'Showing cached team members');
        } else {
          Alert.alert('Error', 'Failed to fetch team members');
        }
      } catch (cacheError) {
        Alert.alert('Error', 'Failed to fetch team members');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeamPlayers();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <MaterialIcons name="cloud-off" size={16} color="#ff9800" />
          <Text style={styles.offlineText}>Offline - Cached Data</Text>
        </View>
      )}
      
      <Text style={styles.header}>Team Members ({players.length})</Text>
      
      <FlatList
        data={players}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.playerCard}>
            <View style={styles.playerAvatar}>
              {item.profilePicture ? (
                <Image
                  source={{ uri: item.profilePicture }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{item.name}</Text>
              {item.email && (
                <Text style={styles.playerEmail}>{item.email}</Text>
              )}
              {item.createdAt && (
                <Text style={styles.joinDate}>
                  📅 {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No team members</Text>
            {!isOnline && (
              <Text style={styles.emptySubtext}>Come back online to load team</Text>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  offlineIndicator: {
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
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  playerEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 16,
    fontSize: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#ccc',
    marginTop: 8,
    fontSize: 14,
  },
});
