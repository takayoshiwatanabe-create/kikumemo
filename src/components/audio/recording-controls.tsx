"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";

interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  isPaused: boolean;
  disabled: boolean;
}

export default function RecordingControls({
  isRecording,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  isPaused,
  disabled,
}: RecordingControlsProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-center space-x-4">
      {!isRecording && (
        <Button
          onClick={onStartRecording}
          disabled={disabled}
          className="px-8 py-4 text-xl font-semibold rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300 ease-in-out"
        >
          {t("record.startButton")}
        </Button>
      )}

      {isRecording && (
        <>
          {isPaused ? (
            <Button
              onClick={onResumeRecording}
              disabled={disabled}
              className="px-6 py-3 text-lg font-semibold rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-300 ease-in-out"
            >
              {t("record.resumeButton")}
            </Button>
          ) : (
            <Button
              onClick={onPauseRecording}
              disabled={disabled}
              className="px-6 py-3 text-lg font-semibold rounded-full bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg transition-all duration-300 ease-in-out"
            >
              {t("record.pauseButton")}
            </Button>
          )}
          <Button
            onClick={onStopRecording}
            disabled={disabled}
            className="px-6 py-3 text-lg font-semibold rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all duration-300 ease-in-out"
          >
            {t("record.stopButton")}
          </Button>
        </>
      )}
    </div>
  );
}


