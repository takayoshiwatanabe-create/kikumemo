import { StyleSheet, Text, View, Button } from "react-native"; // These are React Native components
import { useI18n } from "@/i18n";

export default function RecordScreen() {
  const { t } = useI18n();

  const handleStartRecording = () => {
    console.log("Start recording...");
    // Implement recording logic here
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("record.title")}</Text>
      <Text style={styles.subtitle}>{t("record.instructions")}</Text>
      <Button title={t("record.startButton")} onPress={handleStartRecording} />
      {/* Add recording visualization and controls here */}
    </View>
  );
}

const styles = StyleSheet.create({ // StyleSheet is React Native specific
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 16,
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
});

