import React from 'react';

interface SliderProps {
    label: string;
    value: number;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    min: string;
    max: string;
    step: string;
    unit?: string;
    disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({ label, value, onChange, min, max, step, unit, disabled }) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                <label className="text-gray-300 font-medium">{label}</label>
                <span className="text-sm font-mono bg-gray-700 text-cyan-300 px-2 py-1 rounded">
                    {value.toFixed(label === 'Density' ? 1 : 0)} {unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );
};
