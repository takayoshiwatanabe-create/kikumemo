"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AudioVisualizerMessage } from "@/types";

interface AudioVisualizerProps {
  audioData: AudioVisualizerMessage | null;
  isRecording: boolean;
}

const AudioAuroraVariants = {
  idle: {
    scale: [1, 1.05, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  active: (volume: number) => ({ // Pass volume as a custom prop to the active variant
    scale: [1, 1.0 + volume * 0.3, 0.9 + volume * 0.1, 1.1 + volume * 0.2, 1],
    opacity: [0.4, 0.8 + volume * 0.2, 0.6 + volume * 0.1, 0.9 + volume * 0.1, 0.4],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  }),
};

export default function AudioVisualizer({ audioData, isRecording }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const [volume, setVolume] = useState(0);

  const draw = useCallback((frequencies: number[], currentVolume: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / frequencies.length;
    let x = 0;

    for (let i = 0; i < frequencies.length; i++) {
      const barHeight = frequencies[i] * height;
      const y = height - barHeight;

      const hue = 200 + currentVolume * 100;
      const saturation = 70 + currentVolume * 30;
      const lightness = 50 + currentVolume * 10;
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      ctx.fillRect(x, y, barWidth - 1, barHeight);
      x += barWidth;
    }
  }, []);

  useEffect(() => {
    if (isRecording && audioData) {
      setVolume(audioData.volume);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(() => draw(audioData.frequencies, audioData.volume));
    } else if (!isRecording && animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setVolume(0);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [audioData, isRecording, draw]);

  return (
    <div className="relative w-full max-w-xl h-48 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50"
        variants={AudioAuroraVariants}
        animate={isRecording ? "active" : "idle"}
        custom={volume} // Pass volume as custom prop for active variant
        style={{
          width: `${100 + volume * 50}%`,
          height: `${100 + volume * 50}%`,
          left: `${-volume * 25}%`,
          top: `${-volume * 25}%`,
        }}
      />
      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        className="relative z-10 rounded-lg bg-gray-900 dark:bg-gray-950 border border-gray-700 dark:border-gray-800 shadow-xl"
      />
    </div>
  );
}


