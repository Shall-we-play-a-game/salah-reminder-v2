import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboardScreen() {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Ionicons name="business" size={40} color={theme.colors.primary} />
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Admin Dashboard
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Manage your mosque
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={48} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.infoTitle}>
              Full Admin Features on Web
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              For complete admin functionality including:
            </Text>
            <View style={styles.featureList}>
              <Text variant="bodySmall">• Set prayer times</Text>
              <Text variant="bodySmall">• Upload donation QR codes</Text>
              <Text variant="bodySmall">• Create community posts with images</Text>
              <Text variant="bodySmall">• Manage mosque details</Text>
            </View>
            <Text variant="bodyMedium" style={styles.infoText}>
              Please visit the web application at:
            </Text>
            <Text variant="bodySmall" style={styles.webUrl}>
              https://prayerpal-14.preview.emergentagent.com
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.quickActions}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Quick Info
        </Text>
        <Card style={styles.actionCard}>
          <Card.Content>
            <List.Item
              title="Status"
              description="Approved Admin"
              left={props => <List.Icon {...props} icon="check-circle" color="#10b981" />}
            />
          </Card.Content>
        </Card>
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
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  infoBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    textAlign: 'center',
    marginVertical: 8,
    opacity: 0.8,
  },
  featureList: {
    marginVertical: 12,
    paddingLeft: 20,
  },
  webUrl: {
    color: '#10b981',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionCard: {
    elevation: 2,
  },
});