import { StyleSheet, Text, View } from "react-native";
import { useI18n } from "@/i18n";

export default function DashboardScreen() {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("dashboard.title")}</Text>
      <Text style={styles.subtitle}>{t("dashboard.welcomeMessage", { name: "User" })}</Text>
      {/* Add dashboard components here */}
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
});
