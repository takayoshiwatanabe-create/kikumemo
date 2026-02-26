"use client";

import React from "react";
import { motion } from "framer-motion";

interface TypewriterProps {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
}

const TypewriterVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.5
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
      variants={TypewriterVariants}
    >
      {characters.map((char, index) => (
        <motion.span key={index} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
