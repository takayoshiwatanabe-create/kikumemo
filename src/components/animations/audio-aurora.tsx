"use client";

import React from "react";
import { motion } from "framer-motion";

interface AudioAuroraProps {
  isRecording: boolean;
  volume: number;
}

const AudioAuroraVariants = {
  idle: {
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  active: (volume: number) => ({
    scale: [1 + volume * 0.2, 1.2 + volume * 0.3, 0.8 + volume * 0.1, 1.1 + volume * 0.25, 1 + volume * 0.2],
    opacity: [0.4 + volume * 0.1, 0.8 + volume * 0.1, 0.6 + volume * 0.1, 0.9 + volume * 0.1, 0.4 + volume * 0.1],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  }),
};

export default function AudioAurora({ isRecording, volume }: AudioAuroraProps) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50"
      variants={AudioAuroraVariants}
      animate={isRecording ? "active" : "idle"}
      custom={volume}
    />
  );
}


