import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { Text, Card, Switch, useTheme, Chip, Divider, SegmentedButtons } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { mosqueAPI, prayerTimesAPI, postsAPI, userAPI } from '../services/api';
import { requestNotificationPermissions, schedulePrayerNotification, cancelAllNotifications } from '../utils/notifications';

export default function HomeScreen() {
  const theme = useTheme();
  const [mosques, setMosques] = useState([]);
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [posts, setPosts] = useState([]);
  const [alarms, setAlarms] = useState({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [favoriteMosques, setFavoriteMosques] = useState([]);
  const [activeTab, setActiveTab] = useState('donation');

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (selectedMosque) {
      fetchPrayerTimes();
      fetchPosts();
      loadAlarms();
    }
  }, [selectedMosque]);

  const initializeApp = async () => {
    await requestNotificationPermissions();
    await loadUserData();
    await fetchMosques();
  };

  const loadUserData = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.role === 'user') {
        loadFavorites(parsedUser.id);
      }
    }
  };

  const fetchMosques = async () => {
    try {
      const data = await mosqueAPI.getAll();
      setMosques(data);
      if (data.length > 0 && !selectedMosque) {
        setSelectedMosque(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching mosques:', error);
    }
  };

  const fetchPrayerTimes = async () => {
    if (!selectedMosque) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await prayerTimesAPI.get(selectedMosque, today);
      setPrayerTimes(data);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    }
  };

  const fetchPosts = async () => {
    if (!selectedMosque) return;
    try {
      const data = await postsAPI.getAll(selectedMosque, 'approved');
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const loadAlarms = async () => {
    const saved = await AsyncStorage.getItem(`alarms_${selectedMosque}`);
    if (saved) {
      setAlarms(JSON.parse(saved));
    }
  };

  const loadFavorites = async (userId) => {
    try {
      const data = await userAPI.getFavorites(userId);
      setFavoriteMosques(data.map(m => m.id));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleAlarm = async (prayer) => {
    const newAlarms = { ...alarms, [prayer]: !alarms[prayer] };
    setAlarms(newAlarms);
    await AsyncStorage.setItem(`alarms_${selectedMosque}`, JSON.stringify(newAlarms));

    if (newAlarms[prayer] && prayerTimes) {
      const time = prayerTimes[prayer].split(' ')[0];
      await schedulePrayerNotification(prayer, time);
    } else {
      await cancelAllNotifications();
    }
  };

  const toggleFavorite = async () => {
    if (!user || !selectedMosque) return;
    try {
      if (favoriteMosques.includes(selectedMosque)) {
        await userAPI.removeFavorite(user.id, selectedMosque);
        setFavoriteMosques(favoriteMosques.filter(id => id !== selectedMosque));
      } else {
        await userAPI.addFavorite(user.id, selectedMosque);
        setFavoriteMosques([...favoriteMosques, selectedMosque]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrayerTimes();
    await fetchPosts();
    setRefreshing(false);
  };

  const selectedMosqueData = mosques.find(m => m.id === selectedMosque);
  const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="moon" size={40} color={theme.colors.primary} />
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              Salah Reminder
            </Text>
            <Text variant="bodySmall">Never miss a prayer</Text>
          </View>
        </View>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.mosqueHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Select Mosque
            </Text>
            {user && selectedMosque && (
              <Ionicons
                name={favoriteMosques.includes(selectedMosque) ? 'star' : 'star-outline'}
                size={24}
                color="#fbbf24"
                onPress={toggleFavorite}
              />
            )}
          </View>
          <Picker
            selectedValue={selectedMosque}
            onValueChange={setSelectedMosque}
            style={styles.picker}
          >
            {mosques.map(mosque => (
              <Picker.Item key={mosque.id} label={`${mosque.name} - ${mosque.city}`} value={mosque.id} />
            ))}
          </Picker>
          {selectedMosqueData && (
            <Text variant="bodySmall" style={styles.mosqueAddress}>
              {selectedMosqueData.address}, {selectedMosqueData.city}
            </Text>
          )}
        </Card.Content>
      </Card>

      {prayerTimes && (
        <View style={styles.prayerTimesContainer}>
          {prayerNames.map(prayer => (
            <Card key={prayer} style={styles.prayerCard}>
              <Card.Content style={styles.prayerCardContent}>
                <Text variant="labelLarge" style={styles.prayerName}>
                  {prayer.charAt(0).toUpperCase() + prayer.slice(1)}
                </Text>
                <Text variant="headlineSmall" style={[styles.prayerTime, { color: theme.colors.primary }]}>
                  {prayerTimes[prayer]?.split(' ')[0] || 'N/A'}
                </Text>
                <View style={styles.alarmToggle}>
                  <Ionicons name="notifications-outline" size={16} color={theme.colors.primary} />
                  <Switch
                    value={alarms[prayer]}
                    onValueChange={() => toggleAlarm(prayer)}
                    color={theme.colors.primary}
                  />
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
              { value: 'donation', label: 'Donation', icon: 'heart' },
              { value: 'feed', label: 'Feed', icon: 'newspaper' },
            ]}
            style={styles.tabs}
          />

          {activeTab === 'donation' && selectedMosqueData?.donation_qr_code && (
            <View style={styles.donationContent}>
              <Text variant="titleMedium" style={styles.donationTitle}>
                Support {selectedMosqueData.name}
              </Text>
              <Text variant="bodySmall" style={styles.donationSubtitle}>
                Scan the QR code to make a donation
              </Text>
              <Image
                source={{ uri: `data:image/png;base64,${selectedMosqueData.donation_qr_code}` }}
                style={styles.qrCode}
                resizeMode="contain"
              />
            </View>
          )}

          {activeTab === 'feed' && (
            <View style={styles.feedContent}>
              {posts.length > 0 ? (
                posts.map(post => (
                  <Card key={post.id} style={styles.postCard}>
                    <Card.Content>
                      <Text variant="titleMedium" style={styles.postTitle}>
                        {post.title}
                      </Text>
                      {post.image && (
                        <Image
                          source={{ uri: `data:image/png;base64,${post.image}` }}
                          style={styles.postImage}
                          resizeMode="cover"
                        />
                      )}
                      <Text variant="bodyMedium" style={styles.postContent}>
                        {post.content}
                      </Text>
                      <Text variant="bodySmall" style={styles.postDate}>
                        {new Date(post.created_at).toLocaleDateString()}
                      </Text>
                    </Card.Content>
                  </Card>
                ))
              ) : (
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No community posts available
                </Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  mosqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  picker: {
    marginVertical: 8,
  },
  mosqueAddress: {
    marginTop: 4,
    opacity: 0.7,
  },
  prayerTimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  prayerCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 2,
  },
  prayerCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  prayerName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  prayerTime: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  alarmToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabs: {
    marginBottom: 16,
  },
  donationContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  donationTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  donationSubtitle: {
    marginBottom: 16,
    opacity: 0.7,
  },
  qrCode: {
    width: 250,
    height: 250,
    borderRadius: 8,
  },
  feedContent: {
    paddingTop: 8,
  },
  postCard: {
    marginBottom: 12,
  },
  postTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 12,
  },
  postContent: {
    marginBottom: 8,
  },
  postDate: {
    opacity: 0.6,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    paddingVertical: 24,
  },
});