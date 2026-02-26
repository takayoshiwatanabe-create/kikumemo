import { StyleSheet, Text, View, Switch, Platform } from "react-native"; // These are React Native components
import { Picker } from "@react-native-picker/picker"; // This is React Native specific
import { useI18n } from "@/i18n";
import { useState } from "react";
import { UserPreferences } from "@/types";
import { Language } from "@/i18n/translations";

export default function SettingsScreen() {
  const { t, lang, setLanguage, isRTL } = useI18n();
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: lang,
    timezone: "Asia/Tokyo",
    audioQuality: "standard",
    autoSave: true,
    exportFormat: "markdown",
  });

  const handleLanguageChange = (newLang: Language) => {
    setPreferences((prev) => ({ ...prev, language: newLang }));
    setLanguage(newLang); // Assuming setLanguage updates global i18n context
  };

  const handleToggleAutoSave = (value: boolean) => {
    setPreferences((prev) => ({ ...prev, autoSave: value }));
    // Call API to update user preferences
  };

  return (
    <View style={[styles.container, isRTL && styles.rtlContainer]}>
      <Text style={styles.title}>{t("settings.title")}</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>{t("settings.language")}</Text>
        <Picker<Language> // Explicitly type Picker for better type inference
          selectedValue={preferences.language}
          style={styles.picker}
          onValueChange={(itemValue) => handleLanguageChange(itemValue)}
          itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
        >
          <Picker.Item label={t("language.ja")} value="ja" />
          <Picker.Item label={t("language.en")} value="en" />
          <Picker.Item label={t("language.zh")} value="zh" />
          <Picker.Item label={t("language.ko")} value="ko" />
          <Picker.Item label={t("language.es")} value="es" />
          <Picker.Item label={t("language.fr")} value="fr" />
          <Picker.Item label={t("language.de")} value="de" />
          <Picker.Item label={t("language.pt")} value="pt" />
          <Picker.Item label={t("language.ar")} value="ar" />
          <Picker.Item label={t("language.hi")} value="hi" />
        </Picker>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>{t("settings.autoSave")}</Text>
        <Switch
          onValueChange={handleToggleAutoSave}
          value={preferences.autoSave}
        />
      </View>

      {/* Add more settings here */}
    </View>
  );
}

const styles = StyleSheet.create({ // StyleSheet is React Native specific
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f8f8f8",
  },
  rtlContainer: {
    direction: "rtl",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLabel: {
    fontSize: 18,
    color: "#333",
  },
  picker: {
    height: 50,
    width: 150,
  },
  pickerItem: { // For iOS specific styling if needed
    fontSize: 16,
  },
});

