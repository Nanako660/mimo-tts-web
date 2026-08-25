import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  isStreaming?: boolean;
  className?: string;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  analyser,
  isPlaying,
  isStreaming = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bufferLength = 64;
    let dataArray = new Uint8Array(bufferLength);

    if (analyser) {
      analyser.fftSize = 128;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.85;

          // 绚丽渐变色 (橙色到紫色)
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#f97316'); // 橙色
          gradient.addColorStop(0.5, '#fb923c');
          gradient.addColorStop(1, '#ec4899'); // 粉紫色

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, 4);
          ctx.fill();

          x += barWidth;
        }
      } else if (isStreaming) {
        // 流式接收中，动态正弦波光效
        phase += 0.08;
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#f97316';

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.03 + phase) * 15 * Math.sin(phase * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // 静止状态微光待机线
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)';
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isPlaying, isStreaming]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={48}
      className={`w-full h-12 rounded-lg ${className}`}
    />
  );
};
