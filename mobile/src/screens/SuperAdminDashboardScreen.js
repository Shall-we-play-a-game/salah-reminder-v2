import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function SuperAdminDashboardScreen() {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={40} color={theme.colors.primary} />
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Super Admin
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          System management
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.infoBox}>
            <Ionicons name="desktop" size={48} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.infoTitle}>
              Full SuperAdmin Features on Web
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              For complete superadmin functionality including:
            </Text>
            <View style={styles.featureList}>
              <Text variant="bodySmall">• Approve/reject admin registrations</Text>
              <Text variant="bodySmall">• Review ID proof documents</Text>
              <Text variant="bodySmall">• Moderate community posts</Text>
              <Text variant="bodySmall">• Manage all mosques</Text>
            </View>
            <Text variant="bodyMedium" style={styles.infoText}>
              Please visit the web application at:
            </Text>
            <Text variant="bodySmall" style={styles.webUrl}>
              https://mosque-connect-11.preview.emergentagent.com
            </Text>
          </View>
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
});