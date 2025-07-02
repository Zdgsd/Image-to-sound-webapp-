import React from 'react';
import type { Settings } from '../types';
import { Slider } from './Slider';

interface ControlPanelProps {
    settings: Settings;
    onSettingsChange: (newSettings: Partial<Settings>) => void;
    disabled: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ settings, onSettingsChange, disabled }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg space-y-6">
            <h2 className="text-xl font-bold text-cyan-400 border-b border-gray-700 pb-2">Settings</h2>
            <Slider
                label="Max Size"
                value={settings.maxSize}
                onChange={(e) => onSettingsChange({ maxSize: +e.target.value })}
                min="64"
                max="1024"
                step="8"
                unit="px"
                disabled={disabled}
            />
            <Slider
                label="Density"
                value={settings.density}
                onChange={(e) => onSettingsChange({ density: +e.target.value })}
                min="0.1"
                max="10"
                step="0.1"
                disabled={disabled}
            />
            <Slider
                label="Duration"
                value={settings.duration}
                onChange={(e) => onSettingsChange({ duration: +e.target.value })}
                min="1"
                max="20"
                step="0.5"
                unit="s"
                disabled={disabled}
            />
            <Slider
                label="Min Frequency"
                value={settings.minFreq}
                onChange={(e) => onSettingsChange({ minFreq: +e.target.value })}
                min="20"
                max="1000"
                step="10"
                unit="Hz"
                disabled={disabled}
            />
            <Slider
                label="Max Frequency"
                value={settings.maxFreq}
                onChange={(e) => onSettingsChange({ maxFreq: +e.target.value })}
                min="1000"
                max="20000"
                step="100"
                unit="Hz"
                disabled={disabled}
            />
             <div>
                <label className="text-gray-300 font-medium block mb-2">Wave Shape</label>
                <select
                    value={settings.waveShape}
                    onChange={(e) => onSettingsChange({ waveShape: e.target.value as Settings['waveShape'] })}
                    disabled={disabled}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <option value="sin">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="triangle">Triangle</option>
                </select>
            </div>
        </div>
    );
};
