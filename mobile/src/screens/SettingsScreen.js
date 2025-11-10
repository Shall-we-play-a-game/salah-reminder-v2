import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Switch, useTheme, Button, RadioButton, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const RINGTONES = {
  adhan: { name: 'Adhan Call', description: 'Traditional call to prayer' },
  bell: { name: 'Bell', description: 'Classic bell sound' },
  chime: { name: 'Chime', description: 'Gentle chime tone' },
  gong: { name: 'Gong', description: 'Deep gong sound' },
  soft: { name: 'Soft', description: 'Soft bell ring' },
};

export default function SettingsScreen() {
  const theme = useTheme();
  const [darkMode, setDarkMode] = useState(false);
  const [selectedRingtone, setSelectedRingtone] = useState('adhan');
  const [user, setUser] = useState(null);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    loadSettings();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadSettings = async () => {
    const userData = await AsyncStorage.getItem('user');
    const savedDarkMode = await AsyncStorage.getItem('darkMode');
    const savedRingtone = await AsyncStorage.getItem('ringtone');

    if (userData) setUser(JSON.parse(userData));
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
    if (savedRingtone) setSelectedRingtone(savedRingtone);
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await AsyncStorage.setItem('darkMode', String(newMode));
    Alert.alert('Theme Changed', 'Please restart the app to apply the theme change.');
  };

  const selectRingtone = async (ringtone) => {
    setSelectedRingtone(ringtone);
    await AsyncStorage.setItem('ringtone', ringtone);
    playPreview();
  };

  const playPreview = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3' }
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('user');
            global.location?.reload();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Ionicons name="settings" size={40} color={theme.colors.primary} />
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Settings
        </Text>
      </View>

      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          description="Toggle dark theme"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              color={theme.colors.primary}
            />
          )}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Ringtone</List.Subheader>
        {Object.keys(RINGTONES).map(key => (
          <List.Item
            key={key}
            title={RINGTONES[key].name}
            description={RINGTONES[key].description}
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <RadioButton
                value={key}
                status={selectedRingtone === key ? 'checked' : 'unchecked'}
                onPress={() => selectRingtone(key)}
                color={theme.colors.primary}
              />
            )}
            onPress={() => selectRingtone(key)}
          />
        ))}
      </List.Section>

      {user && (
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Email"
            description={user.email}
            left={props => <List.Icon {...props} icon="account" />}
          />
          <List.Item
            title="Role"
            description={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            left={props => <List.Icon {...props} icon="badge-account" />}
          />
        </List.Section>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          icon="logout"
          style={styles.logoutButton}
          buttonColor={theme.colors.error}
        >
          Logout
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          Salah Reminder v1.0.0
        </Text>
        <Text variant="bodySmall" style={styles.footerText}>
          Built with ❤️ for Muslims
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  buttonContainer: {
    padding: 20,
    marginTop: 20,
  },
  logoutButton: {
    paddingVertical: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    opacity: 0.6,
    marginVertical: 2,
  },
});