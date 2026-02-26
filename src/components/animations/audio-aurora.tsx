"use client";

import React from "react";
import { motion } from "framer-motion";

interface AudioAuroraProps {
  isRecording: boolean;
  volume: number; // Normalized volume from 0 to 1
}

// AudioAuroraVariants from CLAUDE.md
const AudioAuroraVariants = {
  idle: {
    scale: [1, 1.05, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  active: (volume: number) => ({
    scale: [1, 1.0 + volume * 0.3, 0.9 + volume * 0.1, 1.1 + volume * 0.2, 1],
    opacity: [0.4, 0.8 + volume * 0.2, 0.6 + volume * 0.1, 0.9 + volume * 0.1, 0.4],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  }),
};

export default function AudioAurora({ isRecording, volume }: AudioAuroraProps) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50"
      variants={AudioAuroraVariants}
      animate={isRecording ? "active" : "idle"}
      custom={volume} // Pass volume as custom prop for active variant
      style={{
        // Adjust size and position based on volume for a more dynamic effect
        width: `${100 + volume * 50}%`,
        height: `${100 + volume * 50}%`,
        left: `${-volume * 25}%`,
        top: `${-volume * 25}%`,
      }}
    />
  );
}
