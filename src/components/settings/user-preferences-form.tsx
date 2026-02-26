"use client";

import React, { useState, useEffect } from "react";
import { useI18n, Language } from "@/i18n";
import { UserPreferences } from "@/types";
import { motion } from "framer-motion";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "next/navigation";

interface UserPreferencesFormProps {
  initialPreferences: UserPreferences;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      ease: "easeOut",
      duration: 0.4,
    },
  },
};

export default function UserPreferencesForm({ initialPreferences }: UserPreferencesFormProps) {
  const { t, lang, setLanguage, isRTL } = useI18n();
  const router = useRouter();
  const { updateUserPreferences, isLoading, error } = useUserStore();

  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(initialPreferences);

  useEffect(() => {
    setLocalPreferences(initialPreferences);
  }, [initialPreferences]);

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    setLocalPreferences((prev) => ({ ...prev, language: newLang }));
    setLanguage(newLang); // Update i18n context immediately
    await updateUserPreferences({ language: newLang });
    router.push(`/${newLang}/settings`); // Redirect to update locale in URL
  };

  const handleTimezoneChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value;
    setLocalPreferences((prev) => ({ ...prev, timezone: newTimezone }));
    await updateUserPreferences({ timezone: newTimezone });
  };

  const handleAudioQualityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuality = e.target.value as 'standard' | 'high';
    setLocalPreferences((prev) => ({ ...prev, audioQuality: newQuality }));
    await updateUserPreferences({ audioQuality: newQuality });
  };

  const handleToggleAutoSave = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setLocalPreferences((prev) => ({ ...prev, autoSave: value }));
    await updateUserPreferences({ autoSave: value });
  };

  const handleExportFormatChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value as 'markdown' | 'docx' | 'pdf';
    setLocalPreferences((prev) => ({ ...prev, exportFormat: newFormat }));
    await updateUserPreferences({ exportFormat: newFormat });
  };

  return (
    <div className={`max-w-2xl mx-auto ${isRTL ? "rtl" : "ltr"}`}>
      {error && (
        <motion.p
          className="mb-4 text-red-600 dark:text-red-400 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {t("common.error")}: {error}
        </motion.p>
      )}

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 flex justify-between items-center"
        variants={itemVariants}
      >
        <label htmlFor="language-select" className="text-lg text-gray-800 dark:text-gray-200">
          {t("settings.language")}
        </label>
        <select
          id="language-select"
          value={localPreferences.language}
          onChange={handleLanguageChange}
          disabled={isLoading}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ja">{t("language.ja")}</option>
          <option value="en">{t("language.en")}</option>
          <option value="zh">{t("language.zh")}</option>
          <option value="ko">{t("language.ko")}</option>
          <option value="es">{t("language.es")}</option>
          <option value="fr">{t("language.fr")}</option>
          <option value="de">{t("language.de")}</option>
          <option value="pt">{t("language.pt")}</option>
          <option value="ar">{t("language.ar")}</option>
          <option value="hi">{t("language.hi")}</option>
        </select>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 flex justify-between items-center"
        variants={itemVariants}
      >
        <label htmlFor="timezone-select" className="text-lg text-gray-800 dark:text-gray-200">
          {t("settings.timezone")}
        </label>
        <select
          id="timezone-select"
          value={localPreferences.timezone}
          onChange={handleTimezoneChange}
          disabled={isLoading}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Asia/Tokyo">Asia/Tokyo</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Europe/London">Europe/London</option>
          <option value="Europe/Paris">Europe/Paris</option>
          <option value="Asia/Shanghai">Asia/Shanghai</option>
          <option value="Asia/Dubai">Asia/Dubai</option>
          {/* Add more timezones as needed */}
        </select>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 flex justify-between items-center"
        variants={itemVariants}
      >
        <label htmlFor="audio-quality-select" className="text-lg text-gray-800 dark:text-gray-200">
          {t("settings.audioQuality")}
        </label>
        <select
          id="audio-quality-select"
          value={localPreferences.audioQuality}
          onChange={handleAudioQualityChange}
          disabled={isLoading}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="standard">{t("settings.audioQualityStandard")}</option>
          <option value="high">{t("settings.audioQualityHigh")}</option>
        </select>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 flex justify-between items-center"
        variants={itemVariants}
      >
        <label htmlFor="export-format-select" className="text-lg text-gray-800 dark:text-gray-200">
          {t("settings.exportFormat")}
        </label>
        <select
          id="export-format-select"
          value={localPreferences.exportFormat}
          onChange={handleExportFormatChange}
          disabled={isLoading}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="markdown">Markdown</option>
          <option value="docx">DOCX</option>
          <option value="pdf">PDF</option>
        </select>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 flex justify-between items-center"
        variants={itemVariants}
      >
        <label htmlFor="auto-save-switch" className="text-lg text-gray-800 dark:text-gray-200">
          {t("settings.autoSave")}
        </label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="auto-save-switch"
            checked={localPreferences.autoSave}
            onChange={handleToggleAutoSave}
            disabled={isLoading}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </motion.div>
    </div>
  );
}

