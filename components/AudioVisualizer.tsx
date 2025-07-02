import React, { useRef, useEffect } from 'react';
import type { ViewMode } from '../types';
import { computeSpectrogramData } from '../services/audioUtils';

interface AudioVisualizerProps {
    audioBuffer: Float32Array;
    sampleRate: number;
    viewMode: ViewMode;
}

const drawWaveform = (ctx: CanvasRenderingContext2D, buffer: Float32Array, color: string) => {
    const { width, height } = ctx.canvas;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    const sliceWidth = width * 1.0 / buffer.length;
    let x = 0;

    for (let i = 0; i < buffer.length; i++) {
        const v = buffer[i];
        const y = (v * height / 2) + height / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    ctx.lineTo(width, height / 2);
    ctx.stroke();
};

const drawSpectrogram = (ctx: CanvasRenderingContext2D, specData: number[][]) => {
    if (!specData.length || !specData[0].length) return;

    const { width, height } = ctx.canvas;
    const numFreqs = specData.length;
    const numTimes = specData[0].length;
    
    const cellWidth = width / numTimes;
    const cellHeight = height / numFreqs;

    // Find min/max dB for color mapping
    let minDb = 0;
    let maxDb = -100;
    for (let t = 0; t < numTimes; t++) {
        for (let f = 0; f < numFreqs; f++) {
            if (specData[f][t] > maxDb) maxDb = specData[f][t];
            if (specData[f][t] < minDb) minDb = specData[f][t];
        }
    }
    const dbRange = maxDb - minDb;
    
    // Inferno colormap simplified
    const inferno = (t: number) => {
        const r = 255 * Math.pow(Math.sin(t * Math.PI * 0.9 + 0.1), 1.5);
        const g = 255 * Math.pow(Math.sin(t * Math.PI * 0.6 + 0.9), 2.0);
        const b = 255 * Math.pow(Math.sin(t * Math.PI * 0.4 + 1.2), 3.0);
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    };


    for (let t = 0; t < numTimes; t++) {
        for (let f = 0; f < numFreqs; f++) {
            const value = specData[f][t];
            const normalized = (value - minDb) / dbRange;
            ctx.fillStyle = inferno(normalized);
            ctx.fillRect(t * cellWidth, f * cellHeight, Math.ceil(cellWidth), Math.ceil(cellHeight));
        }
    }
};

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioBuffer, sampleRate, viewMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const parent = canvas.parentElement;
        if(!parent) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.fillStyle = '#1f2937'; // bg-gray-800
        ctx.fillRect(0, 0, rect.width, rect.height);

        if (viewMode === 'waveform') {
            drawWaveform(ctx, audioBuffer, '#67e8f9'); // cyan-300
        } else {
            const { data: specData } = computeSpectrogramData(audioBuffer);
            drawSpectrogram(ctx, specData);
        }

    }, [audioBuffer, sampleRate, viewMode]);

    return (
        <canvas ref={canvasRef} className="w-full h-full rounded-md"></canvas>
    );
};
