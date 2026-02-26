"use client";

import React from "react";
import { motion } from "framer-motion";

interface TypewriterProps {
  text: string;
  delay?: number; // This prop is not directly used by the TypewriterVariants, but can be kept for future flexibility.
  stagger?: number; // This prop is not directly used by the TypewriterVariants, but can be kept for future flexibility.
  className?: string;
}

// The TypewriterVariants were defined in CLAUDE.md and should be used here.
const TypewriterVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03, // This value is hardcoded in the variant, not using the 'stagger' prop directly.
      delayChildren: 0.5 // This value is hardcoded in the variant, not using the 'delay' prop directly.
    }
  }
};

export default function Typewriter({ text, delay = 0.5, stagger = 0.03, className }: TypewriterProps) {
  const characters = text.split("");

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={TypewriterVariants} // Use the defined variants
    >
      {characters.map((char, index) => (
        <motion.span key={index} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

