"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AudioVisualizerMessage } from "@/types";
import AudioAurora from "@/components/animations/audio-aurora";

interface AudioVisualizerProps {
  audioData: AudioVisualizerMessage | null;
  isRecording: boolean;
}

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
      <AudioAurora isRecording={isRecording} volume={volume} />
      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        className="relative z-10 rounded-lg bg-gray-900 dark:bg-gray-950 border border-gray-700 dark:border-gray-800 shadow-xl"
      />
    </div>
  );
}

