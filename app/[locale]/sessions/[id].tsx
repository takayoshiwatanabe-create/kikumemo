import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from "react-native"; // These are React Native components
import { useLocalSearchParams } from "expo-router"; // This is Expo-specific
import { useI18n } from "@/i18n";
import { useState, useEffect } from "react";
import { RecordingSession, AISummaryResponse } from "@/types";

const mockSessionDetail: RecordingSession = {
  id: "1",
  userId: "user1",
  title: "Project Kick-off Meeting",
  status: "completed",
  audio_file_path: "/path/to/audio.opus",
  transcript: "Okay, so welcome everyone to the project kick-off meeting for the new KikuMemo AI transcription service. Our main goal is to provide a seamless experience for users to record meetings and get instant, accurate summaries. John, could you start with the technical overview?",
  user_notes: "Key points: seamless experience, instant summaries. Action: John to cover tech.",
  ai_summary: "The project kick-off meeting for KikuMemo AI transcription service focused on providing a seamless user experience with instant, accurate summaries. John is assigned to present the technical overview.",
  duration_seconds: 3600,
  language_code: "en",
  createdAt: new Date("2023-10-26T10:00:00Z"),
  updatedAt: new Date("2023-10-26T11:00:00Z"),
};

const mockAISummary: AISummaryResponse = {
  summary: "The project kick-off meeting for KikuMemo AI transcription service focused on providing a seamless user experience with instant, accurate summaries. John is assigned to present the technical overview.",
  keyPoints: [
    "KikuMemo AI transcription service kick-off.",
    "Mission: seamless user experience, instant accurate summaries.",
    "John to provide technical overview."
  ],
  todos: [
    { assignee: "John", task: "Prepare technical overview presentation", priority: "high" },
    { assignee: "Team", task: "Review initial design mockups", priority: "medium", deadline: "2023-11-01" }
  ],
  decisions: [
    "Project name confirmed as KikuMemo.",
    "Focus on user experience and summary accuracy."
  ],
  openIssues: [
    "Finalize API integration strategy for Whisper/GPT-4.",
    "Define detailed UI/UX for real-time transcription."
  ]
};

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Specify type for useLocalSearchParams
  const { t } = useI18n();
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [aiOutput, setAiOutput] = useState<AISummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch session and AI output from API based on `id`
    const fetchSessionData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSession(mockSessionDetail);
      setAiOutput(mockAISummary);
      setLoading(false);
    };

    fetchSessionData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t("session.notFound")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{session.title}</Text>
      <Text style={styles.status}>{t(`session.status.${session.status}`)}</Text>

      {session.transcript && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("session.transcript")}</Text>
          <Text style={styles.sectionContent}>{session.transcript}</Text>
        </View>
      )}

      {session.user_notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("session.userNotes")}</Text>
          <Text style={styles.sectionContent}>{session.user_notes}</Text>
        </View>
      )}

      {aiOutput && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("session.aiSummary")}</Text>
          <Text style={styles.sectionContent}>{aiOutput.summary}</Text>

          {aiOutput.keyPoints && aiOutput.keyPoints.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>{t("session.keyPoints")}</Text>
              {aiOutput.keyPoints.map((point, index) => (
                <Text key={index} style={styles.listItem}>• {point}</Text>
              ))}
            </View>
          )}

          {aiOutput.todos && aiOutput.todos.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>{t("session.todos")}</Text>
              {aiOutput.todos.map((todo, index) => (
                <Text key={index} style={styles.listItem}>
                  • {todo.task} ({t("common.assignee")}: {todo.assignee}{todo.deadline ? `, ${t("common.deadline")}: ${todo.deadline}` : ''})
                </Text>
              ))}
            </View>
          )}

          {aiOutput.decisions && aiOutput.decisions.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>{t("session.decisions")}</Text>
              {aiOutput.decisions.map((decision, index) => (
                <Text key={index} style={styles.listItem}>• {decision}</Text>
              ))}
            </View>
          )}

          {aiOutput.openIssues && aiOutput.openIssues.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>{t("session.openIssues")}</Text>
              {aiOutput.openIssues.map((issue, index) => (
                <Text key={index} style={styles.listItem}>• {issue}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ // StyleSheet is React Native specific
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  status: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  subsection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginLeft: 10,
  },
});

