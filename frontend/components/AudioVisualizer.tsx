"use client";
import React, { useEffect, useState } from "react";

export default function AudioVisualizer({ isRecording }: { isRecording: boolean }) {
  const [bars, setBars] = useState<number[]>(Array(5).fill(10));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setBars((prev) => prev.map(() => Math.floor(Math.random() * 40) + 10));
      }, 150);
    } else {
      setBars(Array(5).fill(10));
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", height: "50px" }}>
      {bars.map((height, i) => (
        <div
          key={i}
          style={{
            width: "8px",
            height: `${height}px`,
            backgroundColor: "var(--primary)",
            borderRadius: "4px",
            transition: "height 0.15s ease",
          }}
        />
      ))}
    </div>
  );
}
