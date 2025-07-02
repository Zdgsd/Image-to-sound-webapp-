import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ImageDropzone } from './components/ImageDropzone';
import { AudioVisualizer } from './components/AudioVisualizer';
import { EquationView } from './components/EquationView';
import { PlaybackControls } from './components/PlaybackControls';
import { Loader } from './components/Loader';
import { TitleBar } from './components/TitleBar';
import { imageToGrayscaleArray, generateAudioFromImage, encodeWAV, analyzeImageForAudioSettings } from './services/audioUtils';
import type { Settings, ViewMode } from './types';

const App: React.FC = () => {
    const [settings, setSettings] = useState<Settings>({
        maxSize: 256,
        density: 1.0,
        duration: 6.0,
        minFreq: 200,
        maxFreq: 8000,
        waveShape: 'sin',
    });
    const [audioBuffer, setAudioBuffer] = useState<Float32Array | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('spectrogram');
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const sampleRate = 44100;

    const debouncedProcessImageRef = useRef<number | null>(null);

    const processAndUpdateAudio = useCallback(async (currentSettings: Settings, image: HTMLImageElement) => {
        setIsLoading(true);
        try {
            const width = Math.max(1, Math.floor(currentSettings.maxSize / currentSettings.density));
            const height = Math.max(1, Math.floor(currentSettings.maxSize));
            const imageArray = await imageToGrayscaleArray(image, width, height);
            const durationPerColumn = currentSettings.duration / width;
            const generatedAudio = await generateAudioFromImage(
                imageArray,
                sampleRate,
                durationPerColumn,
                currentSettings.minFreq,
                currentSettings.maxFreq,
                currentSettings.waveShape
            );
            setAudioBuffer(generatedAudio);
        } catch (error) {
            console.error("Failed to re-process image:", error);
        } finally {
            setIsLoading(false);
        }
    }, [sampleRate]);

    const handleSettingsChange = useCallback((newSettings: Partial<Settings>) => {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);

        if (debouncedProcessImageRef.current) {
            clearTimeout(debouncedProcessImageRef.current);
        }
        
        if (imageSrc) {
            debouncedProcessImageRef.current = window.setTimeout(() => {
                const img = new Image();
                img.onload = () => processAndUpdateAudio(updatedSettings, img);
                img.src = imageSrc;
            }, 250);
        }
    }, [settings, imageSrc, processAndUpdateAudio]);

    const handleImageLoaded = useCallback(async (image: HTMLImageElement, name: string) => {
        setIsLoading(true);
        setFileName(name);
        setImageSrc(image.src);

        try {
            // Generate image array based on current size settings to analyze it
            const tempWidth = Math.max(1, Math.floor(settings.maxSize / settings.density));
            const tempHeight = Math.max(1, Math.floor(settings.maxSize));
            const imageArray = await imageToGrayscaleArray(image, tempWidth, tempHeight);
            
            // Analyze image and get optimal audio settings
            const { newSettings } = await analyzeImageForAudioSettings(imageArray);
            const finalSettings = { ...settings, ...newSettings };
            setSettings(finalSettings); // Update UI with optimized settings

            // Generate audio with the newly optimized settings
            const width = Math.max(1, Math.floor(finalSettings.maxSize / finalSettings.density));
            const durationPerColumn = finalSettings.duration / width;

            const generatedAudio = await generateAudioFromImage(
                imageArray,
                sampleRate,
                durationPerColumn,
                finalSettings.minFreq,
                finalSettings.maxFreq,
                finalSettings.waveShape
            );
            setAudioBuffer(generatedAudio);
        } catch (error) {
            console.error("Failed to process image and generate audio:", error);
            alert("An error occurred while processing the image.");
        } finally {
            setIsLoading(false);
        }
    }, [settings, sampleRate]);

    const handlePlay = useCallback(() => {
        if (!audioBuffer || isPlaying) return;

        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioCtx = audioContextRef.current;
        
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const source = audioCtx.createBufferSource();
        const buffer = audioCtx.createBuffer(1, audioBuffer.length, audioCtx.sampleRate);
        buffer.copyToChannel(audioBuffer, 0);

        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
        setIsPlaying(true);

        source.onended = () => {
            setIsPlaying(false);
            audioSourceRef.current = null;
        };
        audioSourceRef.current = source;
    }, [audioBuffer, isPlaying]);

    const handlePause = useCallback(() => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            // onended callback will set isPlaying to false
        }
    }, []);

    const handleSave = useCallback(() => {
        if (!audioBuffer) return;
        const wavBlob = encodeWAV(audioBuffer, sampleRate);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = fileName ? fileName.split('.').slice(0, -1).join('.') : 'generated_sound';
        a.download = `${baseName}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [audioBuffer, fileName]);

    const handleToggleView = useCallback(() => {
        setViewMode(currentView => {
            if (currentView === 'spectrogram') return 'waveform';
            if (currentView === 'waveform') return 'equation';
            return 'spectrogram';
        });
    }, []);

    useEffect(() => {
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            if (debouncedProcessImageRef.current) {
                clearTimeout(debouncedProcessImageRef.current);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 lg:p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12">
                   <TitleBar />
                </div>
                <div className="lg:col-span-4 space-y-8">
                    <ControlPanel settings={settings} onSettingsChange={handleSettingsChange} disabled={isLoading} />
                </div>
                <div className="lg:col-span-8 space-y-8">
                    <ImageDropzone onImageLoaded={handleImageLoaded} fileName={fileName} disabled={isLoading} />
                    <PlaybackControls
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onSave={handleSave}
                        onToggleView={handleToggleView}
                        isAudioReady={!!audioBuffer}
                        isPlaying={isPlaying}
                        currentView={viewMode}
                    />
                    <div className="bg-gray-800 rounded-lg p-4 shadow-lg min-h-[400px] flex items-center justify-center">
                        {isLoading ? (
                            <Loader />
                        ) : audioBuffer ? (
                           viewMode === 'equation' ? (
                                <EquationView settings={settings} />
                           ) : (
                            <AudioVisualizer 
                                audioBuffer={audioBuffer} 
                                sampleRate={sampleRate} 
                                viewMode={viewMode}
                            />
                           )
                        ) : (
                            <div className="text-center text-gray-500">
                                <p className="text-lg">Your audio visualization will appear here.</p>
                                <p>Start by uploading an image.</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-12 text-center text-gray-600 text-sm mt-4">
                    Made by ZDGSD C.25
                </div>
            </div>
        </div>
    );
};

export default App;
