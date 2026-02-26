import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { useI18n } from "@/i18n";
import { useRouter } from "expo-router";
import { useState } from "react";
import { RecordingSession } from "@/types";

const mockSessions: RecordingSession[] = [
  {
    id: "1",
    userId: "user1",
    title: "Project Kick-off Meeting",
    status: "completed",
    durationSeconds: 3600,
    languageCode: "en",
    createdAt: new Date("2023-10-26T10:00:00Z"),
    updatedAt: new Date("2023-10-26T11:00:00Z"),
  },
  {
    id: "2",
    userId: "user1",
    title: "Weekly Sync",
    status: "processing",
    durationSeconds: 1800,
    languageCode: "ja",
    createdAt: new Date("2023-10-25T14:30:00Z"),
    updatedAt: new Date("2023-10-25T14:45:00Z"),
  },
  {
    id: "3",
    userId: "user1",
    title: "Client Demo Feedback",
    status: "failed",
    durationSeconds: 1200,
    languageCode: "es",
    createdAt: new Date("2023-10-24T09:00:00Z"),
    updatedAt: new Date("2023-10-24T09:10:00Z"),
  },
];

export default function SessionsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [sessions] = useState<RecordingSession[]>(mockSessions); // In a real app, fetch from API

  const renderItem = ({ item }: { item: RecordingSession }) => (
    <TouchableOpacity style={styles.sessionItem} onPress={() => router.push(`/(app)/sessions/${item.id}`)}>
      <Text style={styles.sessionTitle}>{item.title}</Text>
      <Text style={styles.sessionStatus}>{t(`session.status.${item.status}`)}</Text>
      <Text style={styles.sessionDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t("sessions.title")}</Text>
      {sessions.length === 0 ? (
        <Text style={styles.noSessionsText}>{t("sessions.noSessions")}</Text>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f8f8f8",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  sessionItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sessionStatus: {
    fontSize: 14,
    color: "#555",
  },
  sessionDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  noSessionsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
});
