"use client";

import React, { useState } from "react";
import { useI18n } from "@/i18n";
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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    setPreferences((prev) => ({ ...prev, language: newLang }));
    setLanguage(newLang); // Assuming setLanguage updates global i18n context and URL
  };

  const handleToggleAutoSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setPreferences((prev) => ({ ...prev, autoSave: value }));
    // Call API to update user preferences
    console.log("Auto save toggled:", value);
  };

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 p-6 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {t("settings.title")}
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 flex justify-between items-center">
          <label htmlFor="language-select" className="text-lg text-gray-800 dark:text-gray-200">
            {t("settings.language")}
          </label>
          <select
            id="language-select"
            value={preferences.language}
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
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 flex justify-between items-center">
          <label htmlFor="auto-save-switch" className="text-lg text-gray-800 dark:text-gray-200">
            {t("settings.autoSave")}
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="auto-save-switch"
              checked={preferences.autoSave}
              onChange={handleToggleAutoSave}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Add more settings here */}
      </div>
    </div>
  );
}


