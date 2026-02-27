import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

let db = null;

// Initialize database
const initializeDatabase = async () => {
  if (db) return db;

  try {
    db = await SQLite.openDatabaseAsync('fifarournamentcache.db');
    
    // Create tables
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cache_metadata (
        key TEXT PRIMARY KEY,
        lastUpdated INTEGER NOT NULL,
        expiresAt INTEGER NOT NULL
      );
    `);

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const OfflineStorageService = {
  // Initialize storage
  init: async () => {
    try {
      await initializeDatabase();
      console.log('Offline storage initialized');
    } catch (error) {
      console.error('Storage initialization failed:', error);
      throw error;
    }
  },

  // Save tournaments for offline use
  saveTournaments: async (tournaments) => {
    try {
      const database = await initializeDatabase();
      
      for (const tournament of tournaments) {
        await database.runAsync(
          `INSERT OR REPLACE INTO tournaments (id, name, data, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?)`,
          [
            tournament._id,
            tournament.name,
            JSON.stringify(tournament),
            Date.now(),
            Date.now(),
          ]
        );
      }

      // Update metadata
      await database.runAsync(
        `INSERT OR REPLACE INTO cache_metadata (key, lastUpdated, expiresAt)
         VALUES (?, ?, ?)`,
        ['tournaments', Date.now(), Date.now() + 24 * 60 * 60 * 1000] // 24 hour cache
      );
    } catch (error) {
      console.error('Save tournaments error:', error);
    }
  },

  // Get cached tournaments
  getCachedTournaments: async () => {
    try {
      const database = await initializeDatabase();
      const result = await database.getAllAsync(
        'SELECT data FROM tournaments ORDER BY updatedAt DESC'
      );

      return result.map((row) => JSON.parse(row.data));
    } catch (error) {
      console.error('Get tournaments error:', error);
      return [];
    }
  },

  // Save team members for offline use
  saveTeamMembers: async (members) => {
    try {
      const database = await initializeDatabase();

      for (const member of members) {
        await database.runAsync(
          `INSERT OR REPLACE INTO players (id, name, data, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?)`,
          [
            member._id,
            member.name,
            JSON.stringify(member),
            Date.now(),
            Date.now(),
          ]
        );
      }

      // Update metadata
      await database.runAsync(
        `INSERT OR REPLACE INTO cache_metadata (key, lastUpdated, expiresAt)
         VALUES (?, ?, ?)`,
        ['teamMembers', Date.now(), Date.now() + 6 * 60 * 60 * 1000] // 6 hour cache
      );
    } catch (error) {
      console.error('Save team members error:', error);
    }
  },

  // Get cached team members
  getCachedTeamMembers: async () => {
    try {
      const database = await initializeDatabase();
      const result = await database.getAllAsync(
        'SELECT data FROM players ORDER BY updatedAt DESC'
      );

      return result.map((row) => JSON.parse(row.data));
    } catch (error) {
      console.error('Get team members error:', error);
      return [];
    }
  },

  // Check if cache is expired
  isCacheExpired: async (key) => {
    try {
      const database = await initializeDatabase();
      const result = await database.getFirstAsync(
        'SELECT expiresAt FROM cache_metadata WHERE key = ?',
        [key]
      );

      if (!result) return true;
      return result.expiresAt < Date.now();
    } catch (error) {
      console.error('Check cache error:', error);
      return true;
    }
  },

  // Clear all cache
  clearAllCache: async () => {
    try {
      const database = await initializeDatabase();
      await database.execAsync(`
        DELETE FROM tournaments;
        DELETE FROM teams;
        DELETE FROM players;
        DELETE FROM cache_metadata;
      `);
      console.log('Cache cleared');
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  },

  // Save key-value pair to AsyncStorage
  setItem: async (key, value) => {
    try {
      const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonString);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
    }
  },

  // Get key-value pair from AsyncStorage
  getItem: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  },

  // Remove key from AsyncStorage
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
    }
  },

  // Get cache stats
  getCacheStats: async () => {
    try {
      const database = await initializeDatabase();
      const stats = await database.getAllAsync(`
        SELECT key, lastUpdated, expiresAt FROM cache_metadata
      `);
      return stats;
    } catch (error) {
      console.error('Get cache stats error:', error);
      return [];
    }
  },
};
