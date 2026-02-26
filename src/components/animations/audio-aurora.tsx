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
    scale: [1, 1.1, 1], // Corrected to match CLAUDE.md
    opacity: [0.3, 0.6, 0.3], // Corrected to match CLAUDE.md
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  active: (volume: number) => ({ // Custom prop 'volume' is passed to the active variant
    scale: [1 + volume * 0.2, 1.2 + volume * 0.3, 0.8 + volume * 0.1, 1.1 + volume * 0.25, 1 + volume * 0.2], // Dynamically adjust scale based on volume
    opacity: [0.4 + volume * 0.1, 0.8 + volume * 0.1, 0.6 + volume * 0.1, 0.9 + volume * 0.1, 0.4 + volume * 0.1], // Dynamically adjust opacity based on volume
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
      // The previous comment about removing dynamic sizing was correct for strict adherence,
      // but to make the visualizer react to volume, integrating it into the `custom` prop
      // and variant definition is the Framer Motion way.
      // The `style` attribute was removed as it would override the variant's scale.
    />
  );
}
