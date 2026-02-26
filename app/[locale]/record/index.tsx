"use client"; // This component uses client-side hooks like useI18n

import React from "react";
import { useI18n } from "@/i18n";

export default function RecordScreen() {
  const { t } = useI18n();

  const handleStartRecording = () => {
    console.log("Start recording...");
    // Implement recording logic here
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {t("record.title")}
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-8">
        {t("record.instructions")}
      </p>
      <button
        onClick={handleStartRecording}
        className="px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
      >
        {t("record.startButton")}
      </button>
      {/* Add recording visualization and controls here */}
    </div>
  );
}
