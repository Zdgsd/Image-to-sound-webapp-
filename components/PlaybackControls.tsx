import React from 'react';
import { IconPlay, IconPause, IconDownload, IconSpectrogram, IconWaveform, IconEquation } from './Icons';
import type { ViewMode } from '../types';

interface PlaybackControlsProps {
    onPlay: () => void;
    onPause: () => void;
    onSave: () => void;
    onToggleView: () => void;
    isAudioReady: boolean;
    isPlaying: boolean;
    currentView: ViewMode;
}

const ControlButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
    className?: string;
    title: string;
}> = ({ onClick, disabled, children, className, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`px-4 py-2 rounded-md flex items-center justify-center space-x-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);


export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
    onPlay,
    onPause,
    onSave,
    onToggleView,
    isAudioReady,
    isPlaying,
    currentView
}) => {
    const getToggleViewIcon = () => {
        if (currentView === 'spectrogram') return <IconWaveform className="w-5 h-5" />;
        if (currentView === 'waveform') return <IconEquation className="w-5 h-5" />;
        return <IconSpectrogram className="w-5 h-5" />;
    };

    const getToggleViewTitle = () => {
        if (currentView === 'spectrogram') return 'Switch to Waveform View';
        if (currentView === 'waveform') return 'Switch to Equation View';
        return 'Switch to Spectrogram View';
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg flex items-center justify-start space-x-4">
            {!isPlaying ? (
                <ControlButton
                    onClick={onPlay}
                    disabled={!isAudioReady || isPlaying}
                    className="bg-green-600 hover:bg-green-500 text-white focus:ring-green-500"
                    title="Play Audio"
                >
                    <IconPlay className="w-5 h-5" />
                    <span>Play</span>
                </ControlButton>
            ) : (
                <ControlButton
                    onClick={onPause}
                    disabled={!isPlaying}
                    className="bg-yellow-500 hover:bg-yellow-400 text-white focus:ring-yellow-500"
                    title="Pause Audio"
                >
                    <IconPause className="w-5 h-5" />
                    <span>Pause</span>
                </ControlButton>
            )}

            <ControlButton
                onClick={onSave}
                disabled={!isAudioReady}
                className="bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500"
                title="Save as .wav"
            >
                <IconDownload className="w-5 h-5" />
                <span>Save</span>
            </ControlButton>

            <ControlButton
                onClick={onToggleView}
                disabled={!isAudioReady}
                className="bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-500"
                title={getToggleViewTitle()}
            >
                {getToggleViewIcon()}
                <span>Toggle View</span>
            </ControlButton>
        </div>
    );
};
