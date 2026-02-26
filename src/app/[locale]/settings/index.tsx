"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import { UserPreferences } from "@/types";
import { Language } from "@/i18n";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUserStore } from "@/stores/user-store";

export default function SettingsScreen() {
  const { t, lang, setLanguage, isRTL } = useI18n();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { userPreferences, fetchUserPreferences, updateUserPreferences, isLoading, error } = useUserStore();

  const [localPreferences, setLocalPreferences] = useState<UserPreferences>({
    language: lang,
    timezone: "Asia/Tokyo",
    audioQuality: "standard",
    autoSave: true,
    exportFormat: "markdown",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${lang}/auth/login`);
      return;
    }

    if (status === "authenticated" && !userPreferences && !isLoading) {
      fetchUserPreferences();
    }
  }, [status, lang, router, fetchUserPreferences, userPreferences, isLoading]);

  useEffect(() => {
    if (userPreferences) {
      setLocalPreferences({
        language: userPreferences.language as Language, // Cast to Language
        timezone: userPreferences.timezone,
        audioQuality: userPreferences.audio_quality, // Use audio_quality from DB
        autoSave: userPreferences.auto_save, // Use auto_save from DB
        exportFormat: userPreferences.export_format, // Use export_format from DB
      });
      // Ensure the i18n language matches the fetched preference
      if (userPreferences.language !== lang) {
        setLanguage(userPreferences.language as Language);
      }
    }
  }, [userPreferences, lang, setLanguage]);

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    setLocalPreferences((prev) => ({ ...prev, language: newLang }));
    setLanguage(newLang); // Update i18n context immediately
    await updateUserPreferences({ language: newLang });
    // No need to redirect here, the language change in i18n context and `document.documentElement.lang` in _layout.tsx
    // will handle the UI update. The URL locale is already handled by Next.js routing.
  };

  const handleTimezoneChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimezone = e.target.value;
    setLocalPreferences((prev) => ({ ...prev, timezone: newTimezone }));
    await updateUserPreferences({ timezone: newTimezone });
  };

  const handleAudioQualityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuality = e.target.value as 'standard' | 'high';
    setLocalPreferences((prev) => ({ ...prev, audioQuality: newQuality }));
    await updateUserPreferences({ audio_quality: newQuality }); // Use audio_quality for DB update
  };

  const handleToggleAutoSave = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setLocalPreferences((prev) => ({ ...prev, autoSave: value }));
    await updateUserPreferences({ auto_save: value }); // Use auto_save for DB update
  };

  const handleExportFormatChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value as 'markdown' | 'docx' | 'pdf';
    setLocalPreferences((prev) => ({ ...prev, exportFormat: newFormat }));
    await updateUserPreferences({ export_format: newFormat }); // Use export_format for DB update
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{t("common.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-red-500 text-center">{t("common.error")}: {error}</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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

  return (
    <motion.div
      className={`min-h-screen bg-gray-100 dark:bg-gray-900 p-6 ${isRTL ? "rtl" : "ltr"}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-2xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center"
          variants={itemVariants}
        >
          {t("settings.title")}
        </motion.h1>

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
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Asia/Tokyo">Asia/Tokyo</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
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
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </motion.div>

      </div>
    </motion.div>
  );
}
