import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Text } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AuthContext } from '../../context/AuthContext';
import { OfflineStorageService } from '../../services/OfflineStorageService';
import { NotificationService } from '../../services/NotificationService';
import { NetworkService } from '../../services/NetworkService';

const API_URL = 'http://YOUR_BACKEND_IP:5000';

export default function TournamentsScreen() {
  const [tournaments, setTournaments] = useState([]);
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
      
      // Fetch tournaments
      await fetchTournaments();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  const fetchTournaments = async () => {
    try {
      if (isOnline) {
        // Fetch from API when online
        const response = await fetch(`${API_URL}/tournaments`, {
          headers: { Authorization: `Bearer ${state.userToken}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          setTournaments(data);
          
          // Cache tournaments for offline use
          await OfflineStorageService.saveTournaments(data);
          
          // Send notification for new tournaments (if any)
          if (data.length > 0) {
            await NotificationService.sendLocalNotification(
              'Tournaments',
              `${data.length} tournament(s) available`,
              { screen: 'Tournaments' }
            );
          }
        }
      } else {
        // Load from cache when offline
        const cachedTournaments = await OfflineStorageService.getCachedTournaments();
        if (cachedTournaments.length > 0) {
          setTournaments(cachedTournaments);
        } else {
          Alert.alert('Offline', 'No cached tournaments available. Come back online to load tournaments.');
        }
      }
    } catch (error) {
      console.error('Fetch tournaments error:', error);
      
      // Fall back to cached tournaments
      try {
        const cachedTournaments = await OfflineStorageService.getCachedTournaments();
        if (cachedTournaments.length > 0) {
          setTournaments(cachedTournaments);
          Alert.alert('Info', 'Showing cached tournaments');
        } else {
          Alert.alert('Error', 'Failed to fetch tournaments');
        }
      } catch (cacheError) {
        Alert.alert('Error', 'Failed to fetch tournaments');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTournaments();
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
      
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.tournamentName}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.detail}>
              👥 Players: {item.players?.length || 0}
            </Text>
            <Text style={styles.detail}>
              📅 Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            {item.description && (
              <Text style={styles.detail} numberOfLines={2}>
                📝 {item.description}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="sports-soccer" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No tournaments found</Text>
            {!isOnline && (
              <Text style={styles.emptySubtext}>Come back online to load tournaments</Text>
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

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'ongoing':
      return '#4caf50';
    case 'completed':
      return '#2196f3';
    case 'pending':
      return '#ff9800';
    default:
      return '#9e9e9e';
  }
};

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
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
