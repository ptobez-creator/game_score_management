import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Text } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'http://YOUR_BACKEND_IP:5000';

export default function TeamJoinScreen({ navigation }) {
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const { state } = useContext(AuthContext);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_URL}/teams/search-available`, {
        headers: { Authorization: `Bearer ${state.userToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByName = async (teamId) => {
    try {
      const response = await fetch(`${API_URL}/teams/add-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.userToken}`,
        },
        body: JSON.stringify({ userId: state.userId }),
      });
      if (response.ok) {
        Alert.alert('Success', 'Joined team successfully');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to join team');
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode) {
      Alert.alert('Error', 'Please enter a team code');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/teams/join-by-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.userToken}`,
        },
        body: JSON.stringify({ inviteCode: joinCode }),
      });
      if (response.ok) {
        Alert.alert('Success', 'Joined team successfully');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid team code');
    }
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Join with Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter team code"
          placeholderTextColor="#999"
          value={joinCode}
          onChangeText={setJoinCode}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleJoinByCode}
        >
          <Text style={styles.buttonText}>Join Team</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Teams</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search teams..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FlatList
          data={teams.filter((team) =>
            team.name.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.teamCard}>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{item.name}</Text>
                <Text style={styles.teamDescription}>{item.description}</Text>
                <Text style={styles.teamMembers}>
                  Members: {item.members?.length || 0}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => handleJoinByName(item._id)}
              >
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No teams available</Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  searchInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
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
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  teamMembers: {
    fontSize: 12,
    color: '#999',
  },
  joinButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});
